"use client";

import { MotionValue, motion, useScroll, useTransform } from "framer-motion";

type Progress = ReturnType<typeof useScroll>["scrollYProgress"];

type LayerDef = {
  src: string;
  poster: string;
  opacityStops: { input: number[]; output: number[] };
  overlay: string;
};

const layers: LayerDef[] = [
  {
    src: "/video/hero.mp4",
    poster: "/video/hero-poster.jpg",
    opacityStops: { input: [0, 0.2, 0.35], output: [1, 1, 0] },
    overlay:
      "linear-gradient(180deg, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.30) 50%, rgba(0,0,0,0.55) 100%)",
  },
  {
    src: "/video/hero2.mp4",
    poster: "/video/hero2-poster.jpg",
    opacityStops: {
      input: [0.2, 0.35, 0.55, 0.75],
      output: [0, 1, 1, 0],
    },
    overlay:
      "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.30) 50%, rgba(0,0,0,0.55) 100%)",
  },
  {
    src: "/video/hero3.mp4",
    poster: "/video/hero3-poster.jpg",
    opacityStops: { input: [0.55, 0.75, 1], output: [0, 1, 1] },
    overlay:
      "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.42) 50%, rgba(0,0,0,0.62) 100%)",
  },
];

function Layer({
  src,
  poster,
  overlay,
  opacity,
}: {
  src: string;
  poster: string;
  overlay: string;
  opacity: MotionValue<number>;
}) {
  return (
    <motion.div
      style={{
        opacity,
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={poster}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      >
        <source src={src} type="video/mp4" />
      </video>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: overlay,
          pointerEvents: "none",
        }}
      />
    </motion.div>
  );
}

export default function VideoBackground({ progress }: { progress: Progress }) {
  const o0 = useTransform(progress, layers[0].opacityStops.input, layers[0].opacityStops.output);
  const o1 = useTransform(progress, layers[1].opacityStops.input, layers[1].opacityStops.output);
  const o2 = useTransform(progress, layers[2].opacityStops.input, layers[2].opacityStops.output);
  const opacities = [o0, o1, o2];

  return (
    <>
      {layers.map((l, i) => (
        <Layer
          key={l.src}
          src={l.src}
          poster={l.poster}
          overlay={l.overlay}
          opacity={opacities[i]}
        />
      ))}
    </>
  );
}
