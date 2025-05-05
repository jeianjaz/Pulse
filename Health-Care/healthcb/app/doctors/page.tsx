"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Star, MapPin, Calendar } from "lucide-react";

const doctors = [
  {
    name: "Dr. John Smith",
    specialty: "Cardiologist",
    rating: 4.9,
    reviews: 128,
    location: "New York, NY",
    experience: "15+ years",
    image: "/doctors/doctor1.jpg",
    availability: "Mon, Wed, Fri",
    education: "Harvard Medical School"
  },
  {
    name: "Dr. Maria Garcia",
    specialty: "Neurologist",
    rating: 4.8,
    reviews: 96,
    location: "Los Angeles, CA",
    experience: "12+ years",
    image: "/doctors/doctor2.jpg",
    availability: "Tue, Thu, Sat",
    education: "Stanford Medical School"
  },
  {
    name: "Dr. James Wilson",
    specialty: "Pediatrician",
    rating: 4.9,
    reviews: 156,
    location: "Chicago, IL",
    experience: "18+ years",
    image: "/doctors/doctor3.jpg",
    availability: "Mon, Tue, Thu",
    education: "Johns Hopkins School of Medicine"
  },
];

export default function Doctors() {
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
              Our Expert <span className="text-[#ABF600]">Doctors</span>
            </h1>
            <p className="text-xl text-gray-600">
              Meet our team of experienced healthcare professionals
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.map((doctor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={doctor.image}
                    alt={doctor.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    priority={index < 2}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 text-white mb-2">
                      <Star className="w-5 h-5 fill-[#ABF600] text-[#ABF600]" />
                      <span className="font-semibold">{doctor.rating}</span>
                      <span className="text-sm">({doctor.reviews} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#1A202C] mb-2">
                    {doctor.name}
                  </h3>
                  <p className="text-[#ABF600] font-semibold mb-4">
                    {doctor.specialty}
                  </p>
                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span>{doctor.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span>{doctor.availability}</span>
                    </div>
                    <p className="text-sm">
                      {doctor.experience} experience
                    </p>
                    <p className="text-sm">
                      {doctor.education}
                    </p>
                  </div>
                  <button className="mt-6 w-full bg-[#F3F3F3] hover:bg-[#ABF600] text-[#1A202C] py-3 rounded-xl font-semibold transition-colors duration-300">
                    Book Appointment
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
