import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

interface CreateOrderRequest {
  amount: number
  currency: string
  receipt?: string
}

// Initialize Razorpay with credentials
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'test_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret',
})

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 Creating Razorpay order...')
    console.log('Environment check:')
    console.log('NEXT_PUBLIC_RAZORPAY_KEY_ID:', process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? 'Set' : 'Not set')
    console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Not set')
    
    const body: CreateOrderRequest = await request.json()
    const { amount, currency = 'INR', receipt } = body
    
    console.log('Order request data:', { amount, currency, receipt })

    // Validate input
    if (!amount || amount <= 0) {
      console.log('❌ Invalid amount:', amount)
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Check if Razorpay credentials are properly configured
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || 
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID === 'your_razorpay_key_id' || 
        process.env.RAZORPAY_KEY_SECRET === 'your_razorpay_secret') {
      console.log('⚠️ Razorpay credentials not properly configured, returning mock order')
      
      // Return mock order for development
      const mockOrderId = `mock_order_${Date.now()}`
      return NextResponse.json({
        orderId: mockOrderId,
        amount: Math.round(amount * 100),
        currency: currency,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'test_key',
        isMock: true,
        message: 'Razorpay credentials not configured - using mock payment'
      })
    }

    // Create Razorpay order
    const orderData = {
      amount: Math.round(amount * 100), // amount in paise
      currency: currency,
      receipt: receipt ? receipt.substring(0, 40) : `rcpt_${Date.now()}`, // Ensure max 40 chars
    }
    
    console.log('Creating order with data:', orderData)
    const order = await razorpay.orders.create(orderData)
    console.log('✅ Order created successfully:', order.id)

    const response = {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    }
    
    console.log('Sending response:', { ...response, key: response.key ? 'Set' : 'Not set' })
    return NextResponse.json(response)
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
