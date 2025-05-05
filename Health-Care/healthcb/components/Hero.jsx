"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function Hero() {
  
  return (
    <div className="relative min-h-screen flex items-center bg-[#FFFFFF] overflow-hidden pt-20">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 text-center lg:text-left"
          >
            <h1 className="text-5xl lg:text-6xl font-dm-sans font-bold text-[#1A202C] leading-tight mb-6">
              Modern Healthcare
              <span className="text-[#ABF600]"> Solutions</span>
            </h1>
            <p className="text-xl text-[#1A202C]/80 mb-8 font-dm-sans">
            Transforming healthcare access in <i className="font-semibold underline ">Barangay Sta. Monica</i> through innovative technology and dedicated care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                className="bg-[#ABF600] text-[#1A202C] hover:bg-[#9DE100] font-dm-sans text-lg px-8 py-6"
              >
                Get Started
              </Button>
              <Button 
                variant="outline"
                className="border-2 border-[#1A202C] text-[#1A202C] hover:bg-[#1A202C] hover:text-white font-dm-sans text-lg px-8 py-6"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1"
          >
            <Image
              src="/output-onlinegiftools.gif"
              alt="Healthcare Innovation"
              width={600}
              height={600}
              className="w-full h-auto"
              priority
            />
          </motion.div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F3F3F3] to-transparent" />
    </div>
  )
}