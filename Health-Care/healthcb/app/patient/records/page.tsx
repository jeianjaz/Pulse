"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { format } from "date-fns";
import { 
  Calendar, 
  ClipboardList, 
  Stethoscope, 
  Pill, 
  Heart, 
  Search, 
  Filter,
  X,
  ChevronDown,
  FileText,
  ChevronRight,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  FileCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import consultationRecordApi from "@/services/consultationRecordApi";

interface MedicalRecord {
  id: string;
  date: string;
  doctorName: string;
  diagnosis: string;
  prescribedMedications: string;
  treatmentPlan: string;
  postConsultationNotes: string;
  followupDate?: string;
  followupNotes?: string;
  requiresFollowup: boolean;
  attachment?: string;
  // Additional fields from API response
  specialization?: string;
  status?: string;
  room?: string;
  symptoms?: Record<string, string | boolean> | null;
  vitals?: {
    temperature?: string | null;
    blood_pressure?: string | null;
    oxygen_level?: string | null;
    cholesterol_level?: string | null;
  };
  physical_examination?: string;
  diagnosis_code?: string | null;
  consultation_duration?: string | null;
  consultation_id?: number;
  // UI helper fields
  formattedDate?: string;
  isExpanded?: boolean;
  has_attachments?: boolean;
}

type StatusFilterType = 'all' | 'recent' | 'followup' | 'with_attachments';

export default function PatientRecords() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: '',
    end: ''
  });
  // Track expanded record IDs
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());

  // Function to toggle expanded state of a record
  const toggleRecordExpansion = (recordId: string) => {
    setExpandedRecords(prevExpanded => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(recordId)) {
        newExpanded.delete(recordId);
      } else {
        newExpanded.add(recordId);
      }
      return newExpanded;
    });
  };

  useEffect(() => {
    fetchMedicalRecords();
  }, [filter, selectedDate, dateRange]);

  // When search term changes, debounce the API call
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchMedicalRecords();
    }, 500);
    
    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  // Make sure no records are expanded by default
  useEffect(() => {
    if (records.length > 0) {
      setExpandedRecords(new Set());
    }
  }, [records]);

  const fetchMedicalRecords = async () => {
    try {
      setIsLoading(true);
      
      // Build params for API call
      const params: any = {};
      
      if (filter !== 'all') {
        params.filter = filter;
      }
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (selectedDate) {
        params.date = format(selectedDate, 'yyyy-MM-dd');
      } else if (dateRange.start && dateRange.end) {
        params.start_date = dateRange.start;
        params.end_date = dateRange.end;
      }
      
      // Call the API with the parameters
      try {
        const response = await consultationRecordApi.getPatientConsultationRecords(params);
        
        // Transform the API response to match our MedicalRecord interface
        let fetchedRecords: MedicalRecord[] = [];
        
        if (response && response.data) {
          console.log("API Response:", response.data);
          
          // Map each record from the API to our MedicalRecord interface
          fetchedRecords = response.data.map(record => {
            // Format vital signs into readable strings when available
            const vitals = record.medical_data?.vitals || {};
            
            // Process symptoms array or object into displayable format
            let processedSymptoms: Record<string, string | boolean> = {};
            if (record.medical_data?.symptoms) {
              if (Array.isArray(record.medical_data.symptoms)) {
                // Handle symptoms as array
                record.medical_data.symptoms.forEach(symptom => {
                  processedSymptoms[symptom] = 'Yes';
                });
              } else if (typeof record.medical_data.symptoms === 'object') {
                // Handle symptoms as object
                processedSymptoms = record.medical_data.symptoms;
              }
            }
            
            // Format date fields properly
            const consultationDate = record.consultation_date ? new Date(record.consultation_date) : 
                                   record.timing?.completed_at ? new Date(record.timing.completed_at) : 
                                   new Date();
            
            // Format followup date if exists
            let followupDate = '';
            if (record.followup?.followup_date) {
              try {
                followupDate = record.followup.followup_date;
              } catch (e) {
                console.warn("Invalid followup date format:", record.followup.followup_date);
              }
            }
            
            // Return a properly formatted MedicalRecord object
            return {
              id: record.id.toString(),
              consultation_id: record.consultation_id,
              date: record.consultation_date || record.timing?.completed_at || new Date().toISOString(),
              doctorName: record.doctor?.name || "Unknown Doctor",
              specialization: record.doctor?.specialization || "",
              diagnosis: record.medical_data?.diagnosis || "",
              prescribedMedications: record.treatment?.prescribed_medications || "",
              treatmentPlan: record.treatment?.treatment_plan || "",
              postConsultationNotes: record.medical_data?.post_consultation_notes || 
                                   record.medical_data?.consultation_notes || "",
              followupDate: followupDate,
              followupNotes: record.followup?.followup_notes || "",
              requiresFollowup: record.followup?.requires_followup || false,
              // Use has_attachments flag directly from API
              attachment: record.has_attachments ? "View Attachments" : "",
              has_attachments: record.has_attachments || false,
              // Additional fields
              status: record.status || "",
              room: record.room || "",
              symptoms: processedSymptoms,
              vitals: {
                temperature: vitals.temperature || null,
                blood_pressure: vitals.blood_pressure || null,
                oxygen_level: vitals.oxygen_level || null,
                cholesterol_level: vitals.cholesterol_level || null
              },
              physical_examination: record.medical_data?.physical_examination || "",
              diagnosis_code: record.medical_data?.diagnosis_code || null,
              consultation_duration: record.timing?.consultation_duration || null,
              consultation_id: record.consultation_id || 0,
              // Add formatted date for better display
              formattedDate: format(consultationDate, "PPP"),
              // Track if record is expanded
              isExpanded: false
            };
          });
        }
        
        setRecords(fetchedRecords);
      } catch (apiError) {
        console.error("Error fetching records from API:", apiError);
        
        // Fallback to mock data if API fails
        useMockData();
      }
    } catch (error) {
      console.error('Error fetching medical records:', error);
      toast.error('Failed to load medical records');
      
      // Fallback to mock data
      useMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const useMockData = () => {
    // Mock data for demonstration
    const mockRecords = [
      {
        id: "1",
        date: new Date().toISOString(),
        doctorName: "Dr. Smith",
        diagnosis: "Mild upper respiratory infection",
        prescribedMedications: "Amoxicillin 500mg - 3x daily for 7 days",
        treatmentPlan: "Rest, increased fluid intake, follow-up in 1 week if symptoms persist",
        postConsultationNotes: "Patient reported improvement in symptoms after 3 days of treatment",
        requiresFollowup: true,
        followupDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
        followupNotes: "Check if symptoms have resolved completely"
      },
      {
        id: "2",
        date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
        doctorName: "Dr. Johnson",
        diagnosis: "Seasonal allergies",
        prescribedMedications: "Loratadine 10mg - once daily",
        treatmentPlan: "Avoid known allergens, keep windows closed during high pollen count days",
        postConsultationNotes: "Patient reports seasonal symptoms every spring. Previous treatments have been effective.",
        requiresFollowup: false,
        attachment: "allergy_test_results.pdf"
      },
      {
        id: "3",
        date: new Date(new Date().setDate(new Date().getDate() - 90)).toISOString(),
        doctorName: "Dr. Williams",
        diagnosis: "Hypertension - Stage 1",
        prescribedMedications: "Lisinopril 10mg - once daily",
        treatmentPlan: "Reduce sodium intake, regular exercise 30 minutes daily, monitor blood pressure weekly",
        postConsultationNotes: "Patient newly diagnosed with hypertension. No family history. Lifestyle factors likely contributing.",
        requiresFollowup: true,
        followupDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
        followupNotes: "Evaluate effectiveness of medication and lifestyle changes"
      }
    ];
    
    const filteredRecords = filterRecords(mockRecords);
    setRecords(filteredRecords);
  };

  const filterRecords = (data: MedicalRecord[]) => {
    let filtered = [...data];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(record => 
        record.doctorName.toLowerCase().includes(searchLower) ||
        record.diagnosis.toLowerCase().includes(searchLower) ||
        record.postConsultationNotes.toLowerCase().includes(searchLower) ||
        record.prescribedMedications.toLowerCase().includes(searchLower) ||
        record.treatmentPlan.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    switch(filter) {
      case 'recent':
        // Records from the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filtered = filtered.filter(record => new Date(record.date) >= thirtyDaysAgo);
        break;
      case 'followup':
        // Records that require followup
        filtered = filtered.filter(record => record.requiresFollowup);
        break;
      case 'with_attachments':
        // Records with attachments
        filtered = filtered.filter(record => record.has_attachments);
        break;
    }
    
    // Apply date filter
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      filtered = filtered.filter(record => 
        format(new Date(record.date), 'yyyy-MM-dd') === dateStr
      );
    } else if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
      });
    }
    
    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return filtered;
  };

  const clearFilters = () => {
    setFilter('all');
    setSearchTerm('');
    setSelectedDate(null);
    setDateRange({ start: '', end: '' });
  };
  
  const toggleDateFilter = () => {
    setShowDateFilter(!showDateFilter);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Medical Records
            </h1>
            <p className="text-gray-600 text-lg">
              Access and manage your complete medical history
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Status Filter */}
              <div className="relative">
                <label className="block text-sm text-gray-600 mb-1">Filter</label>
                <div className="relative">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as StatusFilterType)}
                    className="w-full p-2 border border-gray-300 rounded-md appearance-none pr-10"
                  >
                    <option value="all">All Records</option>
                    <option value="recent">Last 30 Days</option>
                    <option value="followup">Requires Follow-up</option>
                    <option value="with_attachments">With Attachments</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none w-4 h-4" />
                </div>
              </div>

              {/* Search by Doctor Name */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by doctor, diagnosis, etc."
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
                      : dateRange.start && dateRange.end 
                        ? `${format(new Date(dateRange.start), 'MMM d')} - ${format(new Date(dateRange.end), 'MMM d')}`
                        : 'All Dates'}
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
                          const today = new Date();
                          setDateRange({
                            start: format(new Date(today.setMonth(today.getMonth() - 1)), 'yyyy-MM-dd'),
                            end: format(new Date(), 'yyyy-MM-dd')
                          });
                          setSelectedDate(null);
                        }}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        Last 30 days
                      </button>
                      <button
                        onClick={() => {
                          const today = new Date();
                          setDateRange({
                            start: format(new Date(today.setMonth(today.getMonth() - 3)), 'yyyy-MM-dd'),
                            end: format(new Date(), 'yyyy-MM-dd')
                          });
                          setSelectedDate(null);
                        }}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        Last 3 months
                      </button>
                      <button
                        onClick={() => {
                          const today = new Date();
                          setDateRange({
                            start: format(new Date(today.setMonth(today.getMonth() - 6)), 'yyyy-MM-dd'),
                            end: format(new Date(), 'yyyy-MM-dd')
                          });
                          setSelectedDate(null);
                        }}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        Last 6 months
                      </button>
                      <button
                        onClick={() => {
                          const today = new Date();
                          setDateRange({
                            start: format(new Date(today.setFullYear(today.getFullYear() - 1)), 'yyyy-MM-dd'),
                            end: format(new Date(), 'yyyy-MM-dd')
                          });
                          setSelectedDate(null);
                        }}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        Last year
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Active Filters Display */}
            {(filter !== 'all' || searchTerm || selectedDate || (dateRange.start && dateRange.end)) && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {filter !== 'all' && (
                    <div className="flex items-center gap-1 px-2 py-1 text-sm rounded-md bg-blue-100 text-blue-800">
                      <Filter className="w-3 h-3" />
                      <span>Filter: {filter.replace('_', ' ').charAt(0).toUpperCase() + filter.replace('_', ' ').slice(1)}</span>
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
                      <span>Date Range: {format(new Date(dateRange.start), 'MMM d, yyyy')} - {format(new Date(dateRange.end), 'MMM d, yyyy')}</span>
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
        </div>
      </div>

      {/* Content Section - REDESIGNED for minimized display */}
      <div className="container mx-auto px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            // Loading Skeletons
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
                  <div className="flex justify-between">
                    <div className="h-6 bg-gray-200 w-1/4 rounded"></div>
                    <div className="h-6 bg-gray-200 w-1/6 rounded"></div>
                  </div>
                  <div className="h-4 bg-gray-200 w-1/3 rounded mt-3"></div>
                </div>
              ))}
            </div>
          ) : records.length > 0 ? (
            <div className="space-y-4">
              {records.map((record) => (
                <Card 
                  key={record.id} 
                  className={`border border-gray-200 transition-all duration-200 ${
                    expandedRecords.has(record.id) 
                      ? 'shadow-md' 
                      : 'hover:shadow-md shadow-sm'
                  }`}
                >
                  {/* Minimized View - Always visible */}
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => toggleRecordExpansion(record.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5 flex-1">
                        {/* Doctor info with icon */}
                        <div className="flex items-center">
                          <div className="bg-blue-50 p-1.5 rounded-full mr-3">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-semibold text-gray-900">{record.doctorName}</h3>
                              {record.specialization && (
                                <span className="text-sm ml-1.5 text-gray-600">
                                  ({record.specialization})
                                </span>
                              )}
                            </div>
                            {/* Diagnosis summary */}
                            <p className="text-sm text-gray-700 line-clamp-1 mt-0.5">
                              {record.diagnosis || "No diagnosis recorded"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right side with date and indicators */}
                      <div className="flex flex-col items-end space-y-1.5">
                        {/* Date with icon */}
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-3.5 h-3.5 mr-1.5" />
                          {format(new Date(record.date), "PP")}
                        </div>
                        
                        {/* Indicator badges row */}
                        <div className="flex items-center gap-2">
                          {record.requiresFollowup && (
                            <div className="flex items-center text-xs rounded-full px-2 py-0.5 bg-amber-50 text-amber-700">
                              <Clock className="w-3 h-3 mr-1" />
                              Follow-up
                            </div>
                          )}
                          
                          {record.has_attachments && (
                            <div className="flex items-center text-xs rounded-full px-2 py-0.5 bg-green-50 text-green-700">
                              <FileCheck className="w-3 h-3 mr-1" />
                              Files
                            </div>
                          )}
                          
                          {/* Expand/collapse indicator */}
                          <ChevronRight className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 ml-1 ${
                            expandedRecords.has(record.id) ? 'rotate-90' : ''
                          }`} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded View */}
                  <AnimatePresence>
                    {expandedRecords.has(record.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CardContent className="border-t border-gray-100 pt-4">
                          {/* Record Content Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-5">
                              {/* Diagnosis Section */}
                              {record.diagnosis && (
                                <div className="bg-white border border-purple-100 rounded-lg p-4 shadow-sm">
                                  <div className="flex items-center mb-2 text-purple-700">
                                    <Stethoscope className="w-5 h-5 mr-2" />
                                    <h3 className="font-semibold text-lg">Diagnosis</h3>
                                  </div>
                                  <div className="pl-7">
                                    <p className="text-gray-800">{record.diagnosis}</p>
                                    {record.diagnosis_code && (
                                      <div className="mt-2 text-sm">
                                        <span className="font-medium text-purple-700">Code:</span> {record.diagnosis_code}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Consultation Notes */}
                              {record.postConsultationNotes && (
                                <div className="bg-white border border-blue-100 rounded-lg p-4 shadow-sm">
                                  <div className="flex items-center mb-2 text-blue-700">
                                    <ClipboardList className="w-5 h-5 mr-2" />
                                    <h3 className="font-semibold text-lg">Notes</h3>
                                  </div>
                                  <p className="text-gray-700 pl-7">{record.postConsultationNotes}</p>
                                </div>
                              )}

                              {/* Medications */}
                              {record.prescribedMedications && (
                                <div className="bg-white border border-emerald-100 rounded-lg p-4 shadow-sm">
                                  <div className="flex items-center mb-2 text-emerald-700">
                                    <Pill className="w-5 h-5 mr-2" />
                                    <h3 className="font-semibold text-lg">Medications</h3>
                                  </div>
                                  <p className="text-gray-700 pl-7">{record.prescribedMedications}</p>
                                </div>
                              )}

                              {/* Symptoms */}
                              {record.symptoms && Object.entries(record.symptoms).some(([_, value]) => value === true || value === "Yes") && (
                                <div className="bg-white border border-orange-100 rounded-lg p-4 shadow-sm">
                                  <div className="flex items-center mb-2 text-orange-700">
                                    <AlertCircle className="w-5 h-5 mr-2" />
                                    <h3 className="font-semibold text-lg">Symptoms</h3>
                                  </div>
                                  <div className="pl-7 grid grid-cols-2 gap-x-4 gap-y-1">
                                    {Object.entries(record.symptoms).map(([symptom, value], idx) => {
                                      // Only show symptoms with positive values
                                      if (value === "Yes" || value === true) {
                                        return (
                                          <div key={idx} className="flex items-center">
                                            <span className="h-2 w-2 bg-orange-500 rounded-full mr-2"></span>
                                            {symptom}
                                          </div>
                                        );
                                      }
                                      return null;
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Right Column */}
                            <div className="space-y-5">
                              {/* Treatment Plan */}
                              {record.treatmentPlan && (
                                <div className="bg-white border border-amber-100 rounded-lg p-4 shadow-sm">
                                  <div className="flex items-center mb-2 text-amber-700">
                                    <Heart className="w-5 h-5 mr-2" />
                                    <h3 className="font-semibold text-lg">Treatment Plan</h3>
                                  </div>
                                  <p className="text-gray-700 pl-7">{record.treatmentPlan}</p>
                                </div>
                              )}

                              {/* Follow-up Information */}
                              {record.requiresFollowup && (
                                <div className="bg-white border border-amber-100 rounded-lg p-4 shadow-sm">
                                  <div className="flex items-center mb-2 text-amber-700">
                                    <Calendar className="w-5 h-5 mr-2" />
                                    <h3 className="font-semibold text-lg">Follow-up</h3>
                                  </div>
                                  <div className="pl-7">
                                    {record.followupDate && (
                                      <p className="text-gray-700 mb-1">
                                        <span className="font-medium">Date:</span> {format(new Date(record.followupDate), "PPP")}
                                      </p>
                                    )}
                                    {record.followupNotes && (
                                      <p className="text-gray-700">
                                        <span className="font-medium">Notes:</span> {record.followupNotes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Vitals */}
                              {record.vitals && Object.values(record.vitals).some(value => value) && (
                                <div className="bg-white border border-indigo-100 rounded-lg p-4 shadow-sm">
                                  <div className="flex items-center mb-2 text-indigo-700">
                                    <Heart className="w-5 h-5 mr-2" />
                                    <h3 className="font-semibold text-lg">Vital Signs</h3>
                                  </div>
                                  <div className="pl-7 grid grid-cols-2 gap-2">
                                    {record.vitals.temperature && (
                                      <div>
                                        <span className="font-medium">Temperature:</span> {record.vitals.temperature}
                                      </div>
                                    )}
                                    {record.vitals.blood_pressure && (
                                      <div>
                                        <span className="font-medium">Blood Pressure:</span> {record.vitals.blood_pressure}
                                      </div>
                                    )}
                                    {record.vitals.oxygen_level && (
                                      <div>
                                        <span className="font-medium">Oxygen Level:</span> {record.vitals.oxygen_level}%
                                      </div>
                                    )}
                                    {record.vitals.cholesterol_level && (
                                      <div>
                                        <span className="font-medium">Cholesterol Level:</span> {record.vitals.cholesterol_level}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Physical Examination */}
                              {record.physical_examination && (
                                <div className="bg-white border border-teal-100 rounded-lg p-4 shadow-sm">
                                  <div className="flex items-center mb-2 text-teal-700">
                                    <Stethoscope className="w-5 h-5 mr-2" />
                                    <h3 className="font-semibold text-lg">Physical Examination</h3>
                                  </div>
                                  <p className="text-gray-700 pl-7">{record.physical_examination}</p>
                                </div>
                              )}

                              {/* Attachments */}
                              {record.has_attachments && (
                                <div className="bg-white border border-green-100 rounded-lg p-4 shadow-sm">
                                  <div className="flex items-center mb-2 text-green-700">
                                    <FileText className="w-5 h-5 mr-2" />
                                    <h3 className="font-semibold text-lg">Attachments</h3>
                                  </div>
                                  <div className="pl-7">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toast.success('Opening attachment...', {
                                          id: 'attachment-toast',
                                        });
                                        window.open(`/api/medical-records/${record.consultation_id}/attachments`, '_blank');
                                      }}
                                      className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2"
                                    >
                                      <FileText className="w-4 h-4" />
                                      View Attachments
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Metadata footer */}
                          <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 mt-5">
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
                              {record.consultation_id && (
                                <div>
                                  <span className="font-medium">Consultation ID:</span> {record.consultation_id}
                                </div>
                              )}
                              {record.room && (
                                <div>
                                  <span className="font-medium">Room:</span> {record.room}
                                </div>
                              )}
                              {record.timing?.completed_at && (
                                <div>
                                  <span className="font-medium">Completed:</span> {format(new Date(record.timing.completed_at), "PP p")}
                                </div>
                              )}
                              {record.consultation_duration && (
                                <div>
                                  <span className="font-medium">Duration:</span> {record.consultation_duration}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              ))}
            </div>
          ) : (
            // No results found
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
              <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No medical records found</p>
              <p className="text-gray-500">Try adjusting your filters or book a consultation to create your first medical record</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}