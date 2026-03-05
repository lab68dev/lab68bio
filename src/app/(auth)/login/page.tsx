"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

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

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const { t } = useTranslation();

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Login failed");
            }

            router.push("/dashboard");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : t.common.networkError);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-black">
            <div className="w-full max-w-sm space-y-8 px-4">
                <div className="text-center">
                    <h1
                        className="text-3xl font-bold tracking-tight text-white mb-2 font-archivo"
                    >
                        {t.login.title}
                    </h1>
            <p
                className="text-white/40 text-xs tracking-[0.2em] uppercase font-ibm-plex"
            >
                {/* ACCESS YOUR BIO */}
            </p>
                </div>

                <TechBrackets className="p-8 bg-white/5 backdrop-blur-md">
                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="text-[10px] tracking-[0.15em] text-white/50 uppercase mb-2 block font-ibm-plex">
                                    {t.login.email}
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full bg-black/50 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors font-ibm-plex"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="text-[10px] tracking-[0.15em] text-white/50 uppercase mb-2 block font-ibm-plex">
                                    {t.login.password}
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="w-full bg-black/50 border border-white/10 px-3 py-2 pr-10 text-sm text-white focus:outline-none focus:border-white/30 transition-colors font-ibm-plex"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                                        aria-label={showPassword ? t.common.hidePassword : t.common.showPassword}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-xs tracking-wider font-ibm-plex">
                                [ERR_] {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-none text-[11px] tracking-[0.2em] uppercase h-11 bg-white hover:bg-white/90 text-black font-ibm-plex"
                        >
                            {loading ? t.login.loading : t.login.submit}
                        </Button>

                        <div className="text-center mt-4">
                            <a href="/register" className="text-[10px] text-white/40 hover:text-white transition-colors font-ibm-plex">
                                {t.login.noAccount}
                            </a>
                        </div>
                    </form>
                </TechBrackets>
            </div>
        </div>
    );
}
