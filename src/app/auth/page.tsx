'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthForm } from '@/components/auth/auth-form'
import { OTPVerification } from '@/components/auth/otp-verification'

type AuthStep = 'form' | 'otp'
type AuthMode = 'login' | 'signup'

export default function AuthPage() {
  const [step, setStep] = useState<AuthStep>('form')
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const router = useRouter()

  // TODO: Replace with actual Supabase auth functions
  const handleSendOTP = async (email: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setEmail(email)
    setStep('otp')
    console.log(`Sending OTP to ${email} for ${mode}`)
  }

  const handleVerifyOTP = async (otp: string) => {
    // Simulate OTP verification
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (otp === '123456') { // Mock OTP for demo
      // TODO: Handle successful authentication
      console.log('OTP verified successfully')
      router.push('/dashboard')
    } else {
      throw new Error('Invalid OTP')
    }
  }

  const handleResendOTP = async () => {
    // Simulate resending OTP
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log(`Resending OTP to ${email}`)
  }

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode)
    setStep('form')
    setEmail('')
  }

  const handleBack = () => {
    setStep('form')
    setEmail('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-gray-900">Clubicles</h1>
          </Link>
          <p className="text-gray-600 mt-2">Premium co-working spaces</p>
        </div>

        {/* Auth Components */}
        {step === 'form' && (
          <AuthForm
            mode={mode}
            onSubmit={handleSendOTP}
            onModeChange={handleModeChange}
          />
        )}

        {step === 'otp' && (
          <OTPVerification
            email={email}
            onVerify={handleVerifyOTP}
            onResend={handleResendOTP}
            onBack={handleBack}
          />
        )}

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link 
            href="/" 
            className="text-gray-600 hover:text-gray-900 text-sm inline-flex items-center"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
