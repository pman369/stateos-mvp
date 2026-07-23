import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StateOS Documentation',
  description: 'Documentation for StateOS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}