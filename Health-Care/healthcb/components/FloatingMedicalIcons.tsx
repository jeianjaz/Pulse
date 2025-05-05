"use client";
import { motion } from "framer-motion";
import { Heart, Plus, Stethoscope, Pill, Activity } from "lucide-react";

const FloatingMedicalIcons = () => {
  const icons = [
    { Icon: Heart, delay: 0, x: -20, y: -20 },
    { Icon: Plus, delay: 0.2, x: 20, y: 20 },
    { Icon: Stethoscope, delay: 0.4, x: -30, y: 30 },
    { Icon: Pill, delay: 0.6, x: 30, y: -30 },
    { Icon: Activity, delay: 0.8, x: 0, y: 0 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map(({ Icon, delay, x, y }, index) => (
        <motion.div
          key={index}
          className="absolute"
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            x: [x, x + 10, x],
            y: [y, y - 10, y],
          }}
          transition={{
            duration: 4,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            left: `${25 + Math.random() * 50}%`,
            top: `${25 + Math.random() * 50}%`,
          }}
        >
          <Icon
            className="text-white/50 w-8 h-8 md:w-12 md:h-12"
            strokeWidth={1.5}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingMedicalIcons;
