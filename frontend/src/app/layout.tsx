import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rased (رصد) — Workforce Compliance Agent',
  description: 'Arabic-first workforce compliance reporting for GCC employers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body className="min-h-screen bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
