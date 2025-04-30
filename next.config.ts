// next.config.ts
import type { NextConfig } from "next";

const nextConfig = {
  images: {
    domains: [
      process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("https://", "") || "",
    ],
  },
};

export default nextConfig;
