"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TranslationTest() {
  const { t, language, isLoading } = useTranslation();
  const { language: contextLang } = useLanguage();

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-gray-50 m-4">
      <h3 className="font-bold text-lg mb-2">Translation Test</h3>
      <div className="space-y-2">
        <p><strong>Current Language:</strong> {language}</p>
        <p><strong>Context Language:</strong> {contextLang}</p>
        <p><strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
        <p><strong>Dashboard Title:</strong> {t('dashboard.title')}</p>
        <p><strong>Good Afternoon:</strong> {t('dashboard.goodAfternoon')}</p>
        <p><strong>Finance Summary:</strong> {t('dashboard.financeSummary')}</p>
        <p><strong>Monthly Income:</strong> {t('dashboard.monthlyIncome')}</p>
        <p><strong>Current Balance:</strong> {t('dashboard.currentBalance')}</p>
        <p><strong>Raw Translation Object:</strong> {JSON.stringify(t, null, 2)}</p>
      </div>
    </div>
  );
}