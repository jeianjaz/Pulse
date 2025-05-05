import api from '@/utils/axios';

export interface AuditLogEntry {
  id: number | string;  // Changed to accept string since API returns ID as string
  timestamp: string;
  user: number | string; // Changed to accept string
  user_display: string;
  username: string;
  action_type: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'login' | 'logout' | 'other';
  content_type: string;
  object_id: string;
  object_repr: string;
  action_data: any;
  ip_address: string;
  user_agent: string;
}

export interface AuditLogsPaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AuditLogEntry[];
}

export interface AuditLogsQueryParams {
  page?: number;
  page_size?: number;
  start_date?: string;
  end_date?: string;
  username?: string;
  content?: string;
  action?: string;
  object_id?: string;
  ip_address?: string;
  search?: string;
}

// Helper function to transform API response to match our expected format
const transformApiResponse = (apiResponse: any): AuditLogsPaginatedResponse => {
  // If the API response is already in the expected format, return it
  if (apiResponse && 'results' in apiResponse) {
    return apiResponse;
  }

  // If the API response is an array, transform it to our format
  const items = Array.isArray(apiResponse) ? apiResponse : [];
  
  // If response is in the format shown in the error example
  if (apiResponse && apiResponse.data && Array.isArray(apiResponse.data)) {
    const entries = apiResponse.data.map((item: any) => {
      if (item.attributes) {
        // Transform JSON:API format to flat format
        return {
          id: item.id,
          ...item.attributes,
          user: item.relationships?.user?.data?.id || null
        };
      }
      return item;
    });

    return {
      count: entries.length,
      next: null,
      previous: null,
      results: entries
    };
  }
  
  return {
    count: items.length,
    next: null,
    previous: null,
    results: items
  };
};

export const auditLogApi = {
  /**
   * Get audit logs with pagination and filtering
   */
  getAuditLogs: async (params: AuditLogsQueryParams = {}) => {
    try {
      const response = await api.get('/audit-logs', { params });
      
      // Get the response data
      const responseData = response.data;
      
      // Handle different response formats
      if (responseData.success && responseData.data) {
        // When API returns in the format { success: true, data: { data: [...] } }
        return transformApiResponse(responseData.data);
      } else {
        // For other response formats
        return transformApiResponse(responseData);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  },
};

export default auditLogApi;