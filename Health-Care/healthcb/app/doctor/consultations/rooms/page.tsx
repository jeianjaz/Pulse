'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { consultationsApi } from '@/services/consultationsApi';
import { consultationRecordApi } from '@/services/consultationRecordApi';
import { Schedule } from '@/types/schedule';
import { format, addDays, subDays, parseISO, isToday, isTomorrow } from 'date-fns';
import { 
  Calendar, Clock, Filter, CheckCircle, AlertCircle, XCircle, 
  Activity, Heart, User, FileText, MessagesSquare, 
  PlayCircle, CheckSquare, XSquare, Search, X, ChevronDown,
  ChevronRight, Calendar as CalendarIcon, BarChart, Layers
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Define filter status type
type StatusFilterType = 'all' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

// Create a modal component for confirmation dialogs
const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  isProcessing
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string;
  isProcessing: boolean;
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            {isProcessing ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Create a component to display symptoms
const SymptomsDisplay = ({ symptoms }: { symptoms: Record<string, boolean | string> }) => {
  if (!symptoms || Object.keys(symptoms).length === 0) return <p className="text-gray-500 italic">No symptoms data</p>;
  
  return (
    <div className="grid grid-cols-2 gap-2">
      {Object.entries(symptoms).map(([symptom, value]) => {
        // Convert value to a boolean flag for styling
        const isPositive = value === true || value === "Yes";
        
        return (
          <div key={symptom} className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isPositive ? 'bg-red-500' : 'bg-gray-300'}`}></span>
            <span className={`text-sm ${isPositive ? 'font-medium' : 'text-gray-500'}`}>{symptom}</span>
          </div>
        );
      })}
    </div>
  );
};

// Create a component to display health predictions
const HealthPredictionDisplay = ({ prediction }: { prediction: any }) => {
  if (!prediction) return <p className="text-gray-500 italic">No prediction available</p>;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium">Predicted Disease:</span>
        <span className="text-red-600 font-semibold">{prediction.predicted_disease}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-medium">Probability:</span>
        <span>{Math.round(prediction.probability * 100)}%</span>
      </div>
      <div className="mt-2">
        <span className="font-medium block mb-1">Other Possibilities:</span>
        <div className="space-y-1">
          {Object.entries(prediction.significant_probabilities || {})
            .filter(([disease]) => disease !== prediction.predicted_disease)
            .slice(0, 3)
            .map(([disease, probability]) => (
              <div key={disease} className="flex justify-between text-sm">
                <span>{disease}</span>
                <span>{Math.round(Number(probability) * 100)}%</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

const ScheduleSkeleton = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md flex justify-between items-start gap-6 animate-pulse">
      <div className="space-y-3 w-full">
        <div className="pb-3 border-b border-gray-100">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-5 bg-gray-200 rounded w-16"></div>
            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 bg-gray-200 rounded w-16"></div>
            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 bg-gray-200 rounded w-16"></div>
            <div className="h-5 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
      <div className="h-12 bg-gray-200 rounded w-24"></div>
    </div>
  );
};

// Badge component for status
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'no_show':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return <Calendar className="w-4 h-4" />;
      case 'in_progress':
        return <Activity className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'no_show':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };
  
  return (
    <div className={`px-3 py-1 rounded-full text-sm font-medium capitalize flex items-center gap-1 border ${getStatusColor(status)}`}>
      {getStatusIcon(status)}
      <span>{status.replace('_', ' ')}</span>
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

// Appointment card component
const AppointmentCard = ({ 
  appointment, 
  onExpandToggle, 
  expanded, 
  onJoinRoom, 
  onStartConsultation,
  onCompleteConsultation,
  onCancelConsultation,
  joiningRoom,
  actionInProgress,
  formatDate,
  formatTime,
  router
}: { 
  appointment: Schedule;
  onExpandToggle: () => void;
  expanded: boolean;
  onJoinRoom: () => void;
  onStartConsultation: () => void;
  onCompleteConsultation: () => void;
  onCancelConsultation: () => void;
  joiningRoom: boolean;
  actionInProgress: boolean;
  formatDate: (date: string) => string;
  formatTime: (time: string) => string;
  router: any;
}) => {
  const formattedDate = formatDate(appointment.attributes.date);
  const isPriority = appointment.attributes.status.toLowerCase() === 'in_progress';
  const isToday = formattedDate === 'Today';
  
  return (
    <motion.div 
      className={`bg-white rounded-lg shadow-md overflow-hidden border ${
        isPriority ? 'border-blue-300' : isToday ? 'border-green-200' : 'border-gray-100'
      }`}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      {/* Priority indicator */}
      {isPriority && (
        <div className="bg-blue-500 text-white text-xs font-medium px-4 py-1 text-center">
          IN PROGRESS - Active Consultation
        </div>
      )}
      
      {/* Main appointment info section */}
      <div 
        className={`p-5 cursor-pointer ${isPriority ? 'bg-blue-50' : ''}`}
        onClick={onExpandToggle}
      >
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <p className={`text-lg font-semibold ${isPriority ? 'text-blue-800' : 'text-gray-800'}`}>
                {formattedDate}
              </p>
              {isToday && (
                <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Today
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <p className="text-gray-700">
                {formatTime(appointment.attributes.start_time)} - {formatTime(appointment.attributes.end_time)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-600" />
              <p className="text-gray-900 font-medium">
                {appointment.attributes.patient?.first_name} {appointment.attributes.patient?.last_name || 'N/A'}
              </p>
            </div>
            
            <div className="flex items-center gap-2 mt-3">
              <StatusBadge status={appointment.attributes.status} />
              
              {appointment.attributes.request?.reason && (
                <span className="text-sm text-gray-500 truncate max-w-md">
                  {appointment.attributes.request.reason}
                </span>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2 ml-4">
            {appointment.attributes.status.toLowerCase() === 'scheduled' && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartConsultation();
                  }}
                  disabled={actionInProgress}
                  className="p-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                  title="Start Consultation"
                >
                  <PlayCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancelConsultation();
                  }}
                  disabled={actionInProgress}
                  className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                  title="Cancel Consultation"
                >
                  <XSquare className="w-5 h-5" />
                </button>
              </>
            )}
            
            {appointment.attributes.status.toLowerCase() === 'in_progress' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCompleteConsultation();
                }}
                className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                title="Complete Consultation"
              >
                <CheckSquare className="w-5 h-5" />
              </button>
            )}
            
            {['scheduled', 'in_progress'].includes(appointment.attributes.status.toLowerCase()) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onJoinRoom();
                }}
                disabled={joiningRoom}
                className={`px-4 py-2 ${
                  joiningRoom 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : isPriority ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-[#ABF600] hover:bg-[#9DE100] text-[#1A202C]'
                } rounded-lg transition-colors shadow-sm hover:shadow-md font-medium flex items-center gap-2`}
              >
                {joiningRoom ? (
                  <>
                    <span className="animate-pulse">•</span>
                    <span>Joining...</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4" />
                    <span>Join Call</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* Expand/collapse indicator */}
        <div className="flex justify-center mt-3">
          <ChevronDown className={`w-5 h-5 text-gray-500 transform transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>
      
      {/* Expanded view - only visible when expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 border-t border-gray-100">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left column */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                      <MessagesSquare className="w-5 h-5" />
                      Consultation Details
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium">Reason:</p>
                      <p className="mb-2">{appointment.attributes.request?.reason || "N/A"}</p>
                      
                      <p className="font-medium mt-3">Additional Notes:</p>
                      <p className="whitespace-pre-line">{appointment.attributes.request?.additional_notes || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5" />
                      Symptoms
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <SymptomsDisplay symptoms={appointment.attributes.request?.symptoms || {}} />
                    </div>
                  </div>
                </div>
                
                {/* Right column */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                      <Heart className="w-5 h-5" />
                      Health Prediction
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <HealthPredictionDisplay prediction={appointment.attributes.health_prediction} />
                    </div>
                  </div>
                  
                  {appointment.attributes.has_medical_record && (
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5" />
                        Medical Records
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm">This patient has medical records.</p>
                        <button 
                          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/doctor/patient/${appointment.attributes.patient?.id}/records`);
                          }}
                        >
                          View Records
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const RoomsPage = () => {
  const [bookedAppointments, setBookedAppointments] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joiningRoom, setJoiningRoom] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showDateFilter, setShowDateFilter] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: format(new Date(), 'yyyy-MM-dd'),
    end: format(addDays(new Date(), 30), 'yyyy-MM-dd')
  });
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'no_show':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return <Calendar className="w-4 h-4" />;
      case 'in_progress':
        return <Activity className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'no_show':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const fetchBookedAppointments = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
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
      
      const appointments = await consultationsApi.getBookedAppointments(params);
      setBookedAppointments(appointments);
    } catch (error) {
      console.error('Failed to fetch booked appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check if URL has filters to apply
    const urlStatus = searchParams.get('status');
    const urlDate = searchParams.get('date');
    const urlSearch = searchParams.get('search');
    
    // Define valid status values
    const validStatusValues = ['all', 'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'];
    
    // Only set status if it's a valid value
    if (urlStatus && validStatusValues.includes(urlStatus)) {
      setStatusFilter(urlStatus as StatusFilterType);
    } else {
      // Ensure statusFilter is set to 'all' when no valid URL parameter exists
      setStatusFilter('all');
    }
    
    if (urlDate) {
      if (urlDate === 'today') {
        setSelectedDate(new Date());
      } else {
        try {
          setSelectedDate(parseISO(urlDate));
        } catch (e) {
          console.error('Invalid date format in URL');
        }
      }
    }
    
    if (urlSearch) {
      setSearchTerm(urlSearch);
    }
    
  }, [searchParams]);

  useEffect(() => {
    fetchBookedAppointments();
  }, [statusFilter, selectedDate, dateRange]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchBookedAppointments();
    }, 500);
    
    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const clearFilters = () => {
    setStatusFilter('all');
    setSearchTerm('');
    setSelectedDate(null);
    setDateRange({
      start: format(new Date(), 'yyyy-MM-dd'),
      end: format(addDays(new Date(), 30), 'yyyy-MM-dd')
    });
    
    // Also update URL to remove filters
    router.replace('/doctor/consultations/rooms');
  };

  const handleJoinRoom = async (roomId: string, scheduleId: string, status: string) => {
    if (joiningRoom) return;  
    
    try {
      setJoiningRoom(roomId);
      
      // Start the consultation if it's in scheduled status
      if (status.toLowerCase() === 'scheduled') {
        await consultationsApi.startConsultation(scheduleId);
      }
      
      router.push(`/doctor/consultations/rooms/${roomId}`);
    } catch (error) {
      console.error('Failed to start consultation:', error);
      setJoiningRoom(null);
      toast.error('Failed to start consultation. Please try again.');
    }
  };

  const handleStartConsultation = async (scheduleId: string) => {
    try {
      setActionInProgress(scheduleId);
      await consultationsApi.startConsultation(scheduleId);
      toast.success('Consultation started successfully');
      fetchBookedAppointments();
    } catch (error) {
      console.error('Failed to start consultation:', error);
      toast.error('Failed to start consultation');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleCompleteConsultation = (scheduleId: string) => {
    // Navigate to a form to complete the consultation
    router.push(`/doctor/consultations/${scheduleId}/complete`);
  };

  const handleCancelConsultation = (scheduleId: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Cancel Consultation',
      message: 'Are you sure you want to cancel this consultation? This action cannot be undone.',
      onConfirm: async () => {
        try {
          setActionInProgress(scheduleId);
          await consultationsApi.cancelConsultation(scheduleId);
          toast.success('Consultation cancelled successfully');
          setModalConfig({ ...modalConfig, isOpen: false });
          fetchBookedAppointments();
        } catch (error) {
          console.error('Failed to cancel consultation:', error);
          toast.error('Failed to cancel consultation');
        } finally {
          setActionInProgress(null);
        }
      }
    });
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
  const inProgressAppointments = bookedAppointments.filter(appointment => 
    appointment.attributes.status.toLowerCase() === 'in_progress');
  
  const todayScheduledAppointments = bookedAppointments.filter(appointment => 
    appointment.attributes.status.toLowerCase() === 'scheduled' && 
    isToday(parseISO(appointment.attributes.date)));
  
  const upcomingAppointments = bookedAppointments.filter(appointment => 
    appointment.attributes.status.toLowerCase() === 'scheduled' && 
    !isToday(parseISO(appointment.attributes.date)));
  
  const completedAppointments = bookedAppointments.filter(appointment => 
    appointment.attributes.status.toLowerCase() === 'completed');
  
  const cancelledAppointments = bookedAppointments.filter(appointment => 
    appointment.attributes.status.toLowerCase() === 'cancelled' ||
    appointment.attributes.status.toLowerCase() === 'no_show');

  // For filtered view
  const filteredAppointments = statusFilter === 'all' ? bookedAppointments : bookedAppointments.filter(appointment => appointment.attributes.status.toLowerCase() === statusFilter);

  if (isLoading) {
    return (
      <div className="p-4">
        <h2 className="text-xl mb-4">Booked Appointments</h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <ScheduleSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Consultations</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {bookedAppointments.length} {bookedAppointments.length === 1 ? 'appointment' : 'appointments'} found
          </span>
          <button 
            onClick={() => router.push('/doctor/consultations/overview')}
            className="px-3 py-1.5 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors flex items-center gap-1"
          >
            <BarChart className="w-4 h-4" />
            <span>Dashboard View</span>
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Status Filter */}
          <div className="relative">
            <label className="block text-sm text-gray-600 mb-1">Status</label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilterType)}
                className="w-full p-2 border border-gray-300 rounded-md appearance-none pr-10"
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

          {/* Search by Patient Name */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Search Patient</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by patient name"
                className="w-full p-2 border border-gray-300 rounded-md pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            </div>
          </div>
          
          {/* Date Filter */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Date Filter</label>
            <button
              onClick={toggleDateFilter}
              className="flex items-center justify-between w-full p-2 border border-gray-300 rounded-md bg-white"
            >
              <span className="flex items-center">
                <Calendar className="mr-2 text-gray-500 w-4 h-4" />
                {selectedDate 
                  ? format(selectedDate, 'MMM d, yyyy') 
                  : 'Date Range'}
              </span>
              <ChevronDown className="text-gray-500 w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Date Range Picker */}
        <AnimatePresence>
          {showDateFilter && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
              transition={{ duration: 0.3 }}
            >
              <div className="border-t border-gray-200 pt-4 mt-2">
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
                  
                  {/* Date Range - Start Date */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => {
                        setDateRange({...dateRange, start: e.target.value});
                        setSelectedDate(null);
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      disabled={!!selectedDate}
                    />
                  </div>
                  
                  {/* Date Range - End Date */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">End Date</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => {
                        setDateRange({...dateRange, end: e.target.value});
                        setSelectedDate(null);
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      disabled={!!selectedDate}
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
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Active Filters Display */}
        {(statusFilter !== 'all' || searchTerm || selectedDate || (dateRange.start && dateRange.end)) && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {statusFilter !== 'all' && (
                <div className={`flex items-center gap-1 px-2 py-1 text-sm rounded-md ${getStatusColor(statusFilter)}`}>
                  {getStatusIcon(statusFilter)}
                  <span>Status: {statusFilter.replace('_', ' ').charAt(0).toUpperCase() + statusFilter.replace('_', ' ').slice(1)}</span>
                </div>
              )}
              {searchTerm && (
                <div className="flex items-center gap-1 px-2 py-1 text-sm rounded-md bg-blue-100 text-blue-800">
                  <Search className="w-3 h-3" />
                  <span>Search: {searchTerm}</span>
                </div>
              )}
              {selectedDate && (
                <div className="flex items-center gap-1 px-2 py-1 text-sm rounded-md bg-purple-100 text-purple-800">
                  <Calendar className="w-3 h-3" />
                  <span>Date: {format(selectedDate, 'MMM d, yyyy')}</span>
                </div>
              )}
              {!selectedDate && dateRange.start && dateRange.end && (
                <div className="flex items-center gap-1 px-2 py-1 text-sm rounded-md bg-purple-100 text-purple-800">
                  <Calendar className="w-3 h-3" />
                  <span>Date Range: {format(new Date(dateRange.start), 'MMM d')} - {format(new Date(dateRange.end), 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Grouped view when no filters are applied */}
      {statusFilter === 'all' && !searchTerm && !selectedDate ? (
        <div className="space-y-8">
          {/* In Progress Appointments Section */}
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
            <SectionHeader 
              title="In Progress Consultations" 
              count={inProgressAppointments.length} 
              icon={<Activity className="w-5 h-5 text-blue-600" />} 
            />
            
            <div className="mt-4 space-y-4">
              {inProgressAppointments.length === 0 ? (
                <div className="bg-white rounded-lg p-6 text-center border border-blue-100">
                  <Activity className="w-10 h-10 text-blue-300 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium">No active consultations at the moment</p>
                  <p className="text-sm text-gray-500 mt-1">In-progress consultations will appear here</p>
                </div>
              ) : (
                inProgressAppointments.map(appointment => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onExpandToggle={() => toggleExpandAppointment(appointment.id)}
                    expanded={expandedAppointment === appointment.id}
                    onJoinRoom={() => handleJoinRoom(
                      appointment.attributes.room || appointment.id, 
                      appointment.id,
                      appointment.attributes.status
                    )}
                    onStartConsultation={() => handleStartConsultation(appointment.id)}
                    onCompleteConsultation={() => handleCompleteConsultation(appointment.id)}
                    onCancelConsultation={() => handleCancelConsultation(appointment.id)}
                    joiningRoom={joiningRoom === (appointment.attributes.room || appointment.id)}
                    actionInProgress={actionInProgress === appointment.id}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    router={router}
                  />
                ))
              )}
            </div>
          </div>
          
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
                todayScheduledAppointments.map(appointment => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onExpandToggle={() => toggleExpandAppointment(appointment.id)}
                    expanded={expandedAppointment === appointment.id}
                    onJoinRoom={() => handleJoinRoom(
                      appointment.attributes.room || appointment.id, 
                      appointment.id,
                      appointment.attributes.status
                    )}
                    onStartConsultation={() => handleStartConsultation(appointment.id)}
                    onCompleteConsultation={() => handleCompleteConsultation(appointment.id)}
                    onCancelConsultation={() => handleCancelConsultation(appointment.id)}
                    joiningRoom={joiningRoom === (appointment.attributes.room || appointment.id)}
                    actionInProgress={actionInProgress === appointment.id}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    router={router}
                  />
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
                icon={<CalendarIcon className="w-5 h-5 text-indigo-600" />} 
              />
              
              <div className="mt-4 space-y-4">
                {upcomingAppointments.map(appointment => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onExpandToggle={() => toggleExpandAppointment(appointment.id)}
                    expanded={expandedAppointment === appointment.id}
                    onJoinRoom={() => handleJoinRoom(
                      appointment.attributes.room || appointment.id, 
                      appointment.id,
                      appointment.attributes.status
                    )}
                    onStartConsultation={() => handleStartConsultation(appointment.id)}
                    onCompleteConsultation={() => handleCompleteConsultation(appointment.id)}
                    onCancelConsultation={() => handleCancelConsultation(appointment.id)}
                    joiningRoom={joiningRoom === (appointment.attributes.room || appointment.id)}
                    actionInProgress={actionInProgress === appointment.id}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    router={router}
                  />
                ))}
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
                {completedAppointments.slice(0, 5).map(appointment => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onExpandToggle={() => toggleExpandAppointment(appointment.id)}
                    expanded={expandedAppointment === appointment.id}
                    onJoinRoom={() => handleJoinRoom(
                      appointment.attributes.room || appointment.id, 
                      appointment.id,
                      appointment.attributes.status
                    )}
                    onStartConsultation={() => handleStartConsultation(appointment.id)}
                    onCompleteConsultation={() => handleCompleteConsultation(appointment.id)}
                    onCancelConsultation={() => handleCancelConsultation(appointment.id)}
                    joiningRoom={joiningRoom === (appointment.attributes.room || appointment.id)}
                    actionInProgress={actionInProgress === appointment.id}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    router={router}
                  />
                ))}
                
                {completedAppointments.length > 5 && (
                  <div className="flex justify-center mt-2">
                    <button
                      onClick={() => {
                        setStatusFilter('completed');
                        router.push('/doctor/consultations/rooms?status=completed');
                      }}
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1"
                    >
                      <span>View all {completedAppointments.length} completed appointments</span>
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
                {cancelledAppointments.slice(0, 3).map(appointment => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onExpandToggle={() => toggleExpandAppointment(appointment.id)}
                    expanded={expandedAppointment === appointment.id}
                    onJoinRoom={() => handleJoinRoom(
                      appointment.attributes.room || appointment.id, 
                      appointment.id,
                      appointment.attributes.status
                    )}
                    onStartConsultation={() => handleStartConsultation(appointment.id)}
                    onCompleteConsultation={() => handleCompleteConsultation(appointment.id)}
                    onCancelConsultation={() => handleCancelConsultation(appointment.id)}
                    joiningRoom={joiningRoom === (appointment.attributes.room || appointment.id)}
                    actionInProgress={actionInProgress === appointment.id}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    router={router}
                  />
                ))}
                
                {cancelledAppointments.length > 3 && (
                  <div className="flex justify-center mt-2">
                    <button
                      onClick={() => {
                        setStatusFilter('cancelled');
                        router.push('/doctor/consultations/rooms?status=cancelled');
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
              <Layers className="w-5 h-5 text-gray-600" />
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
              filteredAppointments.map(appointment => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onExpandToggle={() => toggleExpandAppointment(appointment.id)}
                  expanded={expandedAppointment === appointment.id}
                  onJoinRoom={() => handleJoinRoom(
                    appointment.attributes.room || appointment.id, 
                    appointment.id,
                    appointment.attributes.status
                  )}
                  onStartConsultation={() => handleStartConsultation(appointment.id)}
                  onCompleteConsultation={() => handleCompleteConsultation(appointment.id)}
                  onCancelConsultation={() => handleCancelConsultation(appointment.id)}
                  joiningRoom={joiningRoom === (appointment.attributes.room || appointment.id)}
                  actionInProgress={actionInProgress === appointment.id}
                  formatDate={formatDate}
                  formatTime={formatTime}
                  router={router}
                />
              ))
            )}
          </div>
        </div>
      )}
      
      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onClose={() => setModalConfig({...modalConfig, isOpen: false})}
        isProcessing={!!actionInProgress}
      />
    </div>
  );
};

export default RoomsPage;