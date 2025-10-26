'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Wallet,
  Receipt,
  FileText,
  Download,
  Calendar,
  Eye,
  Percent,
  CreditCard
} from 'lucide-react'

interface RevenueData {
  financialOverview: {
    lastUpdated: string
    totalRevenue: {
      amount: number
      growth: number
      growthText: string
    }
    taxDeducted: {
      amount: number
      effectiveRate: number
      effectiveRateText: string
    }
    netProfit: {
      amount: number
      description: string
    }
    pendingPayout: {
      amount: number
      nextPayoutDate: string
      nextPayoutText: string
    }
    averagePayoutPerBooking: {
      amount: number
      description: string
    }
    totalBookings: {
      count: number
      period: string
    }
  }
  taxBreakdown: Array<{
    name: string
    rate: number
    description: string
    amount: number
    percentage: number
  }>
  totalTaxDeducted: {
    amount: number
    effectiveRate: number
    description: string
  }
  recentBookings: Array<{
    id: string
    bookingReference: string
    spaceName: string
    customerName: string
    date: string
    startTime: string
    endTime: string
    baseAmount: number
    totalAmount: number
    taxAmount: number
    ownerPayout: number
    status: string
    isRedeemed: boolean
    createdAt: string
  }>
  summary: {
    totalRevenue: number
    totalTaxCollected: number
    totalPlatformCommission: number
    totalOwnerPayout: number
    netProfit: number
    effectiveTaxRate: number
    averagePayoutPerBooking: number
    totalPayouts: number
    pendingPayouts: number
    totalBookings: number
    completedBookings: number
    currentYearBookings: number
  }
}

interface OwnerFinancialDashboardProps {
  ownerId: string
  className?: string
}

export function OwnerFinancialDashboard({ ownerId, className }: OwnerFinancialDashboardProps) {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAllBookings, setShowAllBookings] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        console.log('🔍 Fetching revenue data from /api/owner/revenue')
        const response = await fetch('/api/owner/revenue', {
          method: 'GET',
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        console.log('🔍 Revenue API response:', result)
        
        if (result.success && result.data) {
          setRevenueData(result.data)
        } else {
          throw new Error(result.error || 'Failed to fetch revenue data')
        }
      } catch (error) {
        console.error('Error fetching revenue data:', error)
        setError(error instanceof Error ? error.message : 'Failed to load revenue data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRevenueData()
  }, [ownerId])

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-8">
          <p className="text-red-400">Error loading financial data: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!revenueData) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-8">
          <p className="text-gray-400">No financial data available</p>
        </div>
      </div>
    )
  }

  const { financialOverview, taxBreakdown, recentBookings } = revenueData

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-green-400" />
            Financial Overview
          </h2>
          <p className="text-gray-400 mt-1">
            Last updated: {new Date(financialOverview.lastUpdated).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-500/30"
            onClick={() => {
              // Generate and download a financial report
              const reportData = {
                period: 'Current Month',
                totalRevenue: financialOverview.totalRevenue.amount,
                taxDeducted: financialOverview.taxDeducted.amount,
                netProfit: financialOverview.netProfit.amount,
                pendingPayout: financialOverview.pendingPayout.amount,
                totalBookings: financialOverview.totalBookings.count,
                generatedAt: new Date().toISOString()
              }
              
              const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `financial-report-${new Date().toISOString().split('T')[0]}.json`
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              URL.revokeObjectURL(url)
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

    

      {/* Tax Breakdown */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-red-400" />
            Tax Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {taxBreakdown.map((tax, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <div>
                  <h4 className="text-white font-semibold">{tax.name} ({tax.rate}%)</h4>
                  <p className="text-gray-400 text-sm">{tax.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-red-300 font-semibold">
                    ₹{(tax.amount / 1000).toFixed(1)}K
                  </p>
                  <p className="text-gray-400 text-sm">
                    {tax.percentage.toFixed(1)}% of total
                  </p>
                </div>
              </div>
            ))}

            <div className="border-t border-gray-600 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-bold">{revenueData.totalTaxDeducted.description}</h4>
                  <p className="text-gray-400 text-sm">All taxes combined</p>
                </div>
                <div className="text-right">
                  <p className="text-red-300 font-bold text-lg">
                    ₹{(revenueData.totalTaxDeducted.amount / 1000).toFixed(1)}K
                  </p>
                  <p className="text-gray-400 text-sm">
                    {revenueData.totalTaxDeducted.effectiveRate.toFixed(1)}% effective rate
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Bookings with Tax Details */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Recent Bookings & Payouts
            </CardTitle>
            <Button 
              variant="ghost" 
              onClick={() => setShowAllBookings(!showAllBookings)}
              className="text-blue-400 hover:bg-blue-500/20"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showAllBookings ? 'Show Less' : 'View All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(showAllBookings ? recentBookings : recentBookings.slice(0, 3)).map((booking) => (
              <div key={booking.id} className="p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-white font-semibold">
                      Booking {booking.bookingReference}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {new Date(booking.date).toLocaleDateString()} • {booking.startTime} - {booking.endTime}
                    </p>
                  </div>
                  <Badge className={
                    booking.status === 'completed' 
                      ? 'bg-green-500/20 text-black border-green-500/30'
                      : booking.status === 'confirmed'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                  }>
                    {booking.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Base Amount</p>
                    <p className="text-white font-semibold">₹{booking.baseAmount}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Customer Paid</p>
                    <p className="text-blue-300 font-semibold">₹{booking.totalAmount}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Tax Collected</p>
                    <p className="text-red-300 font-semibold">₹{booking.taxAmount}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Your Payout</p>
                    <p className="text-green-300 font-semibold">₹{booking.ownerPayout}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}