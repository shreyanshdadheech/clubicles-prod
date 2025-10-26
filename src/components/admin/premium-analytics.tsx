'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdminAnalytics, OwnerEarnings } from '@/types'
import { 
  Crown, 
  Users, 
  TrendingUp, 
  DollarSign,
  PieChart,
  BarChart3,
  Award,
  Building,
  CalendarDays
} from 'lucide-react'

interface PremiumAnalyticsProps {
  className?: string
}

// Mock data - in real app, this would come from your backend
const mockAnalytics: AdminAnalytics = {
  premium_owners_count: 45,
  basic_owners_count: 123,
  premium_revenue_percentage: 68.5,
  total_tax_collected: 125000,
  top_earning_owners: [
    {
      owner_id: '1',
      owner_name: 'Mumbai Business Center',
      premium_plan: 'premium',
      total_revenue: 85000,
      total_tax: 12750,
      net_earnings: 72250,
      total_bookings: 156
    },
    {
      owner_id: '2',
      owner_name: 'Delhi Co-Working Hub',
      premium_plan: 'premium',
      total_revenue: 72000,
      total_tax: 10800,
      net_earnings: 61200,
      total_bookings: 134
    },
    {
      owner_id: '3',
      owner_name: 'Bangalore Tech Spaces',
      premium_plan: 'basic',
      total_revenue: 58000,
      total_tax: 8700,
      net_earnings: 49300,
      total_bookings: 98
    },
    {
      owner_id: '4',
      owner_name: 'Hyderabad Meeting Rooms',
      premium_plan: 'premium',
      total_revenue: 45000,
      total_tax: 6750,
      net_earnings: 38250,
      total_bookings: 87
    },
    {
      owner_id: '5',
      owner_name: 'Pune Event Spaces',
      premium_plan: 'basic',
      total_revenue: 42000,
      total_tax: 6300,
      net_earnings: 35700,
      total_bookings: 76
    }
  ],
  monthly_tax_breakdown: [
    { month: 'January', year: 2025, total_tax: 18500, booking_count: 245 },
    { month: 'February', year: 2025, total_tax: 19200, booking_count: 267 },
    { month: 'March', year: 2025, total_tax: 21800, booking_count: 289 },
    { month: 'April', year: 2025, total_tax: 23400, booking_count: 312 },
    { month: 'May', year: 2025, total_tax: 25100, booking_count: 334 },
    { month: 'June', year: 2025, total_tax: 17000, booking_count: 198 }
  ]
}

export function PremiumAnalytics({ className }: PremiumAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AdminAnalytics>(mockAnalytics)
  const [isLoading, setIsLoading] = useState(true)
  const [isSendingReminders, setIsSendingReminders] = useState(false)

  const handleSendPaymentReminders = async () => {
    setIsSendingReminders(true)
    try {
      // In real app, make API call to send reminders
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Show success message
      alert(`Payment reminders sent to all ${analytics.premium_owners_count} premium owners successfully!`)
    } catch (error) {
      console.error('Failed to send payment reminders:', error)
      alert('Failed to send payment reminders. Please try again.')
    } finally {
      setIsSendingReminders(false)
    }
  }

  useEffect(() => {
    // In real app, fetch analytics from API
    const fetchAnalytics = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setAnalytics(mockAnalytics)
      setIsLoading(false)
    }

    fetchAnalytics()
  }, [])

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-64 mb-4"></div>
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

  const totalOwners = analytics.premium_owners_count + analytics.basic_owners_count
  const premiumPercentage = (analytics.premium_owners_count / totalOwners) * 100

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-400" />
            Premium Owner Analytics
          </h2>
          <p className="text-gray-400 mt-1">Detailed insights into premium vs basic space owners</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleSendPaymentReminders}
            disabled={isSendingReminders}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSendingReminders ? 'Sending...' : 'Send Payment Reminders'}
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
          <CardContent className="p-6 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Premium Owners</p>
                <p className="text-3xl font-bold text-white">{analytics.premium_owners_count}</p>
                <p className="text-yellow-400 text-xs font-semibold flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  {premiumPercentage.toFixed(1)}% of all owners
                </p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-full">
                <Crown className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
          <CardContent className="p-6 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Basic Owners</p>
                <p className="text-3xl font-bold text-white">{analytics.basic_owners_count}</p>
                <p className="text-blue-400 text-xs font-semibold">
                  {((analytics.basic_owners_count / totalOwners) * 100).toFixed(1)}% of all owners
                </p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-full">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
          <CardContent className="p-6 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Premium Revenue Share</p>
                <p className="text-3xl font-bold text-white">{analytics.premium_revenue_percentage}%</p>
                <p className="text-green-400 text-xs font-semibold">
                  Despite being {premiumPercentage.toFixed(0)}% of owners
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-full">
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
          <CardContent className="p-6 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Non-Renewed Subscriptions</p>
                <p className="text-3xl font-bold text-orange-400">12</p>
                <p className="text-red-400 text-xs font-semibold">
                  Expired in last 30 days
                </p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-full">
                <CalendarDays className="w-8 h-8 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expired Subscriptions Alert */}
      <Card className="bg-red-900/20 border-red-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-full">
                <CalendarDays className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Subscription Renewals Required</h3>
                <p className="text-red-300 text-sm">12 premium owners haven't renewed their subscriptions</p>
              </div>
            </div>
            <Button 
              onClick={handleSendPaymentReminders}
              disabled={isSendingReminders}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Send Renewal Reminders
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Top Earning Space Owners
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.top_earning_owners.map((owner, index) => (
              <div key={owner.owner_id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500 text-yellow-900' :
                    index === 1 ? 'bg-gray-400 text-gray-900' :
                    index === 2 ? 'bg-orange-500 text-orange-900' :
                    'bg-gray-600 text-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{owner.owner_name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={owner.premium_plan === 'premium' 
                        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' 
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      }>
                        {owner.premium_plan === 'premium' ? (
                          <>
                            <Crown className="w-3 h-3 mr-1" />
                            Premium
                          </>
                        ) : (
                          'Basic'
                        )}
                      </Badge>
                      <span className="text-gray-400 text-sm">
                        {owner.total_bookings} bookings
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">₹{(owner.total_revenue / 1000).toFixed(0)}K</p>
                  <p className="text-gray-400 text-sm">
                    Net: ₹{(owner.net_earnings / 1000).toFixed(0)}K
                  </p>
                  <p className="text-red-400 text-xs">
                    Tax: ₹{(owner.total_tax / 1000).toFixed(0)}K
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Tax Collection Trend */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Monthly Tax Collection Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.monthly_tax_breakdown.map((monthData, index) => {
              const maxTax = Math.max(...analytics.monthly_tax_breakdown.map(m => m.total_tax))
              const widthPercentage = (monthData.total_tax / maxTax) * 100
              
              return (
                <div key={`${monthData.month}-${monthData.year}`} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-medium">{monthData.month} {monthData.year}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-400 text-sm">
                        {monthData.booking_count} bookings
                      </span>
                      <span className="text-white font-semibold">
                        ₹{(monthData.total_tax / 1000).toFixed(1)}K
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${widthPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Premium vs Basic Comparison */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-green-400" />
              Revenue Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-gray-300">Premium Owners</span>
                </div>
                <span className="text-white font-semibold">{analytics.premium_revenue_percentage}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-yellow-500 h-3 rounded-full"
                  style={{ width: `${analytics.premium_revenue_percentage}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-gray-300">Basic Owners</span>
                </div>
                <span className="text-white font-semibold">{(100 - analytics.premium_revenue_percentage).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full"
                  style={{ width: `${100 - analytics.premium_revenue_percentage}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-orange-400" />
              Owner Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">Premium Owners</span>
                </div>
                <span className="text-white font-semibold">{analytics.premium_owners_count}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-yellow-500 h-3 rounded-full"
                  style={{ width: `${premiumPercentage}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">Basic Owners</span>
                </div>
                <span className="text-white font-semibold">{analytics.basic_owners_count}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full"
                  style={{ width: `${100 - premiumPercentage}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
