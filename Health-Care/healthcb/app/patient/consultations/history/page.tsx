"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format, addDays } from "date-fns";
import { 
  Calendar, 
  ClipboardList, 
  Stethoscope, 
  Pill, 
  Heart, 
  Search, 
  Filter,
  X,
  ChevronDown
} from "lucide-react";
import { consultationsApi } from "@/services/consultationsApi";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

interface ConsultationHistory {
  id: string;
  date: string;
  doctorName: string;
  status: string;
  reason: string;
  symptoms: Record<string, any>;
  predictedDisease?: string;
  probability?: number;
  significantProbabilities?: Record<string, number>;
  // Doctor's diagnosis fields
  diagnosis?: string;
  prescribedMedications?: string;
  treatmentPlan?: string;
}

type StatusFilterType = 'all' | 'completed' | 'no_show' | 'cancelled';

export default function ConsultationHistory() {
  const [history, setHistory] = useState<ConsultationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: '',
    end: ''
  });

  useEffect(() => {
    fetchConsultationHistory();
  }, [statusFilter, selectedDate, dateRange]);

  // When search term changes, debounce the api call
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchConsultationHistory();
    }, 500);
    
    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const fetchConsultationHistory = async () => {
    try {
      setIsLoading(true);
      
      // Build params for API call
      const params: any = {};
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
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
      
      // Call the API to get real consultation history data
      const responseData = await consultationsApi.getMyConsultations(params.status);
      
      // Handle the proper data structure - the API returns { data: [...] }
      const consultationsData = responseData.data || responseData;
      
      if (!consultationsData || !Array.isArray(consultationsData)) {
        toast.error('Received invalid data format from API');
        setHistory([]);
        return;
      }
      
      // Transform API data to match our ConsultationHistory interface
      const transformedData: ConsultationHistory[] = consultationsData.map(cons => {
        // Access data through the attributes property for newer API structure
        const attributes = cons.attributes || {};
        
        // Extract doctor name
        let doctorName = 'Unknown Doctor';
        if (attributes.doctor?.first_name && attributes.doctor?.last_name) {
          doctorName = `Dr. ${attributes.doctor.first_name} ${attributes.doctor.last_name}`;
        }
        
        // Get the health prediction data
        const healthPrediction = attributes.health_prediction || {};
        
        // Get the medical record data (diagnosis, prescribed medications, treatment)
        const medicalData = attributes.medical_data || {};
        const treatmentData = attributes.treatment || {};
        
        return {
          id: cons.id || '',
          date: attributes.date || new Date().toISOString(),
          doctorName: doctorName,
          status: attributes.status?.toLowerCase() || 'unknown',
          reason: attributes.request?.reason || '',
          symptoms: attributes.request?.symptoms || {},
          predictedDisease: healthPrediction.predicted_disease || '',
          probability: healthPrediction.probability ? (healthPrediction.probability * 100).toFixed(2) : undefined,
          significantProbabilities: healthPrediction.significant_probabilities || {},
          // Include doctor's diagnosis information
          diagnosis: medicalData.diagnosis || '',
          prescribedMedications: treatmentData.prescribed_medications || '',
          treatmentPlan: treatmentData.treatment_plan || ''
        };
      });
      
      console.log('Transformed data:', transformedData);
      setHistory(transformedData);
    } catch (error) {
      console.error('Error fetching consultation history:', error);
      toast.error('Failed to load consultation history');
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setSearchTerm('');
    setSelectedDate(null);
    setDateRange({ start: '', end: '' });
  };
  
  const toggleDateFilter = () => {
    setShowDateFilter(!showDateFilter);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'no_show':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Consultation History
            </h1>
            <p className="text-gray-600 text-lg">
              View your past consultations and medical records
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
                <label className="block text-sm text-gray-600 mb-1">Status</label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilterType)}
                    className="w-full p-2 border border-gray-300 rounded-md appearance-none pr-10"
                  >
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="no_show">No Show</option>
                    <option value="cancelled">Cancelled</option>
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
            {(statusFilter !== 'all' || searchTerm || selectedDate || (dateRange.start && dateRange.end)) && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {statusFilter !== 'all' && (
                    <div className={`flex items-center gap-1 px-2 py-1 text-sm rounded-md ${getStatusColor(statusFilter)}`}>
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

      {/* Content Section */}
      <div className="container mx-auto px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            // Loading Skeletons
            <div className="space-y-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 w-1/3 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 w-1/4 rounded mb-6"></div>
                  <div className="space-y-4">
                    <div className="h-20 bg-gray-100 rounded"></div>
                    <div className="h-20 bg-gray-100 rounded"></div>
                    <div className="h-20 bg-gray-100 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-8">
              {history.map((consultation) => (
                <Card key={consultation.id} className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  {/* Card Header */}
                  <CardHeader className={`border-b px-6 py-5 ${
                    consultation.status === 'completed' ? 'bg-blue-50 border-blue-100' :
                    consultation.status === 'no_show' ? 'bg-yellow-50 border-yellow-100' :
                    'bg-red-50 border-red-100'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className={`text-xl font-semibold ${
                          consultation.status === 'completed' ? 'text-blue-900' :
                          consultation.status === 'no_show' ? 'text-yellow-900' :
                          'text-red-900'
                        }`}>
                          {consultation.doctorName}
                        </CardTitle>
                        <CardDescription className="flex items-center text-gray-700">
                          <Calendar className="w-4 h-4 mr-2" />
                          {format(new Date(consultation.date), "PPPP")}
                        </CardDescription>
                        {consultation.reason && (
                          <CardDescription className="flex items-center text-gray-700 mt-2">
                            <span className="font-medium mr-2">Reason:</span> {consultation.reason}
                          </CardDescription>
                        )}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(consultation.status)}`}>
                        {consultation.status.replace('_', ' ').charAt(0).toUpperCase() + consultation.status.replace('_', ' ').slice(1)}
                      </div>
                    </div>
                  </CardHeader>

                  {/* Card Content - Only show if completed */}
                  {consultation.status === 'completed' && (
                    <CardContent className="p-6 grid gap-6">
                      {/* Reported Symptoms */}
                      {consultation.symptoms && Object.keys(consultation.symptoms).length > 0 && (
                        <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                          <div className="flex items-center mb-3 text-indigo-700">
                            <ClipboardList className="w-5 h-5 mr-2" />
                            <h3 className="font-semibold text-lg">Reported Symptoms</h3>
                          </div>
                          <div className="ml-7 grid grid-cols-2 md:grid-cols-3 gap-2">
                            {Object.entries(consultation.symptoms)
                              .filter(([_, value]) => value === true || value === "Yes")
                              .map(([symptom]) => (
                                <div key={symptom} className="flex items-center">
                                  <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></div>
                                  <span className="text-gray-700">{symptom}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Doctor's Diagnosis */}
                      {consultation.diagnosis && (
                        <div className="bg-white border border-purple-100 rounded-lg p-4 shadow-sm">
                          <div className="flex items-center mb-3 text-purple-700">
                            <Stethoscope className="w-5 h-5 mr-2" />
                            <h3 className="font-semibold text-lg">Doctor's Diagnosis</h3>
                          </div>
                          
                          <p className="text-gray-700 ml-7 mb-3">
                            <span className="font-medium">Diagnosis:</span> {consultation.diagnosis}
                          </p>
                          
                          {consultation.prescribedMedications && (
                            <div className="ml-7 mt-4">
                              <span className="font-medium block mb-2">Prescribed Medications:</span>
                              <div className="bg-gray-50 px-3 py-2 rounded">
                                <p className="text-gray-700 whitespace-pre-line">{consultation.prescribedMedications}</p>
                              </div>
                            </div>
                          )}

                          {consultation.treatmentPlan && (
                            <div className="ml-7 mt-4">
                              <span className="font-medium block mb-2">Treatment Plan:</span>
                              <div className="bg-gray-50 px-3 py-2 rounded">
                                <p className="text-gray-700 whitespace-pre-line">{consultation.treatmentPlan}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  )}

                  {/* Alternative content for no-show or cancelled */}
                  {(consultation.status === 'no_show' || consultation.status === 'cancelled') && (
                    <CardContent className="p-6">
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-gray-700">
                          {consultation.status === 'no_show' 
                            ? 'You did not attend this scheduled appointment.' 
                            : 'This appointment was cancelled.'}
                        </p>
                        <button className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors">
                          Reschedule Consultation
                        </button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            // No results found
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
              <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No consultation history found</p>
              <p className="text-gray-500">Try adjusting your filters or schedule a new consultation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
