'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  X, 
  QrCode, 
  Search, 
  Filter, 
  Eye,
  User,
  Building,
  DollarSign,
  Copy,
  CheckIcon,
  Activity,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import QRCode from 'qrcode'
import { QRScanner } from '@/components/ui/qr-scanner'

interface OwnerBooking {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  date: string
  start_time: string
  end_time: string
  amount: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  redemption_code?: string
  qr_code_data?: string
  is_redeemed?: boolean
  redeemed_at?: string
  space_name: string
  duration_hours: number
  created_at: string
}

interface BookingManagementProps {
  className?: string
}

export function BookingManagement({ className }: BookingManagementProps) {
  const [bookings, setBookings] = useState<OwnerBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedBooking, setSelectedBooking] = useState<OwnerBooking | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [copiedCode, setCopiedCode] = useState<string>('')
  const [redemptionCode, setRedemptionCode] = useState<string>('')
  const [isRedeeming, setIsRedeeming] = useState(false)

  // Fetch owner bookings
  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/owner/bookings')
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }
      
      const data = await response.json()
      setBookings(data.bookings || [])
    } catch (err: any) {
      console.error('Error fetching bookings:', err)
      setError(err.message)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  // Update booking status
  const updateBookingStatus = async (bookingId: string, action: string) => {
    try {
      const response = await fetch('/api/owner/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          booking_id: bookingId,
          action
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update booking')
      }

      const data = await response.json()
      
      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: data.booking.status as any }
            : booking
        )
      )
      
      toast.success(`Booking ${action}ed successfully`)
    } catch (err: any) {
      console.error('Error updating booking:', err)
      toast.error(`Failed to ${action} booking`)
    }
  }

  // Generate QR code for booking
  const generateQRCode = async (booking: OwnerBooking) => {
    try {
      const qrData = booking.qr_code_data || booking.redemption_code || booking.id
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCodeUrl(qrCodeDataURL)
      setSelectedBooking(booking)
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

  // Redeem booking by code
  const redeemBooking = async (code?: string) => {
    const codeToRedeem = code || redemptionCode.trim()
    
    if (!codeToRedeem) {
      toast.error('Please enter a redemption code')
      return
    }

    try {
      setIsRedeeming(true)
      const response = await fetch('/api/owner/redeem-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          redemption_code: codeToRedeem
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to redeem booking')
      }

      const data = await response.json()
      
      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === data.booking.id 
            ? { ...booking, is_redeemed: true, redeemed_at: data.booking.redeemed_at }
            : booking
        )
      )
      
      setRedemptionCode('')
      toast.success('Booking redeemed successfully!')
    } catch (err: any) {
      console.error('Error redeeming booking:', err)
      toast.error(err.message || 'Failed to redeem booking')
    } finally {
      setIsRedeeming(false)
    }
  }

  // Handle QR code scan result
  const handleQRScan = (result: string) => {
    console.log('QR Code scanned:', result)
    redeemBooking(result)
  }

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.space_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.redemption_code?.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesStatus = true
    if (statusFilter === 'redeemed') {
      matchesStatus = booking.is_redeemed === true
    } else if (statusFilter !== 'all') {
      matchesStatus = booking.status === statusFilter
    }
    
    return matchesSearch && matchesStatus
  })

  // Get status color
  const getStatusColor = (booking: any) => {
    if (booking.is_redeemed) {
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }
    
    switch (booking.status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  // Get stats
  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    completed: bookings.filter(b => b.is_redeemed).length, // Only redeemed bookings are completed
    revenue: bookings
      .filter(b => b.is_redeemed) // Only redeemed bookings count for revenue
      .reduce((sum, b) => sum + b.amount, 0)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-white/10 backdrop-blur-xl border-white/20 animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-white/10 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-white/10 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="bg-white/10 backdrop-blur-xl border-white/20">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <h3 className="text-xl font-semibold text-white mb-2">Error Loading Bookings</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={fetchBookings} className="bg-blue-600 hover:bg-blue-700">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl">
          <CardContent className="p-6 text-center pt-4">
            <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-gray-400 text-sm">Total</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl">
          <CardContent className="p-6 text-center pt-4">
            <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.pending}</p>
            <p className="text-gray-400 text-sm">Pending</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl">
          <CardContent className="p-6 text-center pt-4">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.confirmed}</p>
            <p className="text-gray-400 text-sm">Confirmed</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl">
          <CardContent className="p-6 text-center pt-4">
            <Activity className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.completed}</p>
            <p className="text-gray-400 text-sm">Completed</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl">
          <CardContent className="p-6 text-center pt-4">
            <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">₹{stats.revenue.toLocaleString()}</p>
            <p className="text-gray-400 text-sm">Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by customer, space, or redemption code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="redeemed">Redeemed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Redemption Section */}
      <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <QrCode className="w-6 h-6" />
            Redeem Booking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter redemption code to redeem booking..."
                value={redemptionCode}
                onChange={(e) => setRedemptionCode(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && redeemBooking()}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => redeemBooking()}
                disabled={isRedeeming || !redemptionCode.trim()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isRedeeming ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-spin" />
                    Redeeming...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Redeem
                  </>
                )}
              </Button>
              
              <QRScanner
                onScan={handleQRScan}
                onError={(error) => toast.error(`QR Scan Error: ${error}`)}
                trigger={
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-500/30"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Scan QR
                  </Button>
                }
              />
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Enter the redemption code provided by the customer to mark the booking as redeemed
          </p>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Booking Management
            <Badge className="ml-auto bg-blue-500/20 text-blue-400 border-blue-500/30">
              {filteredBookings.length} bookings
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <div key={booking.id} className="p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {booking.customer_name}
                        </h3>
                        <p className="text-gray-400 text-sm flex items-center gap-2 mt-1">
                          <Building className="w-4 h-4" />
                          {booking.space_name}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(booking)} px-3 py-1 text-sm font-medium`}>
                        {booking.is_redeemed ? 'Redeemed' : booking.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{new Date(booking.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{booking.start_time} - {booking.end_time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Activity className="w-4 h-4 text-gray-400" />
                        <span>{booking.duration_hours}h duration</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-400 font-semibold">
                      
                        <span>₹{booking.amount.toLocaleString()}</span>
                      </div>
                    </div>

                    {booking.redemption_code && (
                      <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                        <span className="text-gray-300 text-sm">Redemption Code:</span>
                        <code className="text-blue-400 font-mono text-sm bg-blue-500/10 px-2 py-1 rounded">
                          {booking.redemption_code}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyRedemptionCode(booking.redemption_code!)}
                          className="h-8 w-8 p-0 hover:bg-white/10"
                        >
                          {copiedCode === booking.redemption_code ? (
                            <CheckIcon className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:min-w-[150px]">
                    {booking.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateBookingStatus(booking.id, 'confirm')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateBookingStatus(booking.id, 'cancel')}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                      </>
                    )}
                    
                    
                    {(booking.redemption_code || booking.qr_code_data) && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateQRCode(booking)}
                            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                          >
                            <QrCode className="w-4 h-4 mr-1" />
                            QR Code
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900 border-white/20 text-white">
                          <DialogHeader>
                            <DialogTitle>QR Code - {selectedBooking?.customer_name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="text-center">
                              {qrCodeUrl && (
                                <img
                                  src={qrCodeUrl}
                                  alt="Booking QR Code"
                                  className="mx-auto rounded-lg"
                                  style={{ maxWidth: '256px' }}
                                />
                              )}
                            </div>
                            <div className="text-center space-y-2">
                              <p className="text-gray-400 text-sm">
                                Scan this QR code to redeem the booking
                              </p>
                              {selectedBooking?.redemption_code && (
                                <p className="text-blue-400 font-mono text-sm">
                                  Code: {selectedBooking.redemption_code}
                                </p>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-gray-300 text-xl font-semibold mb-2">
                  {searchTerm || statusFilter !== 'all' ? 'No matching bookings' : 'No bookings yet'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Bookings will appear here once customers start reserving your spaces'
                  }
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}