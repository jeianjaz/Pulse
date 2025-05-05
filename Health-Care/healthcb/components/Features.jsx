"use client"

import { motion } from "framer-motion"
import { Stethoscope, Clock, Shield, Users } from "lucide-react"

const features = [
  {
    icon: <Stethoscope className="w-8 h-8 text-[#ABF600]" />,
    title: "Expert Care",
    description: "Access to top healthcare professionals and specialists"
  },
  {
    icon: <Clock className="w-8 h-8 text-[#ABF600]" />,
    title: "24/7 Service",
    description: "Round-the-clock medical support and emergency care"
  },
  {
    icon: <Shield className="w-8 h-8 text-[#ABF600]" />,
    title: "Secure Platform",
    description: "Advanced security measures to protect your health data"
  },
  {
    icon: <Users className="w-8 h-8 text-[#ABF600]" />,
    title: "Patient-Centered",
    description: "Personalized healthcare solutions for every patient"
  }
]

export default function Features() {
  return (
    <section className="py-20 bg-[#F3F3F3] relative">
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#ABF600]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#ABF600]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="container mx-auto px-6 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-dm-sans font-bold text-[#1A202C] mb-4">
            Why Choose Us
          </h2>
          <p className="text-lg text-[#1A202C]/70 font-dm-sans">
            Discover the advantages of our modern healthcare platform
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-dm-sans font-bold text-[#1A202C] mb-2">
                {feature.title}
              </h3>
              <p className="text-[#1A202C]/70 font-dm-sans">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}