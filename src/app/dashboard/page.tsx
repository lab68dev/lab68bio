"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  TECH BRACKETS                                                     */
/* ------------------------------------------------------------------ */

function TechBrackets({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const b = "absolute w-[10px] h-[10px] pointer-events-none";
    const c = "border-white/30";
    return (
        <div className={`relative ${className}`}>
            <span className={`${b} top-0 left-0 border-t border-l ${c}`} />
            <span className={`${b} top-0 right-0 border-t border-r ${c}`} />
            <span className={`${b} bottom-0 left-0 border-b border-l ${c}`} />
            <span className={`${b} bottom-0 right-0 border-b border-r ${c}`} />
            {children}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  TYPES                                                             */
/* ------------------------------------------------------------------ */

interface Page {
    id: string;
    title: string;
    slug: string | null;
    isPublished: boolean | null;
    createdAt: string;
    updatedAt: string;
}

/* ------------------------------------------------------------------ */
/*  CREATE PAGE MODAL                                                 */
/* ------------------------------------------------------------------ */

function CreatePageModal({ onClose, onCreated }: { onClose: () => void; onCreated: (p: Page) => void }) {
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setSlug(
            title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "")
        );
    }, [title]);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/pages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, slug }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to create page");
            onCreated(json.page);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
                <TechBrackets className="bg-black border border-white/10 p-8">
                    <h2
                        className="text-lg font-bold text-white mb-6"
                        style={{ fontFamily: "var(--font-archivo), sans-serif" }}
                    >
                        CREATE NEW PAGE
                    </h2>

                    <form onSubmit={handleCreate} className="space-y-5">
                        <div>
                            <label
                                className="text-[10px] tracking-[0.15em] text-white/50 uppercase mb-2 block"
                                style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                            >
                                PAGE TITLE
                            </label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                placeholder="My Portfolio"
                                className="w-full bg-black/50 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                                style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                            />
                        </div>

                        <div>
                            <label
                                className="text-[10px] tracking-[0.15em] text-white/50 uppercase mb-2 block"
                                style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                            >
                                SLUG (YOUR URL)
                            </label>
                            <div className="flex items-center">
                                <input
                                    value={slug}
                                    onChange={(e) =>
                                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
                                    }
                                    required
                                    placeholder="my-portfolio"
                                    className="flex-1 bg-black/50 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                                    style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                                />
                                <span
                                    className="text-white/30 text-[10px] tracking-wider ml-2 whitespace-nowrap"
                                    style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                                >
                                    .bio.lab68
                                </span>
                            </div>
                        </div>

                        {error && (
                            <div
                                className="text-red-500 text-xs tracking-wider"
                                style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                            >
                                [ERR_] {error}
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1 rounded-none text-[10px] tracking-[0.2em] uppercase h-10 bg-white hover:bg-white/90 text-black"
                                style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                            >
                                {loading ? "CREATING..." : "CREATE PAGE"}
                            </Button>
                            <Button
                                type="button"
                                onClick={onClose}
                                className="rounded-none text-[10px] tracking-[0.2em] uppercase h-10 bg-white/5 hover:bg-white/10 text-white/60 border border-white/10"
                                style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                            >
                                CANCEL
                            </Button>
                        </div>
                    </form>
                </TechBrackets>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  DASHBOARD PAGE                                                    */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [plan, setPlan] = useState<string>("free");
    const [showUpgradeToast, setShowUpgradeToast] = useState(false);

    const fetchPages = useCallback(async () => {
        try {
            const res = await fetch("/api/pages");
            if (!res.ok) return;
            const json = await res.json();
            setPages(json.pages);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPages();
        // Fetch subscription plan
        fetch("/api/payments/subscription")
            .then((r) => r.json())
            .then((d) => setPlan(d.plan || "free"))
            .catch(() => {});
    }, [fetchPages]);

    useEffect(() => {
        if (searchParams.get("upgraded") === "true") {
            setShowUpgradeToast(true);
            const t = setTimeout(() => setShowUpgradeToast(false), 5000);
            // Clean the URL param
            router.replace("/dashboard", { scroll: false });
            return () => clearTimeout(t);
        }
    }, [searchParams, router]);

    const isFree = plan === "free";
    const publishedCount = pages.filter((p) => p.isPublished).length;
    const canPublishMore = !isFree || publishedCount < 1;

    async function handleDelete(pageId: string) {
        if (!confirm("Are you sure you want to delete this page?")) return;
        await fetch(`/api/pages/${pageId}`, { method: "DELETE" });
        setPages((prev) => prev.filter((p) => p.id !== pageId));
    }

    async function handleTogglePublish(pageId: string, current: boolean | null) {
        // Block free users from publishing more than 1 page
        if (!current && isFree && publishedCount >= 1) {
            alert("Free plan allows only 1 published page. Upgrade to Pro for unlimited pages.");
            return;
        }
        const res = await fetch(`/api/pages/${pageId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isPublished: !current }),
        });
        if (res.ok) {
            setPages((prev) =>
                prev.map((p) => (p.id === pageId ? { ...p, isPublished: !current } : p))
            );
        }
    }

    return (
        <div
            className="flex w-full h-full p-8 xl:p-12"
            style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
        >
            <div className="w-full max-w-4xl mx-auto space-y-8">
                {/* HEADER */}
                <header className="flex items-end justify-between border-b border-white/10 pb-6">
                    <div>
                        <h1
                            className="text-2xl font-bold tracking-tight text-white mb-2"
                            style={{ fontFamily: "var(--font-archivo), sans-serif" }}
                        >
                            MY PAGES
                        </h1>
                        <p className="text-white/40 text-[10px] tracking-widest uppercase mb-1">
                            {"//"} MANAGE YOUR BIO & PORTFOLIO PAGES
                        </p>
                    </div>
                    <div>
                        <TechBrackets>
                            <Button
                                onClick={() => setShowCreate(true)}
                                className="rounded-none text-[10px] tracking-[0.2em] uppercase px-6 h-9 transition-colors border-none"
                                style={{ background: "rgba(255, 255, 255, 0.9)", color: "#000" }}
                            >
                                + NEW PAGE
                            </Button>
                        </TechBrackets>
                    </div>
                </header>

                {/* UPGRADE SUCCESS TOAST */}
                {showUpgradeToast && (
                    <div className="bg-green-500/10 border border-green-500/30 px-5 py-3 flex items-center justify-between">
                        <span className="text-green-400 text-[10px] tracking-[0.15em] uppercase"
                            style={{ fontFamily: "var(--font-ibm-plex), monospace" }}>
                            ✓ UPGRADE SUCCESSFUL — YOU ARE NOW ON THE {plan.toUpperCase()} PLAN
                        </span>
                        <button onClick={() => setShowUpgradeToast(false)} className="text-green-400/60 hover:text-green-400 text-xs">✕</button>
                    </div>
                )}

                {/* FREE TIER BANNER */}
                {isFree && !loading && (
                    <div className="bg-white/[0.03] border border-white/10 px-5 py-4 flex items-center justify-between">
                        <div>
                            <span className="text-white/50 text-[10px] tracking-[0.15em] uppercase block"
                                style={{ fontFamily: "var(--font-ibm-plex), monospace" }}>
                                FREE PLAN — {publishedCount}/1 PUBLISHED PAGE{publishedCount !== 1 ? "S" : ""}
                            </span>
                            <span className="text-white/30 text-[9px] tracking-wider"
                                style={{ fontFamily: "var(--font-ibm-plex), monospace" }}>
                                Upgrade to Pro for unlimited pages, custom themes & more
                            </span>
                        </div>
                        <Button
                            onClick={() => router.push("/#pricing")}
                            className="rounded-none text-[9px] tracking-[0.2em] uppercase px-4 h-7 bg-white/10 hover:bg-white/20 text-white/70 border border-white/10"
                            style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                        >
                            UPGRADE →
                        </Button>
                    </div>
                )}

                {/* LOADING */}
                {loading && (
                    <div className="text-white/30 text-xs tracking-widest uppercase text-center py-20">
                        LOADING...
                    </div>
                )}

                {/* EMPTY STATE */}
                {!loading && pages.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-white/30 text-xs tracking-widest uppercase mb-4">
                            NO PAGES YET
                        </p>
                        <p className="text-white/20 text-[10px] mb-8">
                            Create your first bio or portfolio page to get started.
                        </p>
                        <Button
                            onClick={() => setShowCreate(true)}
                            className="rounded-none text-[10px] tracking-[0.2em] uppercase px-6 h-9 bg-white/5 hover:bg-white/10 text-white/60 border border-white/10"
                            style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                        >
                            + CREATE YOUR FIRST PAGE
                        </Button>
                    </div>
                )}

                {/* PAGE CARDS */}
                {!loading && pages.length > 0 && (
                    <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pages.map((p) => (
                            <TechBrackets
                                key={p.id}
                                className="bg-white/5 border border-white/10 p-6 flex flex-col justify-between min-h-[180px] group transition-colors hover:bg-white/10"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <button
                                            onClick={() => handleTogglePublish(p.id, p.isPublished)}
                                            className={`text-[9px] tracking-[0.2em] font-bold px-2 py-0.5 uppercase cursor-pointer transition-colors ${
                                                p.isPublished
                                                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                                    : "bg-white/10 text-white/40 hover:bg-white/20"
                                            }`}
                                        >
                                            {p.isPublished ? "PUBLISHED" : "DRAFT"}
                                        </button>
                                    </div>
                                    <h2
                                        className="text-lg font-bold text-white mb-1 mt-4"
                                        style={{ fontFamily: "var(--font-archivo), sans-serif" }}
                                    >
                                        {p.title}
                                    </h2>
                                    <p className="text-white/50 text-[10px] tracking-widest uppercase">
                                        {p.slug}.bio.lab68
                                    </p>
                                </div>

                                <div className="mt-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => router.push(`/dashboard/editor/${p.id}`)}
                                            className="text-[10px] tracking-[0.2em] text-white underline underline-offset-4 decoration-white/30 hover:decoration-white uppercase"
                                        >
                                            {"EDIT PAGE ->"}
                                        </button>
                                        {p.slug && (
                                            <a
                                                href={`/p/${p.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[10px] tracking-[0.2em] text-white/40 hover:text-white uppercase transition-colors"
                                            >
                                                VIEW ↗
                                            </a>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        className="text-[10px] tracking-[0.2em] text-red-400/60 hover:text-red-400 uppercase transition-colors"
                                    >
                                        DELETE
                                    </button>
                                </div>
                            </TechBrackets>
                        ))}
                    </main>
                )}
            </div>

            {/* CREATE MODAL */}
            {showCreate && (
                <CreatePageModal
                    onClose={() => setShowCreate(false)}
                    onCreated={(newPage) => {
                        setPages((prev) => [newPage, ...prev]);
                        setShowCreate(false);
                    }}
                />
            )}
        </div>
    );
}
