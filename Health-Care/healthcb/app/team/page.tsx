"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Github, Linkedin, Twitter } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import BackgroundDecoration from "@/components/BackgroundDecoration";
import BackgroundElements from "@/components/BackgroundElements";

const teamMembers = [
  {
    name: "Carry Ryan Abarquez",
    role: "Lead Developer, Database Administrator",
    image: "/team/carryl.jpg",
    bio: "A skilled full-stack developer who expertly manages our database architecture while leading the development team with innovative solutions.",
    social: {
      twitter: "#",
      linkedin: "#",
      github: "#"
    }
  },
  {
    name: "Jeian Jasper Obelidor",
    role: "Front-End Developer, UI/UX Designer",
    image: "/team/jeianpfp.jpg",
    bio: "A creative front-end developer who brings our healthcare platform to life with engaging user interfaces and seamless user experiences.",
    social: {
      twitter: "#",
      linkedin: "#",
      github: "#"
    }
  },
  {
    name: "Mark Angelo Oyales",
    role: "Lead Documentation",
    image: "/team/gelo.jpg",
    bio: "A detail-oriented documentation lead who ensures our project's technical specifications and processes are thoroughly documented and accessible.",
    social: {
      twitter: "#",
      linkedin: "#",
      github: "#"
    }
  },
  {
    name: "John David Ramos",
    role: "Banko Central",
    image: "/team/jhonny.jpg",
    bio: "A resourceful team member who efficiently manages and oversees our project's financial aspects and resource allocation.",
    social: {
      twitter: "#",
      linkedin: "#",
      github: "#"
    }
  },
  {
    name: "Luis Rualo",
    role: "System Analyst",
    image: "/team/rualo.jpg",
    bio: "An analytical problem-solver who evaluates system requirements and designs efficient solutions for our healthcare platform.",
    social: {
      twitter: "#",
      linkedin: "#",
      github: "#"
    }
  },
  {
    name: "Neil Viloria",
    role: "Documentation",
    image: "/team/neil.jpg",
    bio: "A meticulous documentation specialist who helps maintain clear and comprehensive project documentation for future reference.",
    social: {
      twitter: "#",
      linkedin: "#",
      github: "#"
    }
  },
  {
    name: "Allan Angelo Del Mundo",
    role: "Documentation",
    image: "/team/microcheatingboy.jpg",
    bio: "A dedicated team member who contributes to maintaining detailed documentation of our healthcare system's features and functionalities.",
    social: {
      twitter: "#",
      linkedin: "#",
      github: "#"
    }
  },
  {
    name: "Luiz Peyes",
    role: "Documentation",
    image: "/team/peyes.png",
    bio: "A thorough documentation specialist who ensures our project's technical documentation meets quality standards.",
    social: {
      twitter: "#",
      linkedin: "#",
      github: "#"
    }
  },
  {
    name: "John Denmar Peña",
    role: "I LOVE YOU - I LOVE YOU!",
    image: "/team/banga.jpg",
    bio: "An enthusiastic team member who brings positive energy and dedication to every aspect of the project.",
    social: {
      twitter: "#",
      linkedin: "#",
      github: "#"
    }
  },
  {
    name: "Wyne Nutarte",
    role: "RUNNER",
    image: "/team/kupal.jpg",
    bio: "A dynamic team member who efficiently handles quick tasks and ensures smooth communication between team components.",
    social: {
      twitter: "#",
      linkedin: "#",
      github: "#"
    }
  },
];

export default function Team() {
  const router = useRouter();
  
  return (
    <main className="pt-8 bg-white relative overflow-hidden">
      <BackgroundDecoration />
      <BackgroundElements />
      
      <div className="container mx-auto px-6 pt-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            onClick={() => router.back()}
            className="mb-4 bg-gradient-to-r from-[#79CEED] to-[#06AFEC] text-white hover:opacity-90"
          >
            ← Back
          </Button>
        </motion.div>
      </div>
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <h1 className="text-5xl font-bold text-[#1A202C] mb-6">
              Meet Our <span className="bg-gradient-to-r from-[#79CEED] to-[#06AFEC] text-transparent bg-clip-text">Team</span>
            </h1>
            <p className="text-xl text-gray-600">
              The talented people behind our healthcare platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative h-80 mb-6 rounded-2xl overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06AFEC]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <a
                      href={member.social.twitter}
                      className="p-2 bg-white/90 rounded-full hover:bg-gradient-to-r hover:from-[#79CEED] hover:to-[#06AFEC] hover:text-white transition-colors"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a
                      href={member.social.linkedin}
                      className="p-2 bg-white/90 rounded-full hover:bg-gradient-to-r hover:from-[#79CEED] hover:to-[#06AFEC] hover:text-white transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a
                      href={member.social.github}
                      className="p-2 bg-white/90 rounded-full hover:bg-gradient-to-r hover:from-[#79CEED] hover:to-[#06AFEC] hover:text-white transition-colors"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-[#1A202C] mb-2">
                    {member.name}
                  </h3>
                  <p className="bg-gradient-to-r from-[#79CEED] to-[#06AFEC] text-transparent bg-clip-text font-semibold mb-4">
                    {member.role}
                  </p>
                  <p className="text-gray-600">
                    {member.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
