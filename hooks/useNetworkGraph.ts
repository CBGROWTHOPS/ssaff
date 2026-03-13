"use client";

import { useRef, useState, useEffect, useCallback } from "react";

export const NODES = [
  { id: "agent-core", label: "agent-core" },
  { id: "data-layer", label: "data-layer" },
  { id: "conversion-bridge", label: "conversion-bridge" },
  { id: "offer-network", label: "offer-network" },
  { id: "optimization", label: "optimization" },
  { id: "command-bus", label: "command-bus" },
  { id: "paid-traffic", label: "paid-traffic" },
  { id: "landing-system", label: "landing-system" },
  { id: "lead-capture", label: "lead-capture" },
  { id: "click-tracker", label: "click-tracker" },
  { id: "email-system", label: "email-system" },
  { id: "sms-gateway", label: "sms-gateway" },
  { id: "postback-relay", label: "postback-relay" },
  { id: "routing-engine", label: "routing-engine" },
  { id: "attribution-core", label: "attribution-core" },
  { id: "profit-monitor", label: "profit-monitor" },
  { id: "geo-router", label: "geo-router" },
  { id: "fraud-filter", label: "fraud-filter" },
  { id: "session-sync", label: "session-sync" },
  { id: "model-cache", label: "model-cache" },
  { id: "event-stream", label: "event-stream" },
  { id: "signal-engine", label: "signal-engine" },
] as const;

export const EDGES: [string, string][] = [
  ["agent-core", "data-layer"],
  ["agent-core", "conversion-bridge"],
  ["agent-core", "offer-network"],
  ["agent-core", "optimization"],
  ["agent-core", "profit-monitor"],
  ["agent-core", "command-bus"],
  ["data-layer", "conversion-bridge"],
  ["conversion-bridge", "offer-network"],
  ["offer-network", "postback-relay"],
  ["postback-relay", "profit-monitor"],
  ["optimization", "profit-monitor"],
  ["paid-traffic", "landing-system"],
  ["landing-system", "conversion-bridge"],
  ["command-bus", "routing-engine"],
  ["routing-engine", "postback-relay"],
  ["geo-router", "routing-engine"],
  ["model-cache", "optimization"],
  ["event-stream", "conversion-bridge"],
  ["lead-capture", "conversion-bridge"],
  ["attribution-core", "profit-monitor"],
];

export const GRAB_RADIUS = 12;

export const LABELS_ALWAYS_VISIBLE: readonly string[] = [
  "agent-core", "data-layer", "conversion-bridge",
  "offer-network", "optimization", "profit-monitor",
];

export const NODE_TYPES = {
  core: ["agent-core"],
  primary: ["data-layer", "conversion-bridge", "offer-network", "optimization", "profit-monitor"],
  peripheral: ["command-bus", "paid-traffic", "landing-system", "lead-capture", "click-tracker", "email-system", "sms-gateway", "postback-relay", "routing-engine", "attribution-core", "geo-router", "fraud-filter", "session-sync", "model-cache", "event-stream", "signal-engine"],
} as const;

function getNodeType(id: string): "core" | "primary" | "peripheral" {
  if ((NODE_TYPES.core as readonly string[]).includes(id)) return "core";
  if ((NODE_TYPES.primary as readonly string[]).includes(id)) return "primary";
  return "peripheral";
}


export type NodeState = {
  id: string;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  radius: number;
  nodeType: "core" | "primary" | "peripheral";
  targetX: number;
  targetY: number;
};

const BOOT_DURATION = 3200;
const SPRING_REST_LENGTH = 120;
const SPRING_STRENGTH = 0.012;
const REPEL_STRENGTH = 48;
const REPEL_RADIUS = 260;
const CENTER_ATTRACTION = 0.014;
const BOOT_CENTER_ATTRACTION = 0.022;
const DAMPING = 0.92;
const BOUNDARY = 60;
const BOUNDARY_STRENGTH = 0.8;
const IDLE_VELOCITY_INJECT = 0.008;
const REPEL_MIN_DIST = 25;
const MIN_NODE_DISTANCE = 70;
const RELEASE_VELOCITY_SCALE = 0.35;
const IDLE_INJECT_SPEED_THRESHOLD = 0.5;

function placeNodesScattered(
  width: number,
  height: number
): Map<string, { x: number; y: number }> {
  const map = new Map<string, { x: number; y: number }>();
  const cx = width / 2;
  const cy = height / 2;
  const spread = Math.min(width, height) * 0.42;
  NODES.forEach((n) => {
    const angle = Math.random() * Math.PI * 2;
    const r = spread * (0.3 + Math.random() * 0.7);
    map.set(n.id, {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
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
    const positions = placeNodesScattered(width, height);

    const states = new Map<string, NodeState>();
    const radiusByType = { core: 9, primary: 5.5, peripheral: 2.5 };
    const massByType = { core: 2, primary: 1.2, peripheral: 0.7 };
    NODES.forEach((n) => {
      const pos = positions.get(n.id) ?? { x: cx, y: cy };
      const nodeType = getNodeType(n.id);
      states.set(n.id, {
        id: n.id,
        label: n.label,
        x: pos.x,
        y: pos.y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        mass: massByType[nodeType],
        radius: radiusByType[nodeType],
        nodeType,
        targetX: pos.x,
        targetY: pos.y,
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

      const centerPull = phase === "boot" && bootStart.current !== null
        ? BOOT_CENTER_ATTRACTION
        : CENTER_ATTRACTION;

      if (phase === "boot" && bootStart.current !== null) {
        const elapsed = now - bootStart.current;
        if (elapsed >= BOOT_DURATION) {
          setPhase("idle");
          bootStart.current = null;
        }
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

        n.vx += (cx - n.x) * centerPull;
        n.vy += (cy - n.y) * centerPull;

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
            const strengthMultiplier = rawDist < MIN_NODE_DISTANCE ? 4 : 1.2;
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
