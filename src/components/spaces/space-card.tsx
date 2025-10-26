'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Space } from '@/types'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface SpaceCardProps {
  space: Space
}

// Mock Badge component since it's not created yet
const BadgeComponent = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    variant === 'success' ? 'bg-green-100 text-green-800' : 
    variant === 'warning' ? 'bg-yellow-100 text-yellow-800' :
    'bg-gray-100 text-gray-800'
  }`}>
    {children}
  </span>
)

export function SpaceCard({ space }: SpaceCardProps) {
  const mainImage = space.images?.[0] || '/placeholder-space.jpg'
  const isAvailable = space.available_seats > 0

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <img
          src={mainImage}
          alt={space.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <BadgeComponent variant={isAvailable ? 'success' : 'warning'}>
            {isAvailable ? `${space.available_seats} seats` : 'Full'}
          </BadgeComponent>
        </div>
      </div>

      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{space.name}</CardTitle>
            <p className="text-sm text-gray-600">{space.city}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">{formatCurrency(space.price_per_hour)}</p>
            <p className="text-xs text-gray-500">per hour</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {space.description}
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {space.amenities?.slice(0, 3).map((amenity, index) => (
            <BadgeComponent key={index} variant="default">
              {amenity}
            </BadgeComponent>
          ))}
          {space.amenities?.length > 3 && (
            <BadgeComponent variant="default">
              +{space.amenities.length - 3} more
            </BadgeComponent>
          )}
        </div>

        <div className="flex gap-2">
          <Link href={`/spaces/${space.id}`} className="flex-1">
            <Button 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!isAvailable}
            >
              {isAvailable ? 'View Details' : 'View Details'}
            </Button>
          </Link>
          {isAvailable && (
            <Link href={`/spaces/${space.id}/book`} className="flex-1">
              <Button 
                variant="outline"
                className="w-full"
              >
                Book Now
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
