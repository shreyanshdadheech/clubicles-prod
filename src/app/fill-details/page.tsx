'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
// Removed Supabase import - using Prisma-based API
import BusinessOnboarding from '@/components/owner/business-onboarding'
import { Loader2 } from 'lucide-react'

export default function FillDetailsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  // Removed Supabase client - using Prisma-based API

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include'
        })
        
        if (!response.ok) {
          // Not authenticated, redirect to signin
          router.push('/signin')
          return
        }
        
        const data = await response.json()
        if (!data.success || !data.user) {
          // Not authenticated, redirect to signin
          router.push('/signin')
          return
        }
        
        const user = data.user

        // Check if user type is owner
        const userType = document.cookie
          .split('; ')
          .find(row => row.startsWith('stype='))
          ?.split('=')[1]

        if (userType !== 'owner') {
          // Not an owner, redirect to appropriate dashboard
          if (userType === 'admin') {
            // No redirect for admin - just return
            return
          } else {
            router.push('/dashboard')
          }
          return
        }

        // Check if already onboarded
        const spaceOwnerId = user.app_metadata?.space_owner_id
        const ownerOnboarded = user.app_metadata?.owner_onboarded

        if (spaceOwnerId && ownerOnboarded) {
          // Already onboarded, redirect to owner dashboard
          router.push('/owner')
          return
        }

        // Instead of showing onboarding, redirect directly to owner dashboard
        // where users can use the add space form
        router.push('/owner')
        return
      } catch (error) {
        console.error('Error checking user:', error)
        router.push('/signin')
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to signin
  }

  return <BusinessOnboarding />
}