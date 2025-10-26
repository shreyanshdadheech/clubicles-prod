'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProfessionalBadge } from '@/components/ui/professional-selector'
import { 
  CreditCard, Smartphone, QrCode, Shield, 
  CheckCircle, AlertTriangle, Clock, Receipt 
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { User, Space, ProfessionalRole } from '@/types'

interface PaymentIntegrationProps {
  user: User | undefined
  space: Space
  bookingDetails: {
    date: string
    start_time: string
    end_time: string
    total_hours: number
    total_amount: number
    seats: number
  }
  onPaymentSuccess: (paymentData: PaymentData) => void
  onPaymentError: (error: string) => void
}

interface PaymentData {
  payment_id: string
  order_id: string
  signature: string
  amount: number
  currency: string
  status: 'success' | 'failed' | 'pending'
  method: 'card' | 'upi' | 'netbanking' | 'wallet'
}

// Mock Razorpay integration
declare global {
  interface Window {
    Razorpay: any
  }
}

export function PaymentIntegration({
  user,
  space,
  bookingDetails,
  onPaymentSuccess,
  onPaymentError
}: PaymentIntegrationProps) {
  const [selectedMethod, setSelectedMethod] = useState<'razorpay' | 'upi' | 'wallet'>('razorpay')
  const [isProcessing, setIsProcessing] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)

  // Calculate final amount after discount
  const finalAmount = bookingDetails.total_amount - discount

  // VIBGYOR member discount (10% for VIBGYOR members)
  const professionalDiscount = user?.professional_role 
    ? bookingDetails.total_amount * 0.1 
    : 0

  const totalDiscount = discount + professionalDiscount
  const netAmount = bookingDetails.total_amount - totalDiscount

  // Payment method configurations
  const paymentMethods = [
    {
      id: 'razorpay',
      name: 'Card/UPI/NetBanking',
      icon: CreditCard,
      description: 'Pay securely with Razorpay',
      enabled: true
    },
    {
      id: 'upi',
      name: 'UPI Direct',
      icon: Smartphone,
      description: 'Pay directly with UPI apps',
      enabled: true
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      icon: QrCode,
      description: 'Pay with digital wallets',
      enabled: false // TODO: Implement wallet integration
    }
  ]

  const applyCoupon = () => {
    // Mock coupon validation
    const validCoupons = {
      'FIRST10': 0.1,
      'VIBGYOR15': 0.15,
      'WEEKEND20': 0.2
    }

    const couponDiscount = validCoupons[couponCode as keyof typeof validCoupons]
    if (couponDiscount) {
      setDiscount(bookingDetails.total_amount * couponDiscount)
      alert(`Coupon applied! ${(couponDiscount * 100)}% discount`)
    } else {
      alert('Invalid coupon code')
    }
  }

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleRazorpayPayment = async () => {
    setIsProcessing(true)
    console.log('🔵 Starting Razorpay payment process...')

    try {
      // Initialize Razorpay
      console.log('Loading Razorpay SDK...')
      const res = await initializeRazorpay()
      if (!res) {
        throw new Error('Razorpay SDK failed to load')
      }
      console.log('✅ Razorpay SDK loaded successfully')

      // Create order
      console.log('Creating payment order...', { netAmount, currency: 'INR' })
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: netAmount,
          currency: 'INR'
        })
      })

      const orderData = await orderResponse.json()
      console.log('Order response:', { 
        ok: orderResponse.ok, 
        status: orderResponse.status, 
        data: orderData 
      })
      
      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order')
      }
      
      console.log('✅ Order created successfully:', orderData.orderId)

      // Configure Razorpay options
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Clubicles - Premium Co-working Spaces',
        description: `Space booking: ${space.name}`,
        image: '/logo.png', // Add your logo URL here
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            setIsProcessing(true)
            console.log('🔵 Payment completed, verifying...', response)
            
            const verificationData = {
              ...response,
              booking_data: {
                space_id: space.id,
                user_id: user?.id || 'anonymous',
                date: bookingDetails.date,
                start_time: bookingDetails.start_time,
                end_time: bookingDetails.end_time,
                seats: bookingDetails.seats,
                total_amount: netAmount
              }
            }
            
            console.log('Sending verification data:', verificationData)
            
            // Verify payment
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(verificationData)
            })

            const verifyData = await verifyResponse.json()
            console.log('Verification response:', { 
              ok: verifyResponse.ok, 
              status: verifyResponse.status, 
              data: verifyData 
            })
            
            if (verifyResponse.ok && verifyData.success) {
              console.log('✅ Payment verified successfully')
              onPaymentSuccess({
                payment_id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id,
                signature: response.razorpay_signature,
                amount: netAmount,
                currency: 'INR',
                status: 'success',
                method: 'card'
              })
            } else {
              console.log('❌ Payment verification failed:', verifyData.error)
              throw new Error(verifyData.error || 'Payment verification failed')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            onPaymentError(error instanceof Error ? error.message : 'Payment verification failed')
          } finally {
            setIsProcessing(false)
          }
        },
        prefill: {
          name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.email || 'Guest User',
          email: user?.email || 'guest@clubicles.com',
          contact: user?.phone || '9999999999'
        },
        notes: {
          space_id: space.id,
          user_id: user?.id || 'anonymous',
          booking_date: bookingDetails.date,
          seats: bookingDetails.seats.toString()
        },
        theme: {
          color: '#000000'
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false)
            onPaymentError('Payment was cancelled by user')
          }
        },
        retry: {
          enabled: true,
          max_count: 3
        }
      }

      // Open Razorpay checkout
      console.log('Opening Razorpay checkout with options:', {
        ...options,
        handler: 'function',
        key: options.key ? 'Set' : 'Not set'
      })
      
      const razorpay = new (window as any).Razorpay(options)
      
      // Add error handler for payment failures
      razorpay.on('payment.failed', function (response: any) {
        console.error('❌ Payment failed:', response.error)
        setIsProcessing(false)
        onPaymentError(`Payment failed: ${response.error.description || 'Unknown error'}`)
      })
      
      console.log('Opening Razorpay modal...')
      razorpay.open()

    } catch (error) {
      setIsProcessing(false)
      console.error('Razorpay payment error:', error)
      onPaymentError(error instanceof Error ? error.message : 'Payment failed')
    }
  }

  const initiateUPIPayment = async () => {
    // Mock UPI payment flow
    setIsProcessing(true)
    
    try {
      // In real implementation, generate UPI payment link
      const upiLink = `upi://pay?pa=clubicles@paytm&pn=Clubicles&am=${netAmount}&cu=INR&tn=Booking for ${space.name}`
      
      // For demo, simulate successful payment after 3 seconds
      setTimeout(() => {
        const paymentData: PaymentData = {
          payment_id: `upi_${Date.now()}`,
          order_id: `order_${Date.now()}`,
          signature: 'mock_signature',
          amount: netAmount,
          currency: 'INR',
          status: 'success',
          method: 'upi'
        }
        onPaymentSuccess(paymentData)
        setIsProcessing(false)
      }, 3000)
      
      // Open UPI app (in real implementation)
      // window.open(upiLink, '_blank')
      
    } catch (error) {
      setIsProcessing(false)
      onPaymentError('UPI payment failed')
    }
  }

  const handlePayment = async () => {
    setIsProcessing(true)

    try {
      switch (selectedMethod) {
        case 'razorpay':
          await handleRazorpayPayment()
          break
        case 'upi':
          await initiateUPIPayment()
          break
        default:
          onPaymentError('Payment method not implemented')
      }
    } catch (error) {
      onPaymentError('Payment processing failed')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Payment Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            Complete Your Booking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Booking Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">{space.name}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Date:</span>
                  <p className="font-medium">{new Date(bookingDetails.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-600">Time:</span>
                  <p className="font-medium">
                    {new Date(bookingDetails.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                    {new Date(bookingDetails.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Duration:</span>
                  <p className="font-medium">{bookingDetails.total_hours} hours</p>
                </div>
                <div>
                  <span className="text-gray-600">Seats:</span>
                  <p className="font-medium">{bookingDetails.seats}</p>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.email || 'Guest User'}</p>
                <p className="text-sm text-gray-600">{user?.email || 'guest@example.com'}</p>
              </div>
              {user?.professional_role && (
                <ProfessionalBadge role={user.professional_role as ProfessionalRole} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coupon Code */}
      <Card>
        <CardHeader>
          <CardTitle>Discount & Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 p-3 border rounded-lg"
              />
              <Button onClick={applyCoupon} variant="outline">
                Apply
              </Button>
            </div>
            
            {professionalDiscount > 0 && (
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                  <span className="text-sm font-medium">VIBGYOR Member Discount (10%)</span>
                </div>
                <span className="text-purple-600 font-medium">
                  -{formatCurrency(professionalDiscount)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id as any)}
                  disabled={!method.enabled}
                  className={`w-full p-4 border rounded-lg text-left transition-colors ${
                    selectedMethod === method.id
                      ? 'border-blue-600 bg-blue-50'
                      : method.enabled
                        ? 'border-gray-300 hover:border-gray-400'
                        : 'border-gray-200 bg-gray-50 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Icon className="h-5 w-5 mr-3" />
                      <div>
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </div>
                    {selectedMethod === method.id && (
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Price Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Price Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Booking Amount</span>
              <span>{formatCurrency(bookingDetails.total_amount)}</span>
            </div>
            
            {totalDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Total Discount</span>
                <span>-{formatCurrency(totalDiscount)}</span>
              </div>
            )}
            
            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span>{formatCurrency(netAmount)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="flex items-center p-4 bg-blue-50 rounded-lg">
        <Shield className="h-5 w-5 text-blue-600 mr-3" />
        <div className="text-sm">
          <p className="font-medium text-blue-900">Secure Payment</p>
          <p className="text-blue-700">Your payment information is encrypted and secure</p>
        </div>
      </div>

      {/* Pay Button */}
      <Button 
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full py-3 text-lg"
        size="lg"
      >
        {isProcessing ? (
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </div>
        ) : (
          `Pay ${formatCurrency(netAmount)}`
        )}
      </Button>
    </div>
  )
}
