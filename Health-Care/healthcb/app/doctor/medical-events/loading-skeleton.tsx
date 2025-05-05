"use client";

import React from 'react';

const LoadingSkeleton = () => {
  return (
    <>
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <div 
            key={index} 
            className="relative h-[450px] w-full rounded-xl overflow-hidden bg-gray-200"
          >
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                animation: 'shimmer 1.5s infinite',
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default LoadingSkeleton;
