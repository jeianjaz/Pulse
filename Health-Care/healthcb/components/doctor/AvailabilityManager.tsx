'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, ArrowLeft, ArrowRight, Plus, Clock, X, Clock3, Users, Trash2, AlertOctagon, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import availabilityApi from '@/services/availabilityApi';
import { DoctorAvailability } from '@/types/api-models';
import toast from 'react-hot-toast';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '@/app/doctor/consultations/calendar.css';
import { Modal } from '@/components/Modals/ScheduleModal';

interface AvailabilitySlot {
  startTime: string;
  endTime: string;
}

interface AddSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    slots: Array<{
      startTime: string;
      endTime: string;
      slotDuration: number;
      breakTime: number;
    }>;
    recurring: boolean;
    days: string[];
    recurringDuration: number;
  }) => void;
  selectedDate: Date;
  isLoading: boolean;
  dailyLimit: number;
  existingSlots: number;
}

const AddSlotModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedDate,
  isLoading,
  dailyLimit,
  existingSlots
}: AddSlotModalProps) => {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [recurring, setRecurring] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [slotDuration, setSlotDuration] = useState(30);
  const [breakTime, setBreakTime] = useState(5);
  const [previewSlots, setPreviewSlots] = useState<string[]>([]);
  const [timeError, setTimeError] = useState<string | null>(null);
  const [exceedsLimit, setExceedsLimit] = useState(false);
  const [recurringDuration, setRecurringDuration] = useState(4);

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const slotTemplates = [
    { duration: 15, label: '15 min' },
    { duration: 30, label: '30 min' },
    { duration: 60, label: '1 hour' }
  ];

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
    
    const timeSlots = handleBulkCreate(startTime, endTime, slotDuration, breakTime);
    
    if (timeSlots.length === 0) {
      setTimeError('No valid time slots could be created with the current settings');
      return;
    }
    
    onSubmit({
      slots: timeSlots.map(time => ({
        startTime: time,
        endTime: calculateEndTime(time, slotDuration),
        slotDuration,
        breakTime
      })),
      recurring,
      days: selectedDays,
      recurringDuration
    });
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  const isValidTimeSlot = (slotStartTime: string, slotEndTime: string) => {
    const [startHours, startMinutes] = slotStartTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const [slotEndHours, slotEndMinutes] = slotEndTime.split(':').map(Number);
    
    const totalStartMinutes = startHours * 60 + startMinutes;
    const totalEndMinutes = endHours * 60 + endMinutes;
    const slotEndTotalMinutes = slotEndHours * 60 + slotEndMinutes;

    return slotEndTotalMinutes <= totalEndMinutes;
  };

  const handleBulkCreate = (start: string, end: string, duration: number, breakDuration: number) => {
    const slots: string[] = [];
    let currentTime = start;
    
    while (true) {
      const potentialEndTime = calculateEndTime(currentTime, duration);
      
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

  const handleQuickTemplate = (duration: number) => {
    setSlotDuration(duration);
  };

  const removeSlot = (slotToRemove: string) => {
    setPreviewSlots(prev => prev.filter(slot => slot !== slotToRemove));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Availability">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-3 p-3 bg-[#ABF600]/10 rounded-lg border border-[#ABF600]/20 mb-4">
          <CalendarIcon className="w-5 h-5 text-[#1A202C]" />
          <div>
            <div className="text-sm text-gray-600">Adding availability for</div>
            <div className="font-semibold text-[#1A202C]">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium">Daily Availability Limit</span>
          </div>
          <span className={`font-bold ${exceedsLimit ? 'text-red-500' : 'text-green-500'}`}>
            {existingSlots + previewSlots.length} / {dailyLimit}
          </span>
        </div>

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

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="recurring"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="recurring" className="text-sm font-medium">Make this a recurring availability</label>
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
                  <label className="block text-sm font-medium mb-1">Recurring Duration (weeks)</label>
                  <input
                    type="number"
                    value={recurringDuration}
                    onChange={(e) => setRecurringDuration(Math.max(1, parseInt(e.target.value) || 1))}
                    min={1}
                    max={12}
                    className="w-full border rounded-lg p-2 bg-gray-50 text-black focus:outline-none focus:ring-2 focus:ring-[#ABF600] focus:border-[#ABF600]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date Preview</label>
                  <div className="w-full border rounded-lg p-2 bg-gray-50 text-black">
                    {format(
                      new Date(selectedDate.getTime() + recurringDuration * 7 * 24 * 60 * 60 * 1000),
                      'MMM d, yyyy'
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium mb-1">Repeat on:</label>
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

        {previewSlots.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-3">Preview Time Slots ({previewSlots.length})</h3>
            <div className="max-h-32 sm:max-h-48 overflow-y-auto space-y-2 p-2 border rounded-lg bg-gray-50">
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

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </button>
          <motion.button 
            type="submit" 
            disabled={isLoading || previewSlots.length === 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-[#ABF600] text-[#1A202C] rounded-lg hover:bg-[#9DE100] transition-colors disabled:opacity-50 w-full sm:w-auto order-1 sm:order-2"
          >
            {isLoading ? 'Adding...' : 'Add Slots'}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};

interface BlockTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { startDate: Date; endDate: Date; reason: string }) => void;
  selectedDate: Date;
  isLoading: boolean;
}

const BlockTimeModal = ({ isOpen, onClose, onSubmit, selectedDate, isLoading }: BlockTimeModalProps) => {
  const [startDate, setStartDate] = useState<string>(format(selectedDate, 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(selectedDate, 'yyyy-MM-dd'));
  const [reason, setReason] = useState('');
  
  useEffect(() => {
    setStartDate(format(selectedDate, 'yyyy-MM-dd'));
    setEndDate(format(selectedDate, 'yyyy-MM-dd'));
  }, [selectedDate]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      startDate: parseISO(startDate),
      endDate: parseISO(endDate),
      reason
    });
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Block Time Period">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100 mb-4">
          <CalendarIcon className="w-5 h-5 text-red-600" />
          <div>
            <div className="text-sm text-gray-600">Initially blocking from</div>
            <div className="font-semibold text-gray-800">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>
          
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>
          
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border rounded p-2 h-24"
            placeholder="Vacation, conference, personal leave, etc."
            required
          />
        </div>
          
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100 w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 w-full sm:w-auto order-1 sm:order-2"
          >
            Block Time
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default function AvailabilityManager() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(() => {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 3);
    return minDate;
  });
  const [availabilitySlots, setAvailabilitySlots] = useState<DoctorAvailability[]>([]);
  const [selectedDateSlots, setSelectedDateSlots] = useState<DoctorAvailability[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDateLoading, setSelectedDateLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const DefaultLimit = 10;
  const [dailyLimit, setDailyLimit] = useState(DefaultLimit);
  
  useEffect(() => {
    fetchAvailability();
  }, [currentDate]);
  
  useEffect(() => {
    fetchSelectedDateAvailability();
  }, [selectedDate]);
  
  const fetchAvailability = async () => {
    try {
      setLoading(true);
      
      const weekStartDate = new Date(currentDate);
      weekStartDate.setDate(currentDate.getDate() - currentDate.getDay());
      
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);
      
      const weeklyData = await availabilityApi.getDoctorAvailability({
        start_date: format(weekStartDate, 'yyyy-MM-dd'),
        end_date: format(weekEndDate, 'yyyy-MM-dd')
      });
      
      setAvailabilitySlots(weeklyData.data || []);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch availability:', error);
      toast.error('Failed to load your availability');
      setError('Failed to load availability data');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSelectedDateAvailability = async () => {
    try {
      setSelectedDateLoading(true);
      
      const selectedDateData = await availabilityApi.getDoctorAvailability({
        start_date: format(selectedDate, 'yyyy-MM-dd'),
        end_date: format(selectedDate, 'yyyy-MM-dd')
      });
      
      setSelectedDateSlots(selectedDateData.data || []);
    } catch (error) {
      console.error('Failed to fetch selected date availability:', error);
    } finally {
      setSelectedDateLoading(false);
    }
  };

  const getMinimumAllowedDate = () => {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 3);
    return minDate;
  };
  
  const handleDeleteSlot = async () => {
    if (!slotToDelete) return;
    
    try {
      setIsLoading(true);
      const success = await availabilityApi.deleteAvailabilitySlot(slotToDelete);
      
      if (success) {
        toast.success('Availability slot deleted successfully');
        
        setAvailabilitySlots(prev => prev.filter(slot => slot.id !== slotToDelete));
        setSelectedDateSlots(prev => prev.filter(slot => slot.id !== slotToDelete));
      }
    } catch (error) {
      console.error('Failed to delete availability slot:', error);
      toast.error('Failed to delete availability slot');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setSlotToDelete(null);
    }
  };

  const confirmDelete = (id: number) => {
    setSlotToDelete(id);
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setSlotToDelete(null);
  };
  
  const handleDateChange = (value: Date | null) => {
    if (value instanceof Date) {
      const minAllowedDate = getMinimumAllowedDate();
      if (value < minAllowedDate) {
        setError('Please select a date at least 3 days from today');
        return;
      }
      setError(null);
      setSelectedDate(value);
    }
  };
  
  const getExistingSlotCount = (date: Date) => {
    return selectedDateSlots.length;
  };

  const handleAddAvailabilitySubmit = async (data: {
    slots: Array<{
      startTime: string;
      endTime: string;
      slotDuration: number;
      breakTime: number;
    }>;
    recurring: boolean;
    days: string[];
    recurringDuration: number;
  }) => {
    try {
      setIsLoading(true);
      
      if (data.recurring && data.days.length > 0) {
        const endDate = new Date(selectedDate);
        endDate.setDate(selectedDate.getDate() + (data.recurringDuration * 7));
        
        await availabilityApi.createRecurringAvailability({
          start_date: format(selectedDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
          days_of_week: data.days.map(day => day.toLowerCase()),
          start_time: data.slots[0].startTime,
          end_time: data.slots[data.slots.length - 1].endTime,
        });
      } else {
        const promises = data.slots.map(slot => 
          availabilityApi.createAvailabilitySlot({
            date: format(selectedDate, 'yyyy-MM-dd'),
            start_time: slot.startTime,
            end_time: slot.endTime,
          })
        );
        
        await Promise.all(promises);
      }
      
      toast.success('Availability added successfully');
      setShowAddModal(false);
      fetchAvailability();
      fetchSelectedDateAvailability();
    } catch (error) {
      console.error('Failed to add availability:', error);
      toast.error('Failed to add availability');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockTime = async (data: { startDate: Date; endDate: Date; reason: string }) => {
    try {
      await availabilityApi.blockTime({
        start_date: format(data.startDate, 'yyyy-MM-dd'),
        end_date: format(data.endDate, 'yyyy-MM-dd'),
        reason: data.reason
      });
      toast.success('Time period blocked successfully');
      setShowBlockModal(false);
      fetchAvailability();
      fetchSelectedDateAvailability();
    } catch (error) {
      console.error('Failed to block time:', error);
      toast.error('Failed to block time period');
    }
  };
  
  const handleNextWeek = () => {
    const nextWeek = new Date(currentDate);
    nextWeek.setDate(currentDate.getDate() + 7);
    setCurrentDate(nextWeek);
  };
  
  const handlePrevWeek = () => {
    const prevWeek = new Date(currentDate);
    prevWeek.setDate(currentDate.getDate() - 7);
    setCurrentDate(prevWeek);
  };
  
  const getSlotsByDate = (date: string) => {
    return availabilitySlots.filter(slot => {
      return slot && slot.attributes && slot.attributes.date === date;
    });
  };
  
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() - currentDate.getDay() + i);
    return date;
  });
  
  return (
    <div className="relative">
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl shadow-md"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-6">
        <div className="md:col-span-8 lg:col-span-9">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-7">
              <div className="w-full bg-white rounded-lg p-5 shadow-sm">
                <Calendar
                  onChange={handleDateChange}
                  value={selectedDate}
                  minDate={getMinimumAllowedDate()}
                  tileDisabled={({ date }) => date < getMinimumAllowedDate()}
                  tileClassName={({ date }) => {
                    const hasAvailability = availabilitySlots.some(
                      (slot) => slot.attributes && slot.attributes.date === format(date, 'yyyy-MM-dd')
                    );
                    const isDisabled = date < getMinimumAllowedDate();
                    return `${hasAvailability ? 'has-appointments' : ''} ${isDisabled ? 'disabled-date' : ''}`;
                  }}
                  className="max-w-[400px] mx-auto"
                />
              </div>
            </div>
            
            <div className="md:col-span-5">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Selected Date Availability
                </h3>
                <div className="flex items-center space-x-3 mb-4">
                  <CalendarIcon className="w-5 h-5 text-[#1A202C]" />
                  <h4 className="text-md font-medium text-[#1A202C]">
                    {format(selectedDate, 'MMMM d, yyyy')}
                  </h4>
                </div>
                
                {selectedDateLoading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ) : selectedDateSlots.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <Clock3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No availability set for this date.</p>
                    <p className="text-sm mt-2">Click "Add Availability" to create slots.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateSlots.map((slot) => (
                      <div 
                        key={slot.id}
                        className="p-3 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span>
                            {slot.attributes && slot.attributes.start_time && typeof slot.attributes.start_time === 'string' 
                              ? slot.attributes.start_time.slice(0, 5) 
                              : '??:??'} - {
                            slot.attributes && slot.attributes.end_time && typeof slot.attributes.end_time === 'string' 
                              ? slot.attributes.end_time.slice(0, 5) 
                              : '??:??'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            slot.attributes && slot.attributes.status === 'available' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {slot.attributes ? slot.attributes.status : 'unknown'}
                          </span>
                          
                          {slot.attributes && slot.attributes.status === 'available' && (
                            <button
                              onClick={() => confirmDelete(slot.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                              title="Delete slot"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-4 lg:col-span-3">
          <div className="bg-white rounded-xl p-6 shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Actions</h3>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const minAllowedDate = getMinimumAllowedDate();
                  if (selectedDate < minAllowedDate) {
                    setError('Please select a date at least 3 days from today');
                    return;
                  }
                  setShowAddModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#ABF600] text-[#1A202C] px-4 py-2 rounded-lg hover:bg-[#9DE100] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Availability</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowBlockModal(true)}
                className="w-full flex items-center justify-center gap-2 bg-[#F3F3F3] text-[#1A202C] px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Clock className="w-4 h-4" />
                <span>Block Time</span>
              </motion.button>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Slot Limit:
              </label>
              <div className="flex">
                <input
                  type="number"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 border rounded-lg text-center focus:ring-2 focus:ring-[#ABF600] focus:border-[#ABF600]"
                  min="1"
                  max="50"
                />
              </div>
            </div>
            
            {/* Add note about availability restrictions */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> You can only add availability for dates at least 3 days from today.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Overview</h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock3 className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">Available Slots</span>
                  </div>
                  <span className="font-medium">
                    {availabilitySlots.filter(slot => slot.attributes && slot.attributes.status === 'available').length}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-gray-700">Booked Slots</span>
                  </div>
                  <span className="font-medium">
                    {availabilitySlots.filter(slot => slot.attributes && slot.attributes.status === 'booked').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mt-12 mb-2">Current Week Schedule</h3>
      <p className="text-sm text-gray-500 mb-4">Past days are dimmed. Today is highlighted.</p>
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={handlePrevWeek}
          className="p-2 rounded hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-lg font-medium">
          {format(weekDates[0], 'MMM d')} - {format(weekDates[6], 'MMM d, yyyy')}
        </div>
        <button 
          onClick={handleNextWeek}
          className="p-2 rounded hover:bg-gray-100"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDates.map((date, index) => {
          const dateString = format(date, 'yyyy-MM-dd');
          const slots = getSlotsByDate(dateString);
          const isToday = format(new Date(), 'yyyy-MM-dd') === dateString;
          const isSelected = format(selectedDate, 'yyyy-MM-dd') === dateString;
          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
          
          return (
            <div 
              key={index} 
              className={`border rounded-lg p-3 cursor-pointer transition-all ${
                isPast ? 'bg-gray-100 border-gray-200 opacity-60' : 
                isToday ? 'bg-blue-50 border-blue-200' : 
                isSelected ? 'bg-[#ABF600]/10 border-[#ABF600]' : ''
              }`}
              onClick={() => handleDateChange(date)}
            >
              <div className="font-medium mb-2 text-center">
                {format(date, 'EEE')}
                <div className={`text-lg ${
                  isPast ? 'text-gray-500' :
                  isToday ? 'text-blue-600 font-bold' : 
                  isSelected ? 'text-[#1A202C] font-bold' : ''
                }`}>
                  {format(date, 'd')}
                </div>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-auto">
                {loading && index < 2 ? (
                  <div className="animate-pulse h-20 bg-gray-100 rounded"></div>
                ) : (
                  slots.map((slot) => (
                    <div 
                      key={slot.id} 
                      className={`p-2 rounded text-sm ${
                        slot.attributes && slot.attributes.status === 'available' 
                          ? 'bg-green-100 border border-green-200' 
                          : slot.attributes && slot.attributes.status === 'blocked'
                            ? 'bg-red-100 border border-red-200'
                            : 'bg-yellow-100 border border-yellow-200'
                      } ${isPast ? 'opacity-50' : ''}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">
                          {slot.attributes && slot.attributes.start_time && typeof slot.attributes.start_time === 'string' 
                            ? slot.attributes.start_time.slice(0, 5) 
                            : '??:??'} - {
                          slot.attributes && slot.attributes.end_time && typeof slot.attributes.end_time === 'string' 
                            ? slot.attributes.end_time.slice(0, 5) 
                            : '??:??'}
                        </span>
                        
                        {/* Only show delete button for available slots that aren't in the past */}
                        {slot.attributes && slot.attributes.status === 'available' && !isPast && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete(slot.id);
                            }}
                            className="text-red-500 hover:text-red-700"
                            title="Delete slot"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="text-xs capitalize">
                        {slot.attributes ? slot.attributes.status : 'unknown'}
                      </div>
                    </div>
                  ))
                )}
                
                {!loading && slots.length === 0 && (
                  <div className="text-center text-xs text-gray-500 py-2">
                    No slots
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <AddSlotModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddAvailabilitySubmit}
        selectedDate={selectedDate}
        isLoading={isLoading}
        dailyLimit={dailyLimit}
        existingSlots={getExistingSlotCount(selectedDate)}
      />
      
      {showBlockModal && (
        <BlockTimeModal 
          isOpen={showBlockModal}
          onClose={() => setShowBlockModal(false)} 
          onSubmit={handleBlockTime}
          selectedDate={selectedDate}
          isLoading={isLoading}
        />
      )}
      
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this availability slot? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSlot}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 order-1 sm:order-2"
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}