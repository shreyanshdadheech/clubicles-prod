import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
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

    const { message } = await request.json()

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    // Verify the ticket belongs to the user
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: id,
        userId: decoded.id
      }
    })

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Add message to ticket
    const newMessage = await prisma.supportTicketMessage.create({
      data: {
        ticketId: id,
        senderType: 'user',
        senderId: decoded.id,
        message
      }
    })

    // Update ticket's updatedAt timestamp
    await prisma.supportTicket.update({
      where: { id: id },
      data: { updatedAt: new Date() }
    })

    // Transform the response
    const transformedMessage = {
      id: newMessage.id,
      ticketId: newMessage.ticketId,
      message: newMessage.message,
      isFromSupport: false,
      createdAt: newMessage.createdAt.toISOString()
    }

    return NextResponse.json({
      success: true,
      data: transformedMessage
    })
  } catch (error) {
    console.error('Error adding message to ticket:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add message' },
      { status: 500 }
    )
  }
}
