import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { API_URL } from '@/config/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, method, data, params } = body;
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        createErrorResponse('Not authenticated', 401),
        { status: 401 }
      );
    }
    
    let fullUrl = `${API_URL}${url}`;
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
      fullUrl += `?${queryParams.toString()}`;
    }
    
    const fetchOptions: RequestInit = {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: data ? JSON.stringify(data) : undefined
    };
    
    const response = await fetch(fullUrl, fetchOptions);
    
    // Handle non-JSON responses (like 204 No Content)
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }
    
    const responseData = await response.json();
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      createErrorResponse('Request failed'),
      { status: 500 }
    );
  }
}