/** @type {import('next').NextConfig} */
import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })
// Other configuration settings
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  images: {
    domains: ["aceternity.com", "github.com", "linksolution.com.ar"], // Agrega "github.com" aquí
  },
}

export default nextConfig
