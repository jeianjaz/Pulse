"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    id: 1,
    content: "Pulse has completely transformed how I manage my health. The predictive alerts have helped me stay ahead of potential issues.",
    author: "Maria Santos",
    role: "Patient",
    avatar: "/image/Open Peeps - Avatar.png", // Using existing images for now
    rating: 5
  },
  {
    id: 2,
    content: "As a healthcare provider, Pulse has streamlined my workflow and improved patient communication significantly.",
    author: "Dr. James Chen",
    role: "Cardiologist",
    avatar: "/doctor/default2.jpg",
    rating: 5
  },
  {
    id: 3,
    content: "The health analytics feature gives me insights I never had before. I can now make better decisions about my lifestyle.",
    author: "Robert Garcia",
    role: "Patient",
    avatar: "/doctor/default3.jpg",
    rating: 4
  }
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Our <span className="text-emerald-600">Users Say</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hear from our community of patients and healthcare providers
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Buttons */}
          <div className="absolute top-1/2 -left-4 -translate-y-1/2 z-10">
            <button 
              onClick={prevTestimonial}
              className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
          
          <div className="absolute top-1/2 -right-4 -translate-y-1/2 z-10">
            <button 
              onClick={nextTestimonial}
              className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Testimonial Card */}
          <motion.div
            key={testimonials[currentIndex].id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-8 md:p-10"
          >
            <div className="flex flex-col items-center">
              <div className="relative w-20 h-20 rounded-full overflow-hidden mb-6 border-4 border-emerald-100">
                <Image
                  src={testimonials[currentIndex].avatar}
                  alt={testimonials[currentIndex].author}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="flex mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${i < testimonials[currentIndex].rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              
              <p className="text-xl text-gray-700 text-center mb-6 italic">
                "{testimonials[currentIndex].content}"
              </p>
              
              <h4 className="text-lg font-semibold text-gray-900">
                {testimonials[currentIndex].author}
              </h4>
              
              <p className="text-gray-600">
                {testimonials[currentIndex].role}
              </p>
            </div>
          </motion.div>

          {/* Pagination Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-emerald-600 w-6' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
