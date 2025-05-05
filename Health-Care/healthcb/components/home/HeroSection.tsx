"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "../ui/button";

export default function HeroSection() {
  const router = useRouter();

  return (
    <section id="home" className="relative pt-32 pb-20 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-center lg:text-left"
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              We Empower Your <br />
              Health with <span className="text-emerald-600">AI/ML.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              We provide distinct solutions that are tailored to the healthcare provider
              needs at each stage of their journey to scale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                onClick={() => router.push('/patient/login')}
                className="bg-black hover:bg-gray-800 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started
              </Button>
              <Button 
                onClick={() => {
                  const element = document.querySelector("#about");
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-800 px-8 py-6 text-lg rounded-full shadow-sm hover:shadow-md transition-all duration-300"
              >
                Our Purpose
              </Button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 relative"
          >
            <div className="relative w-full h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full max-w-md">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Patient Health Metrics</h3>
                  <div className="bg-white rounded-xl shadow-md p-4 overflow-hidden">
                    <div className="h-[200px] relative">
                      {/* This would be replaced with an actual chart component */}
                      <div className="absolute inset-0 bg-gradient-to-t from-emerald-100/50 to-blue-100/50 rounded-lg"></div>
                      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-emerald-200/50 to-transparent rounded-b-lg"></div>
                      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-blue-200/30 to-transparent rounded-b-lg"></div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-gray-500">Live</span>
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Today</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
