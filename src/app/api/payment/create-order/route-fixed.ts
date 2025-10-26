import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

interface CreateOrderRequest {
  amount: number
  currency: string
  receipt?: string
}

// Initialize Razorpay with credentials
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'test_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret',
})

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderRequest = await request.json()
    const { amount, currency = 'INR', receipt } = body

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // amount in paise
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

// GET method to retrieve order details
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')

  if (!orderId) {
    return NextResponse.json(
      { error: 'Order ID is required' },
      { status: 400 }
    )
  }

  try {
    // Fetch order details from Razorpay
    const order = await razorpay.orders.fetch(orderId)

    return NextResponse.json({
      id: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}
