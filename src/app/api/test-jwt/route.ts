import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No token found' });
    }
    
    console.log('🔍 Test JWT: Token found:', token.substring(0, 20) + '...');
    
    const secret = new TextEncoder().encode('your-super-secret-jwt-key-change-this-in-production');
    const { payload } = await jwtVerify(token, secret);
    
    console.log('🔍 Test JWT: Decoded payload:', payload);
    
    return NextResponse.json({ 
      success: true, 
      payload,
      token: token.substring(0, 20) + '...'
    });
    
  } catch (error: any) {
    console.error('🔍 Test JWT: Verification failed:', error);
    return NextResponse.json({ 
      error: 'JWT verification failed', 
      details: error.message 
    });
  }
}
