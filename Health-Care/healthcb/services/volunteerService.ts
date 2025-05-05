import api from '@/utils/axios';

export const registerVolunteer = async (formData: any) => {
  try {
    const response = await api.post('/volunteers/register/', formData);
    return response.data;
  } catch (error) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to register');
    }
    throw error;
  }
};