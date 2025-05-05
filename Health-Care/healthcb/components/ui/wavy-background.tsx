"use client";

import React from "react";
import { motion } from "framer-motion";

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors = ["#c4b5fd", "#818cf8", "#38bdf8", "#22d3ee"],
  waveWidth = 50,
  backgroundFill = "transparent",
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
  [key: string]: any;
}) => {
  const speedMap = {
    slow: 15,
    fast: 25,
  };

  const waveSpeed = speedMap[speed];

  return (
    <div
      className={`relative flex flex-col items-center justify-center overflow-hidden ${containerClassName}`}
      {...props}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        style={{
          filter: `blur(${blur}px)`,
          opacity: waveOpacity,
        }}
        viewBox="0 0 1000 1000"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d={`M 0 500 Q ${waveWidth} ${500 + waveSpeed} ${waveWidth * 2} 500 T ${
            waveWidth * 4
          } 500 T ${waveWidth * 6} 500 T ${waveWidth * 8} 500 T ${
            waveWidth * 10
          } 500 T ${waveWidth * 12} 500 T ${waveWidth * 14} 500 T ${
            waveWidth * 16
          } 500 T ${waveWidth * 18} 500 T ${waveWidth * 20} 500 V 1000 H 0 Z`}
          fill={colors[0]}
          animate={{
            d: [
              `M 0 500 Q ${waveWidth} ${500 + waveSpeed} ${
                waveWidth * 2
              } 500 T ${waveWidth * 4} 500 T ${waveWidth * 6} 500 T ${
                waveWidth * 8
              } 500 T ${waveWidth * 10} 500 T ${waveWidth * 12} 500 T ${
                waveWidth * 14
              } 500 T ${waveWidth * 16} 500 T ${waveWidth * 18} 500 T ${
                waveWidth * 20
              } 500 V 1000 H 0 Z`,
              `M 0 500 Q ${waveWidth} ${500 - waveSpeed} ${
                waveWidth * 2
              } 500 T ${waveWidth * 4} 500 T ${waveWidth * 6} 500 T ${
                waveWidth * 8
              } 500 T ${waveWidth * 10} 500 T ${waveWidth * 12} 500 T ${
                waveWidth * 14
              } 500 T ${waveWidth * 16} 500 T ${waveWidth * 18} 500 T ${
                waveWidth * 20
              } 500 V 1000 H 0 Z`,
            ],
          }}
          transition={{
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
            duration: 5,
          }}
        />
        <motion.path
          d={`M 0 500 Q ${waveWidth} ${500 + waveSpeed * 1.2} ${
            waveWidth * 2
          } 500 T ${waveWidth * 4} 500 T ${waveWidth * 6} 500 T ${
            waveWidth * 8
          } 500 T ${waveWidth * 10} 500 T ${waveWidth * 12} 500 T ${
            waveWidth * 14
          } 500 T ${waveWidth * 16} 500 T ${waveWidth * 18} 500 T ${
            waveWidth * 20
          } 500 V 1000 H 0 Z`}
          fill={colors[1]}
          animate={{
            d: [
              `M 0 500 Q ${waveWidth} ${500 + waveSpeed * 1.2} ${
                waveWidth * 2
              } 500 T ${waveWidth * 4} 500 T ${waveWidth * 6} 500 T ${
                waveWidth * 8
              } 500 T ${waveWidth * 10} 500 T ${waveWidth * 12} 500 T ${
                waveWidth * 14
              } 500 T ${waveWidth * 16} 500 T ${waveWidth * 18} 500 T ${
                waveWidth * 20
              } 500 V 1000 H 0 Z`,
              `M 0 500 Q ${waveWidth} ${500 - waveSpeed * 1.2} ${
                waveWidth * 2
              } 500 T ${waveWidth * 4} 500 T ${waveWidth * 6} 500 T ${
                waveWidth * 8
              } 500 T ${waveWidth * 10} 500 T ${waveWidth * 12} 500 T ${
                waveWidth * 14
              } 500 T ${waveWidth * 16} 500 T ${waveWidth * 18} 500 T ${
                waveWidth * 20
              } 500 V 1000 H 0 Z`,
            ],
          }}
          transition={{
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
            duration: 7,
            delay: 0.2,
          }}
        />
        <motion.path
          d={`M 0 500 Q ${waveWidth} ${500 + waveSpeed * 0.8} ${
            waveWidth * 2
          } 500 T ${waveWidth * 4} 500 T ${waveWidth * 6} 500 T ${
            waveWidth * 8
          } 500 T ${waveWidth * 10} 500 T ${waveWidth * 12} 500 T ${
            waveWidth * 14
          } 500 T ${waveWidth * 16} 500 T ${waveWidth * 18} 500 T ${
            waveWidth * 20
          } 500 V 1000 H 0 Z`}
          fill={colors[2]}
          animate={{
            d: [
              `M 0 500 Q ${waveWidth} ${500 + waveSpeed * 0.8} ${
                waveWidth * 2
              } 500 T ${waveWidth * 4} 500 T ${waveWidth * 6} 500 T ${
                waveWidth * 8
              } 500 T ${waveWidth * 10} 500 T ${waveWidth * 12} 500 T ${
                waveWidth * 14
              } 500 T ${waveWidth * 16} 500 T ${waveWidth * 18} 500 T ${
                waveWidth * 20
              } 500 V 1000 H 0 Z`,
              `M 0 500 Q ${waveWidth} ${500 - waveSpeed * 0.8} ${
                waveWidth * 2
              } 500 T ${waveWidth * 4} 500 T ${waveWidth * 6} 500 T ${
                waveWidth * 8
              } 500 T ${waveWidth * 10} 500 T ${waveWidth * 12} 500 T ${
                waveWidth * 14
              } 500 T ${waveWidth * 16} 500 T ${waveWidth * 18} 500 T ${
                waveWidth * 20
              } 500 V 1000 H 0 Z`,
            ],
          }}
          transition={{
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
            duration: 6,
            delay: 0.4,
          }}
        />
        <motion.path
          d={`M 0 500 Q ${waveWidth} ${500 + waveSpeed * 1.5} ${
            waveWidth * 2
          } 500 T ${waveWidth * 4} 500 T ${waveWidth * 6} 500 T ${
            waveWidth * 8
          } 500 T ${waveWidth * 10} 500 T ${waveWidth * 12} 500 T ${
            waveWidth * 14
          } 500 T ${waveWidth * 16} 500 T ${waveWidth * 18} 500 T ${
            waveWidth * 20
          } 500 V 1000 H 0 Z`}
          fill={colors[3]}
          animate={{
            d: [
              `M 0 500 Q ${waveWidth} ${500 + waveSpeed * 1.5} ${
                waveWidth * 2
              } 500 T ${waveWidth * 4} 500 T ${waveWidth * 6} 500 T ${
                waveWidth * 8
              } 500 T ${waveWidth * 10} 500 T ${waveWidth * 12} 500 T ${
                waveWidth * 14
              } 500 T ${waveWidth * 16} 500 T ${waveWidth * 18} 500 T ${
                waveWidth * 20
              } 500 V 1000 H 0 Z`,
              `M 0 500 Q ${waveWidth} ${500 - waveSpeed * 1.5} ${
                waveWidth * 2
              } 500 T ${waveWidth * 4} 500 T ${waveWidth * 6} 500 T ${
                waveWidth * 8
              } 500 T ${waveWidth * 10} 500 T ${waveWidth * 12} 500 T ${
                waveWidth * 14
              } 500 T ${waveWidth * 16} 500 T ${waveWidth * 18} 500 T ${
                waveWidth * 20
              } 500 V 1000 H 0 Z`,
            ],
          }}
          transition={{
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
            duration: 8,
            delay: 0.5,
          }}
        />
        <rect x="0" y="0" width="1000" height="1000" fill={backgroundFill} />
      </svg>
      <div className={`relative z-10 ${className}`}>{children}</div>
    </div>
  );
};
