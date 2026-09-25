/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Thêm các cấu hình Next.js khác nếu cần
  // allowedDevOrigins: ['113.176.130.161'],
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // cache 1 năm cho Next/Image API (nếu còn dùng)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [25, 50, 75, 100],
  },
  // Bật Cache mạnh mẽ ở Browser cho các file tĩnh trong public/book-pages
  async headers() {
    return [
      {
        source: '/book-pages/:all*(webp|jpg|png)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
export default nextConfig;
