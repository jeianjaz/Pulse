'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { CheckCircle, XCircle, Calendar, User, Clock, Search, Filter, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import consultationRequestApi from '@/services/consultationRequestApi';
import { ConsultationRequestModel } from '@/types/api-models';
import toast from 'react-hot-toast';

interface RequestDetailsModalProps {
  request: ConsultationRequestModel;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

const RequestDetailsModal = ({ request, onClose, onApprove, onReject }: RequestDetailsModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg p-6 w-full max-w-lg"
      >
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold">Consultation Request Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        
        <div className="mt-4 space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Appointment Details</span>
            </div>
            <div className="ml-7">
              <div>
                <span className="text-gray-600">Date: </span>
                <span className="font-medium">{format(new Date(), 'MMMM d, yyyy')}</span>
              </div>
              <div>
                <span className="text-gray-600">Time: </span>
                <span className="font-medium">10:00 AM - 11:00 AM</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-5 w-5 text-gray-600" />
              <span className="font-medium">Patient Information</span>
            </div>
            <div className="ml-7">
              <div>
                <span className="text-gray-600">Name: </span>
                <span className="font-medium">John Doe</span>
              </div>
              <div>
                <span className="text-gray-600">Email: </span>
                <span>patient@example.com</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Reason for Visit</h3>
            <p className="text-gray-700">{request.reason}</p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Symptoms</h3>
            <div className="flex flex-wrap gap-2">
              {request.symptoms.map((symptom, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {symptom}
                </span>
              ))}
            </div>
          </div>
          
          {request.additional_notes && (
            <div>
              <h3 className="font-medium mb-2">Additional Notes</h3>
              <p className="text-gray-700">{request.additional_notes}</p>
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button 
              onClick={onReject}
              className="px-4 py-2 flex items-center gap-2 border border-red-200 text-red-600 rounded hover:bg-red-50"
            >
              <XCircle className="h-4 w-4" /> 
              Reject Request
            </button>
            
            <button 
              onClick={onApprove}
              className="px-4 py-2 flex items-center gap-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4" /> 
              Approve Request
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function ConsultationRequestManager() {
  const [requests, setRequests] = useState<ConsultationRequestModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<ConsultationRequestModel | null>(null);
  
  useEffect(() => {
    fetchPendingRequests();
  }, []);
  
  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await consultationRequestApi.getDoctorPendingRequests();
      setRequests(response.data || []);
    } catch (error) {
      console.error('Failed to fetch consultation requests:', error);
      toast.error('Failed to load consultation requests');
    } finally {
      setLoading(false);
    }
  };
  
  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    try {
      await consultationRequestApi.updateRequestStatus(selectedRequest.id, 'approved');
      toast.success('Consultation request approved');
      setSelectedRequest(null);
      fetchPendingRequests(); // Refresh the list
    } catch (error) {
      console.error('Failed to approve consultation request:', error);
      toast.error('Failed to approve request');
    }
  };
  
  const handleReject = async () => {
    if (!selectedRequest) return;
    
    try {
      await consultationRequestApi.updateRequestStatus(selectedRequest.id, 'rejected');
      toast.success('Consultation request rejected');
      setSelectedRequest(null);
      fetchPendingRequests(); // Refresh the list
    } catch (error) {
      console.error('Failed to reject consultation request:', error);
      toast.error('Failed to reject request');
    }
  };
  
  const filteredRequests = requests.filter(request => {
    // Filter based on status
    if (statusFilter === 'pending' && request.status !== 'pending') {
      return false;
    }
    
    // Filter based on search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesReason = request.reason.toLowerCase().includes(query);
      const matchesSymptoms = request.symptoms.some(s => s.toLowerCase().includes(query));
      return matchesReason || matchesSymptoms;
    }
    
    return true;
  });
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Consultation Requests</h2>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by reason or symptoms"
            className="pl-10 w-full border rounded-lg py-2 px-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 h-5 w-5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending')}
            className="border rounded-lg py-2 px-4"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending Only</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-24"></div>
          ))}
        </div>
      ) : filteredRequests.length > 0 ? (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div 
              key={request.id} 
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setSelectedRequest(request)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{request.reason}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="inline-flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(), 'MMM d, yyyy')} • 
                    </span>
                    <span className="inline-flex items-center ml-2">
                      <Clock className="h-4 w-4 mr-1" />
                      10:00 AM
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {request.symptoms.slice(0, 3).map((symptom, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs"
                      >
                        {symptom}
                      </span>
                    ))}
                    {request.symptoms.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs">
                        +{request.symptoms.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  request.status === 'approved' ? 'bg-green-100 text-green-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {request.status}
                </span>
              </div>
              
              <div className="flex justify-end mt-4">
                <button 
                  className="px-3 py-1 flex items-center gap-1 text-sm border border-gray-200 rounded hover:bg-gray-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRequest(request);
                  }}
                >
                  <FileText className="h-4 w-4" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <FileText className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-2 text-gray-500">No consultation requests found</p>
          {searchQuery && (
            <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
          )}
        </div>
      )}
      
      <AnimatePresence>
        {selectedRequest && (
          <RequestDetailsModal
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      </AnimatePresence>
    </div>
  );
}