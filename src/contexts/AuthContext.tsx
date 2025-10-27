'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'

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
  refreshAuth: () => Promise<void> // Add method to manually refresh auth state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSpaceOwner, setIsSpaceOwner] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const pathname = usePathname()

  // Define checkAuth as a stable reference with useCallback
  const checkAuth = useCallback(async () => {
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
          setUser(null)
          setIsSpaceOwner(false)
          setIsAdmin(false)
        }
      } else {
        console.log('🔍 AuthContext: API call failed, no user')
        setUser(null)
        setIsSpaceOwner(false)
        setIsAdmin(false)
      }
    } catch (error) {
      console.error('🔍 AuthContext: Auth check failed:', error)
      setUser(null)
      setIsSpaceOwner(false)
      setIsAdmin(false)
    } finally {
      console.log('🔍 AuthContext: Setting loading to false')
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
    
    // Listen for auth state changes from other parts of the app
    const handleAuthStateChanged = () => {
      console.log('🔍 AuthContext: Received auth state change event')
      checkAuth()
    }
    
    window.addEventListener('authStateChanged', handleAuthStateChanged)
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChanged)
    }
  }, [checkAuth])
  
  // Re-check auth on route changes
  useEffect(() => {
    if (pathname) {
      console.log('🔍 AuthContext: Route changed to', pathname)
      // Small delay to let cookies settle after login redirect
      const timer = setTimeout(() => {
        checkAuth()
      }, 300)
      
      return () => clearTimeout(timer)
    }
  }, [pathname, checkAuth])

  // Expose refresh function for manual auth state updates
  const refreshAuth = async () => {
    await checkAuth()
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
    <AuthContext.Provider value={{ user, loading, signOut, isSpaceOwner, isAdmin, refreshAuth }}>
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
