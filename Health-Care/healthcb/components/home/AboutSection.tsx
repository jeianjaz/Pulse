"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle } from "lucide-react";

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-700/20"></div>
              <Image
                src="/features/EXPERT.jpg" // We'll use an existing image for now
                alt="Healthcare professionals"
                fill
                className="object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              About <span className="text-emerald-600">Pulse</span>
            </h2>
            <p className="text-gray-600 mb-6">
              The <strong>Barangay Sta. Monica Health Care Management System</strong> aims to provide a modern digital solution tailored to the unique healthcare needs of Barangay Sta. Monica in Novaliches, Quezon City. By transitioning from a manual, paper-based system to an efficient digital platform, the project seeks to enhance the quality and accessibility of grassroots healthcare services.
            </p>
            <p className="text-gray-600 mb-8">
              The system will automate essential processes such as patient record management, scheduling, and resource tracking, reducing operational inefficiencies and improving service delivery.
            </p>

            <div className="space-y-4">
              {[
                "Modern digital healthcare solution",
                "Efficient patient record management",
                "Streamlined appointment scheduling",
                "Enhanced healthcare accessibility"
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + (index * 0.1) }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
