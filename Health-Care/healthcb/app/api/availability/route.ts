import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { API_URL } from '@/config/constants';

/**
 * GET /api/availability
 * List availability slots
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    const specialty = searchParams.get('specialty');
    const doctor_id = searchParams.get('doctor_id');
    
    // For patient or general view - show available slots
    let endpoint = '/api/availability/available_slots/';
    
    // For doctor - show their own slots
    if (request.headers.get('X-User-Role') === 'doctor') {
      endpoint = '/api/availability/my_availability/';
    }
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        createErrorResponse('Not authenticated', 401),
        { status: 401 }
      );
    }
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (start_date) queryParams.append('start_date', start_date);
    if (end_date) queryParams.append('end_date', end_date);
    if (specialty) queryParams.append('specialty', specialty);
    if (doctor_id) queryParams.append('doctor_id', doctor_id);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    const response = await fetch(`${API_URL}${endpoint}${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        createErrorResponse(data.detail || 'Failed to fetch availability', response.status),
        { status: response.status }
      );
    }
    
    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    console.error('Availability fetch error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to fetch availability'),
      { status: 500 }
    );
  }
}

/**
 * POST /api/availability
 * Create new availability slot
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        createErrorResponse('Not authenticated', 401),
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    const response = await fetch(`${API_URL}/api/availability/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        createErrorResponse(data.detail || 'Failed to create availability', response.status),
        { status: response.status }
      );
    }
    
    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    console.error('Availability creation error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to create availability'),
      { status: 500 }
    );
  }
}