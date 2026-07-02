import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const SITE_DESCRIPTION =
  "SSAFF LLC is a Miami Beach media company operating owned brands, audience distribution, and partnerships.";

export const metadata: Metadata = {
  metadataBase: new URL("https://ssaff.co"),
  title: {
    default: "SSAFF — Media Company",
    template: "%s",
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: "SSAFF — Media Company",
    description: SITE_DESCRIPTION,
    url: "https://ssaff.co",
    siteName: "SSAFF",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SSAFF — Media Company",
    description: SITE_DESCRIPTION,
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SSAFF LLC",
  legalName: "SSAFF LLC",
  url: "https://ssaff.co",
  description: SITE_DESCRIPTION,
  founder: {
    "@type": "Person",
    name: "Christopher Brown",
  },
  email: "chris@ssaff.co",
  telephone: "+1-754-757-7436",
  address: {
    "@type": "PostalAddress",
    streetAddress: "407 Lincoln Rd, Suite 6H PMB 1834",
    addressLocality: "Miami Beach",
    addressRegion: "FL",
    postalCode: "33139",
    addressCountry: "US",
  },
  sameAs: [
    "https://www.facebook.com/ssaff",
    "https://www.linkedin.com/company/ssaff",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} antialiased`}
        style={{ background: "#FAFAF7" }}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
