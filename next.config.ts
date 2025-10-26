/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "prod-files-secure.s3.us-west-2.amazonaws.com", // Notion S3 file URLs
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // if you use Unsplash or public assets
      },
      {
        protocol: "https",
        hostname: "pzqfhkpanshrsijoyrii.supabase.co", // Supabase storage bucket for topic assets
      },
    ],
  },
};

module.exports = nextConfig;
