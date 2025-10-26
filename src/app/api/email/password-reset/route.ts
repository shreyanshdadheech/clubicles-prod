import { NextRequest, NextResponse } from 'next/server'
import { sendPasswordReset, PasswordResetData } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, userType = 'user' } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    let user = null
    if (userType === 'owner') {
      user = await prisma.spaceOwner.findFirst({
        where: { email },
        include: { user: true }
      })
    } else if (userType === 'admin') {
      // For admin, we'll need to check if there's an admin table or use a different approach
      // For now, let's assume admin users are in the users table with a specific role
      user = await prisma.user.findFirst({
        where: { 
          email,
          roles: 'admin'
        }
      })
    } else {
      user = await prisma.user.findFirst({
        where: { email }
      })
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Store reset token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry: resetExpiry
      }
    })

    // Create reset URL
    const appUrl = process.env.APP_URL || 'http://localhost:3000'
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}&type=${userType}`

    const emailData: PasswordResetData = {
      userName: user.firstName || user.email,
      userEmail: user.email,
      resetToken,
      resetUrl
    }

    const result = await sendPasswordReset(emailData)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Password reset email sent successfully',
        messageId: result.messageId
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Error sending password reset email:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
