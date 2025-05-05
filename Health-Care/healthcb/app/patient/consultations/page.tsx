"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Activity } from 'lucide-react';
import ConsultationBooking from '@/components/patient/ConsultationBooking';

function Consultations() {
  return (
    <div className="container mx-auto relative z-10">
      {/* Booking Steps */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-3xl font-bold text-[#1A202C] mb-8">Book Your Consultation</h2>
        <div className="relative">
          {/* Progress Bar */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2" />
          <motion.div 
            className="absolute top-1/2 left-0 h-0.5 bg-[#ABF600] -translate-y-1/2"
            initial={{ width: "0%" }}
            animate={{ width: "33%" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />

          {/* Steps */}
          <div className="relative grid grid-cols-3 gap-4">
            <motion.div 
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-12 h-12 rounded-full bg-[#ABF600] text-[#1A202C] shadow-lg shadow-[#ABF600]/20 flex items-center justify-center text-lg font-bold mb-4">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  1
                </motion.span>
              </div>
              <p className="font-medium text-center text-[#1A202C]">
                Select Date
              </p>
            </motion.div>

            <motion.div 
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-lg font-bold mb-4">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  2
                </motion.span>
              </div>
              <p className="font-medium text-center text-gray-400">
                Choose Time
              </p>
            </motion.div>

            <motion.div 
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-lg font-bold mb-4">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  3
                </motion.span>
              </div>
              <p className="font-medium text-center text-gray-400">
                Confirm Details
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Booking Component */}
      <ConsultationBooking />
    </div>
  );
}

export default Consultations;