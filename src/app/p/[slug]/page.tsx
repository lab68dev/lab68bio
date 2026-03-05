import { db } from "@/lib/db";
import { pages, components, users } from "@/lib/schema";
import { eq, and, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PortfolioRenderer } from "./renderers";

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

interface Props {
    params: Promise<{ slug: string }>;
}

/* ------------------------------------------------------------------ */
/*  METADATA (OG / SEO)                                                */
/* ------------------------------------------------------------------ */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;

    const [result] = await db
        .select({
            title: pages.title,
            username: users.username,
            displayName: users.displayName,
        })
        .from(pages)
        .innerJoin(users, eq(pages.userId, users.id))
        .where(and(eq(pages.slug, slug), eq(pages.isPublished, true)))
        .limit(1);

    if (!result) return { title: "Page Not Found | bio.lab68" };

    const name = result.displayName || result.username;

    return {
        title: `${result.title} — ${name} | bio.lab68`,
        description: `${name}'s portfolio on bio.lab68`,
        openGraph: {
            title: `${result.title} — ${name}`,
            description: `${name}'s portfolio – built with bio.lab68`,
            type: "profile",
            siteName: "bio.lab68",
        },
        twitter: {
            card: "summary_large_image",
            title: `${result.title} — ${name}`,
            description: `${name}'s portfolio – built with bio.lab68`,
        },
    };
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default async function PortfolioPage({ params }: Props) {
    const { slug } = await params;

    /* ---- fetch page + user ---- */
    const [result] = await db
        .select({
            page: pages,
            user: {
                id: users.id,
                username: users.username,
                displayName: users.displayName,
                avatarUrl: users.avatarUrl,
                bio: users.bio,
            },
        })
        .from(pages)
        .innerJoin(users, eq(pages.userId, users.id))
        .where(and(eq(pages.slug, slug), eq(pages.isPublished, true)))
        .limit(1);

    if (!result) notFound();

    /* ---- fetch visible components ---- */
    const pageComponents = await db
        .select()
        .from(components)
        .where(
            and(
                eq(components.pageId, result.page.id),
                eq(components.isVisible, true)
            )
        )
        .orderBy(asc(components.sortOrder));

    return (
        <PortfolioRenderer
            page={result.page}
            user={result.user}
            components={pageComponents}
        />
    );
}
