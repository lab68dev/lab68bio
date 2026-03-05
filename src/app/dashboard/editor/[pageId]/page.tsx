"use client";

import { useState, useEffect, useCallback, use } from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    pointerWithin,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import ComponentPalette from "./palette";
import EditorCanvas from "./canvas";
import { BLOCK_REGISTRY } from "./registry";

/* ------------------------------------------------------------------ */
/*  TYPES                                                             */
/* ------------------------------------------------------------------ */

export interface CanvasComponent {
    id: string;
    type: string;
    sortOrder: number;
    config: Record<string, unknown>;
    isVisible: boolean;
}

interface PageData {
    id: string;
    title: string;
    slug: string | null;
    isPublished: boolean | null;
}

/* ------------------------------------------------------------------ */
/*  EDITOR PAGE                                                       */
/* ------------------------------------------------------------------ */

export default function EditorPage({ params }: { params: Promise<{ pageId: string }> }) {
    const { pageId } = use(params);
    const [page, setPage] = useState<PageData | null>(null);
    const [components, setComponents] = useState<CanvasComponent[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isDraggingFromPalette, setIsDraggingFromPalette] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loaded, setLoaded] = useState(false);

    /* ---- LOAD PAGE DATA ------------------------------------------ */

    const loadPage = useCallback(async () => {
        try {
            const res = await fetch(`/api/pages/${pageId}`);
            if (!res.ok) return;
            const json = await res.json();
            setPage(json.page);
            setComponents(
                (json.components || []).map((c: CanvasComponent) => ({
                    id: c.id,
                    type: c.type,
                    sortOrder: c.sortOrder,
                    config: c.config || {},
                    isVisible: c.isVisible ?? true,
                }))
            );
        } finally {
            setLoaded(true);
        }
    }, [pageId]);

    useEffect(() => {
        loadPage();
    }, [loadPage]);

    /* ---- PERSIST COMPONENTS -------------------------------------- */

    const saveComponents = useCallback(
        async (updated: CanvasComponent[]) => {
            setSaving(true);
            try {
                await fetch(`/api/pages/${pageId}/components`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(
                        updated.map((c, i) => ({
                            id: c.id,
                            sortOrder: i,
                            config: c.config,
                            isVisible: c.isVisible,
                        }))
                    ),
                });
            } finally {
                setSaving(false);
            }
        },
        [pageId]
    );

    /* ---- ADD COMPONENT FROM PALETTE ------------------------------ */

    const addComponent = useCallback(
        async (blockType: string) => {
            const block = BLOCK_REGISTRY[blockType];
            if (!block) return;

            const res = await fetch(`/api/pages/${pageId}/components`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: blockType,
                    config: block.defaultConfig,
                    sortOrder: components.length,
                }),
            });
            if (!res.ok) return;
            const json = await res.json();
            setComponents((prev) => [
                ...prev,
                {
                    id: json.component.id,
                    type: json.component.type,
                    sortOrder: json.component.sortOrder,
                    config: json.component.config || block.defaultConfig,
                    isVisible: json.component.isVisible ?? true,
                },
            ]);
        },
        [pageId, components.length]
    );

    /* ---- DELETE COMPONENT ---------------------------------------- */

    const deleteComponent = useCallback(
        async (componentId: string) => {
            await fetch(`/api/pages/${pageId}/components/${componentId}`, {
                method: "DELETE",
            });
            setComponents((prev) => prev.filter((c) => c.id !== componentId));
        },
        [pageId]
    );

    /* ---- UPDATE COMPONENT CONFIG --------------------------------- */

    const updateComponentConfig = useCallback(
        async (componentId: string, config: Record<string, unknown>) => {
            setComponents((prev) =>
                prev.map((c) => (c.id === componentId ? { ...c, config } : c))
            );
            await fetch(`/api/pages/${pageId}/components/${componentId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ config }),
            });
        },
        [pageId]
    );

    /* ---- DRAG HANDLERS ------------------------------------------ */

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
        // Check if this drag started from the palette
        const data = event.active.data.current;
        setIsDraggingFromPalette(!!data?.fromPalette);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        setIsDraggingFromPalette(false);
        const { active, over } = event;

        if (!over) return;

        const data = active.data.current;

        // Dropping from palette onto canvas
        if (data?.fromPalette && (over.id === "canvas" || components.some((c) => c.id === over.id))) {
            addComponent(active.id as string);
            return;
        }

        // Reordering within canvas
        if (!data?.fromPalette) {
            const oldIndex = components.findIndex((c) => c.id === active.id);
            const newIndex = components.findIndex((c) => c.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                const reordered = arrayMove(components, oldIndex, newIndex);
                setComponents(reordered);
                saveComponents(reordered);
            }
        }
    };

    /* ---- RENDER -------------------------------------------------- */

    if (!loaded) {
        return (
            <div className="flex w-full h-[calc(100vh-4rem)] items-center justify-center bg-black">
                <span className="text-white/30 text-xs tracking-widest uppercase">LOADING EDITOR...</span>
            </div>
        );
    }

    return (
        <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            collisionDetection={pointerWithin}
        >
            <div
                className="flex w-full h-[calc(100vh-4rem)] bg-black"
                style={{ fontFamily: "var(--font-ibm-plex), monospace" }}
            >
                <ComponentPalette />

                <SortableContext
                    items={components.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <EditorCanvas
                        page={page}
                        components={components}
                        onDelete={deleteComponent}
                        onUpdateConfig={updateComponentConfig}
                        saving={saving}
                        isDraggingFromPalette={isDraggingFromPalette}
                    />
                </SortableContext>
            </div>

            <DragOverlay>
                {activeId ? (
                    <div className="p-3 bg-white/10 border border-white/20 text-white text-[10px] uppercase tracking-wider shadow-lg backdrop-blur-md">
                        {isDraggingFromPalette
                            ? `${BLOCK_REGISTRY[activeId]?.name || activeId}`
                            : "Moving..."}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
