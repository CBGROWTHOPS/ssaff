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

export const metadata: Metadata = {
  metadataBase: new URL("https://ssaff.co"),
  title: "SSAFF",
  description: "Media company operating a portfolio of owned consumer brands across health, personal finance, e-commerce, and gaming.",
  openGraph: {
    title: "SSAFF",
    description: "Media company operating a portfolio of owned consumer brands across health, personal finance, e-commerce, and gaming.",
    url: "https://ssaff.co",
    siteName: "SSAFF",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SSAFF",
    description: "Media company operating a portfolio of owned consumer brands across health, personal finance, e-commerce, and gaming.",
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
        className={`${spaceGrotesk.variable} ${inter.variable} antialiased`}
        style={{ background: "#FAFAF7" }}
      >
        {children}
      </body>
    </html>
  );
}
