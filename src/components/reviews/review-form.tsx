'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ReviewFormProps {
  spaceId: string
  existingReview?: {
    id: string
    rating: number
    review_text: string
    created_at: string
  }
  onClose: () => void
  onSuccess: () => void
}

export function ReviewForm({ spaceId, existingReview, onClose, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [reviewText, setReviewText] = useState(existingReview?.review_text || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoveredRating, setHoveredRating] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }
    
    if (reviewText.trim().length < 10) {
      toast.error('Please write at least 10 characters for your review')
      return
    }

    setIsSubmitting(true)

    try {
      const url = '/api/reviews' // Always use the same endpoint
      const method = existingReview ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spaceId,
          rating,
          reviewText: reviewText.trim()
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(existingReview ? 'Review updated successfully!' : 'Review submitted successfully!')
        onSuccess()
        onClose()
      } else {
        toast.error(data.error || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error('Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (currentRating: number, onHover?: (rating: number) => void, onClick?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-8 h-8 cursor-pointer transition-colors ${
              star <= (onHover ? hoveredRating : currentRating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 hover:text-yellow-300'
            }`}
            onMouseEnter={() => onHover?.(star)}
            onMouseLeave={() => onHover?.(0)}
            onClick={() => onClick?.(star)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">
            {existingReview ? 'Edit Review' : 'Write a Review'}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating Section */}
            <div className="space-y-3">
              <label className="text-white font-semibold">Rating *</label>
              <div className="flex items-center space-x-2">
                {renderStars(
                  rating,
                  (hover) => setHoveredRating(hover),
                  (newRating) => setRating(newRating)
                )}
                <span className="text-gray-400 text-sm ml-2">
                  {rating > 0 && (
                    rating === 1 ? 'Poor' :
                    rating === 2 ? 'Fair' :
                    rating === 3 ? 'Good' :
                    rating === 4 ? 'Very Good' :
                    'Excellent'
                  )}
                </span>
              </div>
            </div>

            {/* Review Text Section */}
            <div className="space-y-3">
              <label className="text-white font-semibold">Your Review *</label>
              <Textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience with this space. What did you like? What could be improved?"
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 min-h-[120px]"
                maxLength={1000}
              />
              <div className="flex justify-between text-sm text-gray-400">
                <span>Minimum 10 characters</span>
                <span>{reviewText.length}/1000</span>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Review Guidelines</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Be honest and constructive in your feedback</li>
                <li>• Focus on your actual experience with the space</li>
                <li>• Avoid personal attacks or inappropriate language</li>
                <li>• Help other users make informed decisions</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSubmitting || rating === 0 || reviewText.trim().length < 10}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {existingReview ? 'Updating...' : 'Submitting...'}
                  </>
                ) : (
                  existingReview ? 'Update Review' : 'Submit Review'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
