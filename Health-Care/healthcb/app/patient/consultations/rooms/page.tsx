'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { consultationsApi } from '@/services/consultationsApi'; // Changed from scheduleApi
import { Schedule } from '@/types/schedule';
import { format, addDays, parseISO, isToday, isTomorrow } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  User, 
  Activity, 
  Video, 
  Search, 
  Filter, 
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

// Define filter status type
type StatusFilterType = 'all' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

const ScheduleSkeleton = () => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-start gap-6 animate-pulse">
        <div className="space-y-4 flex-1">
          <div className="pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 bg-gray-200 rounded"/>
              <div className="h-6 bg-gray-200 rounded w-1/3"/>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded"/>
              <div className="h-5 bg-gray-200 rounded w-1/4"/>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded"/>
              <div>
                <div className="h-4 bg-gray-200 rounded w-16 mb-1"/>
                <div className="h-5 bg-gray-200 rounded w-32 mb-1"/>
                <div className="h-4 bg-gray-200 rounded w-24"/>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded"/>
              <div>
                <div className="h-4 bg-gray-200 rounded w-16 mb-1"/>
                <div className="h-6 bg-gray-200 rounded w-20"/>
              </div>
            </div>
          </div>
        </div>
        <div className="w-28 h-12 bg-gray-200 rounded-lg"/>
      </div>
    </div>
  );
};

// Section header component
const SectionHeader = ({ title, count, icon }: { title: string; count: number; icon: React.ReactNode }) => (
  <div className="flex justify-between items-center mb-3">
    <div className="flex items-center gap-2">
      <div className="p-2 bg-gray-100 rounded-lg">
        {icon}
      </div>
      <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
    </div>
    <div className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
      {count} {count === 1 ? 'appointment' : 'appointments'}
    </div>
  </div>
);

const PatientRoomsPage = () => {
  const [bookedSchedules, setBookedSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showDateFilter, setShowDateFilter] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: format(new Date(), 'yyyy-MM-dd'),
    end: format(addDays(new Date(), 30), 'yyyy-MM-dd')
  });
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Debounce search term to prevent too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (isToday(date)) {
        return 'Today';
      } else if (isTomorrow(date)) {
        return 'Tomorrow';
      } else {
        return format(date, 'MMMM d, yyyy');
      }
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.slice(0, 5).split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // Helper function to safely get doctor name
  const getDoctorName = (schedule: any) => {
    // Handle the new data structure
    if (schedule.attributes?.doctor?.first_name && schedule.attributes?.doctor?.last_name) {
      return `Dr. ${schedule.attributes.doctor.first_name} ${schedule.attributes.doctor.last_name}`;
    }
    // Fallback to old data structure if needed
    else if (schedule.attributes?.doctor?.attributes?.name) {
      return schedule.attributes.doctor.attributes.name;
    }
    return 'Unknown Doctor';
  };

  // Helper function to safely get doctor specialization
  const getDoctorSpecialization = (schedule: any) => {
    // Handle the new data structure
    if (schedule.attributes?.doctor?.specialization) {
      return schedule.attributes.doctor.specialization;
    }
    // Fallback to old data structure
    else if (schedule.attributes?.doctor?.attributes?.position) {
      return schedule.attributes.doctor.attributes.position;
    }
    return 'Specialist';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'completed':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'no_show':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const fetchBookedSchedules = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (selectedDate) {
        params.date = format(selectedDate, 'yyyy-MM-dd');
      } else {
        // If no specific date is selected, but we have a date range
        if (dateRange.start) {
          params.start_date = dateRange.start;
        }
        if (dateRange.end) {
          params.end_date = dateRange.end;
        }
      }
      
      // Use consultationsApi.getMyConsultations instead of scheduleApi.getPatientBookedSchedules
      const schedules = await consultationsApi.getMyConsultations(params.status);
      setBookedSchedules(schedules);
    } catch (error) {
      console.error('Failed to fetch booked schedules:', error);
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check if URL has filters to apply
    const status = searchParams.get('status') as StatusFilterType | null;
    const date = searchParams.get('date');
    const search = searchParams.get('search');
    
    if (status && ['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'].includes(status)) {
      setStatusFilter(status);
    }
    
    if (date) {
      try {
        setSelectedDate(new Date(date));
      } catch (e) {
        console.error('Invalid date in URL params', e);
      }
    }
    
    if (search) {
      setSearchTerm(search);
    }
  }, [searchParams]);
  
  // Only fetch when these dependencies change - separate from the URL parameter effect
  useEffect(() => {
    fetchBookedSchedules();
  }, [statusFilter, selectedDate, dateRange, debouncedSearchTerm]);

  const handleJoinRoom = (roomId: string) => {
    router.push(`/patient/consultations/rooms/${roomId}`);
  };

  const toggleExpandAppointment = (id: string) => {
    if (expandedAppointment === id) {
      setExpandedAppointment(null);
    } else {
      setExpandedAppointment(id);
    }
  };

  const toggleDateFilter = () => {
    setShowDateFilter(!showDateFilter);
  };

  // Group appointments by status
  const inProgressAppointments = bookedSchedules.filter(appointment => 
    appointment.attributes.status.toLowerCase() === 'in_progress');
  
  const todayScheduledAppointments = bookedSchedules.filter(appointment => 
    appointment.attributes.status.toLowerCase() === 'scheduled' && 
    isToday(parseISO(appointment.attributes.date)));
  
  const upcomingAppointments = bookedSchedules.filter(appointment => 
    appointment.attributes.status.toLowerCase() === 'scheduled' && 
    !isToday(parseISO(appointment.attributes.date)));
  
  const completedAppointments = bookedSchedules.filter(appointment => 
    appointment.attributes.status.toLowerCase() === 'completed');
  
  const cancelledAppointments = bookedSchedules.filter(appointment => 
    appointment.attributes.status.toLowerCase() === 'cancelled' ||
    appointment.attributes.status.toLowerCase() === 'no_show');

  // For filtered view
  const filteredAppointments = statusFilter === 'all' ? bookedSchedules : bookedSchedules.filter(appointment => appointment.attributes.status.toLowerCase() === statusFilter);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto p-6">
          <div className="mb-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"/>
            <div className="h-6 bg-gray-200 rounded w-1/2"/>
          </div>
          <div className="space-y-6">
            {[...Array(3)].map((_, index) => (
              <ScheduleSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Your Consultation Schedule
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            View and join your upcoming medical consultations
          </p>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Status Filter */}
            <div className="w-full md:w-1/3">
              <label className="block text-sm text-gray-600 mb-1">Status</label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    const value = e.target.value as StatusFilterType;
                    setStatusFilter(value);
                    router.push(`/patient/consultations/rooms?status=${value}`);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md appearance-none pl-4 pr-8"
                >
                  <option value="all">All Statuses</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none w-4 h-4" />
              </div>
            </div>

            {/* Date Filter Toggle */}
            <div className="w-full md:w-1/3">
              <label className="block text-sm text-gray-600 mb-1">Date</label>
              <button
                onClick={toggleDateFilter}
                className="w-full p-2 border border-gray-300 rounded-md flex items-center justify-between bg-white"
              >
                <span className="text-gray-700">
                  {selectedDate
                    ? format(selectedDate, 'MMM d, yyyy')
                    : dateRange.start && dateRange.end
                    ? `${format(new Date(dateRange.start), 'MMM d')} - ${format(new Date(dateRange.end), 'MMM d')}`
                    : 'All dates'}
                </span>
                <Calendar className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Date Filter Expanded */}
          <AnimatePresence>
            {showDateFilter && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100"
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Single Date Selection */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Specific Date</label>
                    <input
                      type="date"
                      value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          setSelectedDate(new Date(e.target.value));
                          setDateRange({ start: '', end: '' });
                        } else {
                          setSelectedDate(null);
                        }
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  {/* Date Range Start */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">From</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => {
                        setDateRange({ ...dateRange, start: e.target.value });
                        setSelectedDate(null);
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  {/* Date Range End */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">To</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => {
                        setDateRange({ ...dateRange, end: e.target.value });
                        setSelectedDate(null);
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Preset Date Ranges */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() => {
                      setSelectedDate(new Date());
                      setDateRange({ start: '', end: '' });
                    }}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {
                      const tomorrow = addDays(new Date(), 1);
                      setSelectedDate(tomorrow);
                      setDateRange({ start: '', end: '' });
                    }}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Tomorrow
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      setDateRange({
                        start: format(today, 'yyyy-MM-dd'),
                        end: format(addDays(today, 7), 'yyyy-MM-dd')
                      });
                      setSelectedDate(null);
                    }}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Next 7 days
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      setDateRange({
                        start: format(today, 'yyyy-MM-dd'),
                        end: format(addDays(today, 30), 'yyyy-MM-dd')
                      });
                      setSelectedDate(null);
                    }}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Next 30 days
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDate(null);
                      setDateRange({ start: '', end: '' });
                    }}
                    className="px-3 py-1 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                  >
                    Clear dates
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Display appointments grouped by status */}
        {statusFilter === 'all' ? (
          <div className="space-y-6">
            {/* In-progress Consultations */}
            {inProgressAppointments.length > 0 && (
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                <SectionHeader 
                  title="In Progress Consultations" 
                  count={inProgressAppointments.length} 
                  icon={<Activity className="w-5 h-5 text-blue-600" />} 
                />
                
                <div className="mt-4 space-y-4">
                  {inProgressAppointments.map((schedule) => (
                    <motion.div
                      key={schedule.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200"
                    >
                      <div className="flex justify-between items-start gap-6">
                        <div 
                          className="space-y-4 flex-1 cursor-pointer" 
                          onClick={() => toggleExpandAppointment(schedule.id)}
                        >
                          <div className="pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-2 text-blue-600 mb-1">
                              <Calendar className="w-4 h-4" />
                              <p className="text-xl font-semibold">
                                {formatDate(schedule.attributes.date)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <p className="text-lg">
                                {formatTime(schedule.attributes.start_time)} - {formatTime(schedule.attributes.end_time)}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Doctor</p>
                                <p className="font-medium text-gray-900">{getDoctorName(schedule)}</p>
                                <p className="text-sm text-gray-500">{getDoctorSpecialization(schedule)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Activity className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <span className={`${getStatusColor(schedule.attributes.status)} px-3 py-1 rounded-full text-sm font-medium capitalize inline-block mt-1`}>
                                  {schedule.attributes.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleJoinRoom(schedule.attributes.room)}
                          className={`px-6 py-3 ${
                            schedule.attributes.status.toLowerCase() === 'in_progress' 
                              ? 'bg-blue-600 text-white hover:bg-blue-700' 
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          } rounded-lg transition-all duration-200 shadow-sm hover:shadow-md font-medium flex items-center gap-2`}
                          disabled={schedule.attributes.status.toLowerCase() !== 'in_progress'}
                        >
                          <Video className="w-4 h-4" />
                          {schedule.attributes.status.toLowerCase() === 'in_progress' ? 'Join Now' : 'Not Started'}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Today's Scheduled Appointments Section */}
            <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
              <SectionHeader 
                title="Today's Appointments" 
                count={todayScheduledAppointments.length} 
                icon={<Calendar className="w-5 h-5 text-green-600" />} 
              />
              
              <div className="mt-4 space-y-4">
                {todayScheduledAppointments.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-100">
                    <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium">No appointments scheduled for today</p>
                    <p className="text-sm text-gray-500 mt-1">Today's appointments will appear here</p>
                  </div>
                ) : (
                  todayScheduledAppointments.map((schedule) => (
                    <motion.div
                      key={schedule.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
                    >
                      <div className="flex justify-between items-start gap-6">
                        <div 
                          className="space-y-4 flex-1 cursor-pointer" 
                          onClick={() => toggleExpandAppointment(schedule.id)}
                        >
                          <div className="pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-2 text-green-600 mb-1">
                              <Calendar className="w-4 h-4" />
                              <p className="text-xl font-semibold">
                                {formatDate(schedule.attributes.date)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <p className="text-lg">
                                {formatTime(schedule.attributes.start_time)} - {formatTime(schedule.attributes.end_time)}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Doctor</p>
                                <p className="font-medium text-gray-900">{getDoctorName(schedule)}</p>
                                <p className="text-sm text-gray-500">{getDoctorSpecialization(schedule)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Activity className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <span className={`${getStatusColor(schedule.attributes.status)} px-3 py-1 rounded-full text-sm font-medium capitalize inline-block mt-1`}>
                                  {schedule.attributes.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleJoinRoom(schedule.attributes.room)}
                          className={`px-6 py-3 ${
                            schedule.attributes.status.toLowerCase() === 'in_progress' 
                              ? 'bg-blue-600 text-white hover:bg-blue-700' 
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          } rounded-lg transition-all duration-200 shadow-sm hover:shadow-md font-medium flex items-center gap-2`}
                          disabled={schedule.attributes.status.toLowerCase() !== 'in_progress'}
                        >
                          <Video className="w-4 h-4" />
                          {schedule.attributes.status.toLowerCase() === 'in_progress' ? 'Join Now' : 'Not Started'}
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Upcoming Appointments Section */}
            {upcomingAppointments.length > 0 && (
              <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                <SectionHeader 
                  title="Upcoming Appointments" 
                  count={upcomingAppointments.length} 
                  icon={<Calendar className="w-5 h-5 text-indigo-600" />} 
                />
                
                <div className="mt-4 space-y-4">
                  {upcomingAppointments.slice(0, 5).map((schedule) => (
                    <motion.div
                      key={schedule.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
                    >
                      <div className="flex justify-between items-start gap-6">
                        <div 
                          className="space-y-4 flex-1 cursor-pointer" 
                          onClick={() => toggleExpandAppointment(schedule.id)}
                        >
                          <div className="pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-2 text-indigo-600 mb-1">
                              <Calendar className="w-4 h-4" />
                              <p className="text-xl font-semibold">
                                {formatDate(schedule.attributes.date)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <p className="text-lg">
                                {formatTime(schedule.attributes.start_time)} - {formatTime(schedule.attributes.end_time)}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Doctor</p>
                                <p className="font-medium text-gray-900">{getDoctorName(schedule)}</p>
                                <p className="text-sm text-gray-500">{getDoctorSpecialization(schedule)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Activity className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <span className={`${getStatusColor(schedule.attributes.status)} px-3 py-1 rounded-full text-sm font-medium capitalize inline-block mt-1`}>
                                  {schedule.attributes.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleJoinRoom(schedule.attributes.room)}
                          className={`px-6 py-3 ${
                            schedule.attributes.status.toLowerCase() === 'in_progress' 
                              ? 'bg-blue-600 text-white hover:bg-blue-700' 
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          } rounded-lg transition-all duration-200 shadow-sm hover:shadow-md font-medium flex items-center gap-2`}
                          disabled={schedule.attributes.status.toLowerCase() !== 'in_progress'}
                        >
                          <Video className="w-4 h-4" />
                          {schedule.attributes.status.toLowerCase() === 'in_progress' ? 'Join Now' : 'Not Started'}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  
                  {upcomingAppointments.length > 5 && (
                    <div className="flex justify-center mt-2">
                      <button
                        onClick={() => {
                          setStatusFilter('scheduled');
                          router.push('/patient/consultations/rooms?status=scheduled');
                        }}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                      >
                        <span>View all {upcomingAppointments.length} upcoming appointments</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Completed Appointments Section */}
            {completedAppointments.length > 0 && (
              <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                <SectionHeader 
                  title="Completed" 
                  count={completedAppointments.length} 
                  icon={<CheckCircle className="w-5 h-5 text-purple-600" />} 
                />
                
                <div className="mt-4 space-y-4">
                  {completedAppointments.slice(0, 3).map((schedule) => (
                    <motion.div
                      key={schedule.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
                    >
                      <div className="flex justify-between items-start gap-6">
                        <div 
                          className="space-y-4 flex-1 cursor-pointer" 
                          onClick={() => toggleExpandAppointment(schedule.id)}
                        >
                          <div className="pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-2 text-purple-600 mb-1">
                              <Calendar className="w-4 h-4" />
                              <p className="text-xl font-semibold">
                                {formatDate(schedule.attributes.date)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <p className="text-lg">
                                {formatTime(schedule.attributes.start_time)} - {formatTime(schedule.attributes.end_time)}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Doctor</p>
                                <p className="font-medium text-gray-900">{getDoctorName(schedule)}</p>
                                <p className="text-sm text-gray-500">{getDoctorSpecialization(schedule)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Activity className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <span className={`${getStatusColor(schedule.attributes.status)} px-3 py-1 rounded-full text-sm font-medium capitalize inline-block mt-1`}>
                                  {schedule.attributes.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => router.push('/patient/consultations/history')}
                          className="px-6 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all duration-200 shadow-sm hover:shadow-md font-medium flex items-center gap-2"
                        >
                          <Activity className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  
                  {completedAppointments.length > 3 && (
                    <div className="flex justify-center mt-2">
                      <button
                        onClick={() => {
                          setStatusFilter('completed');
                          router.push('/patient/consultations/rooms?status=completed');
                        }}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1"
                      >
                        <span>View all {completedAppointments.length} completed consultations</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cancelled/No-show Appointments Section */}
            {cancelledAppointments.length > 0 && (
              <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                <SectionHeader 
                  title="Cancelled / No-show" 
                  count={cancelledAppointments.length} 
                  icon={<XCircle className="w-5 h-5 text-red-600" />} 
                />
                
                <div className="mt-4 space-y-4">
                  {cancelledAppointments.slice(0, 2).map((schedule) => (
                    <motion.div
                      key={schedule.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
                    >
                      <div className="flex justify-between items-start gap-6">
                        <div 
                          className="space-y-4 flex-1 cursor-pointer" 
                          onClick={() => toggleExpandAppointment(schedule.id)}
                        >
                          <div className="pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-2 text-red-600 mb-1">
                              <Calendar className="w-4 h-4" />
                              <p className="text-xl font-semibold">
                                {formatDate(schedule.attributes.date)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <p className="text-lg">
                                {formatTime(schedule.attributes.start_time)} - {formatTime(schedule.attributes.end_time)}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Doctor</p>
                                <p className="font-medium text-gray-900">{getDoctorName(schedule)}</p>
                                <p className="text-sm text-gray-500">{getDoctorSpecialization(schedule)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Activity className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <span className={`${getStatusColor(schedule.attributes.status)} px-3 py-1 rounded-full text-sm font-medium capitalize inline-block mt-1`}>
                                  {schedule.attributes.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => router.push('/patient/consultations')}
                          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 shadow-sm hover:shadow-md font-medium flex items-center gap-2"
                        >
                          <Calendar className="w-4 h-4" />
                          Reschedule
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  
                  {cancelledAppointments.length > 2 && (
                    <div className="flex justify-center mt-2">
                      <button
                        onClick={() => {
                          setStatusFilter('cancelled');
                          router.push('/patient/consultations/rooms?status=cancelled');
                        }}
                        className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                      >
                        <span>View all {cancelledAppointments.length} cancelled appointments</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Filtered view
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <span>
                  {statusFilter !== 'all' 
                    ? `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Appointments` 
                    : 'Filtered Appointments'}
                </span>
              </h3>
              <span className="text-sm text-gray-600">
                {filteredAppointments.length} {filteredAppointments.length === 1 ? 'result' : 'results'}
              </span>
            </div>
            
            <div className="space-y-4">
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-2">No appointments found</p>
                  <p className="text-gray-500">Try adjusting your filters</p>
                </div>
              ) : (
                filteredAppointments.map((schedule) => (
                  <motion.div
                    key={schedule.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border ${
                      schedule.attributes.status.toLowerCase() === 'in_progress' 
                        ? 'border-blue-200' 
                        : 'border-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-6">
                      <div 
                        className="space-y-4 flex-1 cursor-pointer" 
                        onClick={() => toggleExpandAppointment(schedule.id)}
                      >
                        <div className="pb-4 border-b border-gray-100">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className={`w-4 h-4 ${
                              schedule.attributes.status.toLowerCase() === 'in_progress' 
                                ? 'text-blue-600' 
                                : schedule.attributes.status.toLowerCase() === 'scheduled'
                                  ? 'text-green-600'
                                  : schedule.attributes.status.toLowerCase() === 'completed'
                                    ? 'text-purple-600'
                                    : 'text-red-600'
                            }`} />
                            <p className="text-xl font-semibold">
                              {formatDate(schedule.attributes.date)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <p className="text-lg">
                              {formatTime(schedule.attributes.start_time)} - {formatTime(schedule.attributes.end_time)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Doctor</p>
                              <p className="font-medium text-gray-900">{getDoctorName(schedule)}</p>
                              <p className="text-sm text-gray-500">{getDoctorSpecialization(schedule)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Status</p>
                              <span className={`${getStatusColor(schedule.attributes.status)} px-3 py-1 rounded-full text-sm font-medium capitalize inline-block mt-1`}>
                                {schedule.attributes.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {schedule.attributes.status.toLowerCase() === 'in_progress' && (
                        <button
                          onClick={() => handleJoinRoom(schedule.attributes.room)}
                          className={`px-6 py-3 ${
                            schedule.attributes.status.toLowerCase() === 'in_progress' 
                              ? 'bg-blue-600 text-white hover:bg-blue-700' 
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          } rounded-lg transition-all duration-200 shadow-sm hover:shadow-md font-medium flex items-center gap-2`}
                          disabled={schedule.attributes.status.toLowerCase() !== 'in_progress'}
                        >
                          <Video className="w-4 h-4" />
                          {schedule.attributes.status.toLowerCase() === 'in_progress' ? 'Join Now' : 'Not Started'}
                        </button>
                      )}

                      {schedule.attributes.status.toLowerCase() === 'scheduled' && (
                        <button
                          onClick={() => handleJoinRoom(schedule.attributes.room)}
                          className={`px-6 py-3 ${
                            schedule.attributes.status.toLowerCase() === 'in_progress' 
                              ? 'bg-blue-600 text-white hover:bg-blue-700' 
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          } rounded-lg transition-all duration-200 shadow-sm hover:shadow-md font-medium flex items-center gap-2`}
                          disabled={schedule.attributes.status.toLowerCase() !== 'in_progress'}
                        >
                          <Video className="w-4 h-4" />
                          {schedule.attributes.status.toLowerCase() === 'in_progress' ? 'Join Now' : 'Not Started'}
                        </button>
                      )}

                      {schedule.attributes.status.toLowerCase() === 'completed' && (
                        <button
                          onClick={() => router.push('/patient/consultations/history')}
                          className="px-6 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all duration-200 shadow-sm hover:shadow-md font-medium flex items-center gap-2"
                        >
                          <Activity className="w-4 h-4" />
                          View Details
                        </button>
                      )}

                      {(schedule.attributes.status.toLowerCase() === 'cancelled' || schedule.attributes.status.toLowerCase() === 'no_show') && (
                        <button
                          onClick={() => router.push('/patient/consultations')}
                          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 shadow-sm hover:shadow-md font-medium flex items-center gap-2"
                        >
                          <Calendar className="w-4 h-4" />
                          Reschedule
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}

        {bookedSchedules.length === 0 && statusFilter === 'all' && !searchTerm && !selectedDate && !dateRange.start && !dateRange.end && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100"
          >
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No scheduled consultations found</p>
            <p className="text-gray-500 mb-6">Your upcoming consultations will appear here</p>
            <button 
              onClick={() => router.push('/patient/consultations')} 
              className="px-6 py-3 bg-[#ABF600] text-[#1A202C] rounded-lg hover:bg-[#9DE100] transition-all duration-200 shadow-sm hover:shadow-md font-medium"
            >
              Book a Consultation
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PatientRoomsPage;