'use client'

// Payment service using Prisma-based API endpoints

export interface PaymentRecord {
  id: string
  booking_id: string
  razorpay_payment_id: string | null
  razorpay_order_id: string | null
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  gateway_response: any
  created_at: string
  updated_at: string
  // Joined fields from booking
  space_name?: string
  space_address?: string
  booking_date?: string
  booking_start_time?: string
  booking_end_time?: string
}

export interface PaymentSummary {
  total_payments: number
  total_amount: number
  completed_payments: number
  pending_payments: number
  failed_payments: number
  last_payment_date: string | null
}

class PaymentService {
  // Using API endpoints instead of direct database access

  async getUserPayments(userId: string, limit = 10): Promise<{
    success: boolean
    data: PaymentRecord[]
    error?: string
  }> {
    try {
      const response = await fetch('/api/payments/history', {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        return {
          success: false,
          data: [],
          error: 'Failed to fetch payments'
        }
      }

      const result = await response.json()
      
      if (!result.success) {
        return {
          success: false,
          data: [],
          error: result.error || 'Failed to fetch payments'
        }
      }

      // Transform the data to match PaymentRecord interface
      const transformedData: PaymentRecord[] = (result.data || []).map((payment: any) => ({
        id: payment.id,
        booking_id: payment.booking_id,
        razorpay_payment_id: payment.razorpay_payment_id,
        razorpay_order_id: payment.razorpay_order_id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        gateway_response: payment.gateway_response,
        created_at: payment.created_at,
        updated_at: payment.updated_at,
        space_name: payment.space_name,
        space_address: payment.space_address,
        booking_date: payment.booking_date,
        booking_start_time: payment.booking_start_time,
        booking_end_time: payment.booking_end_time
      }))

      return {
        success: true,
        data: transformedData
      }
    } catch (error) {
      console.error('Error in getUserPayments:', error)
      return {
        success: false,
        data: [],
        error: 'Failed to fetch payments'
      }
    }
  }

  async getPaymentSummary(userId: string): Promise<{
    success: boolean
    data?: PaymentSummary
    error?: string
  }> {
    try {
      const response = await fetch('/api/payments/history', {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        return {
          success: false,
          error: 'Failed to fetch payment summary'
        }
      }

      const result = await response.json()
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to fetch payment summary'
        }
      }

      const payments = result.data || []
      
      // Calculate summary statistics
      const summary: PaymentSummary = {
        total_payments: payments.length,
        total_amount: payments.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0),
        completed_payments: payments.filter((p: any) => p.status === 'completed').length,
        pending_payments: payments.filter((p: any) => p.status === 'pending').length,
        failed_payments: payments.filter((p: any) => p.status === 'failed').length,
        last_payment_date: payments.length > 0 ? payments[0].created_at : null
      }

      return {
        success: true,
        data: summary
      }
    } catch (error) {
      console.error('Error in getPaymentSummary:', error)
      return {
        success: false,
        error: 'Failed to fetch payment summary'
      }
    }
  }

  async createPayment(paymentData: {
    booking_id: string
    amount: number
    currency: string
    razorpay_order_id: string
  }): Promise<{
    success: boolean
    data?: PaymentRecord
    error?: string
  }> {
    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(paymentData)
      })

      if (!response.ok) {
        return {
          success: false,
          error: 'Failed to create payment'
        }
      }

      const result = await response.json()
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to create payment'
        }
      }

      return {
        success: true,
        data: result.data
      }
    } catch (error) {
      console.error('Error in createPayment:', error)
      return {
        success: false,
        error: 'Failed to create payment'
      }
    }
  }

  async updatePaymentStatus(paymentId: string, status: string, gatewayResponse?: any): Promise<{
    success: boolean
    data?: PaymentRecord
    error?: string
  }> {
    try {
      const response = await fetch('/api/payments/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          payment_id: paymentId,
          status,
          gateway_response: gatewayResponse
        })
      })

      if (!response.ok) {
        return {
          success: false,
          error: 'Failed to update payment'
        }
      }

      const result = await response.json()
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to update payment'
        }
      }

      return {
        success: true,
        data: result.data
      }
    } catch (error) {
      console.error('Error in updatePaymentStatus:', error)
      return {
        success: false,
        error: 'Failed to update payment'
      }
    }
  }
}

export const paymentService = new PaymentService()