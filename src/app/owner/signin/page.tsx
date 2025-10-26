'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building, Eye, EyeOff, Mail, Lock, User, AlertCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function OwnerSignIn() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    phone: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Removed Supabase import - using Prisma-based API

      if (isSignUp) {
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          return
        }
        
        // Create the owner account using the complete owner API
        const ownerData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          business_name: formData.businessName,
          phone: formData.phone,
          // Default business info for signup
          business_address: '',
          business_description: '',
          // Default payment info for signup
          account_holder_name: formData.name,
          account_number: '',
          routing_number: '',
          bank_name: ''
        }

        const response = await fetch('/api/admin/create-complete-owner', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(ownerData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to create owner account')
        }

        const result = await response.json()
        console.log('✅ Owner account created successfully:', result)
        
        // Sign in the newly created user
        const signInResponse = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        })

        const signInResult = await signInResponse.json()

        if (!signInResponse.ok || !signInResult.success) {
          console.error('❌ Auto sign-in error:', signInResult.error)
          setError('Account created but auto sign-in failed. Please sign in manually.')
          setIsSignUp(false)
          return
        }

        console.log('✅ User automatically signed in after account creation')
        router.push('/owner')
        
      } else {
        // Real Prisma-based authentication for sign in
        const response = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          console.error('❌ Owner signin error:', result.error)
          setError(result.error || 'Invalid credentials')
          return
        }

        if (result.data) {
          console.log('✅ Owner authenticated:', result.data.email)
          router.push('/owner')
        }
      }
    } catch (err) {
      console.error('❌ Authentication error:', err)
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center opacity-5"></div>
      
      <div className="relative w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-4">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Space Owner Portal</h1>
          <p className="text-gray-400">
            {isSignUp ? 'Start listing your workspace today' : 'Manage your workspace listings'}
          </p>
        </div>

        {/* Sign In/Up Form */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center text-white">
              {isSignUp ? 'Create Owner Account' : 'Owner Sign In'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white text-sm font-medium">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="pl-11 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-white/40 focus:ring-white/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="text-white text-sm font-medium">
                      Business Name
                    </Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="businessName"
                        name="businessName"
                        type="text"
                        placeholder="Your business or space name"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        className="pl-11 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-white/40 focus:ring-white/20"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="owner@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-11 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-white/40 focus:ring-white/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-11 pr-11 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-white/40 focus:ring-white/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white text-sm font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-11 pr-11 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-white/40 focus:ring-white/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-white text-black hover:bg-gray-100 font-semibold py-3 transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                  </div>
                ) : (
                  <>
                    <Building className="w-5 h-5 mr-2" />
                    {isSignUp ? 'Create Account & Start Onboarding' : 'Sign In to Portal'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Toggle Sign Up/In */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </p>
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    businessName: '',
                    phone: ''
                  })
                }}
                className="text-white hover:underline font-medium mt-2"
              >
                {isSignUp ? 'Sign in instead' : 'Create new account'}
              </button>
            </div>

            {!isSignUp && (
              /* Demo Credentials */
              <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <p className="text-blue-300 text-sm font-medium mb-2">Demo Credentials:</p>
                <div className="text-blue-200 text-xs space-y-1">
                  <p>Email: owner@example.com</p>
                  <p>Password: owner123</p>
                </div>
              </div>
            )}

            {/* Footer Links */}
            <div className="mt-8 text-center space-y-4">
              <div className="text-gray-400 text-sm">
                Questions about listing your space?{' '}
                <Link href="/support" className="text-white hover:underline">
                  Get help
                </Link>
              </div>
              
              <div className="flex justify-center space-x-4 text-sm">
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  ← Back to Home
                </Link>
                <span className="text-gray-600">|</span>
                <Link href="/signin" className="text-gray-400 hover:text-white transition-colors">
                  User Sign In
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-xl p-4">
            <h3 className="text-white font-medium mb-2">Earn More Revenue</h3>
            <p className="text-gray-400 text-sm">Monetize your unused space with our platform</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-xl p-4">
            <h3 className="text-white font-medium mb-2">Easy Management</h3>
            <p className="text-gray-400 text-sm">Simple tools to manage bookings and payments</p>
          </div>
        </div>
      </div>
    </div>
  )
}
