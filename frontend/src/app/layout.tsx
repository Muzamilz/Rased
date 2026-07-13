import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rased (رصد) — Workforce Compliance Agent',
  description: 'Arabic-first workforce compliance reporting for GCC employers',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
