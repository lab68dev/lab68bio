import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { sessions, users } from "./schema";
import { eq } from "drizzle-orm";

const secretKey = process.env.AUTH_SECRET;
const key = new TextEncoder().encode(secretKey);

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

export async function verifyPassword(
    password: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ["HS256"],
        });
        return payload;
    } catch (error) {
        return null;
    }
}

export async function createSession(userId: string) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Generate JWT token
    const token = await encrypt({ userId, expiresAt });

    // Store session in database
    await db.insert(sessions).values({
        userId,
        token,
        expiresAt,
    });

    // Set HTTP-only cookie
    (await cookies()).set("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: expiresAt,
        sameSite: "lax",
        path: "/",
    });
}

export async function getSession() {
    const sessionToken = (await cookies()).get("session")?.value;
    if (!sessionToken) return null;

    const parsed = await decrypt(sessionToken);
    if (!parsed || !parsed.userId) return null;

    // Verify token exists and is valid in DB
    const [session] = await db
        .select({
            session: sessions,
            user: {
                id: users.id,
                username: users.username,
                email: users.email,
                displayName: users.displayName,
                avatarUrl: users.avatarUrl,
            },
        })
        .from(sessions)
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(eq(sessions.token, sessionToken))
        .limit(1);

    if (!session || new Date() > session.session.expiresAt) {
        return null;
    }

    return session.user;
}

export async function destroySession() {
    const sessionToken = (await cookies()).get("session")?.value;
    if (sessionToken) {
        await db.delete(sessions).where(eq(sessions.token, sessionToken));
    }
    (await cookies()).delete("session");
}
