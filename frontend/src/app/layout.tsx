import type { Metadata } from "next";
import { Bungee, Karla, Roboto_Mono } from "next/font/google";
import Script from "next/script";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

// Font loaders are hoisted to module scope so Next can inline the CSS once.
const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
});

const bungee = Bungee({
  variable: "--font-bungee",
  subsets: ["latin"],
  weight: "400",
});

const roboMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
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
    "Browse the live Best Shop stall with real prices and stock, then pay cash on delivery.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      data-scroll-behavior="smooth"
      lang="en"
      suppressHydrationWarning
      className={`${karla.variable} ${bungee.variable} ${roboMono.variable} h-full antialiased`}
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
