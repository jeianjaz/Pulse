export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
};

export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data
  };
}

export function createErrorResponse(error: string, status = 500): ApiResponse {
  return {
    success: false,
    error,
    status
  };
}