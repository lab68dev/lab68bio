/* ------------------------------------------------------------------ */
/*  PUBLIC PORTFOLIO BLOCK RENDERERS                                   */
/*  Beautiful, production-quality renderers for every block type.      */
/* ------------------------------------------------------------------ */

import React from "react";

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

interface PageData {
    id: string;
    title: string;
    slug: string | null;
    isPublished: boolean | null;
    themeConfig: unknown;
    userId: string;
    createdAt: Date | null;
    updatedAt: Date | null;
}

interface UserData {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
}

interface ComponentData {
    id: string;
    pageId: string;
    type: string;
    sortOrder: number;
    config: unknown;
    isVisible: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}

interface PortfolioRendererProps {
    page: PageData;
    user: UserData;
    components: ComponentData[];
}

type Cfg = Record<string, unknown>;

/* ------------------------------------------------------------------ */
/*  SHARED DECORATIVE ELEMENTS                                         */
/* ------------------------------------------------------------------ */

function TechBrackets({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const b = "absolute w-2 h-2 pointer-events-none";
    const c = "border-white/20";
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

function SectionLabel({ text }: { text: string }) {
    return (
        <span
            className="text-[9px] tracking-[0.25em] text-white/25 uppercase block mb-4"
            style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
        >
            {"// "}{text}
        </span>
    );
}

/* ------------------------------------------------------------------ */
/*  MAIN RENDERER                                                      */
/* ------------------------------------------------------------------ */

export function PortfolioRenderer({ user, components }: PortfolioRendererProps) {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-white/20">
            {/* ---- Background texture ---- */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.03)_0%,_transparent_50%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:80px_80px]" />
            </div>

            {/* ---- Content ---- */}
            <main className="relative z-10 max-w-2xl mx-auto px-6 sm:px-8 pt-20 pb-16">
                {components.map((comp, index) => (
                    <section
                        key={comp.id}
                        className="mb-16 opacity-0 animate-[portfolioFadeIn_0.6s_ease-out_forwards]"
                        style={{ animationDelay: `${index * 120}ms` }}
                    >
                        {renderBlock(comp.type, (comp.config ?? {}) as Cfg, user)}
                    </section>
                ))}

                {/* ---- Footer ---- */}
                <footer className="mt-24 pt-8 border-t border-white/[0.06] text-center">
                    <p
                        className="text-[9px] tracking-[0.3em] text-white/15 uppercase"
                        style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                    >
                        Built with{" "}
                        <a
                            href="/"
                            className="text-white/30 hover:text-white/60 transition-colors underline underline-offset-2 decoration-white/10"
                        >
                            bio.lab68
                        </a>
                    </p>
                </footer>
            </main>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  BLOCK DISPATCHER                                                   */
/* ------------------------------------------------------------------ */

function renderBlock(type: string, config: Cfg, user: UserData) {
    switch (type) {
        case "header":
            return <HeaderBlock config={config} user={user} />;
        case "hero":
            return <HeroBlock config={config} />;
        case "aboutMe":
            return <AboutMeBlock config={config} />;
        case "socialLinks":
            return <SocialLinksBlock config={config} />;
        case "portfolio":
            return <PortfolioBlock config={config} />;
        case "experience":
            return <ExperienceBlock config={config} />;
        case "skills":
            return <SkillsBlock config={config} />;
        case "contact":
            return <ContactBlock config={config} />;
        case "resume":
            return <ResumeBlock config={config} />;
        default:
            return null;
    }
}

/* ================================================================== */
/*  BLOCK RENDERERS                                                    */
/* ================================================================== */

/* ---- HEADER ---- */
function HeaderBlock({ config, user }: { config: Cfg; user: UserData }) {
    const title = String(config.title || user.displayName || user.username);
    const subtitle = String(config.subtitle || "");

    return (
        <div className="text-center">
            {/* Avatar */}
            {user.avatarUrl && (
                <div className="mb-6 flex justify-center">
                    <TechBrackets className="p-1">
                        <img
                            src={user.avatarUrl}
                            alt={title}
                            className="w-20 h-20 object-cover grayscale hover:grayscale-0 transition-all duration-500"
                        />
                    </TechBrackets>
                </div>
            )}

            <h1
                className="text-3xl sm:text-4xl font-bold tracking-tight text-white"
                style={{ fontFamily: "var(--font-archivo), sans-serif" }}
            >
                {title}
            </h1>

            {subtitle && (
                <p
                    className="mt-3 text-xs tracking-[0.2em] text-white/40 uppercase"
                    style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                >
                    {subtitle}
                </p>
            )}

            {/* Decorative line */}
            <div className="mt-8 flex items-center justify-center gap-3">
                <span className="block w-8 h-px bg-white/10" />
                <span className="block w-1.5 h-1.5 rotate-45 border border-white/20" />
                <span className="block w-8 h-px bg-white/10" />
            </div>
        </div>
    );
}

/* ---- HERO BANNER ---- */
function HeroBlock({ config }: { config: Cfg }) {
    const headline = String(config.headline || "Welcome");
    const description = String(config.description || "");
    const buttonText = config.buttonText ? String(config.buttonText) : null;

    return (
        <TechBrackets className="p-8 sm:p-10 bg-gradient-to-b from-white/[0.04] to-transparent">
            <SectionLabel text="INTRO" />

            <h2
                className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight"
                style={{ fontFamily: "var(--font-archivo), sans-serif" }}
            >
                {headline}
            </h2>

            {description && (
                <p
                    className="mt-4 text-sm text-white/50 leading-relaxed max-w-lg"
                    style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                >
                    {description}
                </p>
            )}

            {buttonText && (
                <a
                    href="#contact"
                    className="inline-block mt-6 text-[10px] tracking-[0.2em] uppercase px-6 py-2.5 border border-white/20 text-white/60 hover:bg-white hover:text-black transition-all duration-300"
                    style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                >
                    {buttonText}
                </a>
            )}
        </TechBrackets>
    );
}

/* ---- ABOUT ME ---- */
function AboutMeBlock({ config }: { config: Cfg }) {
    const heading = String(config.heading || "About Me");
    const bio = String(config.bio || "");

    return (
        <div>
            <SectionLabel text="ABOUT" />

            <h2
                className="text-xl font-bold tracking-tight text-white mb-4"
                style={{ fontFamily: "var(--font-archivo), sans-serif" }}
            >
                {heading}
            </h2>

            <p
                className="text-sm text-white/45 leading-[1.8]"
                style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
            >
                {bio}
            </p>
        </div>
    );
}

/* ---- SOCIAL LINKS ---- */
function SocialLinksBlock({ config }: { config: Cfg }) {
    const links = Array.isArray(config.links) ? config.links : [];

    const platformColors: Record<string, string> = {
        github: "hover:border-white/40 hover:text-white",
        twitter: "hover:border-sky-400/40 hover:text-sky-400",
        x: "hover:border-white/40 hover:text-white",
        linkedin: "hover:border-blue-400/40 hover:text-blue-400",
        instagram: "hover:border-pink-400/40 hover:text-pink-400",
        youtube: "hover:border-red-400/40 hover:text-red-400",
        dribbble: "hover:border-pink-400/40 hover:text-pink-400",
        behance: "hover:border-blue-400/40 hover:text-blue-400",
        figma: "hover:border-purple-400/40 hover:text-purple-400",
    };

    return (
        <div>
            <SectionLabel text="CONNECT" />

            <div className="flex flex-wrap gap-3">
                {links.map((link: Record<string, unknown>, i: number) => {
                    const platform = String(link.platform || "Link");
                    const url = String(link.url || "#");
                    const colorClass =
                        platformColors[platform.toLowerCase()] ||
                        "hover:border-white/40 hover:text-white";

                    return (
                        <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-[10px] tracking-[0.15em] uppercase px-4 py-2 border border-white/10 text-white/40 transition-all duration-300 ${colorClass}`}
                            style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                        >
                            {platform}
                        </a>
                    );
                })}
            </div>
        </div>
    );
}

/* ---- PORTFOLIO GRID ---- */
function PortfolioBlock({ config }: { config: Cfg }) {
    const heading = String(config.heading || "Projects");
    const items = Array.isArray(config.items) ? config.items : [];

    return (
        <div>
            <SectionLabel text="WORK" />

            <h2
                className="text-xl font-bold tracking-tight text-white mb-6"
                style={{ fontFamily: "var(--font-archivo), sans-serif" }}
            >
                {heading}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((item: Record<string, unknown>, i: number) => (
                    <TechBrackets
                        key={i}
                        className="p-5 bg-white/[0.02] border border-white/[0.06] group hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
                    >
                        <h3
                            className="text-sm font-bold text-white/80 group-hover:text-white transition-colors"
                            style={{ fontFamily: "var(--font-archivo), sans-serif" }}
                        >
                            {String(item.title || "")}
                        </h3>
                        <p
                            className="mt-2 text-[11px] text-white/30 leading-relaxed"
                            style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                        >
                            {String(item.description || "")}
                        </p>
                        {Boolean(item.url) && (
                            <a
                                href={String(item.url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-3 text-[9px] tracking-[0.15em] uppercase text-white/25 hover:text-white/60 transition-colors"
                                style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                            >
                                VIEW PROJECT →
                            </a>
                        )}
                    </TechBrackets>
                ))}
            </div>
        </div>
    );
}

/* ---- EXPERIENCE ---- */
function ExperienceBlock({ config }: { config: Cfg }) {
    const heading = String(config.heading || "Experience");
    const items = Array.isArray(config.items) ? config.items : [];

    return (
        <div>
            <SectionLabel text="EXPERIENCE" />

            <h2
                className="text-xl font-bold tracking-tight text-white mb-6"
                style={{ fontFamily: "var(--font-archivo), sans-serif" }}
            >
                {heading}
            </h2>

            <div className="space-y-0">
                {items.map((item: Record<string, unknown>, i: number) => (
                    <div key={i} className="relative pl-6 pb-8 last:pb-0 group">
                        {/* Timeline line */}
                        {i < items.length - 1 && (
                            <span className="absolute left-[3px] top-2 bottom-0 w-px bg-white/[0.06]" />
                        )}
                        {/* Timeline dot */}
                        <span className="absolute left-0 top-1.5 w-[7px] h-[7px] rotate-45 border border-white/20 bg-black group-hover:border-white/40 transition-colors" />

                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                            <div>
                                <h3
                                    className="text-sm font-bold text-white/80"
                                    style={{ fontFamily: "var(--font-archivo), sans-serif" }}
                                >
                                    {String(item.role || "")}
                                </h3>
                                <p
                                    className="text-[11px] text-white/35"
                                    style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                                >
                                    {String(item.company || "")}
                                </p>
                            </div>
                            <p
                                className="text-[10px] tracking-wider text-white/20 whitespace-nowrap"
                                style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                            >
                                {String(item.period || "")}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ---- SKILLS ---- */
function SkillsBlock({ config }: { config: Cfg }) {
    const heading = String(config.heading || "Skills");
    const skills = Array.isArray(config.skills) ? config.skills : [];

    return (
        <div>
            <SectionLabel text="SKILLS" />

            <h2
                className="text-xl font-bold tracking-tight text-white mb-5"
                style={{ fontFamily: "var(--font-archivo), sans-serif" }}
            >
                {heading}
            </h2>

            <div className="flex flex-wrap gap-2">
                {skills.map((skill: unknown, i: number) => (
                    <span
                        key={i}
                        className="text-[10px] tracking-[0.12em] uppercase px-3.5 py-1.5 bg-white/[0.04] border border-white/[0.08] text-white/45 hover:bg-white/[0.08] hover:text-white/70 hover:border-white/15 transition-all duration-300 cursor-default"
                        style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                    >
                        {String(skill)}
                    </span>
                ))}
            </div>
        </div>
    );
}

/* ---- CONTACT ---- */
function ContactBlock({ config }: { config: Cfg }) {
    const heading = String(config.heading || "Get in Touch");
    const email = String(config.email || "");

    return (
        <div id="contact">
            <SectionLabel text="CONTACT" />

            <TechBrackets className="p-8 bg-white/[0.02] border border-white/[0.06]">
                <h2
                    className="text-xl font-bold tracking-tight text-white mb-3"
                    style={{ fontFamily: "var(--font-archivo), sans-serif" }}
                >
                    {heading}
                </h2>

                {email && (
                    <a
                        href={`mailto:${email}`}
                        className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors group"
                        style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                    >
                        <span className="w-1.5 h-1.5 bg-white/30 group-hover:bg-white transition-colors" />
                        {email}
                    </a>
                )}

                <div className="mt-6 pt-5 border-t border-white/[0.06]">
                    <p
                        className="text-[10px] text-white/20 tracking-wider"
                        style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                    >
                        Feel free to reach out for collaborations, opportunities, or just to say hello.
                    </p>
                </div>
            </TechBrackets>
        </div>
    );
}

/* ---- RESUME / CV ---- */
function ResumeBlock({ config }: { config: Cfg }) {
    const heading = String(config.heading || "Resume");
    const description = String(config.description || "");
    const downloadUrl = config.downloadUrl ? String(config.downloadUrl) : null;

    return (
        <div>
            <SectionLabel text="RESUME" />

            <h2
                className="text-xl font-bold tracking-tight text-white mb-3"
                style={{ fontFamily: "var(--font-archivo), sans-serif" }}
            >
                {heading}
            </h2>

            {description && (
                <p
                    className="text-sm text-white/40 leading-relaxed mb-5"
                    style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                >
                    {description}
                </p>
            )}

            {downloadUrl ? (
                <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-[10px] tracking-[0.2em] uppercase px-6 py-2.5 border border-white/15 text-white/50 hover:bg-white hover:text-black transition-all duration-300"
                    style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                >
                    DOWNLOAD CV ↓
                </a>
            ) : (
                <span
                    className="inline-block text-[10px] tracking-[0.2em] uppercase px-6 py-2.5 border border-white/10 text-white/20 cursor-default"
                    style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                >
                    CV COMING SOON
                </span>
            )}
        </div>
    );
}
