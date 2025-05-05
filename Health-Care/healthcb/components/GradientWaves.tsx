"use client";

import { motion } from "framer-motion";

const GradientWaves = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Left Side Gradient */}
      <motion.div
        className="absolute left-0 top-0 h-full w-[30%] opacity-10"
        style={{
          background: 'linear-gradient(to right, #79CEED, transparent)',
        }}
        animate={{
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Right Side Gradient */}
      <motion.div
        className="absolute right-0 top-0 h-full w-[30%] opacity-10"
        style={{
          background: 'linear-gradient(to left, #06AFEC, transparent)',
        }}
        animate={{
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Subtle Top Corner Accents */}
      <motion.div
        className="absolute left-0 top-0 h-[300px] w-[300px] opacity-5"
        style={{
          background: 'radial-gradient(circle at top left, #79CEED, transparent)',
        }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute right-0 top-0 h-[300px] w-[300px] opacity-5"
        style={{
          background: 'radial-gradient(circle at top right, #06AFEC, transparent)',
        }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </div>
  );
};

export default GradientWaves;
