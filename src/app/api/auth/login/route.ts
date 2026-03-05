import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { verifyPassword, createSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = loginSchema.parse(body);

        // Find user
        const [user] = await db
            .select({
                id: users.id,
                passwordHash: users.passwordHash,
            })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (!user) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Verify password
        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Create session
        await createSession(user.id);

        return NextResponse.json({ message: "Login successful" }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Invalid input or server error" },
            { status: 400 }
        );
    }
}
