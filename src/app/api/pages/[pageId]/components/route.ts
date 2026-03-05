import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pages, components } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { eq, and, asc } from "drizzle-orm";
import { z } from "zod";

type RouteParams = { params: Promise<{ pageId: string }> };

// Verify page ownership
async function verifyOwnership(pageId: string, userId: string) {
    const [page] = await db
        .select({ id: pages.id })
        .from(pages)
        .where(and(eq(pages.id, pageId), eq(pages.userId, userId)))
        .limit(1);
    return !!page;
}

const addComponentSchema = z.object({
    type: z.string().min(1).max(50),
    config: z.any().default({}),
    sortOrder: z.number().int().optional(),
});

// GET /api/pages/[pageId]/components — list components for a page
export async function GET(_req: Request, { params }: RouteParams) {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { pageId } = await params;
    if (!(await verifyOwnership(pageId, user.id))) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const list = await db
        .select()
        .from(components)
        .where(eq(components.pageId, pageId))
        .orderBy(asc(components.sortOrder));

    return NextResponse.json({ components: list });
}

// POST /api/pages/[pageId]/components — add a component
export async function POST(req: Request, { params }: RouteParams) {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { pageId } = await params;
    if (!(await verifyOwnership(pageId, user.id))) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    try {
        const body = await req.json();
        const { type, config, sortOrder } = addComponentSchema.parse(body);

        // If no sortOrder provided, append to the end
        let order = sortOrder;
        if (order === undefined) {
            const existing = await db
                .select({ sortOrder: components.sortOrder })
                .from(components)
                .where(eq(components.pageId, pageId))
                .orderBy(asc(components.sortOrder));
            order = existing.length > 0 ? existing[existing.length - 1].sortOrder + 1 : 0;
        }

        const [created] = await db
            .insert(components)
            .values({
                pageId,
                type,
                config,
                sortOrder: order,
            })
            .returning();

        return NextResponse.json({ component: created }, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
}

// PUT /api/pages/[pageId]/components — bulk reorder / update components
const bulkUpdateSchema = z.array(
    z.object({
        id: z.string().uuid(),
        sortOrder: z.number().int().optional(),
        config: z.any().optional(),
        isVisible: z.boolean().optional(),
    })
);

export async function PUT(req: Request, { params }: RouteParams) {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { pageId } = await params;
    if (!(await verifyOwnership(pageId, user.id))) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    try {
        const body = await req.json();
        const updates = bulkUpdateSchema.parse(body);

        for (const update of updates) {
            const setData: Record<string, unknown> = { updatedAt: new Date() };
            if (update.sortOrder !== undefined) setData.sortOrder = update.sortOrder;
            if (update.config !== undefined) setData.config = update.config;
            if (update.isVisible !== undefined) setData.isVisible = update.isVisible;

            await db
                .update(components)
                .set(setData)
                .where(
                    and(
                        eq(components.id, update.id),
                        eq(components.pageId, pageId)
                    )
                );
        }

        // Return updated list
        const list = await db
            .select()
            .from(components)
            .where(eq(components.pageId, pageId))
            .orderBy(asc(components.sortOrder));

        return NextResponse.json({ components: list });
    } catch {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
}
