"use client";

import * as React from "react";

/**
 * Ilustração line-art para o painel de login.
 *
 * Estilo: traço fino e contínuo, formas arredondadas, um único acento de cor
 * (verde --color-secondary) sobre fundo neutro — inspirado em ilustrações de
 * onboarding SaaS. Tema financeiro/gastos pessoais: cartão, recibo, moedas,
 * mini-gráfico de tendência e lupa de verificação, organizados numa bandeja.
 *
 * 100% tematizável via classes Tailwind:
 *  - contornos:  claro #2b2f36  /  escuro slate-200
 *  - faces:      claro branco   /  escuro #06283d (navy claro)
 *  - acento:     verde #00cc66 (ambos os temas)
 *  - blobs/bg:   cinza-gelo no claro / branco translúcido no escuro
 *
 * Não usa <text>, gradientes nem sombras complexas — fiel ao estilo de referência.
 */
export default function FinanceAuthIllustration({
  className = "",
  ...props
}: React.SVGProps<SVGSVGElement>) {
  // contornos principais (cascateiam por herança de `stroke`)
  const ink = "stroke-[#2b2f36] dark:stroke-slate-200";
  // contornos finos/secundários (números do cartão, linhas do recibo, etc.)
  const inkFaint = "stroke-[#c4ccd6] dark:stroke-slate-500";
  // faces de objetos
  const face = "fill-white dark:fill-[#06283d]";
  // acento verde
  const green = "fill-[#00cc66]";

  return (
    <svg
      viewBox="0 0 600 600"
      role="img"
      aria-label="Ilustração de finanças pessoais"
      className={className}
      {...props}
    >
      {/* ============ Fundo decorativo (atrás de tudo) ============ */}
      <g stroke="none">
        {/* blob orgânico */}
        <path
          d="M150 150 C120 95 205 70 262 90 C312 60 392 64 434 104 C514 96 542 178 500 216 C536 264 470 326 414 306 C372 346 250 352 198 314 C120 328 92 212 150 150 Z"
          className="fill-[#eef1f5] dark:fill-white/[0.05]"
        />
        {/* sombra de contato sob a bandeja */}
        <ellipse
          cx="300"
          cy="548"
          rx="178"
          ry="13"
          className="fill-[#e6e9ee] dark:fill-black/20"
        />
      </g>

      {/* ============ Detalhes flutuantes sutis ============ */}
      <g
        fill="none"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* arco tracejado */}
        <path
          d="M232 132 Q318 78 410 126"
          strokeDasharray="2 11"
          className={inkFaint}
        />
        {/* sinais de + */}
        <path d="M168 150 v16 M160 158 h16" className={inkFaint} />
        <path d="M452 408 v14 M445 415 h14" className={inkFaint} />
      </g>
      {/* faíscas verdes (4 pontas) */}
      <g stroke="none" className={green}>
        <path d="M470 332 C472 341 475 344 484 346 C475 348 472 351 470 360 C468 351 465 348 456 346 C465 344 468 341 470 332 Z" />
        <path d="M126 296 C128 303 130 305 137 307 C130 309 128 311 126 318 C124 311 122 309 115 307 C122 305 124 303 126 296 Z" />
      </g>

      {/* ============ Borda traseira da bandeja (atrás dos itens) ============ */}
      <path
        d="M150 470 L184 444 H416 L450 470"
        fill="none"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={ink}
      />

      {/* ============ Recibo (atrás do cartão) ============ */}
      <g
        transform="rotate(-6 300 230)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* folha com canto dobrado */}
        <path
          d="M252 150 H336 L354 168 V322 H252 Z"
          className={`${face} ${ink}`}
        />
        <path d="M336 150 V168 H354" fill="none" className={ink} />
        {/* selo verde */}
        <rect
          x="268"
          y="176"
          width="26"
          height="26"
          rx="4"
          className={`${green} ${ink}`}
        />
        {/* linhas de texto */}
        <g strokeWidth={3} className={inkFaint}>
          <path d="M308 182 h32" />
          <path d="M308 196 h26" />
          <path d="M268 224 h70" />
          <path d="M268 242 h70" />
          <path d="M268 260 h54" />
        </g>
      </g>

      {/* ============ Cartão (foco principal) ============ */}
      <g
        transform="rotate(-5 300 380)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect
          x="186"
          y="300"
          width="228"
          height="184"
          rx="18"
          className={`${face} ${ink}`}
        />
        {/* chip verde */}
        <rect
          x="214"
          y="344"
          width="42"
          height="32"
          rx="6"
          className={`${green} ${ink}`}
        />
        <path d="M235 344 v32 M214 360 h42" fill="none" className={ink} />
        {/* ondas contactless */}
        <path d="M276 348 a14 14 0 0 1 0 24" fill="none" className={ink} />
        <path d="M286 342 a22 22 0 0 1 0 36" fill="none" className={ink} />
        {/* número do cartão */}
        <g strokeWidth={6} strokeLinecap="round" className={inkFaint}>
          <path d="M214 412 h34" />
          <path d="M260 412 h34" />
          <path d="M306 412 h34" />
          <path d="M352 412 h26" />
        </g>
        {/* nome + selo verde */}
        <path
          d="M214 444 h70"
          strokeWidth={5}
          strokeLinecap="round"
          className={inkFaint}
        />
        <rect
          x="346"
          y="434"
          width="44"
          height="28"
          rx="8"
          className={`${green} ${ink}`}
        />
      </g>

      {/* ============ Moedas (frente, canto inferior esquerdo) ============ */}
      <g
        transform="rotate(0 122 430)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* paredes laterais da pilha */}
        <path
          d="M78 410 V446 a44 14 0 0 0 88 0 V410"
          className={`${face} ${ink}`}
        />
        <path d="M78 428 a44 14 0 0 0 88 0" fill="none" className={ink} />
        {/* topo da moeda — face verde */}
        <ellipse
          cx="122"
          cy="410"
          rx="44"
          ry="14"
          className={`${green} ${ink}`}
        />
        {/* anel interno (relevo) */}
        <ellipse cx="122" cy="410" rx="26" ry="8" fill="none" className={ink} />
      </g>

      {/* ============ Parede frontal da bandeja (cobre a base dos itens) ============ */}
      <g
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M150 470 H450 V536 Q450 550 436 550 H164 Q150 550 150 536 Z"
          className={`${face} ${ink}`}
        />
        {/* alça frontal */}
        <rect
          x="262"
          y="500"
          width="76"
          height="18"
          rx="9"
          fill="none"
          className={ink}
        />
      </g>

      {/* ============ Mini-card de tendência (flutuando, sup. esquerdo) ============ */}
      <g
        transform="rotate(-7 124 224)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect
          x="66"
          y="180"
          width="120"
          height="92"
          rx="12"
          className={`${face} ${ink}`}
        />
        {/* linha de crescimento verde */}
        <path
          d="M82 248 L106 226 L128 236 L162 200"
          fill="none"
          strokeWidth={4}
          className="stroke-[#00cc66]"
        />
        {/* seta no fim */}
        <path
          d="M150 200 H162 V212"
          fill="none"
          strokeWidth={4}
          className="stroke-[#00cc66]"
        />
        {/* pontos */}
        <g className={green} stroke="none">
          <circle cx="82" cy="248" r="3.5" />
          <circle cx="106" cy="226" r="3.5" />
          <circle cx="128" cy="236" r="3.5" />
        </g>
      </g>

      {/* ============ Lupa com check (flutuando, sup. direito) ============ */}
      <g
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* cabo */}
        <path
          d="M500 276 L526 302"
          strokeWidth={8}
          className={ink}
        />
        <circle cx="470" cy="244" r="46" className={`${face} ${ink}`} />
        {/* check verde */}
        <path
          d="M450 246 l13 14 l24 -28"
          fill="none"
          strokeWidth={6}
          className="stroke-[#00cc66]"
        />
      </g>
    </svg>
  );
}
