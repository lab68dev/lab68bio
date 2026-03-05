import { Layout, Palette, Mail, User, Link, Image, Briefcase, FileText } from "lucide-react";
import React from "react";

/* ------------------------------------------------------------------ */
/*  TYPES                                                             */
/* ------------------------------------------------------------------ */

export interface ComponentBlock {
    name: string;
    icon: React.ReactNode;
    defaultConfig: Record<string, unknown>;
    Preview: React.ComponentType<{ config: Record<string, unknown> }>;
}

/* ------------------------------------------------------------------ */
/*  SHARED PREVIEW STYLES                                             */
/* ------------------------------------------------------------------ */

const label = "text-[9px] tracking-[0.15em] text-white/30 uppercase mb-1";
const heading = "text-sm font-bold text-white";
const body = "text-[11px] text-white/50 leading-relaxed";
const pill = "text-[9px] px-2 py-0.5 bg-white/10 text-white/50 tracking-wider uppercase";

/* ------------------------------------------------------------------ */
/*  BLOCK REGISTRY                                                    */
/* ------------------------------------------------------------------ */

export const BLOCK_REGISTRY: Record<string, ComponentBlock> = {
    header: {
        name: "Header",
        icon: <Layout className="w-4 h-4" />,
        defaultConfig: { title: "Your Name", subtitle: "Creative Developer" },
        Preview: ({ config }) => (
            <div className="text-center py-4">
                <p className={label}>HEADER</p>
                <h2 className="text-lg font-bold text-white">{String(config.title || "Your Name")}</h2>
                <p className="text-xs text-white/40">{String(config.subtitle || "")}</p>
            </div>
        ),
    },
    hero: {
        name: "Hero Banner",
        icon: <Layout className="w-4 h-4" />,
        defaultConfig: { headline: "Welcome to my portfolio", description: "I build digital experiences.", buttonText: "Get in Touch" },
        Preview: ({ config }) => (
            <div className="py-6 text-center bg-gradient-to-b from-white/5 to-transparent">
                <p className={label}>HERO</p>
                <h2 className={heading}>{String(config.headline || "Welcome")}</h2>
                <p className={`${body} mt-1 max-w-xs mx-auto`}>{String(config.description || "")}</p>
                {Boolean(config.buttonText) && (
                    <span className="inline-block mt-3 text-[10px] px-4 py-1 border border-white/20 text-white/60 uppercase tracking-widest">
                        {String(config.buttonText)}
                    </span>
                )}
            </div>
        ),
    },
    aboutMe: {
        name: "About Me",
        icon: <User className="w-4 h-4" />,
        defaultConfig: { heading: "About Me", bio: "Write something about yourself here..." },
        Preview: ({ config }) => (
            <div className="py-4">
                <p className={label}>ABOUT</p>
                <h3 className={heading}>{String(config.heading || "About Me")}</h3>
                <p className={`${body} mt-1`}>{String(config.bio || "")}</p>
            </div>
        ),
    },
    socialLinks: {
        name: "Social Links",
        icon: <Link className="w-4 h-4" />,
        defaultConfig: {
            links: [
                { platform: "GitHub", url: "https://github.com" },
                { platform: "Twitter", url: "https://twitter.com" },
                { platform: "LinkedIn", url: "https://linkedin.com" },
            ],
        },
        Preview: ({ config }) => {
            const links = Array.isArray(config.links) ? config.links : [];
            return (
                <div className="py-4">
                    <p className={label}>SOCIAL</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {links.map((l: Record<string, unknown>, i: number) => (
                            <span key={i} className={pill}>{String(l.platform || "Link")}</span>
                        ))}
                    </div>
                </div>
            );
        },
    },
    portfolio: {
        name: "Portfolio Grid",
        icon: <Image className="w-4 h-4" />,
        defaultConfig: {
            heading: "Projects",
            items: [
                { title: "Project Alpha", description: "A cool project" },
                { title: "Project Beta", description: "Another cool project" },
            ],
        },
        Preview: ({ config }) => {
            const items = Array.isArray(config.items) ? config.items : [];
            return (
                <div className="py-4">
                    <p className={label}>PORTFOLIO</p>
                    <h3 className={heading}>{String(config.heading || "Projects")}</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {items.slice(0, 4).map((item: Record<string, unknown>, i: number) => (
                            <div key={i} className="bg-white/5 border border-white/10 p-2">
                                <p className="text-[10px] text-white/70 font-semibold">{String(item.title || "")}</p>
                                <p className="text-[9px] text-white/30">{String(item.description || "")}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );
        },
    },
    experience: {
        name: "Experience",
        icon: <Briefcase className="w-4 h-4" />,
        defaultConfig: {
            heading: "Experience",
            items: [
                { role: "Senior Developer", company: "Acme Corp", period: "2022 - Present" },
                { role: "Frontend Dev", company: "Startup Inc", period: "2020 - 2022" },
            ],
        },
        Preview: ({ config }) => {
            const items = Array.isArray(config.items) ? config.items : [];
            return (
                <div className="py-4">
                    <p className={label}>EXPERIENCE</p>
                    <h3 className={heading}>{String(config.heading || "Experience")}</h3>
                    <div className="mt-2 space-y-2">
                        {items.slice(0, 3).map((item: Record<string, unknown>, i: number) => (
                            <div key={i} className="flex justify-between border-b border-white/5 pb-1">
                                <div>
                                    <p className="text-[10px] text-white/70">{String(item.role || "")}</p>
                                    <p className="text-[9px] text-white/30">{String(item.company || "")}</p>
                                </div>
                                <p className="text-[9px] text-white/20">{String(item.period || "")}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );
        },
    },
    skills: {
        name: "Skills",
        icon: <Palette className="w-4 h-4" />,
        defaultConfig: {
            heading: "Skills",
            skills: ["React", "TypeScript", "Node.js", "Tailwind CSS", "PostgreSQL"],
        },
        Preview: ({ config }) => {
            const skills = Array.isArray(config.skills) ? config.skills : [];
            return (
                <div className="py-4">
                    <p className={label}>SKILLS</p>
                    <h3 className={heading}>{String(config.heading || "Skills")}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {skills.map((s: unknown, i: number) => (
                            <span key={i} className={pill}>{String(s)}</span>
                        ))}
                    </div>
                </div>
            );
        },
    },
    contact: {
        name: "Contact Form",
        icon: <Mail className="w-4 h-4" />,
        defaultConfig: { heading: "Get in Touch", email: "you@example.com" },
        Preview: ({ config }) => (
            <div className="py-4">
                <p className={label}>CONTACT</p>
                <h3 className={heading}>{String(config.heading || "Get in Touch")}</h3>
                <p className={`${body} mt-1`}>{String(config.email || "")}</p>
                <div className="mt-2 space-y-1.5">
                    <div className="h-6 bg-white/5 border border-white/10 rounded-none" />
                    <div className="h-12 bg-white/5 border border-white/10 rounded-none" />
                </div>
            </div>
        ),
    },
    resume: {
        name: "Resume / CV",
        icon: <FileText className="w-4 h-4" />,
        defaultConfig: { heading: "Resume", downloadUrl: "", description: "Download my full CV." },
        Preview: ({ config }) => (
            <div className="py-4">
                <p className={label}>RESUME</p>
                <h3 className={heading}>{String(config.heading || "Resume")}</h3>
                <p className={`${body} mt-1`}>{String(config.description || "")}</p>
                <span className="inline-block mt-2 text-[10px] px-3 py-1 border border-white/20 text-white/40 uppercase tracking-widest">
                    DOWNLOAD CV
                </span>
            </div>
        ),
    },
};
