import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import MobileAppHeader from "@/components/layout/MobileAppHeader";
import CookieConsent from "@/components/privacy/CookieConsent";
import GlobalChatPresence from "@/components/chats/GlobalChatPresence";

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
  applicationName: "QOT Uganda",
  title: {
    default: "QOT - Buy & Sell for Free",
    template: "%s | QOT",
  },
  description: "Buy and sell cars, phones, property, electronics, services and more across Uganda for free on QOT Uganda.",
  alternates: {
    canonical: "/",
  },
  category: "classifieds",
  keywords: [
    "QOT Uganda",
    "buy and sell Uganda",
    "free classifieds Uganda",
    "online marketplace Uganda",
    "used items Uganda",
  ],
  authors: [{ name: "QOT Uganda", url: "https://qot.ug" }],
  creator: "QOT Uganda",
  publisher: "QOT Uganda",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "QOT - Buy & Sell for Free",
    description: "Buy and sell cars, phones, property, electronics, services and more across Uganda for free.",
    url: "https://qot.ug/",
    siteName: "QOT Uganda",
    locale: "en_UG",
    type: "website",
    images: [
      {
        url: "/qot-social-card.png",
        width: 1200,
        height: 630,
        alt: "QOT Uganda - Buy and Sell for Free",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QOT - Buy & Sell for Free",
    description: "Buy and sell cars, phones, property, electronics, services and more across Uganda for free.",
    images: ["/qot-social-card.png"],
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://qot.ug/#website",
      url: "https://qot.ug/",
      name: "QOT Uganda",
      alternateName: ["QOT", "QOT Marketplace"],
      description: "A free online marketplace for buying and selling across Uganda.",
      publisher: { "@id": "https://qot.ug/#organization" },
      inLanguage: "en-UG",
    },
    {
      "@type": "Organization",
      "@id": "https://qot.ug/#organization",
      name: "QOT Uganda",
      alternateName: "QOT",
      url: "https://qot.ug/",
      logo: {
        "@type": "ImageObject",
        url: "https://qot.ug/icon.svg",
      },
      email: "info@qot.ug",
      telephone: "+256200911678",
      areaServed: {
        "@type": "Country",
        name: "Uganda",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "info@qot.ug",
        telephone: "+256200911678",
        areaServed: "UG",
        availableLanguage: "English",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-UG">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema).replace(/</g, "\\u003c"),
          }}
        />
        <GlobalChatPresence />
        <MobileAppHeader />
        {children}
        <MobileBottomNav />
        <CookieConsent />

      </body>
    </html>
  );
}
