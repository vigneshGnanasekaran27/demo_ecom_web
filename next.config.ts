import type { NextConfig } from "next";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  // Proxies browser-initiated /api/v1/* calls through this app's own origin
  // to the Rails backend, instead of the browser calling Render directly.
  // Frontend (Vercel) and backend (Render) are different registrable
  // domains, so the httpOnly auth cookie Rails sets is a third-party cookie
  // from the browser's perspective — modern Chrome/Safari block those by
  // default even with SameSite=None; Secure set correctly (confirmed via
  // the request's own `sec-fetch-storage-access: none` header). Proxying
  // makes the cookie first-party: the browser only ever talks to its own
  // origin, and this rewrite forwards the request (and relays the
  // Set-Cookie response back) server-side, where browser cookie policy
  // doesn't apply. Server Components and proxy.ts already call Rails
  // directly and are unaffected (no browser involved, no policy to work
  // around) — only lib/api/client.ts's browser-side fetch needs to route
  // through this.
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
    ];
  },
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
