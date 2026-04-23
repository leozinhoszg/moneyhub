"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
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

// Componente para item sortable
function SortableItem({
  card,
  isDark,
  cardVisibility,
  toggleCardVisibility,
}: {
  card: { key: string; label: string; icon: string };
  isDark: boolean;
  cardVisibility: any;
  toggleCardVisibility: (key: string) => void;
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sortable-item flex items-center justify-between p-3 sm:p-4 rounded-lg border transition-all duration-200 ${
        isDark
          ? "bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50"
          : "bg-slate-50 border-slate-200 hover:bg-slate-100"
      } ${isDragging ? "shadow-lg scale-105 z-50" : ""}`}
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {/* Drag handle - Ajustado para alinhar com o ícone */}
        <div
          {...attributes}
          {...listeners}
          className={`drag-handle cursor-grab active:cursor-grabbing rounded-lg transition-colors flex-shrink-0 flex items-center justify-center ${
            isDark
              ? "text-slate-400 hover:text-slate-300 hover:bg-slate-600/50"
              : "text-slate-500 hover:text-slate-600 hover:bg-slate-200"
          }`}
          style={{
            width: "24px",
            height: "24px",
          }}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 15h18v-2H3v2zm0 4h18v-2H3v2zm0-8h18V9H3v2zm0-6v2h18V5H3z" />
          </svg>
        </div>

        {/* Ícone do card - Ajustado para alinhar com o drag handle */}
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xs shadow-sm flex-shrink-0">
          {card.icon}
        </div>

        {/* Texto do card */}
        <div className="min-w-0 flex-1">
          <span
            className={`font-medium text-xs sm:text-sm truncate block ${
              isDark ? "text-slate-200" : "text-slate-800"
            }`}
            style={{
              fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
            }}
          >
            {card.label}
          </span>
          <p
            className={`text-xs ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {cardVisibility[card.key as keyof typeof cardVisibility]
              ? "Visível"
              : "Oculto"}
          </p>
        </div>
      </div>
      {/* Toggle switch - Design moderno para mobile */}
      <button
        onClick={() => toggleCardVisibility(card.key)}
        className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 flex-shrink-0 ${
          cardVisibility[card.key as keyof typeof cardVisibility]
            ? "bg-emerald-500 shadow-lg shadow-emerald-500/30"
            : isDark
            ? "bg-slate-600"
            : "bg-slate-300"
        }`}
        style={{
          boxShadow: cardVisibility[card.key as keyof typeof cardVisibility]
            ? "0 0 0 1px rgba(0, 204, 102, 0.2), 0 2px 4px rgba(0, 204, 102, 0.1)"
            : "0 0 0 1px rgba(0, 0, 0, 0.1)",
        }}
      >
        <span
          className={`inline-block h-4 w-4 sm:h-5 sm:w-5 transform rounded-full bg-white transition-all duration-200 shadow-md border ${
            cardVisibility[card.key as keyof typeof cardVisibility]
              ? "translate-x-4 sm:translate-x-5 border-emerald-200"
              : "translate-x-0.5 border-slate-200"
          }`}
          style={{
            boxShadow: cardVisibility[card.key as keyof typeof cardVisibility]
              ? "0 2px 4px rgba(0, 204, 102, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.8)"
              : "0 1px 2px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.8)",
          }}
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
  const { isDark } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  // Configuração dos sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Função para lidar com o fim do drag
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = cardOrder.findIndex((card) => card.key === active.id);
      const newIndex = cardOrder.findIndex((card) => card.key === over.id);
      const newOrder = arrayMove(cardOrder, oldIndex, newIndex);
      onCardOrderChange(newOrder);
    }
  };

  // Controlar animações, tecla ESC e scroll do body
  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);

      // Prevenir scroll do body
      document.body.style.overflow = "hidden";

      // Adicionar listener para ESC
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleEscape);

      return () => {
        document.removeEventListener("keydown", handleEscape);
        // Restaurar scroll do body
        document.body.style.overflow = "unset";
      };
    } else {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        // Garantir que o scroll seja restaurado
        document.body.style.overflow = "unset";
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  // Não renderizar se não estiver visível e não estiver animando
  if (!isVisible && !isAnimating) return null;

  return (
    <div
      className={`dashboard-card-manager-modal fixed inset-0 z-[9999] transition-all duration-300 ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        background: isDark
          ? "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)"
          : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)",
      }}
    >
      {/* Background decorativo */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className={`absolute -top-10 sm:-top-20 -right-10 sm:-right-20 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-br from-emerald-500/20 to-green-400/10 rounded-full blur-xl transition-all duration-[4000ms] ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
          style={{
            animation: isVisible ? "float 12s ease-in-out infinite" : "none",
          }}
        />
        <div
          className={`absolute -bottom-16 sm:-bottom-32 -left-16 sm:-left-32 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-tr from-blue-600/20 to-indigo-500/10 rounded-full blur-xl transition-all duration-[4000ms] delay-1000 ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
          style={{
            animation: isVisible
              ? "float 10s ease-in-out infinite reverse"
              : "none",
          }}
        />
      </div>

      {/* Container principal da página */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header fixo no topo */}
        <div
          className={`flex-shrink-0 border-b backdrop-blur-xl transition-all duration-300 ${
            isDark
              ? "bg-slate-800/95 border-slate-700/50 text-white"
              : "bg-white/95 border-slate-200/50 text-gray-800"
          }`}
          style={{
            boxShadow:
              "0 4px 20px rgba(0, 204, 102, 0.15), 0 8px 40px rgba(0, 204, 102, 0.08), 0 0 0 1px rgba(0, 204, 102, 0.1)",
          }}
        >
          <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                {/* Botão voltar - Menor no mobile */}
                <button
                  onClick={onClose}
                  className={`p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0 ${
                    isDark
                      ? "hover:bg-slate-700 text-slate-400 hover:text-slate-300"
                      : "hover:bg-slate-100 text-slate-500 hover:text-slate-600"
                  }`}
                  aria-label="Voltar ao dashboard"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  {/* Ícone menor no mobile */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1
                      className={`text-base sm:text-xl font-bold truncate ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-primary, Montserrat, sans-serif)",
                      }}
                    >
                      Gerenciar Cards
                    </h1>
                    <p
                      className={`text-xs sm:text-sm truncate ${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                    >
                      Organize os cards
                    </p>
                  </div>
                </div>
              </div>

              {/* Botão de reset - Menor no mobile */}
              <button
                onClick={onResetSettings}
                className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 flex-shrink-0 ${
                  isDark
                    ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                } hover:scale-[1.02] active:scale-[0.98]`}
                style={{
                  fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                }}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span className="hidden sm:inline">Restaurar padrão</span>
                  <span className="sm:hidden">Reset</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo principal - Otimizado para mobile */}
        <div className="flex-1 overflow-hidden">
          <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-4 h-full">
            {/* Card container com glow verde */}
            <div
              className={`rounded-2xl shadow-2xl border backdrop-blur-xl overflow-hidden h-full flex flex-col ${
                isDark
                  ? "bg-slate-800/95 border-slate-700/50"
                  : "bg-white/95 border-slate-200/50"
              }`}
              style={{
                boxShadow:
                  "0 0 30px rgba(0, 204, 102, 0.3), 0 0 60px rgba(0, 204, 102, 0.1), 0 0 90px rgba(0, 204, 102, 0.05)",
                borderColor: "#00cc66",
                borderWidth: "1px",
                animationName: isVisible ? "dropdownSlide, glowPulse" : "none",
                animationDuration: "0.3s, 2s",
                animationTimingFunction: "ease-out, ease-in-out",
                animationFillMode: "forwards, both",
                animationDelay: "0s, 0.3s",
                animationIterationCount: "1, infinite",
                maxHeight: "calc(100vh - 12rem)", // Altura máxima reduzida
                minHeight: "300px", // Altura mínima reduzida
              }}
            >
              {/* Content Header - Fixo no topo */}
              <div className="flex-shrink-0 p-3 sm:p-4 pb-2 sm:pb-3">
                <div className="mb-3 sm:mb-4">
                  <h2
                    className={`text-base sm:text-lg font-semibold mb-2 ${
                      isDark ? "text-slate-200" : "text-slate-800"
                    }`}
                    style={{
                      fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                    }}
                  >
                    Cards Disponíveis ({cardOrder.length})
                  </h2>
                  <p
                    className={`text-xs sm:text-sm ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                    style={{
                      fontFamily:
                        "var(--font-secondary, Open Sans, sans-serif)",
                    }}
                  >
                    Arraste para reordenar e use os botões para mostrar/ocultar
                  </p>
                </div>
              </div>

              {/* Content - Lista de cards com scroll interno */}
              <div
                className="flex-1 overflow-y-auto px-3 sm:px-4 pb-3 sm:pb-4"
                style={{
                  maxHeight: "calc(100vh - 16rem)", // Altura máxima reduzida para scroll
                  minHeight: "150px", // Altura mínima reduzida para área de scroll
                }}
              >
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={cardOrder.map((card) => card.key)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2 sm:space-y-3">
                      {cardOrder.map((card) => (
                        <SortableItem
                          key={card.key}
                          card={card}
                          isDark={isDark}
                          cardVisibility={cardVisibility}
                          toggleCardVisibility={onCardVisibilityChange}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
