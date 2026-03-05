"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

function TechBrackets({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const bracketStyle = "absolute w-[10px] h-[10px] pointer-events-none";
    const borderColor = "border-white/30";

    return (
        <div className={`relative ${className}`}>
            <span className={`${bracketStyle} top-0 left-0 border-t border-l ${borderColor}`} />
            <span className={`${bracketStyle} top-0 right-0 border-t border-r ${borderColor}`} />
            <span className={`${bracketStyle} bottom-0 left-0 border-b border-l ${borderColor}`} />
            <span className={`${bracketStyle} bottom-0 right-0 border-b border-r ${borderColor}`} />
            {children}
        </div>
    );
}

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Registration failed");
            }

            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-black">
            <div className="w-full max-w-sm space-y-8 px-4">
                <div className="text-center">
                    <h1
                        className="text-3xl font-bold tracking-tight text-white mb-2"
                        style={{ fontFamily: "var(--font-archivo), sans-serif" }}
                    >
                        CREATE ACCOUNT
                    </h1>
                    <p
                        className="text-white/40 text-xs tracking-[0.2em] uppercase"
                        style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                    >
            // CLAIM YOUR USERNAME.BIO.LAB68
                    </p>
                </div>

                <TechBrackets className="p-8 bg-white/5 backdrop-blur-md">
                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] tracking-[0.15em] text-white/50 uppercase mb-2 block" style={{ fontFamily: "var(--font-ibm-plex), monospace" }}>
                                    USERNAME
                                </label>
                                <input
                                    name="username"
                                    required
                                    className="w-full bg-black/50 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                                    style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] tracking-[0.15em] text-white/50 uppercase mb-2 block" style={{ fontFamily: "var(--font-ibm-plex), monospace" }}>
                                    EMAIL
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full bg-black/50 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                                    style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] tracking-[0.15em] text-white/50 uppercase mb-2 block" style={{ fontFamily: "var(--font-ibm-plex), monospace" }}>
                                    PASSWORD
                                </label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    minLength={8}
                                    className="w-full bg-black/50 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                                    style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-xs tracking-wider" style={{ fontFamily: "var(--font-ibm-plex), monospace" }}>
                                [ERR_] {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-none text-[11px] tracking-[0.2em] uppercase h-11 bg-white hover:bg-white/90 text-black"
                            style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                        >
                            {loading ? "CREATING..." : "CREATE ACCOUNT"}
                        </Button>

                        <div className="text-center mt-4">
                            <a href="/login" className="text-[10px] text-white/40 hover:text-white transition-colors" style={{ fontFamily: "var(--font-ibm-plex), monospace" }}>
                                ALREADY HAVE AN ACCOUNT? // SIGN IN
                            </a>
                        </div>
                    </form>
                </TechBrackets>
            </div>
        </div>
    );
}
