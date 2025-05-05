import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { API_URL } from '@/config/constants';

/**
 * GET /api/medical-records/detail
 * Get detailed information for a specific consultation record
 * Required query parameter: room (the room ID of the consultation)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('room');
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        createErrorResponse('Not authenticated', 401),
        { status: 401 }
      );
    }
    
    if (!roomId) {
      return NextResponse.json(
        createErrorResponse('Room ID is required', 400),
        { status: 400 }
      );
    }
    
    const response = await fetch(`${API_URL}/api/consultation-record/get_room_record/?room=${roomId}`, {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        createErrorResponse(data.detail || 'Failed to fetch record details', response.status),
        { status: response.status }
      );
    }
    
    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    console.error('Record details fetch error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to fetch record details'),
      { status: 500 }
    );
  }
}