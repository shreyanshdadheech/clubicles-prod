'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { QrCode, Camera, X } from 'lucide-react'

interface QRScannerProps {
  onScan: (result: string) => void
  onError?: (error: string) => void
  trigger?: React.ReactNode
}

export function QRScanner({ onScan, onError, trigger }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<any>(null)

  const startScanning = async () => {
    try {
      setError(null)
      setIsScanning(true)

      // Dynamically import QrScanner to avoid SSR issues
      const QrScanner = (await import('qr-scanner')).default

      if (!videoRef.current) {
        throw new Error('Video element not found')
      }

      // Create QR scanner instance
      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code detected:', result.data)
          onScan(result.data)
          stopScanning()
          setIsOpen(false)
        },
        {
          onDecodeError: (error) => {
            // Ignore decode errors, they're common during scanning
            console.log('Decode error (ignored):', error)
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      )

      scannerRef.current = qrScanner
      await qrScanner.start()
    } catch (err: any) {
      console.error('QR Scanner error:', err)
      const errorMessage = err.message || 'Failed to start camera'
      setError(errorMessage)
      onError?.(errorMessage)
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop()
      scannerRef.current.destroy()
      scannerRef.current = null
    }
    setIsScanning(false)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      stopScanning()
    }
  }

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-500/30">
            <QrCode className="w-4 h-4 mr-2" />
            Scan QR Code
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Scan QR Code
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full h-64 bg-black rounded-lg"
              playsInline
              muted
            />
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 text-white px-3 py-1 rounded">
                  Scanning...
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            {!isScanning ? (
              <Button onClick={startScanning} className="flex-1">
                <Camera className="w-4 h-4 mr-2" />
                Start Camera
              </Button>
            ) : (
              <Button onClick={stopScanning} variant="outline" className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Stop Scanning
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>

          <p className="text-gray-500 text-sm text-center">
            Point your camera at a QR code to scan it
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
