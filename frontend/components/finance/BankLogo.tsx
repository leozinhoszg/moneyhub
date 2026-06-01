"use client";

import { useEffect, useState } from "react";
import { coresBanco, iniciaisBanco, urlLogotipo } from "@/lib/bankLogos";

type BankLogoProps = {
  /** Valor da coluna `bancos.logotipo` (ex.: "/banks/nubank.svg"). Nulo => fallback. */
  logotipo?: string | null;
  /** Nome do banco — usado em alt/title e para gerar as iniciais do fallback. */
  nome?: string | null;
  /** Codigo COMPE — usado so para escolher a cor de marca no fallback. */
  cod?: string | null;
  /** Lado do componente em pixels. Default 44. */
  size?: number;
  /** true (default) = circulo; false = quadrado arredondado. */
  rounded?: boolean;
  /** true (default) = "tile" de fundo claro atras do logo (legivel no claro e escuro). */
  tile?: boolean;
  className?: string;
};

/**
 * Logo do banco. A escolha do logo vem do banco de dados (coluna `logotipo`):
 * se houver caminho, renderiza o SVG de /public/banks; se nao houver (ou se o
 * arquivo falhar ao carregar), cai num circulo com a cor da marca + iniciais —
 * fallback sempre apresentavel para os ~320 bancos sem arte.
 */
export function BankLogo({
  logotipo,
  nome,
  cod,
  size = 44,
  rounded = true,
  tile = true,
  className = "",
}: BankLogoProps) {
  const src = urlLogotipo(logotipo);
  const [erro, setErro] = useState(false);
  // Reseta o erro se a fonte mudar (ex.: lista reaproveitando o componente).
  useEffect(() => setErro(false), [src]);

  const radius = rounded ? "9999px" : `${Math.round(size * 0.28)}px`;
  const box = { width: size, height: size };
  const rotulo = nome || (cod ? `Banco ${cod}` : "Banco");

  if (!src || erro) {
    const { cor, corTexto } = coresBanco(cod, nome);
    return (
      <span
        role="img"
        aria-label={rotulo}
        title={rotulo}
        className={`inline-flex shrink-0 items-center justify-center font-semibold leading-none ${className}`}
        style={{ ...box, backgroundColor: cor, color: corTexto, borderRadius: radius, fontSize: Math.round(size * 0.36) }}
      >
        {iniciaisBanco(nome, cod)}
      </span>
    );
  }

  if (!tile) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- SVG estatico em /public, com fallback via onError
      <img
        src={src}
        alt={rotulo}
        width={size}
        height={size}
        loading="lazy"
        draggable={false}
        onError={() => setErro(true)}
        className={className}
        style={{ ...box, borderRadius: radius, objectFit: "contain" }}
      />
    );
  }

  return (
    <span
      aria-label={rotulo}
      title={rotulo}
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden bg-white ring-1 ring-black/5 dark:ring-white/10 ${className}`}
      style={{ ...box, borderRadius: radius }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG estatico em /public, com fallback via onError */}
      <img
        src={src}
        alt={rotulo}
        loading="lazy"
        draggable={false}
        onError={() => setErro(true)}
        style={{ width: "72%", height: "72%", objectFit: "contain" }}
      />
    </span>
  );
}

export default BankLogo;
