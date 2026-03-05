import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pages, components } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { eq, and, asc } from "drizzle-orm";
import { z } from "zod";

type RouteParams = { params: Promise<{ pageId: string }> };

// Helper — verify the page belongs to the authenticated user
async function getOwnedPage(pageId: string, userId: string) {
    const [page] = await db
        .select()
        .from(pages)
        .where(and(eq(pages.id, pageId), eq(pages.userId, userId)))
        .limit(1);
    return page ?? null;
}

// GET /api/pages/[pageId] — get page with its components
export async function GET(_req: Request, { params }: RouteParams) {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { pageId } = await params;
    const page = await getOwnedPage(pageId, user.id);
    if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const pageComponents = await db
        .select()
        .from(components)
        .where(eq(components.pageId, pageId))
        .orderBy(asc(components.sortOrder));

    return NextResponse.json({ page, components: pageComponents });
}

const updatePageSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    slug: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/).optional(),
    isPublished: z.boolean().optional(),
    themeConfig: z.any().optional(),
});

// PUT /api/pages/[pageId] — update page
export async function PUT(req: Request, { params }: RouteParams) {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { pageId } = await params;
    const page = await getOwnedPage(pageId, user.id);
    if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

    try {
        const body = await req.json();
        const data = updatePageSchema.parse(body);

        // If changing slug, verify uniqueness
        if (data.slug && data.slug !== page.slug) {
            const existing = await db
                .select({ id: pages.id })
                .from(pages)
                .where(eq(pages.slug, data.slug))
                .limit(1);

            if (existing.length > 0) {
                return NextResponse.json({ error: "Slug already taken" }, { status: 400 });
            }
        }

        const [updated] = await db
            .update(pages)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(pages.id, pageId))
            .returning();

        return NextResponse.json({ page: updated });
    } catch {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
}

// DELETE /api/pages/[pageId] — delete page (cascades to components)
export async function DELETE(_req: Request, { params }: RouteParams) {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { pageId } = await params;
    const page = await getOwnedPage(pageId, user.id);
    if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.delete(pages).where(eq(pages.id, pageId));
    return NextResponse.json({ message: "Deleted" });
}
