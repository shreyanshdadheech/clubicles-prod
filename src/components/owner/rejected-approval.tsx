'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  XCircle, 
  AlertTriangle, 
  Mail, 
  Phone,
  LogOut,
  Trash2,
  FileX
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface RejectedApprovalProps {
  ownerInfo: {
    first_name: string
    last_name: string
    email: string
  }
  owner_id: string
}

export function RejectedApprovalView({ ownerInfo, owner_id }: RejectedApprovalProps) {
  const { signOut } = useAuth()
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSignOut = async () => {
    signOut()
    router.push('/signin')
  }

  const handleContactSupport = () => {
    window.open('mailto:support@clubicles.com?subject=Account Rejection Appeal', '_blank')
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch('/api/owner/delete-rejected', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ owner_id })
      })

      if (response.ok) {
        // Account deleted successfully, sign out and redirect
        signOut()
        router.push('/signup?message=account-deleted')
      } else {
        const error = await response.json()
        alert(`Failed to delete account: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('An error occurred while deleting your account. Please contact support.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white flex items-center justify-center py-8">
      <div className="max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3">
            <div className="w-16 h-16 flex items-center justify-center">
              <img src="/logo.svg" alt="Clubicles Logo" className="w-12 h-12" />
            </div>
            <span className="font-orbitron text-2xl md:text-3xl font-black tracking-wider text-white">
              CLUBICLES
            </span>
          </Link>
        </div>

        {/* Main Card */}
        <Card className="bg-white/5 backdrop-blur-xl border border-red-500/20 rounded-2xl shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Application Rejected
            </CardTitle>
            <Badge variant="destructive" className="border-red-500/50 text-red-400 bg-red-500/10 mx-auto">
              Account Rejected
            </Badge>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Rejection Message */}
            <div className="text-center space-y-3">
              <h3 className="text-lg font-semibold text-white">
                Hello {ownerInfo.first_name} {ownerInfo.last_name},
              </h3>
              <p className="text-gray-300">
                Unfortunately, we were unable to approve your space owner application at this time.
              </p>
            </div>

            {/* Rejection Reasons */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-300">Common Rejection Reasons</h4>
                  <ul className="text-red-200 text-sm mt-2 space-y-1">
                    <li>• Incomplete or incorrect business documentation</li>
                    <li>• Invalid PAN or GST information</li>
                    <li>• Bank account verification failed</li>
                    <li>• Business address could not be verified</li>
                    <li>• Missing required licenses or permits</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-300">What You Can Do</h4>
                  <p className="text-blue-200 text-sm mt-1">
                    If you believe this rejection was in error, or if you have updated your information, 
                    please contact our support team. We're here to help you resolve any issues.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            <div className="text-center space-y-4">
              <p className="text-gray-400 text-sm">
                Have questions or want to appeal this decision?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={handleContactSupport}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
                <Button 
                  variant="outline"
                  className="border-gray-500 text-gray-300 hover:bg-gray-800"
                  onClick={() => window.open('tel:+911234567890', '_blank')}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Us
                </Button>
              </div>
            </div>

            {/* Account Options */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-3">
                  You can either contact support to resolve the issues or delete your account.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete Account'}
                  </Button>
                  <Button 
                    onClick={handleSignOut}
                    variant="ghost"
                    className="text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            We appreciate your interest in becoming a space owner with Clubicles.
          </p>
        </div>
      </div>
    </div>
  )
}
