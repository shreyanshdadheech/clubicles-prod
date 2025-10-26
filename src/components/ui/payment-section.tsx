'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  CreditCard, Calendar, DollarSign, Clock, CheckCircle, 
  AlertTriangle, RefreshCw, ExternalLink, Receipt
} from 'lucide-react'

interface PaymentHistory {
  id: string
  amount: number
  currency: string
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  created_at: string
  description: string
  booking_id?: string
  payment_method?: string
  transaction_id?: string
}

interface PaymentSectionProps {
  userId: string
}

export function PaymentSection({ userId }: PaymentSectionProps) {
  const [payments, setPayments] = useState<PaymentHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPaymentHistory()
  }, [userId])

  const fetchPaymentHistory = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/payments/history')
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment history')
      }
      
      const data = await response.json()
      setPayments(data.payments || [])
    } catch (error) {
      console.error('Error fetching payment history:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-900/20'
      case 'pending': return 'text-yellow-400 bg-yellow-900/20'
      case 'failed': return 'text-red-400 bg-red-900/20'
      case 'refunded': return 'text-blue-400 bg-blue-900/20'
      default: return 'text-gray-400 bg-gray-900/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'failed': return <AlertTriangle className="w-4 h-4" />
      case 'refunded': return <RefreshCw className="w-4 h-4" />
      default: return <DollarSign className="w-4 h-4" />
    }
  }

  const formatAmount = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100) // Assuming amounts are in paisa/cents
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="ml-2 text-gray-300">Loading payment history...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-900/50 border border-red-600 rounded-lg p-4">
            <div className="flex items-center text-red-300">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
            <Button
              onClick={fetchPaymentHistory}
              variant="outline"
              size="sm"
              className="mt-3 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment History
          </CardTitle>
          <Button
            onClick={fetchPaymentHistory}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
        <p className="text-gray-300 text-sm">
          View your transaction history and payment details
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {payments.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-gray-300 text-lg font-medium mb-2">No Payments Found</h3>
            <p className="text-gray-400">
              You haven't made any payments yet. Your payment history will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Paid</p>
                    <p className="text-white text-xl font-semibold">
                      {formatAmount(
                        payments
                          .filter(p => p.status === 'completed')
                          .reduce((sum, p) => sum + p.amount, 0)
                      )}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Transactions</p>
                    <p className="text-white text-xl font-semibold">{payments.length}</p>
                  </div>
                  <Receipt className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Success Rate</p>
                    <p className="text-white text-xl font-semibold">
                      {payments.length > 0 
                        ? Math.round((payments.filter(p => p.status === 'completed').length / payments.length) * 100)
                        : 0}%
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-400" />
                </div>
              </div>
            </div>

            {/* Payment List */}
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-gray-800/30 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{payment.description}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(payment.created_at)}
                          </span>
                          {payment.booking_id && (
                            <span>Booking: {payment.booking_id.slice(-8)}</span>
                          )}
                          {payment.payment_method && (
                            <span className="capitalize">{payment.payment_method}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-white text-lg font-semibold">
                        {formatAmount(payment.amount, payment.currency)}
                      </p>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        <span className="capitalize">{payment.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  {payment.transaction_id && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <p className="text-xs text-gray-400">
                        Transaction ID: 
                        <span className="ml-1 font-mono">{payment.transaction_id}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Load More Button (if needed) */}
            {payments.length >= 10 && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Load More Transactions
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}