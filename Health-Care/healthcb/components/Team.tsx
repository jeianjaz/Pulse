"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';

const teamMembers = [
  {
    name: "Dr. Sarah Wilson",
    role: "General Physician",
    image: "/doctors/doctor1.jpg",
    specialty: "Primary Care"
  },
  {
    name: "Dr. Michael Chen",
    role: "Cardiologist",
    image: "/doctors/doctor2.jpg",
    specialty: "Heart Care"
  },
  {
    name: "Dr. Emily Santos",
    role: "Pediatrician",
    image: "/doctors/doctor3.jpg",
    specialty: "Child Care"
  }
];

export default function Team() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-[#1A202C] mb-4"
          >
            Our Healthcare Professionals
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-600"
          >
            Meet our team of experienced and dedicated healthcare providers
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-[#F3F3F3] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="relative h-64 w-full">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#1A202C] mb-1">
                  {member.name}
                </h3>
                <p className="text-[#ABF600] font-semibold mb-2">
                  {member.role}
                </p>
                <p className="text-gray-600">
                  Specialist in {member.specialty}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
