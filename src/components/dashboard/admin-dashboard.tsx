'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ProfessionalBadge } from '@/components/ui/professional-selector'
import { TaxConfigurationComponent } from '@/components/admin/tax-configuration'
import { PayoutDialog } from '@/components/admin/payout-dialog'
import { 
  Users, Building, Calendar, CreditCard, TrendingUp, 
  CheckCircle, XCircle, Clock, Eye, MoreHorizontal,
  Filter, Download, RefreshCw, Settings, AlertTriangle, 
  ShieldCheck, Search, ArrowUpDown, ChevronDown,
  UserCheck, UserX, Building2, Home, Menu, X,
  Crown, Percent, BarChart3, MessageSquare, HelpCircle
} from 'lucide-react'
import { DashboardStats, Space, User, Booking, ProfessionalRole, SpaceOwnerData } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { VIBGYOR_CATEGORIES, getVIBGYORCategory } from '@/lib/vibgyor'
import { PROFESSIONAL_CATEGORIES } from '@/lib/professional-categories'

// Import mock data from JSON file
import adminData from '@/data/admin-data.json'

interface AdminDashboardProps {
  user?: User
}

interface ExtendedSpace extends Space {
  owner_name?: string
  owner_email?: string
  business_info?: {
    business_name: string
    gst_number: string
    pan_number: string
    business_type: string
  }
  rejection_reason?: string
}

interface ExtendedUser extends User {
  user_type: 'individual' | 'space-owner'
  status: 'active' | 'inactive' | 'pending_verification' | 'paused'
  verification_status?: 'verified' | 'pending' | 'rejected'
  approval_status?: 'pending' | 'approved' | 'rejected'
  business_info?: {
    business_name: string
    business_type: string
    gst_number: string
    pan_number: string
    business_address: string
  }
  total_revenue?: number
  platform_commission?: number
  pending_payout?: number
  spaces_count?: number
  total_bookings?: number
  business_verification?: {
    gst_number: string
    pan_number: string
    business_type: string
    documents_submitted: string[]
    verification_date: string | null
  }
}

interface VerificationRequest {
  id: string
  spaceOwnerId: string
  businessName: string
  businessType: string
  gstNumber?: string
  panNumber: string
  businessAddress: string
  businessCity: string
  businessState: string
  businessPincode: string
  verificationStatus: string
  verifiedBy?: string
  verifiedAt?: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
  spaceOwner?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    phone?: string
    approvalStatus: string
    onboardingCompleted: boolean
    user?: {
      id: string
      email: string
      firstName: string
      lastName: string
      phone: string
      city: string
      createdAt: string
    }
    paymentInfo?: {
      id: string
      bankAccountNumber: string
      bankIfscCode: string
      bankAccountHolderName: string
      bankName: string
      upiId: string
      createdAt: string
      updatedAt: string
    }
  }
  spaces: Array<{
    id: string
    name: string
    city: string
    status: string
  }>
  spacesCount: number
  businessBalance?: {
    currentBalance: number
    pendingAmount: number
    totalEarned: number
  }
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'analytics' | 'verification' | 'reverify' | 'premium-analytics' | 'support' | 'tax-config'>('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Verification modal states
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null)
  const [showRejectOptions, setShowRejectOptions] = useState(false)
  const [rejectAction, setRejectAction] = useState<'delete' | 'reapply' | 'ban'>('reapply')
  
  // Payout modal states
  const [showPayoutDialog, setShowPayoutDialog] = useState(false)
  const [selectedSpaceOwner, setSelectedSpaceOwner] = useState<{
    id: string
    firstName?: string
    lastName?: string
    email: string
    pendingPayout: number
    currentBalance: number
    totalWithdrawn?: number
    paymentInfo?: any
  } | null>(null)
  
  
  // Search and filter states
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'individual' | 'space-owner'>('all')
  const [verificationSearchTerm, setVerificationSearchTerm] = useState('')
  const [verificationStatusFilter, setVerificationStatusFilter] = useState<'all' | 'completed' | 'pending'>('all')
  
  // Data states
  const [users, setUsers] = useState<SpaceOwnerData[]>([])
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [premiumAnalytics, setPremiumAnalytics] = useState<any>(null)
  const [supportTickets, setSupportTickets] = useState<any[]>([])
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [showTicketDialog, setShowTicketDialog] = useState(false)
  const [adminResponse, setAdminResponse] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [stats, setStats] = useState(adminData.stats)
  const [systemStatus, setSystemStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load data from APIs
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch dashboard stats
        const statsResponse = await fetch('/api/admin/dashboard')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          if (statsData.success) {
            setStats(statsData.data.stats)
          }
        }


        // Fetch space owners data
        const spaceOwnersResponse = await fetch('/api/admin/space-owners')
        if (spaceOwnersResponse.ok) {
          const spaceOwnersData = await spaceOwnersResponse.json()
          if (spaceOwnersData.success) {
            setUsers(spaceOwnersData.data.spaceOwners as SpaceOwnerData[])
          }
        }

        // Fetch verification requests data
        const verificationsResponse = await fetch('/api/admin/verifications')
        if (verificationsResponse.ok) {
          const verificationsData = await verificationsResponse.json()
          if (verificationsData.success) {
            setVerificationRequests(verificationsData.data.verifications as any)
          }
        }

        // Fetch support tickets data
        const supportResponse = await fetch('/api/admin/support')
        if (supportResponse.ok) {
          const supportData = await supportResponse.json()
          if (supportData.success) {
            setSupportTickets(supportData.data)
          }
        }

        // Fetch analytics data
        const analyticsResponse = await fetch('/api/admin/analytics')
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json()
          if (analyticsData.success) {
            setAnalytics(analyticsData.data.analytics)
          }
        }

        // Fetch premium analytics data
        const premiumAnalyticsResponse = await fetch('/api/admin/premium-analytics')
        if (premiumAnalyticsResponse.ok) {
          const premiumAnalyticsData = await premiumAnalyticsResponse.json()
          if (premiumAnalyticsData.success) {
            setPremiumAnalytics(premiumAnalyticsData.data.analytics)
          }
        }

        // Fetch system status
        const systemStatusResponse = await fetch('/api/admin/system-status')
        if (systemStatusResponse.ok) {
          const systemStatusData = await systemStatusResponse.json()
          if (systemStatusData.success) {
            setSystemStatus(systemStatusData.data.systemStatus)
          }
        }
        
      } catch (error) {
        console.error('Error fetching admin data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filtered data using useMemo for performance

  const filteredUsers = useMemo(() => {
    return users.filter(owner => {
      const matchesSearch = owner.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                            owner.firstName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                            owner.lastName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                            owner.phone?.includes(userSearchTerm)
      const matchesStatus = userTypeFilter === 'all' || owner.approvalStatus === userTypeFilter
      const matchesOnboarding = verificationStatusFilter === 'all' || 
                               (verificationStatusFilter === 'completed' && owner.onboardingCompleted) ||
                               (verificationStatusFilter === 'pending' && !owner.onboardingCompleted)
      return matchesSearch && matchesStatus && matchesOnboarding
    })
  }, [users, userSearchTerm, userTypeFilter, verificationStatusFilter])

  const filteredVerificationRequests = useMemo(() => {
    return verificationRequests.filter(request => {
      const matchesSearch = request.businessName?.toLowerCase().includes(verificationSearchTerm.toLowerCase()) ||
                            request.businessType?.toLowerCase().includes(verificationSearchTerm.toLowerCase()) ||
                            request.businessCity?.toLowerCase().includes(verificationSearchTerm.toLowerCase()) ||
                            request.spaceOwner?.email?.toLowerCase().includes(verificationSearchTerm.toLowerCase()) ||
                            request.spaceOwner?.firstName?.toLowerCase().includes(verificationSearchTerm.toLowerCase()) ||
                            request.spaceOwner?.lastName?.toLowerCase().includes(verificationSearchTerm.toLowerCase())
      const matchesStatus = verificationStatusFilter === 'all' || request.verificationStatus === verificationStatusFilter
      return matchesSearch && matchesStatus
    })
  }, [verificationRequests, verificationSearchTerm, verificationStatusFilter])

  // Action handlers
  const handleUserAction = async (userId: string, action: 'activate' | 'pause' | 'disable' | 'delete' | 'verify' | 'reject_verification' | 'approve' | 'reject' | 'view') => {
    try {
      const user = users.find(u => u.id === userId)
      if (!user) return

      switch (action) {
        case 'activate':
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'active' } : u))
          break
        case 'pause':
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'paused' } : u))
          break
        case 'disable':
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'inactive' } : u))
          break
        case 'delete':
          setUsers(prev => prev.filter(u => u.id !== userId))
          setStats(prev => ({ ...prev, total_users: prev.total_users - 1 }))
          break
        case 'verify':
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, verification_status: 'verified' } : u))
          break
        case 'reject_verification':
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, verification_status: 'rejected' } : u))
          break
        case 'approve':
        case 'reject':
          // Handle API calls for approve/reject
          try {
            const response = await fetch('/api/admin/users', {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId,
                action,
                reason: action === 'reject' ? 'Business verification failed' : null
              }),
            })

            if (response.ok) {
              const data = await response.json()
              if (data.success) {
                // Update local state
                setUsers(prev => 
                  prev.map(user => 
                    user.id === userId 
                      ? { ...user, approval_status: action === 'approve' ? 'approved' : 'rejected' }
                      : user
                  )
                )
                alert(`Space owner ${action}d successfully`)
              } else {
                alert(data.error || 'Failed to update user')
              }
            } else {
              alert('Failed to update user')
            }
          } catch (error) {
            console.error('Error updating user:', error)
            alert('Failed to update user')
          }
          break
        case 'view':
          // Handle view action (could open a modal or navigate to user details)
          console.log('View user details:', user)
          break
      }

      console.log(`User ${action} action completed for user:`, user.email)
    } catch (error) {
      console.error(`Failed to ${action} user:`, error)
    }
  }


  const handleVerificationReject = async (requestId: string, action: 'delete' | 'reapply' | 'ban') => {
    try {
      const request = verificationRequests.find(r => r.id === requestId)
      if (!request) return

      // Update verification request to rejected
      setVerificationRequests(prev => prev.map(r => 
        r.id === requestId 
          ? { ...r, status: 'rejected' }
          : r
      ))

      // Handle post-rejection actions
      switch (action) {
        case 'delete':
          // Delete the user entirely
          handleUserAction(request.spaceOwnerId, 'delete')
          break
        case 'ban':
          // Mark user as banned (disable with special ban status)
          setUsers(prev => prev.map(u => 
            u.id === request.spaceOwnerId 
              ? { ...u, status: 'inactive', verification_status: 'banned' as any }
              : u
          ))
          break
        case 'reapply':
          // Just reject but allow reapplication
          handleUserAction(request.spaceOwnerId, 'reject_verification')
          break
      }
    } catch (error) {
      console.error('Failed to handle verification rejection:', error)
    }
  }



  const handlePayout = (owner: any) => {
    setSelectedSpaceOwner({
      id: owner.id,
      firstName: owner.firstName,
      lastName: owner.lastName,
      email: owner.email,
      pendingPayout: owner.pendingPayout,
      currentBalance: owner.currentBalance,
      totalWithdrawn: owner.totalWithdrawn,
      paymentInfo: owner.paymentInfo
    })
    setShowPayoutDialog(true)
  }

  const handleSpaceOwnerAction = async (spaceOwnerId: string, action: string) => {
    try {
      if (action === 'approve') {
        const response = await fetch('/api/admin/space-owners', {
        method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ spaceOwnerId, approvalStatus: 'approved' })
        })
      if (response.ok) {
          // Refresh data
          const fetchData = async () => {
            const spaceOwnersResponse = await fetch('/api/admin/space-owners')
            if (spaceOwnersResponse.ok) {
              const spaceOwnersData = await spaceOwnersResponse.json()
              if (spaceOwnersData.success) {
                setUsers(spaceOwnersData.data.spaceOwners as SpaceOwnerData[])
              }
            }
          }
          await fetchData()
        }
      } else if (action === 'reject') {
        const response = await fetch('/api/admin/space-owners', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ spaceOwnerId, approvalStatus: 'rejected' })
        })
        if (response.ok) {
          // Refresh data
          const fetchData = async () => {
            const spaceOwnersResponse = await fetch('/api/admin/space-owners')
            if (spaceOwnersResponse.ok) {
              const spaceOwnersData = await spaceOwnersResponse.json()
              if (spaceOwnersData.success) {
                setUsers(spaceOwnersData.data.spaceOwners as SpaceOwnerData[])
              }
            }
          }
          await fetchData()
        }
      } else if (action === 'complete-onboarding') {
        const response = await fetch('/api/admin/space-owners', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ spaceOwnerId, onboardingCompleted: true })
        })
        if (response.ok) {
          // Refresh data
          const fetchData = async () => {
            const spaceOwnersResponse = await fetch('/api/admin/space-owners')
            if (spaceOwnersResponse.ok) {
              const spaceOwnersData = await spaceOwnersResponse.json()
              if (spaceOwnersData.success) {
                setUsers(spaceOwnersData.data.spaceOwners as SpaceOwnerData[])
              }
            }
          }
          await fetchData()
        }
      }
    } catch (error) {
      console.error('Error handling space owner action:', error)
    }
  }

  const handleVerificationAction = async (businessInfoId: string, action: string, rejectionReason?: string) => {
    try {
      if (action === 'approve') {
        const response = await fetch('/api/admin/verifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            businessInfoId, 
            verificationStatus: 'verified',
            verifiedBy: 'admin'
          })
        })
        if (response.ok) {
          // Refresh data
          const fetchData = async () => {
            const verificationsResponse = await fetch('/api/admin/verifications')
            if (verificationsResponse.ok) {
              const verificationsData = await verificationsResponse.json()
              if (verificationsData.success) {
                setVerificationRequests(verificationsData.data.verifications as any)
              }
            }
          }
          await fetchData()
        }
      } else if (action === 'reject') {
        const response = await fetch('/api/admin/verifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            businessInfoId, 
            verificationStatus: 'rejected',
            rejectionReason: rejectionReason || 'Business information verification failed',
            verifiedBy: 'admin'
          })
        })
        if (response.ok) {
          // Refresh data
          const fetchData = async () => {
            const verificationsResponse = await fetch('/api/admin/verifications')
            if (verificationsResponse.ok) {
              const verificationsData = await verificationsResponse.json()
              if (verificationsData.success) {
                setVerificationRequests(verificationsData.data.verifications as any)
              }
            }
          }
          await fetchData()
        }
      }
    } catch (error) {
      console.error('Error handling verification action:', error)
    }
  }

  const handlePayoutSubmit = async (payoutData: { amount: number; paymentMethod: string; notes: string }) => {
    try {
      const response = await fetch('/api/admin/payouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spaceOwnerId: selectedSpaceOwner?.id,
          ...payoutData
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Update local state - reset pending payout
          setUsers(prev => 
            prev.map(user => 
              user.id === selectedSpaceOwner?.id 
                ? { ...user, pending_payout: 0 }
                : user
            )
          )
          alert('Payout processed successfully')
        } else {
          alert(data.error || 'Failed to process payout')
        }
      } else {
        alert('Failed to process payout')
      }
    } catch (error) {
      console.error('Error processing payout:', error)
      alert('Failed to process payout')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white p-4">
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-white/10 backdrop-blur-xl rounded-xl w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-28 bg-white/10 backdrop-blur-xl rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const tabItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'users', label: 'Space Owners', icon: Users },
    { id: 'verification', label: 'Verification', icon: ShieldCheck },
    { id: 'reverify', label: 'Reverify', icon: RefreshCw },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'premium-analytics', label: 'Premium Analytics', icon: Crown },
    { id: 'support', label: 'Support', icon: MessageSquare },
    { id: 'tax-config', label: 'Tax Configuration', icon: Percent },
  ]

  return (
    <div className="min-h-screen text-white">
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        
        {/* Mobile Tab Navigation */}
        <div className="lg:hidden mb-4 sm:mb-6">
          <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <span className="text-white font-semibold px-2 truncate flex-1">
              {tabItems.find(tab => tab.id === activeTab)?.label}
            </span>
            <Button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 flex-shrink-0"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
          
          {mobileMenuOpen && (
            <div className="mt-2 bg-white/10 backdrop-blur-xl rounded-xl p-2 border border-white/20">
              {tabItems.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any)
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-black shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Tab Navigation */}
        <div className="hidden lg:flex border-b border-white/10 mb-6 sm:mb-8">
          <nav className="flex overflow-x-auto bg-white/5 backdrop-blur-sm rounded-t-2xl p-2 gap-1 scrollbar-hide">
            {tabItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 sm:py-3 px-3 sm:px-4 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-white text-black shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-300 flex items-center font-medium">
                    <Users className="h-4 w-4 mr-2 text-white" />
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stats.total_users}</div>
                  <p className="text-xs text-green-400 font-medium">↗ +12% this month</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-300 flex items-center font-medium">
                    <Building className="h-4 w-4 mr-2 text-white" />
                    Total Spaces
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stats.total_spaces}</div>
                  <p className="text-xs text-orange-400 font-medium">{stats.pending_spaces} pending</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-300 flex items-center font-medium">
                    <Calendar className="h-4 w-4 mr-2 text-white" />
                    Total Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stats.total_bookings}</div>
                  <p className="text-xs text-blue-400 font-medium">Active usage</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-300 flex items-center font-medium">
                    <CreditCard className="h-4 w-4 mr-2 text-white" />
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">₹{stats.total_revenue?.toLocaleString() || '0'}</div>
                  <p className="text-xs text-green-400 font-medium">All bookings</p>
                </CardContent>
              </Card>

              

              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-300 flex items-center font-medium">
                    <Clock className="h-4 w-4 mr-2 text-white" />
                    Pending Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-400">{stats.pending_verifications}</div>
                  <p className="text-xs text-gray-300 font-medium">Need review</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">Professional Member Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {VIBGYOR_CATEGORIES.map((category) => {
                    const vibgyorData = analytics?.vibgyor?.find((v: any) => v.role === category.id)
                    return (
                      <div key={category.id} className="text-center">
                        <div 
                          className={`w-16 h-16 rounded-xl mx-auto mb-2 flex items-center justify-center ${(category.id as string) === 'WHITE' ? 'text-black' : 'text-white'} font-bold text-sm shadow-lg`}
                          style={{ backgroundColor: category.color }}
                        >
                          {vibgyorData?.count || 0}
                        </div>
                        <p className={`text-xs font-medium text-white`}>{category.name}</p>
                        <p className="text-xs text-gray-400">members</p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300 rounded-2xl">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-semibold text-white">System Status</CardTitle>
                  <Button
                    size="sm"
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/admin/system-status')
                        if (response.ok) {
                          const data = await response.json()
                          if (data.success) {
                            setSystemStatus(data.data.systemStatus)
                          }
                        }
                      } catch (error) {
                        console.error('Failed to refresh system status:', error)
                      }
                    }}
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="flex justify-between items-center p-4 border border-white/20 rounded-xl bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300">
                    <div>
                      <span className="text-white font-medium">Payment Gateway</span>
                      <p className="text-xs text-gray-400 mt-1">{systemStatus?.paymentGateway?.message || 'Checking...'}</p>
                    </div>
                    <Badge className={`${systemStatus?.paymentGateway?.status === 'online' ? 'bg-green-600' : 'bg-red-600'} text-white shadow-lg`}>
                      {systemStatus?.paymentGateway?.status === 'online' ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-4 border border-white/20 rounded-xl bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300">
                    <div>
                      <span className="text-white font-medium">Database</span>
                      <p className="text-xs text-gray-400 mt-1">{systemStatus?.database?.message || 'Checking...'}</p>
                    </div>
                    <Badge className={`${systemStatus?.database?.status === 'online' ? 'bg-green-600' : 'bg-red-600'} text-white shadow-lg`}>
                      {systemStatus?.database?.status === 'online' ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-4 border border-white/20 rounded-xl bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300">
                    <div>
                      <span className="text-white font-medium">Email Service</span>
                      <p className="text-xs text-gray-400 mt-1">{systemStatus?.emailService?.message || 'Checking...'}</p>
                    </div>
                    <Badge className={`${systemStatus?.emailService?.status === 'online' ? 'bg-green-600' : 'bg-red-600'} text-white shadow-lg`}>
                      {systemStatus?.emailService?.status === 'online' ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-4 border border-white/20 rounded-xl bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300">
                    <div>
                      <span className="text-white font-medium">Environment</span>
                      <p className="text-xs text-gray-400 mt-1">{systemStatus?.environment?.message || 'Checking...'}</p>
                    </div>
                    <Badge className={`${systemStatus?.environment?.status === 'online' ? 'bg-green-600' : 'bg-red-600'} text-white shadow-lg`}>
                      {systemStatus?.environment?.status === 'online' ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}



        {/* Space Owners Tab */}
        {activeTab === 'users' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-white">Space Owners Management</h2>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search space owners..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-white/40"
                  />
                </div>
                
                <select
                  value={userTypeFilter}
                  onChange={(e) => setUserTypeFilter(e.target.value as any)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={verificationStatusFilter}
                  onChange={(e) => setVerificationStatusFilter(e.target.value as any)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                >
                  <option value="all">All Onboarding</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 rounded-2xl pt-4">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {filteredUsers.map((owner) => (
                    <div key={owner.id} className="p-6 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/10">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <Users className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-white">{owner.firstName} {owner.lastName}</h3>
                              <p className="text-gray-400 text-sm">{owner.email}</p>
                              <div className="flex gap-3 mt-1 text-sm text-gray-300">
                                <span>📞 {owner.phone}</span>
                                <span>📍 {owner.user?.city}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-300 mb-2">Business Information</h4>
                              <div className="space-y-1 text-sm text-gray-400">
                                {owner.business_info ? (
                                  <>
                                    <p>🏢 {owner.business_info.businessName}</p>
                                    <p>📄 {owner.business_info.businessType}</p>
                                    <p>🔢 GST: {owner.business_info.gstNumber}</p>
                                    <p>🆔 PAN: {owner.business_info.panNumber}</p>
                                  </>
                                ) : (
                                  <p>No business information available</p>
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-300 mb-2">Revenue & Payout</h4>
                              <div className="space-y-1 text-sm text-gray-400">
                                <p>💰 Total Revenue: ₹{owner.totalRevenue?.toLocaleString() || 0}</p>
                                <p>📊 Total Tax: ₹{owner.totalTax?.toLocaleString() || 0}</p>
                                <p className="text-green-400 font-semibold">💵 Pending Payout: ₹{owner.pendingPayout?.toLocaleString() || 0}</p>
                                <p>🏢 Spaces: {owner.spacesCount || 0}</p>
                                <p>📅 Total Bookings: {owner.totalBookings || 0}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-300 mb-2">Status & Onboarding</h4>
                              <div className="space-y-1 text-sm text-gray-400">
                                <p>✅ Onboarding: {owner.onboardingCompleted ? 'Completed' : 'Pending'}</p>
                                <p>📋 Approval: {owner.approvalStatus}</p>
                                <p>💎 Plan: {owner.premiumPlan}</p>
                                <p>📅 Joined: {new Date(owner.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 mt-4 sm:mt-0">
                          <div className="flex items-center gap-2">
                            <Badge className={`${
                              owner.isActive ? 'bg-green-600' : 'bg-red-600'
                            } text-white`}>
                              {owner.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        
                            <Badge className={`${
                              owner.approvalStatus === 'approved' ? 'bg-green-600' :
                              owner.approvalStatus === 'rejected' ? 'bg-red-600' :
                              'bg-yellow-600'
                            } text-white`}>
                              {owner.approvalStatus}
                            </Badge>

                            <Badge className={`${
                              owner.onboardingCompleted ? 'bg-blue-600' : 'bg-orange-600'
                            } text-black`}>
                              {owner.onboardingCompleted ? 'Onboarded' : 'Pending'}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                          <div className="flex gap-2">
                              {owner.approvalStatus === 'pending' && (
                                <>
                            <Button
                              size="sm"
                                    onClick={() => handleSpaceOwnerAction(owner.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                                    onClick={() => handleSpaceOwnerAction(owner.id, 'reject')}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                                </>
                              )}
                              
                              {!owner.onboardingCompleted && (
                                <Button
                                  size="sm"
                                  onClick={() => handleSpaceOwnerAction(owner.id, 'complete-onboarding')}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Complete Onboarding
                                </Button>
                              )}
                              
                              {(owner.pendingPayout || 0) > 0 && (
                                <Button
                                  size="sm"
                                  onClick={() => handlePayout(owner)}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CreditCard className="h-4 w-4 mr-1" />
                                  Process Payout
                                </Button>
                              )}
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSpaceOwnerAction(owner.id, 'view')}
                                className="text-white border-white/20 hover:bg-white/10"
                              >
                                <Eye className="h-4 w-4 text-black" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <div className="mb-4">
                        <p className="text-lg font-medium">No space owners found matching your criteria.</p>
                        <p className="text-sm mt-2">Try adjusting your search terms or filters.</p>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>• Check if you're logged in as an admin</p>
                        <p>• Try refreshing the page</p>
                        <p>• Check the browser console for errors</p>
                        <p>• Current filters: Status={userTypeFilter}, Onboarding={verificationStatusFilter}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Verification Tab */}
        {activeTab === 'verification' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-white">Business Verification</h2>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search verifications..."
                    value={verificationSearchTerm}
                    onChange={(e) => setVerificationSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-white/40"
                  />
                </div>
                
                <select
                  value={verificationStatusFilter}
                  onChange={(e) => setVerificationStatusFilter(e.target.value as any)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Card className="bg-amber-500/10 backdrop-blur-md border-amber-500/30 rounded-2xl pt-4">
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 text-amber-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-amber-400">{verificationRequests.filter(r => r.verificationStatus === 'pending').length}</div>
                  <p className="text-amber-300 text-sm">Pending Review</p>
                </CardContent>
              </Card>

              <Card className="bg-green-500/10 backdrop-blur-md border-green-500/30 rounded-2xl pt-4">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-green-400">{verificationRequests.filter(r => r.verificationStatus === 'verified').length}</div>
                  <p className="text-green-300 text-sm">Verified</p>
                </CardContent>
              </Card>

              <Card className="bg-red-500/10 backdrop-blur-md border-red-500/30 rounded-2xl pt-4">
                <CardContent className="p-6 text-center">
                  <XCircle className="h-8 w-8 text-red-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-red-400">{verificationRequests.filter(r => r.verificationStatus === 'rejected').length}</div>
                  <p className="text-red-300 text-sm">Rejected</p>
                </CardContent>
              </Card>

              <Card className="bg-blue-500/10 backdrop-blur-md border-blue-500/30 rounded-2xl pt-4">
                <CardContent className="p-6 text-center">
                  <ShieldCheck className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-blue-400">{verificationRequests.length}</div>
                  <p className="text-blue-300 text-sm">Total Requests</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 rounded-2xl pt-4">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {filteredVerificationRequests.map((request) => {
                    return (
                      <div key={request.id} className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2">
                              {request.spaceOwner?.firstName} {request.spaceOwner?.lastName} - {request.businessName}
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
                            <div>
                                <span className="block font-medium">Contact:</span>
                                <span>{request.spaceOwner?.email}</span><br />
                                <span>{request.spaceOwner?.phone}</span>
                          </div>
                          
                            <div>
                                <span className="block font-medium">Business Info:</span>
                                <span>Company: {request.businessName}</span><br />
                                <span>Type: {request.businessType}</span><br />
                                <span>City: {request.businessCity}</span>
                              </div>

                            <div>
                                <span className="block font-medium">Financial:</span>
                                <span>Spaces: {request.spacesCount}</span><br />
                                <span>Balance: ₹{request.businessBalance?.currentBalance?.toLocaleString() || 0}</span><br />
                                <span>Pending: ₹{request.businessBalance?.pendingAmount?.toLocaleString() || 0}</span>
                          </div>
                        </div>
                      
                            <p className="text-xs text-gray-400 mt-2">
                              Submitted: {formatDate(request.createdAt)}
                              {request.verifiedAt && ` • Verified: ${formatDate(request.verifiedAt)}`}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                              <Badge className={`${
                              request.verificationStatus === 'verified' ? 'bg-green-600' :
                              request.verificationStatus === 'rejected' ? 'bg-red-600' :
                                'bg-yellow-600'
                              } text-white`}>
                              {request.verificationStatus}
                              </Badge>
                            
                            {request.verificationStatus === 'pending' && (
                              <div className="flex flex-wrap gap-2">
                                  <Button
                                    size="sm"
                                  onClick={() => setSelectedVerification(request)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleVerificationAction(request.id, 'approve')}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                  Verify
                                  </Button>
                                  <Button
                                    size="sm"
                                  onClick={() => {
                                    setSelectedVerification(request)
                                    setShowRejectOptions(true)
                                  }}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                              </div>
                            )}
                            </div>
                          </div>
                        </div>
                    )
                  })}
                  
                  {filteredVerificationRequests.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      No verification requests found matching your criteria.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reverify Tab */}
        {activeTab === 'reverify' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-white">Business Info Re-verification</h2>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search re-verifications..."
                    value={verificationSearchTerm}
                    onChange={(e) => setVerificationSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-white/40"
                  />
                </div>
                
                <select
                  value={verificationStatusFilter}
                  onChange={(e) => setVerificationStatusFilter(e.target.value as any)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Card className="bg-amber-500/10 backdrop-blur-md border-amber-500/30 rounded-2xl pt-4">
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 text-amber-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-amber-400">{verificationRequests.filter(r => r.verificationStatus === 'pending').length}</div>
                  <p className="text-amber-300 text-sm">Pending Re-verification</p>
                </CardContent>
              </Card>

              <Card className="bg-green-500/10 backdrop-blur-md border-green-500/30 rounded-2xl pt-4">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-green-400">{verificationRequests.filter(r => r.verificationStatus === 'verified').length}</div>
                  <p className="text-green-300 text-sm">Re-verified</p>
                </CardContent>
              </Card>

              <Card className="bg-red-500/10 backdrop-blur-md border-red-500/30 rounded-2xl pt-4">
                <CardContent className="p-6 text-center">
                  <XCircle className="h-8 w-8 text-red-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-red-400">{verificationRequests.filter(r => r.verificationStatus === 'rejected').length}</div>
                  <p className="text-red-300 text-sm">Rejected</p>
                </CardContent>
              </Card>

              <Card className="bg-blue-500/10 backdrop-blur-md border-blue-500/30 rounded-2xl pt-4">
                <CardContent className="p-6 text-center">
                  <RefreshCw className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-blue-400">{verificationRequests.length}</div>
                  <p className="text-blue-300 text-sm">Total Requests</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 rounded-2xl pt-4">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {filteredVerificationRequests.map((request) => {
                    return (
                      <div key={request.id} className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2">
                              {request.spaceOwner?.firstName} {request.spaceOwner?.lastName} - {request.businessName}
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
                              <div>
                                <span className="block font-medium">Contact:</span>
                                <span>{request.spaceOwner?.email}</span><br />
                                <span>{request.spaceOwner?.phone}</span>
                              </div>
                              
                              <div>
                                <span className="block font-medium">Business Info:</span>
                                <span>Company: {request.businessName}</span><br />
                                <span>Type: {request.businessType}</span><br />
                                <span>City: {request.businessCity}</span>
                              </div>

                              <div>
                                <span className="block font-medium">Financial:</span>
                                <span>Spaces: {request.spacesCount}</span><br />
                                <span>Balance: ₹{request.businessBalance?.currentBalance?.toLocaleString() || 0}</span><br />
                                <span>Pending: ₹{request.businessBalance?.pendingAmount?.toLocaleString() || 0}</span>
                              </div>
                            </div>
                            
                            <p className="text-xs text-gray-400 mt-2">
                              Submitted: {formatDate(request.createdAt)}
                              {request.verifiedAt && ` • Last Verified: ${formatDate(request.verifiedAt)}`}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Badge className={`${
                              request.verificationStatus === 'verified' ? 'bg-green-600' :
                              request.verificationStatus === 'rejected' ? 'bg-red-600' :
                              'bg-yellow-600'
                            } text-white`}>
                              {request.verificationStatus}
                            </Badge>
                            
                            {request.verificationStatus === 'pending' && (
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => setSelectedVerification(request)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleVerificationAction(request.id, 'approve')}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Re-verify
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedVerification(request)
                                    setShowRejectOptions(true)
                                  }}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  
                  {filteredVerificationRequests.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <div className="mb-4">
                        <p className="text-lg font-medium">No re-verification requests found.</p>
                        <p className="text-sm mt-2">Try adjusting your search terms or filters.</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white">Platform Analytics</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 rounded-2xl pt-4">
                <CardHeader>
                  <CardTitle className="text-white">Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Revenue</span>
                      <span className="text-2xl font-bold text-green-400">₹{analytics?.revenue?.total?.toLocaleString() || stats.total_revenue?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">This Month</span>
                      <span className="text-white">₹{analytics?.revenue?.monthly?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Growth</span>
                      <span className="text-green-400">+{analytics?.revenue?.growth || 0}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

           

              <Card className="bg-white/10 backdrop-blur-md border-white/20 rounded-2xl pt-4">
                <CardHeader>
                  <CardTitle className="text-white">User Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Active Users</span>
                      <span className="text-2xl font-bold text-blue-400">{analytics?.users?.total || Math.floor(stats.total_users * 0.7)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Daily Active</span>
                      <span className="text-white">{Math.floor((analytics?.users?.total || stats.total_users) * 0.15)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Retention Rate</span>
                      <span className="text-green-400">78%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 rounded-2xl pt-4">
                <CardHeader>
                  <CardTitle className="text-white">Space Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Avg Occupancy</span>
                      <span className="text-2xl font-bold text-purple-400">{analytics?.spaces?.utilization || 73}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Peak Hours</span>
                      <span className="text-white">10AM - 2PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Popular Cities</span>
                      <span className="text-white">{analytics?.spaces?.popular_cities?.slice(0, 2).map((c: any) => c.name).join(', ') || 'Mumbai, Bangalore'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 rounded-2xl pt-4">
              <CardHeader>
                <CardTitle className="text-white">VIBGYOR Member Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {VIBGYOR_CATEGORIES.map((category) => {
                    const vibgyorData = analytics?.vibgyor?.find((v: any) => v.role === category.id)
                    return (
                      <div key={category.id} className="text-center">
                        <div 
                          className={`w-16 h-16 rounded-xl mx-auto mb-2 flex items-center justify-center font-bold text-sm shadow-lg ${category.id == 'WHITE' ? 'text-black' : 'text-white'}`}
                          style={{ backgroundColor: category.color }}
                        >
                        
                          {vibgyorData?.count || 0}
                        </div>
                        <p className="text-xs font-medium text-white">{category.name}</p>
                        <p className="text-xs text-gray-400">members</p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Premium Analytics Tab */}
        {activeTab === 'premium-analytics' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-white">Premium Owner Analytics</h2>
              <p className="text-gray-400">Detailed insights into premium vs basic space owners</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md border-purple-500/30 rounded-2xl pt-4">
                <CardContent className="p-6 text-center">
                  <Crown className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-purple-400">
                    {premiumAnalytics?.overview?.premiumOwners || 0}
                  </div>
                  <p className="text-purple-300 text-sm">Premium Owners</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {premiumAnalytics?.overview?.premiumOwnersPercentage?.toFixed(1) || 0}% of all owners
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-md border-blue-500/30 rounded-2xl pt-4">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-blue-400">
                    {premiumAnalytics?.overview?.basicOwners || 0}
                  </div>
                  <p className="text-blue-300 text-sm">Basic Owners</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {premiumAnalytics?.overview?.basicOwnersPercentage?.toFixed(1) || 0}% of all owners
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md border-green-500/30 rounded-2xl pt-4">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-green-400">
                    {premiumAnalytics?.revenue?.premiumShare?.toFixed(1) || 0}%
                  </div>
                  <p className="text-green-300 text-sm">Premium Revenue Share</p>
                  <p className="text-xs text-gray-400 mt-1">Despite being {premiumAnalytics?.overview?.premiumOwnersPercentage?.toFixed(1) || 0}% of owners</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md border-orange-500/30 rounded-2xl pt-4">
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="h-8 w-8 text-orange-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-orange-400">
                    {premiumAnalytics?.subscriptionRenewals?.count || 0}
                  </div>
                  <p className="text-orange-300 text-sm">Non-Renewed Subscriptions</p>
                  <p className="text-xs text-gray-400 mt-1">Expired in last 30 days</p>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/admin/premium-analytics', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'send_payment_reminder' })
                    })
                    if (response.ok) {
                      alert('Payment reminders sent successfully')
                    }
                  } catch (error) {
                    console.error('Error sending payment reminders:', error)
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Send Payment Reminders
              </Button>
              
              <Button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/admin/premium-analytics', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'send_renewal_reminder' })
                    })
                    if (response.ok) {
                      alert('Renewal reminders sent successfully')
                    }
                  } catch (error) {
                    console.error('Error sending renewal reminders:', error)
                  }
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Send Renewal Reminders
              </Button>
            </div>

            {/* Top Earning Space Owners */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 rounded-2xl pt-4">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">Top Earning Space Owners</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {premiumAnalytics?.topEarningOwners?.map((owner: any, index: number) => (
                    <div key={owner.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{owner.name}</h3>
                          <div className="flex items-center gap-2">
                            <Badge className={`${
                              owner.plan === 'premium' ? 'bg-purple-600' : 'bg-blue-600'
                            } text-white`}>
                              {owner.plan}
                            </Badge>
                            <span className="text-sm text-gray-400">{owner.bookings} bookings</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">₹{owner.total_revenue?.toLocaleString() || 0}</div>
                        <div className="text-sm text-gray-400">
                          Net: ₹{owner.netRevenue?.toLocaleString() || 0} • Tax: ₹{owner.taxAmount?.toLocaleString() || 0}
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-400">
                      No earning data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tax Configuration Tab */}
        {/* Support Tab */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Support Tickets</h2>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const fetchData = async () => {
                      const supportResponse = await fetch('/api/admin/support')
                      if (supportResponse.ok) {
                        const supportData = await supportResponse.json()
                        if (supportData.success) {
                          setSupportTickets(supportData.data)
                        }
                      }
                    }
                    fetchData()
                  }}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Support Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-300">Total Tickets</p>
                      <p className="text-2xl font-bold text-white">{supportTickets.length}</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-300">Open Tickets</p>
                      <p className="text-2xl font-bold text-white">
                        {supportTickets.filter(t => t.status === 'open').length}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-300">In Progress</p>
                      <p className="text-2xl font-bold text-white">
                        {supportTickets.filter(t => t.status === 'in_progress').length}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-300">Resolved</p>
                      <p className="text-2xl font-bold text-white">
                        {supportTickets.filter(t => t.status === 'resolved').length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Support Tickets List */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">All Support Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supportTickets.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">No support tickets found</p>
                    </div>
                  ) : (
                    supportTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedTicket(ticket)
                          setShowTicketDialog(true)
                          setAdminResponse('')
                          setInternalNotes('')
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-white">{ticket.subject}</h3>
                              <Badge
                                variant={
                                  ticket.status === 'open' ? 'destructive' :
                                  ticket.status === 'in_progress' ? 'warning' :
                                  ticket.status === 'resolved' ? 'success' : 'default'
                                }
                              >
                                {ticket.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                              <Badge
                                variant={
                                  ticket.priority === 'urgent' ? 'destructive' :
                                  ticket.priority === 'high' ? 'warning' :
                                  ticket.priority === 'medium' ? 'default' : 'success'
                                }
                              >
                                {ticket.priority.toUpperCase()}
                              </Badge>
                              <Badge variant="default">
                                {ticket.userRole === 'owner' ? 'Space Owner' : 'User'}
                              </Badge>
                            </div>
                            <p className="text-gray-300 text-sm mb-2 line-clamp-2">{ticket.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span>#{ticket.ticketNumber}</span>
                              <span>•</span>
                              <span>{ticket.user?.firstName} {ticket.user?.lastName}</span>
                              <span>•</span>
                              <span>{ticket.user?.email}</span>
                              <span>•</span>
                              <span>{formatDate(ticket.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">
                              {ticket.messages?.length || 0} messages
                            </span>
                            <Eye className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'tax-config' && (
          <TaxConfigurationComponent />
        )}
      </div>

      {/* Verification Details Modal */}
      <Dialog open={selectedVerification !== null && !showRejectOptions} onOpenChange={() => setSelectedVerification(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Business Verification Details</DialogTitle>
          </DialogHeader>
          {selectedVerification && (
            <div className="space-y-6 text-white">
              {/* User Info */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">User Information</h3>
                {(() => {
                  const requestUser = users.find(u => u.id === selectedVerification.spaceOwnerId)
                  return (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-400">Name:</span>
                        <p>{requestUser?.firstName} {requestUser?.lastName}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Email:</span>
                        <p>{requestUser?.email}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Phone:</span>
                        <p>{requestUser?.phone}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">City:</span>
                        <p>{requestUser?.user?.city}</p>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Business Details */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Business Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400">Company Name:</span>
                    <p>{selectedVerification.businessName}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Business Type:</span>
                    <p>{selectedVerification.businessType}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">GST Number:</span>
                    <p>{selectedVerification.gstNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">PAN Number:</span>
                    <p>{selectedVerification.panNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">City:</span>
                    <p>{selectedVerification.businessCity}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">State:</span>
                    <p>{selectedVerification.businessState}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-gray-400">Address:</span>
                  <p>{selectedVerification.businessAddress}</p>
                </div>
              </div>

              {/* Space Details */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Space Details</h3>
                {selectedVerification.spaces && selectedVerification.spaces.length > 0 ? (
                    <div className="space-y-3">
                    {selectedVerification.spaces.map(space => (
                        <div key={space.id} className="bg-gray-700 p-3 rounded">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{space.name}</h4>
                              <p className="text-sm text-gray-400">{space.city}</p>
                            </div>
                            <div className="text-right">
                              <Badge className={`${
                                space.status === 'approved' ? 'bg-green-600' :
                                space.status === 'rejected' ? 'bg-red-600' :
                                'bg-yellow-600'
                            } text-white`}>
                                {space.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                ) : (
                  <p className="text-gray-400 text-sm">No spaces registered yet.</p>
                )}
              </div>

              {/* Financial Information */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Financial Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400">Current Balance:</span>
                    <p>₹{selectedVerification.businessBalance?.currentBalance?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Pending Amount:</span>
                    <p>₹{selectedVerification.businessBalance?.pendingAmount?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Total Earned:</span>
                    <p>₹{selectedVerification.businessBalance?.totalEarned?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Spaces Count:</span>
                    <p>{selectedVerification.spacesCount || '0'}</p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Bank Account Details</h3>
                {selectedVerification.spaceOwner?.paymentInfo ? (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400">Account Holder Name:</span>
                      <p className="font-medium">{selectedVerification.spaceOwner.paymentInfo.bankAccountHolderName}</p>
                    </div>
                  <div>
                    <span className="text-gray-400">Bank Name:</span>
                      <p className="font-medium">{selectedVerification.spaceOwner.paymentInfo.bankName}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Account Number:</span>
                      <p className="font-mono text-sm bg-gray-700 px-2 py-1 rounded">
                        {selectedVerification.spaceOwner.paymentInfo.bankAccountNumber}
                      </p>
                  </div>
                  <div>
                    <span className="text-gray-400">IFSC Code:</span>
                      <p className="font-mono text-sm bg-gray-700 px-2 py-1 rounded">
                        {selectedVerification.spaceOwner.paymentInfo.bankIfscCode}
                      </p>
                  </div>
                    <div className="col-span-2">
                      <span className="text-gray-400">UPI ID:</span>
                      <p className="font-mono text-sm bg-gray-700 px-2 py-1 rounded">
                        {selectedVerification.spaceOwner.paymentInfo.upiId}
                      </p>
                  </div>
                    <div className="col-span-2">
                      <span className="text-gray-400">Added On:</span>
                      <p className="text-sm text-gray-300">
                        {formatDate(selectedVerification.spaceOwner.paymentInfo.createdAt)}
                      </p>
                </div>
              </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400 text-sm">No payment information available</p>
                    <p className="text-gray-500 text-xs mt-1">Space owner hasn't added bank account details yet</p>
                  </div>
                  )}
                </div>

              {/* Verification Status */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Verification Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <p className={`font-medium ${
                      selectedVerification.verificationStatus === 'verified' ? 'text-green-400' :
                      selectedVerification.verificationStatus === 'rejected' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {selectedVerification.verificationStatus}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Verified By:</span>
                    <p>{selectedVerification.verifiedBy || 'Not verified'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Verified At:</span>
                    <p>{selectedVerification.verifiedAt ? formatDate(selectedVerification.verifiedAt) : 'Not verified'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Rejection Reason:</span>
                    <p>{selectedVerification.rejectionReason || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Options Modal */}
      <Dialog open={showRejectOptions} onOpenChange={() => setShowRejectOptions(false)}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Verification Rejection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-white">
            <p>Choose what happens to the user after rejection:</p>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="reapply"
                  checked={rejectAction === 'reapply'}
                  onChange={(e) => setRejectAction(e.target.value as any)}
                  className="text-blue-500"
                />
                <span>Allow user to apply again</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="delete"
                  checked={rejectAction === 'delete'}
                  onChange={(e) => setRejectAction(e.target.value as any)}
                  className="text-blue-500"
                />
                <span>Delete user account</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="ban"
                  checked={rejectAction === 'ban'}
                  onChange={(e) => setRejectAction(e.target.value as any)}
                  className="text-blue-500"
                />
                <span>Permanently ban user from applying</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowRejectOptions(false)}
                className="border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedVerification) {
                    handleVerificationReject(selectedVerification.id, rejectAction)
                  }
                  setShowRejectOptions(false)
                  setSelectedVerification(null)
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Reject & {rejectAction === 'reapply' ? 'Allow Reapply' : 
                          rejectAction === 'delete' ? 'Delete User' : 'Ban User'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payout Dialog */}
      <PayoutDialog
        isOpen={showPayoutDialog}
        onClose={() => setShowPayoutDialog(false)}
        spaceOwner={selectedSpaceOwner}
        onPayoutProcessed={() => {
          // Refresh space owners data
          const fetchData = async () => {
            const spaceOwnersResponse = await fetch('/api/admin/space-owners')
            if (spaceOwnersResponse.ok) {
              const spaceOwnersData = await spaceOwnersResponse.json()
              if (spaceOwnersData.success) {
                setUsers(spaceOwnersData.data.spaceOwners as SpaceOwnerData[])
              }
            }
          }
          fetchData()
        }}
      />

      {/* Support Ticket Dialog */}
      <Dialog open={showTicketDialog} onOpenChange={() => setShowTicketDialog(false)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Support Ticket Details</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-6">
              {/* Ticket Header */}
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedTicket.subject}</h3>
                    <p className="text-sm text-gray-400">#{selectedTicket.ticketNumber}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      variant={
                        selectedTicket.status === 'open' ? 'destructive' :
                        selectedTicket.status === 'in_progress' ? 'warning' :
                        selectedTicket.status === 'resolved' ? 'success' : 'default'
                      }
                    >
                      {selectedTicket.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge
                      variant={
                        selectedTicket.priority === 'urgent' ? 'destructive' :
                        selectedTicket.priority === 'high' ? 'warning' :
                        selectedTicket.priority === 'medium' ? 'default' : 'success'
                      }
                    >
                      {selectedTicket.priority.toUpperCase()}
                    </Badge>
                    <Badge variant="default">
                      {selectedTicket.userRole === 'owner' ? 'Space Owner' : 'User'}
                    </Badge>
                  </div>
                </div>
                <p className="text-gray-300">{selectedTicket.description}</p>
                <div className="mt-4 text-sm text-gray-400">
                  <p><strong>User:</strong> {selectedTicket.user?.firstName} {selectedTicket.user?.lastName} ({selectedTicket.user?.email})</p>
                  <p><strong>Category:</strong> {selectedTicket.category}</p>
                  <p><strong>Created:</strong> {formatDate(selectedTicket.createdAt)}</p>
                  <p><strong>Updated:</strong> {formatDate(selectedTicket.updatedAt)}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Conversation</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedTicket.messages?.map((message: any) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.isFromSupport
                          ? 'bg-blue-500/20 ml-8'
                          : 'bg-gray-500/20 mr-8'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-300">
                          {message.isFromSupport ? 'Admin' : selectedTicket.userRole === 'owner' ? 'Space Owner' : 'User'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                      <p className="text-white text-sm">{message.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Response */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Admin Response</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Response to User
                    </label>
                    <textarea
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      placeholder="Type your response to the user..."
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Internal Notes
                    </label>
                    <textarea
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="Internal notes (not visible to user)..."
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/admin/support/${selectedTicket.id}/respond`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ message: adminResponse })
                        })
                        if (response.ok) {
                          setAdminResponse('')
                          // Refresh tickets
                          const supportResponse = await fetch('/api/admin/support')
                          if (supportResponse.ok) {
                            const supportData = await supportResponse.json()
                            if (supportData.success) {
                              setSupportTickets(supportData.data)
                            }
                          }
                        }
                      } catch (error) {
                        console.error('Error responding to ticket:', error)
                      }
                    }}
                    disabled={!adminResponse.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Send Response
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/admin/support', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            ticketId: selectedTicket.id,
                            status: 'resolved',
                            adminResponse: adminResponse,
                            internalNotes: internalNotes
                          })
                        })
                        if (response.ok) {
                          setShowTicketDialog(false)
                          // Refresh tickets
                          const supportResponse = await fetch('/api/admin/support')
                          if (supportResponse.ok) {
                            const supportData = await supportResponse.json()
                            if (supportData.success) {
                              setSupportTickets(supportData.data)
                            }
                          }
                        }
                      } catch (error) {
                        console.error('Error updating ticket:', error)
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Mark as Resolved
                  </Button>
                </div>
                <Button
                  onClick={() => setShowTicketDialog(false)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}