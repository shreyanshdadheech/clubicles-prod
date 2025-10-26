"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, Star } from "lucide-react"

interface VIBGYORData {
  spaceId: string
  spaceName: string
  hasRedeemedBookings: boolean
  totalRedeemedBookings: number
  vibgyorTypes: {
    [key: string]: {
      count: number
      percentage: number
      label: string
    }
  }
  dominantType: string
  summary: {
    totalTypes: number
    mostPopular: {
      count: number
      percentage: number
      label: string
    } | null
  }
}

interface VIBGYORDisplayProps {
  spaceId: string
  className?: string
}

const VIBGYOR_COLORS = {
  violet: 'bg-violet-500',
  indigo: 'bg-indigo-500', 
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  grey: 'bg-gray-500',
  white: 'bg-white text-black',
  black: 'bg-black'
}

export function VIBGYORDisplay({ spaceId, className }: VIBGYORDisplayProps) {
  const [vibgyorData, setVibgyorData] = React.useState<VIBGYORData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchVIBGYORData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/spaces/${spaceId}/vibgyor`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch VIBGYOR data')
        }

        const result = await response.json()
        
        if (result.success) {
          setVibgyorData(result.data)
        } else {
          throw new Error(result.error || 'Failed to fetch VIBGYOR data')
        }
      } catch (err: any) {
        console.error('Error fetching VIBGYOR data:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVIBGYORData()
  }, [spaceId])

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Loading professional insights...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>Failed to load professional insights</p>
            <p className="text-sm text-gray-500 mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!vibgyorData || !vibgyorData.hasRedeemedBookings) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Professional Community
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No professional insights yet</p>
            <p className="text-sm">Professional roles will appear here once bookings are redeemed</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { vibgyorTypes, totalRedeemedBookings, dominantType, summary } = vibgyorData

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Professional Community
          <Badge variant="default" className="ml-2">
            {totalRedeemedBookings} redeemed
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Professional roles from redeemed bookings only
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Active Types</p>
                  <p className="text-lg font-bold text-blue-600">{summary.totalTypes}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-green-500 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-900">Most Popular</p>
                  <p className="text-sm font-bold text-green-600">
                    {summary.mostPopular?.label.split(' ')[0] || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* VIBGYOR Types */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Professional Distribution</h4>
            {Object.entries(vibgyorTypes).map(([type, data]) => (
              <div key={type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${VIBGYOR_COLORS[type as keyof typeof VIBGYOR_COLORS]}`}></div>
                    <span className="text-sm font-medium text-gray-700">{data.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{data.count} bookings</span>
                    <Badge variant="default" className="text-xs">
                      {data.percentage}%
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${VIBGYOR_COLORS[type as keyof typeof VIBGYOR_COLORS]}`}
                    style={{ width: `${data.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Dominant Type Highlight */}
          {dominantType && vibgyorTypes[dominantType] && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${VIBGYOR_COLORS[dominantType as keyof typeof VIBGYOR_COLORS]}`}></div>
                <div>
                  <p className="font-medium text-gray-900">Dominant Professional Type</p>
                  <p className="text-sm text-gray-600">{vibgyorTypes[dominantType].label}</p>
                  <p className="text-xs text-gray-500">
                    {vibgyorTypes[dominantType].count} bookings ({vibgyorTypes[dominantType].percentage}%)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Note about redemption */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> Only shows professional roles from redeemed bookings. 
              Unredeemed bookings are not included in these analytics.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
