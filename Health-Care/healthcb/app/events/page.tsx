"use client";

import { motion } from "framer-motion";
import { Calendar, Video, Clock, Shield, Users, Heart } from "lucide-react";
import Image from "next/image";

const features = [
  {
    icon: <Calendar className="w-8 h-8" />,
    title: "Easy Scheduling",
    description: "Book appointments with healthcare providers quickly and efficiently.",
    date: "Available 24/7",
    category: "Service",
    image: "/features/scheduling.jpg"
  },
  {
    icon: <Video className="w-8 h-8" />,
    title: "Virtual Consultations",
    description: "Connect with doctors remotely through secure video calls.",
    date: "Available 24/7",
    category: "Technology",
    image: "/features/virtual-consultation.jpg"
  },
  {
    icon: <Clock className="w-8 h-8" />,
    title: "24/7 Support",
    description: "Access healthcare support and emergency services anytime.",
    date: "Always Active",
    category: "Support",
    image: "/features/support.jpg"
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Secure Platform",
    description: "Your health data is protected with enterprise-grade security.",
    date: "Continuous",
    category: "Security",
    image: "/features/security.jpg"
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Expert Doctors",
    description: "Access a network of qualified healthcare professionals.",
    date: "Available Daily",
    category: "Healthcare",
    image: "/features/doctors.jpg"
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: "Health Tracking",
    description: "Monitor your health metrics and track your progress.",
    date: "Real-time",
    category: "Wellness",
    image: "/features/health-tracking.jpg"
  }
];

export default function Events() {
  return (
    <main className="pt-20 bg-white">
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <h1 className="text-5xl font-bold text-[#1A202C] mb-6">
              Our <span className="text-[#ABF600]">Features</span>
            </h1>
            <p className="text-xl text-gray-600">
              Discover the innovative features that make our healthcare platform unique
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    priority={index < 2}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-4 right-4 bg-[#ABF600] text-[#1A202C] px-3 py-1 rounded-full text-sm font-semibold">
                    {feature.category}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-[#ABF600]/20 rounded-xl">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#1A202C]">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {feature.date}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                  <button className="mt-6 w-full bg-[#F3F3F3] hover:bg-[#ABF600] text-[#1A202C] py-3 rounded-xl font-semibold transition-colors duration-300">
                    Learn More
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
