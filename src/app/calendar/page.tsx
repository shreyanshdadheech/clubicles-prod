'use client'

import React, { useState } from 'react'
import { CalendarBooking } from '@/components/calendar-booking'

// Fallback component that works even if imports fail
function FallbackCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>('10:00')
  const [bookingType, setBookingType] = useState<'hourly' | 'daily'>('hourly')

  const timeSlots = Array.from({ length: 25 }, (_, i) => {
    const totalMinutes = i * 30
    const hour = Math.floor(totalMinutes / 60) + 9
    const minute = totalMinutes % 60
    if (hour > 21) return null
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
  }).filter(Boolean) as string[]

  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return date
  })

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Calendar Booking - Standalone Version</h1>
        <p className="text-gray-600">This is a fallback calendar that works without external dependencies</p>
      </div>

      {/* Booking Type */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Booking Type</h3>
        <div className="flex gap-3">
          <button
            onClick={() => setBookingType('hourly')}
            className={`flex-1 p-3 border rounded-lg text-center ${
              bookingType === 'hourly' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium">Hourly</div>
            <div className="text-sm text-gray-500">₹180/hour</div>
          </button>
          <button
            onClick={() => setBookingType('daily')}
            className={`flex-1 p-3 border rounded-lg text-center ${
              bookingType === 'daily' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium">Full Day</div>
            <div className="text-sm text-gray-500">₹1500/day</div>
          </button>
        </div>
      </div>

      {/* Date Selection */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Select Date</h3>
        <div className="grid grid-cols-7 gap-2">
          {days.slice(0, 14).map((date) => (
            <button
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              className={`p-3 border rounded-lg text-center hover:border-blue-500 ${
                selectedDate.toDateString() === date.toDateString()
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200'
              }`}
            >
              <div className="text-xs text-gray-600">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="font-semibold">{date.getDate()}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Time Selection */}
      {bookingType === 'hourly' && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Select Time</h3>
          <div className="grid grid-cols-6 gap-2">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`p-2 border rounded text-center ${
                  selectedTime === time
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Booking Summary</h3>
        <div className="space-y-1 text-sm">
          <div>Date: {selectedDate.toDateString()}</div>
          <div>Type: {bookingType}</div>
          {bookingType === 'hourly' && <div>Time: {selectedTime}</div>}
          <div className="font-semibold pt-2">
            Total: {bookingType === 'daily' ? '₹1500' : '₹180/hour'}
          </div>
        </div>
        <button 
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          onClick={() => {
            alert(`Booking confirmed for ${selectedDate.toDateString()} - ${bookingType} ${bookingType === 'hourly' ? `at ${selectedTime}` : ''}`)
          }}
        >
          Confirm Booking
        </button>
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const [useAdvanced, setUseAdvanced] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mock data for the advanced component
  const mockSpace = {
    id: '1',
    owner_id: 'owner1',
    name: 'Sample Co-Working Space',
    description: 'A modern workspace for professionals',
    address: '123 Business Street',
    city: 'Mumbai',
    pincode: '400001',
    latitude: 19.0760,
    longitude: 72.8777,
    total_seats: 50,
    available_seats: 35,
    price_per_hour: 180,
    price_per_day: 1500,
    amenities: ['WiFi', 'Coffee', 'Meeting Rooms'],
    images: ['/placeholder.jpg'],
    status: 'approved' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const mockUser = {
    id: 'user1',
    auth_id: 'user1',
    email: 'user@example.com',
    first_name: 'John',
    last_name: 'Doe',
    phone: '+91 9876543210',
    city: 'Mumbai',
    professional_role: 'violet' as const,
    roles: 'user' as const,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const handleBookingSelect = (bookingData: any) => {
    console.log('Booking selected:', bookingData)
    alert(`Booking confirmed!\nDate: ${bookingData.date.toDateString()}\nTime: ${bookingData.startTime} - ${bookingData.endTime || 'end of day'}\nTotal: ₹${bookingData.totalAmount}`)
  }

  // Component that tries to render advanced calendar and falls back to simple one
  const CalendarComponent = () => {
    try {
      if (!useAdvanced) return <FallbackCalendar />
      
      return (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Advanced Calendar Booking</h1>
            <div className="flex gap-4 justify-center mb-4">
              <button
                onClick={() => setUseAdvanced(true)}
                className={`px-4 py-2 rounded ${useAdvanced ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                Advanced Calendar
              </button>
              <button
                onClick={() => setUseAdvanced(false)}
                className={`px-4 py-2 rounded ${!useAdvanced ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                Simple Calendar
              </button>
            </div>
          </div>

          <CalendarBooking
            space={mockSpace}
            user={mockUser}
            onBookingSelect={handleBookingSelect}
            compact={false}
          />
        </div>
      )
    } catch (err) {
      console.error('Advanced calendar failed:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      return <FallbackCalendar />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700">
              <strong>Error with advanced calendar:</strong> {error}
            </p>
            <p className="text-red-600 text-sm mt-1">Falling back to simple calendar.</p>
          </div>
        )}
        
        <CalendarComponent />
      </div>
    </div>
  )
}
