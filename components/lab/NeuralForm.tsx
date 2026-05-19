"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const CORAL = "#F0594B";
const INK = "#16161A";

function deviceProfile() {
  if (typeof window === "undefined") return { count: 3600, calm: false };
  const reduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const small = window.innerWidth < 768;
  return {
    count: small ? 2000 : 3600,
    calm: reduced,
  };
}

/** Fibonacci sphere with low-frequency lobe displacement → organic, brain-ish. */
function buildPoints(count: number) {
  const base = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    let x = Math.cos(theta) * r;
    let z = Math.sin(theta) * r;
    let yy = y;
    const lobe =
      1 +
      0.18 * Math.sin(yy * 3.0) +
      0.12 * Math.cos(x * 4.0) * Math.sin(z * 2.0);
    x *= lobe;
    yy *= lobe * 0.92;
    z *= lobe;
    base[i * 3] = x * 1.35;
    base[i * 3 + 1] = yy * 1.35;
    base[i * 3 + 2] = z * 1.35;
  }
  return base;
}

function Form({
  progress,
  count,
  calm,
}: {
  progress: RefObject<number>;
  count: number;
  calm: boolean;
}) {
  const pts = useRef<THREE.Points>(null);
  const core = useRef<THREE.Mesh>(null);
  const base = useMemo(() => buildPoints(count), [count]);
  const positions = useMemo(() => base.slice(), [base]);
  const amp = calm ? 0.45 : 1;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = Math.min(1, Math.max(0, progress.current ?? 0));

    // Beat centers (mirror of BEATS mid-points in app/page.tsx). The form is
    // ASSEMBLED on a beat and blooms apart only in the gaps between them, so
    // reassembly always lands exactly as the text settles — never before it.
    const ANCHORS = [0.09, 0.4, 0.72, 0.94];
    let d = 1;
    for (const a of ANCHORS) d = Math.min(d, Math.abs(p - a));
    const norm = Math.min(1, Math.max(0, (d - 0.04) / 0.16));
    const smooth = norm * norm * (3 - 2 * norm); // smoothstep
    const breathe = 0.035 * (0.5 + 0.5 * Math.sin(t * 0.45));
    const explode = (smooth + breathe) * amp;

    const geo = pts.current?.geometry;
    if (geo) {
      const arr = geo.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const j = i * 3;
        const swirl = 0.35 * explode * Math.sin(t * 0.6 + i * 0.15);
        const push = 1 + explode * (1.1 + 0.5 * Math.sin(i)) + swirl;
        arr[j] = base[j] * push;
        arr[j + 1] = base[j + 1] * push;
        arr[j + 2] = base[j + 2] * push;
      }
      geo.attributes.position.needsUpdate = true;
    }

    if (pts.current) {
      pts.current.rotation.y = t * 0.12 * amp + p * Math.PI * 0.6;
      pts.current.rotation.x = p * 0.4 - 0.1;
      (pts.current.material as THREE.PointsMaterial).opacity =
        0.55 - explode * 0.25;
    }

    if (core.current) {
      const pulse = 1 + 0.06 * Math.sin(t * 2.2);
      core.current.scale.setScalar((0.18 + explode * 0.22) * pulse);
      core.current.rotation.y = -t * 0.3;
      (core.current.material as THREE.MeshBasicMaterial).opacity =
        explode * 0.9;
    }
  });

  return (
    <group>
      <points ref={pts}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.014}
          color={INK}
          transparent
          opacity={0.55}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      <mesh ref={core}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color={CORAL} transparent opacity={0} />
      </mesh>
    </group>
  );
}

export default function NeuralForm({
  progress,
}: {
  progress: RefObject<number>;
}) {
  const { count, calm } = useMemo(deviceProfile, []);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(10px)",
        transition:
          "opacity 900ms cubic-bezier(0.16,1,0.3,1), transform 900ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 42 }}
        dpr={[1, 1.6]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Form progress={progress} count={count} calm={calm} />
      </Canvas>
    </div>
  );
}
