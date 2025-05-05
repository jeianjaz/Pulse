import api from '@/utils/axios';
import { ConsultationDetail } from '@/types/schedule';

export interface CreateConsultationParams {
  patient: string;
  doctor: string;
  date: string;
  start_time: string;
  end_time: string;
  symptoms: string;
  duration: string;
  additional_notes: string;
  blood_pressure?: string;
  cholesterol?: string;
  glucose?: string;
}

export interface CompleteConsultationParams {
  diagnosis: string;
  prescribed_medications: string;
  treatment_plan: string;
  post_consultation_notes: string;
  requires_followup: boolean;
  followup_date?: string;
  followup_notes?: string;
}

export const consultationsApi = {
  /**
   * Get all consultations (filtered by user role)
   * - Patients see their own consultations
   * - Doctors see consultations assigned to them
   * - Admins can see all consultations
   */
  getConsultations: async (params?: {
    status?: string;
    date?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    try {
      const response = await api.get('/consultations', { params });
      console.log("Raw API response:", response.data);
      return response.data; // Return the whole response object, not just data.data
    } catch (error) {
      console.error('Error fetching consultations:', error);
      throw error;
    }
  },
  
  /**
   * Create a new consultation
   */
  createConsultation: async (data: CreateConsultationParams) => {
    try {
      const response = await api.post('/consultations', data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating consultation:', error);
      throw error;
    }
  },
  
  /**
   * Get detailed view of a specific consultation
   */
  getConsultation: async (id: string) => {
    try {
      const response = await api.get(`/consultations/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching consultation ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Update a consultation
   */
  updateConsultation: async (id: string, data: Partial<ConsultationDetail>) => {
    try {
      const response = await api.patch(`/consultations/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating consultation ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a consultation
   */
  deleteConsultation: async (id: string) => {
    try {
      const response = await api.delete(`/consultations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting consultation ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Get upcoming consultations
   * Returns: Consultations with status 'scheduled' and future dates
   */
  getUpcomingConsultations: async () => {
    try {
      const response = await api.get('/consultations/upcoming/');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching upcoming consultations:', error);
      throw error;
    }
  },
  
  /**
   * Get doctor's booked appointments
   * Permission: IsDoctor
   * Filters available: status, date, date range
   * Returns: Appointments with status 'scheduled' or 'in_progress'
   */
  getBookedAppointments: async (params?: {
    date?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    try {
      // Create a new params object to avoid modifying the input params
      const queryParams = { ...params };
      
      // Don't send status parameter when it's 'all'
      if (queryParams.status === 'all') {
        delete queryParams.status;
      }
      
      const response = await api.get('/consultations', { params: queryParams });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching booked appointments:', error);
      throw error;
    }
  },
  
  /**
   * Get patient's consultations
   * Permission: IsPatient
   * Returns: All consultations for the current patient
   */
  getMyConsultations: async (status?: string) => {
    try {
      const params: any = {};
      
      if (status && status !== 'all') {
        params.status = status;
      }
      
      const response = await api.get('/consultations/my_consultations/', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching patient consultations:', error);
      throw error;
    }
  },
  
  /**
   * Start a consultation
   * Permission: IsAdminOrDoctor
   * Updates status from 'scheduled' to 'in_progress'
   * Creates associated consultation record
   */
  startConsultation: async (id: string) => {
    try {
      const response = await api.post(`/consultations/${id}/start_consultation/`, {});
      return response.data.data;
    } catch (error) {
      console.error(`Error starting consultation ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Complete a consultation
   * Permission: IsAdminOrDoctor
   * Updates status from 'in_progress' to 'completed'
   * Allows adding diagnosis, medications, treatment plan, etc.
   */
  completeConsultation: async (id: string, data: CompleteConsultationParams) => {
    try {
      const response = await api.post(`/consultations/${id}/complete_consultation/`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Error completing consultation ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Cancel a consultation
   * Permission: IsAuthenticated (with role-based checks)
   * Makes availability slot available again
   * Updates consultation request status
   */
  cancelConsultation: async (id: string, reason?: string) => {
    try {
      const response = await api.post(`/consultations/${id}/cancel_consultation/`, { reason });
      return response.data.data;
    } catch (error) {
      console.error(`Error cancelling consultation ${id}:`, error);
      throw error;
    }
  },
};

export default consultationsApi;