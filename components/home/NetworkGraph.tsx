"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  useNetworkGraph,
  EDGES,
  findNodeAtPosition,
  GRAB_RADIUS,
  LABELS_ALWAYS_VISIBLE,
} from "@/hooks/useNetworkGraph";

const BG = "#060608";
const EDGE_OPACITY = 0.08;
const BOOT_DURATION = 3200;
const PULSE_SPEED = 0.0015;
const PULSE_SPAWN_INTERVAL = 4500;
const PARALLAX_STRENGTH = 0.03;
const HOVER_RADIUS = 24;

function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function useDimensions() {
  const [dim, setDim] = useState({ width: 0, height: 0 });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const set = () =>
      setDim({ width: window.innerWidth, height: window.innerHeight });
    set();
    const update = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        set();
        debounceRef.current = null;
      }, 150);
    };
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return dim;
}

function getCanvasPoint(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number
) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

interface Pulse {
  edgeIndex: number;
  progress: number;
}

export default function NetworkGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width, height } = useDimensions();
  const [grabbedNodeId, setGrabbedNodeId] = useState<string | null>(null);
  const [grabPosition, setGrabPosition] = useState<{ x: number; y: number } | null>(null);
  const [releaseVelocity, setReleaseVelocity] = useState<{ nodeId: string; vx: number; vy: number } | null>(null);
  const [cursorStyle, setCursorStyle] = useState<"default" | "grab" | "grabbing">("default");
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const mouseHistoryRef = useRef<{ x: number; y: number; t: number }[]>([]);
  const pulsesRef = useRef<Pulse[]>([]);
  const lastSpawnRef = useRef<number>(0);

  const { nodeStates, phase, tick } = useNetworkGraph(
    width,
    height,
    grabbedNodeId,
    grabPosition,
    releaseVelocity
  );
  const rafRef = useRef<number | null>(null);
  const bootStartRef = useRef<number | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const { x, y } = getCanvasPoint(canvas, e.clientX, e.clientY);
      const hit = findNodeAtPosition(nodeStates.current, x, y, GRAB_RADIUS);
      if (hit) {
        setGrabbedNodeId(hit);
        setGrabPosition({ x, y });
        setCursorStyle("grabbing");
        mouseHistoryRef.current = [{ x, y, t: performance.now() }];
      }
    },
    [nodeStates]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const { x, y } = getCanvasPoint(canvas, e.clientX, e.clientY);
      setMousePos({ x: e.clientX, y: e.clientY });
      if (grabbedNodeId) {
        setGrabPosition({ x, y });
      } else {
        const hit = findNodeAtPosition(nodeStates.current, x, y, HOVER_RADIUS);
        setHoveredNodeId(hit);
        setCursorStyle(hit ? "grab" : "default");
      }
    },
    [grabbedNodeId, nodeStates]
  );

  const handleMouseUp = useCallback(() => {
    if (grabbedNodeId) {
      const history = mouseHistoryRef.current;
      if (history.length >= 2) {
        const first = history[0];
        const last = history[history.length - 1];
        const dt = (last.t - first.t) / 1000 || 0.016;
        if (dt > 0) {
          const vx = (last.x - first.x) / dt;
          const vy = (last.y - first.y) / dt;
          setReleaseVelocity({ nodeId: grabbedNodeId, vx, vy });
        }
      }
      setGrabbedNodeId(null);
      setGrabPosition(null);
      mouseHistoryRef.current = [];
    }
    setCursorStyle("default");
  }, [grabbedNodeId]);

  const handleMouseLeave = useCallback(() => {
    setCursorStyle(grabbedNodeId ? "grabbing" : "default");
    setHoveredNodeId(null);
    setMousePos(null);
  }, [grabbedNodeId]);

  useEffect(() => {
    if (releaseVelocity && !grabbedNodeId) {
      const t = setTimeout(() => setReleaseVelocity(null), 100);
      return () => clearTimeout(t);
    }
  }, [releaseVelocity, grabbedNodeId]);

  useEffect(() => {
    const onGlobalMouseUp = () => {
      if (grabbedNodeId) {
        const history = mouseHistoryRef.current;
        if (history.length >= 2) {
          const first = history[0];
          const last = history[history.length - 1];
          const dt = (last.t - first.t) / 1000 || 0.016;
          if (dt > 0) {
            const vx = (last.x - first.x) / dt;
            const vy = (last.y - first.y) / dt;
            setReleaseVelocity({ nodeId: grabbedNodeId, vx, vy });
          }
        }
        setGrabbedNodeId(null);
        setGrabPosition(null);
        mouseHistoryRef.current = [];
        setCursorStyle("default");
      }
    };
    const onGlobalMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (!grabbedNodeId || !canvasRef.current) return;
      const { x, y } = getCanvasPoint(canvasRef.current, e.clientX, e.clientY);
      const now = performance.now();
      setGrabPosition({ x, y });
      const h = mouseHistoryRef.current;
      h.push({ x, y, t: now });
      if (h.length > 3) h.shift();
    };
    window.addEventListener("mouseup", onGlobalMouseUp);
    window.addEventListener("mousemove", onGlobalMouseMove);
    return () => {
      window.removeEventListener("mouseup", onGlobalMouseUp);
      window.removeEventListener("mousemove", onGlobalMouseMove);
    };
  }, [grabbedNodeId]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, now: number) => {
      const states = nodeStates.current;
      if (states.size === 0) return;

      let parallaxX = 0;
      let parallaxY = 0;
      if (mousePos && width > 0 && height > 0) {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        parallaxX = (mousePos.x - cx) * PARALLAX_STRENGTH;
        parallaxY = (mousePos.y - cy) * PARALLAX_STRENGTH;
        parallaxX = Math.max(-20, Math.min(20, parallaxX));
        parallaxY = Math.max(-20, Math.min(20, parallaxY));
      }

      ctx.save();
      ctx.translate(parallaxX, parallaxY);

      ctx.clearRect(-50, -50, width + 100, height + 100);

      ctx.fillStyle = BG;
      ctx.fillRect(-50, -50, width + 100, height + 100);

      const light = ctx.createRadialGradient(
        width * 0.45, height * 0.58, 0,
        width * 0.45, height * 0.58,
        height * 0.65
      );
      light.addColorStop(0, "rgba(45, 70, 115, 0.42)");
      light.addColorStop(0.3, "rgba(25, 42, 85, 0.18)");
      light.addColorStop(0.7, "rgba(12, 18, 36, 0.06)");
      light.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = light;
      ctx.fillRect(-50, -50, width + 100, height + 100);

      const floor = ctx.createRadialGradient(
        width * 0.5, height * 1.1, 0,
        width * 0.5, height * 1.1,
        height * 0.7
      );
      floor.addColorStop(0, "rgba(35, 58, 105, 0.3)");
      floor.addColorStop(0.5, "rgba(18, 30, 60, 0.1)");
      floor.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = floor;
      ctx.fillRect(-50, -50, width + 100, height + 100);

      const getPos = (id: string) => {
        const s = states.get(id);
        return s ? { x: s.x, y: s.y } : null;
      };

      if (now - lastSpawnRef.current > PULSE_SPAWN_INTERVAL && EDGES.length > 0) {
        lastSpawnRef.current = now;
        pulsesRef.current.push({
          edgeIndex: Math.floor(Math.random() * EDGES.length),
          progress: 0,
        });
      }

      const pulses = pulsesRef.current;
      pulses.forEach((p) => {
        p.progress += PULSE_SPEED;
      });
      pulsesRef.current = pulses.filter((p) => p.progress < 1);

      let edgeProgress = 1;
      if (phase === "boot" && bootStartRef.current !== null) {
        const elapsed = now - bootStartRef.current;
        const t = Math.min(1, elapsed / BOOT_DURATION);
        edgeProgress = easeOutExpo(t);
      }

      EDGES.forEach(([a, b], edgeIdx) => {
        const pa = getPos(a);
        const pb = getPos(b);
        if (!pa || !pb) return;

        const dx = pb.x - pa.x;
        const dy = pb.y - pa.y;
        const len = Math.hypot(dx, dy);
        if (len === 0) return;

        const isHighlighted = grabbedNodeId && (a === grabbedNodeId || b === grabbedNodeId);
        if (isHighlighted) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = "rgba(80, 180, 255, 0.6)";
          ctx.lineWidth = 1.5;
          const gradient = ctx.createLinearGradient(pa.x, pa.y, pb.x, pb.y);
          gradient.addColorStop(0, "rgba(0, 120, 255, 0.8)");
          gradient.addColorStop(1, "rgba(80, 200, 255, 0.8)");
          ctx.strokeStyle = gradient;
        } else {
          ctx.shadowBlur = 0;
          ctx.lineWidth = 0.6;
          const grad = ctx.createLinearGradient(pa.x, pa.y, pb.x, pb.y);
          grad.addColorStop(0, `rgba(120, 160, 220, ${EDGE_OPACITY * 0.3})`);
          grad.addColorStop(0.5, `rgba(150, 190, 255, ${EDGE_OPACITY})`);
          grad.addColorStop(1, `rgba(120, 160, 220, ${EDGE_OPACITY * 0.3})`);
          ctx.strokeStyle = grad;
        }

        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        const dashLen = len * edgeProgress;
        const endX = pa.x + (dx / len) * dashLen;
        const endY = pa.y + (dy / len) * dashLen;
        ctx.lineTo(endX, endY);
        ctx.stroke();
      });

      pulses.forEach((p) => {
        const [a, b] = EDGES[p.edgeIndex];
        const pa = getPos(a);
        const pb = getPos(b);
        if (!pa || !pb) return;
        const px = pa.x + (pb.x - pa.x) * p.progress;
        const py = pa.y + (pb.y - pa.y) * p.progress;
        ctx.shadowBlur = 12;
        ctx.shadowColor = "rgba(100, 180, 255, 0.6)";
        ctx.fillStyle = "rgba(180, 220, 255, 0.6)";
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      const nodeOpacity = phase === "boot" && bootStartRef.current !== null
        ? Math.min(1, (now - bootStartRef.current) / 200)
        : 1;

      const breathingPhase = now * 0.0012;
      const breathingScale = 1 + Math.sin(breathingPhase) * 0.08;
      const breathingOpacity = 0.85 + 0.15 * Math.sin(breathingPhase);

      states.forEach((s) => {
        const isCore = s.nodeType === "core";
        const isPrimary = s.nodeType === "primary";
        const r = isCore ? s.radius * breathingScale : s.radius;

        ctx.save();
        ctx.globalAlpha = nodeOpacity;

        const opacity = isCore ? breathingOpacity : isPrimary ? 0.8 : 0.35;
        const glow = isCore ? 22 : isPrimary ? 10 : 3;
        ctx.shadowBlur = glow;
        ctx.shadowColor = `rgba(255, 255, 255, ${isCore ? 0.4 : isPrimary ? 0.18 : 0.08})`;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        const showLabel =
          (LABELS_ALWAYS_VISIBLE as readonly string[]).includes(s.id) ||
          hoveredNodeId === s.id ||
          grabbedNodeId === s.id;
        if (showLabel) {
          ctx.fillStyle = isCore ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.5)";
          ctx.font = "10px system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(`"${s.label}"`, s.x, s.y + r + 12);
        }
      });

      const vignette = ctx.createRadialGradient(
        width / 2, height / 2, height * 0.25,
        width / 2, height / 2, height * 1.0
      );
      vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
      vignette.addColorStop(1, "rgba(0, 0, 0, 0.85)");
      ctx.fillStyle = vignette;
      ctx.fillRect(-50, -50, width + 100, height + 100);

      ctx.restore();
    },
    [width, height, phase, nodeStates, grabbedNodeId, hoveredNodeId, mousePos]
  );

  useEffect(() => {
    if (width <= 0 || height <= 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false, willReadFrequently: false });
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    if (phase === "boot" && bootStartRef.current === null) {
      bootStartRef.current = performance.now();
    }

    const loop = (now: number) => {
      tick(now);
      draw(ctx, now);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [width, height, phase, tick, draw]);

  const cursorMap = { default: "default", grab: "grab", grabbing: "grabbing" };

  return (
    <canvas
      ref={canvasRef}
      aria-hidden={true}
      className="fixed inset-0 z-0"
      style={{ background: BG, cursor: cursorMap[cursorStyle] }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    />
  );
}
