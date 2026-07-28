import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Permissions-Policy",
            value: "camera=(self), geolocation=(self)",
          },
        ],
      },
      {
        source: "/login",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive",
          },
        ],
      },
      ...[
        "/account/:path*",
        "/admin/:path*",
        "/api/:path*",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/verification",
        "/post-ad",
        "/messages/:path*",
        "/my-ads/:path*",
        "/my-listings/:path*",
        "/notifications",
        "/recently-viewed",
        "/saved-searches",
      ].map((source) => ({
        source,
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive",
          },
        ],
      })),
    ];
  },
};

export default nextConfig;
