"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 text-center lg:text-left"
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-[#1A202C] mb-6 leading-tight">
              Your Health, <span className="bg-gradient-blue text-transparent bg-clip-text">Our Priority</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Experience modern healthcare solutions with our comprehensive platform. 
              Connect with healthcare professionals, manage appointments, and take control of your well-being.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/patient/login">
                <button className="px-8 py-4 bg-gradient-secondary hover:opacity-90 text-white rounded-lg font-semibold transition-all shadow-lg animate-gradient-x">
                  Get Started
                </button>
              </Link>
              <Link href="/about">
                <button className="px-8 py-4 bg-white/80 backdrop-blur-sm text-accent-blue rounded-lg font-semibold hover:bg-white transition-colors border border-accent-blue">
                  Learn More
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Image/Illustration */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1"
          >
            <div className="relative w-full h-[400px] lg:h-[500px]">
              <Image
                src="/hero-illustration.svg"
                alt="Healthcare Illustration"
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
