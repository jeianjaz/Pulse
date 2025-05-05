"use client";

import React from 'react';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  Bell, 
  Users, 
  Activity, 
  Video, 
  BarChart2, 
  ArrowRight,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (loading) {
    return <Loading />;
  }

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

  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `radial-gradient(#22c55e 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>
      
      {/* Navbar */}
      <motion.nav 
        className={`fixed w-full z-50 bg-white transition-all duration-300 ${isScrolled ? 'py-3' : 'py-4'}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={`container mx-auto px-6 ${isScrolled ? 'max-w-5xl' : ''}`}>
          <div className={`flex items-center ${isScrolled ? 'justify-between rounded-full bg-white/95 px-8 py-3 shadow-xl' : 'justify-between'}`}>
            <Link href="#home" className="flex items-center space-x-2">
              {isScrolled ? (
                <div className="relative w-12 h-12">
                  <Image 
                    src="/images/pulse/pulselogo.png" 
                    alt="Pulse Logo" 
                    width={48} 
                    height={48} 
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="relative h-16">
                  <Image 
                    src="/images/pulse/pulsename.png" 
                    alt="Pulse Logo" 
                    width={220} 
                    height={68} 
                    className="h-full object-contain"
                  />
                </div>
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-center flex-1">
              <div className="flex space-x-12 mx-auto">
                {[
                  { name: "Home", href: "#home" },
                  { name: "Features", href: "#features" },
                  { name: "About", href: "#about" },
                  { name: "Testimonials", href: "#testimonials" }
                ].map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="text-gray-800 hover:text-emerald-600 font-medium transition-colors relative group cursor-pointer"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
                  </a>
                ))}
              </div>
            </div>
            
            <div className="hidden md:block">
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-emerald-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all duration-300"
                >
                  Get Started
                </motion.button>
              </Link>
            </div>

            {/* Mobile Navigation Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-800" />
              ) : (
                <Menu className="h-6 w-6 text-gray-800" />
              )}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden py-4 bg-white rounded-lg mt-2 shadow-lg"
            >
              <div className="flex flex-col space-y-4 p-4">
                {[
                  { name: "Home", href: "#home" },
                  { name: "Features", href: "#features" },
                  { name: "About", href: "#about" },
                  { name: "Testimonials", href: "#testimonials" }
                ].map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="text-gray-800 hover:text-emerald-600 font-medium transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all duration-300 w-full mt-2"
                  >
                    Get Started
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>
      
      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full lg:w-1/2 text-center lg:text-left order-2 lg:order-1"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                We Empower Your <br className="hidden sm:block" />
                Health with <span className="text-emerald-600">AI/ML.</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 mx-auto lg:mx-0 max-w-lg">
                We provide distinct solutions that are tailored to the healthcare provider
                needs at each stage of their journey to scale.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  onClick={() => router.push('/login')}
                  className="bg-black hover:bg-gray-800 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Get Started
                </Button>
                <Button 
                  onClick={() => {
                    const element = document.querySelector("#about");
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-800 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-full shadow-sm hover:shadow-md transition-all duration-300"
                >
                  Our Purpose
                </Button>
              </div>
            </motion.div>
            
            {/* Doctor Illustrations */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full lg:w-1/2 relative order-1 lg:order-2 mb-8 lg:mb-0"
            >
              <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] w-full mx-auto max-w-md lg:max-w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 to-blue-50/50 rounded-3xl -z-10"></div>
                
                {/* Mobile view - centered single image */}
                <div className="block lg:hidden w-full h-full relative">
                  <Image 
                    src="/images/pulse/openpeepsdoc1.png" 
                    alt="Doctor Illustration" 
                    width={300} 
                    height={400}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-[90%] w-auto object-contain"
                  />
                </div>
                
                {/* Desktop view - two overlapping images */}
                <div className="hidden lg:block w-full h-full">
                  <Image 
                    src="/images/pulse/openpeepsdoc.png" 
                    alt="Doctor Illustration" 
                    width={400} 
                    height={500}
                    className="absolute top-0 left-[5%] h-full w-auto object-contain z-10"
                  />
                  <Image 
                    src="/images/pulse/openpeepsdoc1.png" 
                    alt="Doctor Illustration" 
                    width={400} 
                    height={500}
                    className="absolute top-0 right-[5%] h-full w-auto object-contain z-20"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-white to-gray-50">
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`group rounded-xl p-8 ${feature.color} border-2 ${feature.borderColor} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
              >
                <div className="mb-6">
                  <div className={`w-16 h-16 rounded-full bg-white flex items-center justify-center ${feature.iconColor} shadow-md`}>
                    {feature.icon}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 mb-5">
                  {feature.description}
                </p>
                
                <div className={`flex items-center ${feature.learnMoreColor} font-medium`}>
                  <span>Learn more</span>
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-2" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row items-center gap-12"
            >
              <div className="md:w-1/2">
                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                  <Image 
                    src="/images/pulse/pulselogo.png" 
                    alt="Pulse Logo" 
                    width={500} 
                    height={400}
                    className="w-full h-auto object-contain p-8"
                  />
                </div>
              </div>
              <div className="md:w-1/2 text-left">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  About <span className="text-emerald-600">Pulse</span>
                </h2>
                <p className="text-gray-600 mb-6">
                  <strong>Pulse</strong> is a cutting-edge AI-driven healthcare platform designed to revolutionize patient monitoring and predictive health analysis through innovative technology.
                </p>
                <p className="text-gray-600 mb-6">
                  Our system empowers healthcare providers with real-time insights while giving patients greater control over their health journey through an intuitive, accessible interface.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gradient-to-b from-white to-gray-50">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto px-4 sm:px-0">
            {[
              {
                name: "Maria Santos",
                role: "Patient",
                image: "/images/pulse/testimonial1.jpg",
                quote: "Pulse has completely transformed how I manage my health. The predictive alerts have helped me stay ahead of potential issues.",
                icon: <Bell className="w-6 h-6" />
              },
              {
                name: "Dr. James Rodriguez",
                role: "Physician",
                image: "/images/pulse/testimonial2.jpg",
                quote: "As a doctor, this platform has made it much easier to monitor my patients remotely and provide timely interventions.",
                icon: <Activity className="w-6 h-6" />
              },
              {
                name: "Elena Cruz",
                role: "Caregiver",
                image: "/images/pulse/testimonial3.jpg",
                quote: "The interface is intuitive and the health tracking features give me peace of mind when caring for my elderly mother.",
                icon: <Users className="w-6 h-6" />
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center mb-4 sm:mb-6">
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-4 border-emerald-100 mr-3 sm:mr-4">
                      <Image 
                        src={index === 0 ? "/images/pulse/Open Peeps - Avatar.png" : 
                             index === 1 ? "/images/pulse/Open Peeps - Avatar (2).png" : 
                             "/images/pulse/Open Peeps - Avatar (3).png"} 
                        alt={`${testimonial.name} avatar`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                        {testimonial.name}
                      </h4>
                      <p className="text-emerald-600 text-sm sm:text-base font-medium">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 italic flex-grow">
                    "{testimonial.quote}"
                  </p>
                  
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-12 text-center shadow-xl"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Healthcare Experience?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied patients who have chosen our modern healthcare platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => router.push('/patient/login')}
                className="bg-white text-emerald-700 hover:bg-gray-100 px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Minimalist Version */}
      <footer className="bg-gray-50 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-center">
            <Link href="#home" className="mb-6">
              <div className="relative h-16">
                <Image 
                  src="/images/pulse/pulsename.png" 
                  alt="Pulse Logo" 
                  width={180} 
                  height={60} 
                  className="h-full object-contain"
                />
              </div>
            </Link>
            
            <div className="flex items-center justify-center space-x-6 mb-8">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
            </div>
            
            <div className="border-t border-gray-200 w-24 mb-8"></div>
            
            <p className="text-center text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Pulse Healthcare. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
