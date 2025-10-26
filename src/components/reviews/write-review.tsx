'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star } from 'lucide-react'

interface WriteReviewProps {
  spaceId: string
  bookingId: string
  spaceName: string
  onSubmit: (reviewData: { rating: number; comment: string }) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function WriteReview({ 
  spaceId, 
  bookingId, 
  spaceName, 
  onSubmit, 
  onCancel,
  isSubmitting = false 
}: WriteReviewProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) return
    
    await onSubmit({ rating, comment })
  }

  const renderStars = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="focus:outline-none"
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                star <= (hoveredRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-400 hover:text-yellow-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Write a Review</CardTitle>
        <p className="text-gray-300">Share your experience at {spaceName}</p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-white font-medium mb-3">
              Rating *
            </label>
            {renderStars()}
            {rating > 0 && (
              <p className="text-sm text-gray-400 mt-2">
                {rating === 1 && 'Poor - Needs significant improvement'}
                {rating === 2 && 'Fair - Below expectations'}
                {rating === 3 && 'Good - Met basic expectations'}
                {rating === 4 && 'Very Good - Exceeded expectations'}
                {rating === 5 && 'Excellent - Outstanding experience'}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="comment" className="block text-white font-medium mb-3">
              Your Review (Optional)
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your experience at this space..."
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-white/40 resize-none"
              rows={4}
            />
            <p className="text-sm text-gray-400 mt-2">
              Share details about the facilities, ambiance, service, or anything that would help other professionals.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <Button 
              type="submit"
              disabled={rating === 0 || isSubmitting}
              className="bg-white text-black hover:bg-gray-200 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
