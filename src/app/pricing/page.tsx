'use client'

import React, { useState, useEffect } from 'react'
import { Check, Star, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// Removed Supabase imports - using Prisma-based API
import { PremiumPlan, User } from '@/types'
import { SharedNavigation } from '@/components/shared/navigation'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface PlanFeature {
  name: string;
  price: string;
  originalPrice?: string;
  savings?: string;
  period: string;
  description: string;
  features: string[];
  popular: boolean;
}

const plansData: Record<'monthly' | 'yearly', PlanFeature[]> = {
  monthly: [
    {
      name: "Basic",
      price: "0",
      period: "/month",
      description: "Perfect for space owners getting started with their first property",
      features: [
        "List up to 5 spaces",
        "Basic space management tools",
        "Standard booking system",
        "Email notifications",
        "Basic analytics dashboard",
        "Customer support",
        "Payment processing via Razorpay",
        "Mobile app access"
      ],
      popular: false
    },
    {
      name: "Premium",
      price: "1,001",
      period: "/month",
      description: "Ideal for serious space owners and growing property businesses",
      features: [
        "Unlimited space listings",
        "Advanced space management suite",
        "Priority booking system",
        "Advanced analytics & insights",
        "Priority customer support",
        "Payment processing via Razorpay",
        "VIBGYOR analytics integration",
        "Multi-location dashboard",
        "Reviews and ratings display",
        "Real-time booking management",
        "Dynamic pricing suggestions",
        "Premium payment processing (lower fees)"
      ],
      popular: true
    }
  ],
  yearly: [
    {
      name: "Basic",
      price: "0",
      period: "/year",
      description: "Perfect for space owners getting started with their first property",
      features: [
        "List up to 5 spaces",
        "Basic space management tools",
        "Standard booking system",
        "Email notifications",
        "Basic analytics dashboard",
        "Customer support",
        "Payment processing via Razorpay",
        "Mobile app access"
      ],
      popular: false
    },
    {
      name: "Premium",
      price: "11,012",
      originalPrice: "12,012",
      period: "/year",
      savings: "Save ₹1,000",
      description: "Ideal for serious space owners and growing property businesses",
      features: [
        "Unlimited space listings",
        "Advanced space management suite",
        "Priority booking system",
        "Advanced analytics & insights",
        "Priority customer support",
        "Payment processing via Razorpay",
        "VIBGYOR analytics integration",
        "Multi-location dashboard",
        "Reviews and ratings display",
        "Real-time booking management",
        "Dynamic pricing suggestions",
        "Premium payment processing (lower fees)",
        "2 months FREE with yearly plan"
      ],
      popular: true
    }
  ]
}

export default function PricingPage() {
  // Removed Supabase client - using Prisma-based API
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [currentUserPlan, setCurrentUserPlan] = useState<PremiumPlan>('basic')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [isSpaceOwner, setIsSpaceOwner] = useState<boolean>(false)
  const [isCheckingOwnership, setIsCheckingOwnership] = useState(true)
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null)
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false)

  useEffect(() => {
    const getSession = async () => {
      try {
        console.log('🔍 Getting session...')
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            console.log('👤 Current user:', { id: data.user.id, email: data.user.email })
            setUser(data.user)
          } else {
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('❌ Error getting session:', error)
        setUser(null)
      }
    }

    getSession()

    // Removed Supabase auth state change listener - using Prisma-based API
  }, [])

  // Check if user is a space owner by querying the database using the same method as owner page
  useEffect(() => {
    const checkSpaceOwnership = async () => {
      if (!user) {
        console.log('❌ No user for space ownership check')
        setIsSpaceOwner(false)
        setIsCheckingOwnership(false)
        return
      }

      console.log('🔍 Checking space ownership for user:', user.email)

      try {
        // Check if user is admin first (same logic as owner page)
        const adminEmails = [
          'shreyanshdadheech@gmail.com',
          'admin@clubicles.com',
          'yogesh.dubey.0804@gmail.com'
        ]
        
        if (adminEmails.includes(user.email || '')) {
          console.log('👑 User is admin')
          setIsSpaceOwner(true)
          setIsCheckingOwnership(false)
          return
        }

        // Check user roles directly (same logic as owner page)
        console.log('🔍 Checking user roles for space ownership:', user.roles)
        const isOwner = user.roles === 'owner' || user.roles === 'admin'
        console.log('📊 Ownership check result:', { roles: user.roles, isOwner })
        setIsSpaceOwner(isOwner)
      } catch (err) {
        console.error('❌ Error checking space ownership:', err)
        setIsSpaceOwner(false)
      } finally {
        setIsCheckingOwnership(false)
      }
    }

    checkSpaceOwnership()
  }, [user])

  // Load current subscription from database
  useEffect(() => {
    const loadCurrentSubscription = async () => {
      if (!user) return

      try {
        const response = await fetch('/api/owner/subscription', {
          method: 'GET',
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          if (data.currentPlan) {
            setCurrentUserPlan(data.currentPlan)
          }
          if (data.subscription) {
            setSubscriptionInfo({
              currentPlan: data.subscription.planName || data.currentPlan,
              billingCycle: data.subscription.billingCycle || 'monthly',
              status: data.subscription.status || 'active',
              startDate: data.subscription.startDate || new Date().toISOString(),
              expiryDate: data.subscription.expiryDate || new Date().toISOString()
            })
          }
        }
      } catch (error) {
        console.error('Error loading subscription:', error)
        // Default to basic plan if loading fails
        setCurrentUserPlan('basic')
      }
    }

    loadCurrentSubscription()
  }, [user])

  // Load subscription information for space owners
  useEffect(() => {
    const loadSubscriptionInfo = async () => {
      if (!user || !isSpaceOwner || isCheckingOwnership) {
        return
      }

      setIsLoadingSubscription(true)
      try {
        const response = await fetch(`/api/owner/subscription?ownerId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setSubscriptionInfo(data)
          setCurrentUserPlan(data.currentPlan as PremiumPlan)
        } else {
          console.error('Failed to load subscription info')
        }
      } catch (error) {
        console.error('Error loading subscription:', error)
      } finally {
        setIsLoadingSubscription(false)
      }
    }

    loadSubscriptionInfo()
  }, [user, isSpaceOwner, isCheckingOwnership])

  // Check if user has access to pricing (only space owners and admins)
  const hasAccessToPricing = isSpaceOwner

  // Show loading while checking ownership
  if (isCheckingOwnership) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-300">Checking access permissions...</p>
          {user && (
            <div className="mt-4 text-sm text-gray-500">
              <p>User: {user.email}</p>
              <p>ID: {user.id}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // If user is authenticated but not authorized, show access denied
  if (user && !hasAccessToPricing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/30 mb-6">
              <span className="text-sm font-medium text-red-300">Access Restricted</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent leading-tight">
              Premium Plans for Space Owners
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8">
              This section is exclusively for space owners. Regular users don't need premium plans to enjoy booking spaces.
            </p>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4 text-white">Not a Space Owner?</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                As a regular user, you have full access to browse and book amazing spaces without any premium subscription. 
                If you own spaces and want to list them on Clubicles, please contact our support team.
              </p>
              <div className="text-sm text-gray-500 mb-6 p-3 bg-black/20 rounded-lg">
                <p>Debug info:</p>
                <p>User: {user?.email}</p>
                <p>Space owner: {isSpaceOwner ? 'Yes' : 'No'}</p>
                <p>Has access: {hasAccessToPricing ? 'Yes' : 'No'}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button size="lg" className="bg-white !text-black hover:bg-gray-100 hover:!text-white hover:scale-105 transition-all duration-200 shadow-lg px-8 py-4 text-lg rounded-xl">
                    Go to Dashboard
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg" className="border-white/30 text-black hover:bg-white/20 hover:border-white/50 backdrop-blur-md transition-all duration-300 hover:scale-105 px-8 py-4 text-lg rounded-xl">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleUpgrade = async (planName: string) => {
    if (!user) {
      // Redirect to signin with return URL, same as other pages
      router.push(`/signin?returnUrl=${encodeURIComponent('/pricing')}`)
      return
    }

    // Additional check: Only space owners and admins can upgrade
    if (!hasAccessToPricing) {
      alert('Only space owners can purchase premium plans. Please contact support if you need to become a space owner.')
      return
    }

    if (planName === 'Basic') {
      // Already on basic plan or downgrading to basic
      alert('You are already on the Basic plan')
      return
    }

    if (planName === 'Premium') {
      setIsProcessingPayment(true)
      
      try {
        console.log('🔵 Starting Razorpay payment process for premium upgrade...')
        
        // Create Razorpay order using our new payment system
        const premiumPlan = plansData[billingCycle].find(p => p.name === 'Premium')
        const amount = premiumPlan ? parseInt(premiumPlan.price.replace(',', '')) : 1001
        
        const orderResponse = await fetch('/api/payment/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            type: 'subscription',
            amount: amount,
            currency: 'INR',
            plan: 'premium',
            billing_cycle: billingCycle
          })
        })

        const orderData = await orderResponse.json()
        console.log('Order response:', orderData)
        
        if (!orderData.success) {
          throw new Error(orderData.message || 'Failed to create payment order')
        }
        
        console.log('✅ Order created:', orderData.orderId)

        // Check if this is a mock payment (development mode)
        if (orderData.isMock) {
          console.log('🔧 Development mode: Processing mock payment')
          
          // Show warning about mock payment
          const isRazorpayNotConfigured = orderData.message?.includes('Razorpay credentials not configured')
          
          if (isRazorpayNotConfigured) {
            const proceed = confirm(
              '⚠️ Razorpay Not Configured\n\n' +
              'You are about to process a MOCK payment (no real money will be charged).\n\n' +
              'To enable real payments:\n' +
              '1. Get Razorpay credentials from https://dashboard.razorpay.com/\n' +
              '2. Run: node setup-razorpay.js\n' +
              '3. Restart your server\n\n' +
              'Do you want to proceed with the mock payment?'
            )
            
            if (!proceed) {
              setIsProcessingPayment(false)
              return
            }
          }
          
          // Simulate payment success
          const mockPaymentResponse = {
            razorpay_payment_id: 'mock_payment_' + Date.now(),
            razorpay_order_id: orderData.orderId,
            razorpay_signature: 'mock_signature_' + Date.now()
          }
          
          // Process mock payment verification
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              razorpay_order_id: mockPaymentResponse.razorpay_order_id,
              razorpay_payment_id: mockPaymentResponse.razorpay_payment_id,
              razorpay_signature: mockPaymentResponse.razorpay_signature,
              amount: amount,
              currency: 'INR',
              plan: 'premium',
              billing_cycle: billingCycle
            })
          })

          const verifyData = await verifyResponse.json()
          
          if (verifyData.success) {
            console.log('✅ Mock payment processed successfully:', verifyData)
            
            // Update local state
            setCurrentUserPlan('premium')
            
            // Update subscription info from verification response
            if (verifyData.data?.subscription) {
              setSubscriptionInfo({
                currentPlan: verifyData.data.subscription.plan,
                billingCycle: verifyData.data.subscription.billingCycle,
                status: verifyData.data.subscription.status,
                startDate: new Date().toISOString(),
                expiryDate: new Date(verifyData.data.subscription.expiryDate).toISOString()
              })
            }
            
            // Show success message
            const expiryDate = verifyData.data?.subscription?.expiryDate 
              ? new Date(verifyData.data.subscription.expiryDate).toLocaleDateString()
              : new Date(Date.now() + (billingCycle === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toLocaleDateString()
            
            const message = isRazorpayNotConfigured 
              ? `🎉 Mock Payment Successful! (Razorpay not configured)\n\nYou are now a Premium space owner.\nYour subscription is active until: ${expiryDate}\n\nAll premium features are now unlocked!\n\nNote: This was a mock payment. Configure Razorpay for real payments.`
              : `🎉 Mock Payment Successful! You are now a Premium space owner.\n\nYour subscription is active until: ${expiryDate}\n\nAll premium features are now unlocked!`
            
            alert(message)
            
            // Redirect to owner dashboard
            window.location.href = '/owner'
            
            setIsProcessingPayment(false)
            return
          } else {
            throw new Error(verifyData.message || 'Mock payment verification failed')
          }
        }

        // Initialize Razorpay SDK for real payments
        const initializeRazorpay = () => {
          return new Promise((resolve) => {
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
          })
        }

        const isScriptLoaded = await initializeRazorpay()
        if (!isScriptLoaded) {
          throw new Error('Failed to load payment gateway')
        }
        console.log('✅ Razorpay SDK loaded successfully')

        // Configure Razorpay options
        const options = {
          key: orderData.key,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Clubicles - Premium Plan',
          description: `Upgrade to Premium Space Owner Plan (${billingCycle})`,
          image: '/logo.png',
          order_id: orderData.orderId,
          handler: async function(response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) {
            try {
              console.log('🔵 Payment completed, verifying payment...', response)
              
              // Verify payment using our new verification system
              const verifyResponse = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  amount: amount,
                  currency: 'INR',
                  plan: 'premium',
                  billing_cycle: billingCycle
                })
              })

              const verifyData = await verifyResponse.json()
              
              if (!verifyData.success) {
                throw new Error(verifyData.message || 'Payment verification failed')
              }
              
              console.log('✅ Payment verified and subscription activated:', verifyData)
              
              // Update local state
              setCurrentUserPlan('premium')
              
              // Update subscription info from verification response
              if (verifyData.data?.subscription) {
                setSubscriptionInfo({
                  currentPlan: verifyData.data.subscription.plan,
                  billingCycle: verifyData.data.subscription.billingCycle,
                  status: verifyData.data.subscription.status,
                  startDate: new Date().toISOString(),
                  expiryDate: new Date(verifyData.data.subscription.expiryDate).toISOString()
                })
              }
              
              // Show success message
              const expiryDate = verifyData.data?.subscription?.expiryDate 
                ? new Date(verifyData.data.subscription.expiryDate).toLocaleDateString()
                : new Date(Date.now() + (billingCycle === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toLocaleDateString()
              
              alert(`🎉 Congratulations! You are now a Premium space owner.\n\nYour subscription is active until: ${expiryDate}\n\nAll premium features are now unlocked!`)
              
              // Redirect to owner dashboard
              window.location.href = '/owner'
              
            } catch (error) {
              console.error('Payment verification error:', error)
              const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
              alert(`Payment verification failed: ${errorMessage}\n\nPlease contact support if the payment was deducted from your account.`)
            } finally {
              setIsProcessingPayment(false)
            }
          },
          prefill: {
            name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : '',
            email: user?.email || '',
            contact: user?.phone || ''
          },
          theme: {
            color: '#000000'
          },
          modal: {
            ondismiss: () => {
              setIsProcessingPayment(false)
              console.log('Payment modal dismissed')
            }
          },
          retry: {
            enabled: true,
            max_count: 3
          }
        }

        // Open Razorpay checkout
        console.log('🔵 Opening Razorpay checkout...')
        const razorpay = new (window as any).Razorpay(options)
        
        razorpay.on('payment.failed', (response: any) => {
          console.error('❌ Payment failed:', response.error)
          setIsProcessingPayment(false)
          alert(`Payment failed: ${response.error.description || 'Unknown error'}\n\nPlease try again or contact support if the issue persists.`)
        })
        
        razorpay.open()

      } catch (error) {
        console.error('Payment processing error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        alert(`Payment processing failed: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`)
        setIsProcessingPayment(false)
      }
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Navigation */}
      <SharedNavigation />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
            <Sparkles className="h-4 w-4 mr-2 text-white" />
            <span className="text-sm font-medium">Grow Your Space Business</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent leading-tight">
            Space Owner Plans
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Manage and monetize your spaces with powerful tools. Start free, scale as you grow.
          </p>
        </div>

        {/* Current Subscription Status */}
        {isSpaceOwner && subscriptionInfo && !isLoadingSubscription && (
          <div className="max-w-2xl mx-auto mb-12">
            
                <div className="text-center">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      subscriptionInfo.currentPlan === 'premium' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {subscriptionInfo.currentPlan.charAt(0).toUpperCase() + subscriptionInfo.currentPlan.slice(1)} Plan
                    </div>
                    {subscriptionInfo.currentPlan === 'premium' && (
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        subscriptionInfo.isExpired
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : subscriptionInfo.daysUntilExpiry <= 7
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-green-500/20 text-green-400 border border-green-500/30'
                      }`}>
                        {subscriptionInfo.isExpired 
                          ? 'Expired' 
                          : subscriptionInfo.daysUntilExpiry <= 0
                          ? 'Expires Today'
                          : `${subscriptionInfo.daysUntilExpiry} days left`
                        }
                      </div>
                    )}
                  </div>
                  
                  {subscriptionInfo.subscription && (
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>Started: {subscriptionInfo.subscription.startDate ? new Date(subscriptionInfo.subscription.startDate).toLocaleDateString() : 'N/A'}</p>
                      {subscriptionInfo.subscription.expiryDate && (
                        <p>Expires: {new Date(subscriptionInfo.subscription.expiryDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  )}
                  
                  {subscriptionInfo.isExpired && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-red-400 text-sm">
                        Your premium subscription has expired. Upgrade now to restore premium features.
                      </p>
                    </div>
                  )}
                </div>
             
          </div>
        )}

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-1 flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                billingCycle === 'monthly'
                  ? 'bg-white text-black shadow-lg'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 relative ${
                billingCycle === 'yearly'
                  ? 'bg-white text-black shadow-lg'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Save ₹1K
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20 max-w-4xl mx-auto">
          {plansData[billingCycle].map((plan, index) => (
            <Card 
              key={index} 
              className={`relative overflow-hidden bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 rounded-2xl ${
                plan.popular ? 'ring-2 ring-white/30' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-px left-1/2 transform -translate-x-1/2 z-10">
                  <div className="flex items-center px-4 py-2 bg-white text-black text-sm font-bold rounded-b-xl shadow-lg">
                    <Star className="h-4 w-4 mr-1 fill-current" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="relative z-10">
                <CardHeader className="text-center pb-8 pt-8">
                  <CardTitle className="text-white text-2xl font-bold mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-300 text-base leading-relaxed">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-6">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-4xl md:text-5xl font-bold text-white">₹{plan.price}</span>
                      <span className="text-gray-300 text-lg">{plan.period}</span>
                    </div>
                    {billingCycle === 'yearly' && plan.originalPrice && (
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <span className="text-lg text-gray-400 line-through">₹{plan.originalPrice}</span>
                        <span className="bg-green-500 text-white text-sm px-2 py-1 rounded-full">
                          {(plan as any).savings}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="px-8 pb-8">
                  <Button 
                    className={`w-full mb-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
                      !hasAccessToPricing
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                        : plan.name === 'Basic' && currentUserPlan === 'basic' && !subscriptionInfo?.isExpired
                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                        : plan.name === 'Premium' && currentUserPlan === 'premium' && !subscriptionInfo?.isExpired
                        ? 'bg-green-600 text-white cursor-not-allowed'
                        : plan.popular 
                        ? 'bg-white !text-black hover:bg-gray-100' 
                        : 'bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30 hover:border-white/50'
                    }`}
                    onClick={() => handleUpgrade(plan.name)}
                    disabled={isProcessingPayment || !hasAccessToPricing || (plan.name === 'Basic' && currentUserPlan === 'basic' && !subscriptionInfo?.isExpired) || (plan.name === 'Premium' && currentUserPlan === 'premium' && !subscriptionInfo?.isExpired)}
                  >
                    {!hasAccessToPricing ? (
                      <>Space Owners Only</>
                    ) : isProcessingPayment && plan.name === 'Premium' ? (
                      <>Processing Payment...</>
                    ) : plan.name === 'Basic' && currentUserPlan === 'basic' && !subscriptionInfo?.isExpired ? (
                      <>Current Plan</>
                    ) : plan.name === 'Premium' && currentUserPlan === 'premium' && !subscriptionInfo?.isExpired ? (
                      <>✓ Active Plan</>
                    ) : subscriptionInfo?.isExpired && plan.name === 'Premium' ? (
                      <>Renew Premium</>
                    ) : (
                      <>Choose {plan.name}</>
                    )}
                  </Button>
                  
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-gray-200 mb-4 uppercase tracking-wide">Everything included:</p>
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start">
                        <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-200 leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-300">Everything you need to know about our plans and services</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                question: "Can I start with the free plan?",
                answer: "Yes! Our Basic plan is completely free and allows you to list up to 5 spaces. Perfect for getting started with no risk."
              },
              {
                question: "What happens when I upgrade to Premium?",
                answer: "You'll get unlimited space listings, SMS marketing, advanced analytics, priority support, and lower payment processing fees."
              },
              {
                question: "Are there any setup fees?",
                answer: "No setup fees, no hidden charges. The Basic plan is 100% free, and Premium is just ₹1,001/month."
              },
              {
                question: "How do SMS notifications work?",
                answer: "Premium members get SMS marketing campaigns, booking notifications, and automated guest communications to increase bookings and engagement."
              },
              {
                question: "What's your commission policy?",
                answer: "We charge a small booking fee to guests. Space owners keep the majority of their earnings with transparent, low-cost processing."
              },
              {
                question: "Can I manage multiple properties?",
                answer: "Yes! Premium plan includes multi-location management tools, bulk operations, and centralized dashboard for all your spaces."
              }
            ].map((faq, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-lg font-semibold">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md border-white/20 shadow-2xl rounded-2xl">
            <CardContent className="p-12">
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl pt-8 font-bold mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Ready to List Your Spaces?
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Join hundreds of space owners earning with Clubicles. Start free today.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="bg-white !text-black hover:bg-gray-100 hover:!text-white hover:scale-105 transition-all duration-200 shadow-lg px-8 py-4 text-lg rounded-xl">
                    Start Free Today
                  </Button>
                </Link>
                <Link href="/owner">
                  <Button variant="outline" size="lg" className="border-white/30 text-black hover:bg-white/20 hover:border-white/50 backdrop-blur-md transition-all duration-300 hover:scale-105 px-8 py-4 text-lg rounded-xl">
                    Owner Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
