'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { 
  CalendarDays, Clock, MapPin, Search, Filter, 
  CheckCircle, XCircle, Star, ArrowLeft, CreditCard,
  MessageSquare, User, Building, QrCode, Copy, ShieldCheck,
  CheckIcon
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { User as UserType, Booking as BookingType } from '@/types'
// Removed Supabase imports - using Prisma-based API
import Link from 'next/link'
import QRCode from 'qrcode'
import { toast } from 'sonner'

interface Booking {
  id: string
  space_id: string
  space_name: string
  space_location: string
  booking_date: string
  start_time: string
  end_time: string
  duration: number
  amount: number
  status: 'confirmed' | 'completed' | 'cancelled' | 'pending'
  created_at: string
  redemption_code?: string
  is_redeemed?: boolean
  redeemed_at?: string
  rating?: {
    overall: number
    cleanliness: number
    restroom_hygiene: number
    amenities: number
    staff_service: number
    wifi_quality: number
    comment: string
  }
}

// UI Booking interface for display
interface UIBooking {
  id: string
  spaceId: string
  space_name: string
  space_location: string
  booking_date: string
  startTime: string
  endTime: string
  duration: number
  amount: number
  status: string
  created_at: string
  redemption_code: string
  is_redeemed: boolean
  redeemed_at: string | null
  rating?: {
    overall: number
    cleanliness: number
    restroom_hygiene: number
    amenities: number
    staff_service: number
    wifi_quality: number
    comment: string
  }
}

// Transform database booking to UI booking format
const transformBookingForUI = (dbBooking: BookingType): UIBooking => {
  // Safely calculate duration with fallbacks
  let duration = 1 // Default to 1 hour
  if (dbBooking.startTime && dbBooking.endTime) {
    try {
      // Parse time strings properly (HH:MM format)
      const [startHour, startMin] = dbBooking.startTime.split(':').map(Number)
      const [endHour, endMin] = dbBooking.endTime.split(':').map(Number)
      
      console.log('🕐 TransformBookingForUI Duration calculation:', {
        bookingId: dbBooking.id,
        startTime: dbBooking.startTime,
        endTime: dbBooking.endTime,
        startHour, startMin, endHour, endMin
      })
      
      if (!isNaN(startHour) && !isNaN(startMin) && !isNaN(endHour) && !isNaN(endMin)) {
        const startMinutes = startHour * 60 + startMin
        const endMinutes = endHour * 60 + endMin
        const calculatedDuration = (endMinutes - startMinutes) / 60
        duration = Math.max(0.5, calculatedDuration) // Ensure at least 0.5 hours
        
        console.log('🕐 TransformBookingForUI Calculated duration:', {
          startMinutes, endMinutes, calculatedDuration, finalDuration: duration
        })
      }
    } catch (error) {
      console.warn('Error calculating duration for booking:', dbBooking.id, error)
      duration = 1
    }
  }

  console.log('🔄 Transforming booking:', {
    id: dbBooking.id,
    space: dbBooking.space,
    startTime: dbBooking.startTime,
    endTime: dbBooking.endTime,
    duration: duration,
    redemption_code: dbBooking.redemption_code
  })

  return {
    id: dbBooking.id,
    spaceId: dbBooking.spaceId,
    space_name: dbBooking.space?.name || 'Unknown Space',
    space_location: dbBooking.space ? `${dbBooking.space.address}, ${dbBooking.space.city}` : 'Unknown Location',
    booking_date: dbBooking.date,
    startTime: dbBooking.startTime || '09:00',
    endTime: dbBooking.endTime || '17:00',
    duration: duration,
    amount: Number(dbBooking.totalAmount) || 0,
    status: dbBooking.status as any,
    created_at: dbBooking.createdAt,
    redemption_code: dbBooking.redemption_code || '',
    is_redeemed: dbBooking.is_redeemed || false,
    redeemed_at: dbBooking.redeemed_at || null,
    // rating will be added later when we implement the rating system
  }
}

// Mock bookings data
const mockBookings: UIBooking[] = [
  {
    id: 'book1',
    spaceId: 'space1',
    space_name: 'TechHub Co-working Space',
    space_location: 'Bandra Kurla Complex, Mumbai',
    booking_date: '2025-08-15',
    startTime: '09:00',
    endTime: '17:00',
    duration: 8,
    amount: 450,
    status: 'completed',
    created_at: '2025-08-10T10:30:00Z',
    redemption_code: 'CLB-123456-ABC123',
    is_redeemed: true,
    redeemed_at: '2025-08-15T09:00:00Z'
  },
  {
    id: 'book2',
    spaceId: 'space2',
    space_name: 'Creative Studio',
    space_location: 'Koregaon Park, Pune',
    booking_date: '2025-08-20',
    startTime: '14:00',
    endTime: '18:00',
    duration: 4,
    amount: 600,
    status: 'completed',
    created_at: '2025-08-08T14:20:00Z',
    redemption_code: 'CLB-789012-DEF456',
    is_redeemed: false,
    redeemed_at: null
  },
  {
    id: 'book3',
    spaceId: 'space3',
    space_name: 'Executive Meeting Room',
    space_location: 'Cyber City, Gurgaon',
    booking_date: '2025-08-25',
    startTime: '10:00',
    endTime: '12:00',
    duration: 2,
    amount: 800,
    status: 'confirmed',
    created_at: '2025-08-12T09:00:00Z',
    redemption_code: 'CLB-345678-GHI789',
    is_redeemed: false,
    redeemed_at: null
  },
  {
    id: 'book4',
    spaceId: 'space4',
    space_name: 'Innovation Hub',
    space_location: 'Connaught Place, Delhi',
    booking_date: '2025-08-18',
    startTime: '16:00',
    endTime: '20:00',
    duration: 4,
    amount: 300,
    status: 'cancelled',
    created_at: '2025-08-05T16:45:00Z',
    redemption_code: 'CLB-901234-JKL012',
    is_redeemed: false,
    redeemed_at: null
  }
]

const ratingCategories = [
  { key: 'overall', label: 'Overall Experience' },
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'restroom_hygiene', label: 'Restroom Hygiene' },
  { key: 'amenities', label: 'Amenities' },
  { key: 'staff_service', label: 'Staff Service' },
  { key: 'wifi_quality', label: 'WiFi Quality' }
]

export default function BookingsPage() {
  return <BookingsContent />
}

function BookingsContent() {
  // Removed Supabase client - using Prisma-based API
  const [user, setUser] = useState<UserType | null>(null)
  const [bookings, setBookings] = useState<UIBooking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<UIBooking[]>([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedBooking, setSelectedBooking] = useState<UIBooking | null>(null)
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [rating, setRating] = useState({
    overall: 0,
    cleanliness: 0,
    restroom_hygiene: 0,
    amenities: 0,
    staff_service: 0,
    wifi_quality: 0,
    comment: ''
  })
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [selectedQrBooking, setSelectedQrBooking] = useState<UIBooking | null>(null)
  const [copiedCode, setCopiedCode] = useState<string>('')

  // Fetch user bookings from database
  const fetchUserBookings = async (userId: string) => {
    if (!userId) return
    
    setIsLoadingBookings(true)
    try {
      console.log('🔍 Fetching bookings for auth user ID:', userId)
      
      // Get current user from API
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include'
      })
      
      if (!response.ok) {
        console.error('❌ No active session found')
        setBookings([])
        setIsLoadingBookings(false)
        return
      }
      
      const data = await response.json()
      if (!data.success || !data.user) {
        console.error('❌ No user found')
        setBookings([])
        setIsLoadingBookings(false)
        return
      }

      console.log('✅ Active session found for user:', data.user.email)

      // Use the same API endpoint as dashboard
      const bookingsResponse = await fetch(`/api/user/bookings`, {
        method: 'GET',
        credentials: 'include'
      })
      const result = await bookingsResponse.json()

      let bookingsData = null

      if (bookingsResponse.ok && result.success && result.data) {
        console.log('✅ API Response successful:', result)
        bookingsData = result.data.bookings
      } else {
        console.error('❌ API Error:', result)
      }

      console.log('✅ Fetched bookings:', bookingsData?.length || 0, 'bookings')
      console.log('📋 Raw bookings data:', bookingsData)

      if (bookingsData && bookingsData.length > 0) {
        // Transform bookings to UI format
        const transformedBookings = bookingsData.map((booking: any) => {
          // Safely calculate duration with fallbacks
          let duration = 1 // Default to 1 hour
          if (booking.startTime && booking.endTime) {
            try {
              // Parse time strings properly (HH:MM format)
              const [startHour, startMin] = booking.startTime.split(':').map(Number)
              const [endHour, endMin] = booking.endTime.split(':').map(Number)
              
              if (!isNaN(startHour) && !isNaN(startMin) && !isNaN(endHour) && !isNaN(endMin)) {
                const startMinutes = startHour * 60 + startMin
                const endMinutes = endHour * 60 + endMin
                const calculatedDuration = (endMinutes - startMinutes) / 60
                duration = Math.max(0.5, calculatedDuration) // Ensure at least 0.5 hours
              }
            } catch (error) {
              console.warn('Error calculating duration for booking:', booking.id, error)
              duration = 1
            }
          }

          return {
            id: booking.id,
            spaceId: booking.spaceId,
            space_name: booking.space_name || 'Unknown Space',
            space_location: booking.space_location || 'Unknown Location',
            booking_date: booking.date || booking.booking_date || '',
            startTime: booking.startTime || '09:00',
            endTime: booking.endTime || '17:00',
            duration: duration,
            amount: booking.totalAmount || booking.total_amount || booking.amount || 0,
            status: booking.status || 'pending',
            created_at: booking.created_at || new Date().toISOString(),
            redemption_code: booking.redemption_code || '',
            is_redeemed: booking.is_redeemed || false,
            redeemed_at: booking.redeemed_at || null,
          }
        })

        console.log('✅ Transformed bookings:', transformedBookings)
        setBookings(transformedBookings)
        setFilteredBookings(transformedBookings)
      } else {
        console.log('ℹ️ No bookings found')
        setBookings([])
        setFilteredBookings([])
      }
    } catch (error) {
      console.error('❌ Error fetching bookings:', error)
      // Fallback to mock data for demo
      setBookings(mockBookings)
      setFilteredBookings(mockBookings)
    } finally {
      setIsLoadingBookings(false)
    }
  }

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            const userWithProfile: UserType = {
              id: data.user.id,
              auth_id: data.user.id,
              email: data.user.email || '',
              first_name: data.user.first_name || '',
              last_name: data.user.last_name || '',
              phone: data.user.phone || '',
              city: data.user.city || '',
              professional_role: data.user.professional_role || 'indigo',
              roles: data.user.roles || 'user',
              is_active: data.user.is_active || true,
              created_at: data.user.created_at || '',
              updated_at: data.user.updated_at || ''
            }
            setUser(userWithProfile)
            // Fetch bookings for this user
            await fetchUserBookings(data.user.id)
          }
        }
      } catch (error) {
        console.error('Error checking user:', error)
      }
    }
    getUser()

    // Removed Supabase auth state change listener - using Prisma-based API
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page when searching
    filterBookings(query, statusFilter)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1) // Reset to first page when filtering
    filterBookings(searchQuery, status)
  }

  const filterBookings = (query: string, status: string) => {
    let filtered = bookings

    if (query) {
      filtered = filtered.filter(booking =>
        booking.space_name.toLowerCase().includes(query.toLowerCase()) ||
        booking.space_location.toLowerCase().includes(query.toLowerCase())
      )
    }

    if (status) {
      filtered = filtered.filter(booking => booking.status === status)
    }

    setFilteredBookings(filtered)
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-blue-400" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const openRatingDialog = (booking: UIBooking) => {
    setSelectedBooking(booking)
    if (booking.rating) {
      setRating(booking.rating)
    } else {
      setRating({
        overall: 0,
        cleanliness: 0,
        restroom_hygiene: 0,
        amenities: 0,
        staff_service: 0,
        wifi_quality: 0,
        comment: ''
      })
    }
    setIsRatingDialogOpen(true)
  }

  const handleRatingChange = (category: string, value: number) => {
    setRating(prev => ({
      ...prev,
      [category]: value
    }))
  }

  const submitRating = async () => {
    if (!selectedBooking) return

    try {
      // Calculate overall rating from detailed ratings
      const detailedRatings = [
        rating.cleanliness,
        rating.restroom_hygiene,
        rating.amenities,
        rating.staff_service,
        rating.wifi_quality
      ].filter(r => r > 0)

      const overallRating = detailedRatings.length > 0 
        ? Math.round(detailedRatings.reduce((sum, r) => sum + r, 0) / detailedRatings.length)
        : rating.overall

      // Get the space ID from the booking data
      const spaceId = selectedBooking.spaceId
      
      const reviewData = {
        spaceId: spaceId,
        rating: overallRating,
        reviewText: rating.comment,
        overallExperience: rating.overall,
        cleanliness: rating.cleanliness,
        restroomHygiene: rating.restroom_hygiene,
        amenities: rating.amenities,
        staffService: rating.staff_service,
        wifiQuality: rating.wifi_quality
      }

      console.log('📝 Submitting review:', reviewData)

      // First try POST (for new reviews)
      let response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(reviewData)
      })

      let result = await response.json()

      // If POST fails with 409 (review already exists), try PUT (for updates)
      if (!result.success && response.status === 409) {
        console.log('📝 Review already exists, trying PUT to update...')
        response = await fetch('/api/reviews', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(reviewData)
        })
        result = await response.json()
      }

      if (result.success) {
        toast.success('Review submitted successfully!')
        
        // Update local state
        const updatedBookings = bookings.map(booking => 
          booking.id === selectedBooking.id 
            ? { ...booking, rating: { ...rating, overall: overallRating } }
            : booking
        )
        setBookings(updatedBookings)
        setFilteredBookings(updatedBookings)
        
        setIsRatingDialogOpen(false)
        setSelectedBooking(null)
      } else {
        toast.error(result.error || 'Failed to submit review')
        console.error('❌ Review submission failed:', result)
      }
    } catch (error) {
      console.error('❌ Error submitting review:', error)
      toast.error('An error occurred while submitting your review')
    }
  }

  const StarRating = ({ rating, onRatingChange, category }: { rating: number, onRatingChange: (value: number) => void, category: string }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRatingChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-400'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  // Generate QR code for booking
  const generateQRCode = async (booking: UIBooking) => {
    try {
      const qrData = booking.redemption_code || booking.id
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCodeUrl(qrCodeDataURL)
      setSelectedQrBooking(booking)
    } catch (err) {
      console.error('Error generating QR code:', err)
      toast.error('Failed to generate QR code')
    }
  }

  // Copy redemption code
  const copyRedemptionCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      toast.success('Redemption code copied!')
      
      setTimeout(() => setCopiedCode(''), 2000)
    } catch (err) {
      toast.error('Failed to copy code')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2 text-gray-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <img src="/logo.svg" alt="Clubicles Logo" className="w-8 h-8" />
                </div>
                <span className="font-orbitron text-xl font-black tracking-wider text-white">
                  CLUBICLES
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="relative">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent mb-6">
              My Bookings
            </h1>
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          </div>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto leading-relaxed">
            {user?.first_name || user?.last_name ? `Welcome back, ${user.first_name || ''} ${user.last_name || ''}! Manage your workspace reservations and share your experiences` : 'Manage your bookings and leave reviews for your workspace experiences'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50 hover:border-blue-600 transition-all duration-300">
            <CardContent className="p-6 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm font-medium">Total Bookings</p>
                  <p className="text-white text-2xl font-bold">{bookings.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Building className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700/50 hover:border-green-600 transition-all duration-300">
            <CardContent className="p-6 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200 text-sm font-medium">Completed</p>
                  <p className="text-white text-2xl font-bold">{bookings.filter(b => b.status === 'completed').length}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border-yellow-700/50 hover:border-yellow-600 transition-all duration-300">
            <CardContent className="p-6 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-200 text-sm font-medium">Upcoming</p>
                  <p className="text-white text-2xl font-bold">{bookings.filter(b => b.status === 'confirmed').length}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50 hover:border-purple-600 transition-all duration-300">
            <CardContent className="p-6 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm font-medium">Total Spent</p>
                  <p className="text-white text-2xl font-bold">{formatCurrency(bookings.filter(b => b.status === 'completed' || b.status === 'confirmed').reduce((sum, b) => {
                    console.log('💰 Total Spent calculation:', {
                      bookingId: b.id,
                      status: b.status,
                      amount: b.amount,
                      runningSum: sum
                    })
                    return sum + b.amount
                  }, 0))}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-gradient-to-r from-gray-900/60 to-gray-800/40 border-gray-700/50 backdrop-blur-sm mb-8 shadow-2xl">
          <CardContent className="p-8 pt-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Filter className="w-5 h-5 mr-2 text-blue-400" />
                Filter & Search
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Search */}
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                <Input
                  placeholder="Search by space name or location..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-12 pr-4 py-3 bg-gray-800/60 border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="w-full bg-gray-800/60 border border-gray-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="">All Status</option>
                  <option value="confirmed">✓ Confirmed</option>
                  <option value="completed">✓ Completed</option>
                  <option value="cancelled">✗ Cancelled</option>
                  <option value="pending">⏳ Pending</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-3">
                <Button
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('')
                    setFilteredBookings(bookings)
                  }}
                  variant="outline"
                  className="flex-1 border-gray-600 text-black hover:bg-gray-700 hover:border-gray-500 transition-all duration-200"
                >
                  Clear All
                </Button>
                <Button
                  onClick={() => {
                    // Open date picker functionality
                    const today = new Date().toISOString().split('T')[0]
                    alert(`Date filter functionality will be implemented. Today is: ${today}`)
                  }}
                  variant="outline"
                  className="px-4 border-blue-600 text-blue-400 hover:bg-blue-900/20 hover:border-blue-500 transition-all duration-200"
                >
                  <CalendarDays className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <div className="space-y-8">
          {isLoadingBookings ? (
            // Loading skeleton
            [1, 2, 3].map((i) => (
              <Card key={i} className="bg-gradient-to-r from-gray-900/80 to-gray-800/60 border-gray-700/50 backdrop-blur-sm animate-pulse">
                <CardContent className="p-8 pt-4">
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    <div className="xl:col-span-7 space-y-4">
                      <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-16 bg-gray-700 rounded"></div>
                        <div className="h-16 bg-gray-700 rounded"></div>
                      </div>
                    </div>
                    <div className="xl:col-span-5 space-y-4">
                      <div className="h-8 bg-gray-700 rounded w-1/3"></div>
                      <div className="h-12 bg-gray-700 rounded"></div>
                      <div className="h-10 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            paginatedBookings.map((booking, index) => (
            <Card key={booking.id} className="group bg-gradient-to-r from-gray-900/80 to-gray-800/60 border-gray-700/50 hover:border-gray-600/80 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 backdrop-blur-sm">
              <CardContent className="p-8 pt-4">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                  {/* Booking Details */}
                  <div className="xl:col-span-7">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <h3 className="text-white text-xl font-bold group-hover:text-blue-300 transition-colors">
                            {booking.space_name}
                          </h3>
                        </div>
                        <p className="text-gray-400 flex items-center text-sm">
                          <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                          {booking.space_location}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(booking.status)} border px-4 py-2 text-sm font-medium`}>
                        <span className="flex items-center space-x-2">
                          {getStatusIcon(booking.status)}
                          <span className="capitalize">{booking.status}</span>
                        </span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 bg-gray-800/40 rounded-lg border border-gray-700/50">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <CalendarDays className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs uppercase tracking-wide">Date</p>
                            <p className="text-white font-medium">{formatDate(booking.booking_date)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 p-3 bg-gray-800/40 rounded-lg border border-gray-700/50">
                          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs uppercase tracking-wide">Duration</p>
                            <p className="text-white font-medium">{booking.duration} hours</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 bg-gray-800/40 rounded-lg border border-gray-700/50">
                          <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                            <Clock className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs uppercase tracking-wide">Time</p>
                            <p className="text-white font-medium">{booking.startTime || '09:00'} - {booking.endTime || '17:00'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 p-3 bg-gray-800/40 rounded-lg border border-gray-700/50">
                          <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-yellow-400" />
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs uppercase tracking-wide">Amount</p>
                            <p className="text-white font-bold text-lg">{formatCurrency(booking.amount)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Redemption Code Section */}
                    {booking.redemption_code && (
                      <div className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-white font-medium flex items-center">
                            <QrCode className="w-4 h-4 mr-2 text-green-400" />
                            Booking Access Code
                          </h4>
                          <Badge className={`${booking.is_redeemed ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'} text-xs px-2 py-1`}>
                            {booking.is_redeemed ? 'Redeemed' : 'Pending'}
                          </Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <code className="flex-1 bg-black/30 px-3 py-2 rounded font-mono text-green-400 text-sm border border-gray-600">
                            {booking.redemption_code}
                          </code>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                              onClick={() => copyRedemptionCode(booking.redemption_code!)}
                            >
                              {copiedCode === booking.redemption_code ? (
                                <CheckIcon className="w-3 h-3 mr-1" />
                              ) : (
                                <Copy className="w-3 h-3 mr-1" />
                              )}
                              {copiedCode === booking.redemption_code ? 'Copied!' : 'Copy'}
                            </Button>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                  onClick={() => generateQRCode(booking)}
                                >
                                  <QrCode className="w-3 h-3 mr-1" />
                                  Show QR
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-gray-900 border-white/20 text-white max-w-md">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <QrCode className="w-5 h-5 text-blue-400" />
                                    QR Code - {booking.space_name}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 p-2">
                                  <div className="text-center">
                                    {qrCodeUrl && selectedQrBooking?.id === booking.id && (
                                      <img
                                        src={qrCodeUrl}
                                        alt="Booking QR Code"
                                        className="mx-auto rounded-lg border border-white/20"
                                        style={{ maxWidth: '256px', width: '100%' }}
                                      />
                                    )}
                                  </div>
                                  <div className="text-center space-y-3">
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                      <p className="text-gray-400 text-sm mb-2">Redemption Code:</p>
                                      <code className="text-blue-400 font-mono text-sm bg-blue-500/10 px-3 py-2 rounded border border-blue-500/20">
                                        {booking.redemption_code}
                                      </code>
                                    </div>
                                    <div className="text-gray-400 text-sm space-y-1">
                                      <p>📱 Show this QR code to the space owner</p>
                                      <p>🔍 Or let them scan it with their phone</p>
                                      <p className="text-xs">Booking: {booking.space_name}</p>
                                      <p className="text-xs">Date: {new Date(booking.booking_date).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                        {booking.is_redeemed && booking.redeemed_at && (
                          <p className="text-gray-400 text-xs mt-3 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            Redeemed on {new Date(booking.redeemed_at).toLocaleDateString()}
                          </p>
                        )}
                        {!booking.is_redeemed && (
                          <p className="text-blue-400 text-xs mt-3 flex items-center gap-1">
                            <QrCode className="w-3 h-3" />
                            Show this QR code at the venue to complete your booking
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Rating Display */}
                  <div className="xl:col-span-3">
                    {booking.rating ? (
                      <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 p-6 rounded-xl border border-gray-600/50 h-full">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-gray-300 font-medium">Your Review</span>
                          <div className="flex items-center space-x-2 bg-yellow-500/20 px-3 py-1 rounded-full">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-yellow-400 font-bold">{booking.rating.overall}/5</span>
                          </div>
                        </div>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Restroom Hygiene</span>
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className={`w-3 h-3 ${star <= booking.rating!.restroom_hygiene ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Cleanliness</span>
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className={`w-3 h-3 ${star <= booking.rating!.cleanliness ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Amenities</span>
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className={`w-3 h-3 ${star <= booking.rating!.amenities ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                              ))}
                            </div>
                          </div>
                          {booking.rating.comment && (
                            <div className="mt-4 p-3 bg-gray-900/60 rounded-lg border border-gray-600/30">
                              <p className="text-gray-300 text-xs italic">"{booking.rating.comment}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : booking.status === 'completed' ? (
                      <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 p-6 rounded-xl text-center border border-blue-700/30 h-full flex flex-col justify-center">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <MessageSquare className="w-8 h-8 text-blue-400" />
                        </div>
                        <p className="text-gray-300 text-sm mb-4 font-medium">Share your experience</p>
                        <Button
                          onClick={() => openRatingDialog(booking)}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200"
                        >
                          Leave Review
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50 h-full flex items-center justify-center">
                        <p className="text-gray-500 text-center">Complete your booking to leave a review</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="xl:col-span-2">
                    <div className="space-y-3 h-full flex flex-col">
                      {booking.status === 'completed' && booking.rating && (
                        <Button
                          onClick={() => openRatingDialog(booking)}
                          variant="outline"
                          className="w-full border-blue-600/50 text-blue-400 hover:bg-blue-900/30 hover:border-blue-500 transition-all duration-200"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Edit Review
                        </Button>
                      )}
                      {booking.status === 'confirmed' && (
                        <Button
                          variant="outline"
                          className="w-full border-red-600/50 text-red-400 hover:bg-red-900/30 hover:border-red-500 transition-all duration-200"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel Booking
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="w-full border-gray-600/50 text-gray-400 hover:bg-gray-800/50 hover:border-gray-500 transition-all duration-200"
                      >
                        View Details
                      </Button>
                      <div className="flex-1 flex items-end">
                        <div className="w-full text-center py-2">
                          <p className="text-xs text-gray-500">
                            Booked {new Date(booking.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
          )}
        </div>

        {/* Pagination Controls */}
        {!isLoadingBookings && filteredBookings.length > itemsPerPage && (
          <div className="flex items-center justify-between mt-8">
            <div className="text-gray-400 text-sm">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredBookings.length)} of {filteredBookings.length} bookings
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="border-gray-600 text-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1
                  if (totalPages <= 5) {
                    return pageNum
                  }
                  
                  // Show first page, current page area, and last page
                  if (currentPage <= 3) {
                    return i < 4 ? pageNum : totalPages
                  } else if (currentPage >= totalPages - 2) {
                    return i === 0 ? 1 : totalPages - 4 + i
                  } else {
                    return currentPage - 2 + i
                  }
                }).map((pageNum, index) => (
                  <Button
                    key={index}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 p-0 ${
                      pageNum === currentPage
                        ? "bg-blue-600 text-white"
                        : "border-gray-600 text-gray-300 hover:bg-gray-800"
                    }`}
                  >
                    {pageNum}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="border-gray-600 text-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {!isLoadingBookings && filteredBookings.length === 0 && (
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-12 pt-4">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building className="w-12 h-12 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Bookings Found</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  {searchQuery || statusFilter 
                    ? "No bookings match your current filters. Try adjusting your search criteria."
                    : "You haven't made any bookings yet. Start exploring amazing workspaces!"
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    onClick={() => {
                      setSearchQuery('')
                      setStatusFilter('')
                      setFilteredBookings(bookings)
                    }}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-200"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                  {!searchQuery && !statusFilter && (
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-200">
                      <CalendarDays className="w-4 h-4 mr-2" />
                      Browse Spaces
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Rating Dialog */}
      <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
        <DialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700/50 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6 border-b border-gray-700/50">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent flex items-center">
              <Star className="w-6 h-6 mr-2 text-yellow-400" />
              {selectedBooking?.rating ? 'Edit Your Review' : 'Rate Your Experience'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-8">
              {/* Booking Summary */}
              <div className="bg-gradient-to-r from-gray-800/60 to-gray-700/40 p-6 rounded-xl border border-gray-600/30">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-2">{selectedBooking.space_name}</h3>
                    <div className="space-y-2">
                      <p className="text-gray-300 text-sm flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        {selectedBooking.space_location}
                      </p>
                      <p className="text-gray-300 text-sm flex items-center">
                        <CalendarDays className="w-4 h-4 mr-2 text-gray-400" />
                        {formatDate(selectedBooking.booking_date)}
                      </p>
                      <p className="text-gray-300 text-sm flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        {selectedBooking.startTime || '09:00'} - {selectedBooking.endTime || '17:00'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Amount Paid</p>
                    <p className="text-white font-bold text-lg">{formatCurrency(selectedBooking.amount)}</p>
                  </div>
                </div>
              </div>

              {/* Rating Categories */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-white flex items-center">
                  <Star className="w-5 h-5 mr-2 text-blue-400" />
                  Rate Different Aspects
                </h4>
                <div className="grid grid-cols-1 gap-6">
                  {ratingCategories.map((category, index) => (
                    <div key={category.key} className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                      category.key === 'restroom_hygiene' 
                        ? 'bg-blue-900/20 border-blue-700/50 ring-2 ring-blue-500/20' 
                        : 'bg-gray-800/40 border-gray-600/30 hover:border-gray-500/50'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          category.key === 'overall' ? 'bg-yellow-500/20' :
                          category.key === 'cleanliness' ? 'bg-green-500/20' :
                          category.key === 'restroom_hygiene' ? 'bg-blue-500/20' :
                          category.key === 'amenities' ? 'bg-purple-500/20' :
                          category.key === 'staff_service' ? 'bg-pink-500/20' :
                          'bg-cyan-500/20'
                        }`}>
                          {category.key === 'overall' && <Star className="w-5 h-5 text-yellow-400" />}
                          {category.key === 'cleanliness' && <CheckCircle className="w-5 h-5 text-green-400" />}
                          {category.key === 'restroom_hygiene' && <Building className="w-5 h-5 text-blue-400" />}
                          {category.key === 'amenities' && <CreditCard className="w-5 h-5 text-purple-400" />}
                          {category.key === 'staff_service' && <User className="w-5 h-5 text-pink-400" />}
                          {category.key === 'wifi_quality' && <MapPin className="w-5 h-5 text-cyan-400" />}
                        </div>
                        <div>
                          <span className="text-white font-medium">{category.label}</span>
                          {category.key === 'restroom_hygiene' && (
                            <p className="text-blue-400 text-xs">Special focus area</p>
                          )}
                        </div>
                      </div>
                      <StarRating
                        rating={rating[category.key as keyof typeof rating] as number}
                        onRatingChange={(value) => handleRatingChange(category.key, value)}
                        category={category.key}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-purple-400" />
                  Share Your Experience
                </h4>
                <Textarea
                  value={rating.comment}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRating(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Tell us about your experience at this workspace. What did you like? What could be improved?"
                  className="bg-gray-800/60 border-gray-600/50 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  rows={4}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-700/50">
                <Button
                  onClick={() => setIsRatingDialogOpen(false)}
                  variant="outline"
                  className="flex-1 border-gray-600/50 text-gray-300 hover:bg-gray-800/50 hover:border-gray-500 transition-all duration-200"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={submitRating}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {selectedBooking?.rating ? 'Update Review' : 'Submit Review'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
