// Helpers de apresentacao para logos de banco.
//
// A FONTE DA VERDADE de "qual logo" e a coluna `logotipo` da tabela `bancos`
// (vem na API como Bank.logotipo, ex.: "/banks/nubank.svg"). Este arquivo NAO
// decide qual banco tem logo — so cuida do fallback quando `logotipo` e nulo
// (a grande maioria dos ~320 bancos): circulo com a cor da marca + iniciais.

// Cores de marca conhecidas, por codigo COMPE. So usadas no fallback, para o
// circulo de iniciais ficar com a cara do banco. Opcional: banco sem entrada
// aqui usa uma cor deterministica derivada do nome.
const CORES_MARCA: Record<string, { cor: string; corTexto: string }> = {
  "001": { cor: "#FAE128", corTexto: "#003879" }, // Banco do Brasil
  "033": { cor: "#EC0000", corTexto: "#FFFFFF" }, // Santander
  "104": { cor: "#0070AF", corTexto: "#FFFFFF" }, // Caixa
  "237": { cor: "#CC092F", corTexto: "#FFFFFF" }, // Bradesco
  "260": { cor: "#820AD1", corTexto: "#FFFFFF" }, // Nubank
  "323": { cor: "#009EE3", corTexto: "#FFFFFF" }, // Mercado Pago
  "341": { cor: "#EC7000", corTexto: "#FFFFFF" }, // Itau
  "380": { cor: "#21C25E", corTexto: "#FFFFFF" }, // PicPay
  "077": { cor: "#FF7A00", corTexto: "#FFFFFF" }, // Inter
  "336": { cor: "#242424", corTexto: "#FFFFFF" }, // C6 Bank
  "212": { cor: "#00A868", corTexto: "#FFFFFF" }, // Banco Original
  "208": { cor: "#001E62", corTexto: "#FFFFFF" }, // BTG Pactual
};

// Paleta para o fallback deterministico (bancos sem cor de marca cadastrada).
const PALETA = [
  "#2563EB", "#059669", "#D97706", "#DC2626", "#7C3AED",
  "#EA580C", "#0891B2", "#65A30D", "#DB2777", "#4F46E5",
];

const padCod = (cod?: string | null) => (cod ? cod.padStart(3, "0") : "");

/** Iniciais para o fallback: ate 2 letras das palavras significativas do nome. */
export function iniciaisBanco(nome?: string | null, cod?: string | null): string {
  if (!nome) return cod ? padCod(cod).slice(0, 2) : "?";
  const ignorar = new Set(["banco", "s.a", "s.a.", "sa", "do", "da", "de", "e", "-"]);
  const palavras = nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((p) => p && !ignorar.has(p.toLowerCase()));
  if (palavras.length === 0) return nome.trim().charAt(0).toUpperCase() || "?";
  if (palavras.length === 1) return palavras[0].slice(0, 2).toUpperCase();
  return (palavras[0][0] + palavras[1][0]).toUpperCase();
}

/** Cores do circulo de fallback: marca conhecida (por COD) ou deterministica. */
export function coresBanco(cod?: string | null, nome?: string | null): { cor: string; corTexto: string } {
  const marca = CORES_MARCA[padCod(cod)];
  if (marca) return marca;
  const chave = (nome || cod || "?");
  let h = 0;
  for (let i = 0; i < chave.length; i++) h = (h * 31 + chave.charCodeAt(i)) | 0;
  return { cor: PALETA[Math.abs(h) % PALETA.length], corTexto: "#FFFFFF" };
}

/**
 * Normaliza o valor de `logotipo` vindo do banco de dados para uma URL usavel.
 * Aceita "/banks/x.svg", "banks/x.svg", "x.svg" ou uma URL absoluta (http...).
 * Retorna undefined se vazio (=> o componente usa o fallback de iniciais).
 */
export function urlLogotipo(logotipo?: string | null): string | undefined {
  const v = logotipo?.trim();
  if (!v) return undefined;
  if (/^https?:\/\//i.test(v) || v.startsWith("/")) return v;
  if (v.startsWith("banks/")) return `/${v}`;
  return `/banks/${v}`;
}
