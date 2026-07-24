import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        // Cloudflare R2 public buckets (pub-<hash>.r2.dev). If you attach a
        // custom domain to the bucket, add that hostname here too.
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        // Google Drive share links (converted to the direct thumbnail URL).
        protocol: "https",
        hostname: "drive.google.com",
      },
      {
        // Google's image CDN that Drive thumbnails redirect to.
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
