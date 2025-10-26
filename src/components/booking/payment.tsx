'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { BookingConfirmation } from './booking-confirmation'

interface PaymentProps {
  amount: number
  bookingDetails: {
    spaceName: string
    space_id: string
    user_id: string
    date: string
    start_time: string
    end_time: string
    seats: number
    duration: number
    total_amount: number
    space_location: string
  }
  onPaymentSuccess: (paymentId: string) => void
  onPaymentError: (error: string) => void
}

// Razorpay configuration interface
interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: any) => void
  prefill: {
    email: string
    contact: string
  }
  theme: {
    color: string
  }
}

// Declare Razorpay on window object
declare global {
  interface Window {
    Razorpay: any
  }
}

export function PaymentComponent({ 
  amount, 
  bookingDetails, 
  onPaymentSuccess, 
  onPaymentError 
}: PaymentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [bookingData, setBookingData] = useState<any>(null)

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const createRazorpayOrder = async () => {
    try {
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to paise
          currency: 'INR',
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      return data.orderId
    } catch (error) {
      console.error('Error creating Razorpay order:', error)
      throw error
    }
  }

  const handlePayment = async () => {
    setIsLoading(true)

    try {
      // Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript()
      
      if (!isScriptLoaded) {
        throw new Error('Failed to load payment gateway')
      }

      // Create order
      const orderId = await createRazorpayOrder()

      // Configure Razorpay options
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        name: 'Clubicles',
        description: `Booking for ${bookingDetails.spaceName}`,
        order_id: orderId,
        handler: async (response) => {
          // Payment successful
          console.log('Payment successful:', response)
          
          try {
            // Verify payment with backend
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: amount,
                currency: 'INR',
                booking_data: {
                  space_id: bookingDetails.space_id,
                  user_id: bookingDetails.user_id,
                  date: bookingDetails.date,
                  start_time: bookingDetails.start_time,
                  end_time: bookingDetails.end_time,
                  seats: bookingDetails.seats,
                  booking_type: 'hourly',
                  total_amount: amount,
                  space_name: bookingDetails.spaceName,
                  space_address: bookingDetails.space_location
                }
              })
            })

            const verifyResult = await verifyResponse.json()
            
            if (verifyResult.success && verifyResult.booking) {
              // Show booking confirmation with redemption code
              setBookingData(verifyResult.booking)
              setShowConfirmation(true)
              onPaymentSuccess(response.razorpay_payment_id)
            } else {
              throw new Error(verifyResult.error || 'Payment verification failed')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            onPaymentError('Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          email: 'user@example.com', // TODO: Get from user context
          contact: '9999999999', // TODO: Get from user context
        },
        theme: {
          color: '#3B82F6',
        },
      }

      // Create Razorpay instance and open checkout
      const razorpay = new window.Razorpay(options)
      
      razorpay.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error)
        onPaymentError(response.error.description || 'Payment failed')
      })

      razorpay.open()
    } catch (error) {
      console.error('Payment error:', error)
      onPaymentError(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Space:</span>
            <span className="font-semibold">{bookingDetails.spaceName}</span>
          </div>
          <div className="flex justify-between">
            <span>Date & Time:</span>
            <span className="font-semibold">
              {new Date(bookingDetails.date).toLocaleDateString()} at {bookingDetails.start_time}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Duration:</span>
            <span className="font-semibold">{bookingDetails.duration} hours</span>
          </div>
          <div className="flex justify-between">
            <span>Seats:</span>
            <span className="font-semibold">{bookingDetails.seats}</span>
          </div>
          <hr />
          <div className="flex justify-between text-lg font-bold">
            <span>Total Amount:</span>
            <span>{formatCurrency(amount)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                CARD
              </div>
              <div className="w-12 h-8 bg-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">
                UPI
              </div>
              <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">
                NB
              </div>
              <span className="text-sm text-gray-600">& more</span>
            </div>
            <p className="text-sm text-gray-600">
              Secure payment powered by Razorpay. We support all major payment methods.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <h4 className="font-semibold">Booking Terms:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Cancellation allowed up to 2 hours before booking time</li>
              <li>• Refunds processed within 5-7 business days</li>
              <li>• Valid government ID required at check-in</li>
              <li>• No outside food allowed in premium spaces</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Pay Button */}
      <Button 
        onClick={handlePayment}
        className="w-full" 
        size="lg"
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : `Pay ${formatCurrency(amount)}`}
      </Button>

      {/* Security Note */}
      <div className="text-center text-xs text-gray-500">
        🔒 Your payment information is secure and encrypted
      </div>

      {/* Booking Confirmation Modal */}
      {showConfirmation && bookingData && (
        <BookingConfirmation
          booking={bookingData}
          onClose={() => setShowConfirmation(false)}
        />
      )}
    </div>
  )
}
