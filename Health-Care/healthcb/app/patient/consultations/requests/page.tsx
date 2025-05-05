"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { consultationApi, ConsultationRequest } from '@/services/consultationApi';
import { format, isValid, parseISO } from 'date-fns';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  MessageCircle, 
  User, 
  AlertCircle,
  X,
  Stethoscope
} from 'lucide-react';

type StatusFilterType = 'all' | 'pending' | 'approved' | 'rejected';

const formatSymptoms = (symptoms: any): string => {
  // If symptoms is falsy, return a default message
  if (!symptoms) return 'No symptoms provided';
  
  // If symptoms is already a string, return it
  if (typeof symptoms === 'string') return symptoms;
  
  // If symptoms is an array, join it
  if (Array.isArray(symptoms)) return symptoms.join(', ');
  
  // If symptoms is an object with true/false or "Yes"/"No" values
  if (typeof symptoms === 'object') {
    const activeSymptoms = Object.entries(symptoms)
      .filter(([_, value]) => value === true || value === "Yes")
      .map(([key]) => key);
      
    return activeSymptoms.length > 0 ? activeSymptoms.join(', ') : 'No symptoms provided';
  }
  
  // Default fallback
  return 'No symptoms provided';
};

const safeFormatDate = (dateString: string | undefined, formatString: string = 'PPP'): string => {
  try {
    if (!dateString) return 'No date available';
    
    const date = parseISO(dateString);
    if (!isValid(date)) {
      return 'Invalid date';
    }
    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Invalid date';
  }
};

export default function MyConsultationRequestsPage() {
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await consultationApi.getPatientRequests(statusFilter);
      setRequests(data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch your consultation requests');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    if (!searchQuery.trim()) return requests;
    
    const searchLower = searchQuery.toLowerCase();
    return requests.filter(request => {
      const doctorName = `${request.attributes.doctor?.first_name || ''} ${request.attributes.doctor?.last_name || ''}`.toLowerCase();
      const symptoms = formatSymptoms(request.attributes.symptoms).toLowerCase();
      const notes = request.attributes.additional_notes?.toLowerCase() || '';
      const reason = request.attributes.reason?.toLowerCase() || '';
      
      let dateStr = '';
      try {
        if (request.attributes.availability_details?.date) {
          const date = parseISO(request.attributes.availability_details.date);
          if (isValid(date)) {
            dateStr = format(date, 'PPP').toLowerCase();
          }
        }
      } catch (e) {
        console.error('Error formatting date for search', e);
      }
      
      return doctorName.includes(searchLower) || 
             symptoms.includes(searchLower) || 
             notes.includes(searchLower) ||
             reason.includes(searchLower) ||
             dateStr.includes(searchLower);
    });
  }, [requests, searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-50 to-white"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div 
        className="flex justify-between items-center mb-8"
        variants={itemVariants}
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Consultation Requests</h2>
          <p className="text-gray-500">Track and manage your consultation requests</p>
        </div>
        <motion.div
          className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100"
          whileHover={{ y: -3, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
        >
          <span className="text-sm text-gray-500">
            Total Requests: <span className="font-semibold text-[#1A202C]">{requests.length}</span>
          </span>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm mb-6"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters and Search */}
      <motion.div 
        className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 mb-8"
        variants={itemVariants}
      >
        <div className="flex flex-wrap gap-6 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by doctor, symptoms, or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ABF600] focus:border-[#ABF600]"
            />
          </div>
          
          <div className="relative min-w-[200px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilterType)}
              className="pl-4 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-[#ABF600] focus:border-[#ABF600] appearance-none w-full bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          {(searchQuery || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="text-sm text-gray-700 hover:text-gray-900 flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear filters
            </button>
          )}
        </div>
      </motion.div>

      {/* Request Cards */}
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl shadow-md p-6 animate-pulse"
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className="flex-1">
                    <div className="flex justify-between mb-4">
                      <div className="h-6 w-64 bg-gray-200 rounded"></div>
                      <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center">
                        <div className="h-4 w-4 bg-gray-200 rounded-full mr-2"></div>
                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex items-center">
                        <div className="h-4 w-4 bg-gray-200 rounded-full mr-2"></div>
                        <div className="h-4 w-36 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 w-full bg-gray-200 rounded mb-1"></div>
                      <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  
                  <div className="lg:w-64 border-l pl-6 hidden lg:block">
                    <div className="h-4 w-24 bg-gray-200 rounded mb-3"></div>
                    <div className="flex items-center mb-3">
                      <div className="h-10 w-10 bg-gray-200 rounded-full mr-3"></div>
                      <div>
                        <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 w-20 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    
                    <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 w-36 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 w-32 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <motion.div
              key={request.id}
              variants={itemVariants}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6"
              whileHover={{ y: -5 }}
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                <div className="flex-1">
                  <div className="flex justify-between mb-4">
                    <h3 className="font-semibold text-lg text-gray-900">
                      Consultation with {`${request.attributes.doctor?.first_name || ''} ${request.attributes.doctor?.last_name || ''}`}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.attributes.status)}`}>
                      {request.attributes.status.charAt(0).toUpperCase() + request.attributes.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-gray-700">
                      <Calendar className="h-4 w-4 mr-2 text-[#ABF600]" />
                      <span>{safeFormatDate(request.attributes.availability_details?.date)}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Clock className="h-4 w-4 mr-2 text-[#ABF600]" />
                      <span>
                        {request.attributes.availability_details?.start_time?.substring(0, 5) || 'N/A'} - 
                        {request.attributes.availability_details?.end_time?.substring(0, 5) || 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 font-medium mb-1">Symptoms:</div>
                    <p className="text-gray-700">
                      {formatSymptoms(request.attributes.symptoms)}
                    </p>
                  </div>
                  
                  {request.attributes.reason && (
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 font-medium mb-1">Reason:</div>
                      <p className="text-gray-700">{request.attributes.reason}</p>
                    </div>
                  )}
                  
                  {request.attributes.additional_notes && (
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 font-medium mb-1">Additional Notes:</div>
                      <p className="text-gray-700">{request.attributes.additional_notes}</p>
                    </div>
                  )}
                  
                  {request.attributes.status === 'rejected' && request.attributes.rejection_reason && (
                    <div className="mb-4 bg-red-50 p-4 rounded-lg border border-red-100">
                      <div className="flex items-center text-red-800 font-medium mb-1">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <span>Rejection Reason:</span>
                      </div>
                      <p className="text-red-700">{request.attributes.rejection_reason}</p>
                    </div>
                  )}
                </div>
                
                <div className="lg:w-64 border-l pl-6 hidden lg:block">
                  <div className="text-sm text-gray-500 font-medium mb-2">Doctor Details</div>
                  <div className="flex items-center mb-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Stethoscope className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {`${request.attributes.doctor?.first_name || ''} ${request.attributes.doctor?.last_name || ''}`}
                      </p>
                      <p className="text-sm text-gray-500">{request.attributes.doctor?.specialization || 'Specialist'}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500 font-medium mb-2">Request Info</div>
                  <p className="text-xs text-gray-500">Submitted: {safeFormatDate(request.attributes.created_at)}</p>
                  {request.attributes.updated_at !== request.attributes.created_at && (
                    <p className="text-xs text-gray-500">Last updated: {safeFormatDate(request.attributes.updated_at)}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-xl shadow-md p-12 text-center"
          >
            <div className="flex flex-col items-center">
              <div className="p-6 bg-gray-100 rounded-full mb-4">
                <ClipboardList className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No consultation requests found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {searchQuery || statusFilter !== 'all' 
                  ? "Try adjusting your search or filters to find what you're looking for." 
                  : "You haven't made any consultation requests yet. Book a consultation to get started."}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <a 
                  href="/patient/consultations" 
                  className="px-6 py-3 bg-[#ABF600] text-[#1A202C] rounded-lg hover:bg-[#96e000] transition-colors font-medium"
                >
                  Book a Consultation
                </a>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
