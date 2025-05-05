import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { API_URL } from '@/config/constants';

/**
 * GET /api/audit-logs
 * Get all audit logs for the admin
 * Permission: IsHealthAdmin
 * Supports pagination, filtering, and search
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Pagination parameters
    const page = searchParams.get('page') || '1';
    const page_size = searchParams.get('page_size') || '25';
    
    // Filter parameters
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    const username = searchParams.get('username');
    const content = searchParams.get('content');
    const action = searchParams.get('action');
    const object_id = searchParams.get('object_id');
    const ip_address = searchParams.get('ip_address');
    // Custom filters
    const patient = searchParams.get('patient');
    const doctor = searchParams.get('doctor');
    // const search = searchParams.get('search'); // Disabled for now
    
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
    queryParams.append('page', page);
    queryParams.append('page_size', page_size);
    
    if (start_date) queryParams.append('start_date', start_date);
    if (end_date) queryParams.append('end_date', end_date);
    if (content) queryParams.append('content', content);
    if (action) queryParams.append('action', action);
    if (object_id) queryParams.append('object_id', object_id);
    if (ip_address) queryParams.append('ip_address', ip_address);
    
    // Filtering logic: patient > doctor > username > (search, but disabled)
    if (patient) {
      queryParams.append('patient', patient);
    } else if (doctor) {
      queryParams.append('doctor', doctor);
    } else if (username) {
      queryParams.append('username', username);
    }
    // else if (search) {
    //   // General search is currently disabled
    //   // queryParams.append('search', search);
    // }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    // Call the backend API to get audit logs
    const response = await fetch(`${API_URL}/api/audit-logs/${queryString}`, {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        createErrorResponse(data.detail || 'Failed to fetch audit logs', response.status),
        { status: response.status }
      );
    }
    
    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    console.error('Audit logs fetch error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to fetch audit logs'),
      { status: 500 }
    );
  }
}