/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#003366",
          light: "#006699",
          dark: "#001A33",
        },
        secondary: {
          DEFAULT: "#00CC66",
          light: "#66FF99",
          dark: "#00994D",
        },
        neutral: {
          dark: "#333333",
          DEFAULT: "#F0F0F0",
          light: "#FFFFFF",
        },
        danger: "#CC3300",
        warning: "#FFCC00",
      },
      fontFamily: {
        heading: [
          "var(--font-heading)",
          "Montserrat",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        body: [
          "var(--font-body)",
          "Open Sans",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
        10: "40px",
        12: "48px",
        16: "64px",
        20: "80px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};

