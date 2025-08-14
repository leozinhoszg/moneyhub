# Identidade Visual da Aplicação MoneyHub

Com base na logo fornecida, a identidade visual da aplicação MoneyHub será construída em torno de uma paleta de cores moderna e profissional, tipografia clara e princípios de design que garantam uma experiência de usuário intuitiva e agradável.

## 1. Paleta de Cores

A paleta de cores principal será extraída diretamente da logo, focando nos tons de azul e verde, que transmitem confiança, estabilidade e crescimento. Serão definidos tons complementares para uso em elementos de UI, como botões, fundos e destaques.

### Cores Primárias (da Logo):
- **Azul Escuro (Money):** `#003366` (aproximado, para texto principal, cabeçalhos)
- **Verde Esmeralda (Hub):** `#00CC66` (aproximado, para elementos de destaque, botões de ação, gráficos positivos)

### Cores Secundárias/Complementares:
- **Azul Médio:** `#006699` (para links, ícones, elementos interativos)
- **Verde Claro:** `#66FF99` (para gráficos de crescimento, indicadores positivos)
- **Cinza Neutro:** `#333333` (para texto secundário, bordas, divisores)
- **Cinza Claro:** `#F0F0F0` (para fundos de seções, elementos de UI sutis)
- **Branco:** `#FFFFFF` (para fundos, texto em elementos escuros)
- **Vermelho (para alertas/gastos negativos):** `#CC3300` (para indicar despesas, alertas, erros)
- **Amarelo (para atenção/neutro):** `#FFCC00` (para elementos de atenção, avisos)

## 2. Tipografia

Serão utilizadas fontes sans-serif para garantir legibilidade e um visual moderno. A escolha recairá sobre fontes disponíveis no Google Fonts para facilitar a implementação e garantir consistência.

- **Fonte Principal (Títulos e Destaques):** Uma fonte sans-serif robusta e limpa, como `Montserrat` ou `Poppins`.
- **Fonte Secundária (Corpo de Texto e Elementos Menores):** Uma fonte sans-serif altamente legível, como `Open Sans` ou `Roboto`.

### Exemplos de Uso:
- `h1`, `h2`, `h3`: Montserrat Bold/Semi-Bold
- `p`, `span`, `label`: Open Sans Regular/Light

## 3. Princípios de Design

- **Minimalismo:** Foco na clareza e simplicidade, evitando elementos desnecessários.
- **Hierarquia Visual:** Uso de tamanho, peso e cor para guiar o olhar do usuário e destacar informações importantes.
- **Consistência:** Manter padrões de design em toda a aplicação para uma experiência coesa.
- **Acessibilidade:** Garantir contraste adequado de cores e tamanhos de fonte legíveis.
- **Responsividade:** O design será adaptável a diferentes tamanhos de tela (desktop, tablet, mobile).

## 4. Espaçamento e Grid

Será adotado um sistema de espaçamento baseado em múltiplos de 4px ou 8px para garantir consistência e alinhamento visual. Um sistema de grid flexível será utilizado para o layout responsivo.

## 5. Componentes de UI

Serão definidos componentes reutilizáveis para:
- Botões (primário, secundário, perigo)
- Campos de formulário (input, select, textarea)
- Cards
- Navegação (header, sidebar, footer)
- Gráficos (integração com bibliotecas como Chart.js ou Recharts)
- Ícones (utilizando bibliotecas como Font Awesome ou Heroicons)

## 6. Configuração do Tailwind CSS

O Tailwind CSS será configurado para refletir esta identidade visual, personalizando a paleta de cores, tipografia, espaçamento e outros utilitários. Isso permitirá um desenvolvimento rápido e consistente do frontend.

### Exemplo de `tailwind.config.js` (a ser detalhado na próxima fase):

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#003366',
          light: '#006699',
          dark: '#001A33',
        },
        secondary: {
          DEFAULT: '#00CC66',
          light: '#66FF99',
          dark: '#00994D',
        },
        neutral: {
          dark: '#333333',
          DEFAULT: '#F0F0F0',
          light: '#FFFFFF',
        },
        danger: '#CC3300',
        warning: '#FFCC00',
      },
      fontFamily: {
        heading: ['Montserrat', 'sans-serif'],
        body: ['Open Sans', 'sans-serif'],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
      },
    },
  },
  plugins: [],
}
```

Esta configuração inicial servirá como base para a estilização de todos os componentes da aplicação, garantindo coesão e aderência à identidade visual do MoneyHub.

