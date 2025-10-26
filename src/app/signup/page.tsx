'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfessionalRoleSelector } from '@/components/ui/professional-selector'
import { Eye, EyeOff, User, Building2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { setCookie } from '@/lib/utils'
import { ProfessionalRole } from '@/types'

export default function SignUpPage() {
  // Common fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [city, setCity] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [verificationLoading, setVerificationLoading] = useState(false)
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})
  
  // Individual fields
  const [professionalRole, setProfessionalRole] = useState<ProfessionalRole | null>(null)
  
  // Space owner fields
  const [companyName, setCompanyName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [gstNumber, setGstNumber] = useState('')
  const [panNumber, setPanNumber] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')
  const [businessCity, setBusinessCity] = useState('')
  const [businessState, setBusinessState] = useState('')
  const [businessPincode, setBusinessPincode] = useState('')
  
  // Payment information fields
  const [bankAccountNumber, setBankAccountNumber] = useState('')
  const [bankIfscCode, setBankIfscCode] = useState('')
  const [bankAccountHolderName, setBankAccountHolderName] = useState('')
  const [bankName, setBankName] = useState('')
  const [upiId, setUpiId] = useState('')
  
  const router = useRouter()

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim()) return 'Email is required'
    if (!emailRegex.test(email)) return 'Please enter a valid email address'
    return ''
  }

  const validatePassword = (password: string) => {
    if (!password.trim()) return 'Password is required'
    if (password.length < 8) return 'Password must be at least 8 characters long'
    return ''
  }

  const validateFullName = (name: string) => {
    if (!name.trim()) return 'Full name is required'
    if (name.trim().length < 2) return 'Full name must be at least 2 characters'
    return ''
  }

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[6-9]\d{9}$/
    if (!phone.trim()) return 'Phone number is required'
    if (!phoneRegex.test(phone)) return 'Please enter a valid 10-digit mobile number'
    return ''
  }

  const validateCity = (city: string) => {
    if (!city.trim()) return 'City is required'
    if (city.trim().length < 2) return 'City must be at least 2 characters'
    return ''
  }

  const validateBusinessAddress = (address: string) => {
    if (!address.trim()) return 'Business address is required'
    if (address.trim().length < 10) return 'Business address must be at least 10 characters'
    return ''
  }

  const validateBusinessCity = (city: string) => {
    if (!city.trim()) return 'Business city is required'
    if (city.trim().length < 2) return 'Business city must be at least 2 characters'
    return ''
  }

  const validateBusinessState = (state: string) => {
    if (!state.trim()) return 'State is required'
    if (state.trim().length < 2) return 'State must be at least 2 characters'
    return ''
  }

  const validatePincode = (pincode: string) => {
    const pincodeRegex = /^[1-9][0-9]{5}$/
    if (!pincode.trim()) return 'Pincode is required'
    if (!pincodeRegex.test(pincode)) return 'Please enter a valid 6-digit pincode'
    return ''
  }

  const validateGSTNumber = (gst: string) => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    if (!gst.trim()) return 'GST number is required'
    if (!gstRegex.test(gst)) return 'Please enter a valid GST number'
    return ''
  }

  const validatePANNumber = (pan: string) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
    if (!pan.trim()) return 'PAN number is required'
    if (!panRegex.test(pan)) return 'Please enter a valid PAN number'
    return ''
  }

  const validateIndividualForm = () => {
    const errors: {[key: string]: string} = {}
    
    errors.email = validateEmail(email)
    errors.password = validatePassword(password)
    errors.fullName = validateFullName(fullName)
    errors.phoneNumber = validatePhoneNumber(phoneNumber)
    errors.city = validateCity(city)
    
      if (!professionalRole) {
      errors.professionalRole = 'Professional role is required'
    }

    setFormErrors(errors)
    return Object.values(errors).every(error => error === '')
  }

  const validateSpaceOwnerForm = () => {
    const errors: {[key: string]: string} = {}
    
    // Common fields
    errors.email = validateEmail(email)
    errors.password = validatePassword(password)
    errors.fullName = validateFullName(fullName)
    errors.phoneNumber = validatePhoneNumber(phoneNumber)
    errors.city = validateCity(city)
    
    // Business fields
    errors.businessAddress = validateBusinessAddress(businessAddress)
    errors.businessCity = validateBusinessCity(businessCity)
    errors.businessState = validateBusinessState(businessState)
    errors.businessPincode = validatePincode(businessPincode)
    errors.gstNumber = validateGSTNumber(gstNumber)
    errors.panNumber = validatePANNumber(panNumber)

    setFormErrors(errors)
    return Object.values(errors).every(error => error === '')
  }

  const handleSendOtp = async (e: React.FormEvent, userType: 'user' | 'owner' = 'user') => {
    e.preventDefault()
    setOtpLoading(true)
    setError(null)
    setFormErrors({})

    // Validate form based on user type
    const isValid = userType === 'user' ? validateIndividualForm() : validateSpaceOwnerForm()
    
    if (!isValid) {
      setError('Please fill in all required fields correctly')
        setOtpLoading(false)
        return
    }

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          userType
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setOtpSent(true)
        setError(null)
      } else {
        setError(data.error || 'Failed to send OTP')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent, userType: 'user' | 'owner' = 'user') => {
    e.preventDefault()
    setVerificationLoading(true)
    setError(null)

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      setVerificationLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
          password,
          userType,
          firstName: fullName.split(' ')[0] || '',
          lastName: fullName.split(' ').slice(1).join(' ') || '',
          phone: phoneNumber,
          city: city,
          professionalRole: professionalRole,
          ...(userType === 'owner' && {
            businessInfo: {
              business_name: companyName,
              business_type: businessType,
              gst_number: gstNumber,
              pan_number: panNumber,
              business_address: businessAddress,
              business_city: businessCity,
              business_state: businessState,
              business_pincode: businessPincode
            },
            paymentInfo: {
              bank_account_number: bankAccountNumber,
              bank_ifsc_code: bankIfscCode,
              bank_account_holder_name: bankAccountHolderName,
              bank_name: bankName,
              upi_id: upiId
            }
          })
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store auth token
        setCookie('auth_token', data.token, 7)
        
        // Redirect to appropriate dashboard
        if (userType === 'owner') {
          router.push('/owner')
        } else {
          router.push('/dashboard')
        }
      } else {
        setError(data.error || 'Verification failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setVerificationLoading(false)
    }
  }

  const handleIndividualSignUp = async (e: React.FormEvent) => {
    await handleSendOtp(e, 'user')
  }

  const handleSpaceOwnerSignUp = async (e: React.FormEvent) => {
    await handleSendOtp(e, 'owner')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white flex items-center justify-center py-8">
      <div className="max-w-lg w-full mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3">
            <div className="w-20 h-20 flex items-center justify-center">
              <img src="/logo.svg" alt="Clubicles Logo" className="w-14 h-14" />
            </div>
            <span className="font-orbitron text-3xl md:text-4xl font-black tracking-wider text-white">
              CLUBICLES
            </span>
          </Link>
        </div>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 rounded-2xl shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Create Your Account
            </CardTitle>
            <p className="text-gray-300 mt-2">Join thousands of professionals and space owners</p>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="individual" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/10 border border-white/20 rounded-xl p-1">
                <TabsTrigger 
                  value="individual" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm rounded-lg py-2 px-4 text-white/70 transition-all"
                >
                  <User className="w-4 h-4" />
                  Individual
                </TabsTrigger>
                <TabsTrigger 
                  value="space-owner"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm rounded-lg py-2 px-4 text-white/70 transition-all"
                >
                  <Building2 className="w-4 h-4" />
                  Space Owner
                </TabsTrigger>
              </TabsList>

              {/* Individual Signup Tab */}
              <TabsContent value="individual">
                {!otpSent ? (
                  <form onSubmit={handleIndividualSignUp} className="space-y-4 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName" className="text-white font-medium">Full Name *</Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value)
                          if (formErrors.fullName) {
                            setFormErrors(prev => ({ ...prev, fullName: '' }))
                          }
                        }}
                        className={`mt-1 bg-white/20 backdrop-blur-sm border rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 ${
                          formErrors.fullName ? 'border-red-500' : 'border-white/30'
                        }`}
                        required
                      />
                      {formErrors.fullName && (
                        <p className="text-red-400 text-sm mt-1">{formErrors.fullName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-white font-medium">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          if (formErrors.email) {
                            setFormErrors(prev => ({ ...prev, email: '' }))
                          }
                        }}
                        className={`mt-1 bg-white/20 backdrop-blur-sm border rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 ${
                          formErrors.email ? 'border-red-500' : 'border-white/30'
                        }`}
                        required
                      />
                      {formErrors.email && (
                        <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="text-white font-medium">Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value)
                          if (formErrors.phoneNumber) {
                            setFormErrors(prev => ({ ...prev, phoneNumber: '' }))
                          }
                        }}
                        className={`mt-1 bg-white/20 backdrop-blur-sm border rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 ${
                          formErrors.phoneNumber ? 'border-red-500' : 'border-white/30'
                        }`}
                        required
                      />
                      {formErrors.phoneNumber && (
                        <p className="text-red-400 text-sm mt-1">{formErrors.phoneNumber}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="city" className="text-white font-medium">City *</Label>
                      <Input
                        id="city"
                        type="text"
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value)
                          if (formErrors.city) {
                            setFormErrors(prev => ({ ...prev, city: '' }))
                          }
                        }}
                        className={`mt-1 bg-white/20 backdrop-blur-sm border rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 ${
                          formErrors.city ? 'border-red-500' : 'border-white/30'
                        }`}
                        required
                      />
                      {formErrors.city && (
                        <p className="text-red-400 text-sm mt-1">{formErrors.city}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-white font-medium">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          if (formErrors.password) {
                            setFormErrors(prev => ({ ...prev, password: '' }))
                          }
                        }}
                        className={`mt-1 bg-white/20 backdrop-blur-sm border rounded-xl pr-12 px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 ${
                          formErrors.password ? 'border-red-500' : 'border-white/30'
                        }`}
                        minLength={8}
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
                    {formErrors.password && (
                      <p className="text-red-400 text-sm mt-1">{formErrors.password}</p>
                    )}
                  </div>

                  {/* Professional Role Selection */}
                  <div className="space-y-3">
                    <Label className="text-white font-medium">Professional Category *</Label>
                    <p className="text-sm text-gray-400">
                      Choose the category that best describes your profession.
                    </p>
                    <div className="max-h-80 overflow-y-auto bg-white/5 rounded-xl p-4 border border-white/10">
                      <ProfessionalRoleSelector
                        selectedRole={professionalRole || undefined}
                        onRoleSelect={(role) => {
                          setProfessionalRole(role)
                          if (formErrors.professionalRole) {
                            setFormErrors(prev => ({ ...prev, professionalRole: '' }))
                          }
                        }}
                        className="mb-0"
                      />
                    </div>
                    {formErrors.professionalRole && (
                      <p className="text-red-400 text-sm mt-1">{formErrors.professionalRole}</p>
                    )}
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className={`w-full h-12 rounded-xl transition-all duration-200 shadow-lg font-semibold ${
                      loading 
                        ? 'bg-gray-500 text-gray-200 cursor-not-allowed' 
                        : 'bg-white text-black hover:bg-gray-100'
                    }`}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full"></div>
                        Creating Account...
                      </div>
                    ) : (
                      'Create Individual Account'
                    )}
                  </Button>
                </form>
                ) : (
                  <form onSubmit={(e) => handleVerifyOtp(e, 'user')} className="space-y-4 mt-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-white mb-2">Verify Your Email</h3>
                      <p className="text-gray-300">
                        We've sent a 6-digit verification code to <strong>{email}</strong>
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="otp" className="text-white font-medium">Verification Code</Label>
                      <Input
                        id="otp"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit code"
                        className="mt-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 text-center text-2xl tracking-widest"
                        maxLength={6}
                        required
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOtpSent(false)}
                        className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className={`flex-1 h-12 rounded-xl transition-all duration-200 shadow-lg font-semibold ${
                          verificationLoading 
                            ? 'bg-gray-500 text-gray-200 cursor-not-allowed' 
                            : 'bg-white text-black hover:bg-gray-100'
                        }`}
                        disabled={verificationLoading}
                      >
                        {verificationLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full"></div>
                            Verifying...
                          </div>
                        ) : (
                          'Verify & Create Account'
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </TabsContent>

              {/* Space Owner Signup Tab */}
              <TabsContent value="space-owner">
                {!otpSent ? (
                  <form onSubmit={handleSpaceOwnerSignUp} className="space-y-4 mt-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ownerFullName" className="text-white font-medium">Full Name *</Label>
                        <Input
                          id="ownerFullName"
                          type="text"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value)
                            if (formErrors.fullName) {
                              setFormErrors(prev => ({ ...prev, fullName: '' }))
                            }
                          }}
                          className={`mt-1 bg-white/20 backdrop-blur-sm border rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 ${
                            formErrors.fullName ? 'border-red-500' : 'border-white/30'
                          }`}
                          required
                        />
                        {formErrors.fullName && (
                          <p className="text-red-400 text-sm mt-1">{formErrors.fullName}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="ownerEmail" className="text-white font-medium">Email *</Label>
                        <Input
                          id="ownerEmail"
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value)
                            if (formErrors.email) {
                              setFormErrors(prev => ({ ...prev, email: '' }))
                            }
                          }}
                          className={`mt-1 bg-white/20 backdrop-blur-sm border rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 ${
                            formErrors.email ? 'border-red-500' : 'border-white/30'
                          }`}
                          required
                        />
                        {formErrors.email && (
                          <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label htmlFor="ownerPhone" className="text-white font-medium">Phone *</Label>
                        <Input
                          id="ownerPhone"
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => {
                            setPhoneNumber(e.target.value)
                            if (formErrors.phoneNumber) {
                              setFormErrors(prev => ({ ...prev, phoneNumber: '' }))
                            }
                          }}
                          className={`mt-1 bg-white/20 backdrop-blur-sm border rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 ${
                            formErrors.phoneNumber ? 'border-red-500' : 'border-white/30'
                          }`}
                          required
                        />
                        {formErrors.phoneNumber && (
                          <p className="text-red-400 text-sm mt-1">{formErrors.phoneNumber}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="ownerCity" className="text-white font-medium">City *</Label>
                        <Input
                          id="ownerCity"
                          type="text"
                          value={city}
                          onChange={(e) => {
                            setCity(e.target.value)
                            if (formErrors.city) {
                              setFormErrors(prev => ({ ...prev, city: '' }))
                            }
                          }}
                          className={`mt-1 bg-white/20 backdrop-blur-sm border rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 ${
                            formErrors.city ? 'border-red-500' : 'border-white/30'
                          }`}
                          required
                        />
                        {formErrors.city && (
                          <p className="text-red-400 text-sm mt-1">{formErrors.city}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label htmlFor="ownerPassword" className="text-white font-medium">Password *</Label>
                      <div className="relative">
                        <Input
                          id="ownerPassword"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value)
                            if (formErrors.password) {
                              setFormErrors(prev => ({ ...prev, password: '' }))
                            }
                          }}
                          className={`mt-1 bg-white/20 backdrop-blur-sm border rounded-xl pr-12 px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 ${
                            formErrors.password ? 'border-red-500' : 'border-white/30'
                          }`}
                          minLength={8}
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
                      {formErrors.password && (
                        <p className="text-red-400 text-sm mt-1">{formErrors.password}</p>
                      )}
                    </div>
                  </div>

                  {/* Business Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Business Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="companyName" className="text-white font-medium">Company Name *</Label>
                        <Input
                          id="companyName"
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="mt-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessType" className="text-white font-medium">Business Type *</Label>
                        <Input
                          id="businessType"
                          type="text"
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value)}
                          placeholder="e.g., Co-working, Restaurant, Cafe"
                          className="mt-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label htmlFor="gstNumber" className="text-white font-medium">GST Number *</Label>
                        <Input
                          id="gstNumber"
                          type="text"
                          value={gstNumber}
                          onChange={(e) => {
                            setGstNumber(e.target.value)
                            if (formErrors.gstNumber) {
                              setFormErrors(prev => ({ ...prev, gstNumber: '' }))
                            }
                          }}
                          placeholder="Required for business verification"
                          className={`mt-1 bg-white/20 backdrop-blur-sm border rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 ${
                            formErrors.gstNumber ? 'border-red-500' : 'border-white/30'
                          }`}
                          required
                        />
                        {formErrors.gstNumber && (
                          <p className="text-red-400 text-sm mt-1">{formErrors.gstNumber}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="panNumber" className="text-white font-medium">PAN Number *</Label>
                        <Input
                          id="panNumber"
                          type="text"
                          value={panNumber}
                          onChange={(e) => {
                            setPanNumber(e.target.value)
                            if (formErrors.panNumber) {
                              setFormErrors(prev => ({ ...prev, panNumber: '' }))
                            }
                          }}
                          placeholder="Required for KYC"
                          className={`mt-1 bg-white/20 backdrop-blur-sm border rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 ${
                            formErrors.panNumber ? 'border-red-500' : 'border-white/30'
                          }`}
                          required
                        />
                        {formErrors.panNumber && (
                          <p className="text-red-400 text-sm mt-1">{formErrors.panNumber}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label htmlFor="businessAddress" className="text-white font-medium">Business Address *</Label>
                      <Input
                        id="businessAddress"
                        type="text"
                        value={businessAddress}
                        onChange={(e) => {
                          setBusinessAddress(e.target.value)
                          if (formErrors.businessAddress) {
                            setFormErrors(prev => ({ ...prev, businessAddress: '' }))
                          }
                        }}
                        placeholder="Street address, building number"
                        className={`mt-1 bg-white/20 backdrop-blur-sm border rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 ${
                          formErrors.businessAddress ? 'border-red-500' : 'border-white/30'
                        }`}
                        required
                      />
                      {formErrors.businessAddress && (
                        <p className="text-red-400 text-sm mt-1">{formErrors.businessAddress}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <Label htmlFor="businessCity" className="text-white font-medium">City *</Label>
                        <Input
                          id="businessCity"
                          type="text"
                          value={businessCity}
                          onChange={(e) => {
                            setBusinessCity(e.target.value)
                            if (formErrors.businessCity) {
                              setFormErrors(prev => ({ ...prev, businessCity: '' }))
                            }
                          }}
                          placeholder="Business city"
                          className={`mt-1 bg-white/20 backdrop-blur-sm border rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 ${
                            formErrors.businessCity ? 'border-red-500' : 'border-white/30'
                          }`}
                          required
                        />
                        {formErrors.businessCity && (
                          <p className="text-red-400 text-sm mt-1">{formErrors.businessCity}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="businessState" className="text-white font-medium">State *</Label>
                        <Input
                          id="businessState"
                          type="text"
                          value={businessState}
                          onChange={(e) => {
                            setBusinessState(e.target.value)
                            if (formErrors.businessState) {
                              setFormErrors(prev => ({ ...prev, businessState: '' }))
                            }
                          }}
                          placeholder="State"
                          className={`mt-1 bg-white/20 backdrop-blur-sm border rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 ${
                            formErrors.businessState ? 'border-red-500' : 'border-white/30'
                          }`}
                          required
                        />
                        {formErrors.businessState && (
                          <p className="text-red-400 text-sm mt-1">{formErrors.businessState}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="businessPincode" className="text-white font-medium">Pincode *</Label>
                        <Input
                          id="businessPincode"
                          type="text"
                          value={businessPincode}
                          onChange={(e) => {
                            setBusinessPincode(e.target.value)
                            if (formErrors.businessPincode) {
                              setFormErrors(prev => ({ ...prev, businessPincode: '' }))
                            }
                          }}
                          placeholder="6 digits"
                          maxLength={6}
                          className={`mt-1 bg-white/20 backdrop-blur-sm border rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 ${
                            formErrors.businessPincode ? 'border-red-500' : 'border-white/30'
                          }`}
                          required
                        />
                        {formErrors.businessPincode && (
                          <p className="text-red-400 text-sm mt-1">{formErrors.businessPincode}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Payment Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bankAccountNumber" className="text-white font-medium">Bank Account Number *</Label>
                        <Input
                          id="bankAccountNumber"
                          type="text"
                          value={bankAccountNumber}
                          onChange={(e) => setBankAccountNumber(e.target.value)}
                          placeholder="Account number"
                          className="mt-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="bankIfscCode" className="text-white font-medium">IFSC Code *</Label>
                        <Input
                          id="bankIfscCode"
                          type="text"
                          value={bankIfscCode}
                          onChange={(e) => setBankIfscCode(e.target.value)}
                          placeholder="Bank IFSC code"
                          className="mt-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label htmlFor="bankAccountHolderName" className="text-white font-medium">Account Holder Name *</Label>
                        <Input
                          id="bankAccountHolderName"
                          type="text"
                          value={bankAccountHolderName}
                          onChange={(e) => setBankAccountHolderName(e.target.value)}
                          placeholder="As per bank records"
                          className="mt-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="bankName" className="text-white font-medium">Bank Name *</Label>
                        <Input
                          id="bankName"
                          type="text"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="e.g., HDFC Bank, SBI"
                          className="mt-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label htmlFor="upiId" className="text-white font-medium">UPI ID</Label>
                      <Input
                        id="upiId"
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="user@paytm (Optional)"
                        className="mt-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className={`w-full h-12 rounded-xl transition-all duration-200 shadow-lg font-semibold ${
                      loading 
                        ? 'bg-gray-500 text-gray-200 cursor-not-allowed' 
                        : 'bg-white text-black hover:bg-gray-100'
                    }`}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full"></div>
                        Creating Account...
                      </div>
                    ) : (
                      'Create Space Owner Account'
                    )}
                  </Button>
                </form>
                ) : (
                  <form onSubmit={(e) => handleVerifyOtp(e, 'owner')} className="space-y-4 mt-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-white mb-2">Verify Your Email</h3>
                      <p className="text-gray-300">
                        We've sent a 6-digit verification code to <strong>{email}</strong>
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="otp" className="text-white font-medium">Verification Code</Label>
                      <Input
                        id="otp"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit code"
                        className="mt-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 text-center text-2xl tracking-widest"
                        maxLength={6}
                        required
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOtpSent(false)}
                        className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className={`flex-1 h-12 rounded-xl transition-all duration-200 shadow-lg font-semibold ${
                          verificationLoading 
                            ? 'bg-gray-500 text-gray-200 cursor-not-allowed' 
                            : 'bg-white text-black hover:bg-gray-100'
                        }`}
                        disabled={verificationLoading}
                      >
                        {verificationLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full"></div>
                            Verifying...
                          </div>
                        ) : (
                          'Verify & Create Account'
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </TabsContent>
            </Tabs>

            <div className="text-center mt-6">
              <p className="text-gray-300">
                Already have an account?{' '}
                <Link href="/signin" className="text-white hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
