'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Star, ThumbsUp, Filter, ChevronDown, ChevronUp, Loader2, MessageSquare, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { DetailedReviewForm } from './detailed-review-form'
import { DetailedRatingsDisplay } from './detailed-ratings-display'

interface SpaceReviewsProps {
  spaceId: string
}

interface ReviewData {
  id: string
  rating: number
  review_text: string
  overall_experience?: number
  cleanliness?: number
  restroom_hygiene?: number
  amenities?: number
  staff_service?: number
  wifi_quality?: number
  created_at: string
  user: {
    name: string
    email: string
    professional_role?: string
  }
}

interface ReviewsResponse {
  success: boolean
  data: {
    space: {
      id: string
      name: string
      rating: number
      average_rating: number
      total_reviews: number
    }
    reviews: ReviewData[]
    user_eligibility: {
      canReview: boolean
      hasExistingReview: boolean
      existingReview?: {
        id: string
        rating: number
        review_text: string
        overall_experience?: number
        cleanliness?: number
        restroom_hygiene?: number
        amenities?: number
        staff_service?: number
        wifi_quality?: number
        created_at: string
      }
      redeemedBookings: Array<{
        id: string
        redemption_code: string
        date: string
      }>
    } | null
  }
}

export function SpaceReviews({ spaceId }: SpaceReviewsProps) {
  const { user, loading: authLoading } = useAuth()
  const [reviewsData, setReviewsData] = useState<ReviewsResponse['data'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [displayCount, setDisplayCount] = useState(3)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating_high' | 'rating_low'>('newest')
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [showWriteReview, setShowWriteReview] = useState(false)

  // Refresh reviews data
  const refreshReviews = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/spaces/${spaceId}/reviews`)
      const data = await response.json()
      
      if (data.success) {
        setReviewsData(data.data)
      } else {
        setError(data.error || 'Failed to fetch reviews')
      }
    } catch (err) {
      setError('Failed to fetch reviews')
      console.error('Error fetching reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch reviews from API
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/spaces/${spaceId}/reviews`)
        const data = await response.json()
        
        if (data.success) {
          setReviewsData(data.data)
        } else {
          setError(data.error || 'Failed to fetch reviews')
        }
      } catch (err) {
        setError('Failed to fetch reviews')
        console.error('Error fetching reviews:', err)
      } finally {
        setLoading(false)
      }
    }

    if (spaceId) {
      fetchReviews()
    }
  }, [spaceId])

  // Use fetched reviews or fallback to empty array
  const allReviews = reviewsData?.reviews || []

  // Filter and sort reviews
  const filteredReviews = allReviews
    .filter(review => filterRating ? review.rating === filterRating : true)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'rating_high':
          return b.rating - a.rating
        case 'rating_low':
          return a.rating - b.rating
        default:
          return 0
      }
    })

  const visibleReviews = showAllReviews ? filteredReviews : filteredReviews.slice(0, displayCount)

  // Calculate rating statistics
  const totalReviews = allReviews.length
  const averageRating = reviewsData?.space?.average_rating || 0

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: allReviews.filter(review => review.rating === rating).length,
    percentage: totalReviews > 0 ? (allReviews.filter(review => review.rating === rating).length / totalReviews) * 100 : 0
  }))

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    }
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            <span className="ml-2 text-gray-400">Loading reviews...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">Failed to load reviews</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-400" />
              Reviews & Ratings
            </CardTitle>
            {user && reviewsData?.user_eligibility?.canReview && (
              <Button
                onClick={() => setShowWriteReview(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Write a Review
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {totalReviews > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rating Summary */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white">{averageRating.toFixed(1)}</div>
                    <div className="flex items-center justify-center mt-1">
                      {renderStars(Math.round(averageRating), 'lg')}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {ratingDistribution.map(({ rating, count, percentage }) => (
                    <div key={rating} className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400 w-8">{rating}</span>
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400 w-8">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Actions */}
              <div className="space-y-4">
                {!user ? (
                  <div className="text-center p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-white font-semibold mb-2">Sign in to write a review</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      You need to sign in and have a redeemed booking to write a review.
                    </p>
                    <div className="flex space-x-3 justify-center">
                      <Link href="/signin">
                        <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/signup">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : !reviewsData?.user_eligibility?.canReview ? (
                  <div className="text-center p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-white font-semibold mb-2">Book and redeem to review</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      You need to book and redeem a space before you can write a review.
                    </p>
                    <Link href={`/spaces/${spaceId}/book`}>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Book This Space
                      </Button>
                    </Link>
                  </div>
                ) : reviewsData?.user_eligibility?.hasExistingReview ? (
                  <div className="text-center p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                    <MessageSquare className="w-12 h-12 text-green-400 mx-auto mb-3" />
                    <h3 className="text-white font-semibold mb-2">You've already reviewed this space</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      You can edit your existing review if needed.
                    </p>
                    <Button
                      onClick={() => setShowWriteReview(true)}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Edit Review
                    </Button>
                  </div>
                ) : (
                  <div className="text-center p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                    <MessageSquare className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                    <h3 className="text-white font-semibold mb-2">Ready to review!</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      You have redeemed bookings for this space. Share your experience!
                    </p>
                    <Button
                      onClick={() => setShowWriteReview(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Write a Review
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">No reviews yet</h3>
              <p className="text-gray-400 mb-6">
                Be the first to share your experience with this space.
              </p>
              {user && reviewsData?.user_eligibility?.canReview ? (
                <Button
                  onClick={() => setShowWriteReview(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Write the First Review
                </Button>
              ) : !user ? (
                <div className="flex space-x-3 justify-center">
                  <Link href="/signin">
                    <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link href={`/spaces/${spaceId}/book`}>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Book This Space
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews List */}
      {totalReviews > 0 && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">
                All Reviews ({totalReviews})
              </CardTitle>
              
              {/* Sort and Filter Controls */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={filterRating || ''}
                    onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : null)}
                    className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm text-white"
                  >
                    <option value="">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm text-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="rating_high">Highest Rating</option>
                    <option value="rating_low">Lowest Rating</option>
                  </select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {visibleReviews.map((review) => (
                <div key={review.id} className="border-b border-gray-700 pb-4 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-blue-600 text-white text-sm">
                        {getInitials(review.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-white font-semibold text-sm">
                          {review.user.name}
                        </h4>
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating, 'sm')}
                        </div>
                        <span className="text-gray-400 text-xs">
                          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 text-sm leading-relaxed mb-3">
                        {review.review_text}
                      </p>
                      
                      {/* Detailed Ratings */}
                      <DetailedRatingsDisplay
                        overallExperience={review.overall_experience}
                        cleanliness={review.cleanliness}
                        restroomHygiene={review.restroom_hygiene}
                        amenities={review.amenities}
                        staffService={review.staff_service}
                        wifiQuality={review.wifi_quality}
                        compact={true}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredReviews.length > displayCount && !showAllReviews && (
                <div className="text-center pt-4">
                  <Button
                    onClick={() => setShowAllReviews(true)}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Show All Reviews ({filteredReviews.length - displayCount} more)
                  </Button>
                </div>
              )}
              
              {showAllReviews && filteredReviews.length > displayCount && (
                <div className="text-center pt-4">
                  <Button
                    onClick={() => setShowAllReviews(false)}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Show Less
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Form Modal */}
      {showWriteReview && (
        <DetailedReviewForm
          spaceId={spaceId}
          existingReview={reviewsData?.user_eligibility?.existingReview}
          onClose={() => setShowWriteReview(false)}
          onSuccess={refreshReviews}
        />
      )}
    </div>
  )
}