"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Clock2Icon, X, CalendarIcon, User } from "lucide-react"

interface DateBooking {
  date: Date
  startTime: string
  endTime: string
  seats: number | string // Allow empty string during typing
  bookingType: "hourly" | "daily"
  professionalRole: string
}

interface MultiDateBookingProps {
  selectedDates: DateBooking[]
  onDatesChange: (dates: DateBooking[]) => void
  maxSeats: number
}

// Professional roles data - VIBGYOR system
const PROFESSIONAL_ROLES = [
  { id: 'visionary', name: 'Visionary', color: 'text-white bg-violet-500' },           // Visionaries & Venture Capitalists
  { id: 'industrialist', name: 'Industrialist', color: 'text-white bg-indigo-500' }, // IT & Industrialists
  { id: 'marketer', name: 'Marketer', color: 'text-white bg-blue-500' },             // Branding & Marketing
  { id: 'green_ev', name: 'Green & EV', color: 'text-white bg-green-500' },          // Green Footprint & EV
  { id: 'young_entrepreneur', name: 'Young Entrepreneur', color: 'text-white bg-yellow-500' }, // Young Entrepreneurs
  { id: 'oracle', name: 'Oracle', color: 'text-white bg-orange-500' },               // Oracle of Bharat
  { id: 'real_estate', name: 'Real Estate', color: 'text-white bg-red-500' },        // Real Estate & Recreationists
  { id: 'nomad', name: 'Nomad', color: 'text-white bg-gray-500' },                  // Nomads (Multi-talented)
  { id: 'policy_maker', name: 'Policy Maker', color: 'text-black bg-white' },       // Policy Makers & Health Professionals
  { id: 'prefer_not_to_say', name: 'Prefer Not to Say', color: 'text-white bg-black' } // Prefer Not to Say
]

// Helper function to safely get number from seats (string or number)
function getSeatsNumber(seats: number | string): number {
  if (typeof seats === 'string') {
    const num = parseInt(seats)
    return isNaN(num) ? 0 : num
  }
  return seats
}

export function MultiDateBooking({
  selectedDates,
  onDatesChange,
  maxSeats
}: MultiDateBookingProps) {
  const [calendarDates, setCalendarDates] = React.useState<Date[]>([])
  const [selectedDateIndex, setSelectedDateIndex] = React.useState<number | null>(null)

  // Update calendar dates when selectedDates change
  React.useEffect(() => {
    setCalendarDates(selectedDates.map(item => item.date))
  }, [selectedDates])

  const handleCalendarSelect = (dates: Date[] | undefined) => {
    if (!dates) return

    const newDateBookings: DateBooking[] = dates.map(date => {
      // Check if this date already exists
      const existing = selectedDates.find(item => 
        item.date.toDateString() === date.toDateString()
      )
      
      if (existing) {
        return existing
      }

      // Create new date booking with default values
      return {
        date,
        startTime: "09:00",
        endTime: "17:00",
        seats: 1,
        bookingType: "hourly" as const,
        professionalRole: "marketer"
      }
    })

    onDatesChange(newDateBookings)
  }

  const updateDateBooking = (index: number, field: keyof DateBooking, value: any) => {
    const updated = [...selectedDates]
    // For seats field, handle empty string during input
    if (field === 'seats' && value === '') {
      updated[index] = { ...updated[index], [field]: '' as any }
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }
    onDatesChange(updated)
  }

  const removeDateBooking = (index: number) => {
    const updated = selectedDates.filter((_, i) => i !== index)
    onDatesChange(updated)
  }

  const addDateBooking = () => {
    const today = new Date()
    const newDate = new Date(today.getTime() + (selectedDates.length * 24 * 60 * 60 * 1000))
    
    const newBooking: DateBooking = {
      date: newDate,
      startTime: "09:00",
      endTime: "17:00",
      seats: 1,
      bookingType: "hourly",
      professionalRole: "marketer"
    }
    
    onDatesChange([...selectedDates, newBooking])
  }

  return (
    <div className="space-y-6">
      {/* Calendar Selection */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Select Dates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="multiple"
            selected={calendarDates}
            onSelect={handleCalendarSelect}
            disabled={(date) => {
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              return date < today
            }}
            className="calendar-selected-white rounded-md"
          />
        </CardContent>
      </Card>


      {/* Selected Dates Pills */}
      {selectedDates.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Select Time</CardTitle>
              <Button
                onClick={addDateBooking}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Add Date
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {selectedDates.map((dateBooking, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedDateIndex === index 
                      ? "bg-white/20 border-white/40" 
                      : "bg-white/10 border-white/20 hover:bg-white/15"
                  }`}
                  onClick={() => setSelectedDateIndex(selectedDateIndex === index ? null : index)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium text-sm">
                      {dateBooking.date.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeDateBooking(index)
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-red-400 p-1 h-5 w-5"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-xs text-gray-300">
                    <div 
                      className="mb-1 cursor-pointer hover:text-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedDateIndex(index)
                      }}
                    >
                      {dateBooking.bookingType === "hourly" 
                        ? `${dateBooking.startTime} - ${dateBooking.endTime}`
                        : "Full Day"
                      }
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-white/60">
                        {getSeatsNumber(dateBooking.seats)} seat{getSeatsNumber(dateBooking.seats) > 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center space-x-1">
                        {(() => {
                          const selectedRole = PROFESSIONAL_ROLES.find(role => role.id === dateBooking.professionalRole)
                          return selectedRole ? (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedRole.color} shadow-md`}>
                              {selectedRole.name}
                            </span>
                          ) : null
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Date Configuration */}
      {selectedDateIndex !== null && selectedDates[selectedDateIndex] && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">
                Configure: {selectedDates[selectedDateIndex].date.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </CardTitle>
              <Button
                onClick={() => setSelectedDateIndex(null)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Individual Booking Type Selection */}
            <div>
              <Label className="text-white font-medium mb-2 block">Booking Type</Label>
              <div className="flex space-x-3">
                <Button
                  variant={selectedDates[selectedDateIndex].bookingType === "hourly" ? "default" : "outline"}
                  onClick={() => updateDateBooking(selectedDateIndex, 'bookingType', 'hourly')}
                  size="sm"
                  className={
                    selectedDates[selectedDateIndex].bookingType === "hourly"
                      ? "bg-white text-black hover:bg-gray-200 flex-1"
                      : "bg-white/10 border-white/30 text-white hover:bg-white/20 flex-1"
                  }
                >
                  <Clock2Icon className="h-4 w-4 mr-2" />
                  Hourly
                </Button>
                <Button
                  variant={selectedDates[selectedDateIndex].bookingType === "daily" ? "default" : "outline"}
                  onClick={() => updateDateBooking(selectedDateIndex, 'bookingType', 'daily')}
                  size="sm"
                  className={
                    selectedDates[selectedDateIndex].bookingType === "daily"
                      ? "bg-white text-black hover:bg-gray-200 flex-1"
                      : "bg-white/10 border-white/30 text-white hover:bg-white/20 flex-1"
                  }
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Full Day
                </Button>
              </div>
            </div>

            {/* Professional Role Selection */}
            <div>
              <Label className="text-white font-medium mb-2 block">Professional Role</Label>
              <div className="flex flex-wrap gap-2">
                {PROFESSIONAL_ROLES.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => updateDateBooking(selectedDateIndex, 'professionalRole', role.id)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedDates[selectedDateIndex].professionalRole === role.id
                        ? `${role.color}  shadow-md`
                        : 'bg-white/10 text-white/60 hover:bg-white/20 border border-white/20'
                    }`}
                  >
                    {role.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Time Selection (only for hourly) */}
              {selectedDates[selectedDateIndex].bookingType === "hourly" && (
                <>
                  <div className="space-y-2">
                    <Label className="text-white font-medium">Start Time</Label>
                    <div className="relative">
                      <Clock2Icon className="absolute left-2.5 top-2.5 h-4 w-4 text-white/70" />
                      <Input
                        type="time"
                        value={selectedDates[selectedDateIndex].startTime}
                        onChange={(e) => updateDateBooking(selectedDateIndex, 'startTime', e.target.value)}
                        className="bg-white/10 border-white/30 text-white pl-8 focus:bg-white/15 focus:border-white/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white font-medium">End Time</Label>
                    <div className="relative">
                      <Clock2Icon className="absolute left-2.5 top-2.5 h-4 w-4 text-white/70" />
                      <Input
                        type="time"
                        value={selectedDates[selectedDateIndex].endTime}
                        onChange={(e) => updateDateBooking(selectedDateIndex, 'endTime', e.target.value)}
                        className="bg-white/10 border-white/30 text-white pl-8 focus:bg-white/15 focus:border-white/50"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Seats Selection with Increment/Decrement Buttons */}
              <div className="space-y-2">
                <Label className="text-white font-medium">Seats</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const currentSeats = getSeatsNumber(selectedDates[selectedDateIndex].seats)
                      if (currentSeats > 1) {
                        updateDateBooking(selectedDateIndex, 'seats', currentSeats - 1)
                      }
                    }}
                    disabled={getSeatsNumber(selectedDates[selectedDateIndex].seats) <= 1}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed h-10 w-10"
                  >
                    <span className="text-xl">−</span>
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max={maxSeats}
                    value={typeof selectedDates[selectedDateIndex].seats === 'string' 
                      ? selectedDates[selectedDateIndex].seats 
                      : selectedDates[selectedDateIndex].seats.toString()}
                    onChange={(e) => {
                      const value = e.target.value
                      // Allow empty string for user to delete and type
                      if (value === '') {
                        updateDateBooking(selectedDateIndex, 'seats', '')
                        return
                      }
                      const numValue = parseInt(value)
                      if (!isNaN(numValue) && numValue >= 1) {
                        updateDateBooking(selectedDateIndex, 'seats', Math.min(numValue, maxSeats))
                      }
                    }}
                    onBlur={(e) => {
                      // If empty, set to 1
                      if (e.target.value === '') {
                        updateDateBooking(selectedDateIndex, 'seats', 1)
                      } else {
                        // Ensure minimum 1 and maximum maxSeats
                        const value = parseInt(e.target.value)
                        if (!isNaN(value)) {
                          const clampedValue = Math.max(1, Math.min(value, maxSeats))
                          updateDateBooking(selectedDateIndex, 'seats', clampedValue)
                        }
                      }
                    }}
                    className="bg-white/10 border-white/30 text-white focus:bg-white/15 focus:border-white/50 text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const currentSeats = getSeatsNumber(selectedDates[selectedDateIndex].seats)
                      if (currentSeats < maxSeats) {
                        updateDateBooking(selectedDateIndex, 'seats', currentSeats + 1)
                      }
                    }}
                    disabled={getSeatsNumber(selectedDates[selectedDateIndex].seats) >= maxSeats}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed h-10 w-10"
                  >
                    <span className="text-xl">+</span>
                  </Button>
                </div>
                <p className="text-xs text-gray-400">
                  Max: {maxSeats} seats
                </p>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="mt-4 p-3 bg-white/5 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">
                  {selectedDates[selectedDateIndex].bookingType === "hourly" 
                    ? `${selectedDates[selectedDateIndex].startTime} - ${selectedDates[selectedDateIndex].endTime}`
                    : "Full Day"
                  }
                </span>
                <span className="text-white font-medium">
                  {getSeatsNumber(selectedDates[selectedDateIndex].seats)} seat{getSeatsNumber(selectedDates[selectedDateIndex].seats) > 1 ? 's' : ''}
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-400">
                Type: {selectedDates[selectedDateIndex].bookingType === "hourly" ? "Hourly Booking" : "Full Day Booking"}
              </div>
              <div className="mt-1 text-xs text-gray-400">
                Role: {PROFESSIONAL_ROLES.find(role => role.id === selectedDates[selectedDateIndex].professionalRole)?.name || 'Marketer'}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
