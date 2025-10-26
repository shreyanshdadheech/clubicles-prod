import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password' },
        { status: 400 }
      )
    }

    const { email, password, professionalRole } = body

    console.log('Signing in user:', { email, professionalRole })

    // Get user from database
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated. Please contact support.' },
        { status: 401 }
      )
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email address before signing in.' },
        { status: 401 }
      )
    }

    console.log('✅ User authenticated:', user.id)

    // Update professional role if provided
    if (professionalRole) {
      try {
        const { PrismaClient } = require('@prisma/client')
        const prisma = new PrismaClient()
        
        await prisma.user.update({
          where: { id: user.id },
          data: { professionalRole: professionalRole }
        })
        
        console.log('✅ Updated professional role for user:', user.id, 'to:', professionalRole)
        await prisma.$disconnect()
      } catch (updateError) {
        console.error('❌ Failed to update professional role:', updateError)
        // Don't fail the login for this, just log the error
      }
    }

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
      message: 'Sign in successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles,
          isEmailVerified: user.isEmailVerified,
          spaceOwner: user.spaceOwner
        },
        token
      }
    })

    // Set the JWT token as an HTTP-only cookie (never expires)
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
      // Remove maxAge to make cookie never expire
    })

    return response

  } catch (error: any) {
    console.error('Sign in error:', error)
    return NextResponse.json(
      { error: 'Failed to sign in', details: error.message },
      { status: 500 }
    )
  }
}
