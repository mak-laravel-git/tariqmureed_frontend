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

  // Team, league and player images from the SportMonks cricket data feed.
  patterns.push({ protocol: "https", hostname: "cdn.sportmonks.com" });

  // Uploaded and seeded pictures are saved with the live API address, so a copy of the site that talks to a
  // different API (a local one, for example) must still be allowed to show them.
  patterns.push({ protocol: "https", hostname: "api.tmnsport.com" });

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
  experimental: {
    // Image uploads from the admin dashboard are sent through a Server Action (default limit: 1 MB).
    // The Laravel API accepts 10 MB per image; the extra room covers the multipart overhead.
    serverActions: { bodySizeLimit: "12mb" },
    proxyClientMaxBodySize: "12mb",
  },
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
    // The local Laravel app runs on localhost, which the image optimizer blocks by default. Production images
    // come from a public hostname, so this stays off there.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
