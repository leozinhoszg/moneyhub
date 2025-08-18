"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

export type Language = "pt" | "en" | "es" | "it";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: ReactNode;
}

const translations: Record<Language, any> = {
  pt: {},
  en: {},
  es: {},
  it: {},
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>("pt");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Função para obter tradução aninhada
  const getNestedTranslation = (obj: any, path: string): string => {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : path;
    }, obj);
  };

  // Função de tradução
  const t = (key: string): string => {
    const translation = getNestedTranslation(translations[language], key);
    return typeof translation === "string" ? translation : key;
  };

  // Função para carregar traduções
  const loadTranslations = async (lang: Language) => {
    try {
      console.log(`Carregando traduções para: ${lang}`);
      const timestamp = new Date().getTime();
      const url = `/messages/${lang}.json?v=${timestamp}`;
      console.log(`URL das traduções: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      });
      console.log(`Status da resposta: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        translations[lang] = data;
        console.log(`Traduções carregadas para ${lang}:`, Object.keys(data).length, "chaves");
        console.log(`Exemplo de tradução:`, data.common?.dashboard);
      } else {
        console.error(`Erro ao carregar traduções para ${lang}:`, response.status, response.statusText);
        const errorText = await response.text();
        console.error(`Erro detalhado:`, errorText);
      }
    } catch (error) {
      console.error(`Erro ao carregar traduções para ${lang}:`, error);
    }
  };

  // Função para definir idioma
  const setLanguage = async (lang: Language) => {
    if (lang === language) return;

    console.log(`Alterando idioma de ${language} para ${lang}`);
    setIsLoading(true);

    try {
      // Carregar traduções se ainda não foram carregadas
      if (!translations[lang] || Object.keys(translations[lang]).length === 0) {
        await loadTranslations(lang);
      }

      setLanguageState(lang);

      // Salvar no cookie
      Cookies.set("language", lang, { expires: 365, path: "/" });

      // Atualizar o atributo lang do HTML
      document.documentElement.lang = lang;

      console.log(`Idioma alterado com sucesso para: ${lang}`);
    } catch (error) {
      console.error("Erro ao alterar idioma:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Inicializar idioma
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        console.log("Inicializando LanguageContext...");
        
        // Tentar obter idioma do cookie
        const savedLanguage = Cookies.get("language") as Language;
        const browserLanguage = navigator.language.split("-")[0] as Language;

        console.log(`Idioma salvo no cookie: ${savedLanguage}`);
        console.log(`Idioma do navegador: ${browserLanguage}`);

        let initialLanguage: Language = "pt"; // Padrão

        if (savedLanguage && ["pt", "en", "es", "it"].includes(savedLanguage)) {
          initialLanguage = savedLanguage;
          console.log(`Idioma carregado do cookie: ${savedLanguage}`);
        } else if (["pt", "en", "es", "it"].includes(browserLanguage)) {
          initialLanguage = browserLanguage;
          console.log(`Idioma carregado do navegador: ${browserLanguage}`);
        } else {
          console.log(`Usando idioma padrão: ${initialLanguage}`);
        }

        // Carregar traduções iniciais
        await loadTranslations(initialLanguage);

        setLanguageState(initialLanguage);
        document.documentElement.lang = initialLanguage;
        console.log(`Idioma inicializado: ${initialLanguage}`);
      } catch (error) {
        console.error("Erro ao inicializar idioma:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage deve ser usado dentro de um LanguageProvider");
  }
  return context;
}
