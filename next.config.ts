import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next.js 16 blocks remote images whose hostname resolves to a private/
    // loopback IP by default (SSRF protection) — "localhost" resolves to
    // 127.0.0.1, so the dev-only Active Storage pattern below would be
    // silently blocked without this. Safe to leave on unconditionally: it
    // only permits requests that already match an explicit remotePattern
    // (hostname + port), and production's Cloudinary pattern resolves to a
    // public IP regardless, so this has no effect there.
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      // Product images are served from Cloudinary in production
      // (DECISION-010) — next/image needs the remote host allow-listed.
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      // Local dev fallback when CLOUDINARY_URL isn't configured (DECISION-025)
      // — Active Storage's Disk service serves images from the Rails API host.
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/rails/active_storage/**",
      },
    ],
  },
};

export default nextConfig;
