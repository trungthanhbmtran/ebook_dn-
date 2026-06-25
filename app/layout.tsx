import './globals.css';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'Danh Mục Dự Án Đầu Tư',
  description: 'Sách lật tổng hợp các dự án kêu gọi đầu tư tỉnh Đắk Lắk giai đoạn 2026-2030',
  other: {
    // Tắt auto-detect số điện thoại/email trên iOS WebView
    'format-detection': 'telephone=no, email=no, address=no',
    // Zalo WebView: hiển thị như ứng dụng native
    'apple-mobile-web-app-capable': 'yes',
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        {children}
      </body>
    </html >
  );
}
