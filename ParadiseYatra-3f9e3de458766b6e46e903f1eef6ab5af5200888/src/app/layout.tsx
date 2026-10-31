import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";
import "react-phone-input-international/lib/style.css";
import FooterWrapper from "@/components/FooterWrapper";
import { AuthProvider } from "@/context/AuthContext";
import Script from "next/script";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChatWidget from "@/components/chat/ChatWidget";
import EnquiryPopup from "@/components/EnquiryPopup";
import CookieConsentManager from "@/components/CookieConsentManager";
import OrganizationSchema from "@/components/seo/OrganizationSchema";
import OfferBar from "@/components/OfferBar";
import { offerBarPrePaintScript } from "@/lib/offers";
import { getOfferBar } from "@/lib/server/offers";


// Single typeface for the whole site (design.md). Variable font: one file covers every weight.
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const DEFAULT_DESCRIPTION =
  "Discover the world with Paradise Yatra, the best travel agency in Dehradun. We offer customized international and domestic tour packages, trekking adventures, and unforgettable travel experiences.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  description: DEFAULT_DESCRIPTION,
  // Only include global metadata that should apply to all pages
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  // Google Search Console verification
  verification: {
    google: "BdQBvIBq9neLnNKB-UbBDMkLm47f_BupmJrmVr37QFE",
  },
  // Preload critical resources
  other: {
    "theme-color": "#2563eb",
    sitemap: "/sitemap.xml",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.youtube-nocookie.com https://accounts.google.com/gsi/client; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; media-src 'self' https: blob:; frame-src 'self' https://www.youtube-nocookie.com https://www.instagram.com https://accounts.google.com/gsi/; connect-src 'self' https://www.youtube-nocookie.com https://accounts.google.com/gsi/;",
  },
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Top offer bar (Admin → Offers). has-offer-bar sets --offer-bar-h, which moves the header below it.
  const offerBar = await getOfferBar();

  return (
    <html lang="en" suppressHydrationWarning className={`${plusJakartaSans.variable}${offerBar ? " has-offer-bar" : ""}`}>
      <head>
        <Script id="smooth-scroll" strategy="afterInteractive">
          {`
            // Enhanced smooth scrolling for better cross-browser compatibility
            document.addEventListener('DOMContentLoaded', function() {
              // Handle anchor links with smooth scrolling
              document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                  e.preventDefault();
                  const target = document.querySelector(this.getAttribute('href'));
                  if (target) {
                    const headerHeight = 80; // Adjust based on your header height
                    const targetPosition = target.offsetTop - headerHeight;
                    
                    window.scrollTo({
                      top: targetPosition,
                      behavior: 'smooth'
                    });
                  }
                });
              });
              
              // Enhanced scroll behavior for programmatic scrolling
              window.smoothScrollTo = function(element, offset = 80) {
                const targetPosition = element.offsetTop - offset;
                window.scrollTo({
                  top: targetPosition,
                  behavior: 'smooth'
                });
              };
              
              // Add smooth scrolling to all scrollable containers
              document.querySelectorAll('.smooth-scroll').forEach(container => {
                container.style.scrollBehavior = 'smooth';
                container.style.webkitOverflowScrolling = 'touch';
              });
            });
          `}
        </Script>
      </head>
      <body suppressHydrationWarning className={`${plusJakartaSans.className} antialiased`}>
        <OrganizationSchema />
        {offerBar && (
          <>
            {offerBar.endsAt && <script dangerouslySetInnerHTML={{ __html: offerBarPrePaintScript(offerBar) }} />}
            <OfferBar bar={offerBar} />
          </>
        )}
        <AuthProvider>
          {children}
          <Suspense fallback={null}>
            <CookieConsentManager />
          </Suspense>
          <ChatWidget />
          <EnquiryPopup />
          <FooterWrapper />
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
          {/* <NewFooter /> */}
        </AuthProvider>
      </body>
    </html>
  );
}
