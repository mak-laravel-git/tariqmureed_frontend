import type { NextConfig } from "next";

/**
 * Remote images served by the Laravel API (e.g. http://localhost:8000/storage/...)
 * are allowed automatically based on the API_URL host. Extra hosts can be listed
 * in IMAGE_HOSTS as a comma separated list (e.g. "cdn.example.com,img.example.com").
 */
function buildRemotePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const patterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];

  const apiUrl = process.env.API_URL;
  if (apiUrl) {
    try {
      const { protocol, hostname, port } = new URL(apiUrl);
      patterns.push({
        protocol: protocol.replace(":", "") as "http" | "https",
        hostname,
        port,
      });
    } catch {
      // Invalid API_URL is reported by the API client at request time.
    }
  }

  for (const host of (process.env.IMAGE_HOSTS ?? "").split(",")) {
    const hostname = host.trim();
    if (hostname) {
      patterns.push({ protocol: "https", hostname });
    }
  }

  return patterns;
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    // The Laravel app lives one level up and has its own lockfile; pin the root to this app.
    root: import.meta.dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: buildRemotePatterns(),
  },
};

export default nextConfig;
