import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'test_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret',
})

interface ProcessPaymentRequest {
  type: 'subscription' | 'booking'
  amount: number
  currency: string
  // For subscription payments
  plan?: 'premium'
  billing_cycle?: 'monthly' | 'yearly'
  // For booking payments
  booking_id?: string
  space_id?: string
  user_id?: string
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 Processing payment...')
    console.log('Environment check:')
    console.log('NEXT_PUBLIC_RAZORPAY_KEY_ID:', process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? 'Set' : 'Not set')
    console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Not set')
    
    // Get JWT token from cookies
    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      console.log('❌ No auth token found')
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Verify the token
    const decoded = await verifyToken(token)
    
    if (!decoded) {
      console.log('❌ Invalid token')
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    console.log('✅ Authentication successful for user:', decoded.id)

    const body: ProcessPaymentRequest = await request.json()
    const { type, amount, currency = 'INR', plan, billing_cycle, booking_id, space_id, user_id } = body

    console.log('Payment processing data:', { type, amount, currency, plan, billing_cycle, booking_id })

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    if (type === 'subscription' && (!plan || !billing_cycle)) {
      return NextResponse.json(
        { error: 'Plan and billing cycle required for subscription payments' },
        { status: 400 }
      )
    }

    if (type === 'booking' && (!booking_id || !space_id)) {
      return NextResponse.json(
        { error: 'Booking ID and Space ID required for booking payments' },
        { status: 400 }
      )
    }

    // Check Razorpay credentials
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || 
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID === 'your_razorpay_key_id' || 
        process.env.RAZORPAY_KEY_SECRET === 'your_razorpay_secret') {
      console.error('❌ Razorpay credentials not properly configured')
      console.log('Current values:', {
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? 'Set' : 'Not set',
        keySecret: process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Not set'
      })
      
      // For development, return a mock order
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Development mode: Creating mock order (Razorpay not configured)')
        const mockOrder = {
          id: 'mock_order_' + Date.now(),
          amount: Math.round(amount * 100),
          currency: currency,
          receipt: type === 'subscription' 
            ? `sub_${plan}_${billing_cycle}_${Date.now()}`.substring(0, 40)
            : `booking_${booking_id}_${Date.now()}`.substring(0, 40)
        }
        
        return NextResponse.json({
          success: true,
          orderId: mockOrder.id,
          amount: mockOrder.amount,
          currency: mockOrder.currency,
          key: 'mock_key',
          type,
          receipt: mockOrder.receipt,
          isMock: true,
          message: 'Mock payment - Razorpay credentials not configured'
        })
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Payment gateway not configured',
          message: 'Razorpay credentials are not properly configured. Please contact support.'
        },
        { status: 500 }
      )
    }

    // Create Razorpay order
    const orderData = {
      amount: Math.round(amount * 100), // amount in paise
      currency: currency,
      receipt: type === 'subscription' 
        ? `sub_${plan}_${billing_cycle}_${Date.now()}`.substring(0, 40)
        : `booking_${booking_id}_${Date.now()}`.substring(0, 40),
      notes: {
        type,
        plan: plan || '',
        billing_cycle: billing_cycle || '',
        booking_id: booking_id || '',
        space_id: space_id || '',
        user_id: user_id || decoded.id
      }
    }
    
    console.log('Creating Razorpay order with data:', orderData)
    
    let order
    try {
      order = await razorpay.orders.create(orderData)
      console.log('✅ Order created successfully:', order.id)
    } catch (razorpayError: any) {
      console.error('❌ Razorpay order creation failed:', razorpayError)
      
      // Handle specific Razorpay errors
      if (razorpayError.statusCode === 401) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Payment gateway authentication failed',
            message: 'Payment processing is temporarily unavailable. Please contact support.'
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Payment order creation failed',
          message: razorpayError.error?.description || 'Unable to create payment order. Please try again.'
        },
        { status: 500 }
      )
    }

    // Ensure order is defined before proceeding
    if (!order) {
      console.error('❌ Order is undefined after creation')
      return NextResponse.json(
        { 
          success: false,
          error: 'Order creation failed',
          message: 'Unable to create payment order. Please try again.'
        },
        { status: 500 }
      )
    }

    // Record payment attempt in database
    try {
      if (type === 'subscription') {
        const spaceOwner = await prisma.spaceOwner.findFirst({
          where: { userId: decoded.id }
        })

        if (spaceOwner) {
          await prisma.spaceOwnerPaymentHistory.create({
            data: {
              spaceOwnerId: spaceOwner.id,
              amount: amount,
              currency: currency,
              paymentMethod: 'razorpay',
              transactionId: `pending_${order.id}`,
              razorpayOrderId: order.id,
              status: 'pending',
              paymentDate: new Date(),
              description: `${plan} ${billing_cycle} subscription - Order created`
            }
          })
        }
      } else if (type === 'booking' && booking_id) {
        await prisma.bookingPayment.create({
          data: {
            bookingId: booking_id,
            razorpayOrderId: order.id,
            amount: amount,
            currency: currency,
            status: 'pending'
          }
        })
      }
    } catch (dbError) {
      console.error('Error recording payment attempt:', dbError)
      // Continue with payment processing even if DB recording fails
    }

    const response = {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      type,
      receipt: order.receipt
    }
    
    console.log('Sending response:', { 
      ...response, 
      key: response.key ? 'Set' : 'Not set',
      keyValue: response.key ? response.key.substring(0, 8) + '...' : 'undefined'
    })
    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Payment processing error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Payment processing failed',
        message: 'Unable to process payment. Please try again.'
      },
      { status: 500 }
    )
  }
}

// GET method to retrieve payment status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')
  const type = searchParams.get('type') as 'subscription' | 'booking'

  if (!orderId || !type) {
    return NextResponse.json(
      { error: 'Order ID and type are required' },
      { status: 400 }
    )
  }

  try {
    // Get JWT token from cookies
    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Verify the token
    const decoded = await verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Fetch order details from Razorpay
    const order = await razorpay.orders.fetch(orderId)

    // Get payment status from database
    let paymentStatus = 'pending'
    let paymentRecord = null

    if (type === 'subscription') {
      const spaceOwner = await prisma.spaceOwner.findFirst({
        where: { userId: decoded.id }
      })

      if (spaceOwner) {
        paymentRecord = await prisma.spaceOwnerPaymentHistory.findFirst({
          where: {
            spaceOwnerId: spaceOwner.id,
            razorpayOrderId: orderId
          },
          orderBy: { createdAt: 'desc' }
        })
      }
    } else if (type === 'booking') {
      paymentRecord = await prisma.bookingPayment.findFirst({
        where: {
          razorpayOrderId: orderId
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    if (paymentRecord) {
      paymentStatus = paymentRecord.status
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      },
      payment: {
        status: paymentStatus,
        record: paymentRecord
      }
    })

  } catch (error) {
    console.error('Error fetching payment status:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch payment status',
        message: 'Unable to retrieve payment information'
      },
      { status: 500 }
    )
  }
}
