'use client'
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Star, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface DetailedReviewFormProps {
  spaceId: string
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
  }
  onClose: () => void
  onSuccess: () => void
}

const ratingCategories = [
  { key: 'overallExperience', label: 'Overall Experience', required: true },
  { key: 'cleanliness', label: 'Cleanliness', required: true },
  { key: 'restroomHygiene', label: 'Restroom Hygiene', required: true, special: true },
  { key: 'amenities', label: 'Amenities', required: true },
  { key: 'staffService', label: 'Staff Service', required: true },
  { key: 'wifiQuality', label: 'WiFi Quality', required: true }
]

export function DetailedReviewForm({ spaceId, existingReview, onClose, onSuccess }: DetailedReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewText, setReviewText] = useState(existingReview?.review_text || '')
  const [detailedRatings, setDetailedRatings] = useState({
    overallExperience: existingReview?.overall_experience || 0,
    cleanliness: existingReview?.cleanliness || 0,
    restroomHygiene: existingReview?.restroom_hygiene || 0,
    amenities: existingReview?.amenities || 0,
    staffService: existingReview?.staff_service || 0,
    wifiQuality: existingReview?.wifi_quality || 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDetailedRatingChange = (category: string, value: number) => {
    setDetailedRatings(prev => ({
      ...prev,
      [category]: value
    }))
  }

  const calculateOverallRating = () => {
    const requiredRatings = ratingCategories
      .filter(cat => cat.required)
      .map(cat => detailedRatings[cat.key as keyof typeof detailedRatings])
      .filter(rating => rating > 0)
    
    if (requiredRatings.length === 0) return 0
    return Math.round(requiredRatings.reduce((sum, rating) => sum + rating, 0) / requiredRatings.length)
  }

  useEffect(() => {
    const overallRating = calculateOverallRating()
    setRating(overallRating)
  }, [detailedRatings])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (rating === 0) {
      setError('Please provide an overall star rating.')
      return
    }
    
    if (reviewText.trim().length < 10) {
      setError('Review must be at least 10 characters long.')
      return
    }

    // Check if all required detailed ratings are provided
    const missingRatings = ratingCategories
      .filter(cat => cat.required)
      .filter(cat => detailedRatings[cat.key as keyof typeof detailedRatings] === 0)
      .map(cat => cat.label)

    if (missingRatings.length > 0) {
      setError(`Please provide ratings for: ${missingRatings.join(', ')}`)
      return
    }

    setIsLoading(true)
    try {
      const method = existingReview ? 'PUT' : 'POST'
      const url = '/api/reviews' // Always use the same endpoint
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spaceId,
          rating,
          reviewText,
          ...detailedRatings
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(existingReview ? 'Review updated successfully!' : 'Review submitted successfully!')
        onSuccess()
        onClose()
      } else {
        setError(data.error || 'Failed to submit review.')
        toast.error(data.error || 'Failed to submit review.')
      }
    } catch (err) {
      setError('An unexpected error occurred.')
      toast.error('An unexpected error occurred.')
      console.error('Review submission error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const StarRating = ({ 
    value, 
    onChange, 
    label, 
    required = false, 
    special = false 
  }: { 
    value: number
    onChange: (value: number) => void
    label: string
    required?: boolean
    special?: boolean
  }) => (
    <div className="space-y-2">
      <Label className="text-white flex items-center gap-2">
        {label}
        {required && <span className="text-red-400">*</span>}
        {special && <span className="text-yellow-400 text-xs">(Special focus area)</span>}
      </Label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`cursor-pointer ${
              (hoverRating || value) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'
            }`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            size={24}
          />
        ))}
        <span className="text-gray-400 text-sm ml-2">
          {value > 0 ? `${value}/5` : 'Not rated'}
        </span>
      </div>
    </div>
  )

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 text-white border-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">
            {existingReview ? 'Edit Your Review' : 'Write a Detailed Review'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Share your detailed experience to help others choose the best space.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          {/* Overall Rating */}
          <div className="space-y-2">
            <Label className="text-white text-lg font-semibold">Overall Rating</Label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`cursor-pointer ${
                    (hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  size={32}
                />
              ))}
              <span className="text-gray-400 text-lg ml-3">
                {rating > 0 ? `${rating}/5` : 'Not rated'}
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              This is calculated automatically from your detailed ratings below.
            </p>
          </div>

          {/* Detailed Ratings */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-lg">Rate Different Aspects</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ratingCategories.map((category) => (
                <StarRating
                  key={category.key}
                  value={detailedRatings[category.key as keyof typeof detailedRatings]}
                  onChange={(value) => handleDetailedRatingChange(category.key, value)}
                  label={category.label}
                  required={category.required}
                  special={category.special}
                />
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label htmlFor="reviewText" className="text-white">Your Review</Label>
            <Textarea
              id="reviewText"
              placeholder="Tell us about your experience..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
              rows={5}
              maxLength={500}
            />
            <p className="text-sm text-gray-500 text-right">{reviewText.length}/500 characters</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Guidelines */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-sm">Review Guidelines:</h4>
            <ul className="text-gray-400 text-xs list-disc list-inside space-y-1">
              <li>Be honest and objective in your ratings.</li>
              <li>Focus on the space, amenities, and service quality.</li>
              <li>Avoid personal attacks or offensive language.</li>
              <li>Keep your review helpful and constructive.</li>
            </ul>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {existingReview ? 'Updating...' : 'Submitting...'}
              </>
            ) : (
              existingReview ? 'Update Review' : 'Submit Review'
            )}
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose} 
            className="w-full text-gray-400 hover:bg-gray-800"
          >
            Cancel
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
