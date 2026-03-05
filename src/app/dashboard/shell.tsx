"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

interface User {
    id: string;
    username: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
}

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

export default function DashboardShell({ user, children }: { user: User; children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loggingOut, setLoggingOut] = useState(false);

    const isEditor = pathname.includes("/editor/");

    async function handleLogout() {
        setLoggingOut(true);
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    }

    return (
        <div className="flex flex-col w-full min-h-screen bg-black text-white" style={{ fontFamily: "var(--font-ibm-plex), monospace" }}>
            {/* TOP BAR */}
            <header className="flex items-center justify-between h-14 px-6 border-b border-white/10 shrink-0" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}>
                {/* LEFT */}
                <div className="flex items-center gap-6">
                    <a href="/" className="text-xs font-semibold tracking-[0.15em] uppercase text-white/90" style={{ fontFamily: "var(--font-archivo), sans-serif" }}>
                        lab68bio
                    </a>
                    <span className="text-white/15 text-[10px]">//</span>
                    <a
                        href="/dashboard"
                        className={`text-[10px] tracking-[0.15em] uppercase transition-colors ${pathname === "/dashboard" ? "text-white" : "text-white/40 hover:text-white/70"}`}
                    >
                        My Pages
                    </a>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-5">
                    <TechBrackets>
                        <div className="px-3 py-1" style={{ background: "rgba(255,255,255,0.03)" }}>
                            <span className="text-[9px] tracking-[0.15em] text-white/40 uppercase">
                                {user.displayName || user.username}
                            </span>
                        </div>
                    </TechBrackets>
                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="text-[10px] tracking-[0.15em] uppercase text-white/30 hover:text-white transition-colors"
                    >
                        {loggingOut ? "..." : "LOGOUT"}
                    </button>
                </div>
            </header>

            {/* CONTENT */}
            <main className={`flex-1 ${isEditor ? "" : "overflow-y-auto"}`}>{children}</main>
        </div>
    );
}
