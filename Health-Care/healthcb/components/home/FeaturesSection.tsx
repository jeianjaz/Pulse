"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { 
  Bell, 
  Users, 
  Activity, 
  Video, 
  BarChart2, 
  ArrowRight 
} from "lucide-react";

const features = [
  {
    icon: <Bell className="w-6 h-6" />,
    title: "Predictive Health Alerts",
    description: "Stay one step ahead with AI-driven notifications for potential risks.",
    color: "bg-green-50",
    iconColor: "text-green-600",
    borderColor: "border-green-200",
    hoverBorderColor: "group-hover:border-green-300",
    learnMoreColor: "text-green-600"
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Personalized Lifestyle Recommendations",
    description: "Tailored insights to help you maintain a healthy routine.",
    color: "bg-blue-50",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200",
    hoverBorderColor: "group-hover:border-blue-300",
    learnMoreColor: "text-blue-600"
  },
  {
    icon: <Activity className="w-6 h-6" />,
    title: "Community Health Insights",
    description: "Discover emerging health trends in your community.",
    color: "bg-purple-50",
    iconColor: "text-purple-600",
    borderColor: "border-purple-200",
    hoverBorderColor: "group-hover:border-purple-300",
    learnMoreColor: "text-purple-600"
  },
  {
    icon: <Activity className="w-6 h-6" />,
    title: "AI Symptom Analyzer",
    description: "Evaluate your health status with real-time symptom checks.",
    color: "bg-yellow-50",
    iconColor: "text-yellow-600",
    borderColor: "border-yellow-200",
    hoverBorderColor: "group-hover:border-yellow-300",
    learnMoreColor: "text-yellow-600"
  },
  {
    icon: <Video className="w-6 h-6" />,
    title: "Doctor-Patient Video Consultation",
    description: "Secure and convenient virtual consultations.",
    color: "bg-pink-50",
    iconColor: "text-pink-600",
    borderColor: "border-pink-200",
    hoverBorderColor: "group-hover:border-pink-300",
    learnMoreColor: "text-pink-600"
  },
  {
    icon: <BarChart2 className="w-6 h-6" />,
    title: "Health Data Analytics",
    description: "Visualize and understand your health trends over time.",
    color: "bg-indigo-50",
    iconColor: "text-indigo-600",
    borderColor: "border-indigo-200",
    hoverBorderColor: "group-hover:border-indigo-300",
    learnMoreColor: "text-indigo-600"
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Our <span className="text-emerald-600">Features</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the innovative features that make our healthcare platform unique
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`group rounded-xl p-6 ${feature.color} border ${feature.borderColor} ${feature.hoverBorderColor} transition-all duration-300 hover:shadow-md`}
            >
              <div className="mb-4">
                <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center ${feature.iconColor}`}>
                  {feature.icon}
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 mb-4">
                {feature.description}
              </p>
              
              <div className={`flex items-center ${feature.learnMoreColor} font-medium text-sm`}>
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
