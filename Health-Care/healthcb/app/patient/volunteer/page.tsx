'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ApplicationForm } from '@/components/volunteer/application-form'
import { Toaster, toast } from 'sonner'
import { Search, Calendar, MapPin, Users } from 'lucide-react'
import Image from 'next/image'

interface Opportunity {
  id: string
  title: string
  category: string
  date: string
  location: string
  spots: number
  description: string
}

const opportunities: Opportunity[] = [
  {
    id: '1',
    title: 'Hospital Support Volunteer',
    category: 'Patient Care',
    date: '2024-02-15',
    location: 'Main Hospital Wing',
    spots: 5,
    description: 'Assist hospital staff with non-medical tasks and provide companionship to patients.'
  },
  {
    id: '2',
    title: 'Medical Records Assistant',
    category: 'Administrative',
    date: '2024-02-20',
    location: 'Records Department',
    spots: 3,
    description: 'Help organize and digitize medical records while maintaining patient confidentiality.'
  },
  {
    id: '3',
    title: 'Community Health Educator',
    category: 'Education',
    date: '2024-02-25',
    location: 'Community Center',
    spots: 4,
    description: 'Conduct health education sessions for local community members.'
  },
]

export default function VolunteerPage() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const handleApply = async (opportunityId: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('Application submitted successfully!')
  }

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || opp.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(opportunities.map(opp => opp.category)))

  return (
    <div className="min-h-screen bg-[#FAFAFA] relative overflow-hidden">
      <Toaster richColors position="top-center" />
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Logo Animation 1 */}
        <motion.div
          className="absolute top-20 left-[10%]"
          animate={{
            y: [0, -20, 0],
            opacity: [0.4, 0.7, 0.4],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Image
            src="/healthcb.png"
            alt="Logo"
            width={120}
            height={120}
            className="opacity-30"
          />
        </motion.div>

        {/* Logo Animation 2 */}
        <motion.div
          className="absolute bottom-40 right-[15%]"
          animate={{
            y: [0, 20, 0],
            opacity: [0.3, 0.6, 0.3],
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        >
          <Image
            src="/healthcb.png"
            alt="Logo"
            width={180}
            height={180}
            className="opacity-25"
          />
        </motion.div>

        {/* Additional Decorative Elements */}
        <motion.div
          className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(171,246,0,0.15) 0%, rgba(171,246,0,0) 70%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute bottom-1/4 right-1/3 w-96 h-96 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(171,246,0,0.12) 0%, rgba(171,246,0,0) 70%)",
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      {/* Static Background Gradients */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#ABF600]/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#ABF600]/15 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#ABF600]/10 rounded-full blur-3xl" />

      {/* Back to Dashboard Button */}
      <div className="absolute top-4 left-4 z-20">
        <a
          href="/patient"
          className="inline-flex items-center px-4 py-2 bg-white/90 hover:bg-white text-[#1A202C] rounded-lg shadow-sm transition-colors group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Dashboard
        </a>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-[#ABF600]/10 to-transparent pt-16 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#1A202C] mb-4">
              Volunteer Opportunities
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join us in making a difference in healthcare. Your time and skills can help create a healthier community.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative -mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search opportunities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-lg ${
                    !selectedCategory
                      ? 'bg-[#ABF600] text-[#1A202C] font-medium'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                      selectedCategory === category
                        ? 'bg-[#ABF600] text-[#1A202C] font-medium'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Opportunities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {filteredOpportunities.map((opportunity) => (
              <motion.div
                key={opportunity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ABF600]/5 rounded-full blur-2xl group-hover:bg-[#ABF600]/10 transition-colors" />
                
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 bg-[#ABF600]/10 text-[#1A202C] text-sm font-medium rounded-full mb-2">
                        {opportunity.category}
                      </span>
                      <h3 className="text-xl font-semibold text-[#1A202C]">
                        {opportunity.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {opportunity.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        {new Date(opportunity.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm">{opportunity.location}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="text-sm">{opportunity.spots} spots available</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedOpportunity(opportunity)}
                    className="w-full px-4 py-2 bg-[#ABF600] hover:bg-[#ABF600]/90 text-[#1A202C] font-medium rounded-lg transition-colors"
                  >
                    Apply Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <ApplicationForm
        isOpen={!!selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
        opportunity={selectedOpportunity!}
        onSubmit={handleApply}
      />
    </div>
  )
}
