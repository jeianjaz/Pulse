import '@/styles/globals.css';
import { Karla, DM_Sans } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pulse - AI-Driven Healthcare',
  description: 'AI-Driven Remote Patient Monitoring and Predictive Health Analysis',
  icons: {
    icon: '/images/pulse/pulselogo.png',
    apple: '/images/pulse/pulselogo.png',
  },
};

const karla = Karla({ 
  subsets: ['latin'],
  variable: '--font-karla',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${karla.variable} ${dmSans.variable} min-h-screen`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}