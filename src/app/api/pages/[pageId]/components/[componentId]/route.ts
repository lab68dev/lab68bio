import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pages, components } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

type RouteParams = { params: Promise<{ pageId: string; componentId: string }> };

// DELETE /api/pages/[pageId]/components/[componentId]
export async function DELETE(_req: Request, { params }: RouteParams) {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { pageId, componentId } = await params;

    // Verify page ownership
    const [page] = await db
        .select({ id: pages.id })
        .from(pages)
        .where(and(eq(pages.id, pageId), eq(pages.userId, user.id)))
        .limit(1);

    if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db
        .delete(components)
        .where(
            and(
                eq(components.id, componentId),
                eq(components.pageId, pageId)
            )
        );

    return NextResponse.json({ message: "Deleted" });
}

// PATCH /api/pages/[pageId]/components/[componentId] — update single component config
export async function PATCH(req: Request, { params }: RouteParams) {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { pageId, componentId } = await params;

    // Verify page ownership
    const [page] = await db
        .select({ id: pages.id })
        .from(pages)
        .where(and(eq(pages.id, pageId), eq(pages.userId, user.id)))
        .limit(1);

    if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

    try {
        const body = await req.json();
        const [updated] = await db
            .update(components)
            .set({ config: body.config, updatedAt: new Date() })
            .where(
                and(
                    eq(components.id, componentId),
                    eq(components.pageId, pageId)
                )
            )
            .returning();

        return NextResponse.json({ component: updated });
    } catch {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
}
