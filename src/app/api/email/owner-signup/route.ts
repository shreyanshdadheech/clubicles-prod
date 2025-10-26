import { NextRequest, NextResponse } from 'next/server'
import { sendOwnerSignupNotification, OwnerSignupData } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      ownerName,
      ownerEmail,
      businessName,
      onboardingStatus = 'pending'
    } = body

    // Validate required fields
    if (!ownerName || !ownerEmail || !businessName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const emailData: OwnerSignupData = {
      ownerName,
      ownerEmail,
      businessName,
      onboardingStatus,
      adminEmail: process.env.ADMIN_EMAIL || 'admin@clubicles.com'
    }

    const result = await sendOwnerSignupNotification(emailData)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Owner signup notification email sent successfully',
        messageId: result.messageId
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Error sending owner signup email:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
