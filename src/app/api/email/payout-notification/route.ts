import { NextRequest, NextResponse } from 'next/server'
import { sendPayoutNotification, PayoutNotificationData } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      ownerName,
      ownerEmail,
      payoutAmount,
      payoutMethod,
      transactionId,
      notes
    } = body

    // Validate required fields
    if (!ownerName || !ownerEmail || !payoutAmount || !payoutMethod || !transactionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const emailData: PayoutNotificationData = {
      ownerName,
      ownerEmail,
      payoutAmount: parseFloat(payoutAmount),
      payoutMethod,
      transactionId,
      adminEmail: process.env.ADMIN_EMAIL || 'admin@clubicles.com',
      notes
    }

    const result = await sendPayoutNotification(emailData)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Payout notification email sent successfully',
        messageId: result.messageId
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Error sending payout notification email:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
