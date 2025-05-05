import api from '@/utils/axios';
import { ConsultationRequestModel } from '@/types/api-models';

// Update the payload type to match the new structure
export type CreateConsultationRequestPayload = {
  availability_id: number;
  reason: string;
  symptoms: Record<string, boolean>;
  patient_metrics: {
    "Blood Pressure": string;
    "Cholesterol Level": string;
  };
  additional_notes: string;
};

export const consultationRequestApi = {
  /**
   * Create a consultation request
   */
  createRequest: async (data: CreateConsultationRequestPayload) => {
    const response = await api.post('/consultation-request/create/', data);
    return response.data;
  },

  /**
   * Get patient's consultation requests
   */
  getPatientRequests: async (params?: { 
    status?: 'pending' | 'approved' | 'rejected' 
  }) => {
    const response = await api.get('/consultation-request/my-requests/', { params });
    return response.data;
  },
  
  /**
   * Get doctor's pending consultation requests
   */
  getDoctorPendingRequests: async () => {
    const response = await api.get('/consultation-request/pending_requests/');
    return response.data;
  },
  
  /**
   * Update a consultation request status
   */
  updateRequestStatus: async (id: number, status: 'approved' | 'rejected') => {
    const response = await api.patch(`/consultation-request/${id}/update_status/`, { status });
    return response.data;
  },
  
  /**
   * Get patient's upcoming consultation
   */
  getUpcomingConsultation: async () => {
    try {
      const response = await api.get('/consultation-request/upcoming/');
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming consultation:', error);
      return null;
    }
  },
  
  /**
   * Get consultation request by ID
   */
  getRequestById: async (id: number) => {
    const response = await api.get(`/consultation-request/${id}/`);
    return response.data;
  },
};

export default consultationRequestApi;