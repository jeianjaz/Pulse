"use client"

import { motion } from "framer-motion"

export default function BackgroundElements() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Gradient blurs with increased opacity */}
      <div className="absolute -top-40 -right-40 w-96 h-96 from-[#06AFEC]/40 to-[#7FD6FB]/40 bg-gradient-to-br rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 from-[#79CEED]/30 to-[#C5E7F1]/30 bg-gradient-to-br rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 from-[#06AFEC]/35 to-[#7FD6FB]/35 bg-gradient-to-br rounded-full blur-3xl" />

      {/* Animated icons with brighter colors */}
      <div className="absolute top-20 left-10">
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-12 h-12 text-[#06AFEC]"
        >
          <DNAIcon />
        </motion.div>
      </div>

      <div className="absolute top-40 right-20">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="w-10 h-10 text-[#7FD6FB]"
        >
          <PulseIcon />
        </motion.div>
      </div>

      <div className="absolute bottom-40 left-1/4">
        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [0, -3, 0]
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
          className="w-12 h-12 text-[#79CEED]"
        >
          <BrainIcon />
        </motion.div>
      </div>

      <div className="absolute top-1/3 left-20">
        <motion.div
          animate={{
            y: [0, -12, 0],
            x: [0, 8, 0]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.2
          }}
          className="w-10 h-10 text-[#06AFEC]"
        >
          <MoleculeIcon />
        </motion.div>
      </div>

      <div className="absolute bottom-20 right-1/4">
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, -8, 0]
          }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
          className="w-10 h-10 text-[#7FD6FB]"
        >
          <HeartIcon />
        </motion.div>
      </div>

      <div className="absolute bottom-32 right-20">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 10, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="w-12 h-12 text-[#79CEED]"
        >
          <ShieldPlusIcon />
        </motion.div>
      </div>

      <div className="absolute top-1/4 right-1/3">
        <motion.div
          animate={{
            y: [0, 10, 0],
            x: [0, -10, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.8
          }}
          className="w-8 h-8 text-[#06AFEC]"
        >
          <PillIcon />
        </motion.div>
      </div>
    </div>
  )
}

const DNAIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="text-[#06AFEC]"> 
    <path
      d="M12 2L12 22M9 4L15 4M9 20L15 20M8 8L16 8M8 16L16 16M6 12L18 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

const PulseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="text-[#7FD6FB]"> 
    <path
      d="M3 12H7L10 19L14 5L17 12H21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const BrainIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="text-[#79CEED]"> 
    <path
      d="M12 4C7 4 4 7 4 11C4 15 7 18 12 18C17 18 20 15 20 11C20 7 17 4 12 4ZM12 18V20M8 18L6 21M16 18L18 21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const MoleculeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="text-[#06AFEC]"> 
    <path
      d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M12 9L12 3M12 21L12 15M9.17 9.17L3 3M21 21L14.83 14.83"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="text-[#7FD6FB]"> 
    <path
      d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
      fill="currentColor"
    />
  </svg>
)

const ShieldPlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="text-[#79CEED]"> 
    <path
      d="M12 3L4 7V11C4 15.4183 7.26522 19.4407 12 21C16.7348 19.4407 20 15.4183 20 11V7L12 3ZM12 8V14M9 11H15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const PillIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="text-[#06AFEC]"> 
    <path
      d="M10.5 12.5L17.5 5.5C19.0355 3.96447 19.0355 1.46447 17.5 -0.100505C15.9645 -1.66548 13.4645 -1.66548 11.9 0.1L4.9 7.1C4.36 7.64 3.96 8.48 3.96 9.36V20.36C3.96 21.24 4.36 22.08 4.9 22.6C5.44 23.12 6.36 23.4 7.5 23.4C8.64 23.4 9.56 23.12 10.1 22.6L16.1 16.6C18.45 14.45 20.045 12.24 21.34 10C21.65 9.3 21.65 8.54 21.34 7.86C21.04 7.18 20.35 6.96 19.84 7.68L17.5 10.5L12 16.05V20.05H7V15.05L10.5 12.5Z"
      fill="currentColor"
    />
  </svg>
)
