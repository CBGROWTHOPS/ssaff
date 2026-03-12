"use client";

import { useState, useEffect } from "react";

export default function HeroContent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="pointer-events-none fixed top-0 left-0 right-0 z-20 flex flex-col items-center pt-16"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 600ms ease-out, transform 600ms ease-out",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="SSAFF"
        className="block"
        style={{ width: "min(280px, 40vw)", height: "auto" }}
      />
      <p
        className="mt-0.5 tracking-[0.04em]"
        style={{
          fontFamily: "var(--font-inter), sans-serif",
          fontSize: "clamp(12px, 1.2vw, 16px)",
          fontWeight: 300,
          color: "rgba(255, 255, 255, 0.5)",
        }}
      >
        Growth, powered up.
      </p>
    </div>
  );
}
