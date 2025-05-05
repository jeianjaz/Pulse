"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardSidebar from './DashboardSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: 'patient' | 'doctor' | 'admin';
  onLogout: () => void;
}

export default function DashboardLayout({ children, userType, onLogout }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar userType={userType} onLogout={onLogout} />
      
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-7xl mx-auto"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
