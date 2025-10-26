import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@/types'

interface DatabaseUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  city?: string;
  professional_role?: string;
  roles: UserRole;
  user_role?: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  city?: string;
}

// Server-side authentication utilities
export async function getServerUser(request?: NextRequest): Promise<{ user: AuthUser | null; dbUser: any | null }> {
  try {
    // Get JWT token from cookies
    const token = request?.cookies.get('auth_token')?.value
    
    if (!token) {
      return { user: null, dbUser: null }
    }

    // Verify the token
    const decoded = jwt.verify(token, 'your-super-secret-jwt-key-change-this-in-production') as any
    
    if (!decoded) {
      return { user: null, dbUser: null }
    }

    // Get user data from database
    const dbUser = await prisma.user.findUnique({
      where: {
        id: decoded.id
      }
    })

    if (!dbUser) {
      return { user: null, dbUser: null }
    }

    const user: AuthUser = {
      id: dbUser.id,
      email: dbUser.email,
      first_name: dbUser.firstName || undefined,
      last_name: dbUser.lastName || undefined,
      phone: dbUser.phone || undefined,
      city: dbUser.city || undefined
    }

    return { user, dbUser }
  } catch (error) {
    console.error('Error in getServerUser:', error)
    return { user: null, dbUser: null }
  }
}

// Client-side authentication utilities (for client components)
export async function getClientUser(): Promise<{ user: AuthUser | null; dbUser: DatabaseUser | null }> {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    })

    if (!response.ok) {
      return { user: null, dbUser: null }
    }

    const data = await response.json()
    
    if (!data.success || !data.user) {
      return { user: null, dbUser: null }
    }

    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email,
      first_name: data.user.first_name,
      last_name: data.user.last_name,
      phone: data.user.phone,
      city: data.user.city
    }

    const dbUser: DatabaseUser = {
      id: data.user.id,
      email: data.user.email,
      first_name: data.user.first_name,
      last_name: data.user.last_name,
      phone: data.user.phone,
      city: data.user.city,
      professional_role: data.user.professional_role,
      roles: data.user.roles || 'user',
      user_role: data.user.roles || 'user',
      is_active: data.user.is_active !== false,
      created_at: data.user.created_at,
      updated_at: data.user.updated_at
    }

    return { user, dbUser }
  } catch (error) {
    console.error('Error in getClientUser:', error)
    return { user: null, dbUser: null }
  }
}

// Role checking utilities
export function hasRole(userRoles: UserRole, requiredRoles: UserRole | UserRole[]): boolean {
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(userRoles)
  }
  return userRoles === requiredRoles
}

export function isAdmin(userRoles: UserRole): boolean {
  return hasRole(userRoles, 'admin')
}

export function isOwner(userRoles: UserRole): boolean {
  return hasRole(userRoles, 'owner')
}

export function isUser(userRoles: UserRole): boolean {
  return hasRole(userRoles, 'user')
}

export function isModerator(userRoles: UserRole): boolean {
  return hasRole(userRoles, 'moderator')
}

export function canAccessOwnerFeatures(userRoles: UserRole): boolean {
  return hasRole(userRoles, ['owner', 'admin'])
}

export function canAccessAdminFeatures(userRoles: UserRole): boolean {
  return hasRole(userRoles, 'admin')
}

// Helper to get user's space ownership
export async function getUserSpaces(userId: string) {
  try {
    // Get space owner
    const spaceOwner = await prisma.spaceOwner.findFirst({
      where: {
        userId: userId
      }
    })

    if (!spaceOwner) {
      return []
    }

    // Get business info
    const businessInfo = await prisma.spaceOwnerBusinessInfo.findFirst({
      where: {
        spaceOwnerId: spaceOwner.id
      }
    })

    if (!businessInfo) {
      return []
    }

    // Get spaces
    const spaces = await prisma.space.findMany({
      where: {
        businessId: businessInfo.id
      },
      include: {
        businessInfo: {
          select: {
            businessName: true,
            spaceOwnerId: true
          }
        }
      }
    })

    return spaces || []
  } catch (error) {
    console.error('Error fetching user spaces:', error)
    return []
  }
}

// Helper to get user's bookings
export async function getUserBookings(userId: string) {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId: userId
      },
      include: {
        space: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return bookings || []
  } catch (error) {
    console.error('Error fetching user bookings:', error)
    return []
  }
}