import { useLanguage } from "@/contexts/LanguageContext";

export function useTranslation() {
  const { t, language, setLanguage, isLoading } = useLanguage();

  return {
    t,
    language,
    setLanguage,
    isLoading,
  };
}
