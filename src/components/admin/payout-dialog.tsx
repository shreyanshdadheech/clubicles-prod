'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreditCard, DollarSign, AlertCircle, CheckCircle } from 'lucide-react'

interface PayoutDialogProps {
  isOpen: boolean
  onClose: () => void
  spaceOwner: {
    id: string
    firstName?: string
    lastName?: string
    email: string
    pendingPayout: number
    currentBalance: number
    totalWithdrawn?: number
    paymentInfo?: {
      bankAccountNumber: string
      bankIfscCode: string
      bankAccountHolderName: string
      bankName: string
      upiId?: string
    }
  } | null
  onPayoutProcessed: () => void
}

export function PayoutDialog({ isOpen, onClose, spaceOwner, onPayoutProcessed }: PayoutDialogProps) {
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const [transactionId, setTransactionId] = useState('')
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!spaceOwner) return

    if (!amount || !paymentMethod) {
      setError('Please fill in all required fields')
      return
    }

    const payoutAmount = parseFloat(amount)
    if (payoutAmount <= 0) {
      setError('Amount must be greater than 0')
      return
    }

    if (payoutAmount > (spaceOwner.pendingPayout || 0)) {
      setError(`Amount cannot exceed pending payout of ₹${(spaceOwner.pendingPayout || 0).toLocaleString()}`)
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      console.log('🚀 Processing payout:', {
        spaceOwnerId: spaceOwner.id,
        amount: payoutAmount,
        paymentMethod,
        transactionId,
        notes
      })
      
      const response = await fetch('/api/admin/space-owners/payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spaceOwnerId: spaceOwner.id,
          amount: payoutAmount,
          paymentMethod,
          transactionId: transactionId || undefined,
          notes: notes || undefined
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Payout API Error:', result)
        throw new Error(result.error || result.details || 'Failed to process payout')
      }

      console.log('✅ Payout successful:', result)
      
      // Reset form
      setAmount('')
      setTransactionId('')
      setNotes('')
      
      // Notify parent component
      onPayoutProcessed()
      
      // Close dialog
      onClose()
      
    } catch (err: any) {
      console.error('Payout error:', err)
      setError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (!isProcessing) {
      setAmount('')
      setTransactionId('')
      setNotes('')
      setError(null)
      onClose()
    }
  }

  if (!spaceOwner) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-full bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Process Payout
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Space Owner Info */}
          <div className="space-y-4">
            {/* Space Owner Info */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Space Owner Details</h3>
              <div className="space-y-1 text-sm text-gray-300">
                <p><span className="font-medium">Name:</span> {spaceOwner.firstName} {spaceOwner.lastName}</p>
                <p><span className="font-medium">Email:</span> {spaceOwner.email}</p>
                <p><span className="font-medium">Pending Payout:</span> 
                  <span className="text-green-400 font-semibold ml-1">₹{(spaceOwner.pendingPayout || 0).toLocaleString()}</span>
                </p>
                <p><span className="font-medium">Current Balance:</span> 
                  <span className="text-blue-400 font-semibold ml-1">₹{(spaceOwner.totalWithdrawn || spaceOwner.currentBalance || 0).toLocaleString()}</span>
                </p>
              </div>
            </div>

            {/* Payment Info */}
            {spaceOwner.paymentInfo && (
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Payment Information</h3>
                <div className="space-y-1 text-sm text-gray-300">
                  <p><span className="font-medium">Bank:</span> {spaceOwner.paymentInfo.bankName}</p>
                  <p><span className="font-medium">Account:</span> {spaceOwner.paymentInfo.bankAccountNumber}</p>
                  <p><span className="font-medium">IFSC:</span> {spaceOwner.paymentInfo.bankIfscCode}</p>
                  <p><span className="font-medium">Holder:</span> {spaceOwner.paymentInfo.bankAccountHolderName}</p>
                  {spaceOwner.paymentInfo.upiId && (
                    <p><span className="font-medium">UPI:</span> {spaceOwner.paymentInfo.upiId}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Payout Form */}
          <div className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Payout Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-gray-300 font-medium">
                Payout Amount (₹) *
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={spaceOwner.pendingPayout}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter payout amount"
                className="bg-white/10 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-400">
                Maximum: ₹{(spaceOwner.pendingPayout || 0).toLocaleString()}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod" className="text-gray-300 font-medium">
                Payment Method *
              </Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="bg-white/10 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="bank_transfer" className="text-white hover:bg-gray-700">
                    Bank Transfer
                  </SelectItem>
                  <SelectItem value="upi" className="text-white hover:bg-gray-700">
                    UPI Transfer
                  </SelectItem>
                  <SelectItem value="cheque" className="text-white hover:bg-gray-700">
                    Cheque
                  </SelectItem>
                  <SelectItem value="other" className="text-white hover:bg-gray-700">
                    Other
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transactionId" className="text-gray-300 font-medium">
                Transaction ID (Optional)
              </Label>
              <Input
                id="transactionId"
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter transaction reference"
                className="bg-white/10 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-300 font-medium">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this payout"
                className="bg-white/10 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isProcessing}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Process Payout
                  </>
                )}
              </Button>
            </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}