'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProfessionalBadge } from '@/components/ui/professional-selector'
import {
  Calendar,
  MapPin,
  Clock,
  CreditCard,
  User,
  Building,
  Settings,
  LogOut,
  Star,
  Loader2
} from 'lucide-react'
import { User as UserType, Booking } from '@/types'

// Extended booking interface for dashboard with flattened space data
interface DashboardBooking extends Omit<Booking, 'space'> {
  space_name: string;
  space_location: string;
  space_city: string;
  space_image: string;
}
import { formatCurrency, formatDate, deleteCookie } from '@/lib/utils'
// Removed booking-actions-new import - using Prisma-based API
import { paymentService, PaymentSummary } from '@/lib/services/payment-service'
// Removed support-service import - using Prisma-based API
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

// User data will be fetched from AuthContext

export default function DashboardPage() {
  return <DashboardContent />
}

function DashboardContent() {
  const router = useRouter()
  const { signOut } = useAuth()
  const [user, setUser] = useState<UserType | null>(null)
  const [bookings, setBookings] = useState<DashboardBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingBookings, setIsLoadingBookings] = useState(true)
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null)
  const [supportSummary, setSupportSummary] = useState<any>(null)
  const [isLoadingPayments, setIsLoadingPayments] = useState(true)
  const [isLoadingSupport, setIsLoadingSupport] = useState(true)
  const [isSpaceOwner, setIsSpaceOwner] = useState<boolean>(false)
  const [bookingStats, setBookingStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    totalSpent: 0
  })
  const [reviews, setReviews] = useState<any[]>([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(true)
  
  // Get current user and check if they're a space owner
  const checkUserAndOwnership = async () => {
    try {
      console.log('🔍 Dashboard: Fetching user data from /api/auth/me')
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Dashboard: API response:', data)
        
        if (data.success && data.user) {
          const currentUser = data.user
          setUser(currentUser)

          // Check if user is admin first
          const adminEmails = [
            'shreyanshdadheech@gmail.com',
            'admin@clubicles.com',
            'yogesh.dubey.0804@gmail.com'
          ]
          
          if (adminEmails.includes(currentUser.email || '')) {
            console.log('🔍 Dashboard: User is admin, setting space owner to true')
            setIsSpaceOwner(true)
            return
          }

          // Check if user is a space owner based on role
          if (currentUser.roles === 'owner' || currentUser.roles === 'admin') {
            console.log('🔍 Dashboard: User is space owner, setting space owner to true')
            setIsSpaceOwner(true)
          } else {
            console.log('🔍 Dashboard: User is regular user, setting space owner to false')
            setIsSpaceOwner(false)
          }
        } else {
          console.log('🔍 Dashboard: No user data in response')
          setIsSpaceOwner(false)
        }
      } else {
        console.log('🔍 Dashboard: API call failed')
        setIsSpaceOwner(false)
      }
      
    } catch (err) {
      console.error('Error checking user/ownership:', err)
      setIsSpaceOwner(false)
    } finally {
      console.log('🔍 Dashboard: Setting loading to false')
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkUserAndOwnership()
  }, [])

  // Refresh data when page becomes visible (user returns from profile page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        console.log('🔍 Dashboard: Page became visible, refreshing user data')
        checkUserAndOwnership()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, []) // Remove [user] dependency to prevent infinite loops
  
  // Redirect space owners to /owner dashboard
  useEffect(() => {
    if (!isLoading && isSpaceOwner) {
      console.log('🔍 Dashboard: Redirecting space owner to /owner')
      window.location.href = '/owner'
    }
  }, [isSpaceOwner, isLoading])

  // Function to fetch user bookings
  const fetchUserBookings = async (userId: string) => {
    if (!userId) return
    
    setIsLoadingBookings(true)
    try {
      console.log('🔍 Dashboard: Fetching bookings for user:', userId)
      
      const response = await fetch('/api/user/bookings')
      const result = await response.json()

      if (response.ok && result.success) {
        console.log('✅ Dashboard: Fetched bookings:', result.data.bookings.length)
        console.log('🔍 Dashboard: First booking data:', result.data.bookings[0])
        console.log('🔍 Dashboard: First booking space_name:', result.data.bookings[0]?.space_name)
        setBookings(result.data.bookings)
        setBookingStats(result.data.stats)
      } else {
        console.error('❌ Dashboard: Failed to fetch bookings:', result.error)
        setBookings([])
        setBookingStats({ totalBookings: 0, upcomingBookings: 0, totalSpent: 0 })
      }
    } catch (error) {
      console.error('❌ Dashboard: Error fetching bookings:', error)
      setBookings([])
      setBookingStats({ totalBookings: 0, upcomingBookings: 0, totalSpent: 0 })
    } finally {
      setIsLoadingBookings(false)
    }
  }

  // Function to fetch payment summary
  const fetchPaymentSummary = async (userId: string) => {
    if (!userId) return
    
    setIsLoadingPayments(true)
    try {
      const result = await paymentService.getPaymentSummary(userId)
      if (result.success && result.data) {
        setPaymentSummary(result.data)
      } else {
        console.error('Failed to fetch payment summary:', result.error)
        setPaymentSummary(null)
      }
    } catch (error) {
      console.error('Error fetching payment summary:', error)
      setPaymentSummary(null)
    } finally {
      setIsLoadingPayments(false)
    }
  }

  // Function to fetch support summary
  const fetchSupportSummary = async (userId: string) => {
    if (!userId) return
    
    setIsLoadingSupport(true)
    try {
      const response = await fetch('/api/support/tickets')
      const result = await response.json()
      if (result.success && result.data) {
        // Create a mock support summary from the tickets data
        const supportSummary = {
          totalTickets: result.data.length,
          openTickets: result.data.filter((ticket: any) => ticket.status === 'open').length,
          resolvedTickets: result.data.filter((ticket: any) => ticket.status === 'resolved').length,
          lastTicketDate: result.data.length > 0 ? result.data[0].createdAt : null
        }
        setSupportSummary(supportSummary)
      } else {
        console.error('Failed to fetch support summary:', result.error)
        setSupportSummary(null)
      }
    } catch (error) {
      console.error('Error fetching support summary:', error)
      setSupportSummary(null)
    } finally {
      setIsLoadingSupport(false)
    }
  }

  // Function to fetch user reviews
  const fetchUserReviews = async (userId: string) => {
    if (!userId) return
    
    setIsLoadingReviews(true)
    try {
      const response = await fetch('/api/user/reviews')
      const result = await response.json()
      
      if (response.ok && result.success) {
        setReviews(result.data.reviews)
      } else {
        console.error('Failed to fetch reviews:', result.error)
        setReviews([])
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setReviews([])
    } finally {
      setIsLoadingReviews(false)
    }
  }

  useEffect(() => {
    console.log('🔍 Dashboard: User changed:', user)
    if (user && user.id) {
      console.log('🔍 Dashboard: Fetching user data')
      
      // Fetch user data only once when user is set
      fetchUserBookings(user.id)
      fetchPaymentSummary(user.id)
      fetchSupportSummary(user.id)
      fetchUserReviews(user.id)
    }
  }, [user?.id]) // Only depend on user.id to prevent infinite loops

  // Redirect owners to /owner dashboard
  useEffect(() => {
    if (user?.roles === 'owner') {
      console.log('Redirecting owner to /owner dashboard')
      router.replace('/owner')
      return
    }
  }, [user, router])

  // Don't render anything if redirecting
  if (user?.roles === 'owner') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-lg">Redirecting to owner dashboard...</div>
      </div>
    )
  }

  const upcomingBookings = bookings.filter(booking =>
    booking.status === 'confirmed' && new Date(booking.date) >= new Date()
  )

  const totalSpent = bookingStats.totalSpent || 0

  const handleLogout = async () => {
    try {
      console.log('🔍 Dashboard: Starting logout process')
      await signOut()
      console.log('🔍 Dashboard: SignOut completed, redirecting to home')
      window.location.href = '/'
    } catch (error) {
      console.error('🔍 Dashboard: Logout error:', error)
      // Force redirect even if signOut fails
      window.location.href = '/'
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <Link href="/" className="flex items-center space-x-2 min-w-0">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                  <img src="/logo.svg" alt="Clubicles Logo" className="w-10 h-10 sm:w-14 sm:h-14" />
                </div>
                <span className="font-orbitron text-lg sm:text-xl md:text-2xl font-black tracking-wider text-white truncate">
                  CLUBICLES
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-4 flex-shrink-0">
              <Link href="/spaces">
                <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white rounded-xl text-xs sm:text-sm px-2 sm:px-4">
                  <span className="hidden sm:inline">Browse Spaces</span>
                  <span className="sm:hidden">Browse</span>
                </Button>
              </Link>
             
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/10  hover:text-white  rounded-xl text-xs sm:text-sm px-2 sm:px-4"
                onClick={handleLogout}
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-2">
                  Welcome back, {`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User'}!
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-gray-300">
                  <div className="flex items-center min-w-0">
                    <User className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center min-w-0">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{user.city || 'Not set'}</span>
                  </div>
                  {user.professional_role && (
                    <div className="flex-shrink-0">
                      <ProfessionalBadge role={user.professional_role} />
                    </div>
                  )}
                </div>
              </div>
              <div className="hidden md:block flex-shrink-0 ml-4">
                <div className="w-20 h-20 bg-gradient-to-r from-white to-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-black" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Upcoming Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-white/70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{bookingStats.upcomingBookings}</div>
              <p className="text-xs text-gray-300">
                {bookingStats.upcomingBookings > 0 ? 'Upcoming bookings' : 'No upcoming bookings'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Spent</CardTitle>
              <CreditCard className="h-4 w-4 text-white/70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(totalSpent)}</div>
              <p className="text-xs text-gray-300">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Professional Role</CardTitle>
              <Star className="h-4 w-4 text-white/70" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-white capitalize mb-2 min-w-0">
                {user.professional_role ? (
                  <div className="overflow-hidden">
                    <ProfessionalBadge role={user.professional_role} size="lg" />
                  </div>
                ) : (
                  'Not Set'
                )}
              </div>
              <p className="text-xs text-gray-300">VIBGYOR Member</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings */}
        <div className="mb-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white text-xl">Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoadingBookings ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 animate-pulse">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-600 rounded-xl"></div>
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-gray-600 rounded"></div>
                            <div className="h-3 w-48 bg-gray-600 rounded"></div>
                          </div>
                        </div>
                        <div className="space-y-2 text-right">
                          <div className="h-4 w-16 bg-gray-600 rounded"></div>
                          <div className="h-3 w-12 bg-gray-600 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-300 text-lg font-medium mb-2">No bookings yet</p>
                    <p className="text-gray-400 text-sm mb-4">Start exploring workspaces to see your bookings here</p>
                    <Link href="/bookings">
                      <Button className="bg-white text-black hover:bg-gray-200 font-medium">
                        View All Bookings
                      </Button>
                    </Link>
                  </div>
                ) : (
                  bookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-white to-gray-300 rounded-xl flex items-center justify-center">
                          <Building className="h-6 w-6 text-black" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{booking.space_name || 'Unknown Space'}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-300">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(booking.date)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {booking.startTime}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">{formatCurrency(booking.totalAmount)}</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          booking.status === 'confirmed' 
                            ? 'bg-green-900/50 text-green-300' 
                            : booking.status === 'completed'
                            ? 'bg-blue-900/50 text-blue-300'
                            : 'bg-yellow-900/50 text-yellow-300'
                        }`}>
                          {booking.status}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {!isLoadingBookings && bookings.length > 0 && (
                <div className="mt-6 text-center">
                  <Link href="/bookings">
                    <Button variant="outline" className="border-white/30 text-black hover:text-white hover:bg-white/10 rounded-xl">
                      View All Bookings
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* My Reviews */}
        <div className="mb-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center">
                <Star className="h-5 w-5 mr-2" />
                My Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoadingReviews ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 animate-pulse">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-600 rounded-xl"></div>
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-gray-600 rounded"></div>
                            <div className="h-3 w-48 bg-gray-600 rounded"></div>
                          </div>
                        </div>
                        <div className="space-y-2 text-right">
                          <div className="h-4 w-16 bg-gray-600 rounded"></div>
                          <div className="h-3 w-12 bg-gray-600 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-300 text-lg font-medium mb-2">No reviews yet</p>
                    <p className="text-gray-400 text-sm mb-4">Complete a booking and redeem it to write a review</p>
                    <Link href="/spaces">
                      <Button className="bg-white text-black hover:bg-gray-200 font-medium">
                        Browse Spaces
                      </Button>
                    </Link>
                  </div>
                ) : (
                  reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-white to-gray-300 rounded-xl flex items-center justify-center">
                          <Building className="h-6 w-6 text-black" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{review.space.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-300">
                            <div className="flex items-center">
                              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                              {review.rating}/5
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(review.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm mt-1 line-clamp-2">
                            {review.review_text}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">{review.space.city}</div>
                        <div className="text-xs text-gray-400">
                          {review.updated_at ? 'Updated' : 'Created'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {!isLoadingReviews && reviews.length > 0 && (
                <div className="mt-6 text-center">
                  <Link href="/profile">
                    <Button variant="outline" className="border-white/30 text-black hover:text-white hover:bg-white/10 rounded-xl">
                      View All Reviews
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/spaces">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105 cursor-pointer">
              <CardContent className="p-6 text-center pt-8">
                <Building className="h-8 w-8 text-white mx-auto mb-4" />
                <h3 className="text-white font-medium mb-2">Book a Space</h3>
                <p className="text-gray-300 text-sm">Find workspaces</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105 cursor-pointer">
              <CardContent className="p-6 text-center  pt-8">
                <User className="h-8 w-8 text-white mx-auto mb-4" />
                <h3 className="text-white font-medium mb-2">Profile</h3>
                <p className="text-gray-300 text-sm">Manage your account settings</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/payments">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105 cursor-pointer">
              <CardContent className="p-6 text-center  pt-8">
                <CreditCard className="h-8 w-8 text-white mx-auto mb-4" />
                <h3 className="text-white font-medium mb-2">Payments</h3>
                {isLoadingPayments ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
                    <span className="text-gray-300 text-sm ml-2">Loading...</span>
                  </div>
                ) : paymentSummary ? (
                  <div className="text-gray-300 text-sm">
                    {paymentSummary.total_payments > 0 ? (
                      <div>
                        <p>Total: {formatCurrency(paymentSummary.total_amount)}</p>
                        <p>{paymentSummary.completed_payments} completed payments</p>
                        {paymentSummary.pending_payments > 0 && (
                          <p className="text-yellow-300">{paymentSummary.pending_payments} pending</p>
                        )}
                      </div>
                    ) : (
                      <p>No payments yet</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-300 text-sm">View payment history</p>
                )}
              </CardContent>
            </Card>
          </Link>

          <Link href="/support">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105 cursor-pointer">
              <CardContent className="p-6 text-center  pt-8">
                <Settings className="h-8 w-8 text-white mx-auto mb-4" />
                <h3 className="text-white font-medium mb-2">Support</h3>
                {isLoadingSupport ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
                    <span className="text-gray-300 text-sm ml-2">Loading...</span>
                  </div>
                ) : supportSummary ? (
                  <div className="text-gray-300 text-sm">
                    {supportSummary.total_tickets > 0 ? (
                      <div>
                        {supportSummary.open_tickets > 0 ? (
                          <p className="text-yellow-300">{supportSummary.open_tickets} open tickets</p>
                        ) : (
                          <p className="text-green-300">All tickets resolved</p>
                        )}
                      </div>
                    ) : (
                      <p>Need help? Get support</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-300 text-sm">Get help when you need it</p>
                )}
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
