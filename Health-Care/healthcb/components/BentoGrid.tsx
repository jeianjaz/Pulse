"use client";

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface BentoItemProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
  gradientFrom?: string;
  gradientTo?: string;
  children?: ReactNode;
  delay?: number;
}

export function BentoItem({
  title,
  description,
  icon,
  className = "",
  gradientFrom = "from-emerald-50",
  gradientTo = "to-emerald-100/50",
  children,
  delay = 0
}: BentoItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br ${gradientFrom} ${gradientTo} p-4 shadow-sm hover:shadow-md transition-all ${className}`}
    >
      {icon && (
        <div className="absolute top-4 right-4 text-gray-500 opacity-20">
          {icon}
        </div>
      )}
      
      {title && (
        <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      )}
      
      {description && (
        <p className="text-sm text-gray-600 mb-3">{description}</p>
      )}
      
      {children}
    </motion.div>
  );
}

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className = "" }: BentoGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {children}
    </div>
  );
}
