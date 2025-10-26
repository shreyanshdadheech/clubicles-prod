import { NextRequest, NextResponse } from 'next/server'
import { sendBookingConfirmation, BookingConfirmationData } from '@/lib/email'
import QRCode from 'qrcode'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userName,
      userEmail,
      spaceName,
      spaceAddress,
      bookingDate,
      startTime,
      endTime,
      duration,
      totalAmount,
      redemptionCode,
      spaceOwnerName,
      spaceOwnerEmail
    } = body

    // Validate required fields
    if (!userName || !userEmail || !spaceName || !redemptionCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate QR code
    let qrCodeData = ''
    try {
      qrCodeData = await QRCode.toDataURL(redemptionCode, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      // Remove data URL prefix to get base64 data
      qrCodeData = qrCodeData.split(',')[1]
    } catch (error) {
      console.error('Error generating QR code:', error)
      // Continue without QR code if generation fails
    }

    const emailData: BookingConfirmationData = {
      userName,
      userEmail,
      spaceName,
      spaceAddress: spaceAddress || 'Address not provided',
      bookingDate: bookingDate || new Date().toLocaleDateString(),
      startTime: startTime || 'Not specified',
      endTime: endTime || 'Not specified',
      duration: duration || 'Not specified',
      totalAmount: totalAmount || 0,
      redemptionCode,
      qrCodeData,
      spaceOwnerName: spaceOwnerName || 'Space Owner',
      spaceOwnerEmail: spaceOwnerEmail || ''
    }

    const result = await sendBookingConfirmation(emailData)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Booking confirmation email sent successfully',
        messageId: result.messageId
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Error sending booking confirmation email:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
