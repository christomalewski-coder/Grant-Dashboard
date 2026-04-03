import './globals.css';
import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Grant Pipeline Engine',
  description: 'Production-grade grant opportunity dashboard for DOE, EECBG, state energy offices, and utility rebate funding.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
