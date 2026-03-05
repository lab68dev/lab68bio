import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pages } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

// GET /api/pages — list all pages for the authenticated user
export async function GET() {
    const user = await getSession();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userPages = await db
        .select({
            id: pages.id,
            title: pages.title,
            slug: pages.slug,
            isPublished: pages.isPublished,
            createdAt: pages.createdAt,
            updatedAt: pages.updatedAt,
        })
        .from(pages)
        .where(eq(pages.userId, user.id))
        .orderBy(desc(pages.createdAt));

    return NextResponse.json({ pages: userPages });
}

const createPageSchema = z.object({
    title: z.string().min(1).max(200),
    slug: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-zA-Z0-9_-]+$/, "Slug must be alphanumeric with dashes/underscores"),
});

// POST /api/pages — create a new page
export async function POST(req: Request) {
    const user = await getSession();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { title, slug } = createPageSchema.parse(body);

        // Check slug uniqueness across all users (slugs are global)
        const existing = await db
            .select({ id: pages.id })
            .from(pages)
            .where(eq(pages.slug, slug))
            .limit(1);

        if (existing.length > 0) {
            return NextResponse.json(
                { error: "This slug is already taken" },
                { status: 400 }
            );
        }

        const [newPage] = await db
            .insert(pages)
            .values({
                userId: user.id,
                title,
                slug,
            })
            .returning();

        return NextResponse.json({ page: newPage }, { status: 201 });
    } catch (error: any) {
        if (error?.name === "ZodError") {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }
        console.error("Create page error:", error);
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}
