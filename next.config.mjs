/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true, // Ensure this is enabled if you're using Next.js 13's app directory
  },
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
};

export default nextConfig;
