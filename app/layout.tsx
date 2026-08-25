import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LUMEN Network — Aufgebaut auf Menschen",
  description: "Eine scrollgesteuerte, leuchtende Netzwerk-Landingpage.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        {/* Inline script BEFORE React hydrates — disables browser scroll
            restoration so every refresh starts at the hero. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
              }
              window.scrollTo(0, 0);
            `,
          }}
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
