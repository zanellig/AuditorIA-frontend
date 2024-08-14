/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  images: {
    domains: ["aceternity.com", "github.com", "linksolution.com.ar"], // Agrega "github.com" aquí
  },
}

export default nextConfig
