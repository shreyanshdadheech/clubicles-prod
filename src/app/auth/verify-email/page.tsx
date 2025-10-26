'use client'

import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white flex items-center justify-center py-8">
      <div className="max-w-md w-full mx-4">
        {/* Logo */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center space-x-3">
            <div className="w-24 h-24 flex items-center justify-center">
              <img src="/logo.svg" alt="Clubicles Logo" className="w-14 h-14" />
            </div>
            <span className="font-orbitron text-4xl md:text-6xl font-black tracking-wider text-white">
              CLUBICLES
            </span>
          </Link>
        </div>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 rounded-2xl shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-6">📧</div>
            <h2 className="text-3xl font-bold mb-4 text-white">Check Your Email</h2>
            <p className="text-gray-300 mb-6">
              We've sent you an email with a link to verify your account. Please check your inbox and click the link to complete your registration.
            </p>
            
            <div className="space-y-4">
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                <p className="text-blue-200 text-sm">
                  The verification link will expire in 24 hours. If you don't see the email, check your spam folder.
                </p>
              </div>

              <p className="text-gray-400 text-sm">
                Return to{' '}
                <Link href="/signin" className="text-white hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}