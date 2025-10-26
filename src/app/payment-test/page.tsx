'use client'

import { SimplePaymentTest } from '@/components/payment/simple-payment-test'

export default function PaymentTestPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Payment Integration Test</h1>
      <p className="text-gray-600 mb-8">This page is for testing payment integration issues.</p>
      <SimplePaymentTest amount={100} />
    </div>
  )
}
