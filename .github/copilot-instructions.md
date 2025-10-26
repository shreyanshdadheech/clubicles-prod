# Clubicles AI Coding Instructions

## Project Overview

Clubicles is a Next.js 15 co-working space booking platform with multi-tenant architecture supporting users, space owners, and admins. The app features VIBGYOR professional analytics, Razorpay payments, QR code booking redemption, and comprehensive business management.

## Key Architecture Patterns

### Database & Authentication

- **Supabase**: PostgreSQL with Row Level Security (RLS) policies for multi-tenancy
- **RLS Critical**: Users see only their data, owners see their spaces/bookings, admins see all
- **Service Role Bypass**: Use `src/lib/supabase.ts` for admin operations that bypass RLS
- **Auth Flow**: Supabase auth with middleware at `src/middleware.ts` protecting all routes

### VIBGYOR System (Unique Feature)

- Professional role tracking: 10 colors (violet, indigo, blue, green, yellow, orange, red, grey, white, black)
- Automatic counter increments in spaces table when bookings are made
- Database trigger handles VIBGYOR insertions (see `vibgyor-trigger.sql`)
- Type definitions in `src/types/index.ts` for `ProfessionalRole` and `VIBGYORRole`

### Multi-Role User System

```typescript
// Three main user types with separate tables:
// - users (regular customers)
// - space_owners (business owners)
// - admins (platform management)
// Each linked via auth_id to auth.users
```

## Critical Development Patterns

### API Routes Structure

```
/api/bookings/ - Booking CRUD with VIBGYOR tracking
/api/owner/ - Space owner operations (RLS enforced)
/api/admin/ - Admin operations (service role)
/api/payment/ - Razorpay integration
```

### Database Operations

- **Always use RLS-aware queries** - data automatically filtered by policies
- **Space owners**: Only see their `business_id` linked data
- **Users**: Only see their `user_id` linked bookings
- **QR Codes**: Generated with redemption codes for booking validation

### Component Organization

```
src/components/
  ├── admin/ - Admin-specific components
  ├── owner/ - Space owner components
  ├── dashboard/ - Role-specific dashboards
  └── booking/ - Booking flow components
```

## Essential Commands & Setup

### Development

```bash
npm run dev                    # Start dev server
npm run supabase:pull         # Sync types from Supabase
```

### Database Setup

1. Run SQL files in order: `support-schema.sql`, `subscription-schema.sql`, `policies.sql`
2. Create admin user via `admin-setup.sql`
3. VIBGYOR triggers are in `vibgyor-trigger.sql`

### Environment Variables

- Copy `env.example` to `.env.local`
- Required: Supabase URL/keys, Razorpay keys
- Service role key needed for admin operations

## Production Considerations

### No Mock Data

- Remove all references to `src/data/mock-data.json` in production
- All data must come from Supabase with proper RLS policies
- Test scripts in root directory are for development only

### Security

- RLS policies handle all data access control
- Middleware enforces authentication on all routes
- Service role operations isolated in admin APIs
- QR codes contain encrypted booking data

## Common Debugging

- Check RLS policies if users can't see expected data
- Verify `auth_id` linkage between auth.users and application tables
- VIBGYOR counters increment via database triggers, not application logic
- Use `src/lib/supabase/server.ts` for server-side operations with user context
