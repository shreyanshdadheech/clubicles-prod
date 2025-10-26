import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, createOtpEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, userType = 'user' } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser && existingUser.isEmailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    // Create or update user with OTP
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        emailOtp: otp,
        emailOtpExpiry: otpExpiry,
        isEmailVerified: false
      },
      create: {
        email,
        password: '', // Will be set during verification
        isEmailVerified: false,
        emailOtp: otp,
        emailOtpExpiry: otpExpiry
      }
    })

    // Send OTP email
    try {
      const emailTemplate = createOtpEmail(otp, userType)
      await sendEmail({
        to: email,
        subject: emailTemplate.subject,
        html: emailTemplate.html
      })

      console.log(`✅ OTP sent to ${email}`)
    } catch (emailError) {
      console.error('❌ Failed to send OTP email:', emailError)
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      email: email
    })

  } catch (error) {
    console.error('❌ Send OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
