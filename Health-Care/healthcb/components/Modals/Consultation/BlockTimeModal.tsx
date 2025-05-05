'use client';

import { useState } from 'react';
import { Modal } from '@/components/Modals/ScheduleModal';
import { motion } from 'framer-motion';
import { Calendar, Clock, AlertCircle, Tag } from 'lucide-react';

interface BlockTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    startDate: Date;
    endDate: Date;
    startTime?: string;
    endTime?: string;
    reason: string;
    category: string;
    priority: string;
    recurring: boolean;
    recurringPattern: string;
    recurringInterval: number;
    exceptionDates: Date[];
  }) => void;
  isLoading: boolean;
}

export function BlockTimeModal({ isOpen, onClose, onSubmit, isLoading }: BlockTimeModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [isPartialDay, setIsPartialDay] = useState(false);
  const [reason, setReason] = useState('');
  const [category, setCategory] = useState('vacation');
  const [priority, setPriority] = useState('normal');
  const [recurring, setRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState('weekly');
  const [recurringInterval, setRecurringInterval] = useState(1);
  const [exceptionDates, setExceptionDates] = useState<Date[]>([]);
  const [error, setError] = useState('');

  const categories = [
    { value: 'vacation', label: 'Vacation' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'training', label: 'Training' },
    { value: 'personal', label: 'Personal' },
    { value: 'other', label: 'Other' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: '#4477FF' },
    { value: 'normal', label: 'Normal', color: '#44DD77' },
    { value: 'high', label: 'High', color: '#FF4444' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate dates
    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date');
      return;
    }

    if (new Date(startDate) < new Date()) {
      setError('Cannot block time in the past');
      return;
    }

    // Validate times if partial day
    if (isPartialDay && startTime >= endTime) {
      setError('Start time must be before end time');
      return;
    }

    onSubmit({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      startTime: isPartialDay ? startTime : undefined,
      endTime: isPartialDay ? endTime : undefined,
      reason: reason.trim(),
      category,
      priority,
      recurring,
      recurringPattern,
      recurringInterval,
      exceptionDates
    });
  };

  const handleAddException = (date: string) => {
    const newDate = new Date(date);
    if (!exceptionDates.some(d => d.toDateString() === newDate.toDateString())) {
      setExceptionDates([...exceptionDates, newDate]);
    }
  };

  const handleRemoveException = (date: Date) => {
    setExceptionDates(exceptionDates.filter(d => d.toDateString() !== date.toDateString()));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Block Time Off">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
          >
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}

        {/* Date Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border rounded-lg p-2 pl-10 bg-gray-50 text-black focus:outline-none focus:ring-2 focus:ring-[#ABF600] focus:border-[#ABF600]"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border rounded-lg p-2 pl-10 bg-gray-50 text-black focus:outline-none focus:ring-2 focus:ring-[#ABF600] focus:border-[#ABF600]"
                required
              />
            </div>
          </div>
        </div>

        {/* Partial Day Option */}
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="partialDay"
              checked={isPartialDay}
              onChange={(e) => setIsPartialDay(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="partialDay" className="text-sm font-medium">Partial day block</label>
          </div>

          {isPartialDay && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 gap-4"
            >
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
            </motion.div>
          )}
        </div>

        {/* Category and Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border rounded-lg p-2 pl-10 bg-gray-50 text-black focus:outline-none focus:ring-2 focus:ring-[#ABF600] focus:border-[#ABF600]"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full border rounded-lg p-2 bg-gray-50 text-black focus:outline-none focus:ring-2 focus:ring-[#ABF600] focus:border-[#ABF600]"
            >
              {priorities.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium mb-1">Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border rounded-lg p-2 bg-gray-50 text-black focus:outline-none focus:ring-2 focus:ring-[#ABF600] focus:border-[#ABF600]"
            rows={3}
            required
          />
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
            <label htmlFor="recurring" className="text-sm font-medium">Make this a recurring block</label>
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

              {/* Exception Dates */}
              <div>
                <label className="block text-sm font-medium mb-1">Exception Dates</label>
                <div className="space-y-2">
                  <input
                    type="date"
                    onChange={(e) => handleAddException(e.target.value)}
                    className="w-full border rounded-lg p-2 bg-gray-50 text-black focus:outline-none focus:ring-2 focus:ring-[#ABF600] focus:border-[#ABF600]"
                  />
                  <div className="flex flex-wrap gap-2">
                    {exceptionDates.map(date => (
                      <motion.div
                        key={date.toISOString()}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg"
                      >
                        <span className="text-sm">{date.toLocaleDateString()}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveException(date)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          ×
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

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
            {isLoading ? 'Blocking...' : 'Block Time'}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
}