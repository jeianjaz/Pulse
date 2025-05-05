import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { API_URL } from '@/config/constants';

/**
 * GET /api/consultation-request/
 * Get consultation requests - different behavior based on user role
 * - Patients see their own requests
 * - Doctors see requests made to them
 * - Admins can see all requests
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        createErrorResponse('Not authenticated', 401),
        { status: 401 }
      );
    }
    
    // Build the query parameters
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    if (date) queryParams.append('date', date);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    const response = await fetch(`${API_URL}/api/consultation-request/${queryString}`, {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        createErrorResponse(data.detail || 'Failed to fetch consultation requests', response.status),
        { status: response.status }
      );
    }
    
    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    console.error('Consultation request fetch error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to fetch consultation requests'),
      { status: 500 }
    );
  }
}