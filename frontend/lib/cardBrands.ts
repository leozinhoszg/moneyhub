export interface CardBrandInfo {
  label: string;
  gradient: string;
  textColor: string;
}

export const CARD_BRANDS: Record<string, CardBrandInfo> = {
  visa: {
    label: "Visa",
    gradient: "from-blue-800 to-blue-600",
    textColor: "text-white",
  },
  mastercard: {
    label: "Mastercard",
    gradient: "from-red-600 to-orange-500",
    textColor: "text-white",
  },
  elo: {
    label: "Elo",
    gradient: "from-yellow-500 to-yellow-700",
    textColor: "text-black",
  },
  amex: {
    label: "American Express",
    gradient: "from-blue-500 to-blue-700",
    textColor: "text-white",
  },
  hipercard: {
    label: "Hipercard",
    gradient: "from-red-700 to-red-500",
    textColor: "text-white",
  },
  dinersclub: {
    label: "Diners Club",
    gradient: "from-gray-700 to-gray-500",
    textColor: "text-white",
  },
  outro: {
    label: "Outro",
    gradient: "from-slate-700 to-slate-500",
    textColor: "text-white",
  },
};

export const BRAND_OPTIONS = Object.entries(CARD_BRANDS).map(([key, info]) => ({
  value: key,
  label: info.label,
}));

export function getBrandInfo(bandeira: string): CardBrandInfo {
  const key = bandeira.toLowerCase().replace(/\s+/g, "");
  return CARD_BRANDS[key] || CARD_BRANDS.outro;
}

export const CARD_COLORS = [
  "#1e3a5f", "#2d1b69", "#1a1a2e", "#0d3b66", "#3d0c11",
  "#1b4332", "#212529", "#4a1942", "#0b3954", "#6b0f1a",
];
