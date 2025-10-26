'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  MessageCircle, Send, CheckCircle, AlertTriangle, Clock, 
  User, Mail, Phone, MapPin, Badge
} from 'lucide-react'
import { User as UserType } from '@/types'

interface SupportTicketFormProps {
  user: UserType
  onSuccess?: () => void
}

type TicketCategory = 
  | 'booking-issue' 
  | 'payment-problem' 
  | 'account-access' 
  | 'technical-bug' 
  | 'feature-request' 
  | 'general-inquiry'

const categoryOptions: { value: TicketCategory; label: string; description: string }[] = [
  {
    value: 'booking-issue',
    label: 'Booking Issue',
    description: 'Problems with creating, modifying, or accessing bookings'
  },
  {
    value: 'payment-problem',
    label: 'Payment Problem',
    description: 'Issues with payments, refunds, or billing'
  },
  {
    value: 'account-access',
    label: 'Account Access',
    description: 'Login issues or account recovery'
  },
  {
    value: 'technical-bug',
    label: 'Technical Bug',
    description: 'App crashes, errors, or unexpected behavior'
  },
  {
    value: 'feature-request',
    label: 'Feature Request',
    description: 'Suggestions for new features or improvements'
  },
  {
    value: 'general-inquiry',
    label: 'General Inquiry',
    description: 'Questions about services or general support'
  }
]

export function SupportTicketForm({ user, onSuccess }: SupportTicketFormProps) {
  const [formData, setFormData] = useState({
    category: '' as TicketCategory | '',
    subject: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.category || !formData.subject.trim() || !formData.description.trim()) {
      setErrorMessage('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: formData.category,
          subject: formData.subject,
          description: formData.description,
          priority: formData.priority
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Failed to submit support ticket')
      }

      const result = await response.json()
      console.log('Support ticket submitted:', result)

      setSubmitStatus('success')
      
      // Reset form
      setFormData({
        category: '',
        subject: '',
        description: '',
        priority: 'medium'
      })

      if (onSuccess) {
        onSuccess()
      }

    } catch (error) {
      console.error('Error submitting support ticket:', error)
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 border-red-400'
      case 'medium': return 'text-yellow-400 border-yellow-400'
      case 'low': return 'text-green-400 border-green-400'
      default: return 'text-gray-400 border-gray-400'
    }
  }

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Contact Support
        </CardTitle>
        <p className="text-gray-300 text-sm">
          Need help? Submit a support ticket and our team will get back to you.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Info Display */}
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <h4 className="text-white font-medium mb-3">Your Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center text-gray-300">
              <User className="w-4 h-4 mr-2 text-gray-400" />
              <span>{user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : 'Not set'}</span>
            </div>
            <div className="flex items-center text-gray-300">
              <Mail className="w-4 h-4 mr-2 text-gray-400" />
              <span className="break-all">{user.email}</span>
            </div>
            <div className="flex items-center text-gray-300">
              <Phone className="w-4 h-4 mr-2 text-gray-400" />
              <span>{user.phone || 'Not set'}</span>
            </div>
            <div className="flex items-center text-gray-300">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <span>{user.city || 'Not set'}</span>
            </div>
            {user.professional_role && (
              <div className="flex items-center text-gray-300">
                <Badge className="w-4 h-4 mr-2 text-gray-400" />
                <span className="capitalize">{user.professional_role}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Messages */}
        {submitStatus === 'success' && (
          <div className="bg-green-900/50 border border-green-600 rounded-lg p-4">
            <div className="flex items-center text-green-300">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Support ticket submitted successfully! We'll get back to you soon.</span>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="bg-red-900/50 border border-red-600 rounded-lg p-4">
            <div className="flex items-center text-red-300">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Selection */}
          <div>
            <Label htmlFor="category" className="text-gray-300">
              Category <span className="text-red-400">*</span>
            </Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full mt-1 bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            >
              <option value="">Select a category...</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {formData.category && (
              <p className="text-gray-400 text-xs mt-1">
                {categoryOptions.find(opt => opt.value === formData.category)?.description}
              </p>
            )}
          </div>

          {/* Priority Selection */}
          <div>
            <Label htmlFor="priority" className="text-gray-300">Priority</Label>
            <div className="flex space-x-3 mt-2">
              {['low', 'medium', 'high'].map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => handleInputChange('priority', priority)}
                  className={`px-3 py-1 rounded-md border text-xs capitalize transition-colors ${
                    formData.priority === priority 
                      ? `${getPriorityColor(priority)} bg-gray-800` 
                      : 'text-gray-400 border-gray-600 hover:border-gray-500'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <Label htmlFor="subject" className="text-gray-300">
              Subject <span className="text-red-400">*</span>
            </Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white mt-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Brief description of your issue..."
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-gray-300">
              Description <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white mt-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[100px]"
              placeholder="Please provide detailed information about your issue..."
              required
            />
            <p className="text-gray-400 text-xs mt-1">
              Include as much detail as possible to help us resolve your issue quickly.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || submitStatus === 'success'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Support Ticket
              </>
            )}
          </Button>
        </form>

        {/* Additional Info */}
        <div className="bg-blue-900/20 border border-blue-600/50 rounded-lg p-4">
          <div className="flex items-start">
            <Clock className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-300 font-medium">Expected Response Time</p>
              <p className="text-gray-300">
                • High Priority: Within 2 hours<br />
                • Medium Priority: Within 24 hours<br />
                • Low Priority: Within 48 hours
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}