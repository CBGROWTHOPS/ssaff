"use client";

import dynamic from "next/dynamic";
import HeroContent from "@/components/home/HeroContent";
import Footer from "@/components/home/Footer";

const NetworkGraph = dynamic(
  () => import("@/components/home/NetworkGraph"),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <NetworkGraph />
      <HeroContent />
      <Footer />
    </main>
  );
}
