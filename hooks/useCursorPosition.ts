"use client";

import { useState, useEffect } from "react";

export function useCursorPosition() {
  const [pos, setPos] = useState({ x: -1, y: -1 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return pos;
}
