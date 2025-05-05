'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, UserCheck, UserX, Clock, Search, Calendar as CalendarIcon, Filter, AlertCircle, X, ChevronDown, ChevronUp, Activity, Stethoscope, Percent, AlertTriangle, FileText } from 'lucide-react';
import { consultationApi, ConsultationRequest } from '@/services/consultationApi';
import { format } from 'date-fns';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../calendar.css';

type Value = Date | null;
type FilterType = 'status' | 'date' | 'search';
type StatusType = 'all' | 'pending' | 'approved' | 'rejected';

interface ActiveFilter {
  type: FilterType;
  label: string;
  color: string;
}

export default function ConsultationRequestsPage() {
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<StatusType>('all');
  const [selectedDate, setSelectedDate] = useState<Value>(new Date()); // Initialize with today's date
  const [searchQuery, setSearchQuery] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

  useEffect(() => {
    // Use today's date for the initial request
    const today = new Date();
    fetchRequests(today);
  }, []);

  const fetchRequests = async (date: Date | null) => {
    try {
      setLoading(true);
      
      // Pass the Date object directly to the API instead of formatting it as a string
      // The API is expecting a Date object to call getTime() on it
      const data = await consultationApi.getRequests(date);
      setRequests(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch requests');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      setLoading(true);
      await consultationApi.updateRequestStatus(id, status);
      
      // Pass the date object directly when refreshing after status update
      await fetchRequests(selectedDate);
      
      setError(null);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to update request status');
      }
    } finally {
      setLoading(false);
    }
  };

    const handleDateSelect = (value: Value, event: React.MouseEvent<HTMLButtonElement>) => {
    if (value instanceof Date) {
      setSelectedDate(value);
      setShowCalendar(false);
      fetchRequests(value);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedDate(null);
    fetchRequests(null); // Remove date filtering completely
  };

  const removeFilter = async (filterType: FilterType) => {
    switch (filterType) {
      case 'status':
        setSelectedStatus('all');
        break;
      case 'date':
        setSelectedDate(null);
        fetchRequests(null); // Remove date filtering completely
        break;
      case 'search':
        setSearchQuery('');
        break;
    }
  };

  // Memoized filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      // Status filter - adjust for "approved" instead of "accepted"
      if (selectedStatus !== 'all' && request.attributes.status !== selectedStatus) {
        return false;
      }

      if (selectedDate) {
        // Get date from the correct location in the data structure
        const dateStr = request.attributes.availability_details?.date || request.attributes.date;
        if (!dateStr) return false;
        
        const requestDate = new Date(dateStr);
        if (isNaN(requestDate.getTime()) || format(requestDate, 'yyyy-MM-dd') !== format(selectedDate, 'yyyy-MM-dd')) {
          return false;
        }
      }

      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        
        // Add safety checks for patient data
        let patientName = "Unknown Patient";
        let patientEmail = "";
        
        // Handle both data structure possibilities
        if (request.attributes.relationships?.patient?.attributes) {
          // Original structure
          patientName = `${request.attributes.relationships.patient.attributes.first_name || ''} ${request.attributes.relationships.patient.attributes.last_name || ''}`.trim().toLowerCase() || "unknown patient";
          patientEmail = request.attributes.relationships.patient.attributes.email?.toLowerCase() || "";
        } else if (request.attributes.patient_details) {
          // Alternative structure
          patientName = request.attributes.patient_details.name?.toLowerCase() || "unknown patient";
          patientEmail = request.attributes.patient_details.email?.toLowerCase() || "";
        }
        
        const symptoms = request.attributes.symptoms?.toLowerCase() || "";
        const notes = request.attributes.additional_notes?.toLowerCase() || "";
        
        return patientName.includes(searchLower) || 
               patientEmail.includes(searchLower) ||
               symptoms.includes(searchLower) ||
               notes.includes(searchLower);
      }
      
      return true;
    });
  }, [requests, selectedStatus, selectedDate, searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved': // Change from 'accepted' to 'approved'
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Active filters display
  const activeFilters = (): ActiveFilter[] => {
    const filters: ActiveFilter[] = [];
    
    if (selectedStatus !== 'all') {
      filters.push({
        type: 'status' as FilterType,
        label: `Status: ${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}`,
        color: getStatusColor(selectedStatus)
      });
    }
    
    if (selectedDate) {
      filters.push({
        type: 'date' as FilterType,
        label: `Date: ${format(selectedDate, 'MMM d, yyyy')}`,
        color: 'bg-blue-100 text-blue-800'
      });
    }
    
    if (searchQuery) {
      filters.push({
        type: 'search' as FilterType,
        label: `Search: ${searchQuery}`,
        color: 'bg-purple-100 text-purple-800'
      });
    }
    
    return filters;
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

  const pulseAnimation = {
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const toggleExpandRequest = (requestId: string) => {
    setExpandedRequestId(expandedRequestId === requestId ? null : requestId);
  };

  return (
    <motion.div 
      className="max-w-[2000px] mx-auto px-6 py-8 space-y-8 min-h-screen bg-gradient-to-br from-gray-50 to-white"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div 
        className="flex items-center justify-between mb-8"
        variants={itemVariants}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#ABF600] bg-opacity-20 rounded-xl">
            <ClipboardList className="w-8 h-8 text-[#1A202C]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Consultation Requests</h1>
            <p className="text-gray-500 mt-1">Manage and track patient consultation requests</p>
          </div>
        </div>
        <motion.div 
          className="px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100"
          animate={pulseAnimation}
        >
          <div className="text-sm text-gray-500">
            Total Requests: <span className="font-semibold text-[#1A202C]">{requests.length}</span>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
        variants={itemVariants}
      >
        <motion.div 
          className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-6">
            <div className="p-4 bg-yellow-100 rounded-xl">
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <Clock className="w-8 h-8 text-yellow-600" />
              </motion.div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Pending</h3>
              <motion.p 
                className="text-3xl font-bold text-[#1A202C]"
                animate={pulseAnimation}
              >
                {requests.filter(r => r.attributes.status === 'pending').length}
              </motion.p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-6">
            <div className="p-4 bg-green-100 rounded-xl">
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Approved</h3>
              <p className="text-3xl font-bold text-[#1A202C]">
                {requests.filter(r => r.attributes.status === 'approved').length}
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-6">
            <div className="p-4 bg-red-100 rounded-xl">
              <UserX className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Rejected</h3>
              <p className="text-3xl font-bold text-[#1A202C]">
                {requests.filter(r => r.attributes.status === 'rejected').length}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Active Filters */}
      {activeFilters().length > 0 && (
        <motion.div 
          className="flex flex-wrap gap-3 mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {activeFilters().map((filter, index) => (
            <motion.div
              key={filter.type}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${filter.color}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <span className="text-sm font-medium">{filter.label}</span>
              <button
                onClick={() => removeFilter(filter.type)}
                className="p-0.5 hover:bg-black/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
          
          {activeFilters().length > 1 && (
            <motion.button
              onClick={clearAllFilters}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Filter className="w-4 h-4" />
              Clear all filters
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Filters and Search */}
      <motion.div 
        className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
        variants={itemVariants}
      >
        <div className="flex flex-wrap gap-6 items-center">
          <motion.div 
            className="relative flex-1 min-w-[240px]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              animate={{
                x: [0, 5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2"
            >
              <Search className="w-5 h-5 text-gray-400" />
            </motion.div>
            <input
              type="text"
              placeholder="Search by patient name, email, or symptoms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#ABF600] focus:border-[#ABF600] bg-gray-50 text-gray-900 transition-all duration-300"
            />
          </motion.div>
          
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.02 }}
          >
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center gap-3 pl-12 pr-6 py-3 border rounded-xl focus:ring-2 focus:ring-[#ABF600] focus:border-[#ABF600] bg-gray-50 relative min-w-[200px]"
            >
              <CalendarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <span className="text-gray-900 font-medium">
                {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Select date'}
              </span>
            </button>
            {showCalendar && (
              <div className="absolute top-full left-0 mt-2 z-50">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-xl shadow-xl p-4 border border-gray-100"
                >
                  <Calendar
                    onChange={handleDateSelect}
                    value={selectedDate}
                    className="border-0 rounded-xl"
                  />
                </motion.div>
              </div>
            )}
          </motion.div>
          
          <motion.select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as StatusType)}
            className="pl-6 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-[#ABF600] focus:border-[#ABF600] bg-gray-50 text-gray-900 font-medium appearance-none cursor-pointer min-w-[160px]"
            whileHover={{ scale: 1.02 }}
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 16px center', backgroundSize: '20px', backgroundRepeat: 'no-repeat' }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option> {/* Change from 'accepted' to 'approved' */}
            <option value="rejected">Rejected</option>
          </motion.select>
        </div>
      </motion.div>

      {/* Requests Table */}
      <motion.div 
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
        variants={itemVariants}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-10 px-4 py-5"></th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Symptoms
                </th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-8 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <motion.div
                        animate={{
                          rotate: 360,
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-8 h-8 border-3 border-[#ABF600] border-t-transparent rounded-full"
                      />
                      <span className="text-gray-600 font-medium">Loading requests...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-6 max-w-lg mx-auto"
                    >
                      <div className="p-6 bg-gray-50 rounded-full">
                        <ClipboardList className="w-12 h-12 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No consultation requests found
                        </h3>
                        <p className="text-gray-500 mb-6">
                          Try adjusting your search or filters to find what you're looking for.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl p-6 bg-gray-50 rounded-xl">
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">Try searching for:</h4>
                          <ul className="space-y-3 text-sm text-gray-600">
                            <motion.li 
                              className="flex items-center gap-2"
                              whileHover={{ x: 4 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <div className="w-1.5 h-1.5 bg-[#ABF600] rounded-full" />
                              Patient name: "John Smith"
                            </motion.li>
                            <motion.li 
                              className="flex items-center gap-2"
                              whileHover={{ x: 4 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <div className="w-1.5 h-1.5 bg-[#ABF600] rounded-full" />
                              Email: "john@example.com"
                            </motion.li>
                            <motion.li 
                              className="flex items-center gap-2"
                              whileHover={{ x: 4 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <div className="w-1.5 h-1.5 bg-[#ABF600] rounded-full" />
                              Symptoms: "headache", "fever"
                            </motion.li>
                          </ul>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">Try filtering by:</h4>
                          <ul className="space-y-3 text-sm text-gray-600">
                            <motion.li 
                              className="flex items-center gap-2"
                              whileHover={{ x: 4 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                              Status: "Pending"
                            </motion.li>
                            <motion.li 
                              className="flex items-center gap-2"
                              whileHover={{ x: 4 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                              Status: "Approved"
                            </motion.li>
                            <motion.li 
                              className="flex items-center gap-2"
                              whileHover={{ x: 4 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                              Status: "Rejected"
                            </motion.li>
                          </ul>
                        </div>
                      </div>

                      <motion.button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedStatus('all');
                          setSelectedDate(null);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Filter className="w-4 h-4" />
                        Clear all filters
                      </motion.button>
                    </motion.div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map(request => (
                  <React.Fragment key={request.id}>
                    <motion.tr
                      variants={itemVariants}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => toggleExpandRequest(request.id)}
                    >
                      <td className="px-4 py-5 text-center">
                        <button className="text-gray-500 hover:text-gray-700">
                          {expandedRequestId === request.id ? 
                            <ChevronUp className="w-5 h-5" /> : 
                            <ChevronDown className="w-5 h-5" />}
                        </button>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {(() => {
                              // Access patient data according to actual structure
                              if (request.attributes.patient) {
                                const firstName = request.attributes.patient.first_name || "";
                                const lastName = request.attributes.patient.last_name || "";
                                return `${firstName} ${lastName}`.trim() || "Unknown Patient";
                              } else if (request.attributes.relationships?.patient?.attributes) {
                                const firstName = request.attributes.relationships.patient.attributes.first_name || "";
                                const lastName = request.attributes.relationships.patient.attributes.last_name || "";
                                return `${firstName} ${lastName}`.trim() || "Unknown Patient";
                              } else if (request.attributes.patient_details) {
                                return request.attributes.patient_details.name || "Unknown Patient";
                              } 
                              return "Unknown Patient";
                            })()}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {request.attributes.patient?.email || 
                             request.attributes.relationships?.patient?.attributes?.email || 
                             request.attributes.patient_details?.email || 
                             "No email provided"}
                          </p>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-gray-900">
                          {request.attributes.availability_details?.date ? 
                            new Date(request.attributes.availability_details.date).toLocaleDateString() :
                            new Date(request.attributes.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.attributes.availability_details?.start_time ? 
                            `${request.attributes.availability_details.start_time} - ${request.attributes.availability_details.end_time}` :
                            request.attributes.time || 'Time not specified'}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="max-w-xs line-clamp-2 text-gray-700">
                          {typeof request.attributes.symptoms === 'object' && request.attributes.symptoms !== null
                            ? Object.entries(request.attributes.symptoms)
                                .filter(([_, value]) => value === true || value === 'Yes')
                                .map(([key]) => key)
                                .join(', ') || 'No symptoms specified'
                            : request.attributes.symptoms || 'No symptoms specified'}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          request.attributes.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                          request.attributes.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.attributes.status.charAt(0).toUpperCase() + request.attributes.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {request.attributes.status === 'pending' ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row expansion when clicking button
                                  handleUpdateStatus(request.id, 'approved'); // Change from 'accepted' to 'approved'
                                }}
                                disabled={loading}
                                className="p-2 bg-green-50 rounded-lg text-green-600 hover:bg-green-100 transition-colors"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row expansion when clicking button
                                  handleUpdateStatus(request.id, 'rejected');
                                }}
                                disabled={loading}
                                className="p-2 bg-red-50 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">
                              {request.attributes.status === 'approved' ? 'Approved' : 'Rejected'} {/* Change from 'accepted' to 'approved' */}
                            </span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                    
                    <AnimatePresence>
                      {expandedRequestId === request.id && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-gray-50"
                        >
                          <td colSpan={6} className="px-8 py-6">
                            <motion.div
                              initial={{ opacity: 0, y: -20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 }}
                              className="space-y-6"
                            >
                              {/* Consultation Reason */}
                              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="p-2 bg-indigo-100 rounded-lg">
                                    <Activity className="w-5 h-5 text-indigo-600" />
                                  </div>
                                  <h3 className="text-lg font-bold text-gray-900">Reason for Consultation</h3>
                                </div>
                                
                                <p className="text-gray-700 whitespace-pre-wrap">
                                  {request.attributes.reason || "No reason specified"}
                                </p>
                              </div>
                              
                              {/* Health Prediction Section */}
                              {request.attributes.health_prediction ? (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                  {/* Main Prediction Card */}
                                  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                                    <div className="flex items-center gap-3 mb-4">
                                      <div className="p-2 bg-purple-100 rounded-lg">
                                        <Stethoscope className="w-5 h-5 text-purple-600" />
                                      </div>
                                      <h3 className="text-lg font-bold text-gray-900">Health Prediction</h3>
                                    </div>
                                    
                                    <div className="mt-2 space-y-3">
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Predicted Condition:</span>
                                        <span className="font-semibold text-gray-900">{request.attributes.health_prediction.predicted_disease}</span>
                                      </div>
                                      
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Confidence:</span>
                                        <div className="flex items-center gap-2">
                                          <span className="font-semibold text-gray-900">
                                            {Math.round(request.attributes.health_prediction.probability * 100)}%
                                          </span>
                                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                              className={`h-full rounded-full ${
                                                request.attributes.health_prediction.probability > 0.7 
                                                  ? 'bg-green-500' 
                                                  : request.attributes.health_prediction.probability > 0.4 
                                                    ? 'bg-yellow-500' 
                                                    : 'bg-red-500'
                                              }`}
                                              style={{ width: `${Math.round(request.attributes.health_prediction.probability * 100)}%` }}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Other Probabilities Card */}
                                  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                                    <div className="flex items-center gap-3 mb-4">
                                      <div className="p-2 bg-blue-100 rounded-lg">
                                        <Percent className="w-5 h-5 text-blue-600" />
                                      </div>
                                      <h3 className="text-lg font-bold text-gray-900">Other Possibilities</h3>
                                    </div>
                                    
                                    <div className="space-y-3">
                                      {request.attributes.health_prediction.significant_probabilities && 
                                       Object.entries(request.attributes.health_prediction.significant_probabilities)
                                        .filter(([disease]) => disease !== request.attributes.health_prediction.predicted_disease)
                                        .sort((a, b) => (b[1] as number) - (a[1] as number))
                                        .slice(0, 3)
                                        .map(([disease, probability]) => (
                                          <div key={disease} className="flex justify-between items-center">
                                            <span className="text-sm text-gray-700">{disease}:</span>
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium text-gray-900">
                                                {Math.round((probability as number) * 100)}%
                                              </span>
                                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div 
                                                  className="h-full bg-blue-400 rounded-full"
                                                  style={{ width: `${Math.round((probability as number) * 100)}%` }}
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                  
                                  {/* Patient Data Card */}
                                  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                                    <div className="flex items-center gap-3 mb-4">
                                      <div className="p-2 bg-green-100 rounded-lg">
                                        <FileText className="w-5 h-5 text-green-600" />
                                      </div>
                                      <h3 className="text-lg font-bold text-gray-900">Patient Data</h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                      {request.attributes.health_prediction.input_data && 
                                        Object.entries(request.attributes.health_prediction.input_data)
                                          .filter(([key]) => key !== "Outcome Variable")
                                          .map(([key, value]) => (
                                            <div key={key} className="flex flex-col">
                                              <span className="text-xs text-gray-500">{key}:</span>
                                              <span className="text-sm font-medium text-gray-900">{value}</span>
                                            </div>
                                          ))}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center py-4 px-6 bg-gray-100 rounded-lg">
                                  <AlertCircle className="w-5 h-5 text-gray-500 mr-2" />
                                  <span className="text-gray-600">No health prediction data available</span>
                                </div>
                              )}
                              
                              {/* Symptoms Details */}
                              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="p-2 bg-amber-100 rounded-lg">
                                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                                  </div>
                                  <h3 className="text-lg font-bold text-gray-900">Reported Symptoms</h3>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                  {typeof request.attributes.symptoms === 'object' && request.attributes.symptoms !== null && 
                                    Object.entries(request.attributes.symptoms).map(([symptom, value]) => (
                                      <div 
                                        key={symptom}
                                        className={`px-3 py-2 rounded-lg flex items-center gap-2 ${
                                          value === true || value === 'Yes' 
                                            ? 'bg-red-50 text-red-700 border border-red-100' 
                                            : 'bg-gray-50 text-gray-500 border border-gray-100'
                                        }`}
                                      >
                                        <div 
                                          className={`w-2 h-2 rounded-full ${
                                            value === true || value === 'Yes' ? 'bg-red-500' : 'bg-gray-300'
                                          }`}
                                        />
                                        <span className="text-sm font-medium">{symptom}</span>
                                      </div>
                                    ))}
                                </div>
                              </div>
                              
                              {/* Additional Notes */}
                              {request.attributes.additional_notes && (
                                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                      <FileText className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Additional Notes</h3>
                                  </div>
                                  
                                  <p className="text-gray-700 whitespace-pre-wrap">
                                    {request.attributes.additional_notes}
                                  </p>
                                </div>
                              )}
                            </motion.div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
