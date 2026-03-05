import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
    const user = await getSession();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [sub] = await db
        .select()
        .from(subscriptions)
        .where(
            and(
                eq(subscriptions.userId, user.id),
                eq(subscriptions.status, "active")
            )
        )
        .limit(1);

    if (!sub) {
        return NextResponse.json({
            plan: "free",
            status: "active",
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
        });
    }

    return NextResponse.json({
        plan: sub.plan,
        status: sub.status,
        currentPeriodEnd: sub.currentPeriodEnd,
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
        lemonSqueezyId: sub.lemonSqueezyId,
    });
}
