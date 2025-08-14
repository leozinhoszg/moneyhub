/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Permite build mesmo com types faltando em ambientes de dev container
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
