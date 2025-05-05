'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/Modals/ScheduleModal';
import { motion } from 'framer-motion';
import { Clock, Users, Calendar, RotateCcw, AlertCircle, Trash2, AlertOctagon } from 'lucide-react';

interface AddTimeSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    slots: {
      startTime: string;
      endTime: string;
      capacity: number;
      slotDuration: number;
      breakTime: number;
    }[];
    recurring: boolean;
    days: string[];
    slotType: string;
    recurringPattern: string;
    recurringInterval: number;
  }) => void;
  selectedDate: Date;
  isLoading: boolean;
  dailyLimit: number;
  existingSlots: number;
}

export function AddTimeSlotModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  selectedDate, 
  isLoading,
  dailyLimit,
  existingSlots
}: AddTimeSlotModalProps) {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [recurring, setRecurring] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [slotDuration, setSlotDuration] = useState(30);
  const [breakTime, setBreakTime] = useState(5);
  const [capacity, setCapacity] = useState(1);
  const [slotType, setSlotType] = useState('regular');
  const [recurringPattern, setRecurringPattern] = useState('weekly');
  const [recurringInterval, setRecurringInterval] = useState(1);
  const [showConflicts, setShowConflicts] = useState(false);
  const [previewSlots, setPreviewSlots] = useState<string[]>([]);
  const [timeError, setTimeError] = useState<string | null>(null);
  const [exceedsLimit, setExceedsLimit] = useState(false);

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const slotTemplates = [
    { duration: 15, label: '15 min' },
    { duration: 30, label: '30 min' },
    { duration: 60, label: '1 hour' }
  ];

  const slotTypes = [
    { value: 'regular', label: 'Regular Appointment', color: '#ABF600' },
    { value: 'urgent', label: 'Urgent Care', color: '#FF4444' },
    { value: 'followup', label: 'Follow-up', color: '#4477FF' },
    { value: 'consultation', label: 'Consultation', color: '#44DD77' }
  ];

  const handleQuickTemplate = (duration: number) => {
    setSlotDuration(duration);
  };

  const isValidTimeSlot = (slotStartTime: string, slotEndTime: string) => {
    const [startHours, startMinutes] = slotStartTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const [slotEndHours, slotEndMinutes] = slotEndTime.split(':').map(Number);

    const totalEndMinutes = endHours * 60 + endMinutes;
    const slotEndTotalMinutes = slotEndHours * 60 + slotEndMinutes;

    return slotEndTotalMinutes <= totalEndMinutes;
  };

  const handleBulkCreate = (start: string, end: string, duration: number, breakDuration: number) => {
    const slots: string[] = [];
    let currentTime = start;
    
    while (true) {
      const potentialEndTime = calculateEndTime(currentTime, duration);
      
      // Check both time and slot limit
      if (!isValidTimeSlot(currentTime, potentialEndTime)) {
        setTimeError('Some slots were omitted as they would exceed the end time');
        break;
      }

      if (slots.length + existingSlots >= dailyLimit) {
        setTimeError(`Cannot add more slots: Daily limit of ${dailyLimit} would be exceeded`);
        break;
      }
      
      slots.push(currentTime);
      
      const [hours, minutes] = currentTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes + duration + breakDuration;
      const nextHours = Math.floor(totalMinutes / 60);
      const nextMinutes = totalMinutes % 60;
      currentTime = `${String(nextHours).padStart(2, '0')}:${String(nextMinutes).padStart(2, '0')}`;
    }
    
    setPreviewSlots(slots);
    return slots;
  };

  useEffect(() => {
    handleBulkCreate(startTime, endTime, slotDuration, breakTime);
  }, [startTime, endTime, slotDuration, breakTime]);

  useEffect(() => {
    const totalSlots = previewSlots.length + existingSlots;
    setExceedsLimit(totalSlots > dailyLimit);
  }, [previewSlots, dailyLimit, existingSlots]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeError(null);
    
    if (previewSlots.length + existingSlots > dailyLimit) {
      setTimeError(`Cannot create slots: Would exceed daily limit of ${dailyLimit}`);
      return;
    }
    
    // Generate all time slots
    const timeSlots = handleBulkCreate(startTime, endTime, slotDuration, breakTime);
    
    if (timeSlots.length === 0) {
      setTimeError('No valid time slots could be created with the current settings');
      return;
    }
    
    // Submit slots with capacity and duration information
    onSubmit({
      slots: timeSlots.map(time => ({
        startTime: time,
        endTime: calculateEndTime(time, slotDuration),
        capacity,
        slotDuration,
        breakTime
      })),
      recurring,
      days: selectedDays,
      slotType,
      recurringPattern,
      recurringInterval
    });
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  const removeSlot = (slotToRemove: string) => {
    setPreviewSlots(prev => prev.filter(slot => slot !== slotToRemove));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Time Slot">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Add Daily Limit Info */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium">Daily Consultation Limit</span>
          </div>
          <span className={`font-bold ${exceedsLimit ? 'text-red-500' : 'text-green-500'}`}>
            {existingSlots + previewSlots.length} / {dailyLimit}
          </span>
        </div>

        {/* Quick Templates */}
        <div className="flex gap-2 mb-4">
          {slotTemplates.map(template => (
            <motion.button
              key={template.duration}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickTemplate(template.duration)}
              className={`px-3 py-1.5 rounded-lg ${
                slotDuration === template.duration
                  ? 'bg-[#ABF600] text-[#1A202C]'
                  : 'bg-gray-100 hover:bg-gray-200'
              } transition-colors`}
            >
              {template.label}
            </motion.button>
          ))}
        </div>

        {/* Time Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border rounded-lg p-2 pl-10 bg-gray-50 text-black focus:outline-none focus:ring-2 focus:ring-[#ABF600] focus:border-[#ABF600]"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">End Time</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border rounded-lg p-2 pl-10 bg-gray-50 text-black focus:outline-none focus:ring-2 focus:ring-[#ABF600] focus:border-[#ABF600]"
                required
              />
            </div>
          </div>
        </div>

        {/* Slot Configuration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Slot Duration (min)</label>
            <input
              type="number"
              value={slotDuration}
              onChange={(e) => setSlotDuration(Number(e.target.value))}
              min={5}
              max={240}
              className="w-full border rounded-lg p-2 bg-gray-50 text-black focus:outline-none focus:ring-2 focus:ring-[#ABF600] focus:border-[#ABF600]"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Break Time (min)</label>
            <input
              type="number"
              value={breakTime}
              onChange={(e) => setBreakTime(Number(e.target.value))}
              min={0}
              max={60}
              className="w-full border rounded-lg p-2 bg-gray-50 text-black focus:outline-none focus:ring-2 focus:ring-[#ABF600] focus:border-[#ABF600]"
              required
            />
          </div>
        </div>

        {/* Capacity and Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Capacity per Slot</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                min={1}
                max={10}
                className="w-full border rounded-lg p-2 pl-10 bg-gray-50 text-black focus:outline-none focus:ring-2 focus:ring-[#ABF600] focus:border-[#ABF600]"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Slot Type</label>
            <select
              value={slotType}
              onChange={(e) => setSlotType(e.target.value)}
              className="w-full border rounded-lg p-2 bg-gray-50 text-black focus:outline-none focus:ring-2 focus:ring-[#ABF600] focus:border-[#ABF600]"
            >
              {slotTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Recurring Settings */}
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="recurring"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="recurring" className="text-sm font-medium">Make this a recurring slot</label>
          </div>

          {recurring && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 border-l-2 border-[#ABF600] pl-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Recurring Pattern</label>
                  <select
                    value={recurringPattern}
                    onChange={(e) => setRecurringPattern(e.target.value)}
                    className="w-full border rounded-lg p-2 bg-gray-50 text-black focus:outline-none focus:ring-2 focus:ring-[#ABF600] focus:border-[#ABF600]"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Repeat Every</label>
                  <div className="relative">
                    <RotateCcw className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={recurringInterval}
                      onChange={(e) => setRecurringInterval(Number(e.target.value))}
                      min={1}
                      max={12}
                      className="w-full border rounded-lg p-2 pl-10 bg-gray-50 text-black focus:outline-none focus:ring-2 focus:ring-[#ABF600] focus:border-[#ABF600]"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Repeat on:</label>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map(day => (
                    <motion.button
                      key={day}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (selectedDays.includes(day)) {
                          setSelectedDays(selectedDays.filter(d => d !== day));
                        } else {
                          setSelectedDays([...selectedDays, day]);
                        }
                      }}
                      className={`p-2 rounded-lg text-sm ${
                        selectedDays.includes(day)
                          ? 'bg-[#ABF600] text-[#1A202C]'
                          : 'bg-gray-100 hover:bg-gray-200'
                      } transition-colors`}
                    >
                      {day.slice(0, 1)}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Add Time Error Message */}
        {timeError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700"
          >
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{timeError}</span>
          </motion.div>
        )}

        {/* Preview Section */}
        {previewSlots.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-3">Preview Time Slots ({previewSlots.length})</h3>
            <div className="max-h-48 overflow-y-auto space-y-2 p-2 border rounded-lg bg-gray-50">
              {previewSlots.map((slot) => (
                <motion.div
                  key={slot}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      {slot} - {calculateEndTime(slot, slotDuration)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSlot(slot)}
                    className="p-1 hover:bg-red-50 rounded-full text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Add warning for limit */}
        {exceedsLimit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
          >
            <AlertOctagon className="w-5 h-5" />
            <span className="text-sm">
              These slots would exceed the daily limit of {dailyLimit} consultations
            </span>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <motion.button 
            type="submit" 
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-[#ABF600] text-[#1A202C] rounded-lg hover:bg-[#9DE100] transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Adding...' : 'Add Slot'}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
}