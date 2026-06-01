"use client";

import { useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, LayoutGrid, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { fontHeading, fontBody, fontMono } from "@/lib/motion";
import { Kicker, chipTone, glassSurface } from "@/components/finance/glass";
import { CARD_META, FALLBACK_CARD_ICON } from "@/lib/dashboardCards";

// Item arrastável (linha de vidro no estilo do dashboard)
function SortableItem({
  card,
  visible,
  onToggle,
}: {
  card: { key: string; label: string; icon: string };
  visible: boolean;
  onToggle: (key: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  // Mesmo ícone/tom usados no SectionHeader do dashboard (fonte única)
  const Icon = CARD_META[card.key]?.icon ?? FALLBACK_CARD_ICON;
  const tone = CARD_META[card.key]?.tone ?? "secondary";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2.5 rounded-2xl p-2.5 transition-colors",
        glassSurface,
        isDragging
          ? "shadow-[0_16px_36px_-14px_rgba(0,51,102,0.4)] ring-[color:var(--color-secondary)]/60"
          : "hover:bg-white/70 dark:hover:bg-slate-900/60"
      )}
    >
      {/* Handle de arraste */}
      <div
        {...attributes}
        {...listeners}
        aria-label="Arrastar para reordenar"
        className="flex h-8 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-200/70 hover:text-gray-600 active:cursor-grabbing dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
      >
        <GripVertical size={18} strokeWidth={2} />
      </div>

      {/* Ícone (mesmo lucide da seção do dashboard) */}
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          chipTone[tone]
        )}
      >
        <Icon size={18} strokeWidth={2} />
      </span>

      {/* Texto */}
      <div className="min-w-0 flex-1">
        <span
          className="block text-[14px] font-medium leading-tight text-gray-800 dark:text-slate-100"
          style={{ fontFamily: fontBody }}
        >
          {card.label}
        </span>
        <span
          className={cn(
            "mt-0.5 block text-[10px] uppercase tracking-[0.14em]",
            visible
              ? "text-[color:var(--color-secondary-dark)] dark:text-[color:var(--color-secondary-light)]"
              : "text-gray-400 dark:text-slate-500"
          )}
          style={{ fontFamily: fontMono }}
        >
          {visible ? "Visível" : "Oculto"}
        </span>
      </div>

      {/* Toggle */}
      <button
        type="button"
        role="switch"
        aria-checked={visible}
        aria-label={visible ? "Ocultar card" : "Mostrar card"}
        onClick={() => onToggle(card.key)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-secondary)]/40 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900",
          visible
            ? "bg-[color:var(--color-secondary)] shadow-[0_4px_12px_-4px_rgba(0,204,102,0.7)]"
            : "bg-gray-300 dark:bg-slate-700"
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200",
            visible ? "translate-x-[22px]" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}

interface DashboardCardManagerProps {
  isVisible: boolean;
  onClose: () => void;
  cardOrder: Array<{ key: string; label: string; icon: string }>;
  cardVisibility: Record<string, boolean>;
  onCardOrderChange: (
    newOrder: Array<{ key: string; label: string; icon: string }>
  ) => void;
  onCardVisibilityChange: (key: string) => void;
  onResetSettings: () => void;
}

export default function DashboardCardManager({
  isVisible,
  onClose,
  cardOrder,
  cardVisibility,
  onCardOrderChange,
  onCardVisibilityChange,
  onResetSettings,
}: DashboardCardManagerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = cardOrder.findIndex((card) => card.key === active.id);
      const newIndex = cardOrder.findIndex((card) => card.key === over.id);
      onCardOrderChange(arrayMove(cardOrder, oldIndex, newIndex));
    }
  };

  // ESC para fechar + travar scroll do body enquanto aberto
  useEffect(() => {
    if (!isVisible) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isVisible, onClose]);

  return (
    <>
      {/* Backdrop transparente: fecha ao clicar fora, sem embaçar/escurecer
          o dashboard — para o usuário ver as alterações ao vivo. */}
      <div
        className={cn(
          "fixed inset-0 z-[59]",
          isVisible ? "pointer-events-auto" : "pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden
      />

      {/* Painel deslizante de vidro */}
      <div
        className={cn(
          "fixed right-0 top-0 z-[60] flex h-full w-[88%] max-w-md flex-col border-l border-gray-200/70 bg-gray-50 shadow-[0_20px_60px_-20px_rgba(0,51,102,0.4)] transition-transform duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-950",
          isVisible ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-label="Gerenciar cards do dashboard"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between gap-3 border-b border-gray-200/60 px-5 py-4 dark:border-slate-800"
          style={{ paddingTop: "calc(1rem + env(safe-area-inset-top))" }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[color:var(--color-secondary)]/12 text-[color:var(--color-secondary-dark)] dark:bg-[color:var(--color-secondary)]/15 dark:text-[color:var(--color-secondary-light)]">
              <LayoutGrid size={18} strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <h2
                className="text-[16px] font-semibold text-[color:var(--color-primary)] dark:text-slate-100"
                style={{ fontFamily: fontHeading }}
              >
                Gerenciar cards
              </h2>
              <p
                className="truncate text-[12px] text-gray-500 dark:text-slate-400"
                style={{ fontFamily: fontBody }}
              >
                Arraste para reordenar · mostrar/ocultar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <Kicker className="mb-3 px-1">{cardOrder.length} cards</Kicker>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={cardOrder.map((card) => card.key)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2.5">
                {cardOrder.map((card) => (
                  <SortableItem
                    key={card.key}
                    card={card}
                    visible={!!cardVisibility[card.key]}
                    onToggle={onCardVisibilityChange}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Rodapé: restaurar padrão */}
        <div
          className="border-t border-gray-200/60 p-4 dark:border-slate-800"
          style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
        >
          <button
            onClick={onResetSettings}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200/70 bg-white/70 py-2.5 text-[13px] font-semibold text-[color:var(--color-primary)] transition-colors hover:bg-white dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-800"
            style={{ fontFamily: fontBody }}
          >
            <RotateCcw size={15} strokeWidth={2.2} />
            Restaurar padrão
          </button>
        </div>
      </div>
    </>
  );
}
