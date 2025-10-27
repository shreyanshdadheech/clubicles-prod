'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export function SharedNavigation() {
  const { user, loading, signOut, isSpaceOwner, isAdmin } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Debug logging for troubleshooting
  if (user) {
    console.log('🔍 Navigation: user roles:', user.roles, 'isSpaceOwner:', isSpaceOwner, 'isAdmin:', isAdmin)
  }

  // Determine dashboard link based on actual ownership status
  const getDashboardLink = () => {
    if (!user) return '/signin'
    if (user.roles === 'admin') return '/admin'
    if (user.roles === 'owner') return '/owner'
    return '/dashboard'
  }

  // Determine button text based on user role and first name
  const getDashboardButtonText = () => {
    if (!user) return 'Sign In'
    
    const firstName = user.firstName || user.first_name
    let baseText = 'Dashboard'
    
    if (user.roles === 'admin') {
      baseText = 'Admin'
    } else if (user.roles === 'owner') {
      baseText = 'Dashboard'
    }
    
    if (firstName) {
      return `${firstName} ${baseText}`
    }
    
    return baseText
  }

  return (
    <nav className="border-b border-gray-800 sticky top-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Left Section - Logo */}
          <div className="flex items-center space-x-2 flex-1">
            <Link 
              href="/" 
              className="flex items-center space-x-2"
              onClick={(e) => {
                // If already on home page, force reload
                if (window.location.pathname === '/') {
                  e.preventDefault()
                  window.location.reload()
                }
              }}
            >
              <img src="/logo.svg" alt="Clubicles Logo" className="w-14 h-14" />
            </Link>
          </div>
          
          {/* Center Section - Navigation */}
          <div className="hidden md:flex items-center space-x-8 flex-1 justify-center">
            <a href="/#features" className="hover:text-gray-300 transition-colors">Features</a>
            <Link href="/spaces" className="hover:text-gray-300 transition-colors">Spaces</Link>
            {/* Only show pricing to space owners and admins */}
            {(isSpaceOwner || isAdmin) && (
              <Link href="/pricing" className="hover:text-gray-300 transition-colors">Pricing</Link>
            )}
            <Link href="/about" className="hover:text-gray-300 transition-colors">About</Link>
          </div>

          {/* Right Section - Auth Buttons (Desktop) */}
          <div className="hidden md:flex items-center space-x-4 flex-1 justify-end">
            {loading ? (
              <div className="animate-pulse bg-gray-700 h-8 w-20 rounded"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <Link href={getDashboardLink()}>
                  <Button className="rounded-xl bg-white text-black hover:bg-gray-100 font-semibold">
                    {getDashboardButtonText()}
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={signOut}
                  className="rounded-xl border-white/30 bg-white/5 text-white hover:bg-white/15"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link href="/signin">
                  <Button variant="outline" className="rounded-xl border-white/30 bg-white/5 text-white hover:bg-white/15">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="rounded-xl bg-white text-black hover:bg-gray-100 font-semibold">
                    Join
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile View - Show Dashboard button for logged in users, Menu button for logged out */}
          <div className="md:hidden flex items-center space-x-2">
            {loading ? (
              <div className="animate-pulse bg-gray-700 h-10 w-24 rounded"></div>
            ) : user ? (
              <Link href={getDashboardLink()}>
                <Button className="rounded-xl bg-white text-black hover:bg-gray-100 font-semibold text-sm px-4 h-10">
                  {getDashboardButtonText()}
                </Button>
              </Link>
            ) : (
              <>
                {/* Menu Button for logged out users */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/20 text-white/80 hover:text-white hover:bg-white/10"
                  aria-label="Toggle navigation"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-black/90 backdrop-blur-xl">
            <div className="px-4 py-4 flex flex-col space-y-4">
              {/* Auth Section - Show at top */}
              {loading ? (
                <div className="animate-pulse bg-gray-700 h-10 rounded"></div>
              ) : user ? (
                <>
                  <div className="text-sm font-semibold text-white mb-2">
                    {user.firstName || user.first_name || 'Welcome'}
                  </div>
                  <Link href={getDashboardLink()} className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full rounded-xl bg-white text-black hover:bg-gray-100 font-semibold">
                      {getDashboardButtonText()}
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      signOut()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full rounded-xl border-white/30 bg-white/5 text-white hover:bg-white/15"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/signin" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-xl border-white/30 bg-white/5 text-white hover:bg-white/15">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full rounded-xl bg-white text-black hover:bg-gray-100 font-semibold">
                      Join
                    </Button>
                  </Link>
                </>
              )}
              
              {/* Divider */}
              <div className="border-t border-white/10 pt-4 mt-4"></div>
              
              {/* Navigation Links */}
              <a 
                href="/#features" 
                className="text-sm font-medium text-white/70 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <Link 
                href="/spaces" 
                className="text-sm font-medium text-white/70 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Spaces
              </Link>
              {/* Only show pricing to space owners and admins */}
              {(isSpaceOwner || isAdmin) && (
                <Link 
                  href="/pricing" 
                  className="text-sm font-medium text-white/70 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
              )}
              <Link 
                href="/about" 
                className="text-sm font-medium text-white/70 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}