/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Lint roda via `npm run lint` (gate separado); dívida de lint pré-existente
  // não deve travar o build de produção.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Tree-shake/optimize barrel imports (icons, charts, motion, dnd) para que a
  // compilação do dev e o bundle de produção não puxem libs inteiras.
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "framer-motion",
      "date-fns",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
    ],
  },
  async rewrites() {
    return [
      {
        source: "/messages/:path*",
        destination: "/messages/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/messages/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
