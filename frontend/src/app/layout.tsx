import type { Metadata } from "next";
import {
  Archivo_Black,
  IBM_Plex_Mono,
  Newsreader,
  Outfit,
} from "next/font/google";
import Script from "next/script";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

// Font loaders are hoisted to module scope so Next can inline the CSS once.
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  weight: "400",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// Runs before hydration so the correct theme is painted on the first frame.
const themeBootstrap = `(function(){
  try {
    var stored = localStorage.getItem('best-shop-theme');
    var match = document.cookie.match(/(?:^|;\\s*)best-shop-theme=(dark|light)/);
    var saved = stored || (match && match[1]);
    var theme = saved === 'dark' || saved === 'light'
      ? saved
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
  } catch (e) {}
})();`;

export const metadata: Metadata = {
  title: {
    default: "Best Shop — Live goods, plain prices",
    template: "%s | Best Shop",
  },
  description:
    "Read the live Best Shop catalog with real prices and stock, then pay cash on delivery.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${archivoBlack.variable} ${newsreader.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Script
          id="best-shop-theme"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeBootstrap }}
        />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
