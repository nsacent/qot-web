import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import MobileAppHeader from "@/components/layout/MobileAppHeader";
import CookieConsent from "@/components/privacy/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://qot.ug"),
  title: {
    default: "QOT - Buy & Sell for Free",
    template: "%s | QOT",
  },
  description: "Buy and sell products and services across Uganda for free.",
  openGraph: {
    title: "QOT - Buy & Sell for Free",
    description: "Buy and sell products and services across Uganda for free.",
    url: "https://qot.ug",
    siteName: "QOT",
    locale: "en_UG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QOT - Buy & Sell for Free",
    description: "Buy and sell products and services across Uganda for free.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full antialiased`}
      >
        <MobileAppHeader />
        {children}
        <MobileBottomNav />
        <CookieConsent />

      </body>
    </html>
  );
}
