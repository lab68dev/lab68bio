"use client";

import { useDraggable } from "@dnd-kit/core";
import { BLOCK_REGISTRY, ComponentBlock } from "./registry";

function DraggableBlock({ id, block }: { id: string, block: ComponentBlock }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: id,
        data: {
            type: id,
            component: block,
            fromPalette: true,
        }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={style}
            className="p-3 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-grab active:cursor-grabbing flex items-center gap-3 relative z-50 touch-none"
        >
            <div className="w-8 h-8 flex items-center justify-center bg-black/50 text-white/50 border border-white/10">
                {block.icon}
            </div>
            <div className="text-[10px] text-white/70 tracking-wider uppercase" style={{ fontFamily: "var(--font-ibm-plex), monospace" }}>
                {block.name}
            </div>
        </div>
    );
}

export default function ComponentPalette() {
    const blocks = Object.entries(BLOCK_REGISTRY);

    return (
        <div className="w-64 bg-black border-r border-white/10 flex flex-col h-full shrink-0">
            <div className="p-4 border-b border-white/10">
                <h2
                    className="text-white/80 text-xs tracking-[0.2em] uppercase font-semibold"
                    style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
                >
          // COMPONENTS
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {blocks.map(([key, block]: [string, any]) => (
                    <DraggableBlock key={key} id={key} block={block} />
                ))}
            </div>
        </div>
    );
}
