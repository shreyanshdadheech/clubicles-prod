import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, generateToken } from '@/lib/auth'

export async function PUT(request: NextRequest) {
  try {
    // Get JWT token from cookies
    const token = request.cookies.get('auth_token')?.value
    
    console.log('Profile update API - Token present:', !!token)
    
    if (!token) {
      console.log('Profile update API - No token found')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify the token
    const decoded = await verifyToken(token)
    
    console.log('Profile update API - Token decoded:', !!decoded)
    console.log('Profile update API - Decoded user ID:', decoded?.id)
    
    if (!decoded) {
      console.log('Profile update API - Token verification failed')
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Get the request body
    const body = await request.json()
    const { full_name, phone, city, professional_role } = body

    console.log('Updating profile for user:', decoded.id, 'with data:', body)

    // Update the user profile in the database
    const updatedUser = await prisma.user.update({
      where: { id: decoded.id },
      data: {
        firstName: full_name?.split(' ')[0] || '',
        lastName: full_name?.split(' ').slice(1).join(' ') || '',
        phone: phone || '',
        city: city || '',
        professionalRole: professional_role || 'indigo',
      }
    })

    console.log('Profile updated successfully for user:', decoded.id)

    // Generate new token with updated user data
    const newToken = await generateToken({
      id: updatedUser.id,
      email: updatedUser.email,
      roles: updatedUser.roles,
      firstName: updatedUser.firstName || undefined,
      lastName: updatedUser.lastName || undefined,
      isActive: updatedUser.isActive,
      professionalRole: updatedUser.professionalRole || undefined
    })

    // Create response with new token cookie
    const response = NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        first_name: updatedUser.firstName,
        last_name: updatedUser.lastName,
        phone: updatedUser.phone,
        city: updatedUser.city,
        professional_role: updatedUser.professionalRole,
        roles: updatedUser.roles,
        is_active: updatedUser.isActive,
        created_at: updatedUser.createdAt,
        updated_at: updatedUser.updatedAt
      }
    })

    // Set the new token as HTTP-only cookie
    response.cookies.set('auth_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response

  } catch (error: any) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile', details: error.message },
      { status: 500 }
    )
  }
}
