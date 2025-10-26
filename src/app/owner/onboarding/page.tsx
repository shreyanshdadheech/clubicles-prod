'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Building, 
  MapPin, 
  Upload, 
  DollarSign, 
  Clock, 
  Wifi, 
  Coffee, 
  Car, 
  Users, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Camera,
  FileText,
  CreditCard,
  Star
} from 'lucide-react'

interface SpaceData {
  // Basic Info
  spaceName: string
  description: string
  category: string
  
  // Location
  address: string
  city: string
  state: string
  zipCode: string
  
  // Details
  capacity: string
  size: string
  hourlyRate: string
  dailyRate: string
  
  // Amenities
  amenities: string[]
  
  // Images
  images: string[]
  
  // Availability
  availability: {
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
  }
}

const SPACE_CATEGORIES = [
  'Coworking Space',
  'Meeting Room',
  'Event Hall',
  'Private Office',
  'Creative Studio',
  'Workshop Space',
  'Conference Room',
  'Other'
]

const AVAILABLE_AMENITIES = [
  { id: 'wifi', label: 'High-Speed WiFi', icon: Wifi },
  { id: 'coffee', label: 'Coffee & Tea', icon: Coffee },
  { id: 'parking', label: 'Parking Available', icon: Car },
  { id: 'projector', label: 'Projector/TV', icon: FileText },
  { id: 'whiteboard', label: 'Whiteboard', icon: FileText },
  { id: 'kitchen', label: 'Kitchen Access', icon: Coffee },
  { id: 'printing', label: 'Printing Facility', icon: FileText },
  { id: 'security', label: '24/7 Security', icon: CheckCircle }
]

function OwnerOnboardingContent() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  const [spaceData, setSpaceData] = useState<SpaceData>({
    spaceName: '',
    description: '',
    category: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    capacity: '',
    size: '',
    hourlyRate: '',
    dailyRate: '',
    amenities: [],
    images: [],
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    }
  })

  const handleInputChange = (field: keyof SpaceData, value: any) => {
    setSpaceData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAmenityToggle = (amenityId: string) => {
    setSpaceData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(a => a !== amenityId)
        : [...prev.amenities, amenityId]
    }))
  }

  const handleAvailabilityToggle = (day: keyof SpaceData['availability']) => {
    setSpaceData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: !prev.availability[day]
      }
    }))
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    // Validation
    if (!spaceData.spaceName.trim()) {
      alert('Please enter a space name')
      return
    }
    if (!spaceData.description.trim()) {
      alert('Please enter a description')
      return
    }
    if (!spaceData.category) {
      alert('Please select a category')
      return
    }
    if (!spaceData.address.trim()) {
      alert('Please enter an address')
      return
    }
    if (!spaceData.city.trim()) {
      alert('Please enter a city')
      return
    }
    if (!spaceData.state.trim()) {
      alert('Please enter a state')
      return
    }
    if (!spaceData.zipCode.trim()) {
      alert('Please enter a zip code')
      return
    }
    if (!spaceData.capacity.trim()) {
      alert('Please enter capacity')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/owner/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(spaceData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create space')
      }

      const result = await response.json()
      console.log('Space created successfully:', result)

      // Redirect to owner dashboard with success message
      router.push('/owner?onboarded=true&spaceId=' + result.spaceId)
    } catch (error) {
      console.error('Onboarding failed:', error)
      // You could add a toast notification here or show an error message
      alert('Failed to complete onboarding. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    'Basic Information',
    'Location & Details',
    'Pricing & Amenities',
    'Availability & Photos'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Welcome Banner for First-time Owners */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">Welcome, Space Owner!</h2>
            <p className="text-white/90 text-sm">
              Ready to share your workspace? Let's get your space listed on Clubicles and start earning!
            </p>
          </div>
        </div>
      </div>
      
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building className="w-8 h-8 text-white" />
              <div>
                <h1 className="text-2xl font-bold text-white">Space Onboarding</h1>
                <p className="text-gray-400">List your workspace in minutes</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-medium">Step {currentStep} of {steps.length}</div>
              <div className="text-gray-400 text-sm">{steps[currentStep - 1]}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index + 1 === currentStep 
                    ? 'bg-white text-black' 
                    : index + 1 < currentStep
                    ? 'bg-green-600 text-white'
                    : 'bg-white/20 text-gray-400'
                }`}>
                  {index + 1 < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-1 rounded ${
                    index + 1 < currentStep ? 'bg-green-600' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Building className="w-16 h-16 mx-auto mb-4 text-white" />
                  <h2 className="text-2xl font-bold text-white mb-2">Tell us about your space</h2>
                  <p className="text-gray-400">Let's start with the basics</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label className="text-white">Space Name</Label>
                    <Input
                      placeholder="e.g. Downtown Creative Hub"
                      value={spaceData.spaceName}
                      onChange={(e) => handleInputChange('spaceName', e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label className="text-white">Category</Label>
                    <select
                      value={spaceData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full p-3 bg-white/5 border border-white/20 rounded-md text-white"
                    >
                      <option value="" className="bg-gray-900">Select a category</option>
                      {SPACE_CATEGORIES.map(category => (
                        <option key={category} value={category} className="bg-gray-900">
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <Label className="text-white">Description</Label>
                    <textarea
                      placeholder="Describe your space, its features, and what makes it special..."
                      value={spaceData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full p-3 bg-white/5 border border-white/20 rounded-md text-white placeholder-gray-400 resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location & Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <MapPin className="w-16 h-16 mx-auto mb-4 text-white" />
                  <h2 className="text-2xl font-bold text-white mb-2">Location & Space Details</h2>
                  <p className="text-gray-400">Help people find your space</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label className="text-white">Street Address</Label>
                    <Input
                      placeholder="123 Main Street"
                      value={spaceData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <Label className="text-white">City</Label>
                    <Input
                      placeholder="New York"
                      value={spaceData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <Label className="text-white">State</Label>
                    <Input
                      placeholder="NY"
                      value={spaceData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Zip Code</Label>
                    <Input
                      placeholder="10001"
                      value={spaceData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Capacity (people)</Label>
                    <Input
                      type="number"
                      placeholder="10"
                      value={spaceData.capacity}
                      onChange={(e) => handleInputChange('capacity', e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Size (sq ft)</Label>
                    <Input
                      type="number"
                      placeholder="500"
                      value={spaceData.size}
                      onChange={(e) => handleInputChange('size', e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Pricing & Amenities */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <DollarSign className="w-16 h-16 mx-auto mb-4 text-white" />
                  <h2 className="text-2xl font-bold text-white mb-2">Pricing & Amenities</h2>
                  <p className="text-gray-400">Set your rates and highlight features</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <Label className="text-white">Hourly Rate (₹)</Label>
                    <Input
                      type="number"
                      placeholder="200"
                      value={spaceData.hourlyRate}
                      onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                      className="bg-white border-gray-300 text-black placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Daily Rate (₹)</Label>
                    <Input
                      type="number"
                      placeholder="1500"
                      value={spaceData.dailyRate}
                      onChange={(e) => handleInputChange('dailyRate', e.target.value)}
                      className="bg-white border-gray-300 text-black placeholder-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-4 block">Available Amenities</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {AVAILABLE_AMENITIES.map(amenity => {
                      const Icon = amenity.icon
                      const isSelected = spaceData.amenities.includes(amenity.id)
                      
                      return (
                        <button
                          key={amenity.id}
                          onClick={() => handleAmenityToggle(amenity.id)}
                          className={`p-4 rounded-lg border transition-all ${
                            isSelected 
                              ? 'bg-white/20 border-white/40 text-white' 
                              : 'bg-white/5 border-white/20 text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          <Icon className="w-6 h-6 mx-auto mb-2" />
                          <p className="text-sm">{amenity.label}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Availability & Photos */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-white" />
                  <h2 className="text-2xl font-bold text-white mb-2">Availability & Photos</h2>
                  <p className="text-gray-400">When is your space available?</p>
                </div>

                <div className="mb-8">
                  <Label className="text-white mb-4 block">Available Days</Label>
                  <div className="grid grid-cols-7 gap-2">
                    {Object.entries(spaceData.availability).map(([day, available]) => (
                      <button
                        key={day}
                        onClick={() => handleAvailabilityToggle(day as keyof SpaceData['availability'])}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          available 
                            ? 'bg-green-600 border-green-500 text-white' 
                            : 'bg-white/5 border-white/20 text-gray-400'
                        }`}
                      >
                        <div className="text-sm font-medium">
                          {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mt-6">
                  <div className="flex items-start space-x-3">
                    <Star className="w-6 h-6 text-green-400 mt-0.5" />
                    <div>
                      <h3 className="text-green-300 font-medium mb-1">You're almost ready!</h3>
                      <p className="text-green-200 text-sm">
                        Once you submit, we'll review your listing and get it live within 24 hours.
                        You'll start earning money as soon as bookings come in!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/20">
              <Button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button
                  onClick={nextStep}
                  className="bg-white text-black hover:bg-gray-100"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Complete Onboarding
                      <CheckCircle className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function OwnerOnboarding() {
  return <OwnerOnboardingContent />
}
