import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByEmail, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.email || !body.password || !body.firstName) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, firstName' },
        { status: 400 }
      )
    }

    const { email, password, firstName, lastName, phone, city, professionalRole } = body

    console.log('Creating individual user account:', { 
      email, 
      firstName,
      lastName,
      professionalRole
    })

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Create user
    console.log('Creating user...')
    const user = await createUser({
      email,
      password,
      firstName,
      lastName,
      phone,
      city,
      professionalRole,
      roles: 'user'
    })

    console.log('✅ User created:', user.id)

    // Generate token
    const token = await generateToken({
      id: user.id,
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      roles: user.roles,
      isActive: user.isActive
    })

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles
        },
        token
      }
    }, { status: 201 })

    // Set the JWT token as an HTTP-only cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response

  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to create account', details: error.message },
      { status: 500 }
    )
  }
}
