'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold mb-8">Terms & Conditions</h1>
        
        <div className="prose prose-gray max-w-none text-gray-300">
          <p className="text-lg mb-6">
            Last updated: January 1, 2024
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Agreement to Terms</h2>
          <p className="mb-4">
            By accessing and using the Clubicles platform, you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Use License</h2>
          <p className="mb-4">
            Permission is granted to temporarily access Clubicles for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Disclaimer</h2>
          <p className="mb-4">
            The materials on Clubicles are provided on an 'as is' basis. Clubicles makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Limitations</h2>
          <p className="mb-4">
            In no event shall Clubicles or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Clubicles, even if Clubicles or a Clubicles authorized representative has been notified orally or in writing of the possibility of such damage.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Accuracy of Materials</h2>
          <p className="mb-4">
            The materials appearing on Clubicles could include technical, typographical, or photographic errors. Clubicles does not warrant that any of the materials on its website are accurate, complete, or current.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">6. Links</h2>
          <p className="mb-4">
            Clubicles has not reviewed all of the sites linked to our platform and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Clubicles of the site.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">7. Modifications</h2>
          <p className="mb-4">
            Clubicles may revise these terms of service at any time without notice. By using this platform, you are agreeing to be bound by the then current version of these terms of service.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">8. Governing Law</h2>
          <p className="mb-4">
            These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
          </p>

          
        </div>
      </div>
    </div>
  )
}
