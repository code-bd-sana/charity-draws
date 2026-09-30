import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { Toaster } from 'sonner';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Charity Draws | Official UK Charity Prize Draws & Competitions',
  description:
    'Enter transparent prize competitions to win tax-free cash, luxury vehicles, watches, and tech while supporting registered UK charities.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}>
      <body suppressHydrationWarning className='min-h-full flex flex-col'>
        <Providers>{children}</Providers>
        <Toaster 
          position="bottom-right"
          visibleToasts={1}
          expand={false}
          duration={3000}
          richColors
          closeButton
          toastOptions={{
            style: {
              background: '#FFFFFF',
              border: '1px solid #E6D8F7',
              color: '#351365',
              boxShadow: '0 14px 34px -14px rgba(85, 32, 171, 0.20), 0 4px 16px rgba(113, 49, 200, 0.08)',
              borderRadius: '12px',
              fontFamily: 'var(--font-inter), sans-serif',
              fontSize: '13px',
              fontWeight: 500,
            },
            className: 'font-sans text-[13px] font-medium shadow-card',
            classNames: {
              toast: 'bg-surface border-border text-text-primary shadow-card rounded-card',
              title: 'font-semibold text-text-primary text-[13px]',
              description: 'text-text-muted text-[12px]',
              actionButton: 'bg-primary text-white font-semibold text-[12px] rounded-button px-3 py-1.5',
              cancelButton: 'bg-accent-bg text-text-brand font-semibold text-[12px] rounded-button px-3 py-1.5',
              closeButton: '!bg-surface !border-border !text-text-muted hover:!text-text-primary',
            },
          }}
        />
      </body>
    </html>
  );
}
