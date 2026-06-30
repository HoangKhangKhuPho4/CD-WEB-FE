/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    /**
     * Tắt pipeline /_next/image — tránh 400 khi proxy fetch ảnh từ backend (vd. localhost:8080/img/...).
     * Khi API/CDN ổn định, có thể đổi thành false và giữ remotePatterns.
     */
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8080",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.ngrok-free.app",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.ngrok-free.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "uncallused-nongenetically-ervin.ngrok-free.dev",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
