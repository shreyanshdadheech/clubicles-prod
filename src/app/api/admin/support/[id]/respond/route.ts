import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
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

    const { message, isInternal = false } = await request.json()

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    // Verify the ticket exists
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: id }
    })

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Add admin response to ticket
    const newMessage = await prisma.supportTicketMessage.create({
      data: {
        ticketId: id,
        senderType: 'admin',
        senderId: decoded.id,
        message,
        isInternal
      }
    })

    // Update ticket's updatedAt timestamp and status if needed
    const updateData: any = { updatedAt: new Date() }
    if (ticket.status === 'open') {
      updateData.status = 'in_progress'
    }

    await prisma.supportTicket.update({
      where: { id: id },
      data: updateData
    })

    // Transform the response
    const transformedMessage = {
      id: newMessage.id,
      ticketId: newMessage.ticketId,
      message: newMessage.message,
      isFromSupport: true,
      senderType: newMessage.senderType,
      senderId: newMessage.senderId,
      isInternal: newMessage.isInternal,
      createdAt: newMessage.createdAt.toISOString()
    }

    return NextResponse.json({
      success: true,
      data: transformedMessage
    })
  } catch (error) {
    console.error('Error adding admin response:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add response' },
      { status: 500 }
    )
  }
}
