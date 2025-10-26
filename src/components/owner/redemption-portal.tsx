'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { QrCode, Scan, CheckCircle, AlertCircle, User, Calendar, Clock, MapPin } from 'lucide-react'

interface RedemptionPortalProps {
  onRedemptionSuccess?: (booking: any) => void
}

interface BookingDetails {
  id: string
  redemption_code: string
  is_redeemed: boolean
  redeemed_at?: string
  status: string
  space_name: string
  date: string
  time: string
  seats: number
  user: {
    name: string
    email: string
    phone?: string
  } | null
}

export function RedemptionPortal({ onRedemptionSuccess }: RedemptionPortalProps) {
  const [redemptionCode, setRedemptionCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    valid: boolean
    booking?: BookingDetails
    error?: string
  } | null>(null)

  const validateCode = async () => {
    if (!redemptionCode.trim()) return

    setIsValidating(true)
    setValidationResult(null)

    try {
      const response = await fetch(`/api/bookings/redeem?code=${encodeURIComponent(redemptionCode)}`)
      const data = await response.json()

      if (response.ok) {
        setValidationResult({
          valid: true,
          booking: data.booking
        })
      } else {
        setValidationResult({
          valid: false,
          error: data.error || 'Invalid code'
        })
      }
    } catch (error) {
      setValidationResult({
        valid: false,
        error: 'Failed to validate code'
      })
    } finally {
      setIsValidating(false)
    }
  }

  const redeemBooking = async () => {
    if (!validationResult?.booking) return

    setIsRedeeming(true)

    try {
      const response = await fetch('/api/bookings/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          redemption_code: redemptionCode
        })
      })

      const data = await response.json()

      if (response.ok) {
        setValidationResult({
          valid: true,
          booking: {
            ...validationResult.booking,
            is_redeemed: true,
            status: 'completed'
          }
        })
        onRedemptionSuccess?.(data.booking)
      } else {
        setValidationResult({
          valid: false,
          error: data.error || 'Failed to redeem booking'
        })
      }
    } catch (error) {
      setValidationResult({
        valid: false,
        error: 'Failed to redeem booking'
      })
    } finally {
      setIsRedeeming(false)
    }
  }

  const resetForm = () => {
    setRedemptionCode('')
    setValidationResult(null)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Booking Redemption Portal
          </CardTitle>
          <CardDescription>
            Scan QR codes or enter redemption codes to verify and complete customer bookings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter redemption code (e.g., RC2025-123-4567)"
              value={redemptionCode}
              onChange={(e) => setRedemptionCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && validateCode()}
              disabled={isValidating || isRedeeming}
              className="font-mono"
            />
            <Button 
              onClick={validateCode}
              disabled={!redemptionCode.trim() || isValidating || isRedeeming}
            >
              <Scan className="w-4 h-4 mr-2" />
              {isValidating ? 'Validating...' : 'Validate'}
            </Button>
          </div>

          {/* QR Code Scanner Placeholder */}
          <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
            <QrCode className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">QR Code Scanner</p>
            <p className="text-xs text-gray-400">
              (QR scanner integration would go here)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validationResult.valid ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              Validation Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {validationResult.valid && validationResult.booking ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Badge 
                      variant={validationResult.booking.is_redeemed ? "warning" : "default"}
                      className="mb-2"
                    >
                      {validationResult.booking.is_redeemed ? 'Already Redeemed' : 'Valid - Ready to Redeem'}
                    </Badge>
                    <h3 className="font-semibold">{validationResult.booking.space_name}</h3>
                    <p className="text-sm text-gray-600">Code: {validationResult.booking.redemption_code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge variant={validationResult.booking.status === 'completed' ? 'success' : 'warning'}>
                      {validationResult.booking.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-600">Date</p>
                      <p className="font-medium">{validationResult.booking.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-600">Time</p>
                      <p className="font-medium">{validationResult.booking.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-600">Seats</p>
                      <p className="font-medium">{validationResult.booking.seats}</p>
                    </div>
                  </div>
                </div>

                {validationResult.booking.user && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Customer Details</h4>
                    <div className="space-y-1">
                      <p><span className="font-medium">Name:</span> {validationResult.booking.user.name || 'N/A'}</p>
                      <p><span className="font-medium">Email:</span> {validationResult.booking.user.email}</p>
                      {validationResult.booking.user.phone && (
                        <p><span className="font-medium">Phone:</span> {validationResult.booking.user.phone}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {!validationResult.booking.is_redeemed && (
                    <Button 
                      onClick={redeemBooking}
                      disabled={isRedeeming}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {isRedeeming ? 'Completing...' : 'Complete Redemption'}
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={resetForm}
                    disabled={isRedeeming}
                  >
                    Scan Another
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-2" />
                <p className="font-medium text-red-700">Invalid Code</p>
                <p className="text-sm text-red-600">{validationResult.error}</p>
                <Button 
                  variant="outline" 
                  onClick={resetForm}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}