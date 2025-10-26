'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SimplePaymentTestProps {
  amount: number
}

export function SimplePaymentTest({ amount }: SimplePaymentTestProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  const testPayment = async () => {
    setLoading(true)
    setResult('Testing payment...')
    
    try {
      console.log('🧪 Starting simple payment test')
      console.log('Environment check:')
      console.log('- Frontend Key:', process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID)
      console.log('- Key present:', !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID)
      console.log('- Full env keys:', Object.keys(process.env).filter(k => k.includes('RAZORPAY')))
      console.log('- Window location:', window.location.href)
      
      // Check if key exists
      if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        throw new Error('NEXT_PUBLIC_RAZORPAY_KEY_ID is not set in environment variables')
      }
      
      // Test 1: Check if Razorpay SDK loads
      setResult('Loading Razorpay SDK...')
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      
      const sdkLoaded = await new Promise((resolve) => {
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.head.appendChild(script)
        setTimeout(() => resolve(false), 10000) // 10 second timeout
      })
      
      if (!sdkLoaded) {
        throw new Error('Razorpay SDK failed to load within 10 seconds')
      }
      
      // Check if Razorpay is available
      if (typeof (window as any).Razorpay === 'undefined') {
        throw new Error('Razorpay SDK loaded but Razorpay object not available')
      }
      
      console.log('✅ Razorpay SDK loaded')
      setResult('SDK loaded. Creating order...')
      
      // Test 2: Create order
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 100, // ₹1 for testing
          currency: 'INR'
        })
      })
      
      const orderData = await orderResponse.json()
      console.log('Order response:', orderData)
      
      if (!orderResponse.ok) {
        throw new Error(`Order creation failed: ${orderData.error}`)
      }
      
      console.log('✅ Order created:', orderData.orderId)
      setResult('Order created. Opening payment gateway...')
      
      // Test 3: Open Razorpay checkout
      const options = {
        key: orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Clubicles - Test Payment',
        description: 'Test payment ₹1',
        order_id: orderData.orderId,
        handler: function (response: any) {
          console.log('Payment successful:', response)
          setResult(`✅ Payment Success! ID: ${response.razorpay_payment_id}`)
          setLoading(false)
        },
        modal: {
          ondismiss: function() {
            setResult('❌ Payment cancelled by user')
            setLoading(false)
          }
        }
      }
      
      console.log('Opening Razorpay with options:', {
        ...options,
        handler: 'function',
        key: options.key ? 'Set' : 'Not set'
      })
      
      const rzp = new (window as any).Razorpay(options)
      
      rzp.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response)
        setResult(`❌ Payment Failed: ${response.error.description}`)
        setLoading(false)
      })
      
      rzp.open()
      
    } catch (error) {
      console.error('Test failed:', error)
      setResult(`❌ Test Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>🧪 Payment Test</CardTitle>
        <p className="text-sm text-gray-600">Test Razorpay integration with ₹1</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm space-y-1">
          <p><strong>Test Amount:</strong> ₹1.00</p>
          <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
          <p><strong>Key Present:</strong> {process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Key Value:</strong> {process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'Not found'}</p>
          <p><strong>Window Razorpay:</strong> {typeof window !== 'undefined' && (window as any).Razorpay ? '✅ Available' : '❌ Not loaded'}</p>
        </div>
        
        <Button 
          onClick={testPayment} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Testing...' : 'Test Payment (₹1)'}
        </Button>
        
        {result && (
          <div className="p-3 bg-gray-50 rounded text-sm">
            <strong>Result:</strong> {result}
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          <p><strong>Test Cards:</strong></p>
          <p>Success: 4111 1111 1111 1111</p>
          <p>Failure: 4000 0000 0000 0002</p>
        </div>
      </CardContent>
    </Card>
  )
}
