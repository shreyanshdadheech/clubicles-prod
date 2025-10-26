# Booking Redemption & Review System Implementation Guide

## Overview
This implementation adds a comprehensive booking redemption and review system that ensures only users who have actually visited and redeemed their bookings can write reviews.

## Database Changes Required

Run these SQL commands in your Supabase SQL editor:

```sql
-- Add redemption columns to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS redemption_code VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS qr_code_data TEXT,
ADD COLUMN IF NOT EXISTS is_redeemed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS redeemed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS redeemed_by UUID REFERENCES space_owners(id);

-- Generate redemption codes for existing bookings
UPDATE public.bookings 
SET redemption_code = 
  'RC' || EXTRACT(year FROM created_at) || '-' || 
  LPAD(EXTRACT(doy FROM created_at)::text, 3, '0') || '-' ||
  LPAD(FLOOR(random() * 10000)::text, 4, '0')
WHERE redemption_code IS NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_redemption_code ON public.bookings(redemption_code);
CREATE INDEX IF NOT EXISTS idx_bookings_is_redeemed ON public.bookings(is_redeemed);
```

## New API Endpoints

### 1. Review Eligibility Check
```
GET /api/reviews/eligibility?space_id={space_id}
```
**Response:**
```json
{
  "eligible": true/false,
  "reason": "explanation",
  "action_required": "what user needs to do",
  "action_available": "create" | "edit",
  "existing_review": {...}, // if user has existing review
  "redeemed_bookings": [...] // user's redeemed bookings for this space
}
```

### 2. Booking QR Code Generation
```
POST /api/bookings/generate-qr
Body: { "booking_id": "uuid" }
```
**Response:**
```json
{
  "success": true,
  "qr_code_data": "data:image/png;base64,...",
  "redemption_code": "RC2025-123-4567"
}
```

### 3. Booking Redemption
```
POST /api/bookings/redeem
Body: { "redemption_code": "RC2025-123-4567" }
```
**Response:**
```json
{
  "success": true,
  "message": "Booking redeemed successfully",
  "booking": {
    "id": "uuid",
    "redemption_code": "RC2025-123-4567",
    "space_name": "Space Name",
    "date": "2025-01-15",
    "time": "09:00 - 17:00",
    "seats": 2,
    "user": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### 4. Redemption Code Validation
```
GET /api/bookings/redeem?code=RC2025-123-4567
```
**Response:**
```json
{
  "success": true,
  "valid": true,
  "booking": {
    "id": "uuid",
    "is_redeemed": false,
    "status": "confirmed",
    "space_name": "Space Name",
    // ... more booking details
  }
}
```

## Components Usage

### 1. Owner Redemption Portal
Add to owner dashboard:

```tsx
import { RedemptionPortal } from '@/components/owner/redemption-portal'

function OwnerDashboard() {
  return (
    <div>
      <RedemptionPortal 
        onRedemptionSuccess={(booking) => {
          // Handle successful redemption
          console.log('Booking redeemed:', booking)
        }}
      />
    </div>
  )
}
```

### 2. Review Eligibility Checker
Add to space detail pages:

```tsx
import { ReviewEligibilityChecker } from '@/components/reviews/review-eligibility-checker'

function SpaceDetailPage({ spaceId, spaceName }) {
  return (
    <div>
      {/* Other space content */}
      
      <ReviewEligibilityChecker 
        spaceId={spaceId}
        spaceName={spaceName}
        onReviewSubmitted={(review) => {
          // Handle review submission
          console.log('Review submitted:', review)
        }}
      />
    </div>
  )
}
```

## User Flow

### Booking Flow:
1. User books a space
2. System generates unique redemption code and QR code
3. User receives booking confirmation with redemption code
4. User can access QR code via booking details

### Redemption Flow:
1. User visits the space
2. Space owner scans QR code or enters redemption code
3. System validates code and shows booking details
4. Owner confirms redemption
5. Booking status changes to "redeemed"

### Review Flow:
1. User tries to write a review on space page
2. System checks if user has redeemed bookings for this space
3. If eligible: User can write/edit review
4. If not eligible: System shows requirements and next steps

## Key Features

✅ **Unique Redemption Codes**: Each booking gets a unique code (RC2025-123-4567 format)  
✅ **QR Code Generation**: Automatic QR code generation for easy scanning  
✅ **Owner Validation Portal**: Easy code validation and redemption interface  
✅ **Review Access Control**: Only redeemed booking users can write reviews  
✅ **Real-time Status Updates**: Booking status updates immediately upon redemption  
✅ **User Guidance**: Clear messaging about what users need to do  
✅ **Edit Existing Reviews**: Users can edit their reviews after writing them  

## Security Features

- Only authenticated users can write reviews
- Only space owners can redeem codes for their spaces
- Codes can only be redeemed once
- QR codes contain booking validation data
- All redemptions are logged with timestamp and redeemer info

## Integration Steps

1. **Database**: Run the SQL migration commands
2. **Owner Dashboard**: Add RedemptionPortal component
3. **Space Pages**: Add ReviewEligibilityChecker component  
4. **Booking Flow**: Update booking confirmation to show redemption codes
5. **User Profile**: Show QR codes in booking history

This system ensures review authenticity while providing a smooth user experience!