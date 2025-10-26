'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProfessionalBadge } from '@/components/ui/professional-selector'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { 
  Calendar as CalendarIcon, Clock, MapPin, Users, 
  CreditCard, CheckCircle, AlertTriangle 
} from 'lucide-react'
import { Space, Booking, User, ProfessionalRole } from '@/types'
import { calculateDuration, formatCurrency, formatDate, formatTime } from '@/lib/utils'
// Removed booking-actions import - using Prisma-based API
import { PaymentIntegration } from '@/components/payment/payment-integration'

interface PaymentData {
  payment_id: string
  order_id: string
  signature: string
  amount: number
  currency: string
  status: 'success' | 'failed' | 'pending'
  method: 'card' | 'upi' | 'netbanking' | 'wallet'
}

interface BookingCalendarProps {
  space: Space
  user: User
  onBookingConfirm: (booking: BookingData) => void
}

interface BookingData {
  spaceId: string
  userId: string
  date: string
  startTime: string
  endTime: string
  seats: number
  totalAmount: number
  bookingType: 'hourly' | 'daily'
  paymentMethod?: 'razorpay' | 'upi' | 'card'
}

// Mock existing bookings for the space
const mockBookings: Booking[] = [
  {
    id: '1',
    spaceId: 'space1',
    userId: 'user1',
    startTime: '2025-08-15T10:00:00Z',
    endTime: '2025-08-15T12:00:00Z',
    date: '2025-08-15',
    seatsBooked: 1,
    baseAmount: 300,
    taxAmount: 60,
    totalAmount: 360,
    ownerPayout: 285,
    status: 'confirmed',
    createdAt: '2025-08-10T10:00:00Z',
    updatedAt: '2025-08-10T10:00:00Z',
    user: {
      id: 'user1',
      auth_id: 'user1',
      email: 'john.doe@example.com',
      first_name: 'John',
      last_name: 'Doe',
      phone: '+91 9876543210',
      city: 'Mumbai',
      professional_role: 'violet',
      roles: 'user',
      is_active: true,
      created_at: '2025-08-01T09:00:00Z',
      updated_at: '2025-08-01T09:00:00Z'
    }
  }
]

export function BookingCalendar({ 
  space, 
  user,
  onBookingConfirm 
}: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [seats, setSeats] = useState(1)
  const [bookingType, setBookingType] = useState<'hourly' | 'daily'>('hourly')
  const [showPayment, setShowPayment] = useState(false)
  const [existingBookings, setExistingBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch existing bookings for the selected date
  useEffect(() => {
    if (selectedDate) {
      fetchBookingsForDate()
    }
  }, [selectedDate])

  const fetchBookingsForDate = async () => {
    try {
      const response = await fetch(`/api/bookings?spaceId=${space.id}`)
      const result = await response.json()
      if (result.success && result.data) {
        setExistingBookings(result.data)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }

  // Calculate booking details
  const duration = startTime && endTime ? calculateDuration(startTime, endTime) : 0
  const basePrice = bookingType === 'hourly' 
    ? space.price_per_hour * duration 
    : space.price_per_day
  const totalAmount = basePrice * seats

  // Generate time slots (9 AM to 9 PM)
  const timeSlots = []
  for (let hour = 9; hour <= 21; hour++) {
    const time = hour.toString().padStart(2, '0') + ':00'
    timeSlots.push(time)
  }

  // Generate next 30 days
  const availableDates = []
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    availableDates.push(date.toISOString().split('T')[0])
  }

  const handleBookingSubmit = () => {
    if (!selectedDate || !startTime || (!endTime && bookingType === 'hourly')) {
      alert('Please fill in all required fields')
      return
    }

    if (seats > space.available_seats) {
      alert('Not enough seats available')
      return
    }

    setShowPayment(true)
  }

  const handlePaymentSuccess = async (paymentData: any) => {
    setIsLoading(true)
    try {
      const taxRate = 0.18 // 18% GST
      const baseAmount = totalAmount / (1 + taxRate)
      const taxAmount = totalAmount - baseAmount
      const ownerPayout = baseAmount // Owner gets the base amount after GST

      const bookingData = {
        spaceId: space.id,
        userId: user.id,
        date: selectedDate,
        startTime: `${selectedDate}T${startTime}:00Z`,
        endTime: `${selectedDate}T${bookingType === 'daily' ? '21:00' : endTime}:00Z`,
        seats: seats,
        totalAmount: totalAmount,
        bookingType: bookingType
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })
      const result = await response.json()
      if (result.success) {
        onBookingConfirm({
          ...bookingData,
          seats: seats, // Add the seats property
          bookingType: bookingType,
          paymentMethod: 'razorpay'
        })
        alert('Booking confirmed successfully!')
        setShowPayment(false)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Failed to create booking. Please contact support.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment failed:', error)
    alert(`Payment failed: ${error}`)
    setShowPayment(false)
  }

  return (
    <div className="space-y-6">
      {/* Booking Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <button
              onClick={() => setBookingType('hourly')}
              className={`flex-1 p-4 border rounded-lg text-center ${
                bookingType === 'hourly' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="font-semibold">Hourly</div>
              <div className="text-sm text-gray-600">{formatCurrency(space.price_per_hour)}/hour</div>
            </button>
            <button
              onClick={() => setBookingType('daily')}
              className={`flex-1 p-4 border rounded-lg text-center ${
                bookingType === 'daily' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="font-semibold">Full Day</div>
              <div className="text-sm text-gray-600">{formatCurrency(space.price_per_day)}/day</div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {availableDates.slice(0, 14).map((date) => {
              const dateObj = new Date(date)
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' })
              const dayNumber = dateObj.getDate()
              
              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`p-3 border rounded-lg text-center hover:border-blue-500 ${
                    selectedDate === date ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="text-xs text-gray-600">{dayName}</div>
                  <div className="font-semibold">{dayNumber}</div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Time Selection */}
      {bookingType === 'hourly' && (
        <Card>
          <CardHeader>
            <CardTitle>Select Time</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <select
                  id="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select start time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <select
                  id="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select end time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time} disabled={time <= startTime}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seats Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Number of Seats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="seats">Seats (Available: {space.available_seats})</Label>
            <Input
              id="seats"
              type="number"
              min="1"
              max={space.available_seats}
              value={seats}
              onChange={(e) => setSeats(Math.min(parseInt(e.target.value) || 1, space.available_seats))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Booking Summary */}
      {selectedDate && (bookingType === 'daily' || (startTime && endTime)) && (
        <Card>
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Date:</span>
              <span className="font-semibold">{new Date(selectedDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <span className="font-semibold">
                {bookingType === 'daily' ? 'Full Day (9:00 - 21:00)' : `${startTime} - ${endTime}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span className="font-semibold">
                {bookingType === 'daily' ? '12 hours' : `${duration} hours`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Seats:</span>
              <span className="font-semibold">{seats}</span>
            </div>
            <hr />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Book Button */}
      {!showPayment && (
        <Button 
          onClick={handleBookingSubmit}
          className="w-full" 
          size="lg"
          disabled={!selectedDate || (bookingType === 'hourly' && (!startTime || !endTime)) || isLoading}
        >
          {isLoading ? 'Processing...' : 'Proceed to Payment'}
        </Button>
      )}

      {/* Payment Integration */}
      {showPayment && (
        <div className="space-y-4">
          <Button 
            variant="outline"
            onClick={() => setShowPayment(false)}
            className="mb-4"
          >
            ← Back to Booking Details
          </Button>
          <PaymentIntegration
            user={user}
            space={space}
            bookingDetails={{
              date: selectedDate,
              start_time: `${selectedDate}T${startTime}:00Z`,
              end_time: `${selectedDate}T${bookingType === 'daily' ? '21:00' : endTime}:00Z`,
              total_hours: bookingType === 'daily' ? 12 : duration,
              total_amount: totalAmount,
              seats
            }}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
          />
        </div>
      )}
    </div>
  )
}
