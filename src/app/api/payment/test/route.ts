import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

export async function GET() {
  try {
    console.log('Testing Razorpay connection...')
    console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'Set' : 'Not set')
    console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Not set')
    
    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    })

    // Test by creating a small order (₹1)
    const testOrder = await razorpay.orders.create({
      amount: 100, // ₹1 in paise
      currency: 'INR',
      receipt: `test_${Date.now()}`
    })

    return NextResponse.json({
      success: true,
      message: 'Razorpay connection successful',
      orderId: testOrder.id,
      keyPresent: !!process.env.RAZORPAY_KEY_ID,
      secretPresent: !!process.env.RAZORPAY_KEY_SECRET
    })
  } catch (error) {
    console.error('Razorpay test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      keyPresent: !!process.env.RAZORPAY_KEY_ID,
      secretPresent: !!process.env.RAZORPAY_KEY_SECRET
    }, { status: 500 })
  }
}
