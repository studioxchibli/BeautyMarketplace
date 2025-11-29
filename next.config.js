/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ["images.unsplash.com", "utfs.io", "lh3.googleusercontent.com"],
  },
};

module.exports = nextConfig;
