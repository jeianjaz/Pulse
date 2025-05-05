"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "./ui/button"

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Events", href: "#events" },
  { name: "Doctors", href: "#doctors" },
  { name: "Team", href: "/team" },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link href="#home" className="flex items-center space-x-3">
            <span className="text-2xl font-bold text-[#1A202C] font-dm-sans">
              Health<span className="bg-gradient-primary text-transparent bg-clip-text">Care</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-8">
              {navLinks.map((link) => (
                link.href.startsWith('#') ? (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className="text-[#1A202C] hover:text-primary-blue font-dm-sans transition-colors relative group cursor-pointer"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary group-hover:w-full transition-all duration-300"></span>
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-[#1A202C] hover:text-primary-blue font-dm-sans transition-colors relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary group-hover:w-full transition-all duration-300"></span>
                  </Link>
                )
              ))}
            </div>
            <Link href="/patient/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-[#79CEED] to-[#06AFEC] text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
              >
                Sign In
              </motion.button>
            </Link>
          </div>

          {/* Mobile Navigation Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="h-6 w-6 text-[#1A202C]" />
            ) : (
              <Menu className="h-6 w-6 text-[#1A202C]" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden py-4"
          >
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                link.href.startsWith('#') ? (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className="text-[#1A202C] hover:text-primary-blue font-dm-sans transition-colors"
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-[#1A202C] hover:text-primary-blue font-dm-sans transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                )
              ))}
              <Link href="/patient/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-[#79CEED] to-[#06AFEC] text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all duration-300 w-full"
                >
                  Sign In
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}