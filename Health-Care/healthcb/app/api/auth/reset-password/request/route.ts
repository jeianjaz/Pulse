import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { API_URL } from '@/config/constants';

/**
 * POST /api/auth/reset-password/request/
 * Request a password reset code
 * Authentication: Not required
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate email is provided
    if (!body.email) {
      return NextResponse.json(
        createErrorResponse('Email is required', 400),
        { status: 400 }
      );
    }
    
    const response = await fetch(`${API_URL}/api/auth/reset-password/request/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    // For security reasons, always return a success message
    // whether the email exists or not
    return NextResponse.json(
      createSuccessResponse({ message: 'Password reset code sent to your email' })
    );
  } catch (error) {
    console.error('Password reset request error:', error);
    
    // Still return success for security reasons
    return NextResponse.json(
      createSuccessResponse({ message: 'Password reset code sent to your email' })
    );
  }
}