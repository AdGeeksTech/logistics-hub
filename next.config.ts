import type { NextConfig } from "next";
const config: NextConfig = {
  devIndicators: false,
  images: {
    // Listing photos uploaded through the admin to Vercel Blob.
    remotePatterns: [
      new URL("https://*.public.blob.vercel-storage.com/cars/**"),
    ],
    // Every upload gets a new file name, so optimised copies can be kept
    // for a month, and fewer sizes mean fewer transformations: Vercel's
    // Hobby plan stops optimising new images after 5,000 a month.
    minimumCacheTTL: 2678400,
    deviceSizes: [640, 828, 1080, 1920],
    imageSizes: [128, 256, 384],
  },
};
export default config;
