'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProfessionalRoleSelector, ProfessionalBadge } from '@/components/ui/professional-selector'
import { 
  User, Mail, Phone, MapPin, Calendar, Edit, Save, X, 
  Camera, Shield, Bell, ArrowLeft, CheckCircle, AlertCircle
} from 'lucide-react'
import { User as UserType, ProfessionalRole } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

// No mock user needed - we'll fetch real data

export default function ProfilePage() {
  return <ProfileContent />
}

function ProfileContent() {
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    city: '',
    professional_role: 'indigo' as ProfessionalRole
  })

  useEffect(() => {
    const getUser = async () => {
      try {
        console.log('Profile page - Fetching user data from /api/auth/me')
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Profile page - API response:', data)
          
          if (data.success && data.user) {
            // Use the actual user data from the API
            setUser(data.user)
          } else {
            console.log('Profile page - No user data in response')
            setUser(null)
          }
        } else {
          console.log('Profile page - API call failed, status:', response.status)
          setUser(null)
        }
      } catch (error) {
        console.error('Profile page - Error fetching user:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    getUser()
  }, [])

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      console.log('Profile page - Updating form with user data:', user)
      const fullName = user.first_name || user.last_name ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : ''
      setEditForm({
        full_name: fullName,
        phone: user.phone || '',
        city: user.city || '',
        professional_role: user.professional_role as ProfessionalRole || 'indigo'
      })
      console.log('Profile page - Form updated with:', {
        full_name: fullName,
        phone: user.phone || '',
        city: user.city || '',
        professional_role: user.professional_role as ProfessionalRole || 'indigo'
      })
    }
  }, [user])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 4000)
  }

  const handleSave = async () => {
    if (!user) {
      showNotification('error', 'User not found')
      return
    }

    // Basic validation
    if (!editForm.full_name.trim()) {
      showNotification('error', 'Full name is required')
      return
    }
    
    if (!editForm.phone.trim()) {
      showNotification('error', 'Phone number is required')
      return
    }
    
    if (!editForm.city.trim()) {
      showNotification('error', 'City is required')
      return
    }

    // Validate phone format (basic)
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
    if (!phoneRegex.test(editForm.phone)) {
      showNotification('error', 'Please enter a valid phone number')
      return
    }
    
    setIsSaving(true)
    
    try {
      console.log('Sending profile update request:', {
        full_name: editForm.full_name,
        phone: editForm.phone,
        city: editForm.city,
        professional_role: editForm.professional_role,
      })

      // Call API to update profile in database
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: editForm.full_name,
          phone: editForm.phone,
          city: editForm.city,
          professional_role: editForm.professional_role,
        }),
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (response.ok) {
        const result = await response.json()
        console.log('Profile update result:', result)
        
        // Fetch fresh user data from server
        try {
          const userResponse = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include'
          })
          
          if (userResponse.ok) {
            const userData = await userResponse.json()
            if (userData.success && userData.user) {
              setUser(userData.user)
            }
          }
        } catch (error) {
          console.error('Error fetching updated user data:', error)
        }

        setIsEditing(false)
        showNotification('success', 'Profile updated successfully!')
      } else {
        const errorData = await response.json()
        console.error('Profile update error response:', errorData)
        showNotification('error', errorData.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      showNotification('error', 'An error occurred while updating your profile.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form to original values
    if (user) {
      setEditForm({
        full_name: user.first_name || user.last_name ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
        phone: user.phone || '',
        city: user.city || '',
        professional_role: user.professional_role as ProfessionalRole || 'indigo'
      })
    }
    setIsEditing(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }


  const renderProfileTab = () => {
    if (!user) return null;
    
    return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white">Personal Information</CardTitle>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
              className="border-gray-600 text-black hover:bg-gray-800 hover:text-white"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button
                onClick={handleSave}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isSaving || isLoading}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
                disabled={isSaving}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.first_name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </div>
            <button className="absolute bottom-0 right-0 w-6 h-6 bg-white text-black rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
              <Camera className="w-3 h-3" />
            </button>
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">
              {user.first_name || user.last_name ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Unknown User'}
            </h3>
            <p className="text-gray-400 break-all text-sm">{user.email}</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
            {isEditing ? (
              <Input
                id="fullName"
                value={editForm.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className="!bg-gray-800 !border-gray-700 !text-white mt-1 focus:!border-blue-500 focus:!ring-1 focus:!ring-blue-500 !placeholder-gray-400"
                placeholder="Enter your full name"
                required
              />
            ) : (
              <div className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 mt-1">
                <div className="flex items-center text-white">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  {user.first_name || user.last_name ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Not set'}
                </div>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <div className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 mt-1">
              <div className="flex items-center text-white">
                <Mail className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                <span className="break-all text-sm">{user.email}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
            {isEditing ? (
              <Input
                id="phone"
                value={editForm.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="!bg-gray-800 !border-gray-700 !text-white mt-1 focus:!border-blue-500 focus:!ring-1 focus:!ring-blue-500 !placeholder-gray-400"
                placeholder="Enter your phone number"
                required
              />
            ) : (
              <div className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 mt-1">
                <div className="flex items-center text-white">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  {user.phone || 'Not set'}
                </div>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="city" className="text-gray-300">City</Label>
            {isEditing ? (
              <Input
                id="city"
                value={editForm.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="!bg-gray-800 !border-gray-700 !text-white mt-1 focus:!border-blue-500 focus:!ring-1 focus:!ring-blue-500 !placeholder-gray-400"
                placeholder="Enter your city"
                required
              />
            ) : (
              <div className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 mt-1">
                <div className="flex items-center text-white">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  {user.city || 'Not set'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* VIBGYOR Role */}
        <div>
          <Label className="text-gray-300">Professional Category</Label>
          {isEditing ? (
            <div className="mt-2">
              <ProfessionalRoleSelector
                selectedRole={editForm.professional_role}
                onRoleSelect={(role) => handleInputChange('professional_role', role)}
              />
            </div>
          ) : (
            <div className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 mt-1">
              <div className="flex items-center">
                {user.professional_role ? (
                  <ProfessionalBadge role={user.professional_role} />
                ) : (
                  <span className="text-gray-400">Not set</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Metadata */}
        {user.updated_at && (
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between text-gray-300 text-sm">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Last updated
              </span>
              <span className="text-gray-400">
                {new Date(user.updated_at).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center text-gray-300">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Member since {new Date(user.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-300">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
          <p className="text-gray-300 mb-4">Please sign in to view your profile.</p>
          <Link href="/signin">
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
              Sign In
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-black/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2 text-gray-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
              <span className="font-doto text-4xl md:text-4xl font-black tracking-wider text-white">CLUBICLES</span>

              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-4">
            Profile
          </h1>
          <p className="text-gray-300 text-lg">
            Manage your account settings
          </p>
        </div>


        {/* Profile Content */}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            {renderProfileTab()}
          </div>
        </div>
      </div>
    </div>
  )
}