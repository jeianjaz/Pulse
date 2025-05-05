'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, Filter, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '@/app/patient/consultations/calendar-custom.css'; // Import custom calendar styles
import availabilityApi from '@/services/availabilityApi';
import consultationRequestApi from '@/services/consultationRequestApi';
import { DoctorAvailability } from '@/types/api-models';
import toast from 'react-hot-toast';

// Define primary symptoms that will have Yes/No selection
const PRIMARY_SYMPTOMS = ['Fever', 'Cough', 'Fatigue', 'Difficulty Breathing'];

// Define secondary symptoms that remain as checkboxes
const SECONDARY_SYMPTOMS = [
  'Headache', 'Sore Throat', 'Shortness of Breath', 'Chest Pain', 'Abdominal Pain', 
  'Nausea', 'Diarrhea', 'Rash', 'Joint Pain'
];

// Preset consultation reasons
const CONSULTATION_REASONS = [
  'Checkup', 'Follow-up', 'New Condition', 'Medication Refill', 
  'Lab Results Review', 'Chronic Disease Management', 'Other'
];

const BLOOD_PRESSURE_OPTIONS = ['Normal', 'High', 'Low', 'Unknown'];
const CHOLESTEROL_OPTIONS = ['Normal', 'High', 'Borderline High', 'Unknown'];

interface BookingModalProps {
  availabilitySlot: DoctorAvailability;
  onClose: () => void;
  onSubmit: (data: { 
    reason: string; 
    symptoms: Record<string, string | boolean>; 
    additionalNotes: string;
    patientMetrics: {
      bloodPressure: string;
      cholesterolLevel: string;
    }
  }) => void;
}

const BookingModal = ({ availabilitySlot, onClose, onSubmit }: BookingModalProps) => {
  const [reason, setReason] = useState(CONSULTATION_REASONS[0]);
  const [otherReason, setOtherReason] = useState('');
  
  // Initialize primary symptoms with 'No' values
  const [primarySymptoms, setPrimarySymptoms] = useState<Record<string, string>>(
    PRIMARY_SYMPTOMS.reduce((acc, symptom) => ({...acc, [symptom]: 'No'}), {})
  );
  
  // Initialize secondary symptoms with false values
  const [secondarySymptoms, setSecondarySymptoms] = useState<Record<string, boolean>>(
    SECONDARY_SYMPTOMS.reduce((acc, symptom) => ({...acc, [symptom]: false}), {})
  );
  
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [bloodPressure, setBloodPressure] = useState('Normal');
  const [cholesterolLevel, setCholesterolLevel] = useState('Normal');
  
  const handlePrimarySymptomChange = (symptom: string, value: string) => {
    setPrimarySymptoms(prev => ({
      ...prev,
      [symptom]: value
    }));
  };
  
  const handleSecondarySymptomChange = (symptom: string) => {
    setSecondarySymptoms(prev => ({
      ...prev,
      [symptom]: !prev[symptom]
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalReason = reason === 'Other' ? otherReason.trim() : reason;
    
    if (!finalReason) {
      toast.error('Please provide a reason for the consultation');
      return;
    }
    
    // Combine primary and secondary symptoms for submission
    const combinedSymptoms = {
      ...primarySymptoms,
      ...secondarySymptoms
    };
    
    onSubmit({
      reason: finalReason,
      symptoms: combinedSymptoms,
      additionalNotes,
      patientMetrics: {
        bloodPressure,
        cholesterolLevel
      }
    });
  };
  
  return (
    <div className="fixed inset-0 isolate bg-black bg-opacity-50 flex items-center justify-center z-[100]" style={{ margin: 0 }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] shadow-xl modal-content"
        style={{
          overflowY: 'auto',
          scrollBehavior: 'smooth'
        }}
      >
        <style jsx global>{`
          .modal-content::-webkit-scrollbar {
            width: 8px;
          }
          .modal-content::-webkit-scrollbar-track {
            background: transparent;
            margin: 4px;
          }
          .modal-content::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 20px;
            transition: background 0.2s ease;
          }
          .modal-content::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.3);
          }
          .modal-content {
            scrollbar-width: thin;
            scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
          }
        `}</style>

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Request Consultation</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-6 p-4 bg-[#ABF600]/10 rounded-lg border border-[#ABF600]/20">
          <div className="text-gray-600 mb-1">Selected Time</div>
          <div className="font-medium text-[#1A202C]">
            {format(parseISO(availabilitySlot.date), 'MMMM d, yyyy')}
          </div>
          <div className="text-lg font-semibold text-[#1A202C]">
            {availabilitySlot.start_time.slice(0, 5)} - {availabilitySlot.end_time.slice(0, 5)}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Consultation
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ABF600] focus:border-transparent bg-[#F9FAFB] text-gray-600"
              required
            >
              {CONSULTATION_REASONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            
            {reason === 'Other' && (
              <input
                type="text"
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ABF600] focus:border-transparent bg-[#F9FAFB] text-gray-600"
                placeholder="Please specify reason"
                required
              />
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Primary Symptoms
            </label>
            <div className="space-y-3">
              {PRIMARY_SYMPTOMS.map((symptom) => (
                <div key={symptom} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <span className="text-gray-700">{symptom}</span>
                  <div className="flex gap-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`symptom-${symptom}`}
                        checked={primarySymptoms[symptom] === 'Yes'}
                        onChange={() => handlePrimarySymptomChange(symptom, 'Yes')}
                        className="mr-1 text-[#ABF600] focus:ring-[#ABF600]"
                      />
                      <span className="text-sm">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`symptom-${symptom}`}
                        checked={primarySymptoms[symptom] === 'No'}
                        onChange={() => handlePrimarySymptomChange(symptom, 'No')}
                        className="mr-1 text-[#ABF600] focus:ring-[#ABF600]"
                      />
                      <span className="text-sm">No</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Additional Symptoms
            </label>
            <div className="space-y-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              {SECONDARY_SYMPTOMS.map((symptom) => (
                <div key={symptom} className="flex items-center mb-2">
                  <input
                    id={`symptom-${symptom}`}
                    type="checkbox"
                    checked={secondarySymptoms[symptom]}
                    onChange={() => handleSecondarySymptomChange(symptom)}
                    className="w-4 h-4 text-[#ABF600] bg-gray-100 rounded border-gray-300 focus:ring-[#ABF600] focus:ring-2"
                  />
                  <label 
                    htmlFor={`symptom-${symptom}`} 
                    className="ml-2 text-sm text-gray-700 cursor-pointer"
                  >
                    {symptom}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Medical History
            </label>
            
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Past History of Blood Pressure
                </label>
                <select
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ABF600] focus:border-transparent bg-white text-gray-600"
                >
                  {BLOOD_PRESSURE_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Past History of Cholesterol Level
                </label>
                <select
                  value={cholesterolLevel}
                  onChange={(e) => setCholesterolLevel(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ABF600] focus:border-transparent bg-white text-gray-600"
                >
                  {CHOLESTEROL_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (optional)
            </label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ABF600] focus:border-transparent bg-[#F9FAFB] text-gray-600 placeholder-gray-400 h-32 resize-none"
              placeholder="Any additional information that might be helpful for the doctor"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 bg-[#ABF600] text-[#1A202C] px-4 py-2 rounded-xl hover:bg-[#9DE100] transition-colors shadow-lg hover:shadow-xl font-medium"
            >
              Submit Request
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default function ConsultationBooking() {
  const [date, setDate] = useState<Value>(new Date());
  const [availableSlots, setAvailableSlots] = useState<DoctorAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [specialty, setSpecialty] = useState<string>('');
  const [specialties, setSpecialties] = useState<string[]>(['Cardiology', 'Dermatology', 'Pediatrics', 'General Medicine']);
  const [selectedSlot, setSelectedSlot] = useState<DoctorAvailability | null>(null);
  
  useEffect(() => {
    if (date) {
      fetchAvailableSlots();
    }
  }, [date, specialty]);
  
  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      
      const params: { date?: string; specialty?: string } = {};
      
      if (date instanceof Date) {
        params.date = format(date, 'yyyy-MM-dd');
      }
      
      if (specialty) {
        params.specialty = specialty;
      }
      
      const response = await availabilityApi.getAvailableSlots(params);
      setAvailableSlots(response.data || []);
    } catch (error) {
      console.error('Failed to fetch available slots:', error);
      toast.error('Failed to load available consultation slots');
    } finally {
      setLoading(false);
    }
  };
  
  const handleBooking = async (data: { 
    reason: string; 
    symptoms: Record<string, string | boolean>; 
    additionalNotes: string;
    patientMetrics: {
      bloodPressure: string;
      cholesterolLevel: string;
    }
  }) => {
    if (!selectedSlot) return;
    
    try {
      await consultationRequestApi.createRequest({
        availability_id: selectedSlot.availability_id,
        reason: data.reason,
        symptoms: data.symptoms,
        patient_metrics: {
          "Blood Pressure": data.patientMetrics.bloodPressure,
          "Cholesterol Level": data.patientMetrics.cholesterolLevel
        },
        additional_notes: data.additionalNotes
      });
      
      toast.success('Consultation request submitted successfully');
      setSelectedSlot(null);
      fetchAvailableSlots();
    } catch (error) {
      console.error('Failed to create consultation request:', error);
      if (error.response?.data?.errors) {
        const errorMessage = Object.values(error.response.data.errors).join(', ');
        toast.error(`Request failed: ${errorMessage}`);
      } else {
        toast.error('Failed to submit consultation request');
      }
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-[#1A202C]">Select Date</h2>
            <CalendarIcon className="w-6 h-6 text-[#ABF600]" />
          </div>
          <Calendar
            onChange={setDate}
            value={date}
            minDate={new Date()}
            className="booking-calendar" // Apply custom class
            tileClassName={({ date: tileDate }) => {
              const hasAvailableSlots = availableSlots.some(
                slot => new Date(slot.date).toDateString() === tileDate.toDateString()
              );
              return hasAvailableSlots ? 'has-slots' : '';
            }}
          />
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Specialty
            </label>
            <div className="relative">
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ABF600] focus:border-transparent bg-[#F9FAFB] text-gray-600 appearance-none"
              >
                <option value="">All Specialties</option>
                {specialties.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-[#1A202C]">Available Slots</h2>
            <Clock className="w-6 h-6 text-[#ABF600]" />
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={`loading-${i}`} className="animate-pulse space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableSlots.map((slot) => (
                <button
                  key={slot.availability_id}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md text-left ${
                    selectedSlot?.availability_id === slot.availability_id
                      ? 'border-[#ABF600] bg-[#ABF600]/10'
                      : 'border-gray-200 hover:border-[#ABF600]'
                  }`}
                >
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">
                      {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>Doctor: {slot.doctor.name}</p>
                    <p>Specialty: {slot.doctor.specialization || 'General'}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No available slots for this date.</p>
              <p className="text-sm mt-2">Please select another date.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-[#1A202C] mb-6">Consultation Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-[#ABF600]/10 via-[#ABF600]/5 to-transparent rounded-lg border border-[#ABF600]/20">
            <div className="p-3 bg-[#ABF600]/20 rounded-lg">
              <Clock className="w-6 h-6 text-[#1A202C]" />
            </div>
            <div>
              <p className="font-bold text-[#1A202C] text-lg">Duration</p>
              <p className="text-gray-600">30 minutes per session</p>
            </div>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {selectedSlot && (
          <BookingModal
            availabilitySlot={selectedSlot}
            onClose={() => setSelectedSlot(null)}
            onSubmit={handleBooking}
          />
        )}
      </AnimatePresence>
    </div>
  );
}