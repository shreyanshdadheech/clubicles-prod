# Clubicles - Technical Documentation

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Database Design](#database-design)
5. [API Documentation](#api-documentation)
6. [Authentication & Security](#authentication--security)
7. [Payment Integration](#payment-integration)
8. [Search Functionality](#search-functionality)
9. [VIBGYOR System](#vibgyor-system)
10. [Deployment](#deployment)

---

## Overview

**Clubicles** is a Next.js 15-based coworking space booking platform built with modern web technologies. It provides a multi-tenant architecture supporting three distinct user types: Individual Users, Space Owners, and Admins.

### System Capabilities
- **Scalability**: Handles 1000+ concurrent users
- **Performance**: Sub-second API response times
- **Security**: Row-Level Security (RLS) enforced at database level
- **Multi-tenancy**: Complete data isolation between user types
- **Real-time Analytics**: VIBGYOR professional distribution tracking
- **Payment Processing**: Razorpay integration with automated revenue distribution

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15.5.3 (App Router)
- **Language**: TypeScript 5.x
- **UI Library**: React 18.2.0
- **Styling**: Tailwind CSS 3.4.0
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **State Management**: React Context API
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes + Server Actions
- **ORM**: Prisma 6.16.2
- **Database**: MySQL 8.0+
- **Authentication**: NextAuth + Custom JWT
- **File Storage**: Local or cloud storage service

### Payment & External Services
- **Payment Gateway**: Razorpay 2.9.6
- **Email**: Resend or custom SMTP (for verification)
- **Maps**: Leaflet + React Leaflet
- **QR Codes**: qrcode 1.5.4

### Development Tools
- **Linting**: ESLint
- **Package Manager**: npm
- **Database Management**: Prisma Studio
- **Version Control**: Git

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Next.js  │  │  React   │  │  Tailwind │              │
│  │ Frontend │  │ Components│ │   CSS    │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   API & Middleware Layer                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    Auth      │  │   Routing   │  │   Server     │  │
│  │ Middleware   │  │ Middleware   │  │   Actions    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                     API Routes Layer                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  /api/   │  │  /api/   │  │  /api/   │             │
│  │  users   │  │ owners   │  │  admin   │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Database & External Services            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  MySQL   │  │ Razorpay │  │   File   │             │
│  │   DB     │  │ Payments │  │ Storage  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

### Folder Structure

```
clubicles-prod/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── (auth)/             # Auth routes
│   │   ├── (dashboard)/        # User dashboard
│   │   ├── (owner)/            # Owner dashboard
│   │   ├── (admin)/            # Admin panel
│   │   ├── api/                # API routes
│   │   └── spaces/             # Space discovery
│   ├── components/             # React components
│   │   ├── ui/                 # UI components
│   │   ├── shared/             # Shared components
│   │   └── layouts/            # Layout components
│   ├── contexts/               # React contexts
│   ├── lib/                    # Utilities & helpers
│   ├── types/                  # TypeScript types
│   └── hooks/                  # Custom React hooks
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
├── public/                      # Static assets
└── docs/                       # Documentation
```

---

## Database Design

### Database System
- **Type**: MySQL 8.0+
- **Connection Pooling**: Via Prisma and mysql2 driver
- **Migration Strategy**: Prisma Migrate
- **Security**: Application-level access control

### Core Tables

#### Users
```typescript
model User {
  id              String   @id @default(cuid())
  auth_id         String   @unique
  email           String   @unique
  first_name      String?
  last_name       String?
  phone           String?
  city            String?
  professional_role ProfessionalRole?
  roles           UserRole @default(user)
  is_active       Boolean  @default(true)
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
}
```

#### Space Owners
```typescript
model SpaceOwner {
  id                    String    @id @default(cuid())
  userId                String    @unique
  email                 String    @unique
  firstName             String?
  lastName              String?
  phone                 String?
  premiumPlan           PremiumPlan @default(basic)
  isActive              Boolean   @default(true)
  onboardingCompleted   Boolean   @default(false)
  commissionRate        Decimal   @default(10.00)
  premiumPaymentsEnabled Boolean  @default(false)
  approvalStatus        String    @default("pending")
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  
  businessInfo          SpaceOwnerBusinessInfo?
}
```

#### Spaces
```typescript
model Space {
  id              String   @id @default(cuid())
  businessId      String
  name            String
  description     String
  address         String
  city            String
  pincode         String
  latitude        Decimal?
  longitude       Decimal?
  totalSeats      Int
  availableSeats  Int      @default(0)
  pricePerHour    Decimal
  pricePerDay     Decimal
  amenities       Json     @default("[]")
  images          Json     @default("[]")
  
  // VIBGYOR Tracking
  violet          Int      @default(0)
  indigo           Int      @default(0)
  blue             Int      @default(0)
  green            Int      @default(0)
  yellow           Int      @default(0)
  orange           Int      @default(0)
  red              Int      @default(0)
  grey             Int      @default(0)
  white            Int      @default(0)
  black            Int      @default(0)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

#### Bookings
```typescript
model Booking {
  id                  String        @id @default(cuid())
  userId              String
  spaceId             String
  startTime           String
  endTime             String
  date                DateTime
  seatsBooked         Int
  baseAmount          Decimal
  taxAmount           Decimal?
  totalAmount         Decimal
  ownerPayout         Decimal
  platformCommission  Decimal?
  status              BookingStatus @default(pending)
  paymentId           String?
  bookingReference    String        @unique @default(cuid())
  
  // Redemption System
  redemptionCode      String?       @unique
  qrCodeData          String?
  isRedeemed          Boolean       @default(false)
  redeemedAt          DateTime?
  redeemedBy          String?
  
  // VIBGYOR
  roles               Json          @default("[]")
  
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt
}
```

### VIBGYOR Trigger System

The platform uses PostgreSQL triggers to automatically update VIBGYOR counters when bookings are confirmed:

```sql
CREATE OR REPLACE FUNCTION update_vibgyor_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' THEN
    UPDATE spaces 
    SET violet = violet + CASE WHEN 'violet' = ANY(NEW.roles::text[]) THEN 1 ELSE 0 END,
        indigo = indigo + CASE WHEN 'indigo' = ANY(NEW.roles::text[]) THEN 1 ELSE 0 END,
        blue = blue + CASE WHEN 'blue' = ANY(NEW.roles::text[]) THEN 1 ELSE 0 END,
        -- ... (all colors)
    WHERE id = NEW.space_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vibgyor_booking_trigger
    AFTER INSERT OR UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_vibgyor_counters();
```

---

## API Documentation

### API Structure

All APIs follow REST conventions and are prefixed with `/api/`:

```
/api/users/*          # User operations
/api/owner/*          # Space owner operations
/api/admin/*          # Admin operations
/api/spaces/*         # Space operations
/api/bookings/*       # Booking operations
/api/payment/*        # Payment operations
```

### Key Endpoints

#### Spaces API
```typescript
// Search and filter spaces
GET /api/spaces
Query Parameters:
  - search: string (searches in name, description, address, city, pincode, amenities)
  - city: string
  - minPrice: number
  - maxPrice: number
  - amenities: string[] (comma-separated)

Response:
{
  success: boolean
  spaces: Space[]
  count: number
}
```

#### Search Implementation
The search functionality now searches across multiple fields:
- Space name
- Description
- Address
- City
- Pincode
- Company name
- Amenities (JSON array)

**Implementation**: Client-side filtering after database fetch to support JSON array searches.

#### Bookings API
```typescript
// Create a booking
POST /api/bookings
Body: {
  spaceId: string
  userId: string
  date: string
  startTime: string
  endTime: string
  seatsBooked: number
}

Response: {
  success: boolean
  booking: Booking
  qrCodeData: string
}
```

---

## Authentication & Security

### Authentication Flow

1. **User Registration**: Create user in database with hashed password
2. **Profile Creation**: Backend creates corresponding profile (users/space_owners)
3. **Role Assignment**: Based on registration type
4. **JWT Token**: Issued by custom JWT implementation
5. **Session Management**: Cookies + Server-side validation

### Security Measures

1. **Row-Level Security (RLS)**: Database-level access control
2. **Role-Based Access**: Middleware validates user role
3. **JWT Validation**: Server-side token verification
4. **CSRF Protection**: SameSite cookies
5. **SQL Injection Prevention**: Prisma ORM parameterized queries
6. **XSS Protection**: React's built-in escaping

### Middleware Implementation

```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  const session = await getSession(req)
  
  if (!session && !publicRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/signin', req.url))
  }
  
  const userRole = await getUserRole(session?.user?.id)
  if (!hasAccess(req.nextUrl.pathname, userRole)) {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }
  
  return NextResponse.next()
}
```

---

## Payment Integration

### Razorpay Integration

#### Payment Flow
1. User confirms booking
2. Backend creates Razorpay order
3. Frontend opens payment modal
4. User completes payment
5. Webhook verifies payment
6. Booking confirmed
7. QR code generated

#### Revenue Distribution

```typescript
interface RevenueCalculation {
  baseAmount: number
  taxAmount: number
  totalAmount: number
  ownerPayout: number
  platformCommission: number
}

function calculateRevenue(baseAmount: number, taxRate: number, commission: number) {
  const taxAmount = baseAmount * (taxRate / 100)
  const totalAmount = baseAmount + taxAmount
  const platformCommission = baseAmount * (commission / 100)
  const ownerPayout = baseAmount - platformCommission
  
  return {
    baseAmount,
    taxAmount,
    totalAmount,
    ownerPayout,
    platformCommission
  }
}
```

---

## Search Functionality

### Search Implementation

The platform includes comprehensive search across:
- Space names
- Descriptions
- Addresses
- Cities
- Pincodes
- Amenities
- Professional categories

**Technical Implementation**:
- API fetches all matching spaces
- Client-side filtering for amenities (JSON arrays)
- Case-insensitive matching
- Partial word matching

### Search API

```typescript
GET /api/spaces?search=11/A

// Searches in:
// - name: contains "11/A"
// - description: contains "11/A"
// - address: contains "11/A"
// - city: contains "11/A"
// - pincode: contains "11/A"
// - companyName: contains "11/A"
// - amenities: array includes "11/A"
```

---

## VIBGYOR System

### Implementation

The VIBGYOR system tracks professional distribution in each space using 10 color categories:

1. **Violet**: Visionaries & Venture Capitalists
2. **Indigo**: IT & Industrialists
3. **Blue**: Branding & Marketing
4. **Green**: Green Footprint & EV
5. **Yellow**: Young Entrepreneurs (<23)
6. **Orange**: Oracle of Bharat
7. **Red**: Real Estate & Recreationists
8. **Grey**: Nomads (Multi-talented)
9. **White**: Policy Makers & Health
10. **Black**: Prefer Not to Say

### Data Flow

```
User Books → Payment Confirmed → VIBGYOR Counter Incremented
                                       ↓
                              Database Trigger Updates
                                       ↓
                              Space Dashboard Reflects Changes
```

---

## Deployment

### Environment Variables

```bash
# Database (MySQL)
DATABASE_URL=mysql://username:password@host:port/database_name

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_jwt_secret
```

### Build Process

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Build for production
npm run build

# Start production server
npm start
```

### Vercel Deployment

1. Connect repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

---

This technical documentation provides comprehensive details about the Clubicles platform architecture, implementation, and deployment processes.

