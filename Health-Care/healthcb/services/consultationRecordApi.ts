import api from '@/utils/axios';
import { PrescribedMedication, ConsultationRecordModel } from '@/types/api-models';

export const consultationRecordApi = {
  /**
   * Start a consultation and create/update the consultation record
   */
  startConsultation: async (consultationId: number) => {
    const response = await api.post(`/consultation-record/${consultationId}/start_consultation/`);
    return response.data;
  },
  
  /**
   * Update consultation notes during the session
   */
  updateConsultationNotes: async (recordId: number, notes: string) => {
    const response = await api.patch(`/consultation-record/${recordId}/update_notes/`, {
      consultation_notes: notes
    });
    return response.data;
  },
  
  /**
   * Complete a consultation with diagnosis, treatment plan, etc.
   */
  completeConsultation: async (recordId: number, data: {
    diagnosis: string;
    prescribed_medications: PrescribedMedication[];
    treatment_plan: string;
    post_consultation_notes?: string;
    requires_followup: boolean;
    followup_date?: string;
    followup_notes?: string;
  }) => {
    const response = await api.patch(`/consultation-record/${recordId}/complete_consultation/`, data);
    return response.data;
  },
  
  /**
   * Get doctor's active consultations
   */
  getDoctorActiveConsultations: async () => {
    const response = await api.get('/consultation-record/get_active_consultations/');
    return response.data;
  },
  
  /**
   * Get patient's consultation records
   * @param params Optional query parameters for filtering
   * - filter: Filter by 'recent', 'followup', or 'with_attachments'
   * - search: Search term to filter records
   * - date: Specific date to filter records (yyyy-MM-dd)
   * - start_date: Start date for date range filter (yyyy-MM-dd)
   * - end_date: End date for date range filter (yyyy-MM-dd)
   */
  getPatientConsultationRecords: async (params?: {
    filter?: 'recent' | 'followup' | 'with_attachments';
    search?: string;
    date?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    const response = await api.get('/consultation-record/get_patient_records/', {
      params
    });
    return response.data;
  },
  
  /**
   * Get a specific consultation record
   */
  getConsultationRecord: async (id: number) => {
    const response = await api.get(`/consultation-record/${id}/`);
    return response.data;
  },
  
  /**
   * Upload attachment to a consultation record
   */
  uploadAttachment: async (recordId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(
      `/consultation-record/${recordId}/upload_attachment/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }
    );
    
    return response.data;
  },
  
  /**
   * Get consultation record by room ID
   */
  getRecordByRoomId: async (roomId: string) => {
    try {
      const response = await api.get('/consultation-record/get_room_record/', {
        params: { room: roomId }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching record by room ID:', error);
      throw error;
    }
  }
};

export default consultationRecordApi;