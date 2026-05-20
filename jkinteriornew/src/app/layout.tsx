import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import FloatingContact from "./components/FloatingContact";
import AnnouncementStrip from "./components/AnnouncementStrip";
import StickyMobileBar from "./components/StickyMobileBar";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";

export const metadata: Metadata = {
  title: "JK Interiors — Premium Interior Design Studio, Hyderabad",
  description:
    "Bespoke luxury interiors for villas, penthouses, premium homes, hotels, and refined commercial spaces across Hyderabad. 4.5+ years · 50+ projects · 1-year maintenance.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* Google Tag Manager */}
        {GTM_ID && (
          <Script id="gtm-head" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
        )}

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Josefin+Sans:wght@300;400;600&display=swap"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Josefin+Sans:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#0A0A0A] font-sans">
        {/* GTM noscript fallback */}
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}

        {/* Global announcement marquee */}
        <AnnouncementStrip />

        {children}

        {/* Fixed contact actions (desktop right rail) */}
        <FloatingContact />

        {/* Mobile sticky bottom bar */}
        <StickyMobileBar />
      </body>
    </html>
  );
}
