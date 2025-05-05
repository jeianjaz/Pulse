import api from '@/utils/axios';

export const scheduleApi = {
  addTimeSlot: async (data: {
    date: string;
    startTime: string;
    endTime: string;
    recurring: boolean;
    days?: string[];
  }) => {
    const formattedData = {
      date: data.date,
      start_time: data.startTime,
      end_time: data.endTime,
      recurring: data.recurring,
      recurring_days: data.days
    };
    
    const response = await api.post('/schedule/add_time_slot/', formattedData);
    return response.data;
  },

  blockTime: async (data: {
    startDate: string;
    endDate: string;
    reason: string;
  }) => {
    const formattedData = {
      start_date: data.startDate,
      end_date: data.endDate,
      reason: data.reason
    };
    
    const response = await api.post('/schedule/block_time/', formattedData);
    return response.data;
  },

  deleteTimeSlot: async (slotId: string) => {
    const response = await api.delete(`/schedule/${slotId}/`);
    if (response.status !== 204) {
      throw new Error('Failed to delete time slot');
    }
  },

  getSchedules: async () => {
    const response = await api.get('/schedule/');
    return response.data.data;
  },

  getAvailableSlots: async (date: Date) => {
    const formattedDate = date.toLocaleDateString('en-CA');
    const response = await api.get(`/schedule/available_slots/?date=${formattedDate}`);
    return response.data;
  },

  getBookedSchedules: async () => {
    const response = await api.get('/schedule/booked_schedules/');
    console.log(response.data.data);
    return response.data.data;
  },

  getPatientBookedSchedules: async () => {
    const response = await api.get('/schedule/patient_booked_schedules/');
    return response.data.data;
  },
};