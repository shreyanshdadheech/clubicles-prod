'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { VIBGYORBadge } from '@/components/ui/vibgyor-selector'
import { SpaceReviews } from '@/components/reviews/space-reviews'
import { SpaceReviewsDisplay } from '@/components/reviews/space-reviews-display'
import { ReviewEligibilityChecker } from '@/components/reviews/review-eligibility-checker'
import { 
  MapPin, Users, Wifi, Coffee, Car, Clock, Star, 
  ArrowLeft, Calendar as CalendarIcon, TrendingUp,
  Eye, BarChart3, PieChart, Activity, CheckCircle
} from 'lucide-react'
import { Space, ProfessionalRole } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { PROFESSIONAL_CATEGORIES } from '@/lib/professional-categories'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

// Real space data will be fetched from API

export default function SpaceDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const spaceId = params?.id as string
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [space, setSpace] = useState<any>(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSpace = async () => {
      if (!spaceId) return
      
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(`/api/spaces/${spaceId}`)
        const result = await response.json()
        
        if (response.ok && result.success) {
          setSpace(result.space)
        } else {
          setError(result.error || 'Space not found')
        }
      } catch (error) {
        console.error('Error loading space:', error)
        setError('Failed to load space details')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadSpace()
  }, [spaceId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-white mb-4">Loading space details...</h1>
            <p className="text-gray-400">Please wait while we fetch the space information.</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !space) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Space not found</h1>
            <p className="text-gray-400 mb-6">{error || 'The space you\'re looking for doesn\'t exist.'}</p>
            <Link href="/spaces">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Back to Spaces
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const getProfessionalColor = (role: ProfessionalRole) => {
    const colors = {
      violet: 'bg-purple-600',
      indigo: 'bg-blue-700',
      blue: 'bg-cyan-500',
      green: 'bg-lime-500',
      yellow: 'bg-yellow-400',
      orange: 'bg-orange-500',
      red: 'bg-red-600',
      grey: 'bg-gray-500',
      white: 'bg-white',
      black: 'bg-black'
    }
    return colors[role] || 'bg-gray-500'
  }

  const handleBookSeat = () => {
    router.push(`/spaces/${space.id}/book`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => router.push('/spaces')}
                className="hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{space.name}</h1>
                <p className="text-gray-400 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {space.address}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              
              <Button 
                onClick={handleBookSeat}
                className="bg-white text-black hover:bg-gray-200"
              >
                Take a Seat
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Space Info */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 rounded-3xl">
              <CardHeader>
                <CardTitle className="text-white">Space Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-300">{space.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <Users className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                    <div className="text-2xl font-bold text-white">{space.total_seats}</div>
                    <div className="text-sm text-gray-400">Total Seats</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <Eye className="h-8 w-8 mx-auto mb-2 text-green-400" />
                    <div className="text-2xl font-bold text-white">{space.available_seats}</div>
                    <div className="text-sm text-gray-400">Available</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
                    <div className="text-2xl font-bold text-white">{formatCurrency(space.price_per_hour)}</div>
                    <div className="text-sm text-gray-400">Per Hour</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-purple-400" />
                    <div className="text-2xl font-bold text-white">{formatCurrency(space.price_per_day)}</div>
                    <div className="text-sm text-gray-400">Per Day</div>
                  </div>
                </div>
                {/* Amenities */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {space.amenities.map((amenity: string, index: number) => (
                      <Badge key={index} variant="default" className="bg-white/20 text-white">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section - styled as a card, same width as Space Details */}
            <SpaceReviewsDisplay 
              spaceId={space.id}
              spaceName={space.name}
            />

            {/* Write Review Section - only for authenticated users */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Write a Review</CardTitle>
              </CardHeader>
              <CardContent>
                <ReviewEligibilityChecker 
                  spaceId={space.id}
                  spaceName={space.name}
                />
              </CardContent>
            </Card>
            

            {/* VIBGYOR Analytics */}
            {showAnalytics && (
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    VIBGYOR Professional Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {space.totalBookings || 0}
                    </div>
                    <div className="text-gray-400">Total Bookings</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(() => {
                      const vibgyorData = [
                        { key: 'violet', name: 'Visionaries', count: space.violet || 0, color: 'bg-purple-500' },
                        { key: 'indigo', name: 'Industrialists', count: space.indigo || 0, color: 'bg-indigo-500' },
                        { key: 'blue', name: 'Branding', count: space.blue || 0, color: 'bg-blue-500' },
                        { key: 'green', name: 'Green & EV', count: space.green || 0, color: 'bg-green-500' },
                        { key: 'yellow', name: 'Young Entrepreneurs', count: space.yellow || 0, color: 'bg-yellow-500' },
                        { key: 'orange', name: 'Oracle', count: space.orange || 0, color: 'bg-orange-500' },
                        { key: 'red', name: 'Real Estate', count: space.red || 0, color: 'bg-red-500' },
                        { key: 'grey', name: 'Nomads', count: space.grey || 0, color: 'bg-gray-500' },
                        { key: 'white', name: 'Policy Makers', count: space.white || 0, color: 'bg-white' },
                        { key: 'black', name: 'Prefer Not to Say', count: space.black || 0, color: 'bg-black' }
                      ]
                      
                      const totalRedeemed = vibgyorData.reduce((sum, item) => sum + item.count, 0)
                      
                      return vibgyorData.filter(item => item.count > 0).map(item => {
                        const percentage = totalRedeemed > 0 ? (item.count / totalRedeemed) * 100 : 0
                        
                        return (
                          <div key={item.key} className="bg-white/5 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                                <span className="text-white font-medium">{item.name}</span>
                              </div>
                              <div className="text-white font-bold">{item.count}</div>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${item.color}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <div className="text-sm text-gray-400 mt-1">{percentage.toFixed(1)}%</div>
                          </div>
                        )
                      })
                    })()}
                  </div>

                  {/* Visual Chart */}
                  <div className="bg-white/5 rounded-lg p-6">
                    <h4 className="text-white font-semibold mb-4 flex items-center">
                      <PieChart className="h-4 w-4 mr-2" />
                      Distribution Overview
                    </h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {(() => {
                        const vibgyorData = [
                          { key: 'violet', name: 'Visionaries', count: space.violet || 0, color: 'bg-purple-500' },
                          { key: 'indigo', name: 'Industrialists', count: space.indigo || 0, color: 'bg-indigo-500' },
                          { key: 'blue', name: 'Branding', count: space.blue || 0, color: 'bg-blue-500' },
                          { key: 'green', name: 'Green & EV', count: space.green || 0, color: 'bg-green-500' },
                          { key: 'yellow', name: 'Young Entrepreneurs', count: space.yellow || 0, color: 'bg-yellow-500' },
                          { key: 'orange', name: 'Oracle', count: space.orange || 0, color: 'bg-orange-500' },
                          { key: 'red', name: 'Real Estate', count: space.red || 0, color: 'bg-red-500' },
                          { key: 'grey', name: 'Nomads', count: space.grey || 0, color: 'bg-gray-500' },
                          { key: 'white', name: 'Policy Makers', count: space.white || 0, color: 'bg-white' },
                          { key: 'black', name: 'Prefer Not to Say', count: space.black || 0, color: 'bg-black' }
                        ]
                        
                        const totalRedeemed = vibgyorData.reduce((sum, item) => sum + item.count, 0)
                        
                        return vibgyorData.filter(item => item.count > 0).map(item => {
                          const percentage = totalRedeemed > 0 ? (item.count / totalRedeemed) * 100 : 0
                          
                          return (
                            <div key={item.key} className="text-center">
                              <div 
                                className={`w-12 h-12 rounded-full ${item.color} mx-auto mb-1`}
                                style={{ 
                                  transform: `scale(${0.5 + (percentage / 100) * 0.5})` 
                                }}
                              ></div>
                              <div className="text-xs text-white">{item.name}</div>
                              <div className="text-xs text-gray-400">{item.count}</div>
                            </div>
                          )
                        })
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews & Ratings Section removed (duplicate) */}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Book */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Quick Book</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleBookSeat}
                  className="w-full bg-white text-black hover:bg-gray-200"
                >
                  Take a Seat
                </Button>
                <div className="text-center text-gray-400">
                  <CalendarIcon className="h-5 w-5 mx-auto mb-2" />
                  <p>Select a date to check availability</p>
                </div>
              </CardContent>
            </Card>

            {/* Calendar */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    return date < today
                  }}
                  className="calendar-selected-white"
                />
                {selectedDate && (
                  <div className="mt-4 p-3 bg-white/5 rounded-lg">
                    <p className="text-sm text-gray-300 mb-2">
                      Selected: {selectedDate.toLocaleDateString()}
                    </p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => router.push(`/spaces/${space.id}/book?date=${selectedDate.toISOString()}`)}
                    >
                      Book for this date
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Space Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300">Occupancy</span>
                  </div>
                  <span className="text-white font-semibold">
                    {Math.round(((space.total_seats - space.available_seats) / space.total_seats) * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-gray-300">Rating</span>
                  </div>
                  <span className="text-white font-semibold">
                    {space.averageRating > 0 
                      ? `${space.averageRating.toFixed(1)}/5 (${space.totalReviews} reviews)` 
                      : 'No reviews yet'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-400" />
                    <span className="text-gray-300">Total Bookings</span>
                  </div>
                  <span className="text-white font-semibold">
                    {space.totalBookings || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300">Redeemed</span>
                  </div>
                  <span className="text-white font-semibold">
                    {space.redeemedBookings || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  )
}
