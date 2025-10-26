'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  FileText, 
  CreditCard, 
  Building,
  LogOut,
  Mail,
  Phone
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface PendingApprovalProps {
  ownerInfo: {
    first_name: string
    last_name: string
    email: string
  }
}

export function PendingApprovalView({ ownerInfo }: PendingApprovalProps) {
  const { signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    signOut()
    router.push('/signin')
  }

  const handleContactSupport = () => {
    window.open('mailto:support@clubicles.com?subject=Account Approval Inquiry', '_blank')
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
        <Card className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Account Under Review
            </CardTitle>
            <Badge variant="warning" className="border-yellow-500/50 text-yellow-400 bg-yellow-500/10 mx-auto">
              Pending Approval
            </Badge>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Welcome Message */}
            <div className="text-center space-y-3">
              <h3 className="text-lg font-semibold text-white">
                Welcome, {ownerInfo.first_name} {ownerInfo.last_name}!
              </h3>
              <p className="text-gray-300">
                Thank you for signing up as a space owner. Your account is currently being reviewed by our team.
              </p>
            </div>

            {/* Status Info */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-300">Review Process</h4>
                  <p className="text-yellow-200 text-sm mt-1">
                    We're verifying your business information and documents. This typically takes 1-3 business days.
                  </p>
                </div>
              </div>
            </div>

            {/* What's Being Reviewed */}
            <div className="space-y-4">
              <h4 className="font-semibold text-white text-center">What We're Reviewing</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <p className="text-sm text-gray-300">Business Information</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <CreditCard className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="text-sm text-gray-300">Payment Details</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                    <Building className="w-6 h-6 text-purple-400" />
                  </div>
                  <p className="text-sm text-gray-300">KYC Documents</p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-300">What Happens Next?</h4>
                  <ul className="text-blue-200 text-sm mt-1 space-y-1">
                    <li>• We'll verify your business registration and PAN details</li>
                    <li>• Your bank account information will be validated</li>
                    <li>• Once approved, you'll get full access to the owner dashboard</li>
                    <li>• You'll be able to list spaces and start earning immediately</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="text-center space-y-4">
              <p className="text-gray-400 text-sm">
                Have questions about your application?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={handleContactSupport}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
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

            {/* Sign Out */}
            <div className="pt-4 border-t border-white/10">
              <Button 
                onClick={handleSignOut}
                variant="ghost"
                className="w-full text-gray-400 hover:text-white hover:bg-white/5"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            This is a secure area. Your information is protected and confidential.
          </p>
        </div>
      </div>
    </div>
  )
}
