'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-gray max-w-none text-gray-300">
          <p className="text-lg mb-6">
            Last updated: January 1, 2024
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Information We Collect</h2>
          <p className="mb-4">
            We collect information you provide directly to us, such as when you create an account, make a booking, or contact us for support. This may include your name, email address, phone number, and payment information.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send you technical notices and support messages</li>
            <li>Communicate with you about products, services, and events</li>
            <li>Monitor and analyze trends and usage</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Information Sharing</h2>
          <p className="mb-4">
            We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share your information with:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Service providers who assist us in operating our platform</li>
            <li>Business partners for joint marketing efforts (with your consent)</li>
            <li>Law enforcement when required by law</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Data Security</h2>
          <p className="mb-4">
            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption of sensitive data and regular security audits.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Cookies and Tracking</h2>
          <p className="mb-4">
            We use cookies and similar tracking technologies to collect information about your browsing activities. You can control cookies through your browser settings, though this may affect the functionality of our services.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">6. Your Rights</h2>
          <p className="mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Access and update your personal information</li>
            <li>Request deletion of your data</li>
            <li>Opt out of marketing communications</li>
            <li>Port your data to another service</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">7. Children's Privacy</h2>
          <p className="mb-4">
            Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal information, we will delete such information.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">8. Changes to This Policy</h2>
          <p className="mb-4">
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
          </p>

          
        </div>
      </div>
    </div>
  )
}
