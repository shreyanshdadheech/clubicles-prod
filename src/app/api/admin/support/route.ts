import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const adminEmails = [
      'shreyanshdadheech@gmail.com',
      'admin@clubicles.com',
      'yogesh.dubey.0804@gmail.com'
    ]
    
    if (!adminEmails.includes(decoded.email)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const userRole = searchParams.get('userRole')
    const category = searchParams.get('category')

    // Build where clause
    const where: any = {}
    if (status) where.status = status
    if (priority) where.priority = priority
    if (userRole) where.userRole = userRole
    if (category) where.category = category

    // Fetch all support tickets with user information
    const tickets = await prisma.supportTicket.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            city: true,
            roles: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data
    const transformedTickets = tickets.map(ticket => ({
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      userId: ticket.userId,
      userRole: ticket.userRole,
      subject: ticket.subject,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      assignedAdminId: ticket.assignedAdminId,
      adminResponse: ticket.adminResponse,
      internalNotes: ticket.internalNotes,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      resolvedAt: ticket.resolvedAt?.toISOString(),
      closedAt: ticket.closedAt?.toISOString(),
      userAgent: ticket.userAgent,
      ipAddress: ticket.ipAddress,
      attachments: ticket.attachments,
      tags: ticket.tags,
      user: ticket.user,
      messages: ticket.messages.map(msg => ({
        id: msg.id,
        ticketId: msg.ticketId,
        message: msg.message,
        isFromSupport: msg.senderType === 'admin',
        senderType: msg.senderType,
        senderId: msg.senderId,
        createdAt: msg.createdAt.toISOString()
      }))
    }))

    return NextResponse.json({
      success: true,
      data: transformedTickets
    })
  } catch (error) {
    console.error('Error fetching admin support tickets:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch support tickets' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const adminEmails = [
      'shreyanshdadheech@gmail.com',
      'admin@clubicles.com',
      'yogesh.dubey.0804@gmail.com'
    ]
    
    if (!adminEmails.includes(decoded.email)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { ticketId, status, assignedAdminId, adminResponse, internalNotes } = await request.json()

    if (!ticketId) {
      return NextResponse.json(
        { success: false, error: 'Ticket ID is required' },
        { status: 400 }
      )
    }

    // Update ticket
    const updateData: any = {}
    if (status) updateData.status = status
    if (assignedAdminId !== undefined) updateData.assignedAdminId = assignedAdminId
    if (adminResponse !== undefined) updateData.adminResponse = adminResponse
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes

    // Set resolved/closed timestamps
    if (status === 'resolved') {
      updateData.resolvedAt = new Date()
    } else if (status === 'closed') {
      updateData.closedAt = new Date()
    }

    console.log('🔍 Admin Support: Updating ticket with data:', updateData)
    console.log('🔍 Admin Support: Ticket ID:', ticketId)

    // First, try a simple update without include to test
    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateData
    })

    console.log('🔍 Admin Support: Basic update successful, now fetching with relations')

    // Then fetch the ticket with relations
    const ticketWithRelations = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            city: true,
            roles: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!ticketWithRelations) {
      throw new Error('Ticket not found after update')
    }

    // Transform the response
    const transformedTicket = {
      id: ticketWithRelations.id,
      ticketNumber: ticketWithRelations.ticketNumber,
      userId: ticketWithRelations.userId,
      userRole: ticketWithRelations.userRole,
      subject: ticketWithRelations.subject,
      description: ticketWithRelations.description,
      category: ticketWithRelations.category,
      priority: ticketWithRelations.priority,
      status: ticketWithRelations.status,
      assignedAdminId: ticketWithRelations.assignedAdminId,
      adminResponse: ticketWithRelations.adminResponse,
      internalNotes: ticketWithRelations.internalNotes,
      createdAt: ticketWithRelations.createdAt.toISOString(),
      updatedAt: ticketWithRelations.updatedAt.toISOString(),
      resolvedAt: ticketWithRelations.resolvedAt?.toISOString(),
      closedAt: ticketWithRelations.closedAt?.toISOString(),
      user: ticketWithRelations.user,
      messages: ticketWithRelations.messages.map(msg => ({
        id: msg.id,
        ticketId: msg.ticketId,
        message: msg.message,
        isFromSupport: msg.senderType === 'admin',
        senderType: msg.senderType,
        senderId: msg.senderId,
        createdAt: msg.createdAt.toISOString()
      }))
    }

    return NextResponse.json({
      success: true,
      data: transformedTicket
    })
  } catch (error) {
    console.error('Error updating support ticket:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { success: false, error: 'Failed to update support ticket' },
      { status: 500 }
    )
  }
}
