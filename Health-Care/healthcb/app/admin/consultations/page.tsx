"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle, XCircle, Clock, Calendar, 
  Search, Filter, ChevronDown, User, 
  Stethoscope, MessageCircle, Eye, 
  Play, Square, CalendarDays, BarChart2,
  Video, FileText, AlertCircle, Activity,
  Clipboard, Download, Trash2, MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parseISO, isToday, addDays } from 'date-fns';
import { consultationsApi } from '@/services/consultationsApi';
import { ConsultationDetail } from '@/types/schedule';
import toast from 'react-hot-toast';

// Extend the ConsultationDetail type with UI-specific properties
interface EnhancedConsultation extends ConsultationDetail {
  isExpanded?: boolean;
  isProcessing?: boolean;
}

// Helper to safely parse and format ISO date strings
function safeFormatISO(dateString: any, fmt: string, fallback = 'N/A') {
  if (typeof dateString !== 'string') return fallback;
  try {
    return format(parseISO(dateString), fmt);
  } catch {
    return fallback;
  }
}

// Main component
export default function ConsultationsManagement() {
  const [consultations, setConsultations] = useState<EnhancedConsultation[]>([]);
  const [filteredConsultations, setFilteredConsultations] = useState<EnhancedConsultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedConsultation, setSelectedConsultation] = useState<EnhancedConsultation | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'calendar' | 'stats'>('list');
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: format(new Date(), 'yyyy-MM-dd'),
    end: format(addDays(new Date(), 30), 'yyyy-MM-dd')
  });
  
  const router = useRouter();

  // Load consultations on component mount
  useEffect(() => {
    fetchConsultations();
  }, [filterStatus, dateRange]);

  // Fetch consultations from API
  const fetchConsultations = async () => {
    try {
      setIsLoading(true);
      
      const params: any = {};
      
      if (filterStatus !== 'All') {
        params.status = filterStatus.toLowerCase();
      }
      
      params.start_date = dateRange.start;
      params.end_date = dateRange.end;
      
      const response = await consultationsApi.getConsultations(params);
      
      // Process the nested API response structure
      const processedData = Array.isArray(response?.data) 
        ? response.data.map(item => ({
            id: item.id,
            ...item.attributes
          })) 
        : response || [];
      
      console.log("Processed consultation data:", processedData);
      
      setConsultations(processedData || []);
      applyFilters(processedData, searchTerm, filterDoctor);
    } catch (error) {
      console.error('Failed to fetch consultations:', error);
      toast.error('Failed to load consultations');
    } finally {
      setIsLoading(false);
    }
  };

  // Apply client-side filters
  const applyFilters = (data: EnhancedConsultation[], search: string, doctor: string) => {
    let filtered = [...data];
    
    // Apply search term filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(item => {
        return (
          item.patient?.first_name?.toLowerCase().includes(searchLower) ||
          item.patient?.last_name?.toLowerCase().includes(searchLower) ||
          item.patient?.email?.toLowerCase().includes(searchLower) ||
          item.doctor?.first_name?.toLowerCase().includes(searchLower) ||
          item.doctor?.last_name?.toLowerCase().includes(searchLower) ||
          item.reason?.toLowerCase().includes(searchLower)
        );
      });
    }
    
    // Apply doctor filter
    if (doctor !== 'All') {
      filtered = filtered.filter(item => {
        const fullName = `${item.doctor?.first_name} ${item.doctor?.last_name}`;
        return fullName === doctor;
      });
    }
    
    setFilteredConsultations(filtered);
  };

  // Calculate doctor options
  const getDoctorOptions = () => {
    const doctorSet = new Set<string>();
    consultations.forEach(consultation => {
      if (consultation.doctor?.first_name && consultation.doctor?.last_name) {
        doctorSet.add(`${consultation.doctor.first_name} ${consultation.doctor.last_name}`);
      }
    });
    return Array.from(doctorSet);
  };
  
  // Handle search change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters(consultations, searchTerm, filterDoctor);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle doctor filter change
  useEffect(() => {
    applyFilters(consultations, searchTerm, filterDoctor);
  }, [filterDoctor]);

  // Format date/time helper
  const formatDateTime = (dateString: string, timeString: string) => {
    try {
      const date = parseISO(dateString);
      const formattedDate = format(date, 'MMM d, yyyy');
      const time = timeString.slice(0, 5);
      return `${formattedDate} at ${time}`;
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Get status badge style
  const getStatusBadge = (status: string | undefined) => {
    const statusLower = status?.toLowerCase() || 'unknown';
    
    switch (statusLower) {
      case 'scheduled':
        return { 
          bg: 'bg-blue-100', 
          text: 'text-blue-700',
          icon: <Clock className="h-4 w-4 mr-1" />
        };
      case 'in_progress':
        return { 
          bg: 'bg-purple-100', 
          text: 'text-purple-700',
          icon: <Activity className="h-4 w-4 mr-1" />
        };
      case 'completed':
        return { 
          bg: 'bg-green-100', 
          text: 'text-green-700',
          icon: <CheckCircle className="h-4 w-4 mr-1" />
        };
      case 'cancelled':
        return { 
          bg: 'bg-red-100', 
          text: 'text-red-700',
          icon: <XCircle className="h-4 w-4 mr-1" />
        };
      case 'no_show':
        return { 
          bg: 'bg-orange-100', 
          text: 'text-orange-700',
          icon: <AlertCircle className="h-4 w-4 mr-1" />
        };
      default:
        return { 
          bg: 'bg-gray-100', 
          text: 'text-gray-700',
          icon: <Clock className="h-4 w-4 mr-1" />
        };
    }
  };

  // Handle consultation actions
  const handleStartConsultation = async (id: string) => {
    try {
      setConsultations(prev => 
        prev.map(c => c.id === id ? { ...c, isProcessing: true } : c)
      );
      
      await consultationsApi.startConsultation(id);
      
      toast.success('Consultation started successfully');
      fetchConsultations();
    } catch (error) {
      console.error('Failed to start consultation:', error);
      toast.error('Failed to start consultation');
      
      setConsultations(prev => 
        prev.map(c => c.id === id ? { ...c, isProcessing: false } : c)
      );
    }
  };
  
  const handleCancelConsultation = async (id: string) => {
    try {
      setConsultations(prev => 
        prev.map(c => c.id === id ? { ...c, isProcessing: true } : c)
      );
      
      await consultationsApi.cancelConsultation(id);
      
      toast.success('Consultation cancelled successfully');
      fetchConsultations();
    } catch (error) {
      console.error('Failed to cancel consultation:', error);
      toast.error('Failed to cancel consultation');
      
      setConsultations(prev => 
        prev.map(c => c.id === id ? { ...c, isProcessing: false } : c)
      );
    }
  };
  
  const handleJoinConsultation = (roomId: string) => {
    if (!roomId) {
      toast.error('Room not found for this consultation');
      return;
    }
    
    router.push(`/admin/consultations/rooms/${roomId}`);
  };
  
  const handleViewDetails = (consultation: EnhancedConsultation) => {
    setSelectedConsultation(consultation);
    setShowDetailsModal(true);
  };

  const toggleExpandConsultation = (id: string) => {
    setConsultations(prev => 
      prev.map(c => c.id === id ? { ...c, isExpanded: !c.isExpanded } : c)
    );
  };

  // Stats calculations for the Stats tab
  const getConsultationStats = () => {
    const total = consultations.length;
    const scheduled = consultations.filter(c => c.status?.toLowerCase() === 'scheduled').length;
    const inProgress = consultations.filter(c => c.status?.toLowerCase() === 'in_progress').length;
    const completed = consultations.filter(c => c.status?.toLowerCase() === 'completed').length;
    const cancelled = consultations.filter(c => c.status?.toLowerCase() === 'cancelled').length;
    const noShow = consultations.filter(c => c.status?.toLowerCase() === 'no_show').length;
    
    const doctorConsultationCounts: Record<string, number> = {};
    consultations.forEach(c => {
      if (c.doctor?.first_name && c.doctor?.last_name) {
        const doctorName = `${c.doctor.first_name} ${c.doctor.last_name}`;
        doctorConsultationCounts[doctorName] = (doctorConsultationCounts[doctorName] || 0) + 1;
      }
    });
    
    const topDoctors = Object.entries(doctorConsultationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    return {
      total,
      scheduled,
      inProgress,
      completed,
      cancelled,
      noShow,
      topDoctors
    };
  };

  // Get counts of consultations by status
  const stats = getConsultationStats();
  
  // Render skeleton loading UI
  const renderSkeletons = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white p-4 rounded-xl shadow-sm animate-pulse">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with stats overview */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Consultation Management</h1>
          <p className="text-gray-600">Monitor and manage all consultations across the platform</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1 text-sm">
            <Clock size={16} />
            <span>Scheduled: {stats.scheduled}</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 flex items-center gap-1 text-sm">
            <Activity size={16} />
            <span>In Progress: {stats.inProgress}</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1 text-sm">
            <CheckCircle size={16} />
            <span>Completed: {stats.completed}</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-red-100 text-red-700 flex items-center gap-1 text-sm">
            <XCircle size={16} />
            <span>Cancelled/No-show: {stats.cancelled + stats.noShow}</span>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
              ${activeTab === 'list' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <Clipboard className="w-4 h-4" />
            <span>List View</span>
          </button>
          
          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
              ${activeTab === 'calendar' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Calendar View</span>
          </button>
          
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
              ${activeTab === 'stats' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Statistics</span>
          </button>
        </div>
      </div>

      {/* Filters and Search for List View */}
      {activeTab === 'list' && (
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by patient, doctor, or reason..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-4">
              <div className="relative">
                <select
                  className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={filterDoctor}
                  onChange={(e) => setFilterDoctor(e.target.value)}
                >
                  <option value="All">All Doctors</option>
                  {getDoctorOptions().map(doctor => (
                    <option key={doctor} value={doctor}>{doctor}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <div className="relative">
                <select
                  className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <button
                onClick={fetchConsultations}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Tab Content */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
        {isLoading ? (
          renderSkeletons()
        ) : (
          <>
            {/* List View Tab */}
            {activeTab === 'list' && (
              <div className="space-y-4">
                {filteredConsultations.length === 0 ? (
                  <div className="py-16 flex flex-col items-center justify-center">
                    <div className="bg-gray-100 p-4 rounded-full mb-4">
                      <Filter className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700">No consultations found</h3>
                    <p className="text-gray-500 mt-1">Try adjusting your filters or search term</p>
                  </div>
                ) : (
                  filteredConsultations.map((consultation) => (
                    <div 
                      key={consultation.id}
                      className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200"
                    >
                      {/* Header section - always visible */}
                      <div 
                        className="bg-white p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleExpandConsultation(consultation.id)}
                      >
                        <div className="flex items-start mb-2 sm:mb-0">
                          <div className="mr-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium text-gray-900">
                                {consultation.patient?.first_name} {consultation.patient?.last_name}
                              </h3>
                              {typeof consultation.date === 'string' && consultation.date && (() => {
                                try {
                                  return isToday(parseISO(consultation.date));
                                } catch {
                                  return false;
                                }
                              })() && (
                                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Today</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{consultation.patient?.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-sm text-gray-600">{safeFormatISO(consultation.date, 'MMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-sm text-gray-600">{consultation.start_time ? consultation.start_time.slice(0, 5) : 'N/A'}</span>
                          </div>
                          <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(consultation.status).bg} ${getStatusBadge(consultation.status).text}`}>
                            {getStatusBadge(consultation.status).icon}
                            <span className="capitalize">{consultation.status?.replace('_', ' ') || 'Unknown'}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Expanded content */}
                      {consultation.isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-gray-200 p-4 bg-gray-50"
                        >
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Left column */}
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Doctor</h4>
                                <div className="flex items-center">
                                  <Stethoscope className="h-5 w-5 text-blue-600 mr-3" />
                                  <div>
                                    <p className="font-medium text-gray-800">Dr. {consultation.doctor?.first_name} {consultation.doctor?.last_name}</p>
                                    <p className="text-sm text-gray-600">{consultation.doctor?.specialization || 'General Practice'}</p>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Consultation Details</h4>
                                <div className="bg-white p-3 rounded-md border border-gray-200 space-y-2">
                                  <div>
                                    <span className="text-xs font-medium text-gray-500">Reason:</span>
                                    <p className="text-sm text-gray-800">{consultation.reason || 'Not specified'}</p>
                                  </div>
                                  {consultation.additional_notes && (
                                    <div>
                                      <span className="text-xs font-medium text-gray-500">Additional Notes:</span>
                                      <p className="text-sm text-gray-800">{consultation.additional_notes}</p>
                                    </div>
                                  )}
                                  {consultation.room && (
                                    <div className="flex items-center">
                                      <span className="text-xs font-medium text-gray-500 mr-2">Room:</span>
                                      <span className="text-sm font-medium text-blue-600">{consultation.room}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Right column */}
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Actions</h4>
                                <div className="flex flex-wrap gap-2">
                                  {/* Action buttons based on status */}
                                  {consultation.status?.toLowerCase() === 'scheduled' && (
                                    <>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStartConsultation(consultation.id);
                                        }}
                                        disabled={consultation.isProcessing}
                                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        <Play className="h-4 w-4" />
                                        <span>Start Consultation</span>
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCancelConsultation(consultation.id);
                                        }}
                                        disabled={consultation.isProcessing}
                                        className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        <XCircle className="h-4 w-4" />
                                        <span>Cancel</span>
                                      </button>
                                    </>
                                  )}
                                  
                                  {consultation.status?.toLowerCase() === 'in_progress' && consultation.room && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleJoinConsultation(consultation.room || '');
                                      }}
                                      className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                                    >
                                      <Video className="h-4 w-4" />
                                      <span>Join Room</span>
                                    </button>
                                  )}
                                  
                                  {consultation.status?.toLowerCase() === 'completed' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewDetails(consultation);
                                      }}
                                      className="px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 flex items-center gap-2"
                                    >
                                      <FileText className="h-4 w-4" />
                                      <span>View Medical Notes</span>
                                    </button>
                                  )}
                                  
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewDetails(consultation);
                                    }}
                                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-2"
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span>View Details</span>
                                  </button>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Timeline</h4>
                                <div className="bg-white p-3 rounded-md border border-gray-200">
                                  <ul className="space-y-2">
                                    <li className="flex items-start">
                                      <div className="mr-2 mt-0.5">
                                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                      </div>
                                      <div className="text-xs">
                                        <span className="font-medium text-gray-700">Created: </span>
                                        <span>{safeFormatISO(consultation.created_at, 'MMM d, yyyy HH:mm')}</span>
                                      </div>
                                    </li>
                                    {consultation.updated_at !== consultation.created_at && (
                                      <li className="flex items-start">
                                        <div className="mr-2 mt-0.5">
                                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                        </div>
                                        <div className="text-xs">
                                          <span className="font-medium text-gray-700">Last Updated: </span>
                                          <span>{safeFormatISO(consultation.updated_at, 'MMM d, yyyy HH:mm')}</span>
                                        </div>
                                      </li>
                                    )}
                                    {consultation.status === 'completed' && consultation.record_id && (
                                      <li className="flex items-start">
                                        <div className="mr-2 mt-0.5">
                                          <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                                        </div>
                                        <div className="text-xs">
                                          <span className="font-medium text-gray-700">Completed with Record: </span>
                                          <span className="text-purple-600">{consultation.record_id}</span>
                                        </div>
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
            
            {/* Calendar View Tab */}
            {activeTab === 'calendar' && (
              <div className="p-4">
                <div className="text-center pb-8">
                  <h3 className="text-lg font-medium text-gray-900">Calendar view is coming soon!</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    We're working on a calendar integration to visualize all consultations.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredConsultations
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((consultation) => (
                      <div 
                        key={`cal-${consultation.id}`} 
                        className="p-3 border border-gray-200 rounded-md hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="text-sm font-medium">{safeFormatISO(consultation.date, 'MMM d')}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="text-sm">{consultation.start_time ? consultation.start_time.slice(0, 5) : 'N/A'}-{consultation.end_time ? consultation.end_time.slice(0, 5) : 'N/A'}</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="font-medium text-gray-800">
                            {consultation.patient?.first_name} {consultation.patient?.last_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            with Dr. {consultation.doctor?.last_name}
                          </p>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <span className={`flex items-center text-xs px-2 py-1 rounded-full ${getStatusBadge(consultation.status).bg} ${getStatusBadge(consultation.status).text}`}>
                            {getStatusBadge(consultation.status).icon}
                            <span>{consultation.status || 'Unknown'}</span>
                          </span>
                          <button
                            onClick={() => handleViewDetails(consultation)}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            Details
                            <ChevronDown className="h-3 w-3 ml-1" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
            
            {/* Stats View Tab */}
            {activeTab === 'stats' && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Total Consultations */}
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-700">Total Consultations</h3>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {stats.total}
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Scheduled</span>
                        <span className="font-medium">{stats.scheduled} ({Math.round(stats.scheduled / stats.total * 100)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${Math.round(stats.scheduled / stats.total * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">In Progress</span>
                        <span className="font-medium">{stats.inProgress} ({Math.round(stats.inProgress / stats.total * 100)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${Math.round(stats.inProgress / stats.total * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Completed</span>
                        <span className="font-medium">{stats.completed} ({Math.round(stats.completed / stats.total * 100)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${Math.round(stats.completed / stats.total * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Cancelled</span>
                        <span className="font-medium">{stats.cancelled} ({Math.round(stats.cancelled / stats.total * 100)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${Math.round(stats.cancelled / stats.total * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Top Doctors */}
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Top Doctors</h3>
                    <ul className="space-y-4">
                      {stats.topDoctors.map(([doctor, count], index) => (
                        <li key={doctor} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs font-medium">
                              {index + 1}
                            </div>
                            <span className="text-gray-800">{doctor}</span>
                          </div>
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-700">
                            {count} consultations
                          </span>
                        </li>
                      ))}
                      {stats.topDoctors.length === 0 && (
                        <li className="text-gray-500 text-sm">No doctor data available</li>
                      )}
                    </ul>
                  </div>
                  
                  {/* Date Range Analysis */}
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Date Range</h3>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">From</p>
                        <p className="font-medium">{safeFormatISO(dateRange.start, 'MMM d, yyyy')}</p>
                      </div>
                      <div className="text-gray-400">to</div>
                      <div>
                        <p className="text-sm text-gray-500">To</p>
                        <p className="font-medium">{safeFormatISO(dateRange.end, 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button 
                        onClick={() => {
                          const today = new Date();
                          const nextWeek = addDays(today, 7);
                          setDateRange({
                            start: format(today, 'yyyy-MM-dd'),
                            end: format(nextWeek, 'yyyy-MM-dd')
                          });
                        }}
                        className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 mr-2"
                      >
                        Next 7 days
                      </button>
                      <button 
                        onClick={() => {
                          const today = new Date();
                          const nextMonth = addDays(today, 30);
                          setDateRange({
                            start: format(today, 'yyyy-MM-dd'),
                            end: format(nextMonth, 'yyyy-MM-dd')
                          });
                        }}
                        className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
                      >
                        Next 30 days
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Details Modal */}
      {showDetailsModal && selectedConsultation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Consultation Details</h3>
              <div className="flex items-center">
                {getStatusBadge(selectedConsultation.status).icon}
                <span className={`capitalize px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(selectedConsultation.status).bg} ${getStatusBadge(selectedConsultation.status).text}`}>
                  {selectedConsultation.status?.replace('_', ' ') || 'Unknown'}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Patient and Appointment Info */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Patient Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedConsultation.patient?.first_name} {selectedConsultation.patient?.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedConsultation.patient?.email}
                        </p>
                      </div>
                    </div>
                    
                    {/* Could add more patient details here if available */}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Appointment Details</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-gray-700">
                        {safeFormatISO(selectedConsultation.date, 'MMMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center mb-3">
                      <Clock className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-gray-700">
                        {selectedConsultation.start_time ? selectedConsultation.start_time.slice(0, 5) : 'N/A'} - {selectedConsultation.end_time ? selectedConsultation.end_time.slice(0, 5) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <MessageCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Reason for Consultation:</p>
                        <p className="text-gray-600">{selectedConsultation.reason || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Doctor Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                        <Stethoscope className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Dr. {selectedConsultation.doctor?.first_name} {selectedConsultation.doctor?.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedConsultation.doctor?.specialization || 'General Medicine'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Additional Info and Actions */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Additional Notes</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600 whitespace-pre-line">
                      {selectedConsultation.additional_notes || 'No additional notes provided.'}
                    </p>
                  </div>
                </div>
                
                {selectedConsultation.record_id && selectedConsultation.status?.toLowerCase() === 'completed' && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Medical Records</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">
                        Medical record is available for this consultation:
                      </p>
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                        onClick={() => {
                          // Link to medical record view
                          router.push(`/admin/medical-records/${selectedConsultation.record_id}`);
                        }}
                      >
                        <FileText className="h-4 w-4" />
                        <span>View Medical Record</span>
                      </button>
                    </div>
                  </div>
                )}
                
                {selectedConsultation.room && selectedConsultation.status?.toLowerCase() === 'in_progress' && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Active Consultation</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">
                        This consultation is currently in progress:
                      </p>
                      <button
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                        onClick={() => {
                          handleJoinConsultation(selectedConsultation.room || '');
                          setShowDetailsModal(false);
                        }}
                      >
                        <Video className="h-4 w-4" />
                        <span>Join Consultation Room</span>
                      </button>
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedConsultation.status?.toLowerCase() === 'scheduled' && (
                      <>
                        <button
                          onClick={() => {
                            handleStartConsultation(selectedConsultation.id);
                            setShowDetailsModal(false);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                        >
                          <Play className="h-4 w-4" />
                          <span>Start Consultation</span>
                        </button>
                        <button
                          onClick={() => {
                            handleCancelConsultation(selectedConsultation.id);
                            setShowDetailsModal(false);
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Cancel Consultation</span>
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
