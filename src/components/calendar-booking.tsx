"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Clock, MapPin, Users, Calendar as CalendarIcon } from "lucide-react"
import { Space, Booking, User } from "@/types"
// Removed booking-actions import - using Prisma-based API
import { formatCurrency } from "@/lib/utils"

interface CalendarBookingProps {
  space?: Space
  user?: User
  onBookingSelect?: (bookingData: BookingSelection) => void
  compact?: boolean
}

interface BookingSelection {
  date: Date
  startTime: string
  endTime?: string
  duration: number
  totalAmount: number
  seats: number
  bookingType: 'hourly' | 'daily'
}

export function CalendarBooking({ 
  space, 
  user, 
  onBookingSelect, 
  compact = false 
}: CalendarBookingProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = React.useState<string | null>("10:00")
  const [endTime, setEndTime] = React.useState<string | null>("11:00")
  const [seats, setSeats] = React.useState<number>(1)
  const [bookingType, setBookingType] = React.useState<'hourly' | 'daily'>('hourly')
  const [bookedSlots, setBookedSlots] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  // Generate time slots from 9:00 AM to 9:00 PM in 30-minute intervals
  const timeSlots = Array.from({ length: 25 }, (_, i) => {
    const totalMinutes = i * 30
    const hour = Math.floor(totalMinutes / 60) + 9
    const minute = totalMinutes % 60
    if (hour > 21) return null
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
  }).filter(Boolean) as string[]

  // Disable past dates and dates more than 30 days in future
  const disabledDates = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)
    return date < today || date > thirtyDaysFromNow
  }

  // Fetch booked slots when date or space changes
  React.useEffect(() => {
    if (date && space) {
      fetchBookedSlots()
    }
  }, [date, space])

  const fetchBookedSlots = async () => {
    if (!date || !space) return
    
    setIsLoading(true)
    try {
      const dateString = date.toISOString().split('T')[0]
      const response = await fetch(`/api/bookings?spaceId=${space.id}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        const slots = result.data.flatMap((booking: Booking) => {
          const start = new Date(booking.startTime).getHours()
          const end = new Date(booking.endTime).getHours()
          const slotsInBooking = []
          for (let hour = start; hour < end; hour++) {
            slotsInBooking.push(`${hour.toString().padStart(2, "0")}:00`)
            slotsInBooking.push(`${hour.toString().padStart(2, "0")}:30`)
          }
          return slotsInBooking
        })
        setBookedSlots(slots)
      }
    } catch (error) {
      console.error('Error fetching booked slots:', error)
      // Don't throw error, just continue with empty booked slots
      setBookedSlots([])
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate duration and price
  const calculateBookingDetails = () => {
    if (!selectedTime || (bookingType === 'hourly' && !endTime)) return null
    
    let duration = 0
    let totalAmount = 0
    
    const defaultPricePerHour = 150 // Fallback price if no space provided
    const defaultPricePerDay = 1200 // Fallback price if no space provided
    
    if (bookingType === 'daily') {
      duration = 12 // 9 AM to 9 PM
      totalAmount = space ? space.price_per_day * seats : defaultPricePerDay * seats
    } else if (selectedTime && endTime) {
      const startHour = parseInt(selectedTime.split(':')[0])
      const startMinute = parseInt(selectedTime.split(':')[1])
      const endHour = parseInt(endTime.split(':')[0])
      const endMinute = parseInt(endTime.split(':')[1])
      
      duration = (endHour + endMinute/60) - (startHour + startMinute/60)
      totalAmount = space ? space.price_per_hour * duration * seats : defaultPricePerHour * duration * seats
    }
    
    return { duration, totalAmount }
  }

  const bookingDetails = calculateBookingDetails()

  const handleBookingConfirm = () => {
    if (!date || !selectedTime || (bookingType === 'hourly' && !endTime) || !bookingDetails) return
    
    const bookingData: BookingSelection = {
      date,
      startTime: selectedTime,
      endTime: bookingType === 'daily' ? '21:00' : endTime || undefined,
      duration: bookingDetails.duration,
      totalAmount: bookingDetails.totalAmount,
      seats,
      bookingType
    }
    
    if (onBookingSelect) {
      onBookingSelect(bookingData)
    } else {
      // Fallback if no callback provided
      console.log('Booking selected:', bookingData)
      alert(`Booking selected: ${bookingData.date.toDateString()} from ${bookingData.startTime} to ${bookingData.endTime || 'end of day'}`)
    }
  }

  const isTimeSlotBooked = (time: string) => bookedSlots.includes(time)
  const availableSeats = space ? space.available_seats : 10 // Fallback value

  // Safe currency formatting
  const safeCurrency = (amount: number) => {
    try {
      return formatCurrency ? formatCurrency(amount) : `₹${amount}`
    } catch {
      return `₹${amount}`
    }
  }

  return (
    <Card className={`w-full ${compact ? 'max-w-2xl' : 'max-w-4xl'} mx-auto`}>
      {space && (
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {space.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{space.address}, {space.city}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">From</div>
              <div className="font-semibold">{safeCurrency(space.price_per_hour)}/hour</div>
              <div className="text-sm text-muted-foreground">{safeCurrency(space.price_per_day)}/day</div>
            </div>
          </div>
        </CardHeader>
      )}

      {!space && (
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Book Your Time Slot
          </CardTitle>
          <p className="text-sm text-muted-foreground">Select your preferred date and time</p>
        </CardHeader>
      )}
      
      <CardContent className={`relative p-0 ${compact ? 'md:pr-56' : 'md:pr-72'}`}>
        <div className="p-6">
          {/* Booking Type Selection */}
          {!compact && (
            <div className="mb-6">
              <Label className="text-sm font-medium mb-3 block">Booking Type</Label>
              <div className="flex gap-3">
                <button
                  onClick={() => setBookingType('hourly')}
                  className={`flex-1 p-3 border rounded-lg text-center transition-all ${
                    bookingType === 'hourly' 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-input hover:border-primary/50'
                  }`}
                >
                  <Clock className="h-4 w-4 mx-auto mb-1" />
                  <div className="font-medium">Hourly</div>
                  {space && <div className="text-xs text-muted-foreground">{safeCurrency(space.price_per_hour)}/hr</div>}
                </button>
                <button
                  onClick={() => setBookingType('daily')}
                  className={`flex-1 p-3 border rounded-lg text-center transition-all ${
                    bookingType === 'daily' 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-input hover:border-primary/50'
                  }`}
                >
                  <CalendarIcon className="h-4 w-4 mx-auto mb-1" />
                  <div className="font-medium">Full Day</div>
                  {space && <div className="text-xs text-muted-foreground">{safeCurrency(space.price_per_day)}/day</div>}
                </button>
              </div>
            </div>
          )}

          {/* Seats Selection */}
          {!compact && (
            <div className="mb-6">
              <Label htmlFor="seats" className="text-sm font-medium mb-2 block">
                Number of Seats (Available: {availableSeats})
              </Label>
              <Input
                id="seats"
                type="number"
                min="1"
                max={availableSeats}
                value={seats}
                onChange={(e) => setSeats(Math.min(parseInt(e.target.value) || 1, availableSeats))}
                className="w-24"
              />
            </div>
          )}

          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            defaultMonth={date}
            disabled={disabledDates}
            showOutsideDays={false}
            className="calendar-selected-white bg-transparent p-0"
            formatters={{
              formatWeekdayName: (date: Date) => {
                return date.toLocaleString("en-US", { weekday: "short" })
              },
            }}
          />
        </div>

        {/* Time slots sidebar */}
        <div className={`inset-y-0 right-0 flex max-h-96 w-full flex-col gap-2 overflow-y-auto border-t p-6 ${compact ? 'md:absolute md:max-h-none md:w-56 md:border-t-0 md:border-l' : 'md:absolute md:max-h-none md:w-72 md:border-t-0 md:border-l'}`}>
          <h3 className="text-sm font-medium mb-2">Available Times</h3>
          
          {bookingType === 'daily' ? (
            <div className="space-y-2">
              <Badge variant="default" className="w-full justify-center py-2">
                Full Day (9:00 AM - 9:00 PM)
              </Badge>
              <p className="text-xs text-muted-foreground text-center">
                12 hours included
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-4">
                <Label className="text-xs">Start Time</Label>
                <div className="grid gap-1 max-h-32 overflow-y-auto">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                      disabled={isTimeSlotBooked(time)}
                      className="w-full justify-center"
                    >
                      {time}
                      {isTimeSlotBooked(time) && (
                        <Badge variant="destructive" className="ml-2 text-xs">
                          Booked
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedTime && (
                <div className="space-y-2">
                  <Label className="text-xs">End Time</Label>
                  <div className="grid gap-1 max-h-32 overflow-y-auto">
                    {timeSlots
                      .filter(time => time > selectedTime)
                      .map((time) => (
                        <Button
                          key={time}
                          variant={endTime === time ? "default" : "outline"}
                          size="sm"
                          onClick={() => setEndTime(time)}
                          disabled={isTimeSlotBooked(time)}
                          className="w-full justify-center"
                        >
                          {time}
                          {isTimeSlotBooked(time) && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                              Booked
                            </Badge>
                          )}
                        </Button>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}

          {isLoading && (
            <div className="text-center text-xs text-muted-foreground">
              Loading availability...
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 border-t px-6 py-4 md:flex-row md:items-center">
        <div className="text-sm flex-1">
          {date && selectedTime && bookingDetails ? (
            <div className="space-y-1">
              <div>
                Booking for{" "}
                <span className="font-medium">
                  {date.toLocaleDateString("en-US", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
              <div>
                Time: <span className="font-medium">
                  {bookingType === 'daily' 
                    ? '9:00 AM - 9:00 PM (12 hours)'
                    : `${selectedTime} - ${endTime || '...'} (${bookingDetails.duration}h)`
                  }
                </span>
              </div>
              {!compact && (
                <div>
                  Seats: <span className="font-medium">{seats}</span> × 
                  Total: <span className="font-medium text-primary">
                    {safeCurrency(bookingDetails.totalAmount)}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-muted-foreground">
              {!date ? "Select a date" : 
               !selectedTime ? "Select start time" : 
               bookingType === 'hourly' && !endTime ? "Select end time" : 
               "Ready to book"}
            </div>
          )}
        </div>
        <Button 
          disabled={
            !date || 
            !selectedTime || 
            (bookingType === 'hourly' && !endTime) || 
            !bookingDetails ||
            isLoading
          } 
          onClick={handleBookingConfirm}
          className="w-full md:w-auto"
        >
          {bookingDetails ? `Continue - ${safeCurrency(bookingDetails.totalAmount)}` : 'Continue'}
        </Button>
      </CardFooter>
    </Card>
  )
}
