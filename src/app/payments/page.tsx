'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, Calendar, Download, Search, Filter, 
  CheckCircle, XCircle, Clock, ArrowLeft, Receipt,
  DollarSign, TrendingUp, BarChart3
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { User as UserType } from '@/types'
import { paymentService } from '@/lib/services/payment-service'
import Link from 'next/link'

interface Payment {
  id: string
  booking_id: string
  space_name: string
  amount: number
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  payment_method: string
  date: string
  transaction_id: string
}

// Mock payments data
const mockPayments: Payment[] = [
  {
    id: '1',
    booking_id: 'book1',
    space_name: 'TechHub Co-working BKC',
    amount: 450,
    status: 'completed',
    payment_method: 'UPI',
    date: '2025-08-10T10:30:00Z',
    transaction_id: 'TXN123456789'
  },
  {
    id: '2',
    booking_id: 'book2',
    space_name: 'Creative Studio Koregaon',
    amount: 600,
    status: 'completed',
    payment_method: 'Credit Card',
    date: '2025-08-08T14:20:00Z',
    transaction_id: 'TXN123456788'
  },
  {
    id: '3',
    booking_id: 'book3',
    space_name: 'Executive Lounge Gurgaon',
    amount: 800,
    status: 'pending',
    payment_method: 'Net Banking',
    date: '2025-08-12T09:00:00Z',
    transaction_id: 'TXN123456787'
  },
  {
    id: '4',
    booking_id: 'book4',
    space_name: 'Innovation Hub Delhi',
    amount: 300,
    status: 'failed',
    payment_method: 'Debit Card',
    date: '2025-08-05T16:45:00Z',
    transaction_id: 'TXN123456786'
  },
  {
    id: '5',
    booking_id: 'book5',
    space_name: 'Design Studio Mumbai',
    amount: 250,
    status: 'refunded',
    payment_method: 'UPI',
    date: '2025-08-03T11:15:00Z',
    transaction_id: 'TXN123456785'
  }
]

export default function PaymentsPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [isLoadingPayments, setIsLoadingPayments] = useState(true)
  const [paymentsError, setPaymentsError] = useState<string | null>(null)

  // Function to fetch user payments
  const fetchUserPayments = async (userId: string) => {
    if (!userId) return
    
    setIsLoadingPayments(true)
    setPaymentsError(null)
    
    try {
      const paymentsResponse = await paymentService.getUserPayments(userId)
      if (paymentsResponse.success) {
        // Transform PaymentRecord to Payment format
        const transformedPayments: Payment[] = paymentsResponse.data.map(record => ({
          id: record.id,
          booking_id: record.booking_id || '',
          space_name: record.space_name || 'Unknown Space',
          amount: record.amount,
          status: record.status as 'completed' | 'pending' | 'failed' | 'refunded',
          payment_method: record.razorpay_payment_id ? 'Razorpay' : 'Online',
          date: record.created_at,
          transaction_id: record.razorpay_payment_id || record.id
        }))
        setPayments(transformedPayments)
        setFilteredPayments(transformedPayments)
      } else {
        throw new Error(paymentsResponse.error || 'Failed to fetch payments')
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
      setPaymentsError('Failed to load payment history')
      // Fallback to mock data
      setPayments(mockPayments)
      setFilteredPayments(mockPayments)
    } finally {
      setIsLoadingPayments(false)
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
            setUser(data.user)
            // Fetch user payments
            fetchUserPayments(data.user.id)
          } else {
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        setUser(null)
      }
    }
    
    getUser()
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterPayments(query, statusFilter)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    filterPayments(searchQuery, status)
  }

  const filterPayments = (query: string, status: string) => {
    let filtered = payments

    if (query) {
      filtered = filtered.filter(payment =>
        payment.space_name.toLowerCase().includes(query.toLowerCase()) ||
        payment.transaction_id.toLowerCase().includes(query.toLowerCase())
      )
    }

    if (status) {
      filtered = filtered.filter(payment => payment.status === status)
    }

    setFilteredPayments(filtered)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'refunded':
        return <Receipt className="w-4 h-4 text-blue-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'refunded':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const totalAmount = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
  const completedPayments = payments.filter(p => p.status === 'completed').length
  const pendingPayments = payments.filter(p => p.status === 'pending').length

  const exportToCSV = () => {
    const headers = ['Date', 'Space', 'Amount', 'Method', 'Status', 'Transaction ID']
    const csvData = filteredPayments.map(payment => [
      formatDate(payment.date),
      payment.space_name,
      formatCurrency(payment.amount),
      payment.payment_method,
      payment.status,
      payment.transaction_id
    ])

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `payments_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
                <div className="w-8 h-8 bg-gradient-to-r from-white to-gray-300 rounded-full"></div>
                <span className="text-xl font-semibold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Clubicles
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-4">
            Payment History
          </h1>
          <p className="text-gray-300 text-lg">
            {user?.first_name ? `${user.first_name} ${user.last_name || ''}'s payment history and transactions` : 'View payment history and manage transactions'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Spent</p>
                  <p className="text-white text-2xl font-bold">{formatCurrency(totalAmount)}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Completed</p>
                  <p className="text-white text-2xl font-bold">{completedPayments}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pending</p>
                  <p className="text-white text-2xl font-bold">{pendingPayments}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-gray-900/50 border-gray-700 mb-8">
          <CardContent className="p-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search payments..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>

              {/* Export Button */}
              <Button
                variant="outline"
                className="border-gray-600 text-black hover:bg-gray-800"
                onClick={exportToCSV}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Payment History</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {paymentsError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{paymentsError}</p>
              </div>
            )}
            
            {isLoadingPayments ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-gray-300 text-sm">Loading payment history...</p>
                </div>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-white font-medium mb-2">No Payments Found</h3>
                <p className="text-gray-400 text-sm mb-4">
                  {statusFilter || searchQuery 
                    ? 'No payments match your search criteria.' 
                    : "You haven't made any payments yet."}
                </p>
                {(!statusFilter && !searchQuery) && (
                  <Link href="/spaces">
                    <Button className="bg-white text-black hover:bg-gray-200">
                      Browse Spaces
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 font-medium pb-3">Date</th>
                    <th className="text-left text-gray-400 font-medium pb-3">Space</th>
                    <th className="text-left text-gray-400 font-medium pb-3">Amount</th>
                    <th className="text-left text-gray-400 font-medium pb-3">Method</th>
                    <th className="text-left text-gray-400 font-medium pb-3">Status</th>
                    <th className="text-left text-gray-400 font-medium pb-3">Transaction ID</th>
                    <th className="text-left text-gray-400 font-medium pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                      <td className="py-4 text-white">
                        {formatDate(payment.date)}
                      </td>
                      <td className="py-4 text-white">
                        {payment.space_name}
                      </td>
                      <td className="py-4 text-white font-medium">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="py-4 text-gray-300">
                        {payment.payment_method}
                      </td>
                      <td className="py-4">
                        <Badge className={`${getStatusColor(payment.status)} border`}>
                          <span className="flex items-center space-x-1">
                            {getStatusIcon(payment.status)}
                            <span className="capitalize">{payment.status}</span>
                          </span>
                        </Badge>
                      </td>
                      <td className="py-4 text-gray-300 font-mono text-sm">
                        {payment.transaction_id}
                      </td>
                      <td className="py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-600 text-black hover:bg-gray-800"
                          onClick={() => {
                            // Generate receipt for the payment
                            const receiptData = {
                              transactionId: payment.transaction_id,
                              spaceName: payment.space_name,
                              amount: payment.amount,
                              paymentMethod: payment.payment_method,
                              date: payment.date,
                              status: payment.status,
                              bookingId: payment.booking_id,
                              razorpayTrackerId: `rzp_${payment.transaction_id.toLowerCase()}`,
                              tax: {
                                gst: Math.round(payment.amount * 0.18),
                                serviceTax: Math.round(payment.amount * 0.05),
                                platformFee: Math.round(payment.amount * 0.03)
                              },
                              generatedAt: new Date().toISOString()
                            }
                            
                            const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: 'application/json' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `receipt-${payment.transaction_id}.json`
                            document.body.appendChild(a)
                            a.click()
                            document.body.removeChild(a)
                            URL.revokeObjectURL(url)
                          }}
                        >
                          <Receipt className="w-3 h-3 mr-1" />
                          Receipt
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
