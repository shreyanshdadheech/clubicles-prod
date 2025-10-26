'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building, CreditCard, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface BusinessInfo {
  companyName: string
  businessType: string
  gstNumber: string
  panNumber: string
  address: string
  contactEmail: string
  contactPhone: string
}

interface PaymentInfo {
  accountHolderName: string
  bankName: string
  accountNumber: string
  ifscCode: string
  accountType: string
  upiId: string
  paymentSchedule: string
  minimumPayout: string
}

const BUSINESS_TYPES = [
  'Private Limited',
  'Public Limited',
  'Partnership',
  'LLP',
  'Sole Proprietorship',
  'Trust',
  'Society',
  'HUF'
]

const ACCOUNT_TYPES = [
  'Savings',
  'Current',
  'Salary'
]

const PAYMENT_SCHEDULES = [
  'Weekly',
  'Bi-weekly',
  'Monthly',
  'Quarterly'
]

const MINIMUM_PAYOUTS = [
  '500',
  '1000',
  '2000',
  '5000',
  '10000'
]

export default function BusinessOnboarding() {
  const [currentStep, setCurrentStep] = useState<'business' | 'payment' | 'success'>('business')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { user } = useAuth()
  
  // Business Information State
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    companyName: '',
    businessType: '',
    gstNumber: '',
    panNumber: '',
    address: '',
    contactEmail: '',
    contactPhone: ''
  })

  // Payment Information State
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountType: '',
    upiId: '',
    paymentSchedule: 'Monthly',
    minimumPayout: '1000'
  })

  const handleBusinessInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate business information
    if (!businessInfo.companyName || !businessInfo.businessType || !businessInfo.gstNumber || 
        !businessInfo.panNumber || !businessInfo.address || !businessInfo.contactEmail) {
      alert('Please fill in all required business information fields')
      return
    }
    
    // Move to payment information step
    setCurrentStep('payment')
  }

  const handlePaymentInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate payment information
    if (!paymentInfo.accountHolderName || !paymentInfo.bankName || !paymentInfo.accountNumber || 
        !paymentInfo.ifscCode || !paymentInfo.accountType) {
      alert('Please fill in all required payment information fields')
      return
    }
    
    setIsLoading(true)
    
    try {
      // Call the API to onboard space owner
      const response = await fetch('/api/owner/onboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessInfo,
          paymentInfo
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to onboard space owner')
      }

      // Onboarding successful
      console.log('Onboarding successful:', data)

      if (data && data.success) {
        setCurrentStep('success')
        // Redirect to owner dashboard after a short delay
        setTimeout(() => {
          router.push('/owner?onboarded=true')
        }, 2000)
      } else {
        alert(data?.error || 'Failed to complete onboarding. Please try again.')
      }
    } catch (error) {
      console.error('Onboarding failed:', error)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToPrevious = () => {
    if (currentStep === 'payment') {
      setCurrentStep('business')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center py-8">
      <div className="max-w-2xl w-full mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3">
            <Building className="w-8 h-8 text-white" />
            <span className="text-2xl font-bold text-white">Clubicles</span>
          </div>
        </div>

        {/* Business Information Step */}
        {currentStep === 'business' && (
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 rounded-2xl shadow-2xl max-w-2xl mx-auto">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                <Building className="w-8 h-8" />
                Business Information
              </CardTitle>
              <p className="text-gray-300 text-lg">
                Tell us about your business to get started
              </p>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleBusinessInfoSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="companyName" className="text-white text-sm font-medium mb-2 block">
                      Company Name *
                    </Label>
                    <Input
                      id="companyName"
                      type="text"
                      value={businessInfo.companyName}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, companyName: e.target.value }))}
                      className="bg-white/20 border-white/30 text-white placeholder-gray-400 focus:border-white/50 focus:ring-white/20"
                      placeholder="Enter company name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="businessType" className="text-white text-sm font-medium mb-2 block">
                      Business Type *
                    </Label>
                    <Select value={businessInfo.businessType} onValueChange={(value) => setBusinessInfo(prev => ({ ...prev, businessType: value }))}>
                      <SelectTrigger className="bg-white/20 border-white/30 text-white">
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        {BUSINESS_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="gstNumber" className="text-white text-sm font-medium mb-2 block">
                      GST Number *
                    </Label>
                    <Input
                      id="gstNumber"
                      type="text"
                      value={businessInfo.gstNumber}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, gstNumber: e.target.value }))}
                      className="bg-white/20 border-white/30 text-white placeholder-gray-400 focus:border-white/50 focus:ring-white/20"
                      placeholder="22AAAAA0000A1Z5"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="panNumber" className="text-white text-sm font-medium mb-2 block">
                      PAN Number *
                    </Label>
                    <Input
                      id="panNumber"
                      type="text"
                      value={businessInfo.panNumber}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, panNumber: e.target.value }))}
                      className="bg-white/20 border-white/30 text-white placeholder-gray-400 focus:border-white/50 focus:ring-white/20"
                      placeholder="AAAAA0000A"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="text-white text-sm font-medium mb-2 block">
                    Business Address *
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    value={businessInfo.address}
                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, address: e.target.value }))}
                    className="bg-white/20 border-white/30 text-white placeholder-gray-400 focus:border-white/50 focus:ring-white/20"
                    placeholder="Complete business address"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="contactEmail" className="text-white text-sm font-medium mb-2 block">
                      Contact Email *
                    </Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={businessInfo.contactEmail}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, contactEmail: e.target.value }))}
                      className="bg-white/20 border-white/30 text-white placeholder-gray-400 focus:border-white/50 focus:ring-white/20"
                      placeholder="business@company.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactPhone" className="text-white text-sm font-medium mb-2 block">
                      Contact Phone *
                    </Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={businessInfo.contactPhone}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, contactPhone: e.target.value }))}
                      className="bg-white/20 border-white/30 text-white placeholder-gray-400 focus:border-white/50 focus:ring-white/20"
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-white to-gray-200 text-black font-semibold hover:from-gray-200 hover:to-gray-300 flex-1"
                  >
                    Continue to Payment Info
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Payment Information Step */}
        {currentStep === 'payment' && (
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 rounded-2xl shadow-2xl max-w-2xl mx-auto">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                <CreditCard className="w-8 h-8" />
                Payment Information
              </CardTitle>
              <p className="text-gray-300 text-lg">
                Setup your payout details for receiving payments
              </p>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handlePaymentInfoSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="accountHolderName" className="text-white text-sm font-medium mb-2 block">
                      Account Holder Name *
                    </Label>
                    <Input
                      id="accountHolderName"
                      type="text"
                      value={paymentInfo.accountHolderName}
                      onChange={(e) => setPaymentInfo(prev => ({ ...prev, accountHolderName: e.target.value }))}
                      className="bg-white/20 border-white/30 text-white placeholder-gray-400 focus:border-white/50 focus:ring-white/20"
                      placeholder="Account holder name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="bankName" className="text-white text-sm font-medium mb-2 block">
                      Bank Name *
                    </Label>
                    <Input
                      id="bankName"
                      type="text"
                      value={paymentInfo.bankName}
                      onChange={(e) => setPaymentInfo(prev => ({ ...prev, bankName: e.target.value }))}
                      className="bg-white/20 border-white/30 text-white placeholder-gray-400 focus:border-white/50 focus:ring-white/20"
                      placeholder="Bank name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="accountNumber" className="text-white text-sm font-medium mb-2 block">
                      Account Number *
                    </Label>
                    <Input
                      id="accountNumber"
                      type="text"
                      value={paymentInfo.accountNumber}
                      onChange={(e) => setPaymentInfo(prev => ({ ...prev, accountNumber: e.target.value }))}
                      className="bg-white/20 border-white/30 text-white placeholder-gray-400 focus:border-white/50 focus:ring-white/20"
                      placeholder="Account number"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="ifscCode" className="text-white text-sm font-medium mb-2 block">
                      IFSC Code *
                    </Label>
                    <Input
                      id="ifscCode"
                      type="text"
                      value={paymentInfo.ifscCode}
                      onChange={(e) => setPaymentInfo(prev => ({ ...prev, ifscCode: e.target.value }))}
                      className="bg-white/20 border-white/30 text-white placeholder-gray-400 focus:border-white/50 focus:ring-white/20"
                      placeholder="IFSC code"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="accountType" className="text-white text-sm font-medium mb-2 block">
                      Account Type *
                    </Label>
                    <Select value={paymentInfo.accountType} onValueChange={(value) => setPaymentInfo(prev => ({ ...prev, accountType: value }))}>
                      <SelectTrigger className="bg-white/20 border-white/30 text-white">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCOUNT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="upiId" className="text-white text-sm font-medium mb-2 block">
                      UPI ID (Optional)
                    </Label>
                    <Input
                      id="upiId"
                      type="text"
                      value={paymentInfo.upiId}
                      onChange={(e) => setPaymentInfo(prev => ({ ...prev, upiId: e.target.value }))}
                      className="bg-white/20 border-white/30 text-white placeholder-gray-400 focus:border-white/50 focus:ring-white/20"
                      placeholder="user@upi"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="paymentSchedule" className="text-white text-sm font-medium mb-2 block">
                      Payment Schedule
                    </Label>
                    <Select value={paymentInfo.paymentSchedule} onValueChange={(value) => setPaymentInfo(prev => ({ ...prev, paymentSchedule: value }))}>
                      <SelectTrigger className="bg-white/20 border-white/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_SCHEDULES.map((schedule) => (
                          <SelectItem key={schedule} value={schedule}>{schedule}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="minimumPayout" className="text-white text-sm font-medium mb-2 block">
                      Minimum Payout Amount (₹)
                    </Label>
                    <Select value={paymentInfo.minimumPayout} onValueChange={(value) => setPaymentInfo(prev => ({ ...prev, minimumPayout: value }))}>
                      <SelectTrigger className="bg-white/20 border-white/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MINIMUM_PAYOUTS.map((amount) => (
                          <SelectItem key={amount} value={amount}>₹{amount}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    onClick={handleBackToPrevious}
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30 flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Business Info
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-white to-gray-200 text-black font-semibold hover:from-gray-200 hover:to-gray-300 flex-1"
                  >
                    {isLoading ? 'Processing...' : 'Complete Onboarding'}
                    {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Success Step */}
        {currentStep === 'success' && (
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 rounded-2xl shadow-2xl max-w-md mx-auto">
            <CardContent className="pt-12 pb-8 text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-6 text-green-400" />
              <h2 className="text-3xl font-bold mb-4 text-white">Onboarding Complete!</h2>
              <p className="text-gray-300 mb-6">
                Your business information has been successfully submitted. You can now start listing your spaces and manage your business.
              </p>
              
              <div className="animate-pulse flex justify-center">
                <div className="text-sm text-gray-400">Redirecting to dashboard...</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}