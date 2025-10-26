import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { prisma } from './prisma'
import { UserRole, ProfessionalRole } from '@prisma/client'

export interface AuthUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  roles: UserRole
  isActive: boolean
  professionalRole?: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function generateToken(user: AuthUser): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
  
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    roles: user.roles,
    firstName: user.firstName,
    lastName: user.lastName,
    professionalRole: user.professionalRole,
    isActive: user.isActive
  })
    .setProtectedHeader({ alg: 'HS256' })
    // Remove .setExpirationTime('7d') to make token never expire
    .setIssuedAt()
    .sign(secret);
    
  return token;
}

export async function verifyToken(token: string): Promise<any> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      spaceOwner: true
    }
  })
}

export async function createUser(userData: {
  email: string
  password: string
  firstName?: string
  lastName?: string
  phone?: string
  city?: string
  professionalRole?: ProfessionalRole
  roles?: UserRole
}) {
  const hashedPassword = await hashPassword(userData.password)
  
  return prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
      roles: userData.roles || 'user'
    }
  })
}

export async function createSpaceOwner(userData: {
  userId: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  businessInfo?: {
    businessName: string
    businessType: string
    gstNumber?: string
    panNumber: string
    businessAddress: string
    businessCity: string
    businessState: string
    businessPincode: string
  }
  paymentInfo?: {
    bankAccountNumber: string
    bankIfscCode: string
    bankAccountHolderName: string
    bankName: string
    upiId?: string
  }
}) {
  return prisma.$transaction(async (tx) => {
    // Update user role to owner
    await tx.user.update({
      where: { id: userData.userId },
      data: { roles: 'owner' }
    })

    // Create space owner record
    const spaceOwner = await tx.spaceOwner.create({
      data: {
        userId: userData.userId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        approvalStatus: 'pending'
      }
    })

    // Create business info if provided
    if (userData.businessInfo) {
      await tx.spaceOwnerBusinessInfo.create({
        data: {
          spaceOwnerId: spaceOwner.id,
          ...userData.businessInfo
        }
      })
    }

    // Create payment info if provided
    if (userData.paymentInfo) {
      await tx.spaceOwnerPaymentInfo.create({
        data: {
          spaceOwnerId: spaceOwner.id,
          ...userData.paymentInfo
        }
      })
    }

    return spaceOwner
  })
}

export function hasRole(userRoles: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRoles)
}

export function isAdmin(userRoles: UserRole): boolean {
  return userRoles === 'admin'
}

export function isOwner(userRoles: UserRole): boolean {
  return userRoles === 'owner'
}

export function isUser(userRoles: UserRole): boolean {
  return userRoles === 'user'
}

export function isModerator(userRoles: UserRole): boolean {
  return userRoles === 'moderator'
}

export function isVIBGYORRole(userRoles: UserRole): boolean {
  const vibgyorRoles: UserRole[] = ['violet', 'indigo', 'blue', 'green', 'yellow', 'orange', 'red', 'grey', 'white', 'black']
  return vibgyorRoles.includes(userRoles)
}

export function canAccessOwnerFeatures(userRoles: UserRole): boolean {
  return isOwner(userRoles) || isAdmin(userRoles)
}

export function canAccessAdminFeatures(userRoles: UserRole): boolean {
  return isAdmin(userRoles)
}
