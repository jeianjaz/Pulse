'use client';

import AvailabilityManager from '@/components/doctor/AvailabilityManager';
import BackgroundElements from '@/components/BackgroundElements';
import { motion } from 'framer-motion';

export default function ConsultationsPage() {
  return (
    <>
      <div className="mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-[#1A202C] mb-2"
        >
          Manage Your Availability
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600"
        >
          Set your availability for patient consultations and manage your schedule
        </motion.p>
      </div>
      
      <AvailabilityManager />
    </>
  );
}