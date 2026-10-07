import type { NextConfig } from "next";
const config: NextConfig = {
  devIndicators: false,
  images: {
    // Listing photos uploaded through the admin to Vercel Blob.
    remotePatterns: [
      new URL("https://*.public.blob.vercel-storage.com/cars/**"),
    ],
  },
};
export default config;
