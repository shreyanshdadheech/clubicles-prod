'use client'

import { Suspense, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, EyeOff, User, Building2, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { setCookie } from '@/lib/utils'
import { ProfessionalRole } from '@/types'

function SignInContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState<'user' | 'owner'>('user')
  const [professionalRole, setProfessionalRole] = useState<ProfessionalRole | null>(null)
  const [expandedRole, setExpandedRole] = useState<ProfessionalRole | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl')

  // Check if user is already logged in and redirect
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            // Redirect based on user role
            switch (data.user.roles) {
              case 'admin':
                router.push('/admin')
                break
              case 'owner':
                router.push('/owner')
                break
              default:
                router.push('/dashboard')
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      }
    }
    
    checkExistingAuth()
  }, [router])

  // Professional categories embedded directly in the component
  const PROFESSIONAL_CATEGORIES = [
    {
      id: 'violet' as ProfessionalRole,
      name: 'VIOLET – Visionaries & Venture Capitalists',
      color: '#8F00F0',
      description: 'Visionaries & Venture Capitalists',
      detailedDescription: 'The creators and investors shaping the future through innovation, capital, and strategic vision.',
      examples: [
        'A venture capitalist funding a green mobility startup.',
        'A serial entrepreneur with multiple successful exits.',
        'A visionary leader building futuristic smart cities.'
      ]
    },
    {
      id: 'indigo' as ProfessionalRole,
      name: 'INDIGO – IT & Industrialists',
      color: '#0070B0',
      description: 'IT & Industrialists',
      detailedDescription: 'Builders of technology-driven ecosystems and large-scale industries.',
      examples: [
        'A software architect developing AI-driven enterprise platforms.',
        'An industrialist leading an automotive manufacturing unit.',
        'A tech founder scaling an IoT & automation startup.'
      ]
    },
    {
      id: 'blue' as ProfessionalRole,
      name: 'BLUE – Branding & Marketing',
      color: '#00B0F0',
      description: 'Branding & Marketing',
      detailedDescription: 'The creative strategists who shape identity, visibility, and influence.',
      examples: [
        'A brand consultant managing corporate rebranding campaigns.',
        'A digital marketer growing businesses through social media & SEO.',
        'A creative director designing global advertising campaigns.'
      ]
    },
    {
      id: 'green' as ProfessionalRole,
      name: 'GREEN – Green Footprint & EV',
      color: '#45DE10',
      description: 'Green Footprint & EV',
      detailedDescription: 'Champions of sustainability, clean energy, and electric mobility.',
      examples: [
        'A founder of an EV charging startup.',
        'An NGO leader promoting carbon-neutral living.',
        'A sustainability officer driving green initiatives in corporates.'
      ]
    },
    {
      id: 'yellow' as ProfessionalRole,
      name: 'YELLOW – Young Entrepreneurs (<23 Years)',
      color: '#FFF000',
      description: 'Young Entrepreneurs',
      detailedDescription: 'Bright youth leaders innovating at the earliest stage of their careers.',
      examples: [
        'A college student running an edtech platform.',
        'A teen innovator designing a robotics solution.',
        'A youth entrepreneur starting a clothing brand online.'
      ]
    },
    {
      id: 'orange' as ProfessionalRole,
      name: 'ORANGE – Oracle of Bharat (Culture & Philosophy)',
      color: '#FF6900',
      description: 'Oracle of Bharat',
      detailedDescription: 'Keepers of wisdom, heritage, and philosophy rooted in Bharat\'s culture.',
      examples: [
        'A philosopher publishing modern interpretations of ancient texts.',
        'A cultural entrepreneur reviving handlooms & traditional crafts.',
        'A Sanskrit scholar digitizing Vedic knowledge.'
      ]
    },
    {
      id: 'red' as ProfessionalRole,
      name: 'RED – Real Estate & Recreationists',
      color: '#FF000F',
      description: 'Real Estate & Recreationists',
      detailedDescription: 'The drivers of urban development, lifestyle spaces, and leisure experiences.',
      examples: [
        'A real estate developer building sustainable housing projects.',
        'A resort founder creating eco-tourism experiences.',
        'A sports entrepreneur running a luxury fitness chain.'
      ]
    },
    {
      id: 'grey' as ProfessionalRole,
      name: 'GREY – Nomads (Multi-talented Individuals)',
      color: '#707070',
      description: 'Nomads (Multi-talented)',
      detailedDescription: 'Dynamic professionals with hybrid careers and diverse skill sets.',
      examples: [
        'A digital nomad working across continents.',
        'A multi-disciplinary artist blending music & technology.',
        'A consultant with expertise in multiple industries.'
      ]
    },
    {
      id: 'white' as ProfessionalRole,
      name: 'WHITE – Policy Makers & Health Professionals',
      color: '#FFFFFF',
      description: 'Policy Makers & Health Professionals',
      detailedDescription: 'Guardians of governance, social structure, and public well-being.',
      examples: [
        'A policy advisor drafting state-level startup incentives.',
        'A healthcare innovator launching AI-driven diagnostic tools.',
        'A doctor leading a rural telemedicine initiative.'
      ]
    },
    {
      id: 'black' as ProfessionalRole,
      name: 'BLACK – Prefer Not to Say',
      color: '#000000',
      description: 'Prefer Not to Say',
      detailedDescription: 'Individuals who choose to remain anonymous or undefined within categories.',
      examples: [
        'A stealth founder working on a confidential project.',
      ]
    }
  ]

  const toggleExpansion = (roleId: ProfessionalRole) => {
    setExpandedRole(expandedRole === roleId ? null : roleId)
  }

  const handleCategoryClick = (category: any) => {
    setProfessionalRole(category.id)
  }

  const handleToggleClick = (e: React.MouseEvent, roleId: ProfessionalRole) => {
    e.stopPropagation() // Prevent category selection when clicking toggle
    toggleExpansion(roleId)
  }

  const checkUserRole = async (userData: any) => {
    try {
      console.log('🔍 checkUserRole input:', { userData, email })
      
      // Use the roles field from the database as the primary source of truth
      const userRole = userData.roles || 'user'
      console.log('🔍 User role from database:', userRole)
      
      // Additional validation: if roles is 'owner', ensure spaceOwner relation exists
      if (userRole === 'owner' && !userData.spaceOwner) {
        console.warn('User has owner role but no spaceOwner relation')
        return 'user' // Fallback to user if data is inconsistent
      }

      // Respect the database role first
      if (userRole === 'admin') {
        console.log('🔍 User is admin (via database role)')
        return 'admin'
      } else if (userRole === 'owner') {
        console.log('🔍 User is owner (via database role)')
        return 'owner'
      } else {
        // Only check admin emails as fallback for 'user' role
        const adminEmails = [
        
          'admin@clubicles.com',
          
        ]
        
        if (adminEmails.includes(email)) {
          console.log('🔍 User is admin (via email list fallback)')
          return 'admin'
        }
      }

      console.log('🔍 Final user role:', userRole)
      return userRole
    } catch (err) {
      console.log('Role check error:', err)
      return 'user'
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Debug active tab
    console.log('🔍 Form submission - activeTab:', activeTab)

    // Validate professional role for individual users
    if (activeTab === 'user' && !professionalRole) {
      setError('Please select your professional category')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          professionalRole: activeTab === 'user' ? professionalRole : undefined
        })
      })

      const result = await response.json()
      
      // Debug API response
      console.log('🔍 API Response:', {
        ok: response.ok,
        status: response.status,
        result
      })

      if (!response.ok) {
        console.log('🔍 API Error:', result.error)
        setError(result.error || 'Authentication failed')
        setLoading(false)
        return
      }

      if (!result.data.user) {
        console.log('🔍 No user data in response')
        setError('Authentication failed. Please try again.')
        setLoading(false)
        return
      }

      // Determine user role
      const userRole = await checkUserRole(result.data.user)
      
      // Debug logging
      console.log('🔍 Signin Debug:', {
        activeTab,
        userRole,
        userData: result.data.user,
        isEmailVerified: result.data.user.isEmailVerified,
        spaceOwner: result.data.user.spaceOwner
      })

      // Check email verification for space owners
      if (userRole === 'owner' && !result.data.user.isEmailVerified) {
        setError('Please verify your email address before signing in. Check your inbox for the verification email.')
        setLoading(false)
        return
      }

      // Validate that the user is trying to log in with the correct account type
      if (activeTab === 'owner' && userRole !== 'owner' && userRole !== 'admin') {
        console.log('🔍 Access denied for owner tab:', { activeTab, userRole })
        setError('This account is not a space owner account. Please try logging in as an individual user, or contact support if you believe this is an error.')
        setLoading(false)
        return
      }

      if (activeTab === 'user' && userRole === 'owner') {
        setError('This is a space owner account. Please use the "Space Owner" login option instead.')
        setLoading(false)
        return
      }

      // Set the stype cookie and auth token based on determined role
      try {
        setCookie('stype', userRole, 7) // expires in 7 days
        setCookie('auth_token', result.data.token, 7)
      } catch (cookieErr) {
        console.warn('Failed to set cookies:', cookieErr)
        // Don't fail the login for this
      }

      // Determine redirect URL
      let redirectUrl = '/dashboard' // default
      if (returnUrl) {
        redirectUrl = decodeURIComponent(returnUrl)
      } else {
        switch (userRole) {
          case 'admin':
            // No redirect for admin - stay on signin page
            redirectUrl = '/signin'
            break
          case 'owner':
            redirectUrl = '/owner'
            break
          default:
            redirectUrl = '/dashboard'
        }
      }

      console.log('🔍 Redirect logic:', {
        userRole,
        redirectUrl,
        returnUrl
      })

      // Clear loading state before redirect
      setLoading(false)
      
      // Force refresh of auth state across the app by dispatching custom event
      window.dispatchEvent(new CustomEvent('authStateChanged'))
      
      // Use a small timeout to ensure state updates are processed
      setTimeout(() => {
        console.log('🔍 Attempting redirect to:', redirectUrl)
        // Try router.push first
        router.push(redirectUrl)
        
        // Fallback to window.location after a delay if router.push fails
        setTimeout(() => {
          if (window.location.pathname === '/signin') {
            console.log('Router.push may have failed, using window.location')
            window.location.href = redirectUrl
          }
        }, 1000)
      }, 100)

    } catch (err) {
      console.error('Sign in error:', err)
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

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

        <Card className="bg-white/10 backdrop-blur-md my-5  border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 rounded-2xl shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <p className="text-gray-300 mt-2">Sign in to your account</p>
          </CardHeader>
          <CardContent className="p-8">
            <Tabs value={activeTab} onValueChange={(value) => {
              console.log('🔍 Tab changed to:', value)
              setActiveTab(value as 'user' | 'owner')
            }} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/10 border border-white/20 rounded-xl p-1 mb-6">
                <TabsTrigger 
                  value="user" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm rounded-lg py-2 px-4 text-white/70 transition-all"
                >
                  <User className="w-4 h-4" />
                  User Login
                </TabsTrigger>
                <TabsTrigger 
                  value="owner"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm rounded-lg py-2 px-4 text-white/70 transition-all"
                >
                  <Building2 className="w-4 h-4" />
                  Space Owner
                </TabsTrigger>
              </TabsList>

              <TabsContent value="user" className="mt-0 space-y-6">
                <form onSubmit={handleSignIn} className="space-y-6">
                  {/* Professional Role Selection for Individual Users */}
                  <div className="space-y-4">
                    <Label className="text-white font-medium">Select Your Professional Category</Label>
                    <p className="text-sm text-gray-400">
                      Choose the category that best describes your professional identity.
                    </p>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="space-y-3">
                        {PROFESSIONAL_CATEGORIES.map((category) => (
                          <div key={category.id} className="relative">
                            <div
                              className={`w-full p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                                professionalRole === category.id
                                  ? "shadow-lg scale-[1.02]"
                                  : "hover:border-opacity-60"
                              }`}
                              style={{
                                borderColor: professionalRole === category.id ? category.color : category.color + '40',
                                backgroundColor: professionalRole === category.id ? `${category.color}20` : `${category.color}10`,
                                color: professionalRole === category.id ? category.color : '#ffffff'
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <button
                                  type="button"
                                  onClick={() => handleCategoryClick(category)}
                                  className="flex-1 text-left focus:outline-none"
                                >
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className="w-4 h-4 rounded-full flex-shrink-0" 
                                      style={{ backgroundColor: category.color }}
                                    ></div>
                                    <h3 className="font-semibold text-sm text-left">{category.name}</h3>
                                  </div>
                                  {professionalRole === category.id && (
                                    <div className="flex items-center mt-2 ml-7">
                                      <span className="text-xs opacity-75">✓ Selected</span>
                                    </div>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleClick(e, category.id)}
                                  className="p-1 rounded hover:bg-white/10 transition-colors flex-shrink-0 focus:outline-none"
                                  aria-label="Toggle details"
                                >
                                  {expandedRole === category.id ? (
                                    <ChevronUp className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                  )}
                                </button>
                              </div>
                            </div>
                            
                            {/* Expanded Details - Pushes content below */}
                            {expandedRole === category.id && (
                              <div 
                                className="mt-2 p-4 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out"
                                style={{
                                  backgroundColor: `${category.color}15`,
                                  borderColor: category.color + '60'
                                }}
                              >
                                <h4 className="font-semibold mb-2" style={{ color: category.color }}>
                                  {category.description}
                                </h4>
                                <p className="text-sm text-gray-300 mb-3">
                                  {category.detailedDescription}
                                </p>
                                <div>
                                  <p className="text-xs font-medium text-gray-400 mb-2">Examples:</p>
                                  <ul className="text-xs text-gray-300 space-y-1">
                                    {category.examples.map((example, idx) => (
                                      <li key={idx} className="flex items-start">
                                        <span className="mr-2" style={{ color: category.color }}>•</span>
                                        <span>{example}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Email and Password for User */}
                  <div>
                    <Label htmlFor="email" className="text-white font-medium">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder=""
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-white font-medium">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder=""
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl pr-12 px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    onClick={() => console.log('🔍 User Sign In button clicked')}
                    className="w-full bg-white text-black font-semibold hover:bg-gray-100 h-12 rounded-xl transition-all duration-200 shadow-lg"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In as User'}
                  </Button>
                </form>
                </TabsContent>

                <TabsContent value="owner" className="mt-0 space-y-6">
                  <form onSubmit={handleSignIn} className="space-y-6">
                  <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-300 text-sm">
                      Space owners can manage their spaces, bookings, and business information through the owner dashboard.
                    </p>
                  </div>

                  {/* Email and Password for Owner */}
                  <div>
                    <Label htmlFor="owner-email" className="text-white font-medium">Email Address</Label>
                    <Input
                      id="owner-email"
                      type="email"
                      placeholder=""
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="owner-password" className="text-white font-medium">Password</Label>
                    <div className="relative">
                      <Input
                        id="owner-password"
                        type={showPassword ? "text" : "password"}
                        placeholder=""
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl pr-12 px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    onClick={() => console.log('🔍 Space Owner Sign In button clicked')}
                    className="w-full bg-white text-black font-semibold hover:bg-gray-100 h-12 rounded-xl transition-all duration-200 shadow-lg"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In as Space Owner'}
                  </Button>
                  </form>
                </TabsContent>
            </Tabs>

            <div className="text-center space-y-4 mt-8">
              <Link href="/forgot-password" className="text-gray-300 hover:text-white transition-colors">
                Forgot your password?
              </Link>
              
              <p className="text-gray-300">
                Don't have an account?{' '}
                <Link href="/signup" className="text-white hover:underline font-medium">
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}
