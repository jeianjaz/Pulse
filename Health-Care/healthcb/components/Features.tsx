"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Calendar, Video, Clock, Shield, Users, Heart } from 'lucide-react';

const features = [
  {
    icon: <Calendar className="w-6 h-6" />,
    title: "Easy Scheduling",
    description: "Book appointments with healthcare providers quickly and efficiently.",
    image: "/features/scheduling.jpg"
  },
  {
    icon: <Video className="w-6 h-6" />,
    title: "Virtual Consultations",
    description: "Connect with doctors remotely through secure video calls.",
    image: "/features/virtual-consultation.jpg"
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "24/7 Support",
    description: "Access healthcare support and emergency services anytime.",
    image: "/features/support.jpg"
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Secure Platform",
    description: "Your health data is protected with enterprise-grade security.",
    image: "/features/security.jpg"
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Expert Doctors",
    description: "Access a network of qualified healthcare professionals.",
    image: "/features/doctors.jpg"
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Health Tracking",
    description: "Monitor your health metrics and track your progress.",
    image: "/features/health-tracking.jpg"
  }
];

export default function Features() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#7FD6FB]/5 via-white to-[#06AFEC]/5">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold mb-4 bg-gradient-secondary text-transparent bg-clip-text"
          >
            Our Features
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-600 text-lg"
          >
            Discover what makes our healthcare platform unique
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow group"
            >
              <div className="bg-gradient-blue w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-white">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-accent-blue transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
