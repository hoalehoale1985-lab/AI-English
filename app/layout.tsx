import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ms. Hoa English - Tiếng Anh Tiểu Học Global Success',
  description: 'Nền tảng học tiếng Anh chuẩn kiến thức cùng sự hỗ trợ của trợ lý học tập AI siêu tốc.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="antialiased selection:bg-amber-200">{children}</body>
    </html>
  );
}