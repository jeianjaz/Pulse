import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { API_URL } from '@/config/constants';

/**
 * GET /api/audit-logs/action_types
 * Proxies to backend to get all unique action types
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
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

    // Build query string for date range
    const queryParams = new URLSearchParams();
    if (start_date) queryParams.append('start_date', start_date);
    if (end_date) queryParams.append('end_date', end_date);
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    // Proxy to backend endpoint
    const response = await fetch(`${API_URL}/api/audit-logs/action_types/${queryString}`, {
      headers: { 'Authorization': `Token ${token}` }
    });
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        createErrorResponse(data.detail || 'Failed to fetch action types', response.status),
        { status: response.status }
      );
    }
    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    console.error('Audit log action_types fetch error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to fetch action types'),
      { status: 500 }
    );
  }
}
