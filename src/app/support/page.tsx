'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  MessageSquare, Mail, Phone, Clock, CheckCircle, AlertCircle,
  ArrowLeft, Send, FileText, HelpCircle, Bug, CreditCard, User, Calendar,
  Building, Building2, DollarSign, ShieldCheck, Crown, BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface SupportTicket {
  id: string
  subject: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  createdAt: string
  updatedAt: string
  responses?: SupportResponse[]
}

interface SupportResponse {
  id: string
  ticketId: string
  message: string
  isFromSupport: boolean
  createdAt: string
}

// Mock support tickets data
const mockTickets: SupportTicket[] = [
  {
    id: '1',
    subject: 'Booking cancellation issue',
    description: 'I am unable to cancel my booking for tomorrow. The cancel button is not working.',
    category: 'booking',
    priority: 'high',
    status: 'in_progress',
    createdAt: '2025-01-21T10:30:00Z',
    updatedAt: '2025-01-21T14:20:00Z',
    responses: [
      {
        id: '1',
        ticketId: '1',
        message: 'Thank you for contacting us. We are looking into this issue and will get back to you soon.',
        isFromSupport: true,
        createdAt: '2025-01-21T11:00:00Z'
      }
    ]
  },
  {
    id: '2',
    subject: 'Payment refund request',
    description: 'I need a refund for my last booking as the space was not as described.',
    category: 'payment',
    priority: 'medium',
    status: 'open',
    createdAt: '2025-01-20T15:45:00Z',
    updatedAt: '2025-01-20T15:45:00Z'
  },
  {
    id: '3',
    subject: 'Account verification',
    description: 'My account is not verified and I cannot make bookings.',
    category: 'account',
    priority: 'high',
    status: 'resolved',
    createdAt: '2025-01-19T09:15:00Z',
    updatedAt: '2025-01-19T16:30:00Z',
    responses: [
      {
        id: '2',
        ticketId: '3',
        message: 'Your account has been verified successfully. You can now make bookings.',
        isFromSupport: true,
        createdAt: '2025-01-19T16:30:00Z'
      }
    ]
  }
]

const categories = [
  { id: 'booking', name: 'Booking Issues', icon: Calendar },
  { id: 'payment', name: 'Payment & Billing', icon: CreditCard },
  { id: 'account', name: 'Account Issues', icon: User },
  { id: 'technical', name: 'Technical Support', icon: Bug },
  { id: 'space_creation', name: 'Space Creation', icon: Building },
  { id: 'space_management', name: 'Space Management', icon: Building2 },
  { id: 'payout_issue', name: 'Payout Issues', icon: DollarSign },
  { id: 'verification_issue', name: 'Verification Issues', icon: ShieldCheck },
  { id: 'subscription_issue', name: 'Subscription Issues', icon: Crown },
  { id: 'analytics_issue', name: 'Analytics Issues', icon: BarChart3 },
  { id: 'general', name: 'General Inquiry', icon: HelpCircle }
]

const priorities = [
  { id: 'low', name: 'Low', color: 'text-green-500' },
  { id: 'medium', name: 'Medium', color: 'text-yellow-500' },
  { id: 'high', name: 'High', color: 'text-orange-500' },
  { id: 'urgent', name: 'Urgent', color: 'text-red-500' }
]

const statuses = [
  { id: 'open', name: 'Open', color: 'text-blue-500' },
  { id: 'in_progress', name: 'In Progress', color: 'text-yellow-500' },
  { id: 'resolved', name: 'Resolved', color: 'text-green-500' },
  { id: 'closed', name: 'Closed', color: 'text-gray-500' }
]

export default function SupportPage() {
  const [user, setUser] = useState<any>(null)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [isCreatingTicket, setIsCreatingTicket] = useState(false)
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: '',
    priority: 'medium' as const
  })
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTickets, setIsLoadingTickets] = useState(true)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            setUser(data.user)
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setIsLoadingUser(false)
      }
    }

    fetchUser()
  }, [])

  // Fetch tickets on component mount
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('/api/support/tickets', {
          method: 'GET',
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setTickets(data.data)
          }
        }
      } catch (error) {
        console.error('Error fetching tickets:', error)
      } finally {
        setIsLoadingTickets(false)
      }
    }

    if (user) {
      fetchTickets()
    }
  }, [user])

  const handleCreateTicket = async () => {
    if (!newTicket.subject || !newTicket.description || !newTicket.category) {
      console.log('Missing required fields:', newTicket)
      return
    }

    console.log('Creating ticket with data:', newTicket)
    setIsLoading(true)
    try {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(newTicket)
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok) {
        if (data.success) {
          setTickets(prev => [data.data, ...prev])
          setNewTicket({ subject: '', description: '', category: '', priority: 'medium' })
          setIsCreatingTicket(false)
          console.log('Ticket created successfully')
        } else {
          console.error('API returned error:', data.error)
        }
      } else {
        console.error('HTTP error:', response.status, data)
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/support/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ message: newMessage })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const newResponse = data.data
          
          setTickets(prev => prev.map(ticket => 
            ticket.id === selectedTicket.id 
              ? { 
                  ...ticket, 
                  responses: [...(ticket.responses || []), newResponse],
                  updatedAt: new Date().toISOString()
                }
              : ticket
          ))

          setSelectedTicket(prev => prev ? {
            ...prev,
            responses: [...(prev.responses || []), newResponse],
            updatedAt: new Date().toISOString()
          } : null)

          setNewMessage('')
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const statusObj = statuses.find(s => s.id === status)
    return statusObj?.color || 'text-gray-500'
  }

  const getPriorityColor = (priority: string) => {
    const priorityObj = priorities.find(p => p.id === priority)
    return priorityObj?.color || 'text-gray-500'
  }

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.icon || HelpCircle
  }

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white">Please sign in to access support.</p>
          <Link href="/signin">
            <Button className="mt-4">Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2 text-gray-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
            <span className="font-doto text-4xl md:text-4xl font-black tracking-wider text-white">CLUBICLES</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-4">
            Support Center
          </h1>
          <p className="text-gray-300 text-lg">Get help with your bookings and account</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tickets List */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white pt-4">Your Support Tickets</h2>
              <Button 
                onClick={() => setIsCreatingTicket(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                New Ticket
              </Button>
            </div>

            <div className="space-y-4">
              {isLoadingTickets ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-gray-300">Loading tickets...</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-2">No Support Tickets</h3>
                  <p className="text-gray-300 text-sm">You haven't created any support tickets yet.</p>
                </div>
              ) : (
                tickets.map((ticket) => {
                const CategoryIcon = getCategoryIcon(ticket.category)
                return (
                  <Card 
                    key={ticket.id}
                    className={`bg-white/10 backdrop-blur-md border-white/20 rounded-2xl transition-all duration-300 ${
                      ticket.status === 'closed' || ticket.status === 'resolved'
                        ? 'opacity-60 cursor-not-allowed'
                        : 'hover:bg-white/15 cursor-pointer'
                    }`}
                    onClick={() => {
                      // Prevent opening closed or resolved tickets
                      if (ticket.status === 'closed' || ticket.status === 'resolved') {
                        alert('This ticket has been closed/resolved and cannot be opened.')
                        return
                      }
                      setSelectedTicket(ticket)
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <CategoryIcon className="w-5 h-5 text-blue-400" />
                            <h3 className="text-lg font-semibold text-white">{ticket.subject}</h3>
                            {(ticket.status === 'closed' || ticket.status === 'resolved') && (
                              <span className="text-xs text-gray-400 bg-gray-500/20 px-2 py-1 rounded-full">
                                Cannot Open
                              </span>
                            )}
                          </div>
                          <p className="text-gray-300 text-sm mb-3 line-clamp-2">{ticket.description}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className={`font-medium ${getStatusColor(ticket.status)}`}>
                              {statuses.find(s => s.id === ticket.status)?.name}
                            </span>
                            <span className={`font-medium ${getPriorityColor(ticket.priority)}`}>
                              {priorities.find(p => p.id === ticket.priority)?.name}
                            </span>
                            <span className="text-gray-400">
                              {new Date(ticket.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          {ticket.responses && ticket.responses.length > 0 && (
                            <div className="flex items-center text-blue-400 text-sm">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              {ticket.responses.length}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
                })
              )}
            </div>
          </div>

          {/* Ticket Details */}
          <div className="lg:col-span-1">
            {selectedTicket ? (
              <Card className="bg-white/10 backdrop-blur-md border-white/20 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>Ticket #{selectedTicket.id}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{selectedTicket.subject}</h3>
                    <p className="text-gray-300 text-sm">{selectedTicket.description}</p>
                  </div>

                  <div className="flex items-center space-x-4 text-sm">
                    <span className={`font-medium ${getStatusColor(selectedTicket.status)}`}>
                      {statuses.find(s => s.id === selectedTicket.status)?.name}
                    </span>
                    <span className={`font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                      {priorities.find(p => p.id === selectedTicket.priority)?.name}
                    </span>
                  </div>

                  {/* Messages */}
                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Conversation</h4>
                    {selectedTicket.responses?.map((response) => (
                      <div key={response.id} className={`p-3 rounded-lg ${
                        response.isFromSupport 
                          ? 'bg-blue-500/20 border border-blue-500/30' 
                          : 'bg-gray-700/50 border border-gray-600/30'
                      }`}>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-medium text-gray-300">
                            {response.isFromSupport ? 'Support Team' : 'You'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(response.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-white">{response.message}</p>
                      </div>
                    ))}
                  </div>

                  {/* Reply Form */}
                  <div className="space-y-3">
                    <Label htmlFor="message" className="text-white">Reply</Label>
                    <Textarea
                      id="message"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message here..."
                      className="bg-gray-800 border-gray-700 text-white"
                      rows={3}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/10 backdrop-blur-md border-white/20 rounded-2xl">
                <CardContent className="p-6 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-2">No Ticket Selected</h3>
                  <p className="text-gray-300 text-sm">Choose a ticket from the list to view details and reply</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Create Ticket Modal */}
        {isCreatingTicket && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl bg-gray-900 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Create New Support Ticket</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subject" className="text-white">Subject</Label>
                  <Input
                    id="subject"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief description of your issue"
                    className="bg-gray-800 border-gray-700 text-black mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-white">Category</Label>
                  <Select value={newTicket.category} onValueChange={(value) => setNewTicket(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center space-x-2">
                            <category.icon className="w-4 h-4" />
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority" className="text-white">Priority</Label>
                  <Select value={newTicket.priority} onValueChange={(value: any) => setNewTicket(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.id} value={priority.id}>
                          <span className={priority.color}>{priority.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description" className="text-white">Description</Label>
                  <Textarea
                    id="description"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Please provide detailed information about your issue"
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                    rows={4}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreatingTicket(false)}
                    className="border-gray-600 text-black hover:text-white hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateTicket}
                    disabled={!newTicket.subject || !newTicket.description || !newTicket.category || isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoading ? 'Creating...' : 'Create Ticket'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}