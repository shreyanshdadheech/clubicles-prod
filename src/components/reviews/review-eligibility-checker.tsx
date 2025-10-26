'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Star, Edit, Save, X, AlertCircle, CheckCircle, BookOpen, Calendar, User } from 'lucide-react'

interface ReviewEligibilityProps {
  spaceId: string
  spaceName?: string
  onReviewSubmitted?: (review: any) => void
}

interface ReviewEligibility {
  eligible: boolean
  reason: string
  action_required?: string
  action_available?: 'create' | 'edit'
  user?: {
    firstName: string | null
    lastName: string | null
    professionalRole: string | null
  }
  existing_review?: {
    id: string
    rating: number
    review_text: string
    overall_experience: number
    cleanliness: number
    restroom_hygiene: number
    amenities: number
    staff_service: number
    wifi_quality: number
    created_at: string
  }
  steps?: string[]
  bookings?: Array<{
    id: string
    date: string
    is_redeemed: boolean
    status: string
  }>
  redeemed_bookings?: Array<{
    id: string
    redemption_code: string
    redeemed_at: string
    date: string
  }>
}

export function ReviewEligibilityChecker({ spaceId, spaceName, onReviewSubmitted }: ReviewEligibilityProps) {
  const [eligibility, setEligibility] = useState<ReviewEligibility | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [detailedRatings, setDetailedRatings] = useState({
    overallExperience: 0,
    cleanliness: 0,
    restroomHygiene: 0,
    amenities: 0,
    staffService: 0,
    wifiQuality: 0
  })

  useEffect(() => {
    checkEligibility()
  }, [spaceId])

  const checkEligibility = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reviews/eligibility?space_id=${spaceId}`)
      const data = await response.json()
      setEligibility(data)
      
      // If user has existing review, populate the form
      if (data.existing_review) {
        setRating(data.existing_review.rating)
        setReviewText(data.existing_review.review_text)
        setDetailedRatings({
          overallExperience: data.existing_review.overall_experience || 0,
          cleanliness: data.existing_review.cleanliness || 0,
          restroomHygiene: data.existing_review.restroom_hygiene || 0,
          amenities: data.existing_review.amenities || 0,
          staffService: data.existing_review.staff_service || 0,
          wifiQuality: data.existing_review.wifi_quality || 0
        })
      }
    } catch (error) {
      console.error('Failed to check review eligibility:', error)
      setEligibility({
        eligible: false,
        reason: 'Failed to check eligibility',
        action_required: 'Please try refreshing the page'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStartEditing = () => {
    setIsEditing(true)
    if (!eligibility?.existing_review) {
      // Reset for new review
      setRating(0)
      setReviewText('')
    }
  }

  const handleCancelEditing = () => {
    setIsEditing(false)
    // Restore original values if editing existing review
    if (eligibility?.existing_review) {
      setRating(eligibility.existing_review.rating)
      setReviewText(eligibility.existing_review.review_text)
      setDetailedRatings({
        overallExperience: eligibility.existing_review.overall_experience || 0,
        cleanliness: eligibility.existing_review.cleanliness || 0,
        restroomHygiene: eligibility.existing_review.restroom_hygiene || 0,
        amenities: eligibility.existing_review.amenities || 0,
        staffService: eligibility.existing_review.staff_service || 0,
        wifiQuality: eligibility.existing_review.wifi_quality || 0
      })
    }
  }

  const handleSubmitReview = async () => {
    if (rating === 0 || !reviewText.trim()) return

    setSubmitting(true)
    try {
      const method = eligibility?.action_available === 'edit' ? 'PUT' : 'POST'
      const url = '/api/reviews' // Always use the same endpoint

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          spaceId: spaceId,
          rating,
          reviewText: reviewText,
          overallExperience: detailedRatings.overallExperience,
          cleanliness: detailedRatings.cleanliness,
          restroomHygiene: detailedRatings.restroomHygiene,
          amenities: detailedRatings.amenities,
          staffService: detailedRatings.staffService,
          wifiQuality: detailedRatings.wifiQuality
        })
      })

      const data = await response.json()

      if (response.ok) {
        setIsEditing(false)
        onReviewSubmitted?.(data.review)
        // Refresh eligibility to get updated data
        await checkEligibility()
      } else {
        alert(data.error || 'Failed to submit review')
      }
    } catch (error) {
      alert('Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 cursor-pointer transition-colors ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            } ${interactive ? 'hover:text-yellow-400' : ''}`}
            onClick={interactive ? () => setRating(star) : undefined}
          />
        ))}
      </div>
    )
  }

  const getProfessionalRoleColor = (role: string | null) => {
    if (!role) return 'bg-gray-500'
    
    const roleColors: { [key: string]: string } = {
      'visionary': 'bg-purple-500',
      'industrialist': 'bg-indigo-500',
      'marketer': 'bg-blue-500',
      'green_ev': 'bg-green-500',
      'young_entrepreneur': 'bg-yellow-500',
      'oracle': 'bg-orange-500',
      'real_estate': 'bg-red-500',
      'nomad': 'bg-gray-500',
      'policy_maker': 'bg-white text-black',
      'prefer_not_to_say': 'bg-black'
    }
    
    return roleColors[role] || 'bg-gray-500'
  }

  const getProfessionalRoleName = (role: string | null) => {
    if (!role) return 'Professional'
    
    const roleNames: { [key: string]: string } = {
      'visionary': 'Visionary',
      'industrialist': 'Industrialist',
      'marketer': 'Marketer',
      'green_ev': 'Green & EV',
      'young_entrepreneur': 'Young Entrepreneur',
      'oracle': 'Oracle',
      'real_estate': 'Real Estate',
      'nomad': 'Nomad',
      'policy_maker': 'Policy Maker',
      'prefer_not_to_say': 'Prefer Not to Say'
    }
    
    return roleNames[role] || 'Professional'
  }

  const renderDetailedStars = (category: keyof typeof detailedRatings, interactive = false) => {
    const value = detailedRatings[category]
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 cursor-pointer transition-colors ${
              star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            } ${interactive ? 'hover:text-yellow-400' : ''}`}
            onClick={interactive ? () => setDetailedRatings(prev => ({ ...prev, [category]: star })) : undefined}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            <span className="ml-2 text-white">Checking review eligibility...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!eligibility) {
    return null
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Star className="w-5 h-5" />
            Write a Review
            {spaceName && <span className="text-sm font-normal text-gray-300">for {spaceName}</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!eligibility.eligible ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-300">{eligibility.reason}</h4>
                  <p className="text-sm text-yellow-400 mt-1">{eligibility.action_required}</p>
                  
                  {eligibility.steps && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-yellow-300 mb-2">Steps to write a review:</p>
                      <ol className="text-sm text-yellow-400 space-y-1">
                        {eligibility.steps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {eligibility.bookings && eligibility.bookings.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-yellow-300 mb-2">Your bookings:</p>
                      <div className="space-y-2">
                        {eligibility.bookings.map((booking) => (
                          <div key={booking.id} className="flex items-center gap-2 text-sm text-yellow-400">
                            <Calendar className="w-4 h-4" />
                            <span>{booking.date}</span>
                            <Badge variant={booking.is_redeemed ? 'default' : 'warning'} className="bg-yellow-500/20 text-yellow-300">
                              {booking.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <h4 className="font-medium text-green-300">
                    {eligibility.action_available === 'edit' ? 'You can edit your review' : 'You can write a review'}
                  </h4>
                  <p className="text-sm text-green-400">
                    {eligibility.reason}
                  </p>
                </div>
              </div>

              {eligibility.redeemed_bookings && eligibility.redeemed_bookings.length > 0 && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h5 className="font-medium text-blue-300 mb-2">Your completed visits:</h5>
                  <div className="space-y-1">
                    {eligibility.redeemed_bookings.map((booking) => (
                      <div key={booking.id} className="flex items-center gap-2 text-sm text-blue-400">
                        <Calendar className="w-4 h-4" />
                        <span>{booking.date}</span>
                        <span className="text-xs">({booking.redemption_code})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Review Form */}
              <div className="space-y-4">
                {eligibility.existing_review && !isEditing ? (
                  <div className="p-4 border border-white/20 rounded-lg bg-white/5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-white">
                              {eligibility.user?.firstName && eligibility.user?.lastName 
                                ? `${eligibility.user.firstName} ${eligibility.user.lastName}`
                                : 'You'
                              }
                            </h4>
                            {eligibility.user?.professionalRole && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProfessionalRoleColor(eligibility.user.professionalRole)}`}>
                                {getProfessionalRoleName(eligibility.user.professionalRole)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(eligibility.existing_review.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleStartEditing}
                        className="border-white/30 text-black hover:text-white hover:bg-white/10"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        {renderStars()}
                        <span className="text-white font-medium">{eligibility.existing_review.rating}/5</span>
                      </div>
                      <p className="text-gray-200 leading-relaxed">{eligibility.existing_review.review_text}</p>
                    </div>
                    
                    {/* Detailed Ratings */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Overall:</span>
                        <span className="text-white">{eligibility.existing_review.overall_experience}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Cleanliness:</span>
                        <span className="text-white">{eligibility.existing_review.cleanliness}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Restroom:</span>
                        <span className="text-white">{eligibility.existing_review.restroom_hygiene}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amenities:</span>
                        <span className="text-white">{eligibility.existing_review.amenities}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Staff:</span>
                        <span className="text-white">{eligibility.existing_review.staff_service}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">WiFi:</span>
                        <span className="text-white">{eligibility.existing_review.wifi_quality}/5</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">Overall Rating</label>
                      {renderStars(isEditing || !eligibility.existing_review)}
                    </div>
                    
                    {/* Detailed Ratings */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-white">Detailed Ratings</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm text-gray-300">Overall Experience</label>
                          {renderDetailedStars('overallExperience', isEditing || !eligibility.existing_review)}
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm text-gray-300">Cleanliness</label>
                          {renderDetailedStars('cleanliness', isEditing || !eligibility.existing_review)}
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm text-gray-300">Restroom Hygiene</label>
                          {renderDetailedStars('restroomHygiene', isEditing || !eligibility.existing_review)}
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm text-gray-300">Amenities</label>
                          {renderDetailedStars('amenities', isEditing || !eligibility.existing_review)}
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm text-gray-300">Staff Service</label>
                          {renderDetailedStars('staffService', isEditing || !eligibility.existing_review)}
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm text-gray-300">WiFi Quality</label>
                          {renderDetailedStars('wifiQuality', isEditing || !eligibility.existing_review)}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">Your Review</label>
                      <Textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Share your experience with this space..."
                        rows={4}
                        disabled={!isEditing && !!eligibility.existing_review}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSubmitReview}
                        disabled={rating === 0 || !reviewText.trim() || submitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {submitting ? 'Saving...' : (eligibility.action_available === 'edit' ? 'Update Review' : 'Submit Review')}
                      </Button>
                      
                      {isEditing && (
                        <Button 
                          variant="outline" 
                          onClick={handleCancelEditing}
                          disabled={submitting}
                          className="border-white/30 text-black hover:text-white hover:bg-white/10"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                      
                      {!isEditing && !eligibility.existing_review && (
                        <Button 
                          variant="outline" 
                          onClick={handleStartEditing}
                          className="border-white/30 text-black hover:text-white hover:bg-white/10"
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Write Review
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}