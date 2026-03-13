"use client";

import { useRef, useState, useEffect, useCallback } from "react";

export const NODES = [
  { id: "agent-core", label: "agent-core" },
  { id: "data-layer", label: "data-layer" },
  { id: "conversion-bridge", label: "conversion-bridge" },
  { id: "offer-network", label: "offer-network" },
  { id: "optimization", label: "optimization" },
  { id: "paid-traffic", label: "paid-traffic" },
  { id: "landing-system", label: "landing-system" },
  { id: "email-system", label: "email-system" },
  { id: "click-tracker", label: "click-tracker" },
  { id: "postback-relay", label: "postback-relay" },
  { id: "profit-monitor", label: "profit-monitor" },
] as const;

export const EDGES: [string, string][] = [
  ["agent-core", "data-layer"],
  ["agent-core", "conversion-bridge"],
  ["agent-core", "offer-network"],
  ["agent-core", "optimization"],
  ["paid-traffic", "landing-system"],
  ["landing-system", "conversion-bridge"],
  ["landing-system", "email-system"],
  ["conversion-bridge", "offer-network"],
  ["offer-network", "postback-relay"],
  ["postback-relay", "profit-monitor"],
  ["optimization", "profit-monitor"],
  ["data-layer", "conversion-bridge"],
];

export const GRAB_RADIUS = 12;

export const NODE_TYPES = {
  core: ["agent-core"],
  system: ["data-layer", "conversion-bridge", "offer-network", "optimization"],
  peripheral: ["paid-traffic", "landing-system", "email-system", "click-tracker", "postback-relay", "profit-monitor"],
} as const;

function getNodeType(id: string): "core" | "system" | "peripheral" {
  if (NODE_TYPES.core.includes(id)) return "core";
  if (NODE_TYPES.system.includes(id)) return "system";
  return "peripheral";
}

const ZONES = {
  center: { x: 0.5, y: 0.5 },
  layer1: { x: 0.5, y: 0.5 },
  layer2: { x: 0.5, y: 0.5 },
} as const;

const NODE_TO_ZONE: Record<string, keyof typeof ZONES> = {
  "agent-core": "center",
  "data-layer": "layer1",
  "conversion-bridge": "layer1",
  "offer-network": "layer1",
  "optimization": "layer1",
  "paid-traffic": "layer2",
  "landing-system": "layer2",
  "email-system": "layer2",
  "click-tracker": "layer2",
  "postback-relay": "layer2",
  "profit-monitor": "layer2",
};

const CENTER_BIAS: Record<string, number> = {
  "agent-core": 1,
  "data-layer": 0.5,
  "conversion-bridge": 0.5,
  "offer-network": 0.3,
  "optimization": 0.3,
};

export type NodeState = {
  id: string;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  radius: number;
  nodeType: "core" | "system" | "peripheral";
  targetX: number;
  targetY: number;
};

const BOOT_DURATION = 1500;
const SPRING_REST_LENGTH = 180;
const SPRING_STRENGTH = 0.02;
const REPEL_STRENGTH = 28;
const REPEL_RADIUS = 220;
const ZONE_PULL = 0.016;
const DAMPING = 0.88;
const BOUNDARY = 60;
const BOUNDARY_STRENGTH = 0.8;
const IDLE_VELOCITY_INJECT = 0.008;
const REPEL_MIN_DIST = 25;
const MIN_NODE_DISTANCE = 70;
const RELEASE_VELOCITY_SCALE = 0.35;
const IDLE_INJECT_SPEED_THRESHOLD = 0.5;

function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function placeNodesInLayers(
  width: number,
  height: number
): Map<string, { x: number; y: number }> {
  const map = new Map<string, { x: number; y: number }>();
  const cx = width / 2;
  const cy = height / 2;
  map.set("agent-core", { x: cx, y: cy });
  const layer1 = NODE_TYPES.system;
  layer1.forEach((id, i) => {
    const angle = (2 * Math.PI * i) / layer1.length;
    const r = Math.min(width, height) * 0.22;
    map.set(id, { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  });
  const layer2 = NODE_TYPES.peripheral;
  layer2.forEach((id, i) => {
    const angle = (2 * Math.PI * i) / layer2.length - 0.3;
    const r = Math.min(width, height) * 0.38;
    map.set(id, { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
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
    const targets = placeNodesInLayers(width, height);

    const states = new Map<string, NodeState>();
    const radiusByType = { core: 8, system: 4, peripheral: 2.5 };
    const massByType = { core: 2, system: 1.2, peripheral: 0.8 };
    NODES.forEach((n) => {
      const t = targets.get(n.id) ?? { x: cx, y: cy };
      const nodeType = getNodeType(n.id);
      states.set(n.id, {
        id: n.id,
        label: n.label,
        x: cx,
        y: cy,
        vx: 0,
        vy: 0,
        mass: massByType[nodeType],
        radius: radiusByType[nodeType],
        nodeType,
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
          n.x = Math.max(40, Math.min(width - 40, grabPosition.x));
          n.y = Math.max(40, Math.min(height - 40, grabPosition.y));
          n.vx = 0;
          n.vy = 0;
          return;
        }

        const zoneName = NODE_TO_ZONE[n.id];
        const zone = zoneName ? ZONES[zoneName] : null;
        if (zone) {
          const bias = CENTER_BIAS[n.id] ?? 0;
          const tx = zone.x * (1 - bias) + 0.5 * bias;
          const ty = zone.y * (1 - bias) + 0.5 * bias;
          n.vx += (tx * width - n.x) * ZONE_PULL;
          n.vy += (ty * height - n.y) * ZONE_PULL;
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
            const sameZone = NODE_TO_ZONE[n.id] && NODE_TO_ZONE[o.id] && NODE_TO_ZONE[n.id] === NODE_TO_ZONE[o.id];
            const strengthMultiplier = rawDist < MIN_NODE_DISTANCE ? 3.5 : sameZone ? 3.5 : 1.0;
            const strength = REPEL_STRENGTH * strengthMultiplier;
            const dist = Math.max(rawDist, REPEL_MIN_DIST);
            const force = strength / (dist * dist);
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
