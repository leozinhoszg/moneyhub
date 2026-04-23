"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface CardManagerContextType {
  showCardManager: boolean;
  setShowCardManager: (show: boolean) => void;
  toggleCardManager: () => void;
}

const CardManagerContext = createContext<CardManagerContextType | undefined>(
  undefined
);

export function CardManagerProvider({ children }: { children: ReactNode }) {
  const [showCardManager, setShowCardManager] = useState(false);

  const toggleCardManager = () => {
    setShowCardManager(!showCardManager);
  };

  return (
    <CardManagerContext.Provider
      value={{
        showCardManager,
        setShowCardManager,
        toggleCardManager,
      }}
    >
      {children}
    </CardManagerContext.Provider>
  );
}

export function useCardManager() {
  const context = useContext(CardManagerContext);
  if (context === undefined) {
    throw new Error("useCardManager must be used within a CardManagerProvider");
  }
  return context;
}



