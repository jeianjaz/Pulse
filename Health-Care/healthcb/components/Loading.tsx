"use client"; // Ensure it's a client component

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const Loading: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center -ml-8"
      >
        <div className="relative w-48 h-48">
          <Image
            src="/loading.gif"
            alt="Loading"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Loading;
