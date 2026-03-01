import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow preview tool (127.0.0.1) to access the dev server
  allowedDevOrigins: ["127.0.0.1"],
  // PWA用のヘッダー設定
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          { key: "Content-Type", value: "application/manifest+json" },
        ],
      },
    ];
  },
};

export default nextConfig;
