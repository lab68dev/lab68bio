"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BLOCK_REGISTRY } from "./registry";
import type { CanvasComponent } from "./page";
import { GripVertical, Trash2, ChevronDown, ChevronUp } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  TYPES                                                             */
/* ------------------------------------------------------------------ */

interface PageData {
    id: string;
    title: string;
    slug: string | null;
    isPublished: boolean | null;
}

interface CanvasProps {
    page: PageData | null;
    components: CanvasComponent[];
    onDelete: (id: string) => void;
    onUpdateConfig: (id: string, config: Record<string, unknown>) => void;
    saving: boolean;
    isDraggingFromPalette: boolean;
}

/* ------------------------------------------------------------------ */
/*  SORTABLE BLOCK WRAPPER                                            */
/* ------------------------------------------------------------------ */

function SortableBlock({
    component,
    onDelete,
    onUpdateConfig,
}: {
    component: CanvasComponent;
    onDelete: (id: string) => void;
    onUpdateConfig: (id: string, config: Record<string, unknown>) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const block = BLOCK_REGISTRY[component.type];
    const Preview = block?.Preview;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: component.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="border border-white/10 bg-black/60 mb-3 group">
            {/* TOOLBAR */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                    <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-white/30 hover:text-white/60">
                        <GripVertical className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[9px] tracking-[0.15em] text-white/50 uppercase">
                        {block?.name || component.type}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="p-1 text-white/30 hover:text-white/60 transition-colors"
                        title={expanded ? "Collapse" : "Expand"}
                    >
                        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    <button
                        onClick={() => onDelete(component.id)}
                        className="p-1 text-white/30 hover:text-red-400 transition-colors"
                        title="Delete component"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* PREVIEW */}
            <div className="px-4 py-2">
                {Preview ? (
                    <Preview config={component.config} />
                ) : (
                    <div className="text-white/20 text-[10px] py-4 text-center uppercase tracking-wider">
                        [{component.type}]
                    </div>
                )}
            </div>

            {/* INLINE CONFIG EDITOR (expanded) */}
            {expanded && (
                <div className="px-4 py-3 border-t border-white/10 bg-white/5 space-y-2">
                    <p className="text-[9px] text-white/30 tracking-widest uppercase mb-2">CONFIG</p>
                    {Object.entries(component.config).map(([key, value]) => {
                        // Skip complex arrays/objects — show simple text fields only
                        if (typeof value === "object" && value !== null) return null;
                        return (
                            <div key={key} className="flex items-center gap-3">
                                <label className="text-[9px] text-white/40 uppercase tracking-wider w-24 shrink-0">
                                    {key}
                                </label>
                                <input
                                    value={String(value ?? "")}
                                    onChange={(e) =>
                                        onUpdateConfig(component.id, {
                                            ...component.config,
                                            [key]: e.target.value,
                                        })
                                    }
                                    placeholder={key}
                                    className="flex-1 bg-black/50 border border-white/10 px-2 py-1 text-xs text-white focus:outline-none focus:border-white/30 transition-colors"
                                    style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  EDITOR CANVAS                                                     */
/* ------------------------------------------------------------------ */

export default function EditorCanvas({
    page,
    components,
    onDelete,
    onUpdateConfig,
    saving,
    isDraggingFromPalette,
}: CanvasProps) {
    const { isOver, setNodeRef } = useDroppable({ id: "canvas" });

    return (
        <div className="flex-1 bg-black/40 border-x border-white/10 relative overflow-y-auto overflow-x-hidden flex flex-col">
            {/* TOP BAR */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-black/60 shrink-0">
                <div className="flex items-center gap-3">
                    <h2
                        className="text-xs font-semibold text-white tracking-wider uppercase"
                        style={{ fontFamily: "var(--font-archivo), sans-serif" }}
                    >
                        {page?.title || "Untitled"}
                    </h2>
                    {page?.slug && (
                        <span className="text-[9px] text-white/30 tracking-wider">
                            {page.slug}.bio.lab68
                        </span>
                    )}
                </div>
                {saving && (
                    <span className="text-[9px] text-white/40 tracking-widest uppercase animate-pulse">
                        SAVING...
                    </span>
                )}
            </div>

            {/* CANVAS AREA */}
            <div className="flex-1 flex justify-center p-8" ref={setNodeRef}>
                <div
                    className={`w-full max-w-2xl min-h-96 border border-dashed p-6 transition-colors ${
                        isOver && isDraggingFromPalette
                            ? "border-white/50 bg-white/5"
                            : "border-white/20"
                    }`}
                    style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                >
                    {components.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-64 text-center">
                            <div className="text-white/30 text-xs tracking-widest uppercase mb-4">
                                + DROP COMPONENTS HERE +
                            </div>
                            <p className="text-white/20 text-[10px] max-w-xs">
                                Drag components from the palette to start building your bio and portfolio page.
                            </p>
                        </div>
                    ) : (
                        components.map((comp) => (
                            <SortableBlock
                                key={comp.id}
                                component={comp}
                                onDelete={onDelete}
                                onUpdateConfig={onUpdateConfig}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
