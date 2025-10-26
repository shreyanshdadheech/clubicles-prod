'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProfessionalBadge } from '@/components/ui/professional-selector'
import { Calendar, MapPin, Clock, Users, CreditCard, Settings, QrCode, Star } from 'lucide-react'
import { Booking, User, ProfessionalRole } from '@/types'

// Extended booking interface for user dashboard with flattened space data
interface UserDashboardBooking extends Omit<Booking, 'space'> {
  spaceName: string;
  spaceLocation: string;
  spaceCity: string;
  spaceImage: string;
}
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import Link from 'next/link'

// Mock Badge component
const BadgeComponent = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    variant === 'success' ? 'bg-green-100 text-green-800' : 
    variant === 'warning' ? 'bg-yellow-100 text-yellow-800' :
    variant === 'destructive' ? 'bg-red-100 text-red-800' :
    'bg-gray-100 text-gray-800'
  }`}>
    {children}
  </span>
)

interface UserDashboardProps {
  user: User
}

// Mock bookings data
const mockBookings: Booking[] = [
  {
    id: '1',
    userId: 'user1',
    spaceId: '1',
    startTime: '10:00',
    endTime: '14:00',
    date: '2025-08-15',
    seatsBooked: 2,
    baseAmount: 1360,
    taxAmount: 240,
    totalAmount: 1600,
    ownerPayout: 1290,
    status: 'confirmed',
    paymentId: 'pay_123',
    createdAt: '2025-08-05',
    updatedAt: '2025-08-05',
    space: {
      id: '1',
      name: 'TechHub Co-working',
      city: 'Bengaluru',
      address: '123 MG Road, Bengaluru',
      owner_id: 'owner1',
      description: '',
      pincode: '560001',
      total_seats: 50,
      available_seats: 15,
      price_per_hour: 200,
      price_per_day: 1500,
      amenities: [],
      images: [],
      status: 'approved',
      created_at: '2025-01-01',
      updated_at: '2025-01-01'
    }
  },
  {
    id: '2',
    userId: 'user1',
    spaceId: '2',
    startTime: '09:00',
    endTime: '17:00',
    date: '2025-08-20',
    seatsBooked: 1,
    baseAmount: 1020,
    taxAmount: 180,
    totalAmount: 1200,
    ownerPayout: 970,
    status: 'pending',
    createdAt: '2025-08-06',
    updatedAt: '2025-08-06',
    space: {
      id: '2',
      name: 'Creative Hub',
      city: 'Bengaluru',
      address: '456 Brigade Road, Bengaluru',
      owner_id: 'owner2',
      description: '',
      pincode: '560025',
      total_seats: 30,
      available_seats: 8,
      price_per_hour: 150,
      price_per_day: 1200,
      amenities: [],
      images: [],
      status: 'approved',
      created_at: '2025-01-01',
      updated_at: '2025-01-01'
    }
  }
]

// Payment interface
interface PaymentHistory {
  id: string
  amount: number
  currency: string
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  createdAt: string
  description: string
  bookingId: string
  paymentMethod: string
  transactionId: string
  spaceName: string
  spaceAddress: string
}

export function UserDashboard({ user }: UserDashboardProps) {
  const [bookings, setBookings] = useState<UserDashboardBooking[]>([])
  const [payments, setPayments] = useState<PaymentHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingPayments, setIsLoadingPayments] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'payments' | 'calendar' | 'profile' | 'settings'>('overview')
  const [showQR, setShowQR] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [lastRefresh, setLastRefresh] = useState(new Date().toISOString())

  // Fetch payment history
  const fetchPaymentHistory = async () => {
    if (!user?.id) return
    
    setIsLoadingPayments(true)
    try {
      const response = await fetch('/api/payments/history', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-cache' // Prevent caching
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          console.log('✅ Fetched payment history:', result.data.length)
          setPayments(result.data)
        } else {
          console.error('❌ Failed to fetch payments:', result.error)
          setPayments([])
        }
      } else {
        console.error('❌ Payment history API error:', response.status)
        setPayments([])
      }
    } catch (error) {
      console.error('❌ Error fetching payment history:', error)
      setPayments([])
    } finally {
      setIsLoadingPayments(false)
    }
  }

  useEffect(() => {
    // Fetch real user bookings from API
    const fetchUserBookings = async () => {
      if (!user?.id) return
      
      try {
        const response = await fetch(`/api/user/bookings?t=${Date.now()}`)
        const result = await response.json()

        if (response.ok && result.success) {
          console.log('✅ Fetched user bookings:', result.data.bookings.length)
          console.log('🔍 User dashboard booking data:', result.data.bookings)
          console.log('🔍 First booking spaceName:', result.data.bookings[0]?.spaceName)
          console.log('🔍 First booking spaceLocation:', result.data.bookings[0]?.spaceLocation)
          setBookings(result.data.bookings)
        } else {
          console.error('❌ Failed to fetch bookings:', result.error)
          setBookings([])
        }
      } catch (error) {
        console.error('❌ Error fetching bookings:', error)
        setBookings([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserBookings()
  }, [user?.id, user?.email, refreshKey])

  // Fetch payment history when payments tab is active or for overview stats
  useEffect(() => {
    if (activeTab === 'payments' || activeTab === 'overview') {
      console.log('🔍 Triggering payment fetch for tab:', activeTab)
      fetchPaymentHistory()
    }
  }, [activeTab, user?.id, refreshKey])

  // Force fetch payment data on component mount for overview
  useEffect(() => {
    if (user?.id && activeTab === 'overview') {
      console.log('🔍 Force fetching payments on overview tab load')
      fetchPaymentHistory()
    }
  }, [user?.id])

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    try {
      // TODO: Implement actual cancel booking API call
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' as const }
            : booking
        )
      )
      alert('Booking cancelled successfully')
    } catch (error) {
      alert('Failed to cancel booking')
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success'
      case 'pending':
        return 'warning'
      case 'cancelled':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'pending':
        return 'warning'
      case 'failed':
        return 'destructive'
      case 'refunded':
        return 'default'
      default:
        return 'default'
    }
  }

  const formatPaymentAmount = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount) // Amount is already in rupees
  }

  const upcomingBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day
    return bookingDate >= today && booking.status !== 'cancelled'
  })
  const pastBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day
    return bookingDate < today || booking.status === 'cancelled'
  })

  // Debug logging
  console.log('🔍 User dashboard bookings state:', bookings)
  console.log('🔍 Upcoming bookings:', upcomingBookings)
  console.log('🔍 Past bookings:', pastBookings)
  console.log('🔍 Payments state:', payments)
  console.log('🔍 Total spent calculation:', payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0))
  console.log('🔍 Active tab:', activeTab)
  console.log('🔍 isLoadingPayments:', isLoadingPayments)
  console.log('🔍 refreshKey:', refreshKey)

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email}!
        </h1>
        <p className="text-blue-100">
          {user.professional_role 
            ? '🌈 VIBGYOR Member - Enjoy exclusive benefits!'
            : 'Book your first space to unlock VIBGYOR membership!'
          }
        </p>
        <div className="flex gap-2 mt-4">
          <Button
            onClick={() => {
              setRefreshKey(prev => prev + 1)
              setLastRefresh(new Date().toISOString())
              console.log('🔄 Force refresh triggered at:', new Date().toISOString())
            }}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            🔄 Force Refresh
          </Button>
          <Button
            onClick={() => {
              setPayments([]) // Clear payments
              fetchPaymentHistory()
              setRefreshKey(prev => prev + 1)
              setLastRefresh(new Date().toISOString())
              console.log('💳 Payment refresh triggered at:', new Date().toISOString())
            }}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            💳 Clear & Reload Payments
          </Button>
        </div>
        <div className="text-xs text-blue-200 mt-2">
          Last refresh: {lastRefresh}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Calendar },
            { id: 'bookings', label: 'Bookings', icon: MapPin },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'calendar', label: 'Calendar', icon: Calendar },
            { id: 'profile', label: 'Profile', icon: Users },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingBookings.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              Total Spent
              {isLoadingPayments && <span className="text-xs text-blue-500">(Loading...)</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingPayments ? (
                <span className="text-gray-400">Loading...</span>
              ) : payments.length === 0 ? (
                <span className="text-gray-400">No payment data</span>
              ) : (
                formatCurrency(
                  payments
                    .filter(payment => payment.status === 'completed')
                    .reduce((sum, payment) => sum + payment.amount, 0)
                )
              )}
            </div>
            {payments.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                {payments.filter(p => p.status === 'completed').length} completed payments
              </div>
            )}
            {payments.length === 0 && !isLoadingPayments && (
              <div className="text-xs text-gray-500 mt-1">
                Click "Clear & Reload Payments" to load data
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Membership</CardTitle>
          </CardHeader>
          <CardContent>
            <BadgeComponent variant={user.professional_role ? 'success' : 'default'}>
              {user.professional_role ? 'VIBGYOR' : 'Grey'}
            </BadgeComponent>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No upcoming bookings</p>
              <Link href="/spaces">
                <Button>Book a Space</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{booking.spaceName || 'Unknown Space'}</h3>
                      <p className="text-sm text-gray-600">{booking.spaceLocation || 'Unknown Location'}</p>
                    </div>
                    <BadgeComponent variant={getStatusBadgeVariant(booking.status)}>
                      {booking.status}
                    </BadgeComponent>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <p className="font-medium">{formatDate(new Date(booking.date))}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Time:</span>
                      <p className="font-medium">{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Seats:</span>
                      <p className="font-medium">{booking.seatsBooked}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <p className="font-medium">{formatCurrency(booking.totalAmount)}</p>
                    </div>
                  </div>

                  {booking.status === 'confirmed' && (
                    <div className="mt-4 flex gap-2">
                      <Link href={`/spaces/${booking.spaceId}`}>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Past Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastBookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4 opacity-75">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{booking.spaceName || 'Unknown Space'}</h3>
                      <p className="text-sm text-gray-600">{formatDate(new Date(booking.date))}</p>
                    </div>
                    <BadgeComponent variant={getStatusBadgeVariant(booking.status)}>
                      {booking.status}
                    </BadgeComponent>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(booking.totalAmount)} • {booking.seatsBooked} seats
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500">All your bookings will appear here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingPayments ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading payment history...</p>
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">No payment history found</p>
                  <p className="text-sm text-gray-400">Your payment history will appear here after you make your first booking</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{payment.spaceName}</h3>
                          <p className="text-sm text-gray-600 mb-1">{payment.spaceAddress}</p>
                          <p className="text-sm text-gray-500">{payment.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            {formatPaymentAmount(payment.amount, payment.currency)}
                          </p>
                          <BadgeComponent variant={getPaymentStatusBadgeVariant(payment.status)}>
                            {payment.status}
                          </BadgeComponent>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Payment Date:</span>
                          <p className="font-medium">{formatDate(new Date(payment.createdAt))}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Payment Method:</span>
                          <p className="font-medium capitalize">{payment.paymentMethod}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Transaction ID:</span>
                          <p className="font-mono text-xs">{payment.transactionId}</p>
                        </div>
                      </div>

                      {payment.bookingId && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Booking ID:</span>
                            <span className="font-mono text-sm">{payment.bookingId}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Payment Summary */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-3">Payment Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total Payments:</span>
                        <p className="font-semibold text-lg">{payments.length}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Amount:</span>
                        <p className="font-semibold text-lg text-green-600">
                          {formatPaymentAmount(
                            payments.reduce((sum, payment) => sum + payment.amount, 0)
                          )}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Successful Payments:</span>
                        <p className="font-semibold text-lg">
                          {payments.filter(p => p.status === 'completed').length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Calendar integration coming soon!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {user.email}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {user.phone || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {user.city || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Membership</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <BadgeComponent variant={user.professional_role ? 'success' : 'default'}>
                      {user.professional_role ? 'Professional Member' : 'Grey Member'}
                    </BadgeComponent>
                  </div>
                </div>
                {user.professional_role && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Professional Role</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <ProfessionalBadge role={user.professional_role} />
                    </div>
                  </div>
                )}
              </div>
              <div className="pt-4">
                <Link href="/profile">
                  <Button>Edit Profile</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive booking confirmations and updates</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-gray-500">Get important alerts via SMS</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto-booking Reminders</p>
                      <p className="text-sm text-gray-500">Remind me to book regular spaces</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Security</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Change Password</p>
                      <p className="text-sm text-gray-500">Update your account password</p>
                    </div>
                    <Button variant="outline" size="sm">Change</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">Add extra security to your account</p>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Login History</p>
                      <p className="text-sm text-gray-500">View recent login activity</p>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4 text-red-600">Danger Zone</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Delete Account</p>
                      <p className="text-sm text-gray-500">Permanently delete your account and data</p>
                    </div>
                    <Button variant="destructive" size="sm">Delete</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
