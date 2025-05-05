import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { API_URL } from '@/config/constants';
import { validatePassword } from '@/lib/validation';

/**
 * POST /api/auth/reset-password/confirm/
 * Confirm password reset with code and set new password
 * Authentication: Not required
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.email || !body.reset_code || !body.password || !body.confirm_password) {
      return NextResponse.json(
        createErrorResponse('Missing required fields', 400),
        { status: 400 }
      );
    }

    // Validate that new password and confirm password match
    if (body.password !== body.confirm_password) {
      return NextResponse.json(
        createErrorResponse('New password and confirmation do not match', 400),
        { status: 400 }
      );
    }
    
    // Validate password strength
    const passwordValidation = validatePassword(body.password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        createErrorResponse(passwordValidation.errors.join(', '), 400),
        { status: 400 }
      );
    }
    
    const response = await fetch(`${API_URL}/api/auth/reset-password/confirm/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: body.email,
        reset_code: body.reset_code,
        password: body.password
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        createErrorResponse(data.detail || 'Failed to reset password', response.status),
        { status: response.status }
      );
    }
    
    return NextResponse.json(createSuccessResponse({
      message: 'Password reset successful'
    }));
  } catch (error) {
    console.error('Password reset confirmation error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to reset password'),
      { status: 500 }
    );
  }
}