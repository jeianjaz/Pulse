import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface EventRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: EventRegistrationFormData) => void;
  eventTitle: string;
}

export interface EventRegistrationFormData {
  notes?: string;
}

const EventRegistrationModal: React.FC<EventRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  eventTitle,
}) => {
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ notes });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl w-full max-w-md overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-[#1A202C]">Register for Event</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Event</h3>
                <p className="text-gray-600">{eventTitle}</p>
              </div>

              <div className="mb-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-500 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ABF600] resize-none bg-gray-50"
                  rows={4}
                  placeholder="Any additional information you'd like to share"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ABF600] text-[#1A202C] rounded-lg hover:bg-[#9DE100] transition-colors"
                >
                  Submit Registration
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EventRegistrationModal;
