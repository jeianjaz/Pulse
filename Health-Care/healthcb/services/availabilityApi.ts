import api from '@/utils/axios';
import { DoctorAvailability, RecurringAvailabilityRequest, BlockTimeRequest, ApiResponse } from '@/types/api-models';

export const availabilityApi = {
  /**
   * Create a single availability slot for a doctor
   */
  createAvailabilitySlot: async (data: {
    date: string;
    start_time: string;
    end_time: string;
  }) => {
    const response = await api.post('/availability/', data);
    return response.data;
  },

  /**
   * Create recurring availability slots for a doctor
   */
  createRecurringAvailability: async (data: RecurringAvailabilityRequest) => {
    const response = await api.post('/availability/add_recurring_availability/', data);
    return response.data;
  },

  /**
   * Get doctor's own availability slots
   */
  getDoctorAvailability: async (params?: {
    start_date?: string;
    end_date?: string;
  }) => {
    const response = await api.get('/availability/my_availability/', { params });
    return response.data;
  },

  /**
   * Block a time period for a doctor
   */
  blockTime: async (data: BlockTimeRequest) => {
    const response = await api.post('/availability/block_time/', data);
    return response.data;
  },

  /**
   * Get available slots for patients to book
   */
  getAvailableSlots: async (params?: {
    date?: string;
    specialty?: string;
    doctor_id?: number;
  }) => {
    const response = await api.get('/availability/available_slots/', { params });
    return response.data;
  },
  
  /**
   * Delete an availability slot
   */
  deleteAvailabilitySlot: async (id: number) => {
    const response = await api.delete(`/availability/${id}/`);
    return response.status === 204;
  },
};

export default availabilityApi;