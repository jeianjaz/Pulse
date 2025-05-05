'use client';

import { motion } from 'framer-motion';

export default function ConsultationsLoading() {
  return (
    <>
      <div className="mb-8">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-96 bg-gray-100 rounded"></div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
          <div className="h-9 w-28 bg-gray-200 rounded-md"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="border border-gray-100 rounded-lg p-4">
              <div className="h-5 w-32 bg-gray-200 rounded mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-100 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
                <div className="h-4 w-5/6 bg-gray-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}