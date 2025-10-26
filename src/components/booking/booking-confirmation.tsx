'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  CheckCircle, QrCode, Copy, ShieldCheck, CalendarDays, 
  Clock, MapPin, Building, CheckIcon, Download
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import QRCode from 'qrcode'
import { toast } from 'sonner'

interface BookingConfirmationProps {
  booking: {
    id: string
    space_name: string
    space_location: string
    booking_date: string
    start_time: string
    end_time: string
    duration: number
    amount: number
    status: string
    redemption_code: string
    created_at: string
  }
  onClose: () => void
}

export function BookingConfirmation({ booking, onClose }: BookingConfirmationProps) {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('')
  const [copiedCode, setCopiedCode] = useState<string>('')
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)

  // Generate QR code for redemption code
  const generateQRCode = async () => {
    try {
      setIsGeneratingQR(true)
      const qrData = booking.redemption_code
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCodeDataURL(qrCodeDataURL)
    } catch (err) {
      console.error('Error generating QR code:', err)
      toast.error('Failed to generate QR code')
    } finally {
      setIsGeneratingQR(false)
    }
  }

  // Copy redemption code
  const copyRedemptionCode = async () => {
    try {
      await navigator.clipboard.writeText(booking.redemption_code)
      setCopiedCode(booking.redemption_code)
      toast.success('Redemption code copied!')
    } catch (err) {
      console.error('Error copying redemption code:', err)
      toast.error('Failed to copy redemption code')
    }
  }

  // Download QR code
  const downloadQRCode = () => {
    if (qrCodeDataURL) {
      const link = document.createElement('a')
      link.download = `booking-${booking.id}-qr.png`
      link.href = qrCodeDataURL
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('QR code downloaded!')
    }
  }

  useEffect(() => {
    generateQRCode()
  }, [booking.redemption_code])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-green-500/10 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <CardTitle className="text-2xl text-white">Booking Confirmed!</CardTitle>
          <p className="text-gray-400 mt-2">
            Your booking has been successfully confirmed. Here are your booking details and access code.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Booking Details */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center">
              <Building className="w-4 h-4 mr-2 text-blue-400" />
              Booking Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Space</p>
                <p className="text-white font-medium">{booking.space_name}</p>
              </div>
              <div>
                <p className="text-gray-400">Location</p>
                <p className="text-white font-medium">{booking.space_location}</p>
              </div>
              <div>
                <p className="text-gray-400">Date</p>
                <p className="text-white font-medium">{formatDate(booking.booking_date)}</p>
              </div>
              <div>
                <p className="text-gray-400">Time</p>
                <p className="text-white font-medium">{booking.start_time} - {booking.end_time}</p>
              </div>
              <div>
                <p className="text-gray-400">Duration</p>
                <p className="text-white font-medium">{booking.duration} hours</p>
              </div>
              <div>
                <p className="text-gray-400">Amount</p>
                <p className="text-white font-medium">{formatCurrency(booking.amount)}</p>
              </div>
            </div>
          </div>

          {/* Redemption Code Section */}
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold flex items-center">
                <QrCode className="w-4 h-4 mr-2 text-green-400" />
                Booking Access Code
              </h3>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                Active
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <code className="flex-1 bg-black/30 px-3 py-2 rounded font-mono text-green-400 text-sm border border-gray-600">
                  {booking.redemption_code}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                  onClick={copyRedemptionCode}
                >
                  {copiedCode === booking.redemption_code ? (
                    <CheckIcon className="w-3 h-3 mr-1" />
                  ) : (
                    <Copy className="w-3 h-3 mr-1" />
                  )}
                  {copiedCode === booking.redemption_code ? 'Copied!' : 'Copy'}
                </Button>
              </div>

              {/* QR Code Display */}
              <div className="text-center space-y-3">
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-gray-400 text-sm mb-2">Redemption Code QR:</p>
                  {isGeneratingQR ? (
                    <div className="w-32 h-32 mx-auto bg-gray-700 rounded flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
                    </div>
                  ) : qrCodeDataURL ? (
                    <div className="space-y-2">
                      <img 
                        src={qrCodeDataURL} 
                        alt="QR Code" 
                        className="w-32 h-32 mx-auto rounded border border-gray-600"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                        onClick={downloadQRCode}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download QR
                      </Button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 mx-auto bg-gray-700 rounded flex items-center justify-center">
                      <p className="text-gray-400 text-xs">Failed to generate</p>
                    </div>
                  )}
                </div>
                <div className="text-gray-400 text-sm space-y-1">
                  <p>📱 Show this QR code to the space owner</p>
                  <p>🔍 Or let them scan it with their phone</p>
                  <p>✅ This code will be redeemed when you arrive</p>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-2 text-blue-400" />
              What's Next?
            </h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Save this redemption code or take a screenshot</li>
              <li>• Show the QR code to the space owner when you arrive</li>
              <li>• The space owner will scan and redeem your booking</li>
              <li>• You can also find this code in your bookings page</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={onClose}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              View My Bookings
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/dashboard'}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
