"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";

type Fly = { left: number; top: number; size: number; blur: number; dx: number; dy: number; drift: number; pulse: number; delay: number };

// Three depth layers: far = small, blurred, slow parallax; near = big, sharp, fast parallax.
const LAYERS = [
  { count: 22, size: [1.5, 2.5], blur: 1.2, parallax: 8 },
  { count: 16, size: [2.5, 4], blur: 0.4, parallax: 22 },
  { count: 8, size: [4, 6], blur: 0, parallax: 45 },
];

function makeFlies(count: number, [min, max]: number[], blur: number): Fly[] {
  return Array.from({ length: count }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: min + Math.random() * (max - min),
    blur,
    dx: 20 + Math.random() * 60,
    dy: 15 + Math.random() * 45,
    drift: 9 + Math.random() * 14,
    pulse: 2 + Math.random() * 3,
    delay: -Math.random() * 20,
  }));
}

function Layer({ flies, parallax, mx, my }: { flies: Fly[]; parallax: number; mx: MotionValue<number>; my: MotionValue<number> }) {
  const x = useSpring(useTransform(mx, [-0.5, 0.5], [parallax, -parallax]), { stiffness: 40, damping: 20 });
  const y = useSpring(useTransform(my, [-0.5, 0.5], [parallax, -parallax]), { stiffness: 40, damping: 20 });
  return (
    <motion.div className="absolute inset-[-5%]" style={{ x, y }}>
      {flies.map((f, i) => (
        <span
          key={i}
          className="firefly"
          style={
            {
              left: `${f.left}%`,
              top: `${f.top}%`,
              width: f.size,
              height: f.size,
              filter: f.blur ? `blur(${f.blur}px)` : undefined,
              "--dx": `${f.dx}px`,
              "--dy": `${f.dy}px`,
              "--drift": `${f.drift}s`,
              "--pulse": `${f.pulse}s`,
              "--delay": `${f.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </motion.div>
  );
}

export function Fireflies() {
  const [layers, setLayers] = useState<Fly[][] | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  useEffect(() => {
    // Random positions are generated client-side only to avoid hydration mismatches.
    setLayers(LAYERS.map((l) => makeFlies(l.count, l.size, l.blur)));
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my]);

  if (!layers) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-30 hidden overflow-hidden dark:block">
      {layers.map((flies, i) => (
        <Layer key={i} flies={flies} parallax={LAYERS[i].parallax} mx={mx} my={my} />
      ))}
    </div>
  );
}
