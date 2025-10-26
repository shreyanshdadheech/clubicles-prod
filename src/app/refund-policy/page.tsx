'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800 sticky top-0 z-50 bg-black/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full"></div>
              <span className="text-xl font-semibold">Clubicles</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/spaces" className="hover:text-gray-300 transition-colors">Spaces</Link>
              <Link href="/pricing" className="hover:text-gray-300 transition-colors">Pricing</Link>
              <Link href="/about" className="hover:text-gray-300 transition-colors">About</Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/signin">
                <Button variant="ghost" className="hover:bg-gray-800">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-white text-black hover:bg-gray-200">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Refund & Cancellation Policy</h1>

        <div className="prose prose-gray max-w-none text-gray-300">
          <p className="text-lg mb-6">Last updated: {new Date().toLocaleDateString()}</p>

          <p className="mb-6">This Refund & Cancellation Policy is issued by Clubicles (the "Platform"). Razorpay explicitly requires this page to describe refund handling by the platform. This policy governs refunds for transactions processed on Clubicles and applies to space bookings paid through the platform.</p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-3">1) Refund Eligibility</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Eligible refunds are processed on the Platform side after validating booking and payout status.</li>
            <li><span className="text-white">Partial refunds</span> may be issued based on cancellation window and usage (see Section 2).</li>
            <li>Refunds are not applicable for no-shows or where usage has commenced beyond the refundable window.</li>
            <li>Refunds are not provided for third‑party charges (e.g., bank/UPI fees) where applicable.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-3">2) Cancellation Conditions</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Free cancellation with full refund up to 24 hours before the booking start time.</li>
            <li>50% refund if cancelled between 24 hours and 2 hours before the booking start time.</li>
            <li>No refund if cancelled within 2 hours of start time, or after the booking has started.</li>
            <li>Platform may override/refund in full in cases of provider unavailability, operational issues, or verified payment disputes.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-3">3) How Refunds Are Processed</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>All refunds are initiated by the Platform via the original payment method used at checkout (Razorpay order).</li>
            <li>Refund timeline: typically 5–7 business days after approval. Bank timelines may vary.</li>
            <li>If the original payment method has expired/failed, the Platform will coordinate an alternate method after verification.</li>
            <li>Refund amount may exclude non‑refundable taxes/fees where applicable by law or provider terms.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-3">4) Platform‑Side Handling</h2>
          <p className="mb-6">Refunds are evaluated and approved by Clubicles. Space owners are not responsible for processing refunds directly; the Platform manages refund initiation through the payment gateway and updates booking/payment records accordingly.</p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-3">5) How to Request a Refund</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Submit a request via the Support tab on your dashboard (User or Owner), selecting the appropriate category.</li>
            <li>Or email our support team with your booking ID and payment reference.</li>
          </ul>

          <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-4 mb-8">
            <p className="mb-1"><span className="text-white font-medium">Support Email:</span> support@clubicles.com</p>
            <p><span className="text-white font-medium">Subject:</span> Refund Request – [Booking ID]</p>
          </div>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-3">6) Notes</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Abuse of refunds or repeated last‑minute cancellations may lead to account restrictions.</li>
            <li>This policy may be updated to comply with gateway/banking regulations and legal changes.</li>
          </ul>

        </div>
      </div>
    </div>
  )
}


