"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Clock, CreditCard, ArrowLeft, CheckCircle, CalendarIcon, X, Lock, ShieldCheck, AlertCircle } from "lucide-react"
import { MultiDateBooking } from '@/components/booking/multi-date-booking'
import type { Space, User } from "@/types"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

// Mock space data
const mockSpaces: Space[] = [
  {
    id: "1",
    owner_id: "owner1",
    name: "TechHub Co-working BKC",
    description: "Premium workspace in the heart of Mumbai's business district.",
    address: "Bandra Kurla Complex, Mumbai",
    city: "Mumbai",
    pincode: "400051",
    total_seats: 50,
    available_seats: 35,
    price_per_hour: 150,
    price_per_day: 1200,
    amenities: ["WiFi", "Coffee", "Meeting Rooms", "Parking", "AC", "Printer"],
    images: [],
    status: "approved",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    owner_id: "owner2",
    name: "Creative Studio Koregaon",
    description: "Inspiring workspace for creative professionals.",
    address: "Koregaon Park, Pune",
    city: "Pune",
    pincode: "411001",
    total_seats: 30,
    available_seats: 22,
    price_per_hour: 120,
    price_per_day: 950,
    amenities: ["WiFi", "Coffee", "Whiteboard", "Natural Light", "AC"],
    images: [],
    status: "approved",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Mock user
const mockUser: User = {
  id: "user1",
  auth_id: "user1",
  email: "john.doe@example.com",
  first_name: "John",
  last_name: "Doe",
  phone: "+91 9876543210",
  city: "Mumbai",
  professional_role: "violet",
  roles: "user",
  is_active: true,
  created_at: "2024-01-01",
  updated_at: "2024-01-01"
}

export default function BookSpacePage() {
  return <BookSpaceContent />
}

function BookSpaceContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const spaceId = params?.id as string
  const [user, setUser] = useState<any>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  const [space, setSpace] = useState<Space | null>(null)
  const [isLoadingSpace, setIsLoadingSpace] = useState(true)
  // New multi-date booking state - start with empty array (no default selection)
  const [dateBookings, setDateBookings] = useState<Array<{
    date: Date
    startTime: string
    endTime: string
    seats: number
    bookingType: "hourly" | "daily"
    professionalRole: string
  }>>([])
  
  // Legacy state for backward compatibility
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("17:00")
  const [seatsRequired, setSeatsRequired] = useState(1)
  const [bookingType, setBookingType] = useState<"hourly" | "daily">("hourly")
  const [isLoading, setIsLoading] = useState(false)
  const [bookingStep, setBookingStep] = useState<"details" | "payment" | "success">("details")
  const [allowMultipleDays, setAllowMultipleDays] = useState(false)
  const [taxConfigurations, setTaxConfigurations] = useState<any[]>([])
  const [isLoadingTaxes, setIsLoadingTaxes] = useState(true)

  // Get current user from API
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            setUser(data.user)
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setIsLoadingUser(false)
      }
    }
    
    fetchUser()
  }, [])

  // Fetch tax configurations
  useEffect(() => {
    const fetchTaxConfigurations = async () => {
      try {
        const response = await fetch('/api/tax-configurations/public', {
          method: 'GET',
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.taxes) {
            setTaxConfigurations(data.taxes)
          }
        }
      } catch (error) {
        console.error('Error fetching tax configurations:', error)
      } finally {
        setIsLoadingTaxes(false)
      }
    }
    
    fetchTaxConfigurations()
  }, [])

  useEffect(() => {
    // Check if this is a confirmed booking from URL parameters
    const confirmed = searchParams.get("confirmed")
    if (confirmed === "true") {
      setBookingStep("success")
      
      // Set booking data from URL parameters
      const dates = searchParams.get("dates")
      const seats = searchParams.get("seats")
      const type = searchParams.get("bookingType")
      const start = searchParams.get("startTime")
      const end = searchParams.get("endTime")
      
      if (dates) {
        setSelectedDates(dates.split(',').map(d => new Date(d)))
      }
      if (seats) {
        setSeatsRequired(parseInt(seats))
      }
      if (type === "hourly" || type === "daily") {
        setBookingType(type)
      }
      if (start) {
        setStartTime(start)
      }
      if (end) {
        setEndTime(end)
      }
    }

    // Load space data
    const loadSpaceData = async () => {
      setIsLoadingSpace(true)
      
      // First, try to get space data from URL parameters (for mock/testing)
      const name = searchParams.get("name")
      const address = searchParams.get("address")
      const city = searchParams.get("city")
      const pincode = searchParams.get("pincode")
      const hourlyRate = searchParams.get("hourlyRate")
      const dailyRate = searchParams.get("dailyRate")
      const totalSeats = searchParams.get("totalSeats")
      const availableSeats = searchParams.get("availableSeats")
      const amenities = searchParams.get("amenities")

      if (name && address && hourlyRate && dailyRate) {
        // Create space object from URL parameters (mock data)
        const spaceFromParams: Space = {
          id: spaceId,
          owner_id: `owner_${spaceId}`,
          name,
          description: `Workspace in ${city}`,
          address,
          city: city || "",
          pincode: pincode || "",
          total_seats: parseInt(totalSeats || "50"),
          available_seats: parseInt(availableSeats || "35"),
          price_per_hour: parseInt(hourlyRate),
          price_per_day: parseInt(dailyRate),
          amenities: amenities ? amenities.split(',') : [],
          images: [],
          status: "approved",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setSpace(spaceFromParams)
        setIsLoadingSpace(false)
        return
      }

      // Always try to load from API first
      try {
        const response = await fetch(`/api/spaces/${spaceId}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.space) {
            console.log('✅ Loaded space from API:', result.space.name)
            setSpace(result.space)
            setIsLoadingSpace(false)
            return
          }
        }
        console.log('❌ API call failed or returned no data, falling back to mock data')
      } catch (error) {
        console.error('❌ Failed to load space from API:', error)
      }

      // Fallback to mock data if API fails
      const foundSpace = mockSpaces.find((s) => s.id === spaceId)
      setSpace(foundSpace || mockSpaces[0])
      setIsLoadingSpace(false)
    }

    loadSpaceData()

    // Check if date is provided in URL (for regular booking flow)
    if (!confirmed) {
      const dateParam = searchParams.get("date")
      if (dateParam) {
        setSelectedDates([new Date(dateParam)])
      }
    }
  }, [spaceId, searchParams])

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return

    if (allowMultipleDays) {
      setSelectedDates((prev) => {
        const isSelected = prev.some((d) => d.toDateString() === date.toDateString())
        if (isSelected) {
          return prev.filter((d) => d.toDateString() !== date.toDateString())
        }
        return [...prev, date].sort((a, b) => a.getTime() - b.getTime())
      })
    } else {
      setSelectedDates([date])
    }
  }

  const removeDateFromSelection = (dateToRemove: Date) => {
    setSelectedDates((prev) => prev.filter((d) => d.toDateString() !== dateToRemove.toDateString()))
  }

  // Update legacy selectedDates when dateBookings change
  useEffect(() => {
    setSelectedDates(dateBookings.map(booking => booking.date))
  }, [dateBookings])

  // Show loading while checking authentication
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to signin if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to make a booking</h2>
          <p className="text-gray-300 mb-6">You need to be signed in to book a space.</p>
          <Link href="/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isLoadingSpace) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-white mb-4">Loading space details...</h1>
            <p className="text-gray-400">Please wait while we fetch the space information.</p>
          </div>
        </div>
      </div>
    )
  }

  if (!space) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Space not found</h1>
            <p className="text-gray-400 mb-6">The space you're looking for doesn't exist.</p>
            <Link href="/spaces">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Back to Spaces
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const calculateSubtotal = () => {
    if (dateBookings.length === 0) return 0
    
    return dateBookings.reduce((total, booking) => {
      const isHourly = booking.bookingType === "hourly"
      const start = new Date(`2024-01-01 ${booking.startTime}`)
      const end = new Date(`2024-01-01 ${booking.endTime}`)
      const hours = isHourly ? Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60)) : 1
      const rate = isHourly ? space.price_per_hour : space.price_per_day
      return total + (rate * booking.seats * hours)
    }, 0)
  }

  const calculateTaxes = () => {
    const subtotal = calculateSubtotal()
    const applicableTaxes = taxConfigurations.filter(tax => 
      tax.isEnabled && (tax.appliesTo === 'booking' || tax.appliesTo === 'both')
    )
    
    let totalTaxAmount = 0
    const taxBreakdown = applicableTaxes.map(tax => {
      const taxAmount = Math.round(subtotal * (tax.percentage / 100))
      totalTaxAmount += taxAmount
      return {
        name: tax.name,
        percentage: tax.percentage,
        amount: taxAmount
      }
    })
    
    return {
      totalTaxAmount,
      taxBreakdown
    }
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const taxes = calculateTaxes()
    return subtotal + taxes.totalTaxAmount
  }

  const handleBooking = () => {
    if (selectedDates.length === 0) {
      alert("Please select at least one date")
      return
    }
    setIsLoading(true)
    setBookingStep("payment")

    // Simulate payment process
    setTimeout(() => {
      setBookingStep("success")
      setIsLoading(false)
      
      // Update URL with booking confirmation data
      const bookingParams = new URLSearchParams({
        confirmed: "true",
        spaceName: space.name,
        spaceAddress: space.address,
        dates: selectedDates.map(d => d.toISOString().split('T')[0]).join(','),
        bookingType,
        seats: seatsRequired.toString(),
        startTime: bookingType === "hourly" ? startTime : "",
        endTime: bookingType === "hourly" ? endTime : "",
        subtotal: calculateSubtotal().toString(),
        taxAmount: calculateTaxes().totalTaxAmount.toString(),
        total: calculateTotal().toString(),
        paymentId: "pay_" + Date.now()
      })
      
      // Update URL without page reload
      const newUrl = `${window.location.pathname}?${bookingParams.toString()}`
      window.history.pushState({}, '', newUrl)
    }, 2000)
  }

  const handlePayment = async () => {
    // Check if user is authenticated
    if (!user?.id) {
      alert('Please sign in to make a booking')
      router.push('/signin')
      return
    }

    setIsLoading(true)

    try {
      console.log('🔵 Starting real Razorpay payment process')
      console.log('Amount:', calculateTotal())
      console.log('Space:', space.name)
      console.log('Authenticated user:', user.id)
      
      // Step 1: Load Razorpay SDK
      const loadRazorpayScript = () => {
        return new Promise<boolean>((resolve) => {
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = () => {
            console.log('✅ Razorpay SDK loaded')
            resolve(true)
          }
          script.onerror = () => {
            console.error('❌ Failed to load Razorpay SDK')
            resolve(false)
          }
          document.head.appendChild(script)
        })
      }

      const isScriptLoaded = await loadRazorpayScript()
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay payment gateway. Please check your internet connection.')
      }

      // Step 2: Create order from backend
      console.log('🔵 Creating payment order...')
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: calculateTotal(),
          currency: 'INR',
          receipt: `bk_${space.id.slice(-8)}_${Date.now().toString().slice(-6)}`, // Max 40 chars
        }),
      })

      if (!orderResponse.ok) {
        const error = await orderResponse.json()
        throw new Error(error.error || 'Failed to create payment order')
      }

      const orderData = await orderResponse.json()
      console.log('✅ Order created:', orderData.orderId)

      // Step 3: Open Razorpay payment gateway
      const razorpayOptions = {
        key: orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Clubicles',
        description: `Booking for ${space.name}`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          console.log('✅ Payment successful:', response)
          
          try {
            // Step 4: Verify payment on backend
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                booking_data: {
                  space_id: space.id,
                  user_id: user?.id || '', // Don't use 'guest', use empty string if no user
                  date: dateBookings[0]?.date.toISOString().split('T')[0] || selectedDates[0].toISOString().split('T')[0], // Primary date
                  dates: dateBookings.length > 0 ? dateBookings.map(booking => ({
                    date: booking.date.toISOString().split('T')[0],
                    start_time: booking.startTime,
                    end_time: booking.endTime,
                    seats: booking.seats,
                    booking_type: booking.bookingType,
                    professional_role: booking.professionalRole
                  })) : selectedDates.map(d => ({
                    date: d.toISOString().split('T')[0],
                    start_time: bookingType === "hourly" ? startTime : "09:00",
                    end_time: bookingType === "hourly" ? endTime : "18:00",
                    seats: seatsRequired,
                    booking_type: bookingType,
                    professional_role: "marketer" // Default role
                  })),
                  start_time: dateBookings[0]?.startTime || (bookingType === "hourly" ? startTime : "09:00"),
                  end_time: dateBookings[0]?.endTime || (bookingType === "hourly" ? endTime : "18:00"),
                  seats: dateBookings.length > 0 ? dateBookings.reduce((total, booking) => total + booking.seats, 0) : seatsRequired,
                  booking_type: dateBookings[0]?.bookingType || bookingType,
                  total_amount: calculateTotal(),
                  space_name: space.name,
                  space_address: space.address,
                  // Add pricing information
                  price_per_hour: space.price_per_hour || parseFloat(searchParams.get('hourlyRate') || '0'),
                  price_per_day: space.price_per_day || parseFloat(searchParams.get('dailyRate') || '0')
                }
              }),
            })

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed')
            }

            const verifyData = await verifyResponse.json()
            console.log('✅ Payment verified:', verifyData)

            // Step 5: Complete booking
            setBookingStep("success")
            setIsLoading(false)
            
            // Update URL with booking confirmation data including redemption info
            const bookingParams = new URLSearchParams({
              confirmed: "true",
              spaceName: space.name,
              spaceAddress: space.address,
              dates: dateBookings.length > 0 ? dateBookings.map(b => b.date.toISOString().split('T')[0]).join(',') : selectedDates.map(d => d.toISOString().split('T')[0]).join(','),
              bookingType: dateBookings[0]?.bookingType || bookingType,
              seats: dateBookings.length > 0 ? dateBookings.reduce((total, b) => total + b.seats, 0).toString() : seatsRequired.toString(),
              startTime: dateBookings[0]?.startTime || (bookingType === "hourly" ? startTime : ""),
              endTime: dateBookings[0]?.endTime || (bookingType === "hourly" ? endTime : ""),
              subtotal: calculateSubtotal().toString(),
              taxAmount: calculateTaxes().totalTaxAmount.toString(),
              total: calculateTotal().toString(),
              paymentId: response.razorpay_payment_id,
              bookingIds: verifyData.bookings?.map((b: any) => b.id).join(',') || '',
              redemptionCodes: verifyData.redemption_info?.codes?.join(',') || '',
              primaryRedemptionCode: verifyData.redemption_info?.primary_code || '',
              totalBookings: verifyData.total_bookings?.toString() || '1'
            })
            
            // Update URL without page reload
            const newUrl = `${window.location.pathname}?${bookingParams.toString()}`
            window.history.pushState({}, '', newUrl)

          } catch (verificationError) {
            console.error('❌ Payment verification failed:', verificationError)
            alert('Payment completed but verification failed. Please contact support with payment ID: ' + response.razorpay_payment_id)
            setIsLoading(false)
          }
        },
        modal: {
          ondismiss: () => {
            console.log('Payment cancelled by user')
            setIsLoading(false)
          }
        },
        prefill: {
          name: user?.user_metadata?.full_name || "Guest User",
          email: user?.email || "",
          contact: user?.user_metadata?.phone || "",
        },
        notes: {
          space_id: space.id,
          user_id: user?.id || "guest",
          dates: selectedDates.map((d) => d.toISOString()).join(","),
          seats: seatsRequired.toString(),
        },
        theme: {
          color: "#2563eb",
        },
      }

      // Step 6: Open Razorpay checkout
      console.log('🔵 Opening Razorpay checkout...')
      const rzp = new (window as any).Razorpay(razorpayOptions)
      
      rzp.on('payment.failed', (response: any) => {
        console.error('❌ Payment failed:', response)
        alert(`Payment failed: ${response.error.description}`)
        setIsLoading(false)
      })

      rzp.open()

    } catch (error) {
      console.error('❌ Payment process error:', error)
      alert(error instanceof Error ? error.message : 'Payment failed. Please try again.')
      setIsLoading(false)
    }
  }

  if (bookingStep === "success") {
    // Get booking data from URL parameters for reliable display
    const confirmedSpaceName = searchParams.get("spaceName") || space.name
    const confirmedSpaceAddress = searchParams.get("spaceAddress") || space.address
    const confirmedDates = searchParams.get("dates")?.split(',').map(d => new Date(d)) || selectedDates
    const confirmedBookingType = (searchParams.get("bookingType") as "hourly" | "daily") || bookingType
    const confirmedSeats = parseInt(searchParams.get("seats") || seatsRequired.toString())
    const confirmedStartTime = searchParams.get("startTime") || startTime
    const confirmedEndTime = searchParams.get("endTime") || endTime
    const confirmedSubtotal = parseInt(searchParams.get("subtotal") || calculateSubtotal().toString())
    const confirmedTaxAmount = parseInt(searchParams.get("taxAmount") || calculateTaxes().totalTaxAmount.toString())
    const confirmedTotal = parseInt(searchParams.get("total") || calculateTotal().toString())
    const paymentId = searchParams.get("paymentId")

    const getTimeDisplay = () => {
      if (confirmedBookingType === "daily") {
        return "Full Day"
      } else {
        const start = new Date(`2024-01-01 ${confirmedStartTime}`)
        const end = new Date(`2024-01-01 ${confirmedEndTime}`)
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        return `${hours} hour${hours !== 1 ? 's' : ''} (${confirmedStartTime} - ${confirmedEndTime})`
      }
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white flex items-center justify-center p-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-2xl w-full">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <CheckCircle className="h-20 w-20 text-green-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">Booking Confirmed!</h2>
              <p className="text-gray-300 text-lg">
                Your reservation has been successfully processed.
              </p>
            </div>

            {/* Detailed Booking Information */}
            <div className="bg-white/5 rounded-lg p-6 border border-white/10 mb-8">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Booking Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Space</h4>
                    <p className="text-white font-semibold">{confirmedSpaceName}</p>
                    <p className="text-gray-300 text-sm flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {confirmedSpaceAddress}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Date{confirmedDates.length > 1 ? 's' : ''}</h4>
                    {confirmedDates.length === 1 ? (
                      <p className="text-white font-semibold">
                        {confirmedDates[0].toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {confirmedDates.map((date, index) => (
                          <p key={index} className="text-white font-semibold text-sm">
                            {date.toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Duration</h4>
                    <p className="text-white font-semibold">{getTimeDisplay()}</p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Seats Reserved</h4>
                    <p className="text-white font-semibold">{confirmedSeats} seat{confirmedSeats !== 1 ? 's' : ''}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Rate</h4>
                    <p className="text-white font-semibold">
                      {formatCurrency(confirmedBookingType === "daily" ? space.price_per_day : space.price_per_hour)}/
                      {confirmedBookingType === "daily" ? "day" : "hour"}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Total Days</h4>
                    <p className="text-white font-semibold">{confirmedDates.length} day{confirmedDates.length !== 1 ? 's' : ''}</p>
                  </div>

                  {paymentId && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Payment ID</h4>
                      <p className="text-white font-semibold text-xs font-mono">{paymentId}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="border-t border-white/20 pt-6 mt-6">
                <h4 className="text-lg font-semibold text-white mb-4">Pricing Breakdown</h4>
                <div className="space-y-3">
                  {confirmedBookingType === "daily" ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Daily Rate × {confirmedSeats} seat{confirmedSeats !== 1 ? 's' : ''}</span>
                        <span className="text-white">{formatCurrency(space.price_per_day * confirmedSeats)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Number of Days</span>
                        <span className="text-white">× {confirmedDates.length}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Hourly Rate × {confirmedSeats} seat{confirmedSeats !== 1 ? 's' : ''}</span>
                        <span className="text-white">{formatCurrency(space.price_per_hour * confirmedSeats)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Hours per Day</span>
                        <span className="text-white">× {Math.max(1, (new Date(`2024-01-01 ${confirmedEndTime}`).getTime() - new Date(`2024-01-01 ${confirmedStartTime}`).getTime()) / (1000 * 60 * 60))}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Number of Days</span>
                        <span className="text-white">× {confirmedDates.length}</span>
                      </div>
                    </>
                  )}
                  
                  <div className="border-t border-white/20 pt-3 mt-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300 font-medium">Subtotal</span>
                      <span className="text-white font-semibold">{formatCurrency(confirmedSubtotal)}</span>
                    </div>
                    {confirmedTaxAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-300 font-medium">Tax</span>
                        <span className="text-white font-semibold">{formatCurrency(confirmedTaxAmount)}</span>
                      </div>
                    )}
                    <div className="border-t border-white/20 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white text-xl font-bold">Total Amount Paid</span>
                        <span className="text-white text-2xl font-bold">{formatCurrency(confirmedTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Redemption Code Section */}
            {(searchParams.get("redemptionCodes") || searchParams.get("primaryRedemptionCode") || searchParams.get("bookingIds")) && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 mb-8">
                <div className="text-center mb-6">
                  <h3 className="text-green-400 text-xl font-bold mb-2">🎫 Your Booking Access Codes</h3>
                  <p className="text-gray-300 text-sm">
                    {searchParams.get("totalBookings") === "1" 
                      ? "Present this code or QR code to the space owner for entry"
                      : `You have ${searchParams.get("totalBookings")} separate bookings. Each date has its own redemption code.`
                    }
                  </p>
                </div>

                {searchParams.get("totalBookings") === "1" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Single Redemption Code */}
                    <div className="bg-white/5 rounded-lg p-6 text-center">
                      <h4 className="text-white font-semibold mb-3">Redemption Code</h4>
                      <div className="bg-white/10 rounded-lg p-4 mb-4">
                        <code className="text-green-400 text-xl font-mono font-bold">
                          {searchParams.get("primaryRedemptionCode") || searchParams.get("redemptionCodes") || "LOADING..."}
                        </code>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                        onClick={() => {
                          const code = searchParams.get("primaryRedemptionCode") || searchParams.get("redemptionCodes") || ""
                          navigator.clipboard.writeText(code)
                          alert("Redemption code copied to clipboard!")
                        }}
                      >
                        Copy Code
                      </Button>
                    </div>

                  {/* QR Code */}
                  <div className="bg-white/5 rounded-lg p-6 text-center">
                    <h4 className="text-white font-semibold mb-3">QR Code</h4>
                    <div className="bg-white rounded-lg p-4 mb-4 inline-block">
                      <div className="w-32 h-32 bg-gray-200 flex items-center justify-center text-gray-600 text-xs">
                        {searchParams.get("bookingId") ? (
                          <img 
                            src={`/api/bookings/qr-display?booking_id=${searchParams.get("bookingId")}`}
                            alt="Booking QR Code"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                              const parent = (e.target as HTMLImageElement).parentElement
                              if (parent) parent.innerHTML = '<span class="text-gray-600 text-xs">QR Code Loading...</span>'
                            }}
                          />
                        ) : (
                          <span>QR Code Loading...</span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs">Scan with camera or QR scanner</p>
                  </div>
                </div>
                ) : (
                  /* Multiple Redemption Codes */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {searchParams.get("redemptionCodes")?.split(',').map((code, index) => (
                        <div key={index} className="bg-white/5 rounded-lg p-4">
                          <h4 className="text-white font-semibold mb-2">Date {index + 1} Code</h4>
                          <div className="bg-white/10 rounded-lg p-3 mb-3">
                            <code className="text-green-400 text-lg font-mono font-bold">
                              {code}
                            </code>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white/10 border-white/30 text-white hover:bg-white/20 w-full"
                            onClick={() => {
                              navigator.clipboard.writeText(code)
                              alert(`Redemption code for Date ${index + 1} copied to clipboard!`)
                            }}
                          >
                            Copy Code {index + 1}
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="text-blue-400 font-semibold mb-1">Multiple Bookings</h5>
                          <p className="text-gray-300 text-sm">
                            Each date has its own redemption code. Use the specific code for each date when you arrive.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="text-yellow-400 font-semibold mb-1">Important Instructions</h5>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• Save this redemption code - you'll need it to enter the space</li>
                        <li>• Present the code or QR code to the space owner upon arrival</li>
                        <li>• Code can only be used once and cannot be transferred</li>
                        <li>• Keep this information secure until your booking date</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-8">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-blue-400 font-semibold mb-1">What's Next?</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• You'll receive a confirmation email with booking details</li>
                    <li>• Please arrive 15 minutes early for check-in</li>
                    <li>• Bring a valid ID for verification</li>
                    <li>• Contact support if you need to modify your booking</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => router.push("/dashboard")}
                className="flex-1 bg-white text-black hover:bg-gray-200 py-3"
              >
                View My Bookings
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/spaces")}
                className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20 py-3"
              >
                Book Another Space
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Book Your Seat</h1>
              <p className="text-gray-400">{space.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {bookingStep === "details" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Multi-Date Booking Form */}
            <div className="space-y-6">
              <MultiDateBooking
                selectedDates={dateBookings}
                onDatesChange={setDateBookings}
                maxSeats={space.available_seats}
              />

              {/* Continue Button */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20 pt-4">
                <CardContent className="p-6">
              <Button
                onClick={() => setBookingStep("payment")}
                    disabled={dateBookings.length === 0}
                className="w-full bg-white text-black hover:bg-gray-200 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                    Continue to Payment ({dateBookings.length} date{dateBookings.length !== 1 ? 's' : ''} selected)
              </Button>
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary */}
            <div className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Space Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white text-lg">{space.name}</h3>
                    <p className="text-gray-300 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {space.address}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {space.amenities.map((amenity, index) => (
                      <Badge key={index} variant="default" className="bg-white/20 text-white px-3 py-1">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Booking Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {dateBookings.length > 0 && (
                    <div className="space-y-3">
                    <div className="flex justify-between items-center py-2">
                        <span className="text-gray-300 font-medium">Booking{dateBookings.length > 1 ? "s" : ""}</span>
                          <span className="text-white font-semibold">
                          {dateBookings.length} date{dateBookings.length !== 1 ? 's' : ''} selected
                        </span>
                      </div>
                      
                      {/* Show details for each date booking */}
                      {dateBookings.map((booking, index) => (
                        <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-white font-medium">
                                {booking.date.toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                              </p>
                              {booking.bookingType === "hourly" && (
                                <p className="text-sm text-gray-300">
                                  {booking.startTime} - {booking.endTime}
                                </p>
                        )}
                      </div>
                      <div className="text-right">
                              <p className="text-white font-medium">{booking.seats} seat{booking.seats > 1 ? 's' : ''}</p>
                              <p className="text-sm text-gray-300">
                                {booking.bookingType === "hourly" ? "Hourly" : "Full Day"}
                              </p>
                        </div>
                      </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300 font-medium">Total Bookings</span>
                    <span className="text-white font-semibold">{dateBookings.length} date{dateBookings.length !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300 font-medium">Total Seats</span>
                    <span className="text-white font-semibold">
                      {dateBookings.reduce((total, booking) => total + booking.seats, 0)} seat{dateBookings.reduce((total, booking) => total + booking.seats, 0) !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Pricing Breakdown */}
                  {dateBookings.length > 0 && (
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="text-white font-medium mb-3 text-sm">Pricing Breakdown</h4>
                      <div className="space-y-2 text-sm">
                        {dateBookings.map((booking, index) => {
                          const isHourly = booking.bookingType === "hourly"
                          const start = new Date(`2024-01-01 ${booking.startTime}`)
                          const end = new Date(`2024-01-01 ${booking.endTime}`)
                          const hours = isHourly ? Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60)) : 1
                          const rate = isHourly ? space.price_per_hour : space.price_per_day
                          const totalForThisBooking = rate * booking.seats * hours
                          
                          return (
                            <div key={index} className="border-b border-white/10 pb-2 last:border-b-0">
                              <div className="text-xs text-gray-400 mb-1">
                                {booking.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">
                                  {isHourly ? 'Hourly' : 'Daily'} × {booking.seats} seat{booking.seats !== 1 ? 's' : ''}
                                  {isHourly && ` × ${hours} hour${hours !== 1 ? 's' : ''}`}
                                </span>
                                <span className="text-gray-300">{formatCurrency(totalForThisBooking)}</span>
                            </div>
                            </div>
                          )
                        })}
                        
                        {/* Subtotal and Taxes */}
                        <div className="border-t border-white/20 pt-2 mt-3">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Subtotal</span>
                            <span className="text-white font-medium">{formatCurrency(calculateSubtotal())}</span>
                          </div>
                          {calculateTaxes().totalTaxAmount > 0 && (
                            <>
                              {calculateTaxes().taxBreakdown.map((tax, index) => (
                                <div key={index} className="flex justify-between">
                                  <span className="text-gray-300">{tax.name} ({tax.percentage}%)</span>
                                  <span className="text-white font-medium">{formatCurrency(tax.amount)}</span>
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-white/30 pt-4 mt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-white text-xl font-bold">Total</span>
                      <span className="text-white text-2xl font-bold">{formatCurrency(calculateTotal())}</span>
                    </div>
                    {dateBookings.length > 1 && (
                      <div className="text-xs text-gray-400 text-right mt-1">
                        Average: {formatCurrency(calculateTotal() / dateBookings.length)} per day
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {bookingStep === "payment" && (
          <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <ShieldCheck className="h-5 w-5 mr-2 text-green-400" />
                Secure Payment with Razorpay
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">{space.name}</span>
                    <span className="text-white">{formatCurrency(calculateTotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">
                      Date{selectedDates.length > 1 ? "s" : ""}:{" "}
                      {selectedDates.map((d) => d.toLocaleDateString()).join(", ")}
                    </span>
                    <span className="text-white">{seatsRequired} seat(s)</span>
                  </div>
                  {selectedDates.length > 1 && (
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Total Days</span>
                      <span>{selectedDates.length}</span>
                    </div>
                  )}
                  <div className="border-t border-white/20 pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-white">Total Amount</span>
                      <span className="text-white">{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-300">
                <Lock className="h-4 w-4" />
                <span>256-bit SSL secured payment</span>
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-3 gap-4 py-4">
                <div className="flex items-center justify-center p-3 bg-white/5 rounded-lg border border-white/10">
                  <CreditCard className="h-6 w-6 text-gray-300" />
                </div>
                <div className="flex items-center justify-center p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-xs font-bold text-gray-300">UPI</span>
                </div>
                <div className="flex items-center justify-center p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-xs font-bold text-gray-300">Wallet</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-300 mb-4 text-sm">You will be redirected to Razorpay secure payment gateway</p>
                <Button
                  onClick={handlePayment}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    `Pay ${formatCurrency(calculateTotal())} with Razorpay`
                  )}
                </Button>
                <p className="text-xs text-gray-400 mt-2">Powered by Razorpay • Trusted by millions</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
