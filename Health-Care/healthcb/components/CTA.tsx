"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CTA() {
  return (
    <section className="py-20 bg-[#FFFFFF]">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#1A202C] rounded-2xl p-12 text-center"
        >
          <h2 className="text-4xl font-dm-sans font-bold text-white mb-6">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-xl text-white/80 mb-8 font-dm-sans max-w-2xl mx-auto">
            Join thousands of satisfied patients who have chosen our modern healthcare platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/patient/login">
              <Button 
                className="bg-[#ABF600] text-[#1A202C] hover:bg-[#9DE100] font-dm-sans text-lg px-8 py-6"
              >
                Sign In Now
              </Button>
            </Link>
            <Button 
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-[#1A202C] font-dm-sans text-lg px-8 py-6"
            >
              Reach us out
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}