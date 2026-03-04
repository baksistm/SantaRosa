import type { Metadata } from 'next';
import { inter, spaceGrotesk } from '@/lib/fonts';
import './globals.css';
import { AuthSync } from '@/components/AuthSync';

export const metadata: Metadata = {
  title: 'Santa Rosa Malhas | Filial 3',
  description: 'Sistema de Gestão Interna - Filial 3',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased bg-slate-50 text-slate-900" suppressHydrationWarning>
        <AuthSync />
        {children}
      </body>
    </html>
  );
}
