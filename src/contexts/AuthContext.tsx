'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { verifyToken } from '@/lib/auth'

interface User {
  id: string
  email: string
  firstName?: string
  first_name?: string
  lastName?: string
  roles: string
  isActive: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => void
  isSpaceOwner: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSpaceOwner, setIsSpaceOwner] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      console.log('🔍 AuthContext: Starting auth check')
      
      // Check if we're in the browser
      if (typeof window === 'undefined') {
        console.log('🔍 AuthContext: Server side, skipping auth check')
        setLoading(false)
        return
      }
      
      // Check if we have a token in cookies
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1]
      
      console.log('🔍 AuthContext: Token present:', !!token)
      
      // Always call the API endpoint regardless of cookie presence
      // This ensures HTTP-only cookies are properly handled
      console.log('🔍 AuthContext: Calling /api/auth/me')
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include' // Include cookies
      })

      console.log('🔍 AuthContext: API response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('🔍 AuthContext: API response data:', data)
        
        if (data.success && data.user) {
          console.log('🔍 AuthContext: Setting user data:', data.user)
          setUser(data.user)
          setIsSpaceOwner(data.user.roles === 'owner' || data.user.roles === 'admin')
          setIsAdmin(data.user.roles === 'admin')
        } else {
          console.log('🔍 AuthContext: No user data in response')
        }
      } else {
        console.log('🔍 AuthContext: API call failed, no user')
      }
    } catch (error) {
      console.error('🔍 AuthContext: Auth check failed:', error)
    } finally {
      console.log('🔍 AuthContext: Setting loading to false')
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      // Call signout API to clear server-side cookies
      await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Signout API error:', error)
    }
    
    // Clear client-side cookies as backup
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'stype=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    
    // Clear user state
    setUser(null)
    setIsSpaceOwner(false)
    setIsAdmin(false)
    
    // Redirect to home page
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut, isSpaceOwner, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
