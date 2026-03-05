import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, pages } from "@/lib/schema";
import { hashPassword, createSession } from "@/lib/auth";
import { eq, or } from "drizzle-orm";
import { z } from "zod";

const registerSchema = z.object({
    username: z.string().min(3).max(40).regex(/^[a-zA-Z0-9_-]+$/),
    email: z.string().email(),
    password: z.string().min(8),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username, email, password } = registerSchema.parse(body);

        // Check if user exists
        const existing = await db
            .select({ id: users.id })
            .from(users)
            .where(or(eq(users.username, username), eq(users.email, email)))
            .limit(1);

        if (existing.length > 0) {
            return NextResponse.json(
                { error: "Username or email already exists" },
                { status: 400 }
            );
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user within a transaction to also create their first page
        const [newUser] = await db
            .insert(users)
            .values({
                username,
                email,
                passwordHash,
                displayName: username,
            })
            .returning({ id: users.id });

        // Create their primary bio page
        await db.insert(pages).values({
            userId: newUser.id,
            title: `${username}'s Portfolio`,
            slug: username,
        });

        // Create session cookie
        await createSession(newUser.id);

        return NextResponse.json(
            { message: "Registration successful" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Invalid input or server error" },
            { status: 400 }
        );
    }
}
