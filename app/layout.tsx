import type { Metadata, Viewport } from "next";
import { Fragment_Mono, Work_Sans } from "next/font/google";

import { SmoothScroll } from "@/components/chrome/smooth-scroll";
import { WaitlistProvider } from "@/components/controls/waitlist";
import { pages } from "@/lib/pages";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

/**
 * Two faces, and the same two the reference uses.
 *
 * Work Sans carries everything a reader reads — from the 300px display
 * type down to the paragraphs — at a single weight. Fragment Mono
 * carries everything a reader scans: captions, nav, spec rows, numerals.
 * There is no third face and no bold.
 */
const workSans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-work-sans",
});

const fragmentMono = Fragment_Mono({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-fragment-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: pages.home.title,
    template: `%s — ${SITE_NAME}`,
  },
  description: pages.home.description,
  applicationName: SITE_NAME,
  keywords: [
    "hardware projects",
    "hardware documentation",
    "hardware versioning",
    "component inventory",
    "project kits",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: pages.home.title,
    description: pages.home.share,
  },
  twitter: {
    card: "summary_large_image",
    title: pages.home.title,
    description: pages.home.share,
  },
};

export const viewport: Viewport = {
  themeColor: "#010101",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${workSans.variable} ${fragmentMono.variable}`}>
      <body className="antialiased">
        <SmoothScroll />
        <WaitlistProvider>{children}</WaitlistProvider>
      </body>
    </html>
  );
}
