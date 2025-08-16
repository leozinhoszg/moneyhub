"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageTest() {
  const { language, setLanguage, t, isLoading } = useLanguage();

  const handleLanguageChange = async (newLang: "pt" | "en" | "es" | "it") => {
    try {
      await setLanguage(newLang);
      console.log(`Idioma alterado para: ${newLang}`);
    } catch (error) {
      console.error("Erro ao alterar idioma:", error);
    }
  };

  if (isLoading) {
    return <div>Carregando idioma...</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Teste de Idioma</h3>
      
      <div className="mb-4">
        <p><strong>Idioma atual:</strong> {language}</p>
        <p><strong>Tradução de teste:</strong> {t("common.dashboard")}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => handleLanguageChange("pt")}
          className={`px-3 py-1 rounded ${language === "pt" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Português
        </button>
        <button
          onClick={() => handleLanguageChange("en")}
          className={`px-3 py-1 rounded ${language === "en" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          English
        </button>
        <button
          onClick={() => handleLanguageChange("es")}
          className={`px-3 py-1 rounded ${language === "es" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Español
        </button>
        <button
          onClick={() => handleLanguageChange("it")}
          className={`px-3 py-1 rounded ${language === "it" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Italiano
        </button>
      </div>
    </div>
  );
}
