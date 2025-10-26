'use client'
import { Star } from 'lucide-react'

interface DetailedRatingsDisplayProps {
  overallExperience?: number
  cleanliness?: number
  restroomHygiene?: number
  amenities?: number
  staffService?: number
  wifiQuality?: number
  compact?: boolean
}

const ratingCategories = [
  { key: 'overallExperience', label: 'Overall', value: 'overallExperience' },
  { key: 'cleanliness', label: 'Cleanliness', value: 'cleanliness' },
  { key: 'restroomHygiene', label: 'Restroom', value: 'restroomHygiene' },
  { key: 'amenities', label: 'Amenities', value: 'amenities' },
  { key: 'staffService', label: 'Staff', value: 'staffService' },
  { key: 'wifiQuality', label: 'WiFi', value: 'wifiQuality' }
]

export function DetailedRatingsDisplay({ 
  overallExperience,
  cleanliness,
  restroomHygiene,
  amenities,
  staffService,
  wifiQuality,
  compact = false
}: DetailedRatingsDisplayProps) {
  const ratings = {
    overallExperience,
    cleanliness,
    restroomHygiene,
    amenities,
    staffService,
    wifiQuality
  }

  const renderStars = (rating: number, size: 'sm' | 'xs' = 'sm') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      xs: 'w-2 h-2'
    }
    
    return (
      <div className="flex space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
            }`}
          />
        ))}
      </div>
    )
  }

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-1 text-xs">
        {ratingCategories.map((category) => {
          const rating = ratings[category.value as keyof typeof ratings]
          if (!rating || rating === 0) return null
          
          return (
            <div key={category.key} className="flex items-center justify-between">
              <span className="text-gray-400">{category.label}:</span>
              <div className="flex items-center space-x-1">
                {renderStars(rating, 'xs')}
                <span className="text-gray-300">{rating}</span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h5 className="text-white font-medium text-sm">Detailed Ratings:</h5>
      <div className="grid grid-cols-1 gap-2">
        {ratingCategories.map((category) => {
          const rating = ratings[category.value as keyof typeof ratings]
          if (!rating || rating === 0) return null
          
          return (
            <div key={category.key} className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">{category.label}:</span>
              <div className="flex items-center space-x-2">
                {renderStars(rating, 'sm')}
                <span className="text-gray-400 text-sm">{rating}/5</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
