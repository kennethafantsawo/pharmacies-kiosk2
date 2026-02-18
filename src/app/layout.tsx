import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'TogoPharm Kiosk',
  description: 'Pharmacies de garde au Togo - Affichage Kiosk',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#FFFFFF" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body 
        className={cn(
          "font-body antialiased",
          "w-screen h-screen overflow-hidden bg-background text-foreground"
        )}
      >
        {children}
        <Toaster />
        {/* Interaction Blocker Overlay */}
        <div className="fixed inset-0 z-50"></div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('contextmenu', event => event.preventDefault());
            `,
          }}
        />
      </body>
    </html>
  );
}
