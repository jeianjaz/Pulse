"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-50 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div>
            <Link href="#home" className="flex items-center space-x-2 mb-6">
              <div className="relative w-8 h-8">
                <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <circle cx="20" cy="20" r="20" fill="black" />
                  <path d="M20 10C14.48 10 10 14.48 10 20C10 25.52 14.48 30 20 30C25.52 30 30 25.52 30 20C30 14.48 25.52 10 20 10ZM16 25V15L26 20L16 25Z" fill="white" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">Pulse</span>
            </Link>
            <p className="text-gray-600 mb-6">
              Modern healthcare solutions powered by AI/ML technology to improve patient outcomes and healthcare delivery.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-emerald-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-emerald-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-emerald-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { name: "Home", href: "#home" },
                { name: "Features", href: "#features" },
                { name: "About", href: "#about" },
                { name: "Testimonials", href: "#testimonials" },
                { name: "Sign In", href: "/patient/login" }
              ].map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-gray-600 hover:text-emerald-600 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Services</h3>
            <ul className="space-y-3">
              {[
                "Health Monitoring",
                "Virtual Consultations",
                "Appointment Scheduling",
                "Health Analytics",
                "Medication Reminders"
              ].map((service, index) => (
                <li key={index} className="text-gray-600">
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
                <span className="text-gray-600">Barangay Sta. Monica, Novaliches, Quezon City</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-emerald-600" />
                <span className="text-gray-600 ">(02) 8123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-emerald-600" />
                <span className="text-gray-600">contact@pulse-healthcare.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Pulse Healthcare. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
