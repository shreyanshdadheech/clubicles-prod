'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { VIBGYORRoleSelector } from '@/components/ui/vibgyor-selector'
import { VIBGYORRole } from '@/types'
import { Eye, EyeOff, Mail, Phone } from 'lucide-react'

interface AuthFormProps {
  type: 'signin' | 'signup'
  onSubmit: (data: SignInData | SignUpData) => void
  isLoading?: boolean
}

interface SignInData {
  email: string
}

interface SignUpData extends SignInData {
  fullName: string
  phone: string
  vibgyorRole: VIBGYORRole
  city: string
}

export function AuthForm({ type, onSubmit, isLoading = false }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [vibgyorRole, setVibgyorRole] = useState<VIBGYORRole>()
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (type === 'signin') {
      onSubmit({ email } as SignInData)
    } else {
      if (!vibgyorRole) {
        alert('Please select your professional category')
        return
      }
      onSubmit({
        email,
        fullName,
        phone,
        vibgyorRole,
        city
      } as SignUpData)
    }
  }

  const isSignUp = type === 'signup'

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </CardTitle>
        <CardDescription>
          {isSignUp 
            ? 'Join Clubicles and find your perfect workspace'
            : 'Sign in to your account to continue'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Sign Up Additional Fields */}
          {isSignUp && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="Enter your city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              {/* VIBGYOR Role Selection */}
              <div className="space-y-2">
                <VIBGYORRoleSelector
                  selectedRole={vibgyorRole}
                  onRoleSelect={setVibgyorRole}
                />
              </div>
            </>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Send OTP')}
          </Button>

          <div className="text-center text-sm text-gray-600">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <a href="/signin" className="text-blue-600 hover:underline">
                  Sign in
                </a>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <a href="/signup" className="text-blue-600 hover:underline">
                  Sign up
                </a>
              </>
            )}
          </div>

          {!isSignUp && (
            <div className="text-center">
              <p className="text-sm text-gray-500 mt-4">
                We'll send you an OTP to verify your email address
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

interface OTPVerificationProps {
  email: string
  onVerify: (otp: string) => void
  onResend: () => void
  isLoading?: boolean
}

export function OTPVerification({ email, onVerify, onResend, isLoading = false }: OTPVerificationProps) {
  const [otp, setOtp] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length === 6) {
      onVerify(otp)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Verify Your Email</CardTitle>
        <CardDescription>
          We've sent a 6-digit code to<br />
          <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Enter OTP</Label>
            <Input
              id="otp"
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-lg tracking-widest"
              maxLength={6}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={onResend}
                className="text-blue-600 hover:underline"
              >
                Resend OTP
              </button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
