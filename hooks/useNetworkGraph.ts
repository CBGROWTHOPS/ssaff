"use client";

import { useRef, useState, useEffect, useCallback } from "react";

// Real SSAFF brain nodes — from Obsidian knowledge graph
export const NODES = [
  { id: "SSAFF Home", label: "SSAFF" },
  { id: "Layer 0 — Command", label: "Command" },
  { id: "Layer 1 — Orchestrators", label: "Orchestrators" },
  { id: "Layer 2 — Production", label: "Production" },
  { id: "Layer 3 — Monitoring", label: "Monitoring" },
  { id: "Layer 4 — Infrastructure", label: "Infrastructure" },
  { id: "cos", label: "CoS" },
  { id: "creative-agent", label: "Creative Agent" },
  { id: "media-buyer-agent", label: "Media Buyer" },
  { id: "analytics-agent", label: "Analytics" },
  { id: "research-agent", label: "Research" },
  { id: "seo-agent", label: "SEO" },
  { id: "email-agent", label: "Email" },
  { id: "growth-agent", label: "Growth" },
  { id: "brand-agent", label: "Brand" },
  { id: "social-agent", label: "Social" },
  { id: "video-agent", label: "Video" },
  { id: "doc-agent", label: "Docs" },
  { id: "generate-ad-creative", label: "Ad Creative" },
  { id: "daily-briefing", label: "Daily Brief" },
  { id: "daily-optimization", label: "Optimization" },
  { id: "analytics-pipeline", label: "Analytics Pipeline" },
  { id: "creative-refresh", label: "Creative Refresh" },
  { id: "content-repurpose", label: "Content Repurpose" },
  { id: "weekly-learning", label: "Learning" },
  { id: "warehouse-analytics", label: "Warehouse" },
  { id: "knowledge-system", label: "Knowledge" },
  { id: "learning-system", label: "Learning System" },
  { id: "bdn", label: "BDN" },
  { id: "gth", label: "GTH" },
  { id: "fxg", label: "FXG" },
  { id: "autonomy-rules", label: "Autonomy" },
  { id: "constitution", label: "Constitution" },
  { id: "thresholds", label: "Thresholds" },
  { id: "human-in-the-loop", label: "Human Loop" },
  { id: "conversion-postback-chain", label: "Postback Chain" },
  { id: "audience-intelligence", label: "Audience Intel" },
  { id: "competitor-monitoring", label: "Competitor Watch" },
  { id: "Products", label: "Products" },
] as const;

// Real SSAFF brain connections — from Obsidian [[wiki-links]]
export const EDGES: [string, string][] = [
  // SSAFF Home hub
  ["SSAFF Home", "Layer 0 — Command"], ["SSAFF Home", "Layer 1 — Orchestrators"],
  ["SSAFF Home", "Layer 2 — Production"], ["SSAFF Home", "Layer 3 — Monitoring"],
  ["SSAFF Home", "Layer 4 — Infrastructure"], ["SSAFF Home", "Products"],
  // Command layer
  ["Layer 0 — Command", "cos"], ["Layer 0 — Command", "human-in-the-loop"],
  ["Layer 0 — Command", "constitution"], ["Layer 0 — Command", "autonomy-rules"],
  // Orchestrators
  ["Layer 1 — Orchestrators", "cos"], ["Layer 1 — Orchestrators", "daily-briefing"],
  // Production agents
  ["Layer 2 — Production", "creative-agent"], ["Layer 2 — Production", "media-buyer-agent"],
  ["Layer 2 — Production", "seo-agent"], ["Layer 2 — Production", "email-agent"],
  ["Layer 2 — Production", "social-agent"], ["Layer 2 — Production", "video-agent"],
  ["Layer 2 — Production", "research-agent"], ["Layer 2 — Production", "growth-agent"],
  ["Layer 2 — Production", "brand-agent"],
  // Monitoring
  ["Layer 3 — Monitoring", "analytics-agent"], ["Layer 3 — Monitoring", "analytics-pipeline"],
  // Infrastructure
  ["Layer 4 — Infrastructure", "warehouse-analytics"], ["Layer 4 — Infrastructure", "knowledge-system"],
  ["Layer 4 — Infrastructure", "learning-system"],
  // CoS connections
  ["cos", "daily-briefing"], ["cos", "weekly-learning"], ["cos", "analytics-pipeline"],
  ["cos", "knowledge-system"],
  // Creative agent
  ["creative-agent", "generate-ad-creative"], ["creative-agent", "creative-refresh"],
  ["creative-agent", "content-repurpose"], ["creative-agent", "bdn"], ["creative-agent", "gth"],
  // Media buyer
  ["media-buyer-agent", "daily-optimization"], ["media-buyer-agent", "creative-refresh"],
  ["media-buyer-agent", "bdn"], ["media-buyer-agent", "gth"], ["media-buyer-agent", "fxg"],
  ["media-buyer-agent", "warehouse-analytics"], ["media-buyer-agent", "thresholds"],
  // Analytics
  ["analytics-agent", "analytics-pipeline"], ["analytics-agent", "warehouse-analytics"],
  // Research
  ["research-agent", "audience-intelligence"], ["research-agent", "competitor-monitoring"],
  // Email
  ["email-agent", "bdn"], ["email-agent", "gth"],
  // Growth
  ["growth-agent", "bdn"], ["growth-agent", "gth"],
  // Brand connections
  ["bdn", "generate-ad-creative"], ["bdn", "daily-optimization"],
  ["gth", "generate-ad-creative"],
  // Knowledge & learning
  ["knowledge-system", "learning-system"], ["knowledge-system", "warehouse-analytics"],
  ["learning-system", "weekly-learning"],
  // Governance
  ["autonomy-rules", "thresholds"], ["autonomy-rules", "human-in-the-loop"],
  ["constitution", "autonomy-rules"],
  // Workflows
  ["daily-briefing", "analytics-pipeline"], ["daily-optimization", "warehouse-analytics"],
  ["generate-ad-creative", "creative-refresh"],
  ["conversion-postback-chain", "media-buyer-agent"],
];

export const GRAB_RADIUS = 12;

export const LABELS_ALWAYS_VISIBLE: readonly string[] = [
  "SSAFF Home", "cos", "creative-agent", "media-buyer-agent", "bdn", "gth",
  "Layer 0 — Command", "Layer 2 — Production", "knowledge-system",
];

export const NODE_TYPES = {
  core: ["SSAFF Home", "creative-agent", "media-buyer-agent", "generate-ad-creative", "analytics-pipeline", "daily-briefing", "bdn", "warehouse-analytics", "creative-refresh"],
  primary: ["cos", "content-repurpose", "knowledge-system", "Layer 1 — Orchestrators", "weekly-learning", "autonomy-rules", "thresholds", "email-agent", "gth", "Layer 0 — Command", "analytics-agent", "brand-agent", "growth-agent", "learning-system", "Layer 2 — Production", "daily-optimization", "human-in-the-loop", "constitution", "doc-agent"],
  peripheral: ["Layer 4 — Infrastructure", "research-agent", "seo-agent", "social-agent", "video-agent", "Layer 3 — Monitoring", "Products", "fxg", "audience-intelligence", "competitor-monitoring", "conversion-postback-chain"],
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

// Formation timing: 0–1.5s drift, 1.5–4s ramp gravity, 4–6s stabilize
const BOOT_DURATION = 6000;
const DRIFT_UNTIL = 1500;      // ms with near-zero center gravity
const RAMP_UNTIL = 4000;       // ms when gravity reaches max
const CENTER_ATTRACTION_MIN = 0.01;
const CENTER_ATTRACTION_MAX = 0.025;
const SPRING_REST_LENGTH = 200;
const SPRING_STRENGTH = 0.006;
const REPEL_STRENGTH = 140;     // more spacing between nodes
const REPEL_RADIUS = 420;
const CENTER_ATTRACTION = 0.018;
const DAMPING = 0.9;
const BOUNDARY = 60;
const BOUNDARY_STRENGTH = 0.8;
const IDLE_VELOCITY_INJECT = 0.002;   // 1–2 px every few seconds
const REPEL_MIN_DIST = 28;
const MIN_NODE_DISTANCE = 95;
const RELEASE_VELOCITY_SCALE = 0.35;
const IDLE_INJECT_SPEED_THRESHOLD = 0.15;  // inject when nearly still

function placeNodesScattered(
  width: number,
  height: number
): Map<string, { x: number; y: number }> {
  const map = new Map<string, { x: number; y: number }>();
  const cx = width / 2;
  const cy = height / 2;
  const spread = Math.min(width, height) * 0.48;
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
    const radiusByType = { core: 8, primary: 5, peripheral: 2.5 };
    const massByType = { core: 2, primary: 1.2, peripheral: 0.7 };
    NODES.forEach((n) => {
      const pos = positions.get(n.id) ?? { x: cx, y: cy };
      const nodeType = getNodeType(n.id);
      states.set(n.id, {
        id: n.id,
        label: n.label,
        x: pos.x,
        y: pos.y,
        vx: (Math.random() - 0.5) * 2.5,
        vy: (Math.random() - 0.5) * 2.5,
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

      if (phase === "boot" && bootStart.current === null) bootStart.current = now;
      const bootElapsed = phase === "boot" && bootStart.current !== null ? now - bootStart.current : 0;

      let centerPull = CENTER_ATTRACTION;
      if (phase === "boot" && bootStart.current !== null) {
        if (bootElapsed < DRIFT_UNTIL) {
          centerPull = 0.005;  // near-zero, drift randomly
        } else if (bootElapsed < RAMP_UNTIL) {
          const t = (bootElapsed - DRIFT_UNTIL) / (RAMP_UNTIL - DRIFT_UNTIL);
          centerPull = CENTER_ATTRACTION_MIN + t * (CENTER_ATTRACTION_MAX - CENTER_ATTRACTION_MIN);
        } else {
          centerPull = CENTER_ATTRACTION_MAX;
        }
      }

      if (phase === "boot" && bootElapsed >= BOOT_DURATION) {
        setPhase("idle");
        bootStart.current = null;
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
        const elapsed = bootElapsed;
        const inDriftPhase = phase === "boot" && elapsed < DRIFT_UNTIL;
        const inIdlePhase = phase === "idle" && speed < IDLE_INJECT_SPEED_THRESHOLD;
        if (inDriftPhase) {
          n.vx += (Math.random() - 0.5) * 0.12;
          n.vy += (Math.random() - 0.5) * 0.12;
        } else if (inIdlePhase) {
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
