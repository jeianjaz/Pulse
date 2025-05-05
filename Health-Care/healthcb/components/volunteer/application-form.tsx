'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ApplicationFormProps {
  isOpen: boolean
  onClose: () => void
  opportunity: {
    id: string
    title: string
    category: string
  }
  onSubmit: (opportunityId: string) => Promise<void>
}

export function ApplicationForm({ isOpen, onClose, opportunity, onSubmit }: ApplicationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    motivation: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit(opportunity.id)
      toast.success('Application submitted successfully!')
      onClose()
      setFormData({
        name: '',
        email: '',
        phone: '',
        experience: '',
        motivation: ''
      })
    } catch (error) {
      toast.error('Failed to submit application. Please try again.')
    }

    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white relative rounded-xl shadow-lg p-6 w-full max-w-[500px] max-h-[90vh] overflow-y-auto"
        >
          {/* Background Elements */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#ABF600]/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#ABF600]/20 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[#1A202C]">
                Apply for {opportunity.title}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#1A202C]">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-[#1A202C] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#1A202C]">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-[#1A202C] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#1A202C]">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-[#1A202C] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#1A202C]">
                  Relevant Experience
                </label>
                <textarea
                  required
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="Describe any relevant experience you have"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-[#1A202C] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ABF600] focus:border-transparent min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#1A202C]">
                  Motivation
                </label>
                <textarea
                  required
                  value={formData.motivation}
                  onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                  placeholder="Why do you want to volunteer for this opportunity?"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-[#1A202C] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ABF600] focus:border-transparent min-h-[100px]"
                />
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  variant="outline"
                  className="border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#ABF600] hover:bg-[#ABF600]/90 text-[#1A202C]"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
