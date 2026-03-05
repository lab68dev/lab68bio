import { NextRequest, NextResponse } from "next/server";

/* ------------------------------------------------------------------ */
/*  SUBDOMAIN ROUTING MIDDLEWARE                                       */
/*  Detects {slug}.bio.lab68 subdomains and rewrites to /p/{slug}     */
/* ------------------------------------------------------------------ */

const RESERVED = new Set(["www", "api", "app", "admin", "dashboard", "mail"]);

export function middleware(request: NextRequest) {
    const host = request.headers.get("host") || "";
    const url = request.nextUrl.clone();

    let slug: string | null = null;

    /* ---- Development: {slug}.localhost:3000 ---- */
    const devMatch = host.match(/^([a-z0-9][a-z0-9_-]*)\.localhost/i);
    if (devMatch) slug = devMatch[1].toLowerCase();

    /* ---- Production: {slug}.bio.lab68 ---- */
    if (!slug) {
        const prodMatch = host.match(/^([a-z0-9][a-z0-9_-]*)\.bio\.lab68/i);
        if (prodMatch) slug = prodMatch[1].toLowerCase();
    }

    /* ---- No subdomain or reserved name → pass through ---- */
    if (!slug || RESERVED.has(slug)) {
        return NextResponse.next();
    }

    /* ---- Don't rewrite API / internal / dashboard paths ---- */
    if (
        url.pathname.startsWith("/api") ||
        url.pathname.startsWith("/_next") ||
        url.pathname.startsWith("/dashboard") ||
        url.pathname === "/favicon.ico"
    ) {
        return NextResponse.next();
    }

    /* ---- Rewrite root to portfolio page ---- */
    url.pathname = `/p/${slug}`;
    return NextResponse.rewrite(url);
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
