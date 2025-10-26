'use client'

import React, { useState } from 'react'
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, Users, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SharedNavigation } from '@/components/shared/navigation'
import { motion } from 'framer-motion'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send message')
      }
      alert('Message sent! We will get back to you soon.')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (err: any) {
      alert(err.message || 'Something went wrong. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Navigation */}
      <SharedNavigation />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
            <MessageCircle className="h-4 w-4 mr-2 text-white" />
            <span className="text-sm font-medium">Get In Touch</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent leading-tight">
            We'd Love to Hear From You
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Have questions about spaces, partnerships, or need support? Our team is here to help you find the perfect workspace solution.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
          {/* Contact Info */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 rounded-2xl">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white text-xl">Email Us</CardTitle>
                <CardDescription className="text-gray-300">
                  Drop us a line anytime!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white font-semibold">hello@clubicles.com</p>
                <p className="text-gray-400 text-sm mt-1">We typically respond within 2-4 hours</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 rounded-2xl">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white text-xl">Call Us</CardTitle>
                <CardDescription className="text-gray-300">
                  Mon-Fri from 9am to 7pm IST
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white font-semibold">+91 80000 00000</p>
                <p className="text-gray-400 text-sm mt-1">Customer support hotline</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 rounded-2xl">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white text-xl">Visit Us</CardTitle>
                <CardDescription className="text-gray-300">
                  Come say hello at our HQ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white font-semibold">123 Business District</p>
                <p className="text-white">Bengaluru, Karnataka 560001</p>
                <div className="flex items-center mt-2 text-gray-400 text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  Mon-Fri 9am-6pm
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl rounded-2xl">
              <CardHeader className="pb-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-2xl">Send us a message</CardTitle>
                    <CardDescription className="text-gray-300 mt-1">
                      Fill out the form below and we'll get back to you within 24 hours.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold mb-3 text-gray-200">
                        Full Name *
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        className="w-full px-4 py-4 bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all duration-200"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold mb-3 text-gray-200">
                        Email Address *
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="w-full px-4 py-4 bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all duration-200"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold mb-3 text-gray-200">
                      Subject *
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      className="w-full px-4 py-4 bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all duration-200"
                      placeholder="What's this about?"
                      value={formData.subject}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold mb-3 text-gray-200">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      required
                      className="w-full px-4 py-4 bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all duration-200 resize-none"
                      placeholder="Tell us more about your inquiry..."
                      value={formData.message}
                      onChange={handleInputChange}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-white !text-black hover:bg-gray-100 hover:!text-black hover:scale-105 transition-all duration-200 shadow-lg py-4 text-lg font-semibold rounded-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                        Sending Message...
                      </div>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div 
          className="mt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
              <Sparkles className="h-4 w-4 mr-2 text-white" />
              <span className="text-sm font-medium">Quick Answers</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent leading-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Find quick answers to common questions about our workspace solutions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                question: "How do I book a workspace?",
                answer: "Simply browse our spaces, select your preferred location and date, then book instantly through our secure platform. You'll receive immediate confirmation and access details.",
                icon: Users
              },
              {
                question: "Can I cancel my booking?",
                answer: "Yes, you can cancel up to 24 hours before your booking for a full refund. Cancellations made less than 24 hours before are subject to our cancellation policy.",
                icon: Clock
              },
              {
                question: "Do you offer monthly passes?",
                answer: "Absolutely! We offer flexible monthly and annual plans that give you access to all our locations with special member pricing and priority booking.",
                icon: MessageCircle
              },
              {
                question: "What amenities are included?",
                answer: "All spaces include high-speed WiFi, premium coffee & tea, printing facilities, meeting room access, and professional support staff to ensure your productivity.",
                icon: Sparkles
              }
            ].map((faq, index) => (
              <Card 
                key={index} 
                className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 rounded-2xl group"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                      <faq.icon className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-white text-lg font-semibold leading-tight">{faq.question}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pl-14">
                  <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md border-white/20 shadow-2xl rounded-2xl pt-4">
            <CardContent className="p-12">
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Ready to Find Your Perfect Workspace?
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Join thousands of professionals who trust Clubicles for their workspace needs. Start exploring today.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white !text-black hover:bg-gray-100 hover:!text-black hover:scale-105 transition-all duration-200 shadow-lg px-8 py-4 text-lg rounded-xl"
                  onClick={() => window.location.href = '/spaces'}
                >
                  Browse Spaces
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white/30 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-md transition-all duration-300 hover:scale-105 px-8 py-4 text-lg rounded-xl"
                  onClick={() => window.location.href = '/signup'}
                >
                  Sign Up Free
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
