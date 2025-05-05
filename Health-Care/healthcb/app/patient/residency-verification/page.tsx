"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import BackgroundElements from "@/components/BackgroundElements";
import { AlertCircle } from "lucide-react";

const ResidentContent = () => {
  const searchParams = useSearchParams();
  const username = searchParams.get('username');

  return (
    <div className="container mx-auto px-4 py-12 relative z-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 bg-red-50 border border-red-200 rounded-lg p-6"
          >
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Not a Resident
            </h2>
            <p className="text-red-700 text-lg mb-4">
              {username ? `User: ${username}` : 'No username provided'}
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Oops! Looks like you are not a registered resident. Please proceed to our Barangay Hall to register as a Resident.
            </p>
          </motion.div>

          <Button 
            onClick={() => window.location.href = '/patient/login'}
            className="w-full bg-[#ABF600] text-[#1A202C] hover:bg-[#9DE100] transition-colors"
          >
            Back to Login
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

const ResidentVerificationPage = () => {
  return (
    <main className="min-h-screen bg-[#FFFFFF] relative overflow-hidden">
      <BackgroundElements />
      <Suspense fallback={<div>Loading...</div>}>
        <ResidentContent />
      </Suspense>
    </main>
  );
};

export default ResidentVerificationPage;