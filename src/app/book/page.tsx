'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ProfessionalBadge } from '@/components/ui/professional-selector'
import { 
  Search, MapPin, Wifi, Coffee, Car, Users, Clock, Star, 
  Filter, ChevronDown, Calendar, Phone, ArrowLeft, Building 
} from 'lucide-react'
import { Space, ProfessionalRole } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { PROFESSIONAL_CATEGORIES } from '@/lib/professional-categories'
import Link from 'next/link'

// Mock spaces data
const mockSpaces: Space[] = [
  {
    id: '1',
    owner_id: 'owner1',
    name: 'TechHub Co-working BKC',
    description: 'Premium workspace in the heart of Mumbai\'s business district. Perfect for tech professionals and startups.',
    address: 'Bandra Kurla Complex, Mumbai',
    city: 'Mumbai',
    pincode: '400051',
    total_seats: 50,
    available_seats: 35,
    price_per_hour: 150,
    price_per_day: 1200,
    amenities: ['WiFi', 'Coffee', 'Meeting Rooms', 'Parking', 'AC', 'Printer'],
    images: [],
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    owner_id: 'owner2',
    name: 'Creative Studio Koregaon',
    description: 'Inspiring workspace for creative professionals. Open layout with natural light and artistic ambiance.',
    address: 'Koregaon Park, Pune',
    city: 'Pune',
    pincode: '411001',
    total_seats: 30,
    available_seats: 22,
    price_per_hour: 120,
    price_per_day: 950,
    amenities: ['WiFi', 'Design Tools', 'Print Station', 'Coffee', 'AC'],
    images: [],
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    owner_id: 'owner3',
    name: 'Executive Lounge Gurgaon',
    description: 'Professional workspace for business meetings and corporate activities. Premium location with excellent connectivity.',
    address: 'Cyber City, Gurgaon',
    city: 'Gurgaon',
    pincode: '122002',
    total_seats: 25,
    available_seats: 18,
    price_per_hour: 200,
    price_per_day: 1600,
    amenities: ['WiFi', 'Coffee', 'Meeting Rooms', 'Parking', 'AC', 'Security', 'Reception'],
    images: [],
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

interface BookingModalProps {
  space: Space
  onClose: () => void
  onBook: (bookingDetails: any) => void
}

function BookingModal({ space, onClose, onBook }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [duration, setDuration] = useState(1)
  const [seats, setSeats] = useState(1)

  const handleBook = () => {
    const bookingDetails = {
      spaceId: space.id,
      date: selectedDate,
      time: selectedTime,
      duration,
      seats,
      totalAmount: duration * seats * space.price_per_hour
    }
    onBook(bookingDetails)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-gray-900 border-gray-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Book {space.name}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Start Time
            </label>
            <Input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duration (hours)
            </label>
            <Input
              type="number"
              min="1"
              max="12"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of Seats
            </label>
            <Input
              type="number"
              min="1"
              max={space.available_seats}
              value={seats}
              onChange={(e) => setSeats(parseInt(e.target.value) || 1)}
              className="bg-gray-800 border-gray-700 text-white"
            />
            <p className="text-xs text-gray-400 mt-1">
              {space.available_seats} seats available
            </p>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Booking Summary</h4>
            <div className="space-y-1 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Rate per hour:</span>
                <span>{formatCurrency(space.price_per_hour)}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{duration} hours</span>
              </div>
              <div className="flex justify-between">
                <span>Seats:</span>
                <span>{seats}</span>
              </div>
              <hr className="border-gray-600 my-2" />
              <div className="flex justify-between font-medium text-white">
                <span>Total:</span>
                <span>{formatCurrency(duration * seats * space.price_per_hour)}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleBook}
            className="w-full bg-white text-black hover:bg-gray-200"
            disabled={!selectedDate || !selectedTime}
          >
            Proceed to Payment
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function BookSpacePage() {
  const [spaces, setSpaces] = useState<Space[]>(mockSpaces)
  const [filteredSpaces, setFilteredSpaces] = useState<Space[]>(mockSpaces)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null)

  const cities = Array.from(new Set(spaces.map(space => space.city)))

  useEffect(() => {
    let filtered = spaces

    if (searchQuery) {
      filtered = filtered.filter(space =>
        space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        space.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        space.city.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCity) {
      filtered = filtered.filter(space => space.city === selectedCity)
    }

    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number)
      filtered = filtered.filter(space =>
        space.price_per_hour >= min && space.price_per_hour <= max
      )
    }

    setFilteredSpaces(filtered)
  }, [searchQuery, selectedCity, priceRange, spaces])

  const handleBooking = (bookingDetails: any) => {
    console.log('Booking details:', bookingDetails)
    alert('Booking initiated! Redirecting to payment...')
    setSelectedSpace(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
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
                <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center">
                  <img src="/logo.svg" alt="Clubicles Logo" className="w-14 h-14" />
                </div>
                <span className="font-orbitron text-xl md:text-2xl font-black tracking-wider text-white">
                  CLUBICLES
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-4">
            Book a Space
          </h1>
          <p className="text-gray-300 text-lg">
            Find and book your next workspace
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="bg-gray-900/50 border-gray-700 mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search spaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>

              {/* City Filter */}
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              {/* Price Range Filter */}
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
              >
                <option value="">All Prices</option>
                <option value="0-100">₹0 - ₹100/hr</option>
                <option value="100-150">₹100 - ₹150/hr</option>
                <option value="150-200">₹150 - ₹200/hr</option>
                <option value="200-999">₹200+/hr</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Spaces Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpaces.map((space) => (
            <Card key={space.id} className="bg-gray-900/50 border-gray-700 hover:border-gray-600 transition-all duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-white text-lg">{space.name}</CardTitle>
                  <Badge className="text-green-400 border border-green-400 bg-transparent">
                    Available
                  </Badge>
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <MapPin className="w-4 h-4 mr-1" />
                  {space.address}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 text-sm">{space.description}</p>

                {/* Pricing */}
                <div className="bg-gray-800 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white font-semibold">
                        {formatCurrency(space.price_per_hour)}/hr
                      </div>
                      <div className="text-gray-400 text-sm">
                        {formatCurrency(space.price_per_day)}/day
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">
                        {space.available_seats} seats
                      </div>
                      <div className="text-gray-400 text-sm">
                        of {space.total_seats} total
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-1">
                  {space.amenities.slice(0, 4).map((amenity, index) => (
                    <Badge key={index} className="text-xs bg-gray-700 text-gray-300">
                      {amenity}
                    </Badge>
                  ))}
                  {space.amenities.length > 4 && (
                    <Badge className="text-xs bg-gray-700 text-gray-300">
                      +{space.amenities.length - 4} more
                    </Badge>
                  )}
                </div>

                <Button
                  onClick={() => setSelectedSpace(space)}
                  className="w-full bg-white text-black hover:bg-gray-200"
                >
                  Book Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSpaces.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Building className="w-12 h-12 mx-auto mb-2" />
              No spaces found matching your criteria
            </div>
            <Button
              onClick={() => {
                setSearchQuery('')
                setSelectedCity('')
                setPriceRange('')
              }}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedSpace && (
        <BookingModal
          space={selectedSpace}
          onClose={() => setSelectedSpace(null)}
          onBook={handleBooking}
        />
      )}
    </div>
  )
}
