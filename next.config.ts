import type { NextConfig } from "next";
const config: NextConfig = {
  devIndicators: false,
  images: {
    // Listing and site photos uploaded through the admin to Vercel Blob.
    remotePatterns: [
      new URL("https://*.public.blob.vercel-storage.com/cars/**"),
      new URL("https://*.public.blob.vercel-storage.com/site/**"),
    ],
    // Every upload gets a new file name, so optimised copies can be kept
    // for a month, and fewer sizes mean fewer transformations: Vercel's
    // Hobby plan stops optimising new images after 5,000 a month.
    minimumCacheTTL: 2678400,
    deviceSizes: [640, 828, 1080, 1920],
    imageSizes: [128, 256, 384],
  },
  // The temporary .vercel.app addresses stay out of search results, before
  // and after a custom domain is connected; only the real domain is indexed.
  async headers() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: ".*\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
};
export default config;
