import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from cookies
    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify the token
    const decoded = await verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    console.log('✅ Authenticated user:', decoded.id)

    // Get user's booking payments from database
    const bookingPayments = await prisma.bookingPayment.findMany({
      where: {
        booking: {
          userId: decoded.id
        }
      },
      include: {
        booking: {
          include: {
            space: {
              select: {
                name: true,
                address: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    })

    // Transform to the expected format
    const payments = bookingPayments.map(payment => {
      const amountAsNumber = Number(payment.amount)
      
      // All amounts in database are in rupees, send as-is to frontend
      return {
        id: payment.id,
        amount: amountAsNumber, // Amount in rupees for direct display
        currency: payment.currency,
        status: payment.status,
        created_at: payment.createdAt.toISOString(),
        description: `Space booking - ${payment.booking.space.name}`,
        booking_id: payment.bookingId,
        payment_method: payment.razorpayPaymentId ? 'razorpay' : 'online',
        transaction_id: payment.razorpayPaymentId || payment.id,
        space_name: payment.booking.space.name,
        space_address: payment.booking.space.address
      }
    })

    console.log('✅ Returning payment history for user:', decoded.id, 'Found', payments.length, 'payments')

    return NextResponse.json({
      success: true,
      data: payments
    })

  } catch (error) {
    console.error('❌ Payment history API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}