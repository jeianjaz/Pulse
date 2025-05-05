import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { API_URL } from '@/config/constants';

/**
 * GET /api/medical-records
 * Get all medical records for the authenticated patient
 * This is a wrapper around consultation-record/get_patient_records
 * with additional filtering and search capabilities
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter');
    const search = searchParams.get('search');
    const date = searchParams.get('date');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    
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
    if (filter) queryParams.append('filter', filter);
    if (search) queryParams.append('search', search);
    if (date) queryParams.append('date', date);
    if (start_date) queryParams.append('start_date', start_date);
    if (end_date) queryParams.append('end_date', end_date);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    // Call the base endpoint to get all patient records
    const response = await fetch(`${API_URL}/api/consultation-record/get_patient_records/${queryString}`, {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        createErrorResponse(data.detail || 'Failed to fetch patient medical records', response.status),
        { status: response.status }
      );
    }
    
    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    console.error('Medical records fetch error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to fetch medical records'),
      { status: 500 }
    );
  }
}