"use client";

import { motion } from "motion/react";

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: 2.5,
        ease: [0.43, 0.13, 0.23, 0.96] as [number, number, number, number],
      },
      opacity: { duration: 0.5 },
    },
  },
};

export function HandWrittenQuote() {
  return (
    <div className="relative flex min-h-[205px] w-full items-center justify-center px-3 py-8 xl:min-h-[250px]">
      <motion.svg
        aria-hidden="true"
        width="100%"
        height="100%"
        viewBox="0 0 1200 600"
        initial="hidden"
        animate="visible"
        className="pointer-events-none absolute inset-0 h-full w-full text-[#FC521E]"
      >
        <motion.path
          d="M 950 90 C 1250 300, 1050 480, 600 520 C 250 520, 150 480, 150 300 C 150 120, 350 80, 600 80 C 850 80, 950 180, 950 180"
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={draw}
        />
      </motion.svg>

      <motion.blockquote
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="relative z-10 mx-auto max-w-[300px] text-center font-display text-[clamp(1rem,1.35vw,1.55rem)] font-medium leading-[1.35] tracking-[-0.025em] text-[#F0F7F6]"
      >
        “The best games become part of your personal mythology.”
      </motion.blockquote>
    </div>
  );
}
