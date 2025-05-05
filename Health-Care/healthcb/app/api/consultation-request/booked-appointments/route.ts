import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { API_URL } from '@/config/constants';

/**
 * GET /api/consultation-request/booked-appointments
 * Get all booked appointments for the authenticated doctor
 * Returns consultations where:
 * - User is the doctor
 * - Default filter is status="scheduled" or status="in_progress"
 * - Sorted by date and start_time
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    
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
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);
    
    // Default to showing 'scheduled' and 'in_progress' if no status is specified
    if (!status) {
      queryParams.append('status', 'scheduled,in_progress');
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    // Remove the trailing slash in the URL to match our frontend call
    const response = await fetch(`${API_URL}/api/consultation-request/booked-appointments${queryString}`, {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        createErrorResponse(data.detail || 'Failed to fetch booked appointments', response.status),
        { status: response.status }
      );
    }
    
    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    console.error('Booked appointments fetch error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to fetch booked appointments'),
      { status: 500 }
    );
  }
}