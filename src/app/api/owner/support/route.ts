import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
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

    // Fetch space owner's support tickets
    const tickets = await prisma.supportTicket.findMany({
      where: {
        userId: decoded.id,
        userRole: 'owner'
      },
      include: {
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

    // Transform the data to match the frontend interface
    const transformedTickets = tickets.map(ticket => ({
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      assignedAdminId: ticket.assignedAdminId,
      adminResponse: ticket.adminResponse,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      resolvedAt: ticket.resolvedAt?.toISOString(),
      closedAt: ticket.closedAt?.toISOString(),
      responses: ticket.messages.map(msg => ({
        id: msg.id,
        ticketId: msg.ticketId,
        message: msg.message,
        isFromSupport: msg.senderType === 'admin',
        createdAt: msg.createdAt.toISOString()
      }))
    }))

    return NextResponse.json({
      success: true,
      data: transformedTickets
    })
  } catch (error) {
    console.error('Error fetching owner support tickets:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch support tickets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
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

    const { subject, description, category, priority } = await request.json()

    console.log('Creating owner support ticket with data:', { subject, description, category, priority, userId: decoded.id })

    if (!subject || !description || !category) {
      return NextResponse.json(
        { success: false, error: 'Subject, description, and category are required' },
        { status: 400 }
      )
    }

    // Generate ticket number
    const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    console.log('Generated ticket number:', ticketNumber)

    // Create new support ticket for space owner
    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId: decoded.id,
        userRole: 'owner',
        subject,
        description,
        category: category as any,
        priority: priority as any || 'medium',
        status: 'open'
      },
      include: {
        messages: true
      }
    })

    // Transform the data
    const transformedTicket = {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      responses: []
    }

    return NextResponse.json({
      success: true,
      data: transformedTicket
    })
  } catch (error) {
    console.error('Error creating owner support ticket:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create support ticket' },
      { status: 500 }
    )
  }
}
