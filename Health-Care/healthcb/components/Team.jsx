"use client"

import { motion } from "framer-motion"
import Image from "next/image"

const teamMembers = [
  {
    name: "Carryl Ryan Abarquez",
    role: "Lead Developer",
    image: "/team/carryl.jpg",
    description: "Full Stack Developer and Database Administrator"
  },
  {
    name: "Jeian Jasper Obelidor",
    role: "Front-End Developer  / UI/UX Designer",
    image: "/team/jeianpfp.jpg",
    description: "Creating advance interactive interfaces"
  },
  {
    name: "Mark Angelo Oyales",
    role: "Project Manager / Developer",
    image: "/team/gelo.jpg",
    description: "Healthcare innovation strategist"
  },
  {
    name: "John David Ramos",
    role: "Backend Developer",
    image: "/team/jhonny.jpg",
    description: "Front End Developer and UI/UX Designer"
  },
  {
    name: "Luiz Peyes",
    role: " Documentation / Developer",
    image: "/team/peyes.png",
    description: "Documentation and Hardware Specialist"
  },
  {
    name: "Neil Viloria",
    role: "Documentation / Developer",
    image: "/team/neil.jpg",
    description: "Documentation and Testing Specialist"
  },
  {
    name: "Allan Angelo Del Mundo",
    role: "Documentation / Developer",
    image: "/team/microcheatingboy.jpg",
    description: "Analyst and Solution Architect"
  },
  {
    name: "Luis Rualo",
    role: "Backend Developer",
    image: "/team/rualo.jpg",
    description: "Model Development and Database Management"
  },
  {
    name: "John Denmar Peña",
    role: "Documentation",
    image: "/team/banga.jpg",
    description: "I love you! I love you!"
  },
  {
    name: "Wyne Nutarte",
    role: "Runner",
    image: "/team/kupal.jpg",
    description: "best of everything"
  }
]

export default function Team() {
  return (
    <section className="py-20 bg-[#FFFFFF]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-dm-sans font-bold text-[#1A202C] mb-4">
            Meet Our Team
          </h2>
          <p className="text-lg text-[#1A202C]/70 font-dm-sans max-w-2xl mx-auto">
            Dedicated young adults professionals working together to revolutionize healthcare services of Baranggay Sta. Monica through modern technology.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-[#F3F3F3] rounded-xl overflow-hidden"
            >
              <div className="aspect-square relative">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-dm-sans font-bold text-[#1A202C] mb-2">
                  {member.name}
                </h3>
                <p className="text-[#ABF600] font-dm-sans font-medium mb-2">
                  {member.role}
                </p>
                <p className="text-[#1A202C]/70 font-dm-sans text-sm">
                  {member.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}