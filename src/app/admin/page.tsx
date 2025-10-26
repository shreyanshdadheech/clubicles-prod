'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AdminDashboard } from '@/components/dashboard/admin-dashboard'

import { User } from '@/types'

// Mock admin user
const mockAdminUser: User = {
  id: 'admin1',
  auth_id: 'admin-auth-id',
  email: 'admin@clubicles.com',
  first_name: 'Admin',
  last_name: 'User',
  roles: 'admin',
  is_active: true,
  created_at: '2025-01-01',
  updated_at: '2025-01-01'
}

export default function AdminPage() {
  return <AdminPageContent />
}

function AdminPageContent() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated with admin role
    const checkAuth = () => {
      // Check localStorage or session for admin authentication
      const adminAuth = localStorage.getItem('adminAuth')
      
      if (adminAuth === 'true') {
        setUser(mockAdminUser)
        setIsAuthenticated(true)
      } else {
        // Redirect to admin signin if not authenticated
        router.push('/admin/signin')
        return
      }
      
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-300">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user || user.roles !== 'admin') {
    return null // Will redirect to signin via useEffect
  }

  const handleLogout = () => {
    localStorage.removeItem('adminAuth')
    router.push('/admin/signin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center">
              <img src="/logo.svg" alt="Clubicles Logo" className="w-14 h-14" />
            </div>
            <span className="font-orbitron text-lg font-black text-white">CLUBICLES ADMIN</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button 
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl transition-all duration-200 hidden sm:flex"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Go Home
              </Button>
            </Link>
            <Link href="/" className="sm:hidden">
              <Button 
                variant="outline"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Button>
            </Link>
            <Button 
              onClick={handleLogout}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-xl transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                </svg>
              </span>
            </Button>
          </div>
        </div>
      </div>
      
      <AdminDashboard user={user} />
    </div>
  )
}
