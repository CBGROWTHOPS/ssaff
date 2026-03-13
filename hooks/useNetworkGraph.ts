"use client";

import { useRef, useState, useEffect, useCallback } from "react";

export const NODES = [
  { id: "deploy-core", label: "deploy-core" },
  { id: "frontend-layer", label: "frontend-layer" },
  { id: "data-layer", label: "data-layer" },
  { id: "job-runner", label: "job-runner" },
  { id: "edge-functions", label: "edge-functions" },
  { id: "data-bridge", label: "data-bridge" },
  { id: "postback-relay", label: "postback-relay" },
  { id: "attribution-core", label: "attribution-core" },
  { id: "paid-traffic", label: "paid-traffic" },
  { id: "landing-system", label: "landing-system" },
  { id: "lead-capture", label: "lead-capture" },
  { id: "email-system", label: "email-system" },
  { id: "click-tracker", label: "click-tracker" },
  { id: "offer-network", label: "offer-network" },
  { id: "conversion-bridge", label: "conversion-bridge" },
  { id: "payout-router", label: "payout-router" },
  { id: "workflow-engine", label: "workflow-engine" },
  { id: "command-bot", label: "command-bot" },
  { id: "alert-system", label: "alert-system" },
  { id: "agent-orchestration", label: "agent-orchestration" },
  { id: "agent-core", label: "agent-core" },
  { id: "optimization", label: "optimization" },
  { id: "profit-monitor", label: "profit-monitor" },
  { id: "fraud-detection", label: "fraud-detection" },
  { id: "geo-router", label: "geo-router" },
  { id: "audience-sync", label: "audience-sync" },
] as const;

export const EDGES: [string, string][] = [
  ["deploy-core", "frontend-layer"],
  ["deploy-core", "data-layer"],
  ["deploy-core", "job-runner"],
  ["frontend-layer", "edge-functions"],
  ["edge-functions", "data-layer"],
  ["edge-functions", "data-bridge"],
  ["data-layer", "job-runner"],
  ["job-runner", "workflow-engine"],
  ["paid-traffic", "landing-system"],
  ["landing-system", "lead-capture"],
  ["lead-capture", "data-layer"],
  ["lead-capture", "email-system"],
  ["lead-capture", "conversion-bridge"],
  ["conversion-bridge", "click-tracker"],
  ["conversion-bridge", "attribution-core"],
  ["conversion-bridge", "alert-system"],
  ["click-tracker", "offer-network"],
  ["offer-network", "postback-relay"],
  ["postback-relay", "attribution-core"],
  ["attribution-core", "payout-router"],
  ["attribution-core", "profit-monitor"],
  ["workflow-engine", "command-bot"],
  ["workflow-engine", "data-layer"],
  ["command-bot", "alert-system"],
  ["command-bot", "agent-orchestration"],
  ["agent-orchestration", "agent-core"],
  ["agent-core", "optimization"],
  ["agent-core", "fraud-detection"],
  ["agent-core", "geo-router"],
  ["agent-core", "audience-sync"],
  ["optimization", "paid-traffic"],
  ["optimization", "profit-monitor"],
  ["fraud-detection", "conversion-bridge"],
  ["audience-sync", "paid-traffic"],
];

export const GRAB_RADIUS = 8;

const ZONES = {
  deploy: { x: 0.5, y: 0.08 },
  dataflow: { x: 0.88, y: 0.3 },
  leadflow: { x: 0.12, y: 0.45 },
  offerflow: { x: 0.25, y: 0.82 },
  intelligence: { x: 0.78, y: 0.78 },
} as const;

const NODE_TO_ZONE: Record<string, keyof typeof ZONES> = {
  "deploy-core": "deploy",
  "frontend-layer": "deploy",
  "data-layer": "deploy",
  "job-runner": "deploy",
  "edge-functions": "dataflow",
  "data-bridge": "dataflow",
  "postback-relay": "dataflow",
  "attribution-core": "dataflow",
  "paid-traffic": "leadflow",
  "landing-system": "leadflow",
  "lead-capture": "leadflow",
  "email-system": "leadflow",
  "click-tracker": "offerflow",
  "offer-network": "offerflow",
  "conversion-bridge": "offerflow",
  "payout-router": "offerflow",
  "workflow-engine": "intelligence",
  "command-bot": "intelligence",
  "alert-system": "intelligence",
  "agent-orchestration": "intelligence",
  "agent-core": "intelligence",
  "optimization": "intelligence",
  "profit-monitor": "intelligence",
  "fraud-detection": "intelligence",
  "geo-router": "intelligence",
  "audience-sync": "intelligence",
};

const CENTER_BIAS: Record<string, number> = {
  "agent-core": 0.7,
  "data-layer": 0.5,
  "conversion-bridge": 0.4,
  "attribution-core": 0.3,
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
  z: number;
  centerBias: number;
  targetX: number;
  targetY: number;
};

const BOOT_DURATION = 1500;
const SPRING_REST_LENGTH = 300;
const SPRING_STRENGTH = 0.018;
const REPEL_STRENGTH = 32;
const REPEL_RADIUS = 200;
const ZONE_PULL = 0.018;
const DAMPING = 0.85;
const BOUNDARY = 60;
const BOUNDARY_STRENGTH = 0.8;
const IDLE_VELOCITY_INJECT = 0.012;
const REPEL_MIN_DIST = 30;
const MIN_NODE_DISTANCE = 80;
const RELEASE_VELOCITY_SCALE = 0.35;
const IDLE_INJECT_SPEED_THRESHOLD = 0.6;

function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function placeNodesRandomly(
  nodes: readonly { id: string; label: string }[],
  width: number,
  height: number
): Map<string, { x: number; y: number }> {
  const map = new Map<string, { x: number; y: number }>();
  const marginX = width * 0.075;
  const marginY = height * 0.075;
  const rangeX = width * 0.85;
  const rangeY = height * 0.85;
  nodes.forEach((n) => {
    map.set(n.id, {
      x: marginX + Math.random() * rangeX,
      y: marginY + Math.random() * rangeY,
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
    const targets = placeNodesRandomly(NODES, width, height);

    const states = new Map<string, NodeState>();
    NODES.forEach((n) => {
      const t = targets.get(n.id) ?? { x: cx, y: cy };
      const radius = n.id === "agent-core" || n.id === "deploy-core" ? 6 : 3.5;
      const mass = n.id === "agent-core" || n.id === "deploy-core" ? 1.8 : 1.0;
      const centerBias = CENTER_BIAS[n.id] ?? 0;
      states.set(n.id, {
        id: n.id,
        label: n.label,
        x: cx,
        y: cy,
        vx: 0,
        vy: 0,
        mass,
        radius,
        z: Math.random(),
        centerBias,
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
          const bias = n.centerBias ?? 0;
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
