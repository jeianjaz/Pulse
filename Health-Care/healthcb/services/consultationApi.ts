import api from '@/utils/axios';
import { ConsultationRequest, ConsultationRecord } from '@/types/schedule';

export type { ConsultationRequest };

export interface CreateConsultationRequest {
  patient_id: string;
  doctor_id: string;
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

export const consultationApi = {
  createRequest: async (data: {
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
  }) => {
    const requestData = {
      patient_id: data.patient,
      doctor_id: data.doctor,
      date: data.date,
      start_time: data.start_time,
      end_time: data.end_time,
      symptoms: data.symptoms,
      duration: data.duration,
      additional_notes: data.additional_notes,
      blood_pressure: data.blood_pressure,
      cholesterol: data.cholesterol,
      glucose: data.glucose,
    };

    const response = await api.post('/consultation-request/create_request/', requestData);
    return response.data;
  },
  
  getRequests: async (date?: Date, status?: string) => {
    try {
      const params: any = {};
      
      if (date) {
        const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        params.date = localDate.toISOString().split('T')[0];
      }
      if (status) {
        params.status = status;
      }
      
      const response = await api.get('/consultation-request/', { params });
      console.log('Consultation requests:', response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching consultation requests:', error);
      throw error;
    }
  },
  
  getUpcomingConsultation: async () => {
    try {
      const response = await api.get(`/consultation-record/scheduled_consultations/`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching upcoming consultation:', error);
      throw error;
    }
  },
  
  getBookedAppointments: async (params?: {
    date?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    try {
      const response = await api.get('/consultation-request/booked-appointments', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching booked appointments:', error);
      throw error;
    }
  },
  
  updateRequestStatus: async (id: string, status: 'approved' | 'rejected' | 'cancelled') => {
    try {
      const response = await api.patch(
        `/consultation-request/${id}/update_status/`,
        { status }
      );
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating consultation request status:', error);
      throw error;
    }
  },

  createConsultationRecord: async (scheduleId: string, retryCount = 0) => {
    const MAX_RETRIES = 2;
    
    if (retryCount >= MAX_RETRIES) {
      throw new Error('Max retries reached for creating consultation record');
    }

    try {
      const existingRecord = await consultationApi.getRecordByScheduleId(scheduleId, true);
      if (existingRecord) {
        return existingRecord;
      }

      const response = await api.post(
        '/consultation-record/create_record/',
        { schedule: scheduleId }
      );
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.errors?.consultation?.[0]?.includes('already exists')) {
        return consultationApi.getRecordByScheduleId(scheduleId, true);
      }
      console.error('API Error:', error.response?.data);
      throw error;
    }
  },

  getRecordByScheduleId: async (scheduleId: string, isRetry = false) => {
    try {
      const response = await api.get('/consultation-record/get_schedule_record/', {
        params: { schedule: scheduleId }
      });
      
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data);
      // Only retry create if explicitly a 404
      if (error.response?.status === 404 && !isRetry) {
        return consultationApi.createConsultationRecord(scheduleId, 0);
      }
      throw error;
    }
  },

  getRecordByRoomId: async (roomId: string, isRetry = false) => {
    try {
      const response = await api.get('/consultation-record/get_room_record/', {
        params: { room: roomId }
      });
      
      return response.data;
    } catch (error) {
      console.error('API Error when getting record by room ID:', error.response?.data || error.message);
      
      // If we get a server error and this is not a retry attempt
      if (error.response?.status === 500 && !isRetry) {
        console.log('Attempting fallback to direct consultation record endpoint');
        try {
          // Try to get the record directly if possible
          const fallbackResponse = await api.get(`/consultation-record/${roomId}/`);
          return fallbackResponse.data;
        } catch (fallbackError) {
          console.error('Fallback attempt failed:', fallbackError);
          throw error; // Throw the original error
        }
      }
      
      throw error;
    }
  },

  updateConsultationNotes: async (recordId: string, data: { consultation_notes: string }) => {
    const response = await api.patch(
      `/consultation-record/${recordId}/update_notes/`,
      data
    );
    return response.data;
  },

  completeConsultation: async (recordId: string, data: {
    diagnosis: string;
    prescribed_medications: string;
    treatment_plan: string;
    post_consultation_notes: string;
    requires_followup: boolean;
    followup_date?: string;
    followup_notes?: string;
  }) => {
    const response = await api.patch(
      `/consultation-record/${recordId}/complete_consultation/`,
      data
    );
    return response.data;
  },

  getConsultationNotes: async (recordId: string) => {
    const response = await api.get(`/consultation-record/${recordId}/`);
    return response.data.consultation_notes;
  },

  getPatientRequests: async (status?: string) => {
    try {
      const params: any = {};
      
      if (status && status !== 'all') {
        params.status = status;
      }
      
      const response = await api.get('/consultation-request/my_requests/', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching patient consultation requests:', error);
      throw error;
    }
  },
};

export default consultationApi;