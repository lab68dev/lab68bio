export default function PortfolioNotFound() {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            {/* Background texture */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.03)_0%,_transparent_50%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:80px_80px]" />
            </div>

            <div className="relative z-10 text-center px-6">
                <p
                    className="text-[10px] tracking-[0.3em] text-white/20 uppercase mb-6"
                    style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                >
                    {"// ERROR 404"}
                </p>

                <h1
                    className="text-4xl font-bold tracking-tight text-white mb-4"
                    style={{ fontFamily: "var(--font-archivo), sans-serif" }}
                >
                    PAGE NOT FOUND
                </h1>

                <p
                    className="text-sm text-white/35 max-w-sm mx-auto mb-10"
                    style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                >
                    This portfolio doesn&apos;t exist or hasn&apos;t been published yet.
                </p>

                <a
                    href="/"
                    className="inline-block text-[10px] tracking-[0.2em] uppercase px-6 py-2.5 border border-white/15 text-white/50 hover:bg-white hover:text-black transition-all duration-300"
                    style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                >
                    CREATE YOUR OWN →
                </a>
            </div>
        </div>
    );
}
