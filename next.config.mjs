// @ts-check

/** @type {import('next').NextConfig} */
import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })
// Other configuration settings
const nextConfig = {
  output: "standalone",
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    domains: [
      "aceternity.com",
      "github.com",
      "linksolution.com.ar",
      "api.microlink.io",
    ],
  },
}

export default nextConfig
