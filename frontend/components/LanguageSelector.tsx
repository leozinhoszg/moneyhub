"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, Globe } from "lucide-react";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

const languages = [
  { code: "pt", name: "Português", flag: "/brazil.png" },
  { code: "en", name: "English", flag: "/united-states.png" },
  { code: "es", name: "Español", flag: "/spain.png" },
  { code: "it", name: "Italiano", flag: "/italy.png" },
] as const;

export default function LanguageSelector() {
  const { language, setLanguage, isLoading } = useLanguage();
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const currentLanguage = languages.find((lang) => lang.code === language);

  const handleLanguageChange = async (e: React.MouseEvent, langCode: Language) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (langCode === language) {
      setIsOpen(false);
      return;
    }

    try {
      setIsOpen(false);
      console.log(`Alterando idioma para: ${langCode}`);
      await setLanguage(langCode);
      console.log(`Idioma alterado para: ${langCode}`);
    } catch (error) {
      console.error("Erro ao alterar idioma:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center animate-pulse">
        <Globe className="w-4 h-4 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 ${
          isOpen
            ? isDark
              ? "bg-slate-700/50"
              : "bg-gray-100"
            : "hover:bg-opacity-50"
        } ${isDark ? "hover:bg-slate-700/50" : "hover:bg-gray-100"}`}
        disabled={isLoading}
        title="Alterar idioma"
      >
        <div className="flex items-center space-x-2">
          <div className="w-8 h-5 relative rounded overflow-hidden shadow-sm border border-gray-200">
            <Image
              src={currentLanguage?.flag || "/brazil.png"}
              alt={`Bandeira ${currentLanguage?.name}`}
              width={32}
              height={20}
              className="object-cover w-full h-full"
            />
          </div>
          <span
            className={`text-sm font-medium hidden sm:block ${
              isDark ? "text-slate-300" : "text-gray-700"
            }`}
          >
            {currentLanguage?.code.toUpperCase()}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          } ${isDark ? "text-slate-300" : "text-gray-600"}`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 top-12 w-48 rounded-xl shadow-2xl border backdrop-blur-xl overflow-hidden transform transition-all duration-300 ease-out z-[9999] ${
            isDark
              ? "bg-slate-800/95 border-slate-700/50"
              : "bg-white/95 border-slate-200/50"
          }`}
          style={{
            boxShadow:
              "0 0 30px rgba(0, 204, 102, 0.3), 0 0 60px rgba(0, 204, 102, 0.1), 0 0 90px rgba(0, 204, 102, 0.05)",
            borderColor: "#00cc66",
            borderWidth: "1px",
            animationName: "dropdownSlide, glowPulse",
            animationDuration: "0.3s, 2s",
            animationTimingFunction: "ease-out, ease-in-out",
            animationFillMode: "forwards, both",
            animationDelay: "0s, 0.3s",
            animationIterationCount: "1, infinite",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={(e) => handleLanguageChange(e, lang.code as Language)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-sm transition-all duration-200 ${
                  language === lang.code
                    ? isDark
                      ? "bg-emerald-600/20 text-emerald-400"
                      : "bg-emerald-50 text-emerald-600"
                    : isDark
                    ? "text-slate-300 hover:text-emerald-400 hover:bg-slate-700/50"
                    : "text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
                }`}
              >
                <div className="w-8 h-5 relative rounded overflow-hidden shadow-sm border border-gray-200">
                  <Image
                    src={lang.flag}
                    alt={`Bandeira ${lang.name}`}
                    width={32}
                    height={20}
                    className="object-cover w-full h-full"
                  />
                </div>
                <span className="font-medium">{lang.name}</span>
                {language === lang.code && (
                  <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}