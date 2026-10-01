"use client";

import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

export function HeroScene() {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), { stiffness: 120, damping: 20 });
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), { stiffness: 120, damping: 20 });
  const shiftX = useSpring(useTransform(mx, [-0.5, 0.5], [12, -12]), { stiffness: 120, damping: 20 });

  return (
    <div
      className="relative [perspective:1400px]"
      onPointerMove={(e) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        <motion.div
          style={{ x: shiftX, z: 40 }}
          className="relative [mask-image:linear-gradient(to_right,transparent,black_12%,black_96%,transparent),linear-gradient(to_bottom,black_88%,transparent)] [mask-composite:intersect]"
        >
          <Image
            src="/art/hero-scene.jpg"
            alt="Marketer checking Neptune brand-visibility metrics at a Mediterranean terrace"
            width={1064}
            height={848}
            priority
            className="art h-auto w-full"
          />
          {/* Night: moonlit blue wash + soft warm lamp glow near the laptop */}
          <div className="pointer-events-none absolute inset-0 bg-[#0b1d45] opacity-0 mix-blend-multiply transition-opacity duration-700 dark:opacity-60" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_48%_72%,rgb(255_200_120/0.35),transparent_35%)] opacity-0 mix-blend-screen transition-opacity duration-700 dark:opacity-100" />
        </motion.div>
      </motion.div>
    </div>
  );
}
