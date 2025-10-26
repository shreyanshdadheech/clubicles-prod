'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search, MapPin, Navigation, Globe } from 'lucide-react'
import DataService from '@/lib/data-service'
import { OwnerDataService, type OwnerDashboardData, type OwnerSpace as OwnerSpaceType, type OwnerBooking } from '@/lib/services/owner-data-service'
import { 
  Building, 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Eye,
  Edit,
  Plus,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Settings,
  Bell,
  Trash2,
  FileText,
  CreditCard,
  Mail,
  LineChart,
  PieChart,
  Activity,
  Save,
  X,
  LogOut,
  Crown,
  Wallet,
  Lock,
  MessageSquare,
  Menu
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PremiumFeatures } from '@/components/dashboard/premium-features'
import { OwnerFinancialDashboard } from '@/components/owner/financial-dashboard'
import { RedemptionPortal } from '@/components/owner/redemption-portal'
import { useAuth } from '@/contexts/AuthContext'
import { User } from '@/types'
import { PendingApprovalView } from '@/components/owner/pending-approval'
import { RejectedApprovalView } from '@/components/owner/rejected-approval'
import { BookingManagement } from '@/components/owner/booking-management'
import { deleteCookie } from '@/lib/utils'

// Custom interface for owner dashboard spaces
// Use types from the service
type OwnerSpace = OwnerSpaceType
type PremiumPlan = 'basic' | 'premium'

interface Booking {
  id: string
  spaceName: string
  customerName: string
  date: string
  time: string
  duration: string
  amount: number
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled'
}

function OwnerDashboardContent() {
  const { signOut } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [isLoadingDashboard, setIsLoading] = useState(true)
  const [userState, setUserState] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'spaces' | 'bookings'| 'premium' | 'financial' | 'support' | 'settings'>('overview')
  const [userPlan, setUserPlan] = useState<PremiumPlan>('basic')
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null)
  const [isLoadingDashboardSubscription, setIsLoadingSubscription] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Support ticket states
  const [showTicketDialog, setShowTicketDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [ticketSubject, setTicketSubject] = useState('')
  const [ticketDescription, setTicketDescription] = useState('')
  const [ticketPriority, setTicketPriority] = useState('medium')
  const [isCreatingTicket, setIsCreatingTicket] = useState(false)
  
  // Support tickets listing and reply states
  const [supportTickets, setSupportTickets] = useState<any[]>([])
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [showTicketDetails, setShowTicketDetails] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')
  const [isLoadingTickets, setIsLoadingTickets] = useState(false)
  const [isReplying, setIsReplying] = useState(false)

  // Support ticket creation function
  const createSupportTicket = async (category: string, subject: string, description: string, priority: string) => {
    try {
      setIsCreatingTicket(true)
      
      const response = await fetch('/api/owner/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          description,
          category,
          priority
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Reset form
          setSelectedCategory('')
          setTicketSubject('')
          setTicketDescription('')
          setTicketPriority('medium')
          setShowTicketDialog(false)
          
          // Show success message (you could add a toast notification here)
          alert('Support ticket created successfully! We\'ll get back to you soon.')
        } else {
          alert('Failed to create support ticket. Please try again.')
        }
      } else {
        alert('Failed to create support ticket. Please try again.')
      }
    } catch (error) {
      console.error('Error creating support ticket:', error)
      alert('An error occurred while creating the support ticket.')
    } finally {
      setIsCreatingTicket(false)
    }
  }

  // Handle category button clicks
  const handleCategoryClick = (category: string, defaultSubject: string, defaultDescription: string) => {
    setSelectedCategory(category)
    setTicketSubject(defaultSubject)
    setTicketDescription(defaultDescription)
    setShowTicketDialog(true)
  }

  // Fetch support tickets
  const fetchSupportTickets = async () => {
    try {
      setIsLoadingTickets(true)
      const response = await fetch('/api/owner/support')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setSupportTickets(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching support tickets:', error)
    } finally {
      setIsLoadingTickets(false)
    }
  }

  // Handle ticket selection
  const handleTicketClick = (ticket: any) => {
    // Prevent opening closed or resolved tickets
    if (ticket.status === 'closed' || ticket.status === 'resolved') {
      alert('This ticket has been closed/resolved and cannot be opened.')
      return
    }
    
    setSelectedTicket(ticket)
    setShowTicketDetails(true)
    setReplyMessage('')
  }

  // Handle reply submission
  const handleReplySubmit = async () => {
    if (!selectedTicket || !replyMessage.trim()) return

    try {
      setIsReplying(true)
      const response = await fetch(`/api/owner/support/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: replyMessage }),
      })

      if (response.ok) {
        setReplyMessage('')
        // Refresh tickets to get updated messages
        await fetchSupportTickets()
        // Update selected ticket with new messages
        const updatedTickets = await fetch('/api/owner/support').then(res => res.json())
        if (updatedTickets.success) {
          const updatedTicket = updatedTickets.data.find((t: any) => t.id === selectedTicket.id)
          if (updatedTicket) {
            setSelectedTicket(updatedTicket)
          }
        }
      }
    } catch (error) {
      console.error('Error sending reply:', error)
    } finally {
      setIsReplying(false)
    }
  }

  // Fetch support tickets when support tab is active
  useEffect(() => {
    if (activeTab === 'support') {
      fetchSupportTickets()
    }
  }, [activeTab])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen) {
        const target = event.target as Element
        if (!target.closest('.mobile-menu-container')) {
          setIsMobileMenuOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  // Fetch user data and check ownership
  useEffect(() => {
    const fetchUserAndCheckOwnership = async () => {
      try {
        console.log('🔍 Owner: Fetching user data from /api/auth/me')
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          console.log('🔍 Owner: API response:', data)
          
          if (data.success && data.user) {
            const currentUser = data.user
            setUser(currentUser)
            setUserState(currentUser)

            // Check if user is admin first
            const adminEmails = [
              'shreyanshdadheech@gmail.com',
              'admin@clubicles.com',
              'yogesh.dubey.0804@gmail.com'
            ]
            
            if (adminEmails.includes(currentUser.email || '')) {
              console.log('🔍 Owner: User is admin, allowing access')
              return
            }

            // Check if user is a space owner
            if (currentUser.roles !== 'owner' && currentUser.roles !== 'admin') {
              console.log('🔍 Owner: User is not space owner, redirecting to signin')
              window.location.href = '/signin?returnUrl=' + encodeURIComponent('/owner')
            }
          } else {
            console.log('🔍 Owner: No user data in response, redirecting to signin')
            window.location.href = '/signin?returnUrl=' + encodeURIComponent('/owner')
          }
        } else {
          console.log('🔍 Owner: API call failed, redirecting to signin')
          window.location.href = '/signin?returnUrl=' + encodeURIComponent('/owner')
        }
        
      } catch (err) {
        console.error('Error fetching user data:', err)
        window.location.href = '/signin?returnUrl=' + encodeURIComponent('/owner')
      } finally {
        console.log('🔍 Owner: Setting loading to false')
        setIsLoading(false)
      }
    }
    
    fetchUserAndCheckOwnership()
  }, [])

  // Redirect non-owner users to /signin
  useEffect(() => {
    const checkOwnership = async () => {
      const currentUser = user
      
      if (!currentUser) return
      
      if (currentUser.roles !== 'owner' && currentUser.roles !== 'admin') {
        // User is not a space owner or admin, redirect to signin
        window.location.href = '/signin?returnUrl=' + encodeURIComponent('/owner')
      }
    }
    
    checkOwnership()
  }, [user])
   
  // Load user plan from database
  const loadUserPlan = async () => {
    try {
      const response = await fetch('/api/owner/subscription', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        const plan = data.currentPlan === 'premium' ? 'premium' : 'basic'
        setUserPlan(plan)
        // Update localStorage to persist the plan
        if (typeof window !== 'undefined') {
          localStorage.setItem('userPremiumPlan', plan)
        }
        setSubscriptionInfo(data)
      }
    } catch (error) {
      console.error('Error loading user plan:', error)
      // Fallback to localStorage
    if (typeof window !== 'undefined') {
      const plan = (localStorage.getItem('userPremiumPlan') as PremiumPlan) || 'basic'
      setUserPlan(plan)
      }
    }
  }

  // Get user premium plan from database or localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // First try to load from database
      loadUserPlan()
    }
  }, [])

  // Refresh user plan when page becomes visible (e.g., after returning from pricing page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadUserPlan()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Get current user using auth context
  useEffect(() => {
    const getSession = async () => {
      try {
        console.log('🔍 Getting user from auth context...')
        const currentUser = user
        console.log('👤 Current user:', currentUser ? { id: currentUser.id, email: currentUser.email } : 'Not logged in')
        
        if (currentUser) {
          // Map Supabase user to our User type
          const mappedUser: User = {
            id: currentUser.id,
            auth_id: currentUser.id,
            email: currentUser.email || '',
            first_name: currentUser.first_name || '',
            last_name: currentUser.last_name || '',
            phone: currentUser.phone || '',
            city: currentUser.city || '',
            professional_role: currentUser.professional_role || undefined,
            roles: 'owner',
            is_active: true,
            created_at: currentUser.created_at || '',
            updated_at: currentUser.updated_at || currentUser.created_at || ''
          }
          setUserState(mappedUser)
        } else {
          setUserState(null)
        }
      } catch (error) {
        console.error('❌ Error getting session:', error)
        setUserState(null)
      }
    }
    
    getSession()

    // No need to listen for auth changes since we're using AuthContext
    // The user state is managed by the AuthContext
    if (user) {
      setUserState(user)
    } else {
      setUserState(null)
    }
  }, [user])

  // Fetch subscription information
  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      if (!user?.id) return
      
      setIsLoadingSubscription(true)
      try {
        const response = await fetch(`/api/owner/subscription?ownerId=${user.id}`)
        const data = await response.json()
        
        if (response.ok) {
          setSubscriptionInfo(data)
          if (data.currentSubscription?.status === 'active') {
            setUserPlan('premium')
          }
        }
      } catch (error) {
        console.error('Failed to fetch subscription info:', error)
      } finally {
        setIsLoadingSubscription(false)
      }
    }

    fetchSubscriptionInfo()
  }, [user?.id])
  
  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    bookingEmailNotifications: true,
    reviewEmailNotifications: true,
    paymentReminders: true
  })

  // Add space dialog state
  const [showAddSpaceDialog, setShowAddSpaceDialog] = useState(false)

  // Handle opening add space dialog with plan check
  const handleOpenAddSpaceDialog = () => {
    if (userPlan === 'basic' && spaces.length >= 5) {
      alert('You\'ve reached your plan limit of 5 spaces. Upgrade to Premium for unlimited spaces!')
      setActiveTab('premium')
      return
    }
    setShowAddSpaceDialog(true)
  }
  const [showEditSpaceDialog, setShowEditSpaceDialog] = useState(false)
  const [editingSpace, setEditingSpace] = useState<OwnerSpace | null>(null)
  const [newSpace, setNewSpace] = useState({
    name: '',
    city: '',
    fullAddress: '',
    pincode: '',
    latitude: 19.0760, // Default to Mumbai
    longitude: 72.8777,
    hourlyRate: '',
    dailyRate: '',
    description: '',
    companyName: '',
    contactNumber: '',
    amenities: [] as string[],
    category: '',
    totalSeats: '',
    availableSeats: ''
  })

  // Form validation errors
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})

  // Edit space form state
  const [editSpace, setEditSpace] = useState({
    name: '',
    city: '',
    fullAddress: '',
    pincode: '',
    latitude: 19.0760,
    longitude: 72.8777,
    hourlyRate: '',
    dailyRate: '',
    description: '',
    companyName: '',
    contactNumber: '',
    amenities: [] as string[],
    category: '',
    totalSeats: '',
    availableSeats: ''
  })

  // Business info state
  const [businessInfo, setBusinessInfo] = useState({
    companyName: '',
    gstNumber: '',
    panNumber: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    businessType: 'Private Limited',
    city: '',
    state: '',
    pincode: ''
  })

  // Payment info state
  const [paymentInfo, setPaymentInfo] = useState({
    bankAccountNumber: '',
    bankIfscCode: '',
    bankAccountHolderName: '',
    bankName: '',
    upiId: '',
    businessAddress: '',
    businessEmail: '',
    businessPhone: '',
    accountType: 'savings',
    branchCode: '',
    paypalEmail: '',
    paymentSchedule: 'weekly',
    minimumPayoutAmount: '500',
    tdsDeduction: 'auto',
    form16Generation: true
  })

  // Payment system state
  const [paymentHistory, setPaymentHistory] = useState<any[]>([])
  const [businessBalance, setBusinessBalance] = useState({
    currentBalance: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
    pendingAmount: 0,
    commissionDeducted: 0,
    taxDeducted: 0,
    lastPayoutDate: null
  })
  const [paymentStats, setPaymentStats] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    totalAmountPaid: 0,
    recentAmount: 0,
    successRate: 0
  })
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  // Signout handler
  const handleSignOut = async () => {
    signOut()
    deleteCookie('stype')
    window.location.href = '/signin'
  }

  // Approval system state
  const [approvalStatus, setApprovalStatus] = useState<'approved' | 'pending' | 'rejected' | null>(null)
  const [ownerInfo, setOwnerInfo] = useState<any>(null)
  const [ownerId, setOwnerId] = useState<string | null>(null)
  const [approvalLoading, setApprovalLoading] = useState(true)

  // Check approval status on component mount - use real API call
  useEffect(() => {
    const checkApprovalStatus = async () => {
      setApprovalLoading(true)
      try {
        console.log('🔄 Checking approval status...')
        const response = await fetch('/api/owner/approval-status')
        const data = await response.json()
        
        if (response.ok) {
          console.log('✅ Approval status received:', data.approval_status)
          setApprovalStatus(data.approval_status)
          setOwnerInfo(data.owner_info)
          setOwnerId(data.owner_id)
        } else {
          console.error('❌ Failed to check approval status:', data.error)
          // If we can't check status, assume pending for safety
          setApprovalStatus('pending')
        }
      } catch (error) {
        console.error('❌ Error checking approval status:', error)
        setApprovalStatus('pending')
      } finally {
        setApprovalLoading(false)
      }
    }

    checkApprovalStatus()
  }, [])

  // Function to retry checking approval status
  const retryApprovalCheck = () => {
    setApprovalLoading(true)
    setTimeout(async () => {
      try {
        const response = await fetch('/api/owner/approval-status')
        const data = await response.json()
        
        if (response.ok) {
          setApprovalStatus(data.approval_status)
          setOwnerInfo(data.owner_info)
          setOwnerId(data.owner_id)
        }
      } catch (error) {
        console.error('Retry failed:', error)
      } finally {
        setApprovalLoading(false)
      }
    }, 500)
  }

  // Function to remove a space
  const handleRemoveSpace = async (spaceId: string) => {
    // Check if user is on premium plan
    if (userPlan !== 'premium') {
      alert('Delete space is only available for Premium users. Please upgrade to Premium to delete spaces.')
      setActiveTab('premium') // Navigate to premium tab
      return
    }

    if (!confirm('Are you sure you want to delete this space? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/owner/spaces/${spaceId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete space')
      }

      if (result.success) {
        // Remove from local state
        setSpaces(spaces.filter(space => space.id !== spaceId))
        alert(result.message || 'Space deleted successfully')
      }
    } catch (error) {
      console.error('Error deleting space:', error)
      alert(`Failed to delete space: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Function to edit a space
  const handleEditSpace = (space: OwnerSpace) => {
    setEditingSpace(space)
    setEditSpace({
      name: space.name,
      city: space.location.split(',')[0],
      fullAddress: space.fullAddress || '',
      pincode: space.pincode || '',
      latitude: space.latitude || 19.0760,
      longitude: space.longitude || 72.8777,
      hourlyRate: (space.hourlyRate || 0).toString(),
      dailyRate: (space.dailyRate || 0).toString(),
      description: space.description || '',
      companyName: space.companyName || '',
      contactNumber: space.contactNumber || '',
      amenities: space.amenities || [],
      category: space.category || '',
      totalSeats: space.total_seats?.toString() || '50',
      availableSeats: space.available_seats?.toString() || '40'
    })
    setShowEditSpaceDialog(true)
  }

  // Function to delete a space
  const handleDeleteSpace = async (spaceId: string) => {
    // Check if user is on premium plan
    if (userPlan !== 'premium') {
      alert('Delete space is only available for Premium users. Please upgrade to Premium to delete spaces.')
      setActiveTab('premium') // Navigate to premium tab
      return
    }

    if (!confirm('Are you sure you want to delete this space? This action cannot be undone and will also delete all associated bookings.')) {
      return
    }

    try {
      const response = await fetch(`/api/owner/spaces/${spaceId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Remove space from local state
        setSpaces(prev => prev.filter(space => space.id !== spaceId))
        
        // Refresh dashboard data to update analytics
        await loadDashboardData()
        
        alert('Space deleted successfully!')
      } else {
        throw new Error(result.error || 'Failed to delete space')
      }
    } catch (error) {
      console.error('Error deleting space:', error)
      alert(`Failed to delete space: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Function to save edited space
  const handleSaveEditedSpace = async () => {
    if (!editingSpace || !editSpace.name || !editSpace.city) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const updateData = {
        name: editSpace.name,
        description: editSpace.description || editingSpace.description,
        address: editSpace.fullAddress,
        city: editSpace.city,
        pincode: editSpace.pincode,
        latitude: editSpace.latitude.toString(),
        longitude: editSpace.longitude.toString(),
        total_seats: parseInt(editSpace.totalSeats) || editingSpace.total_seats,
        available_seats: parseInt(editSpace.availableSeats) || editingSpace.available_seats,
        price_per_hour: parseFloat(editSpace.hourlyRate) || editingSpace.hourlyRate,
        price_per_day: parseFloat(editSpace.dailyRate) || editingSpace.dailyRate,
        amenities: editSpace.amenities || editingSpace.amenities,
        images: editingSpace.images || [], // Keep existing images
        company_name: editSpace.companyName,
        contact_number: editSpace.contactNumber
      }

      console.log('Updating space with data:', updateData)
      console.log('Space ID:', editingSpace.id)

      const response = await fetch(`/api/owner/spaces/${editingSpace.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })

      console.log('Update response status:', response.status)
      const result = await response.json()
      console.log('Update response:', result)

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update space')
      }

      if (result.success) {
        // Update local state with the returned data
        const dbSpace = result.space
        
        if (!dbSpace) {
          console.error('No space data returned from API')
          alert('Failed to update space: No data returned from server')
          return
        }

        const updatedFrontendSpace: OwnerSpace = {
          ...editingSpace,
          name: dbSpace.name || editingSpace.name,
          description: dbSpace.description || editingSpace.description,
          location: `${dbSpace.city || editingSpace.location?.split(',')[0] || 'Unknown'}, India`,
          fullAddress: dbSpace.address || editingSpace.fullAddress,
          hourlyRate: parseFloat(dbSpace.price_per_hour) || editingSpace.hourlyRate,
          dailyRate: parseFloat(dbSpace.price_per_day) || editingSpace.dailyRate,
          total_seats: dbSpace.total_seats || editingSpace.total_seats,
          available_seats: dbSpace.available_seats || editingSpace.available_seats,
          amenities: dbSpace.amenities || editingSpace.amenities || []
        }

        const updatedSpaces = spaces.map(space => 
          space.id === editingSpace.id ? updatedFrontendSpace : space
        )
        
        setSpaces(updatedSpaces)
        setShowEditSpaceDialog(false)
        setEditingSpace(null)
        
        alert('Space updated successfully!')

        // Reset edit form
        setEditSpace({
          name: '',
          city: '',
          fullAddress: '',
          pincode: '',
          latitude: 19.0760,
          longitude: 72.8777,
          hourlyRate: '',
          dailyRate: '',
          description: '',
          companyName: '',
          contactNumber: '',
          amenities: [],
          category: '',
          totalSeats: '',
          availableSeats: ''
        })
      } else {
        console.error('Update failed:', result.error)
        alert(`Failed to update space: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating space:', error)
      alert(`Failed to update space: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Real data states
  const [dashboardData, setDashboardData] = useState<OwnerDashboardData | null>(null)
  const [spaces, setSpaces] = useState<OwnerSpaceType[]>([])
  const [recentBookings, setRecentBookings] = useState<OwnerBooking[]>([])
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [isLoadingDashboardDashboard, setIsLoadingDashboard] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load real dashboard data
  const loadDashboardData = async () => {
    try {
      setIsLoadingDashboard(true)
      setError(null)
      
      // Fetch dashboard data from API - pass user for better session handling
      const data = await OwnerDataService.getDashboardData(user)
      console.log('🔍 Dashboard data received:', data)
      console.log('🔍 Analytics data:', data.analytics)
      console.log('🔍 Recent bookings:', data.recentBookings)
      console.log('🔍 Spaces data:', data.spaces)
      console.log('🔍 Total Revenue:', data.analytics?.totalRevenue)
      console.log('🔍 Total Bookings:', data.analytics?.totalBookings)
      
      // Debug individual space data
      if (data.spaces && data.spaces.length > 0) {
        console.log('🔍 First space detailed data:', {
          id: data.spaces[0].id,
          name: data.spaces[0].name,
          totalBookings: data.spaces[0].totalBookings,
          revenue: data.spaces[0].revenue,
          allProperties: Object.keys(data.spaces[0])
        })
      }
      setDashboardData(data)
      setSpaces(data.spaces || [])
      setRecentBookings(data.recentBookings || [])
      
      // Populate business information from API data
      if (data.businessInfo) {
        setBusinessInfo({
          companyName: (data.businessInfo as any).businessName || '',
          gstNumber: (data.businessInfo as any).gstNumber || '',
          panNumber: (data.businessInfo as any).panNumber || '',
          address: (data.businessInfo as any).businessAddress || '',
          contactEmail: (data.owner as any)?.email || user?.email || '',
          contactPhone: (data.owner as any)?.phone || user?.phone || '',
          businessType: (data.businessInfo as any).businessType || 'Private Limited',
          city: (data.businessInfo as any).businessCity || '',
          state: (data.businessInfo as any).businessState || '',
          pincode: (data.businessInfo as any).businessPincode || ''
        })
      }

      // Populate payment information from API data
      
      const newPaymentInfo = {
        bankAccountNumber: (data.paymentInfo as any)?.bankAccountNumber || '',
        bankIfscCode: (data.paymentInfo as any)?.bankIfscCode || '',
        bankAccountHolderName: (data.paymentInfo as any)?.bankAccountHolderName || '',
        bankName: (data.paymentInfo as any)?.bankName || '',
        upiId: (data.paymentInfo as any)?.upiId || '',
        businessAddress: (data.paymentInfo as any)?.businessAddress || 
                        (data.businessInfo as any)?.businessAddress || 
                        (data.businessInfo as any)?.address || 
                        (data.businessInfo as any)?.business_address ||
                        (data.businessInfo as any)?.fullAddress ||
                        '',
        businessEmail: (data.paymentInfo as any)?.businessEmail || (data.owner as any)?.email || user?.email || '',
        businessPhone: (data.paymentInfo as any)?.businessPhone || (data.owner as any)?.phone || user?.phone || ''
      }
      
      setPaymentInfo(prev => ({ ...prev, ...newPaymentInfo }))
      
        // Fetch analytics data - pass user for better session handling
        const analytics = await OwnerDataService.getAnalyticsData(user)
        setAnalyticsData(analytics)
      
      // Fetch settings data
      try {
        const settingsResponse = await fetch(`/api/owner/settings`)
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json()
          if (settingsData.success && settingsData.settings) {
          setSettings({
              emailNotifications: settingsData.settings.emailNotifications,
              bookingEmailNotifications: settingsData.settings.bookingEmailNotifications,
              reviewEmailNotifications: settingsData.settings.reviewEmailNotifications,
              paymentReminders: settingsData.settings.paymentReminders
            })
          }
        }
      } catch (settingsError) {
        console.error('Error loading settings:', settingsError)
        // Keep default settings if loading fails
      }
      
      // Note: Spaces data is already loaded from dashboard API above
      // No need to call loadSpacesFromAPI() as it would override the correct data
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data')
    } finally {
      setIsLoadingDashboard(false)
    }
  }

  // Load payment data
  const loadPaymentData = async () => {
    try {
      const response = await fetch('/api/owner/payments', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPaymentHistory(data.data.payments.history || [])
          setBusinessBalance(data.data.balance || businessBalance)
          setPaymentStats(data.data.payments.statistics || paymentStats)
        }
      }
    } catch (error) {
      console.error('Error loading payment data:', error)
    }
  }

  // Process premium subscription payment - DISABLED: Now redirects to /pricing
  const processPremiumPayment_DISABLED = async (plan: 'premium', billingCycle: 'monthly' | 'yearly') => {
    try {
      setIsProcessingPayment(true)
      setPaymentError('')

      const amount = billingCycle === 'monthly' ? 1001 : 1001 * 12 // ₹1001/month or ₹12012/year

      // Create payment order
      const orderResponse = await fetch('/api/payment/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          type: 'subscription',
          amount: amount,
          currency: 'INR',
          plan: plan,
          billing_cycle: billingCycle
        })
      })

      const orderData = await orderResponse.json()

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create payment order')
      }

      // Load Razorpay SDK if not already loaded
      if (!(window as any).Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = () => resolve(true)
          script.onerror = () => reject(new Error('Failed to load Razorpay SDK'))
          document.head.appendChild(script)
        })
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Clubicles',
        description: `${plan} ${billingCycle} subscription`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: amount,
                currency: 'INR',
                plan: plan,
                billing_cycle: billingCycle
              })
            })

            const verifyData = await verifyResponse.json()

            if (verifyData.success) {
              alert('Payment successful! Your premium subscription has been activated.')
              // Reload payment data and dashboard
              await loadPaymentData()
              await loadDashboardData()
              // Update user plan
              setUserPlan('premium')
              // Close any payment modals
              setShowAddSpaceDialog(false)
            } else {
              throw new Error(verifyData.message || 'Payment verification failed')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            alert(`Payment verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        },
        prefill: {
          name: user?.first_name + ' ' + user?.last_name,
          email: user?.email,
          contact: user?.phone || ''
        },
        theme: {
          color: '#3B82F6'
        }
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error)
        setPaymentError(`Payment failed: ${response.error.description}`)
        alert(`Payment failed: ${response.error.description}`)
      })

      rzp.open()

    } catch (error) {
      console.error('Payment processing error:', error)
      setPaymentError(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessingPayment(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadDashboardData()
      loadPaymentData()
    }
  }, [user])


  // Populate business info in payment settings from businessInfo if available
  useEffect(() => {
    if (businessInfo.address && !paymentInfo.businessAddress) {
      setPaymentInfo(prev => ({ ...prev, businessAddress: businessInfo.address }))
    }
    if (businessInfo.contactEmail && !paymentInfo.businessEmail) {
      setPaymentInfo(prev => ({ ...prev, businessEmail: businessInfo.contactEmail }))
    }
    if (businessInfo.contactPhone && !paymentInfo.businessPhone) {
      setPaymentInfo(prev => ({ ...prev, businessPhone: businessInfo.contactPhone }))
    }
  }, [businessInfo, paymentInfo.businessAddress, paymentInfo.businessEmail, paymentInfo.businessPhone])

  // Save business information
  const saveBusinessInfo = async () => {
    try {
      const response = await fetch('/api/owner/business-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          businessName: businessInfo.companyName,
          businessType: businessInfo.businessType,
          gstNumber: businessInfo.gstNumber,
          panNumber: businessInfo.panNumber,
          businessAddress: businessInfo.address,
          businessCity: businessInfo.city,
          businessState: businessInfo.state,
          businessPincode: businessInfo.pincode
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message || 'Business information saved successfully and submitted for verification!')
        // Refresh data after saving
        await loadDashboardData()
      } else {
        const errorData = await response.json()
        alert(`Failed to save business information: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error saving business information:', error)
      alert(`Failed to save business information: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Save payment settings
  const savePaymentSettings = async () => {
    try {
      const response = await fetch('/api/owner/payment-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          bankAccountNumber: paymentInfo.bankAccountNumber,
          bankIfscCode: paymentInfo.bankIfscCode,
          bankAccountHolderName: paymentInfo.bankAccountHolderName,
          bankName: paymentInfo.bankName,
          upiId: paymentInfo.upiId,
          businessAddress: paymentInfo.businessAddress,
          businessEmail: paymentInfo.businessEmail,
          businessPhone: paymentInfo.businessPhone,
          accountType: paymentInfo.accountType,
          branchCode: paymentInfo.branchCode,
          paypalEmail: paymentInfo.paypalEmail,
          paymentSchedule: paymentInfo.paymentSchedule,
          minimumPayoutAmount: paymentInfo.minimumPayoutAmount,
          tdsDeduction: paymentInfo.tdsDeduction,
          form16Generation: paymentInfo.form16Generation
        })
      })

      if (response.ok) {
        alert('Payment settings saved successfully!')
        // Refresh data after saving
        await loadDashboardData()
      } else {
        const errorData = await response.json()
        alert(`Failed to save payment settings: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error saving payment settings:', error)
      alert(`Failed to save payment settings: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Indian cities for searchable dropdown - using DataService
  const indianCities = OwnerDataService.getCities()

  const [citySearch, setCitySearch] = useState('')
  const [showCityDropdown, setShowCityDropdown] = useState(false)

  const filteredCities = indianCities.filter(city => 
    city.toLowerCase().includes(citySearch.toLowerCase())
  )

  const searchParams = useSearchParams()
  const [showOnboardedMessage, setShowOnboardedMessage] = useState(false)

  // Location search functionality
  const [locationSearchQuery, setLocationSearchQuery] = useState('')
  const [isLocationSearching, setIsLocationSearching] = useState(false)
  const [locationSearchResults, setLocationSearchResults] = useState<any[]>([])
  const [showLocationResults, setShowLocationResults] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const locationSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Edit space location functionality
  const [editLocationSearchQuery, setEditLocationSearchQuery] = useState('')
  const [isEditLocationSearching, setIsEditLocationSearching] = useState(false)
  const [editLocationSearchResults, setEditLocationSearchResults] = useState<any[]>([])
  const [showEditLocationResults, setShowEditLocationResults] = useState(false)
  const [isGettingEditLocation, setIsGettingEditLocation] = useState(false)
  const editLocationSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null)


  useEffect(() => {
    if (searchParams.get('onboarded') === 'true') {
      setShowOnboardedMessage(true)
      // Hide message after 5 seconds
      setTimeout(() => setShowOnboardedMessage(false), 5000)
    }
  }, [searchParams])

  // Location search function
  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setLocationSearchResults([])
      setShowLocationResults(false)
      return
    }

    setIsLocationSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`
      )
      const results = await response.json()
      setLocationSearchResults(results)
      setShowLocationResults(true)
    } catch (error) {
      console.error('Error searching location:', error)
    } finally {
      setIsLocationSearching(false)
    }
  }

  // Auto-search with debounce
  useEffect(() => {
    if (locationSearchTimeoutRef.current) {
      clearTimeout(locationSearchTimeoutRef.current)
    }

    if (locationSearchQuery.trim()) {
      locationSearchTimeoutRef.current = setTimeout(() => {
        searchLocation(locationSearchQuery)
      }, 300)
    } else {
      setLocationSearchResults([])
      setShowLocationResults(false)
    }

    return () => {
      if (locationSearchTimeoutRef.current) {
        clearTimeout(locationSearchTimeoutRef.current)
      }
    }
  }, [locationSearchQuery])

  // Get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser.')
      return
    }

    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords
        setNewSpace(prev => ({ ...prev, latitude: lat, longitude: lng }))
        setIsGettingLocation(false)
      },
      (error) => {
        console.warn('Error getting location:', error)
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }

  // Handle location search result click
  const handleLocationResultClick = (result: any) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    setNewSpace(prev => ({ ...prev, latitude: lat, longitude: lng }))
    setLocationSearchQuery(result.display_name)
    setShowLocationResults(false)
  }

  // Edit space location search function
  const searchEditLocation = async (query: string) => {
    if (!query.trim()) {
      setEditLocationSearchResults([])
      setShowEditLocationResults(false)
      return
    }

    setIsEditLocationSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`
      )
      const results = await response.json()
      setEditLocationSearchResults(results)
      setShowEditLocationResults(true)
    } catch (error) {
      console.error('Error searching location:', error)
    } finally {
      setIsEditLocationSearching(false)
    }
  }

  // Auto-search with debounce for edit location
  useEffect(() => {
    if (editLocationSearchTimeoutRef.current) {
      clearTimeout(editLocationSearchTimeoutRef.current)
    }

    if (editLocationSearchQuery.trim()) {
      editLocationSearchTimeoutRef.current = setTimeout(() => {
        searchEditLocation(editLocationSearchQuery)
      }, 300)
    } else {
      setEditLocationSearchResults([])
      setShowEditLocationResults(false)
    }

    return () => {
      if (editLocationSearchTimeoutRef.current) {
        clearTimeout(editLocationSearchTimeoutRef.current)
      }
    }
  }, [editLocationSearchQuery])

  // Get user's current location for edit
  const getEditUserLocation = () => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser.')
      return
    }

    setIsGettingEditLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords
        setEditSpace(prev => ({ ...prev, latitude: lat, longitude: lng }))
        setIsGettingEditLocation(false)
      },
      (error) => {
        console.warn('Error getting location:', error)
        setIsGettingEditLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }

  // Handle edit location search result click
  const handleEditLocationResultClick = (result: any) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    setEditSpace(prev => ({ ...prev, latitude: lat, longitude: lng }))
    setEditLocationSearchQuery(result.display_name)
    setShowEditLocationResults(false)
  }

  const totalRevenue = dashboardData?.analytics?.totalRevenue || 0
  const totalBookings = dashboardData?.analytics?.totalBookings || 0
  const activeSpaces = dashboardData?.analytics?.activeSpaces || 0

  // Debug spaces state
  console.log('🔍 Spaces state for rendering:', spaces.map(space => ({
    id: space.id,
    name: space.name,
    totalBookings: space.totalBookings,
    revenue: space.revenue
  })))

  // Handle settings update
  const handleSettingsUpdate = async (key: string, value: boolean) => {
    // Update local state immediately for responsive UI
    setSettings(prev => ({ ...prev, [key]: value }))
    
    // Save to server
    try {
      const updatedSettings = {
        emailNotifications: key === 'emailNotifications' ? value : settings.emailNotifications,
        bookingEmailNotifications: key === 'bookingEmailNotifications' ? value : settings.bookingEmailNotifications,
        reviewEmailNotifications: key === 'reviewEmailNotifications' ? value : settings.reviewEmailNotifications,
        paymentReminders: key === 'paymentReminders' ? value : settings.paymentReminders
      }

      const response = await fetch(`/api/owner/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedSettings)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          console.log('Settings saved successfully')
        } else {
          console.error('Failed to save settings:', result.error)
          // Revert local state if save failed
          setSettings(prev => ({ ...prev, [key]: !value }))
        }
      } else {
        console.error('Failed to save settings')
        // Revert local state if save failed
        setSettings(prev => ({ ...prev, [key]: !value }))
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      // Revert local state if save failed
      setSettings(prev => ({ ...prev, [key]: !value }))
    }
  }

  // Function to load spaces from API
  const loadSpacesFromAPI = async () => {
    try {
      const response = await fetch('/api/owner/spaces')
      const result = await response.json()
      
      if (response.ok && result.success) {
        // Convert database spaces to frontend format
        const frontendSpaces: OwnerSpace[] = result.spaces.map((dbSpace: any) => ({
          id: dbSpace.id,
          name: dbSpace.name,
          description: dbSpace.description,
          category: 'Coworking Space',
          location: `${dbSpace.location}, India`,
          address: dbSpace.full_address || dbSpace.location,
          status: 'approved', // Default status since approval is no longer required
          totalBookings: dbSpace.total_bookings || 0,
          total_seats: dbSpace.total_seats,
          available_seats: dbSpace.available_seats,
          revenue: parseFloat(dbSpace.revenue) || 0,
          rating: parseFloat(dbSpace.rating) || 0,
          hourlyRate: parseFloat(dbSpace.hourly_rate),
          dailyRate: parseFloat(dbSpace.daily_rate),
          images: dbSpace.images.length > 0 ? dbSpace.images : ['/api/placeholder/400/300'],
          fullAddress: dbSpace.full_address,
          companyName: dbSpace.company_name || '',
          contactNumber: dbSpace.contact_number || '',
          pincode: dbSpace.pincode || '',
          latitude: parseFloat(dbSpace.latitude) || 19.0760,
          longitude: parseFloat(dbSpace.longitude) || 72.8777,
          amenities: dbSpace.amenities || []
        }))
        
        setSpaces(frontendSpaces)
      } else {
        console.error('Failed to load spaces:', result.error)
      }
    } catch (error) {
      console.error('Error loading spaces:', error)
    }
  }

  // Function to export spaces to global search (simulated)
  const exportSpacesToGlobalSearch = (space: OwnerSpace) => {
    // In a real app, this would make an API call to add the space to the main search index
    console.log('Exporting space to global search:', {
      id: space.id,
      name: space.name,
      location: space.location,
      category: space.category,
      hourlyRate: space.hourlyRate || 0,
      dailyRate: space.dailyRate || 0,
      companyName: space.companyName,
      fullAddress: space.fullAddress,
      amenities: space.amenities,
      rating: space.rating,
      status: space.status
    })
    
    // Simulate API success
    return true
  }

  // Enhanced handleAddSpace with search integration and plan restrictions
  // Form validation function
  const validateForm = () => {
    const errors: {[key: string]: string} = {}

    // Required fields validation
    if (!newSpace.name.trim()) {
      errors.name = 'Space name is required'
    } else if (newSpace.name.trim().length < 3) {
      errors.name = 'Space name must be at least 3 characters'
    }

    if (!newSpace.city.trim()) {
      errors.city = 'City is required'
    } else if (newSpace.city.trim().length < 2) {
      errors.city = 'City must be at least 2 characters'
    }

    if (!newSpace.fullAddress.trim()) {
      errors.fullAddress = 'Full address is required'
    } else if (newSpace.fullAddress.trim().length < 10) {
      errors.fullAddress = 'Address must be at least 10 characters'
    }

    if (!newSpace.pincode.trim()) {
      errors.pincode = 'Pincode is required'
    } else if (!/^[1-9][0-9]{5}$/.test(newSpace.pincode.trim())) {
      errors.pincode = 'Please enter a valid 6-digit pincode'
    }

    if (!newSpace.hourlyRate.trim()) {
      errors.hourlyRate = 'Hourly rate is required'
    } else {
      const hourlyRate = parseFloat(newSpace.hourlyRate)
      if (isNaN(hourlyRate) || hourlyRate <= 0) {
        errors.hourlyRate = 'Please enter a valid hourly rate'
      }
    }

    if (!newSpace.totalSeats.trim()) {
      errors.totalSeats = 'Total seats is required'
    } else {
      const totalSeats = parseInt(newSpace.totalSeats)
      if (isNaN(totalSeats) || totalSeats <= 0) {
        errors.totalSeats = 'Please enter a valid number of seats'
      }
    }

    // Optional field validations
    if (newSpace.dailyRate.trim()) {
      const dailyRate = parseFloat(newSpace.dailyRate)
      if (isNaN(dailyRate) || dailyRate <= 0) {
        errors.dailyRate = 'Please enter a valid daily rate'
      }
    }

    if (newSpace.availableSeats.trim()) {
      const availableSeats = parseInt(newSpace.availableSeats)
      const totalSeats = parseInt(newSpace.totalSeats)
      if (isNaN(availableSeats) || availableSeats <= 0) {
        errors.availableSeats = 'Please enter a valid number of available seats'
      } else if (totalSeats && availableSeats > totalSeats) {
        errors.availableSeats = 'Available seats cannot be more than total seats'
      }
    }

    if (newSpace.contactNumber.trim()) {
      const phoneRegex = /^[6-9]\d{9}$/
      if (!phoneRegex.test(newSpace.contactNumber.trim())) {
        errors.contactNumber = 'Please enter a valid 10-digit mobile number'
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddSpaceWithSearch = async () => {
    // Clear previous errors
    setFormErrors({})

    // Validate form
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(formErrors)[0]
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`) || 
                       document.querySelector(`input[value="${newSpace[firstErrorField as keyof typeof newSpace]}"]`)
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    // Check plan restrictions
    const maxSpaces = userPlan === 'basic' ? 5 : Infinity
    if (spaces.length >= maxSpaces) {
      alert(`You've reached your plan limit of ${maxSpaces} spaces. Upgrade to Premium for unlimited spaces!`)
      setActiveTab('premium') // Navigate to premium tab
      return
    }

    try {
      // Extract pincode from full address or use a default
      const pincodeMatch = newSpace.fullAddress.match(/\b\d{6}\b/)
      const pincode = pincodeMatch ? pincodeMatch[0] : '000000'

      const spaceData = {
        name: newSpace.name,
        description: newSpace.description || 'A great coworking space',
        address: newSpace.fullAddress,
        city: newSpace.city,
        pincode: newSpace.pincode || pincode,
        latitude: newSpace.latitude.toString(),
        longitude: newSpace.longitude.toString(),
        total_seats: parseInt(newSpace.totalSeats) || 50,
        available_seats: parseInt(newSpace.availableSeats) || parseInt(newSpace.totalSeats) || 50,
        price_per_hour: parseFloat(newSpace.hourlyRate) || 0,
        price_per_day: parseFloat(newSpace.dailyRate) || parseFloat(newSpace.hourlyRate) * 8 || 0,
        amenities: newSpace.amenities,
        images: [], // Can be added later with image upload
        company_name: newSpace.companyName,
        contact_number: newSpace.contactNumber
      }

      console.log('Creating space with data:', spaceData)
      console.log('Price values:', { 
        hourlyRate: newSpace.hourlyRate, 
        dailyRate: newSpace.dailyRate,
        parsedHourly: parseFloat(newSpace.hourlyRate),
        parsedDaily: parseFloat(newSpace.dailyRate)
      })

      const response = await fetch('/api/owner/spaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(spaceData)
      })

      const result = await response.json()
      
      console.log('Space creation response:', { response: response.ok, result })
      
      if (!response.ok) {
        if (response.status === 403 && result.currentCount !== undefined) {
          // Space limit reached
          alert(`${result.error}\n\nCurrent spaces: ${result.currentCount}/${result.maxAllowed}\nPlan: ${result.userPlan}`)
          setActiveTab('premium') // Navigate to premium tab
          return
        }
        throw new Error(result.error || 'Failed to create space')
      }

      if (result.success) {
        // Convert database space to frontend format
        const dbSpace = result.space
        console.log('Space data from server:', dbSpace)
        if (!dbSpace) {
          throw new Error('No space data returned from server')
        }
        const frontendSpace: OwnerSpace = {
          id: dbSpace.id,
          name: dbSpace.name,
          description: dbSpace.description,
          category: 'Coworking Space',
          location: `${dbSpace.location}, India`,
          address: dbSpace.full_address || dbSpace.location,
          status: 'approved', // Default status since approval is no longer required
          totalBookings: dbSpace.total_bookings || 0,
          total_seats: dbSpace.total_seats,
          available_seats: dbSpace.available_seats,
          revenue: parseFloat(dbSpace.revenue) || 0,
          rating: parseFloat(dbSpace.rating) || 0,
          hourlyRate: parseFloat(dbSpace.hourly_rate),
          dailyRate: parseFloat(dbSpace.daily_rate),
          images: dbSpace.images.length > 0 ? dbSpace.images : ['/api/placeholder/400/300'],
          fullAddress: dbSpace.full_address,
          companyName: dbSpace.company_name || newSpace.companyName,
          contactNumber: dbSpace.contact_number || newSpace.contactNumber,
          pincode: dbSpace.pincode || newSpace.pincode,
          latitude: parseFloat(dbSpace.latitude) || newSpace.latitude,
          longitude: parseFloat(dbSpace.longitude) || newSpace.longitude,
          amenities: dbSpace.amenities || []
        }

        // Add to local state
        setSpaces([...spaces, frontendSpace])
        
        // Also reload all spaces from API to ensure consistency
        await loadSpacesFromAPI()
        
        // Refresh dashboard data to update analytics
        await loadDashboardData()
        
        alert(`Space "${frontendSpace.name}" created successfully and is now available for bookings!`)
        
        // Reset form
        setNewSpace({
          name: '',
          city: '',
          fullAddress: '',
          pincode: '',
          latitude: 19.0760,
          longitude: 72.8777,
          hourlyRate: '',
          dailyRate: '',
          description: '',
          companyName: '',
          contactNumber: '',
          amenities: [],
          category: '',
          totalSeats: '',
          availableSeats: ''
        })
        setShowAddSpaceDialog(false)
        setCitySearch('')
      }
    } catch (error) {
      console.error('Error creating space:', error)
      alert(`Failed to create space: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Real-time data updates (removed random modifications)
  useEffect(() => {
    const interval = setInterval(() => {
      // Just refresh the data without random modifications
      loadDashboardData()
    }, 60000) // Update every 60 seconds

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-600'
      case 'pending': return 'bg-yellow-600'
      case 'rejected': return 'bg-red-600'
      case 'inactive': return 'bg-gray-600'
      // Legacy status mapping
      case 'active': return 'bg-green-600'
      default: return 'bg-gray-600'
    }
  }

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-600'
      case 'pending': return 'bg-yellow-600'
      case 'completed': return 'bg-blue-600'
      case 'cancelled': return 'bg-red-600'
      default: return 'bg-gray-600'
    }
  }

  // Show loading state while fetching user data
  if (isLoadingDashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Approval Status Loading */}
      {approvalLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-900/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full mx-auto mb-4"></div>
            <p className="text-white">Checking account status...</p>
          </div>
        </div>
      )}

      {/* Pending Approval View */}
      {!approvalLoading && approvalStatus === 'pending' && ownerInfo && (
        <PendingApprovalView ownerInfo={ownerInfo} />
      )}

      {/* Rejected Approval View */}
      {!approvalLoading && approvalStatus === 'rejected' && ownerInfo && ownerId && (
        <RejectedApprovalView ownerInfo={ownerInfo} owner_id={ownerId} />
      )}

      {/* Error or Fallback for Missing Status */}
      {!approvalLoading && !approvalStatus && (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
          <div className="max-w-md w-full mx-4 text-center">
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-8">
              <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Account Status Unavailable</h2>
              <p className="text-gray-300 mb-6">
                We couldn't verify your account status. Please try again or contact support.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={retryApprovalCheck}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Retry
                </Button>
                <Button 
                  onClick={() => {
                    signOut()
                    window.location.href = '/signin'
                  }}
                  variant="outline"
                  className="w-full border-gray-500 text-gray-300 hover:bg-gray-800"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Dashboard - Only show if approved */}
      {!approvalLoading && approvalStatus === 'approved' && (
        <>
          {/* Loading State */}
          {isLoadingDashboardDashboard && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-gray-900/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full mx-auto mb-4"></div>
                <p className="text-white">Loading dashboard data...</p>
              </div>
            </div>
          )}

      {/* Error State */}
      {error && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 backdrop-blur-xl max-w-sm shadow-2xl">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-400 mt-0.5" />
              <div>
                <h3 className="text-red-300 font-semibold mb-1">Error Loading Data</h3>
                <p className="text-red-200 text-sm">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-2 text-xs text-red-300 hover:text-red-200 underline"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showOnboardedMessage && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 backdrop-blur-xl max-w-sm shadow-2xl">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-400 mt-0.5" />
              <div>
                <h3 className="text-green-300 font-semibold mb-1">Welcome to Clubicles!</h3>
                <p className="text-green-200 text-sm">
                  Your space has been submitted for review. We'll notify you once it's approved!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header - Hidden on mobile */}
      <div className="hidden lg:block bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20">
                <Building className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                      Owner Dashboard
                    </h1>
                    <p className="text-gray-400 mt-1 text-sm md:text-base">Manage your workspace listings and grow your business</p>
                  </div>
                  
                  {/* Subscription Status */}
                  {subscriptionInfo?.currentSubscription?.status === 'active' && (
                    <div className="mt-3 sm:mt-0">
                      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-3 backdrop-blur-sm">
                        <div className="flex items-center space-x-2">
                          <Crown className="w-4 h-4 text-yellow-400" />
                          <div>
                            <p className="text-yellow-300 font-semibold text-sm">Premium Plan</p>
                            <p className="text-yellow-200 text-xs">
                              {(() => {
                                const now = new Date()
                                const expiry = new Date(subscriptionInfo.currentSubscription.expiry_date)
                                const diffTime = expiry.getTime() - now.getTime()
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                                return `${diffDays} days left`
                              })()}
                            </p>
                            <p className="text-yellow-200 text-xs">
                              Started: {new Date(subscriptionInfo.currentSubscription.start_date).toLocaleDateString('en-GB')}
                            </p>
                            <p className="text-yellow-200 text-xs">
                              Expires: {new Date(subscriptionInfo.currentSubscription.expiry_date).toLocaleDateString('en-GB')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button 
                onClick={handleSignOut}
                variant="outline" 
                className="border-white/20 !text-black hover:text-white hover:bg-white/10 hover:scale-105 transition-all duration-200 shadow-lg rounded-xl px-4 py-2 text-sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
              <Dialog open={showAddSpaceDialog} onOpenChange={setShowAddSpaceDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-200 shadow-lg rounded-xl px-4 md:px-6 py-2 md:py-3 font-semibold text-sm">
                    <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Add New Space
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white/10 backdrop-blur-xl border-white/20 text-white max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto mx-4 shadow-2xl">
                  <DialogHeader className="border-b border-white/20 pb-4">
                    <DialogTitle className="text-white text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Add New Space</DialogTitle>
                    {userPlan === 'basic' && (
                      <p className="text-orange-400 text-sm mt-2 bg-orange-500/10 px-3 py-1 rounded-full inline-block">
                        Spaces used: {spaces.length}/5 (Basic plan)
                      </p>
                    )}
                  </DialogHeader>
                  <div className="space-y-6 pt-4">
                    {/* Basic Information */}
                    <div className="space-y-4 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <h4 className="font-semibold text-white text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Basic Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Space Name *</label>
                          <Input
                            value={newSpace.name}
                            onChange={(e) => {
                              setNewSpace(prev => ({ ...prev, name: e.target.value }))
                              if (formErrors.name) {
                                setFormErrors(prev => ({ ...prev, name: '' }))
                              }
                            }}
                            placeholder="Enter space name"
                            className={`bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-gray-300 ${formErrors.name ? 'border-red-400' : ''} rounded-xl`}
                          />
                          {formErrors.name && (
                            <p className="text-red-400 text-sm mt-1">{formErrors.name}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Space Category</label>
                          <select
                            value={newSpace.category || ''}
                            onChange={(e) => setNewSpace(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white"
                          >
                            <option value="">Select category</option>
                            {DataService.getSpaceCategories().map((category) => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Company Name</label>
                          <Input
                            value={newSpace.companyName}
                            onChange={(e) => setNewSpace(prev => ({ ...prev, companyName: e.target.value }))}
                            placeholder="Enter company name"
                            className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-gray-300 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Contact Number</label>
                          <Input
                            value={newSpace.contactNumber}
                            onChange={(e) => setNewSpace(prev => ({ ...prev, contactNumber: e.target.value }))}
                            placeholder="+91 XXXXX XXXXX"
                            className={`bg-white border-gray-300 text-black placeholder:text-gray-500 ${formErrors.contactNumber ? 'border-red-500' : ''}`}
                          />
                          {formErrors.contactNumber && (
                            <p className="text-red-400 text-sm mt-1">{formErrors.contactNumber}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Location Details */}
                    <div className="space-y-4 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <h4 className="font-semibold text-white text-lg bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Location Details</h4>
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-300 mb-2">City *</label>
                        <Input
                          value={newSpace.city}
                          onChange={(e) => {
                            const value = e.target.value.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
                            setNewSpace(prev => ({ ...prev, city: value }));
                          }}
                          placeholder="Enter city name"
                          className={`bg-white border-gray-300 text-black placeholder:text-gray-500 ${formErrors.city ? 'border-red-500' : ''}`}
                        />
                        {formErrors.city && (
                          <p className="text-red-400 text-sm mt-1">{formErrors.city}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Full Address *</label>
                        <Input
                          value={newSpace.fullAddress}
                          onChange={(e) => setNewSpace(prev => ({ ...prev, fullAddress: e.target.value }))}
                          placeholder="Enter complete address"
                          className={`bg-white border-gray-300 text-black placeholder:text-gray-500 ${formErrors.fullAddress ? 'border-red-500' : ''}`}
                        />
                        {formErrors.fullAddress && (
                          <p className="text-red-400 text-sm mt-1">{formErrors.fullAddress}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Pincode *</label>
                        <Input
                          value={newSpace.pincode}
                          onChange={(e) => setNewSpace(prev => ({ ...prev, pincode: e.target.value }))}
                          placeholder="Enter 6-digit pincode"
                          maxLength={6}
                          className={`bg-white border-gray-300 text-black placeholder:text-gray-500 ${formErrors.pincode ? 'border-red-500' : ''}`}
                        />
                        {formErrors.pincode && (
                          <p className="text-red-400 text-sm mt-1">{formErrors.pincode}</p>
                        )}
                      </div>
                    </div>

                    {/* Location Map */}
                    <div className="space-y-4 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <h4 className="font-semibold text-white text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Location on Map</h4>
                      <p className="text-gray-400 text-sm">Click on the map to set the exact location of your space</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Latitude</label>
                          <Input
                            value={newSpace.latitude}
                            onChange={(e) => setNewSpace(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                            placeholder="19.0760"
                            className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-gray-300 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Longitude</label>
                          <Input
                            value={newSpace.longitude}
                            onChange={(e) => setNewSpace(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                            placeholder="72.8777"
                            className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-gray-300 rounded-xl"
                          />
                        </div>
                      </div>
                      {/* Location Search */}
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={locationSearchQuery}
                          onChange={(e) => setLocationSearchQuery(e.target.value)}
                          placeholder="Enter nearby landmark name or area name..."
                          className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                        />
                        <button
                          onClick={getUserLocation}
                          disabled={isGettingLocation}
                          className="absolute inset-y-0 right-14 pr-4 flex items-center"
                        >
                          {isGettingLocation ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                          ) : (
                            <Navigation className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNewSpace(prev => ({ ...prev, latitude: 0, longitude: 0 }))
                            setLocationSearchQuery('')
                          }}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                          title="Reset location"
                        >
                          <MapPin className="h-5 w-5" />
                        </button>
                        
                        {/* Search Results Dropdown */}
                        {showLocationResults && locationSearchResults.length > 0 && (
                          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {locationSearchResults.map((result, index) => (
                              <div
                                key={index}
                                onClick={() => handleLocationResultClick(result)}
                                className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                              >
                                <div className="flex items-start space-x-3">
                                  <MapPin className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 leading-relaxed">{result.display_name}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {parseFloat(result.lat).toFixed(6)}, {parseFloat(result.lon).toFixed(6)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Capacity & Pricing */}
                    <div className="space-y-4 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <h4 className="font-semibold text-white text-lg bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Capacity & Pricing</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Total Seats *</label>
                          <Input
                            type="number"
                            value={newSpace.totalSeats || ''}
                            onChange={(e) => setNewSpace(prev => ({ ...prev, totalSeats: e.target.value }))}
                            placeholder="50"
                            className={`bg-white border-gray-300 text-black placeholder:text-gray-500 ${formErrors.totalSeats ? 'border-red-500' : ''}`}
                          />
                          {formErrors.totalSeats && (
                            <p className="text-red-400 text-sm mt-1">{formErrors.totalSeats}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Available Seats</label>
                          <Input
                            type="number"
                            value={newSpace.availableSeats || ''}
                            onChange={(e) => setNewSpace(prev => ({ ...prev, availableSeats: e.target.value }))}
                            placeholder="50"
                            className={`bg-white border-gray-300 text-black placeholder:text-gray-500 ${formErrors.availableSeats ? 'border-red-500' : ''}`}
                          />
                          {formErrors.availableSeats && (
                            <p className="text-red-400 text-sm mt-1">{formErrors.availableSeats}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Hourly Rate (₹) *</label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={newSpace.hourlyRate}
                            onChange={(e) => setNewSpace(prev => ({ ...prev, hourlyRate: e.target.value }))}
                            placeholder="200"
                            className={`bg-white border-gray-300 text-black placeholder:text-gray-500 ${formErrors.hourlyRate ? 'border-red-500' : ''}`}
                          />
                          {formErrors.hourlyRate && (
                            <p className="text-red-400 text-sm mt-1">{formErrors.hourlyRate}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Daily Rate (₹)</label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={newSpace.dailyRate}
                            onChange={(e) => setNewSpace(prev => ({ ...prev, dailyRate: e.target.value }))}
                            placeholder="1600"
                            className={`bg-white border-gray-300 text-black placeholder:text-gray-500 ${formErrors.dailyRate ? 'border-red-500' : ''}`}
                          />
                          {formErrors.dailyRate && (
                            <p className="text-red-400 text-sm mt-1">{formErrors.dailyRate}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="space-y-4 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <h4 className="font-semibold text-white text-lg bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Amenities</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-4 bg-white/10 rounded-xl border border-white/20">
                        {DataService.getAmenities().map((amenity) => (
                          <label key={amenity} className="flex items-center space-x-2 cursor-pointer hover:bg-white/10 p-2 rounded-lg transition-colors">
                            <input
                              type="checkbox"
                              checked={newSpace.amenities.includes(amenity)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewSpace(prev => ({ ...prev, amenities: [...prev.amenities, amenity] }))
                                } else {
                                  setNewSpace(prev => ({ ...prev, amenities: prev.amenities.filter(a => a !== amenity) }))
                                }
                              }}
                              className="rounded bg-white border-gray-300 text-black"
                            />
                            <span className="text-white text-sm">{amenity}</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-gray-400 text-sm">Selected: {newSpace.amenities.length} amenities</p>
                    </div>
                    
                    {/* Description */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <h4 className="font-semibold text-white text-lg bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-4">Description</h4>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Description</label>
                      <textarea
                        value={newSpace.description}
                        onChange={(e) => setNewSpace(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your space, special features, location benefits, and target audience"
                        rows={4}
                        className="w-full p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder:text-gray-300 resize-none"
                      />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4 border-t border-white/20 bg-white/5 backdrop-blur-sm rounded-2xl p-6">
                      <Button
                        onClick={handleAddSpaceWithSearch}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:scale-105 transition-all duration-200 shadow-lg rounded-xl px-6 py-3 font-semibold"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Add Space
                      </Button>
                      <Button
                        onClick={() => {
                          setShowAddSpaceDialog(false)
                          setShowCityDropdown(false)
                          setCitySearch('')
                        }}
                        variant="outline"
                        className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-xl px-6 py-3 font-semibold"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Edit Space Dialog */}
              <Dialog open={showEditSpaceDialog} onOpenChange={setShowEditSpaceDialog}>
                <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-white/20 text-white max-w-[95vw] md:max-w-3xl max-h-[90vh] overflow-y-auto mx-4">
                  <DialogHeader>
                    <DialogTitle className="text-white text-xl">Edit Space</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 pt-4">
                    {/* Basic Information */}
                    <div className="space-y-4 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <h4 className="font-semibold text-white text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Basic Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Space Name *</label>
                          <Input
                            value={editSpace.name}
                            onChange={(e) => setEditSpace(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter space name"
                            className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-gray-300 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Space Category</label>
                          <select
                            value={editSpace.category || ''}
                            onChange={(e) => setEditSpace(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white"
                          >
                            <option value="">Select category</option>
                            {DataService.getSpaceCategories().map((category) => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Company Name</label>
                          <Input
                            value={editSpace.companyName}
                            onChange={(e) => setEditSpace(prev => ({ ...prev, companyName: e.target.value }))}
                            placeholder="Enter company name"
                            className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-gray-300 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Contact Number</label>
                          <Input
                            value={editSpace.contactNumber}
                            onChange={(e) => setEditSpace(prev => ({ ...prev, contactNumber: e.target.value }))}
                            placeholder="+91 XXXXX XXXXX"
                            className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-gray-300 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Location Details */}
                    <div className="space-y-4 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <h4 className="font-semibold text-white text-lg bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Location Details</h4>
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-300 mb-2">City *</label>
                        <select
                          value={editSpace.city}
                          onChange={(e) => setEditSpace(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full p-3 rounded-lg bg-white border border-gray-300 text-black"
                        >
                          <option value="">Select city</option>
                          {DataService.getCities().map((city) => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Full Address *</label>
                        <Input
                          value={editSpace.fullAddress}
                          onChange={(e) => setEditSpace(prev => ({ ...prev, fullAddress: e.target.value }))}
                          placeholder="Enter complete address"
                          className="bg-white border-gray-300 text-black placeholder:text-gray-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Pincode *</label>
                        <Input
                          value={editSpace.pincode}
                          onChange={(e) => setEditSpace(prev => ({ ...prev, pincode: e.target.value }))}
                          placeholder="Enter 6-digit pincode"
                          maxLength={6}
                          className="bg-white border-gray-300 text-black placeholder:text-gray-500"
                        />
                      </div>
                    </div>

                    {/* Location Map */}
                    <div className="space-y-4 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <h4 className="font-semibold text-white text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Location on Map</h4>
                      <p className="text-gray-400 text-sm">Click on the map to set the exact location of your space</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Latitude</label>
                          <Input
                            value={editSpace.latitude}
                            onChange={(e) => setEditSpace(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                            placeholder="19.0760"
                            className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-gray-300 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Longitude</label>
                          <Input
                            value={editSpace.longitude}
                            onChange={(e) => setEditSpace(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                            placeholder="72.8777"
                            className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-gray-300 rounded-xl"
                          />
                        </div>
                      </div>
                      {/* Edit Location Search */}
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={editLocationSearchQuery}
                          onChange={(e) => setEditLocationSearchQuery(e.target.value)}
                          placeholder="Enter nearby landmark name or area name..."
                          className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                        />
                        <button
                          onClick={getEditUserLocation}
                          disabled={isGettingEditLocation}
                          className="absolute inset-y-0 right-14 pr-4 flex items-center"
                        >
                          {isGettingEditLocation ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                          ) : (
                            <Navigation className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditSpace(prev => ({ ...prev, latitude: 0, longitude: 0 }))
                            setEditLocationSearchQuery('')
                          }}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                          title="Reset location"
                        >
                          <MapPin className="h-5 w-5" />
                        </button>
                        
                        {/* Edit Search Results Dropdown */}
                        {showEditLocationResults && editLocationSearchResults.length > 0 && (
                          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {editLocationSearchResults.map((result, index) => (
                              <div
                                key={index}
                                onClick={() => handleEditLocationResultClick(result)}
                                className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                              >
                                <div className="flex items-start space-x-3">
                                  <MapPin className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 leading-relaxed">{result.display_name}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {parseFloat(result.lat).toFixed(6)}, {parseFloat(result.lon).toFixed(6)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Capacity & Pricing */}
                    <div className="space-y-4 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <h4 className="font-semibold text-white text-lg bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Capacity & Pricing</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Total Seats *</label>
                          <Input
                            type="number"
                            value={editSpace.totalSeats || ''}
                            onChange={(e) => setEditSpace(prev => ({ ...prev, totalSeats: e.target.value }))}
                            placeholder="50"
                            className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-gray-300 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Available Seats</label>
                          <Input
                            type="number"
                            value={editSpace.availableSeats || ''}
                            onChange={(e) => setEditSpace(prev => ({ ...prev, availableSeats: e.target.value }))}
                            placeholder="50"
                            className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-gray-300 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Hourly Rate (₹) *</label>
                          <Input
                            type="number"
                            value={editSpace.hourlyRate}
                            onChange={(e) => setEditSpace(prev => ({ ...prev, hourlyRate: e.target.value }))}
                            placeholder="200"
                            className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-gray-300 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Daily Rate (₹)</label>
                          <Input
                            type="number"
                            value={editSpace.dailyRate}
                            onChange={(e) => setEditSpace(prev => ({ ...prev, dailyRate: e.target.value }))}
                            placeholder="1600"
                            className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-gray-300 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="space-y-4 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <h4 className="font-semibold text-white text-lg bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Amenities</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-4 bg-white/10 rounded-xl border border-white/20">
                        {DataService.getAmenities().map((amenity) => (
                          <label key={amenity} className="flex items-center space-x-2 cursor-pointer hover:bg-white/10 p-2 rounded-lg transition-colors">
                            <input
                              type="checkbox"
                              checked={editSpace.amenities.includes(amenity)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditSpace(prev => ({ ...prev, amenities: [...prev.amenities, amenity] }))
                                } else {
                                  setEditSpace(prev => ({ ...prev, amenities: prev.amenities.filter(a => a !== amenity) }))
                                }
                              }}
                              className="rounded bg-white border-gray-300 text-black"
                            />
                            <span className="text-white text-sm">{amenity}</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-gray-400 text-sm">Selected: {editSpace.amenities.length} amenities</p>
                    </div>
                    
                    {/* Description */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <h4 className="font-semibold text-white text-lg bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-4">Description</h4>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Description</label>
                      <textarea
                        value={editSpace.description}
                        onChange={(e) => setEditSpace(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your space, special features, location benefits, and target audience"
                        rows={4}
                        className="w-full p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder:text-gray-300 resize-none"
                      />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4 border-t border-white/10">
                      <Button
                        onClick={handleSaveEditedSpace}
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Update Space
                      </Button>
                      <Button
                        onClick={() => {
                          setShowEditSpaceDialog(false)
                          setEditingSpace(null)
                          // Reset edit form
                          setEditSpace({
                            name: '',
                            city: '',
                            fullAddress: '',
                            pincode: '',
                            latitude: 19.0760,
                            longitude: 72.8777,
                            hourlyRate: '',
                            dailyRate: '',
                            description: '',
                            companyName: '',
                            contactNumber: '',
                            amenities: [],
                            category: '',
                            totalSeats: '',
                            availableSeats: ''
                          })
                        }}
                        variant="outline"
                        className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Header */}
        <div className="lg:hidden mb-4">
          <div className="flex items-center justify-between bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Owner Dashboard</h1>
                <p className="text-gray-400 text-xs">Manage your spaces</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleSignOut}
                variant="outline" 
                size="sm"
                className="border-white/20 text-black hover:bg-white/10 rounded-lg px-3 py-1.5 text-xs"
              >
                <LogOut className="w-3 h-3 mr-1" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden mb-4 mobile-menu-container">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center justify-between w-full bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-white hover:bg-white/20 transition-all duration-200"
          >
            <div className="flex items-center gap-2">
              <Menu className="h-5 w-5" />
              <span className="font-medium">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'spaces', label: 'My Spaces' },
                  { id: 'bookings', label: 'Bookings' },
                  { id: 'premium', label: 'Premium Features' },
                  { id: 'support', label: 'Support' },
                  { id: 'settings', label: 'Settings' }
                ].find(tab => tab.id === activeTab)?.label || 'Menu'}
              </span>
            </div>
            <div className={`transform transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-180' : ''}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
        </div>

        {/* Tab Navigation - Hidden on mobile, shown on desktop */}
        <div className="border-b border-white/10 mb-6 sm:mb-8">
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex overflow-x-auto bg-white/5 backdrop-blur-sm rounded-t-2xl p-1 sm:p-2 mt-6 sm:mt-8 gap-1 scrollbar-hide">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'spaces', label: 'My Spaces', icon: Building },
              { id: 'bookings', label: 'Bookings', icon: Calendar },
              { id: 'premium', label: 'Premium Features', icon: Crown },
              { id: 'support', label: 'Support', icon: MessageSquare },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 md:px-4 rounded-xl font-medium text-xs md:text-sm flex items-center gap-1 md:gap-2 transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-white text-black shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Mobile Navigation - Dropdown */}
          {isMobileMenuOpen && (
            <div className="lg:hidden bg-white/10 backdrop-blur-sm rounded-xl p-2 mt-4 space-y-1 relative mobile-menu-container">
              {/* Close Button */}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'spaces', label: 'My Spaces', icon: Building },
                { id: 'bookings', label: 'Bookings', icon: Calendar },
                { id: 'premium', label: 'Premium Features', icon: Crown },
                { id: 'support', label: 'Support', icon: MessageSquare },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full py-3 px-4 rounded-xl font-medium text-sm flex items-center gap-3 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-black shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/15 transition-all duration-300 shadow-xl rounded-2xl group">
                <CardContent className="p-6 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium ">Total Revenue</p>
                      <p className="text-3xl font-bold text-white mt-2">
                        {isLoadingDashboardDashboard ? '...' : `₹${totalRevenue.toLocaleString()}`}
                      </p>
                      <p className="text-green-400 text-sm mt-1 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {isLoadingDashboardDashboard ? 'Loading...' : '+12.5% this month'}
                      </p>
                    </div>
                    <div className="bg-green-500/20 rounded-2xl p-3 group-hover:scale-110 transition-transform duration-300">
                      <DollarSign className="w-8 h-8 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/15 transition-all duration-300 shadow-xl rounded-2xl group">
                <CardContent className="p-6 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Total Bookings</p>
                      <p className="text-3xl font-bold text-white mt-2">
                        {isLoadingDashboard ? '...' : totalBookings}
                      </p>
                      <p className="text-blue-400 text-sm mt-1 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {isLoadingDashboard ? 'Loading...' : `${recentBookings.length} recent`}
                      </p>
                    </div>
                    <div className="bg-blue-500/20 rounded-2xl p-3 group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="w-8 h-8 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/15 transition-all duration-300 shadow-xl rounded-2xl group">
                <CardContent className="p-6 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Active Spaces</p>
                      <p className="text-3xl font-bold text-white mt-2">
                        {isLoadingDashboard ? '...' : activeSpaces}
                      </p>
                      <p className="text-purple-400 text-sm mt-1 flex items-center">
                        <Building className="w-4 h-4 mr-1" />
                        {isLoadingDashboard ? 'Loading...' : `${spaces.length} total listed`}
                      </p>
                    </div>
                    <div className="bg-purple-500/20 rounded-2xl p-3 group-hover:scale-110 transition-transform duration-300">
                      <Building className="w-8 h-8 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/15 transition-all duration-300 shadow-xl rounded-2xl group">
                <CardContent className="p-6 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Last Payout</p>
                      <p className="text-3xl font-bold text-white mt-2">
                        {isLoadingDashboard ? '...' : `₹${dashboardData?.businessBalance?.currentBalance || dashboardData?.analytics?.currentBalance || 0}`}
                      </p>
                      <p className="text-green-400 text-sm mt-1 flex items-center">
                        <Wallet className="w-4 h-4 mr-1" />
                        {isLoadingDashboard ? 'Loading...' : `₹${dashboardData?.businessBalance?.pendingAmount || 0} Available for payout`}
                      </p>
                      {!isLoadingDashboard && dashboardData && (
                        <div className="mt-2 text-xs text-gray-400">
                          <p>Revenue: ₹{dashboardData.analytics?.totalRevenue || 0}</p>
                          <p>Tax: ₹{dashboardData.businessBalance?.taxDeducted || 0}</p>
                          <p>Commission: ₹{dashboardData.businessBalance?.commissionDeducted || 0}</p>
                    </div>
                      )}
                    </div>
                    <div className="bg-green-500/20 rounded-2xl p-3 group-hover:scale-110 transition-transform duration-300">
                      <Wallet className="w-8 h-8 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
              {/* My Spaces */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white flex flex-col sm:flex-row sm:items-center justify-between text-lg md:text-xl gap-3">
                    <span className="flex items-center space-x-2">
                      <Building className="w-5 h-5 md:w-6 md:h-6" />
                      <span>My Spaces</span>
                    </span>
                    <Button 
                      onClick={() => setShowAddSpaceDialog(true)}
                      size="sm" 
                      className="bg-primary text-primary-foreground hover:bg-primary/90 border border-white/20 rounded-xl transition-all duration-200 hover:scale-105 text-xs md:text-sm self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Space
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  {spaces.map(space => (
                    <div key={space.id} className="p-5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-white font-semibold text-lg group-hover:text-gray-100 transition-colors">{space.name}</h3>
                            <Badge className={`${getStatusColor(space.status)} text-white text-xs px-3 py-1 rounded-full font-medium`}>
                              {space.status}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-sm font-medium">{space.category}</p>
                          <div className="flex items-center space-x-2 text-gray-400 text-sm mt-1">
                            <MapPin className="w-4 h-4" />
                            <span>{space.address || space.location || 'Location not specified'}</span>
                          </div>
                          {space.companyName && (
                            <p className="text-gray-500 text-xs mt-1">by {space.companyName}</p>
                          )}
                          {space.contactNumber && (
                            <p className="text-gray-500 text-xs mt-1">📞 {space.contactNumber}</p>
                          )}
                          {space.fullAddress && (
                            <p className="text-gray-500 text-xs mt-1">📍 {space.fullAddress}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => window.open(`/spaces/${space.id}`, '_blank')}
                            className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-xl transition-all duration-200 hover:scale-105"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {userPlan === 'premium' ? (
                          <Button 
                            size="sm" 
                            onClick={() => handleRemoveSpace(space.id)}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border-0 rounded-xl transition-all duration-200 hover:scale-105"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              disabled
                              className="bg-gray-500/20 text-gray-400 border-0 rounded-xl transition-all duration-200 cursor-not-allowed px-2"
                              title="Premium only"
                            >
                              <Lock className="w-3 h-3 mr-1" />
                              <span className="text-xs">Premium</span>
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center bg-white/5 rounded-xl p-4">
                        <div>
                          <p className="text-white font-bold text-lg">{space.totalBookings}</p>
                          <p className="text-gray-400 text-xs font-medium">Bookings</p>
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg">₹{isNaN(space.revenue) || space.revenue === 0 ? '0' : space.revenue.toLocaleString()}</p>
                          <p className="text-gray-400 text-xs font-medium">Revenue</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="text-white font-bold text-lg">{isNaN(Number(space.rating)) || Number(space.rating) === 0 ? 'N/A' : Number(space.rating).toFixed(1)}</span>
                          </div>
                          <p className="text-gray-400 text-xs font-medium">Rating</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-sm">
                        <span className="text-gray-300 font-medium">
                          ₹{!space.hourlyRate || isNaN(space.hourlyRate) || space.hourlyRate === 0 ? '0' : space.hourlyRate.toFixed(0)}/hour
                        </span>
                        <span className="text-gray-300 font-medium">
                          ₹{!space.dailyRate || isNaN(space.dailyRate) || space.dailyRate === 0 ? '0' : space.dailyRate.toFixed(0)}/day
                        </span>
                      </div>
                    </div>
                  ))}

                  {spaces.length === 0 && (
                    <div className="text-center py-12">
                      <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                        <Building className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-300 text-xl font-semibold mb-2">No spaces listed yet</p>
                        <p className="text-gray-400 text-sm mb-6">Start earning by adding your first space to our platform</p>
                        <Link href="/owner/onboarding">
                          <Button className="bg-white text-black hover:bg-gray-100 hover:scale-105 transition-all duration-200 shadow-lg rounded-xl px-6 py-3 font-semibold">
                            <Plus className="w-5 h-5 mr-2" />
                            List Your Space
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Bookings */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white text-xl flex items-center space-x-2">
                    <Calendar className="w-6 h-6" />
                    <span>Recent Bookings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  {recentBookings.map(booking => (
                    <div key={booking.id} className="p-5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg group-hover:text-gray-100 transition-colors">{booking.customerName}</h3>
                          <p className="text-gray-400 text-sm font-medium">{booking.spaceName}</p>
                        </div>
                        <Badge className={`${getBookingStatusColor(booking.status)} text-black  text-xs px-3 py-1 rounded-full font-medium`}>
                          {booking.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">{booking.date}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">{booking.time}</span>
                          </div>
                        </div>
                        <div className="text-white font-bold text-lg">₹{booking.amount.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}

                  {recentBookings.length === 0 && (
                    <div className="text-center py-12">
                      <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-300 text-xl font-semibold mb-2">No bookings yet</p>
                        <p className="text-gray-400 text-sm">Bookings will appear here once customers start reserving your spaces</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

         
          </div>
        )}

        {activeTab === 'spaces' && (
          <div className="space-y-6">
            {/* Add Space Quick Action */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">My Spaces</h2>
                <p className="text-gray-400 text-sm md:text-base">
                  Manage and monitor all your listed spaces
                  {userPlan === 'basic' && (
                    <span className="ml-2 text-orange-400">
                      ({spaces.length}/5 spaces used on Basic plan)
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => setShowAddSpaceDialog(true)}
                  disabled={userPlan === 'basic' && spaces.length >= 5}
                  className={`hover:scale-105 transition-all duration-200 shadow-lg rounded-xl px-4 md:px-6 py-2 md:py-3 font-semibold text-sm md:text-base self-start sm:self-auto ${
                    userPlan === 'basic' && spaces.length >= 5
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Add New Space
                </Button>
                {userPlan === 'basic' && spaces.length >= 5 && (
                  <Button 
                    onClick={() => setActiveTab('premium')}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 hover:scale-105 transition-all duration-200 shadow-lg rounded-xl px-4 md:px-6 py-1 md:py-2 font-semibold text-xs md:text-sm"
                  >
                    <Crown className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                    Upgrade for Unlimited
                  </Button>
                )}
              </div>
            </div>

            {/* My Spaces */}
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl">
              <CardContent className="p-6 space-y-4 pt-4">
                {spaces.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-white/5 rounded-2xl p-12 border border-white/10">
                      <Building className="w-20 h-20 mx-auto mb-6 text-gray-400" />
                      <p className="text-gray-300 text-2xl font-semibold mb-3">No spaces listed yet</p>
                      <p className="text-gray-400 text-sm mb-4 max-w-md mx-auto">Get started by adding your first co-working space and start earning from bookings</p>
                      {userPlan === 'basic' && (
                        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-6 max-w-md mx-auto">
                          <p className="text-orange-400 text-sm">
                            <Crown className="w-4 h-4 inline mr-2" />
                            Basic Plan: Up to 5 spaces
                          </p>
                        </div>
                      )}
                      <Button 
                        onClick={() => setShowAddSpaceDialog(true)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-200 shadow-lg rounded-xl px-8 py-4 font-semibold text-lg"
                      >
                        <Plus className="w-6 h-6 mr-2" />
                        Add Your First Space
                      </Button>
                    </div>
                  </div>
                ) : (
                  spaces.map(space => (
                    <div key={space.id} className="p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-bold text-white text-xl group-hover:text-gray-100 transition-colors">{space.name}</h3>
                            <Badge className={`${getStatusColor(space.status)} px-3 py-1 rounded-full font-medium`}>
                              {space.status}
                            </Badge>
                          </div>
                          <p className="text-gray-400 font-medium">{space.category} • {space.address || space.location || 'Location not specified'}</p>
                          {space.companyName && (
                            <p className="text-gray-500 text-sm mt-1">by {space.companyName}</p>
                          )}
                          {space.fullAddress && (
                            <p className="text-gray-500 text-sm mt-1">{space.fullAddress}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 mb-2">
                            <Star className="w-5 h-5 text-yellow-400" />
                            <span className="text-white font-bold text-lg">{isNaN(Number(space.rating)) || Number(space.rating) === 0 ? 'N/A' : Number(space.rating).toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-4 bg-white/5 rounded-xl p-3 sm:p-4">
                        <div>
                          <p className="text-gray-400 text-sm font-medium">Total Bookings</p>
                          <p className="text-white font-bold text-2xl">{space.totalBookings}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm font-medium">Revenue</p>
                          <p className="text-white font-bold text-2xl">₹{isNaN(space.revenue) || space.revenue === 0 ? '0' : space.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl transition-all duration-200"
                          onClick={() => window.open(`/spaces/${space.id}`, '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl transition-all duration-200"
                          onClick={() => handleEditSpace(space)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Space
                        </Button>
                        {userPlan === 'premium' ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30 rounded-xl transition-all duration-200"
                          onClick={() => handleDeleteSpace(space.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 bg-gray-500/20 border-gray-500/30 text-gray-400 rounded-xl transition-all duration-200 cursor-not-allowed"
                            disabled
                            title="Premium only"
                          >
                            <Lock className="w-4 h-4 mr-1" />
                            Premium
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Bookings Management</h2>
              <p className="text-gray-400">Track and manage all your space bookings with QR code functionality</p>
            </div>
            
            <BookingManagement />
          </div>
        )}

    
        {activeTab === 'premium' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Premium Features</h2>
              <p className="text-gray-400">Unlock advanced tools to grow your space business</p>
            </div>
            <PremiumFeatures 
              userPlan={userPlan} 
              spaces={spaces}
              onUpgrade={(plan, billingCycle) => {
                // Redirect to pricing page for payment
                window.location.href = '/pricing'
              }}
              paymentHistory={paymentHistory}
              businessBalance={businessBalance}
              paymentStats={paymentStats}
              isProcessingPayment={isProcessingPayment}
              paymentError={paymentError}
            />
          </div>
        )}

 
        {activeTab === 'support' && (
          <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                <h2 className="text-2xl font-bold text-white mb-2">Support Center</h2>
                <p className="text-gray-400">Get help with your space management, payments, and platform issues</p>
                    </div>
              <Button
                onClick={fetchSupportTickets}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                disabled={isLoadingTickets}
              >
                {isLoadingTickets ? 'Loading...' : 'Refresh Tickets'}
              </Button>
                    </div>

            {/* Support Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer">
                <CardContent className="p-6 pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Building className="h-8 w-8 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Space Management</h3>
                  </div>
                  <p className="text-gray-300 text-sm mb-4">Issues with creating, editing, or managing your spaces</p>
                  <Button 
                    variant="outline" 
                    className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white"
                    onClick={() => handleCategoryClick('space_management', 'Space Management Issue', 'I need help with space management')}
                  >
                    <span className="text-black font-medium">Create Ticket</span>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer">
                <CardContent className="p-6 pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign className="h-8 w-8 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">Payment Issues</h3>
                    </div>
                  <p className="text-gray-300 text-sm mb-4">Problems with payouts, missing payments, or financial matters</p>
                  <Button 
                    variant="outline" 
                    className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white"
                    onClick={() => handleCategoryClick('payout_issue', 'Payment Issue', 'I need help with payment-related issues')}
                  >
                    <span className="text-black font-medium">Create Ticket</span>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer">
                <CardContent className="p-6 pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="h-8 w-8 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Booking Issues</h3>
                    </div>
                  <p className="text-gray-300 text-sm mb-4">Problems with bookings, reservations, or customer management</p>
                  <Button 
                    variant="outline" 
                    className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white"
                    onClick={() => handleCategoryClick('booking_issue', 'Booking Issue', 'I need help with booking-related issues')}
                  >
                    <span className="text-black font-medium">Create Ticket</span>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer">
                <CardContent className="p-6 pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="h-8 w-8 text-yellow-400" />
                    <h3 className="text-lg font-semibold text-white">Verification</h3>
                  </div>
                  <p className="text-gray-300 text-sm mb-4">Help with business verification, document submission, or approval</p>
                  <Button 
                    variant="outline" 
                    className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white"
                    onClick={() => handleCategoryClick('verification_issue', 'Verification Issue', 'I need help with verification process')}
                  >
                    <span className="text-black font-medium">Create Ticket</span>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer">
                <CardContent className="p-6 pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Crown className="h-8 w-8 text-orange-400" />
                    <h3 className="text-lg font-semibold text-white">Subscription</h3>
                    </div>
                  <p className="text-gray-300 text-sm mb-4">Questions about premium features, billing, or subscription management</p>
                  <Button 
                    variant="outline" 
                    className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white"
                    onClick={() => handleCategoryClick('subscription_issue', 'Subscription Issue', 'I need help with subscription-related issues')}
                  >
                    <span className="text-black font-medium">Create Ticket</span>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer">
                <CardContent className="p-6 pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <BarChart3 className="h-8 w-8 text-cyan-400" />
                    <h3 className="text-lg font-semibold text-white">Analytics</h3>
                    </div>
                  <p className="text-gray-300 text-sm mb-4">Issues with analytics, reports, or data visualization</p>
                  <Button 
                    variant="outline" 
                    className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white"
                    onClick={() => handleCategoryClick('analytics_issue', 'Analytics Issue', 'I need help with analytics and reporting')}
                  >
                    <span className="text-black font-medium">Create Ticket</span>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Support Tickets List */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">All Support Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingTickets ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading tickets...</p>
                  </div>
                ) : supportTickets.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No support tickets found</p>
                    <p className="text-gray-500 text-sm mt-2">Create a ticket using the categories above</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {supportTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className={`bg-white/5 rounded-lg p-4 border border-white/10 transition-colors ${
                          ticket.status === 'closed' || ticket.status === 'resolved' 
                            ? 'opacity-60 cursor-not-allowed' 
                            : 'hover:bg-white/10 cursor-pointer'
                        }`}
                        onClick={() => handleTicketClick(ticket)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-white">{ticket.subject}</h3>
                              {(ticket.status === 'closed' || ticket.status === 'resolved') && (
                                <span className="text-xs text-gray-400 bg-gray-500/20 px-2 py-1 rounded-full">
                                  Cannot Open
                                </span>
                              )}
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
                          </div>
                            <p className="text-gray-300 text-sm mb-2 line-clamp-2">{ticket.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span>#{ticket.ticketNumber}</span>
                              <span>•</span>
                              <span>{user?.first_name} {user?.last_name}</span>
                              <span>•</span>
                              <span>{user?.email}</span>
                              <span>•</span>
                              <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                        </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">
                              {ticket.responses?.length || 0} messages
                            </span>
                            <Eye className="h-4 w-4 text-gray-400" />
                      </div>
                  </div>
                </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Contact */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6 pt-4">
                <h3 className="text-lg font-semibold text-white mb-4">Need Immediate Help?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">Email Support</p>
                      <p className="text-gray-400 text-sm">support@clubicles.com</p>
                            </div>
                            </div>
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-white font-medium">Live Chat</p>
                      <p className="text-gray-400 text-sm">Available 24/7</p>
                          </div>
                      </div>
                  </div>
                </CardContent>
              </Card>
          </div>
        )}

        {/* Support Ticket Creation Dialog */}
        <Dialog open={showTicketDialog} onOpenChange={() => setShowTicketDialog(false)}>
          <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">Create Support Ticket</DialogTitle>
            </DialogHeader>
                  <div className="space-y-6">
              {/* Category Display */}
              <div className="bg-white/5 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <div className="text-white font-medium capitalize">
                  {selectedCategory.replace('_', ' ')}
                        </div>
                          </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                <Input
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                  className="bg-gray-800 border-gray-600 text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                          </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  placeholder="Please provide detailed information about your issue..."
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={5}
                />
                          </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                <select
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low - General inquiry</option>
                  <option value="medium">Medium - Standard issue</option>
                  <option value="high">High - Urgent issue</option>
                  <option value="urgent">Urgent - Critical issue</option>
                </select>
                        </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-700">
                <Button
                  onClick={() => setShowTicketDialog(false)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => createSupportTicket(selectedCategory, ticketSubject, ticketDescription, ticketPriority)}
                  disabled={!ticketSubject.trim() || !ticketDescription.trim() || isCreatingTicket}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isCreatingTicket ? 'Creating...' : 'Create Ticket'}
                </Button>
                            </div>
                          </div>
          </DialogContent>
        </Dialog>

        {/* Support Ticket Details Dialog */}
        <Dialog open={showTicketDetails} onOpenChange={() => setShowTicketDetails(false)}>
          <DialogContent className="max-w-4xl bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">Support Ticket Details</DialogTitle>
            </DialogHeader>
            {selectedTicket && (
              <div className="space-y-6">
                {/* Ticket Header */}
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{selectedTicket.subject}</h3>
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
                            </div>
                    <div className="text-sm text-gray-400">
                      #{selectedTicket.ticketNumber}
                          </div>
                        </div>
                  <p className="text-gray-300 mb-4">{selectedTicket.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>Category: {selectedTicket.category.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>Created: {new Date(selectedTicket.createdAt).toLocaleString()}</span>
                    {selectedTicket.updatedAt !== selectedTicket.createdAt && (
                      <>
                        <span>•</span>
                        <span>Updated: {new Date(selectedTicket.updatedAt).toLocaleString()}</span>
                      </>
                    )}
                  </div>
            </div>

                {/* Messages */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Conversation</h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedTicket.responses?.map((response: any, index: number) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg ${
                          response.senderType === 'owner'
                            ? 'bg-blue-500/20 ml-8'
                            : 'bg-gray-700/50 mr-8'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-white">
                            {response.senderType === 'owner' ? 'You' : 'Admin'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(response.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-200">{response.message}</p>
                      </div>
                    ))}
                    {(!selectedTicket.responses || selectedTicket.responses.length === 0) && (
                      <div className="text-center py-8 text-gray-400">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                        <p>No messages yet. Start the conversation below.</p>
          </div>
        )}
            </div>
                </div>

                {/* Reply Form */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Send Reply</h4>
                  <div className="space-y-3">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your message here..."
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                    />
                    <div className="flex items-center justify-end gap-3">
                      <Button
                        onClick={() => setShowTicketDetails(false)}
                        variant="outline"
                        className="border-gray-600 text-black hover:text-white hover:bg-gray-700"
                      >
                        Close
                      </Button>
                      <Button
                        onClick={handleReplySubmit}
                        disabled={!replyMessage.trim() || isReplying}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isReplying ? 'Sending...' : 'Send Reply'}
                      </Button>
                    </div>
                  </div>
                </div>
          </div>
        )}
          </DialogContent>
        </Dialog>

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Account Settings</h2>
              <p className="text-gray-400">Manage your profile, business information, and preferences</p>
            </div>
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl">
              <CardContent className="p-6 space-y-8 pt-4">
                <div>
                  <h3 className="text-xl font-semibold mb-6 text-white flex items-center space-x-2">
                    <Users className="w-6 h-6" />
                    <span>Profile Settings</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-500/20 rounded-xl p-3">
                          <Users className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Business Information</p>
                          <p className="text-sm text-gray-400">Update your business details and contact information</p>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl">
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-white/20 text-white max-w-lg max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-white text-xl">Business Information</DialogTitle>
                          </DialogHeader>
                          
                          {/* Verification Alert */}
                          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                            <div className="flex items-start space-x-3">
                              <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-amber-400 mb-1">Verification Required</h4>
                                <p className="text-sm text-amber-300/80">
                                  All business information changes require admin verification before they become active. 
                                  Your current information will remain active until the new details are approved.
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4 pt-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-200 mb-2">Company Name *</label>
                              <Input
                                value={businessInfo.companyName}
                                onChange={(e) => setBusinessInfo(prev => ({ ...prev, companyName: e.target.value }))}
                                placeholder="Enter company name"
                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-200 mb-2">Business Type</label>
                              <select 
                                value={businessInfo.businessType}
                                onChange={(e) => setBusinessInfo(prev => ({ ...prev, businessType: e.target.value }))}
                                className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white"
                              >
                                <option value="Private Limited">Private Limited</option>
                                <option value="Public Limited">Public Limited</option>
                                <option value="Partnership">Partnership</option>
                                <option value="LLP">Limited Liability Partnership (LLP)</option>
                                <option value="Sole Proprietorship">Sole Proprietorship</option>
                                <option value="OPC">One Person Company (OPC)</option>
                              </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">GST Number</label>
                                <Input
                                  value={businessInfo.gstNumber}
                                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, gstNumber: e.target.value }))}
                                  placeholder="22AAAAA0000A1Z5"
                                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">PAN Number</label>
                                <Input
                                  value={businessInfo.panNumber}
                                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, panNumber: e.target.value }))}
                                  placeholder="AAAAA0000A"
                                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-200 mb-2">Business Address</label>
                              <textarea
                                value={businessInfo.address}
                                onChange={(e) => setBusinessInfo(prev => ({ ...prev, address: e.target.value }))}
                                placeholder="Enter complete business address"
                                rows={3}
                                className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-gray-400 resize-none"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">Contact Email</label>
                                <Input
                                  type="email"
                                  value={businessInfo.contactEmail}
                                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, contactEmail: e.target.value }))}
                                  placeholder="business@company.com"
                                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">Contact Phone</label>
                                <Input
                                  value={businessInfo.contactPhone}
                                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, contactPhone: e.target.value }))}
                                  placeholder="+91 XXXXX XXXXX"
                                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                />
                              </div>
                            </div>
                            
                            <Button 
                              onClick={saveBusinessInfo}
                              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-6"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save Business Information
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className="bg-green-500/20 rounded-xl p-3">
                          <CreditCard className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Payment Settings</p>
                          <p className="text-sm text-gray-400">Manage payout methods and billing preferences</p>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                            onClick={async () => {
                              // Refresh payment data when opening dialog
                              if (user) {
                                await loadDashboardData()
                              }
                            }}
                          >
                            Configure
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-white/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-white text-xl">Payment Settings</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6 pt-4">
                            {/* Business Information */}
                            <div className="space-y-4">
                              <h4 className="font-semibold text-white flex items-center space-x-2">
                                <Users className="w-5 h-5" />
                                <span>Business Information</span>
                              </h4>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-200 mb-2">Business Address</label>
                                  <textarea
                                    value={paymentInfo.businessAddress}
                                    onChange={(e) => setPaymentInfo(prev => ({ ...prev, businessAddress: e.target.value }))}
                                    placeholder="Enter complete business address"
                                    rows={3}
                                    className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-gray-400 resize-none"
                                  />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2">Business Email</label>
                                    <Input
                                      type="email"
                                      value={paymentInfo.businessEmail}
                                      onChange={(e) => setPaymentInfo(prev => ({ ...prev, businessEmail: e.target.value }))}
                                      placeholder="business@company.com"
                                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2">Business Phone</label>
                                    <Input
                                      value={paymentInfo.businessPhone}
                                      onChange={(e) => setPaymentInfo(prev => ({ ...prev, businessPhone: e.target.value }))}
                                      placeholder="+91 XXXXX XXXXX"
                                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Bank Account Details */}
                            <div className="space-y-4">
                              <h4 className="font-semibold text-white flex items-center space-x-2">
                                <CreditCard className="w-5 h-5" />
                                <span>Bank Account Details</span>
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-200 mb-2">Account Holder Name *</label>
                                  <Input
                                    value={paymentInfo.bankAccountHolderName}
                                    onChange={(e) => setPaymentInfo(prev => ({ ...prev, bankAccountHolderName: e.target.value }))}
                                    placeholder="Full name as per bank records"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-200 mb-2">Bank Name *</label>
                                  <Input
                                    value={paymentInfo.bankName}
                                    onChange={(e) => setPaymentInfo(prev => ({ ...prev, bankName: e.target.value }))}
                                    placeholder="e.g., State Bank of India"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-200 mb-2">Account Number *</label>
                                  <Input
                                    value={paymentInfo.bankAccountNumber}
                                    onChange={(e) => setPaymentInfo(prev => ({ ...prev, bankAccountNumber: e.target.value }))}
                                    placeholder="Enter account number"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-200 mb-2">IFSC Code *</label>
                                  <Input
                                    value={paymentInfo.bankIfscCode}
                                    onChange={(e) => setPaymentInfo(prev => ({ ...prev, bankIfscCode: e.target.value }))}
                                    placeholder="e.g., SBIN0001234"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-200 mb-2">Account Type</label>
                                  <select 
                                    value={paymentInfo.accountType}
                                    onChange={(e) => setPaymentInfo(prev => ({ ...prev, accountType: e.target.value }))}
                                    className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white"
                                  >
                                    <option value="">Select account type</option>
                                    <option value="savings">Savings Account</option>
                                    <option value="current">Current Account</option>
                                    <option value="business">Business Account</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-200 mb-2">Branch Code</label>
                                  <Input
                                    value={paymentInfo.branchCode}
                                    onChange={(e) => setPaymentInfo(prev => ({ ...prev, branchCode: e.target.value }))}
                                    placeholder="Branch code (optional)"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Alternative Payment Methods */}
                            <div className="space-y-4">
                              <h4 className="font-semibold text-white">Alternative Payment Methods</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-200 mb-2">UPI ID</label>
                                  <Input
                                    value={paymentInfo.upiId}
                                    onChange={(e) => setPaymentInfo(prev => ({ ...prev, upiId: e.target.value }))}
                                    placeholder="yourname@paytm / @googlepay"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-200 mb-2">PayPal Email</label>
                                  <Input
                                    type="email"
                                    value={paymentInfo.paypalEmail}
                                    onChange={(e) => setPaymentInfo(prev => ({ ...prev, paypalEmail: e.target.value }))}
                                    placeholder="paypal@email.com"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Payment Schedule & Settings */}
                            <div className="space-y-4">
                              <h4 className="font-semibold text-white">Payout Settings</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-200 mb-2">Payment Schedule</label>
                                  <select 
                                    value={paymentInfo.paymentSchedule}
                                    onChange={(e) => setPaymentInfo(prev => ({ ...prev, paymentSchedule: e.target.value }))}
                                    className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white"
                                  >
                                    <option value="weekly">Weekly (Every Monday)</option>
                                    <option value="biweekly">Bi-weekly (1st & 15th)</option>
                                    <option value="monthly">Monthly (1st of month)</option>
                                    <option value="instant">Instant (24-48 hours)</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-200 mb-2">Minimum Payout Amount</label>
                                  <Input
                                    value={paymentInfo.minimumPayoutAmount}
                                    onChange={(e) => setPaymentInfo(prev => ({ ...prev, minimumPayoutAmount: e.target.value }))}
                                    placeholder="₹500"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Tax Information */}
                            <div className="space-y-4">
                              <h4 className="font-semibold text-white">Tax Information</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-200 mb-2">TDS Deduction</label>
                                  <select 
                                    value={paymentInfo.tdsDeduction}
                                    onChange={(e) => setPaymentInfo(prev => ({ ...prev, tdsDeduction: e.target.value }))}
                                    className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white"
                                  >
                                    <option value="auto">Auto Calculate (Recommended)</option>
                                    <option value="manual">Manual Override</option>
                                    <option value="exempt">Tax Exempt</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-200 mb-2">Form 16 Generation</label>
                                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                                    <Switch 
                                      checked={paymentInfo.form16Generation}
                                      onCheckedChange={(checked) => setPaymentInfo(prev => ({ ...prev, form16Generation: checked }))}
                                    />
                                    <span className="text-white text-sm">Auto-generate yearly Form 16</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Payment Notifications */}
                            <div className="space-y-4">
                              <h4 className="font-semibold text-white">Payment Notifications</h4>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                  <div className="flex items-center space-x-3">
                                    <Bell className="w-5 h-5 text-green-400" />
                                    <span className="text-white text-sm">Payment Reminders</span>
                                  </div>
                                  <Switch
                                    checked={settings.paymentReminders}
                                    onCheckedChange={(checked) => handleSettingsUpdate('paymentReminders', checked)}
                                  />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                  <div className="flex items-center space-x-3">
                                    <Mail className="w-5 h-5 text-blue-400" />
                                    <span className="text-white text-sm">Payout Confirmations</span>
                                  </div>
                                  <Switch defaultChecked />
                                </div>
                              </div>
                            </div>

                            <Button 
                              onClick={savePaymentSettings}
                              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save Payment Settings
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-8">
                  <h3 className="text-xl font-semibold mb-6 text-white flex items-center space-x-2">
                    <Bell className="w-6 h-6" />
                    <span>Notification Settings</span>
                  </h3>
                  <div className="space-y-4">
                    {/* Booking Notifications */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="bg-purple-500/20 rounded-xl p-3">
                            <Calendar className="w-6 h-6 text-purple-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">Booking Notifications</p>
                            <p className="text-sm text-gray-400">Get notified of new bookings and cancellations via email</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3 ml-16">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Mail className="w-5 h-5 text-blue-400" />
                            <span className="text-white text-sm">Email Notifications</span>
                          </div>
                          <Switch
                            checked={settings.bookingEmailNotifications}
                            onCheckedChange={(checked) => handleSettingsUpdate('bookingEmailNotifications', checked)}
                          />
                        </div>
                        
                      </div>
                    </div>

                    {/* Review Notifications */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="bg-yellow-500/20 rounded-xl p-3">
                            <Star className="w-6 h-6 text-yellow-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">Review Alert Configuration</p>
                            <p className="text-sm text-gray-400">Get notified when customers leave reviews via email</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3 ml-16">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Mail className="w-5 h-5 text-blue-400" />
                            <span className="text-white text-sm">Email Alerts for Reviews</span>
                          </div>
                          <Switch
                            checked={settings.reviewEmailNotifications}
                            onCheckedChange={(checked) => handleSettingsUpdate('reviewEmailNotifications', checked)}
                          />
                        </div>
                        
                      </div>
                    </div>

                    {/* General Notifications */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="bg-indigo-500/20 rounded-xl p-3">
                            <Bell className="w-6 h-6 text-indigo-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">General Notifications</p>
                            <p className="text-sm text-gray-400">System updates and promotional messages via email</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3 ml-16">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Mail className="w-5 h-5 text-blue-400" />
                            <span className="text-white text-sm">Email Updates</span>
                          </div>
                          <Switch
                            checked={settings.emailNotifications}
                            onCheckedChange={(checked) => handleSettingsUpdate('emailNotifications', checked)}
                          />
                        </div>
                        
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <Button 
                      onClick={() => {
                        // Save all settings logic
                        alert('All settings saved successfully!')
                        // In a real app, this would make an API call to save settings
                      }}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-xl"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save All Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="fixed bottom-8 right-8 flex flex-col space-y-3 z-50">
          <Button 
            onClick={() => setShowAddSpaceDialog(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-2xl rounded-2xl px-6 py-4 font-semibold backdrop-blur-xl"
          >
            <Plus className="w-6 h-6 mr-2" />
            Add Space
          </Button>
        </div>
      </div>
        </>
      )}
    </div>
  )
}

export default function OwnerDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <OwnerDashboardContent />
    </Suspense>
  )
}
