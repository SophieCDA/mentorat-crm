// app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/hooks/useAuth';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CRM - Gestion de la Relation Client',
  description: 'Système de gestion de la relation client moderne et intuitif',
  keywords: 'CRM, gestion client, relation client, dashboard',
  authors: [{ name: 'Votre Entreprise' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#7978E2',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}