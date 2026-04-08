"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Agent nodes in 3D space
const AGENT_NODES = [
  { id: "ssaff", label: "SSAFF", pos: [0, 0, 0], type: "core" as const },
  { id: "cos", label: "CoS", pos: [0.15, 0.25, 0.3], type: "agent" as const },
  { id: "creative", label: "Creative Agent", pos: [-0.5, 0.5, 0.9], type: "agent" as const },
  { id: "media", label: "Media Buyer", pos: [0.3, 0.7, 0.8], type: "agent" as const },
  { id: "adcreative", label: "Ad Creative", pos: [-0.7, 0.2, 0.7], type: "system" as const },
  { id: "refresh", label: "Refresh", pos: [-0.2, 0.4, 0.6], type: "dot" as const },
  { id: "bdn", label: "BDN", pos: [-0.3, 1.1, 0.2], type: "system" as const },
  { id: "gth", label: "GTH", pos: [0.1, 1.15, -0.1], type: "system" as const },
  { id: "fxg", label: "FXG", pos: [0.5, 1.05, -0.3], type: "system" as const },
  { id: "briefing", label: "Daily Brief", pos: [0.4, 0.8, 0.1], type: "system" as const },
  { id: "optimization", label: "Optimization", pos: [0.6, 0.6, -0.2], type: "dot" as const },
  { id: "analytics", label: "Analytics", pos: [0.5, 0.4, -0.8], type: "agent" as const },
  { id: "pipeline", label: "Pipeline", pos: [0.7, 0.1, -0.9], type: "dot" as const },
  { id: "research", label: "Research", pos: [0.4, -0.1, -1.0], type: "agent" as const },
  { id: "metaads", label: "Meta Ads", pos: [0.6, -0.3, -0.9], type: "system" as const },
  { id: "googleads", label: "Google Ads", pos: [0.8, 0.2, -0.7], type: "system" as const },
  { id: "email", label: "Email", pos: [-0.8, -0.3, 0.5], type: "agent" as const },
  { id: "social", label: "Social", pos: [-0.9, 0.0, 0.4], type: "agent" as const },
  { id: "seo", label: "SEO", pos: [-0.85, 0.15, 0.2], type: "agent" as const },
  { id: "video", label: "Video", pos: [-0.6, -0.5, 0.3], type: "dot" as const },
  { id: "brand", label: "Brand", pos: [-0.4, -0.4, 0.1], type: "dot" as const },
  { id: "growth", label: "Growth", pos: [-0.2, -0.3, 0.2], type: "agent" as const },
  { id: "policy", label: "Policy", pos: [-0.8, 0.3, 0.5], type: "dot" as const },
  { id: "guardrails", label: "Guardrails", pos: [-0.7, 0.5, 0.6], type: "dot" as const },
  { id: "thresholds", label: "Thresholds", pos: [-0.4, 0.1, 0.4], type: "dot" as const },
  { id: "supabase", label: "Supabase", pos: [0.3, -0.7, -0.6], type: "system" as const },
  { id: "gemini", label: "Gemini", pos: [0.0, -0.8, -0.5], type: "system" as const },
  { id: "claude", label: "Claude", pos: [0.5, -0.9, -0.4], type: "system" as const },
  { id: "learning", label: "Learning", pos: [0.2, -0.5, -0.7], type: "dot" as const },
  { id: "slack", label: "Slack", pos: [0.0, -1.1, 0.0], type: "system" as const },
  { id: "stripe", label: "Stripe", pos: [0.2, -0.9, -0.1], type: "system" as const },
];

const EDGES: [string, string][] = [
  ["ssaff", "cos"], ["ssaff", "slack"],
  ["cos", "creative"], ["cos", "media"], ["cos", "analytics"],
  ["cos", "research"], ["cos", "email"], ["cos", "briefing"],
  ["cos", "learning"], ["cos", "gemini"],
  ["creative", "adcreative"], ["creative", "refresh"], ["creative", "bdn"], ["creative", "gth"],
  ["media", "optimization"], ["media", "refresh"], ["media", "bdn"], ["media", "gth"],
  ["media", "fxg"], ["media", "supabase"], ["media", "thresholds"],
  ["analytics", "pipeline"], ["analytics", "supabase"],
  ["research", "metaads"], ["research", "googleads"],
  ["email", "bdn"], ["email", "gth"], ["growth", "bdn"], ["growth", "gth"],
  ["gemini", "claude"], ["gemini", "supabase"], ["claude", "learning"],
  ["guardrails", "thresholds"], ["guardrails", "policy"],
  ["briefing", "pipeline"], ["optimization", "supabase"],
  ["adcreative", "refresh"], ["stripe", "media"],
  ["ssaff", "growth"], ["ssaff", "policy"],
];

const TEAL = new THREE.Color(0, 190 / 255, 170 / 255);
const BLUE = new THREE.Color(65 / 255, 140 / 255, 235 / 255);
const PURPLE = new THREE.Color(145 / 255, 80 / 255, 200 / 255);

function colorAtY(t: number): THREE.Color {
  const c = new THREE.Color();
  if (t < 0.5) return c.copy(TEAL).lerp(BLUE, t / 0.5);
  return c.copy(BLUE).lerp(PURPLE, (t - 0.5) / 0.5);
}

export default function BrainGraph() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dark background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#060608");

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, -0.3, 7.5);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.target.set(0, 0, 0);

    let brainGroup: THREE.Group | null = null;
    let nodesGroup: THREE.Group | null = null;
    const nodeMeshes = new Map<string, THREE.Mesh>();

    const loader = new GLTFLoader();
    loader.load("/brain.glb", (gltf) => {
      const group = new THREE.Group();

      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry) {
          const geo = child.geometry;
          const pos = geo.attributes.position;
          let minY = Infinity, maxY = -Infinity;
          for (let i = 0; i < pos.count; i++) {
            const y = pos.getY(i);
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }

          const colors = new Float32Array(pos.count * 3);
          const tmpColor = new THREE.Color();
          for (let i = 0; i < pos.count; i++) {
            const t = (pos.getY(i) - minY) / (maxY - minY || 1);
            tmpColor.copy(t < 0.5 ? TEAL : BLUE).lerp(t < 0.5 ? BLUE : PURPLE, t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5);
            colors[i * 3] = tmpColor.r;
            colors[i * 3 + 1] = tmpColor.g;
            colors[i * 3 + 2] = tmpColor.b;
          }
          geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

          // Wireframe
          group.add(new THREE.Mesh(geo.clone(), new THREE.MeshBasicMaterial({
            wireframe: true, vertexColors: true, transparent: true, opacity: 0.25,
          })));

          // Faint solid fill
          group.add(new THREE.Mesh(geo.clone(), new THREE.MeshBasicMaterial({
            vertexColors: true, transparent: true, opacity: 0.03, side: THREE.DoubleSide, depthWrite: false,
          })));
        }
      });

      // Center and scale
      const box = new THREE.Box3().setFromObject(group);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const scale = 3 / Math.max(size.x, size.y, size.z);
      group.position.sub(center.multiplyScalar(scale));
      group.scale.setScalar(scale);
      const box2 = new THREE.Box3().setFromObject(group);
      group.position.sub(box2.getCenter(new THREE.Vector3()));

      // ── Agent nodes (original style: small spheres with glow) ──
      const nGroup = new THREE.Group();
      AGENT_NODES.forEach((n) => {
        const yNorm = (n.pos[1] + 1.2) / 2.4;
        const col = colorAtY(yNorm);

        if (n.type === "core") {
          // === ARC REACTOR CORE ===
          const coreColor = new THREE.Color(0.3, 0.8, 1.0);
          const coreWhite = new THREE.Color(0.85, 0.95, 1.0);
          const corePos = new THREE.Vector3(n.pos[0], n.pos[1], n.pos[2]);

          // Core: gradient sphere (transparent center → colored edge) + pulse
          const coreShader = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false,
            uniforms: { uColor: { value: coreColor }, uTime: { value: 0.0 } },
            vertexShader: `varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
            fragmentShader: `uniform vec3 uColor; uniform float uTime; varying vec3 vNormal; void main() { float edge = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))); edge = pow(edge, 1.2); float pulse = 0.7 + 0.3 * sin(uTime * 2.5); gl_FragColor = vec4(uColor * 1.3, edge * pulse); }`,
          });
          coreShader.userData.isCoreShader = true;
          const centerMesh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 32, 32), coreShader);
          centerMesh.position.copy(corePos);
          nGroup.add(centerMesh);
          nodeMeshes.set(n.id, centerMesh);

          // Inner pulse glow
          const innerShader = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false,
            uniforms: { uColor: { value: coreColor }, uTime: { value: 0.0 } },
            vertexShader: `varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
            fragmentShader: `uniform vec3 uColor; uniform float uTime; varying vec3 vNormal; void main() { float edge = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))); edge = pow(edge, 1.8); float pulse = 0.5 + 0.5 * sin(uTime * 2.0); gl_FragColor = vec4(uColor, edge * 0.5 * pulse); }`,
          });
          innerShader.userData.isCoreShader = true;
          const innerGlow = new THREE.Mesh(new THREE.SphereGeometry(0.30, 24, 24), innerShader);
          innerGlow.position.copy(corePos);
          nGroup.add(innerGlow);

          // Outer pulse haze
          const outerShader = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false,
            uniforms: { uColor: { value: coreColor }, uTime: { value: 0.0 } },
            vertexShader: `varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
            fragmentShader: `uniform vec3 uColor; uniform float uTime; varying vec3 vNormal; void main() { float edge = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))); edge = pow(edge, 2.5); float pulse = 0.4 + 0.6 * sin(uTime * 1.5 + 0.5); gl_FragColor = vec4(uColor, edge * 0.2 * pulse); }`,
          });
          outerShader.userData.isCoreShader = true;
          const outerGlow = new THREE.Mesh(new THREE.SphereGeometry(0.50, 16, 16), outerShader);
          outerGlow.position.copy(corePos);
          nGroup.add(outerGlow);

        } else {
          // Gradient node: transparent center → colored edges
          const isAgent = n.type === "agent";
          const isSystem = n.type === "system";
          const r = isAgent ? 0.05 : isSystem ? 0.035 : 0.018;

          const nodeShaderMat = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            uniforms: {
              uColor: { value: col },
              uOpacity: { value: isAgent ? 0.85 : isSystem ? 0.65 : 0.35 },
            },
            vertexShader: `
              varying vec3 vNormal;
              varying vec3 vPosition;
              void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `,
            fragmentShader: `
              uniform vec3 uColor;
              uniform float uOpacity;
              varying vec3 vNormal;
              varying vec3 vPosition;
              void main() {
                float edge = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
                edge = pow(edge, 1.5);
                gl_FragColor = vec4(uColor, edge * uOpacity);
              }
            `,
          });

          const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 24), nodeShaderMat);
          mesh.position.set(n.pos[0], n.pos[1], n.pos[2]);
          nGroup.add(mesh);
          nodeMeshes.set(n.id, mesh);

        }
      });
      group.add(nGroup);
      nodesGroup = nGroup;

      // ── Edge lines ──
      const eGroup = new THREE.Group();
      EDGES.forEach(([aId, bId]) => {
        const a = AGENT_NODES.find((nn) => nn.id === aId);
        const b = AGENT_NODES.find((nn) => nn.id === bId);
        if (!a || !b) return;

        const from = new THREE.Vector3(a.pos[0], a.pos[1], a.pos[2]);
        const to = new THREE.Vector3(b.pos[0], b.pos[1], b.pos[2]);
        const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5 * 0.85);
        const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
        const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(20));

        const yA = (a.pos[1] + 1.2) / 2.4;
        const mat = new THREE.LineBasicMaterial({ color: colorAtY(yA), transparent: true, opacity: 0.12 });
        eGroup.add(new THREE.Line(geo, mat));
      });
      group.add(eGroup);

      scene.add(group);
      brainGroup = group;
      controls.target.set(0, 0, 0);
      controls.update();
    });

    // ── HTML Labels ──
    const labelDiv = document.createElement("div");
    labelDiv.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:10;";
    container.appendChild(labelDiv);

    const labelEls = new Map<string, HTMLDivElement>();
    AGENT_NODES.forEach((n) => {
      if (n.type === "dot") return;
      const el = document.createElement("div");
      el.textContent = n.label;
      const color = n.type === "core" ? "rgba(160,230,255,1)" : "rgba(180,215,255,0.85)";
      const font = n.type === "core" ? "600 12px" : "500 10px";
      el.style.cssText = `position:absolute;font:${font} system-ui,sans-serif;color:${color};white-space:nowrap;transform:translate(-50%,8px);`;
      labelDiv.appendChild(el);
      labelEls.set(n.id, el);
    });

    // ── Animation ──
    let animId: number;
    const clock = new THREE.Clock();
    const tmpV = new THREE.Vector3();

    function animate() {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (brainGroup) {
        brainGroup.rotation.y += 0.002;

        // Pulse wireframe opacity
        brainGroup.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial && child.material.wireframe) {
            child.material.opacity = 0.22 + Math.sin(elapsed * 0.5) * 0.06;
          }
        });

        // Core pulse — update shader time uniforms
        if (nodesGroup) {
          nodesGroup.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial && child.material.userData?.isCoreShader) {
              child.material.uniforms.uTime.value = elapsed;
            }
          });
        }

        // Core scale breathing
        const coreNode = nodeMeshes.get("ssaff");
        if (coreNode) {
          const s = 1 + Math.sin(elapsed * 1.5) * 0.08;
          coreNode.scale.setScalar(s);
        }

        // Face camera for arc reactor elements
        if (nodesGroup) {
          nodesGroup.traverse((child) => {
            if ((child as any).userData?.isArcRing) {
              child.lookAt(camera.position);
              const idx = (child as any).userData?.ringIndex || 0;
              if (idx > 0) child.rotateZ(elapsed * 0.0005 * (idx % 2 === 0 ? 1 : -1));
            } else if (child instanceof THREE.Mesh && child.geometry instanceof THREE.RingGeometry) {
              child.lookAt(camera.position);
            }
          });
        }

        // Update labels
        nodeMeshes.forEach((mesh, id) => {
          mesh.getWorldPosition(tmpV);
          const el = labelEls.get(id);
          if (el) {
            const projected = tmpV.clone().project(camera);
            if (projected.z > 1) {
              el.style.display = "none";
            } else {
              el.style.display = "";
              el.style.left = `${(projected.x * 0.5 + 0.5) * window.innerWidth}px`;
              el.style.top = `${(-projected.y * 0.5 + 0.5) * window.innerHeight}px`;
              const depthFade = Math.max(0.15, Math.min(1, 1 - projected.z * 0.4));
              const node = AGENT_NODES.find(nn => nn.id === id);
              el.style.opacity = `${(node?.type === "core" ? 1 : 0.8) * depthFade}`;
            }
          }
        });
      }

      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      if (container.contains(labelDiv)) container.removeChild(labelDiv);
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 z-0" />;
}
