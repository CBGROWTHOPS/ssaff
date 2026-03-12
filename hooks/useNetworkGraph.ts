"use client";

import { useRef, useState, useEffect, useCallback } from "react";

export const NODES = [
  { id: "traffic-agents", label: "traffic-agents" },
  { id: "creative-engine", label: "creative-engine" },
  { id: "conversion-tracking", label: "conversion-tracking" },
  { id: "email-sequences", label: "email-sequences" },
  { id: "optimization", label: "optimization" },
  { id: "profit-monitor", label: "profit-monitor" },
  { id: "data-router", label: "data-router" },
  { id: "agent-core", label: "agent-core" },
] as const;

export const EDGES: [string, string][] = [
  ["agent-core", "traffic-agents"],
  ["agent-core", "creative-engine"],
  ["agent-core", "optimization"],
  ["agent-core", "profit-monitor"],
  ["traffic-agents", "conversion-tracking"],
  ["conversion-tracking", "email-sequences"],
  ["email-sequences", "optimization"],
  ["data-router", "profit-monitor"],
  ["data-router", "conversion-tracking"],
];

export const GRAB_RADIUS = 8;

export type NodeState = {
  id: string;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  radius: number;
  targetX: number;
  targetY: number;
};

const BOOT_DURATION = 1500;
const SPRING_REST_LENGTH = 170;
const SPRING_STRENGTH = 0.018;
const REPEL_STRENGTH = 32;
const REPEL_RADIUS = 200;
const DAMPING = 0.82;
const BOUNDARY = 80;
const BOUNDARY_STRENGTH = 0.015;
const IDLE_VELOCITY_INJECT = 0.015;
const REPEL_MIN_DIST = 30;
const RELEASE_VELOCITY_SCALE = 0.35;
const IDLE_INJECT_SPEED_THRESHOLD = 0.6;

function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function placeNodesInCircle(
  nodes: readonly { id: string; label: string }[],
  cx: number,
  cy: number,
  radius: number
): Map<string, { x: number; y: number }> {
  const map = new Map<string, { x: number; y: number }>();
  const agentCore = nodes.find((n) => n.id === "agent-core");
  const others = nodes.filter((n) => n.id !== "agent-core");
  if (agentCore) map.set(agentCore.id, { x: cx, y: cy });
  others.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / others.length;
    map.set(n.id, {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    });
  });
  return map;
}

export function findNodeAtPosition(
  states: Map<string, NodeState>,
  x: number,
  y: number,
  grabRadius: number
): string | null {
  for (const s of states.values()) {
    if (Math.hypot(x - s.x, y - s.y) <= grabRadius) return s.id;
  }
  return null;
}

export function useNetworkGraph(
  width: number,
  height: number,
  grabbedNodeId: string | null,
  grabPosition: { x: number; y: number } | null,
  releaseVelocity: { nodeId: string; vx: number; vy: number } | null
) {
  const [phase, setPhase] = useState<"boot" | "idle">("boot");
  const bootStart = useRef<number | null>(null);
  const nodeStates = useRef<Map<string, NodeState>>(new Map());
  const appliedReleaseRef = useRef<{ nodeId: string } | null>(null);

  const initStates = useCallback(() => {
    const cx = width / 2;
    const cy = height / 2;
    const targets = placeNodesInCircle(NODES, cx, cy, Math.min(width, height) * 0.28);

    const states = new Map<string, NodeState>();
    NODES.forEach((n) => {
      const t = targets.get(n.id) ?? { x: cx, y: cy };
      const radius = n.id === "agent-core" ? 5.5 : 3.5;
      const mass = n.id === "agent-core" ? 1.8 : 1.0;
      states.set(n.id, {
        id: n.id,
        label: n.label,
        x: cx,
        y: cy,
        vx: 0,
        vy: 0,
        mass,
        radius,
        targetX: t.x,
        targetY: t.y,
      });
    });
    nodeStates.current = states;
  }, [width, height]);

  useEffect(() => {
    if (width <= 0 || height <= 0) return;
    initStates();
    bootStart.current = null;
    setPhase("boot");
  }, [width, height, initStates]);

  const tick = useCallback(
    (now: number) => {
      const states = nodeStates.current;
      if (states.size === 0) return;

      const cx = width / 2;
      const cy = height / 2;

      if (phase === "boot") {
        if (bootStart.current === null) bootStart.current = now;
        const elapsed = now - bootStart.current;
        const t = Math.min(1, elapsed / BOOT_DURATION);
        const eased = easeOutExpo(t);

        states.forEach((s) => {
          s.x = cx + (s.targetX - cx) * eased;
          s.y = cy + (s.targetY - cy) * eased;
        });

        if (t >= 1) {
          setPhase("idle");
          bootStart.current = null;
        }
        return;
      }

      if (releaseVelocity && releaseVelocity.nodeId !== grabbedNodeId) {
        const node = states.get(releaseVelocity.nodeId);
        if (node && appliedReleaseRef.current?.nodeId !== releaseVelocity.nodeId) {
          node.vx = releaseVelocity.vx * RELEASE_VELOCITY_SCALE;
          node.vy = releaseVelocity.vy * RELEASE_VELOCITY_SCALE;
          appliedReleaseRef.current = { nodeId: releaseVelocity.nodeId };
        }
      }
      if (!releaseVelocity) appliedReleaseRef.current = null;

      const nodeList = Array.from(states.values());

      nodeList.forEach((n) => {
        if (grabbedNodeId === n.id && grabPosition) {
          n.x = grabPosition.x;
          n.y = grabPosition.y;
          n.vx = 0;
          n.vy = 0;
          return;
        }

        let fx = 0;
        let fy = 0;

        EDGES.forEach(([a, b]) => {
          const otherId = a === n.id ? b : b === n.id ? a : null;
          if (!otherId) return;
          const other = states.get(otherId)!;
          const ox = other.id === grabbedNodeId && grabPosition ? grabPosition.x : other.x;
          const oy = other.id === grabbedNodeId && grabPosition ? grabPosition.y : other.y;
          const dx = ox - n.x;
          const dy = oy - n.y;
          const len = Math.hypot(dx, dy) || 0.01;
          const force = (len - SPRING_REST_LENGTH) * SPRING_STRENGTH;
          fx += (dx / len) * force;
          fy += (dy / len) * force;
        });

        nodeList.forEach((o) => {
          if (o.id === n.id || o.id === grabbedNodeId) return;
          const dx = n.x - o.x;
          const dy = n.y - o.y;
          const rawDist = Math.hypot(dx, dy) || 0.01;
          if (rawDist < REPEL_RADIUS) {
            const dist = Math.max(rawDist, REPEL_MIN_DIST);
            const force = REPEL_STRENGTH / (dist * dist);
            const norm = rawDist > 0 ? rawDist : 1;
            fx += (dx / norm) * force;
            fy += (dy / norm) * force;
          }
        });

        if (n.x < BOUNDARY) fx += (BOUNDARY - n.x) * BOUNDARY_STRENGTH;
        else if (n.x > width - BOUNDARY) fx -= (n.x - (width - BOUNDARY)) * BOUNDARY_STRENGTH;
        if (n.y < BOUNDARY) fy += (BOUNDARY - n.y) * BOUNDARY_STRENGTH;
        else if (n.y > height - BOUNDARY) fy -= (n.y - (height - BOUNDARY)) * BOUNDARY_STRENGTH;

        n.vx = n.vx * DAMPING + fx / n.mass;
        n.vy = n.vy * DAMPING + fy / n.mass;
        const speed = Math.hypot(n.vx, n.vy);
        if (speed < IDLE_INJECT_SPEED_THRESHOLD) {
          n.vx += (Math.random() - 0.5) * 2 * IDLE_VELOCITY_INJECT;
          n.vy += (Math.random() - 0.5) * 2 * IDLE_VELOCITY_INJECT;
        }
        n.x += n.vx;
        n.y += n.vy;
      });
    },
    [phase, width, height, grabbedNodeId, grabPosition, releaseVelocity]
  );

  return { nodeStates, phase, tick };
}
