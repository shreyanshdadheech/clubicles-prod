'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  DollarSign, 
  MessageSquare, 
  TrendingUp, 
  Lock, 
  Crown, 
  Star,
  CreditCard,
  LineChart,
  Bell,
  Users,
  MapPin
} from 'lucide-react'
import { PremiumPlan } from '@/types'
import Link from 'next/link'

import { OwnerDataService, type OwnerAnalyticsData } from '@/lib/services/owner-data-service'

interface PremiumFeaturesProps {
  userPlan?: PremiumPlan
  onUpgrade?: (plan: 'premium', billingCycle: 'monthly' | 'yearly') => void
  spaces?: any[]
  paymentHistory?: any[]
  businessBalance?: any
  paymentStats?: any
  isProcessingPayment?: boolean
  paymentError?: string
}

export function PremiumFeatures({ 
  userPlan = 'basic', 
  onUpgrade, 
  spaces = [], 
  paymentHistory = [],
  businessBalance,
  paymentStats,
  isProcessingPayment = false,
  paymentError = ''
}: PremiumFeaturesProps) {
  const [dynamicPricingEnabled, setDynamicPricingEnabled] = useState(false)
  const [premiumPaymentEnabled, setPremiumPaymentEnabled] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<OwnerAnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Load real analytics data for dynamic pricing
  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        const data = await OwnerDataService.getAnalyticsData()
        setAnalyticsData(data)
      } catch (error) {
        console.error('Error loading analytics data for premium features:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (userPlan === 'premium') {
      loadAnalyticsData()
    } else {
      setIsLoading(false)
    }
  }, [userPlan])
  
  
  // Dynamic pricing state
  const [pricingSuggestions, setPricingSuggestions] = useState<Record<string, number>>({})
  const [demandAnalysis, setDemandAnalysis] = useState<any[]>([])

  const isPremium = userPlan === 'premium'

  // Calculate dynamic pricing based on demand and supply
  const calculateDynamicPricing = (basePrice: number, city: string) => {
    if (!analyticsData) return basePrice

    // Use real analytics data for pricing calculations
    const { occupancyRate, totalBookings, completedBookings } = analyticsData
    
    // Pricing algorithm based on business logic:
    // - High occupancy (>80%) = increase price by 15-25%
    // - Medium occupancy (60-80%) = slight increase 5-15%
    // - Low occupancy (<60%) = decrease price by 5-15%
    
    let multiplier = 1
    
    if (occupancyRate > 80) {
      multiplier = 1.15 + (occupancyRate - 80) * 0.005 // 1.15 to 1.25
    } else if (occupancyRate >= 60) {
      multiplier = 1.05 + (occupancyRate - 60) * 0.005 // 1.05 to 1.15
    } else {
      multiplier = 0.85 + (occupancyRate) * 0.003 // 0.85 to 1.03
    }
    
    // Factor in booking volume
    const bookingVolumeRatio = totalBookings > 0 ? completedBookings / totalBookings : 0.5
    multiplier *= (0.8 + bookingVolumeRatio * 0.4)
    
    return Math.round(basePrice * multiplier)
  }


  // Update dynamic pricing when enabled
  useEffect(() => {
    if (isPremium && dynamicPricingEnabled && spaces.length > 0 && analyticsData) {
      const suggestions: Record<string, number> = {}
      const analysis: any[] = []
      
      spaces.forEach(space => {
        const city = space.location?.split(',')[0] || 'Unknown'
        const newPrice = calculateDynamicPricing(space.hourlyRate, city)
        suggestions[space.id] = newPrice
        
        analysis.push({
          spaceId: space.id,
          spaceName: space.name,
          city,
          currentPrice: space.hourlyRate,
          suggestedPrice: newPrice,
          occupancyRate: analyticsData.occupancyRate,
          priceChange: ((newPrice - space.hourlyRate) / space.hourlyRate * 100).toFixed(1)
        })
      })
      
      setPricingSuggestions(suggestions)
      setDemandAnalysis(analysis)
    }
  }, [isPremium, dynamicPricingEnabled, spaces, analyticsData])

  const handleFeatureToggle = (feature: string, enabled: boolean, setter: (value: boolean) => void) => {
    if (!isPremium) {
      alert(`You are on a basic plan. To enable ${feature}, please upgrade to Premium`)
      return
    }
    setter(enabled)
    
    if (feature === 'Dynamic Pricing' && enabled) {
      alert(`${feature} enabled! AI-powered pricing suggestions will be calculated based on city demand.`)
    } else {
      alert(`${feature} ${enabled ? 'enabled' : 'disabled'}`)
    }
  }


  return (
    <div className="space-y-6">
      {/* Plan Status Card */}
      <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-gray-700 flex items-center gap-2">
              {isPremium ? <Crown className="w-5 h-5 text-yellow-400" /> : <Star className="w-5 h-5 text-gray-400" />}
              Current Plan: {isPremium ? 'Premium' : 'Basic'}
            </CardTitle>
            <Badge variant={isPremium ? 'default' : 'destructive'} className={isPremium ? 'bg-yellow-500 text-black' : 'bg-gray-600'}>
              {isPremium ? '₹1,001/month' : 'Free'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {!isPremium && (
            <div className="flex justify-between items-center">
              <p className="text-gray-300">Upgrade to unlock premium features</p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => onUpgrade?.('premium', 'monthly')}
                  disabled={isProcessingPayment}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {isProcessingPayment ? 'Processing...' : 'Monthly (₹1,001)'}
                </Button>
                <Button 
                  onClick={() => onUpgrade?.('premium', 'yearly')}
                  disabled={isProcessingPayment}
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                >
                  {isProcessingPayment ? 'Processing...' : 'Yearly (₹12,012)'}
                </Button>
              </div>
            </div>
          )}
          {isPremium && (
            <p className="text-green-400">✓ All premium features unlocked</p>
          )}
        </CardContent>
      </Card>

      {/* Premium Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        

        {/* Dynamic Pricing */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-green-400" />
                <CardTitle className="text-white text-lg">Dynamic Pricing</CardTitle>
              </div>
              {!isPremium && <Lock className="w-4 h-4 text-gray-400" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">
                AI-powered pricing based on real-time demand, supply, and city occupancy rates
              </p>
              <div className="flex items-center justify-between">
                <span className="text-white">Auto Pricing</span>
                <Switch 
                  checked={dynamicPricingEnabled && isPremium}
                  onCheckedChange={(enabled) => handleFeatureToggle('Dynamic Pricing', enabled, setDynamicPricingEnabled)}
                  disabled={!isPremium}
                />
              </div>
              
              {isPremium && dynamicPricingEnabled && demandAnalysis.length > 0 && (
                <div className="space-y-3">
                  <div className="bg-green-500/20 border border-green-500/30 rounded p-3">
                    <p className="text-green-400 text-sm font-medium mb-2">✓ AI Pricing Active</p>
                    <div className="space-y-2">
                      {demandAnalysis.slice(0, 2).map((analysis) => (
                        <div key={analysis.spaceId} className="bg-white/5 rounded p-2">
                          <div className="flex justify-between items-center">
                            <span className="text-white text-sm font-medium">{analysis.spaceName}</span>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-300 text-xs">{analysis.city}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                            <div>
                              <span className="text-gray-400">Current:</span>
                              <p className="text-white">₹{analysis.currentPrice}/hr</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Suggested:</span>
                              <p className="text-green-400">₹{analysis.suggestedPrice}/hr</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Change:</span>
                              <p className={`${parseFloat(analysis.priceChange) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {parseFloat(analysis.priceChange) > 0 ? '+' : ''}{analysis.priceChange}%
                              </p>
                            </div>
                          </div>
                          <div className="mt-1 text-xs text-gray-400">
                            Occupancy: {analysis.occupancyRate}%
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 pt-2 border-t border-white/10">
                      <p className="text-gray-300 text-xs mb-2">Analytics Overview:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {analyticsData && (
                          <>
                            <div className="bg-white/5 rounded p-1">
                              <div className="flex justify-between">
                                <span className="text-white">Occupancy</span>
                                <span className={`${analyticsData.occupancyRate > 80 ? 'text-red-400' : analyticsData.occupancyRate > 60 ? 'text-yellow-400' : 'text-green-400'}`}>
                                  {analyticsData.occupancyRate.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <div className="bg-white/5 rounded p-1">
                              <div className="flex justify-between">
                                <span className="text-white">Bookings</span>
                                <span className="text-blue-400">{analyticsData.totalBookings}</span>
                              </div>
                            </div>
                            <div className="bg-white/5 rounded p-1">
                              <div className="flex justify-between">
                                <span className="text-white">Rating</span>
                                <span className="text-yellow-400">{analyticsData.customerSatisfaction.toFixed(1)}</span>
                              </div>
                            </div>
                            <div className="bg-white/5 rounded p-1">
                              <div className="flex justify-between">
                                <span className="text-white">Avg Duration</span>
                                <span className="text-green-400">{analyticsData.averageBookingDuration.toFixed(1)}h</span>
                              </div>
                            </div>
                          </>
                        )}
                        {!analyticsData && isLoading && (
                          <div className="col-span-2 text-center text-gray-400">Loading analytics...</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {isPremium && dynamicPricingEnabled && demandAnalysis.length === 0 && (
                <div className="bg-blue-500/20 border border-blue-500/30 rounded p-3">
                  <p className="text-blue-400 text-sm">AI analyzing your spaces...</p>
                  <p className="text-gray-300 text-xs">Add spaces to get pricing recommendations</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Premium Payment Processing */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-400" />
                <CardTitle className="text-white text-lg">Premium Payments</CardTitle>
              </div>
              {!isPremium && <Lock className="w-4 h-4 text-gray-400" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">
                Lower processing fees and faster settlements
              </p>
              <div className="flex items-center justify-between">
                <span className="text-white">Lower Fees</span>
                <Switch 
                  checked={premiumPaymentEnabled && isPremium}
                  onCheckedChange={(enabled) => handleFeatureToggle('Premium Payment Processing', enabled, setPremiumPaymentEnabled)}
                  disabled={!isPremium}
                />
              </div>
              {isPremium && premiumPaymentEnabled && (
                <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-sm">✓ 1.8% fees (vs 2.5%)</p>
                  <p className="text-gray-300 text-xs">Next-day settlements</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Comparison */}
      {!isPremium && (
        <Card className="bg-white/5 border border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Premium Features Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-300 mb-3">Basic Plan (Current)</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Up to 5 space listings</li>
                  <li>• Basic email notifications</li>
                  <li>• Standard payment processing</li>
                  <li>• Basic analytics</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-400 mb-3">Premium Plan</h4>
                <ul className="space-y-2 text-sm text-green-400">
                  <li>• Unlimited space listings</li>
                  <li>• Dynamic pricing suggestions</li>
                  <li>• Lower payment processing fees</li>
                  <li>• Advanced analytics & insights</li>
                  <li>• Priority customer support</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => onUpgrade?.('premium', 'monthly')}
                  disabled={isProcessingPayment}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8"
                >
                  {isProcessingPayment ? 'Processing...' : 'Monthly - ₹1,001'}
                </Button>
                <Button 
                  size="lg" 
                  onClick={() => onUpgrade?.('premium', 'yearly')}
                  disabled={isProcessingPayment}
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 px-8"
                >
                  {isProcessingPayment ? 'Processing...' : 'Yearly - ₹12,012 (Save ₹2,000)'}
                </Button>
              </div>
              {paymentError && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{paymentError}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History for Premium Users */}
      {isPremium && paymentHistory && paymentHistory.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-400" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentHistory.slice(0, 5).map((payment, index) => (
                <div key={payment.id || index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{payment.description}</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">₹{payment.amount}</p>
                    <p className={`text-xs ${
                      payment.status === 'completed' ? 'text-green-400' : 
                      payment.status === 'failed' ? 'text-red-400' : 
                      'text-yellow-400'
                    }`}>
                      {payment.status}
                    </p>
                  </div>
                </div>
              ))}
              
             
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
