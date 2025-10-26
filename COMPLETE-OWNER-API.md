# Complete Space Owner Creation API

## Overview
The enhanced API endpoint `/api/admin/create-complete-owner` allows you to create space owner accounts with complete business information and payment details in a single atomic operation.

## Features
- ✅ Creates auth user with email verification enabled
- ✅ Creates space_owner database record  
- ✅ Optionally creates business information
- ✅ Optionally creates payment information
- ✅ Full rollback on any failure (atomic operation)
- ✅ Comprehensive error handling and logging

## Endpoint
```
POST /api/admin/create-complete-owner
```

## Request Body

### Required Fields
```json
{
  "email": "string",
  "password": "string", 
  "first_name": "string"
}
```

### Optional Fields
```json
{
  "last_name": "string",
  "business_info": {
    "business_name": "string",
    "business_type": "string",
    "gst_number": "string (optional)",
    "pan_number": "string",
    "business_address": "string",
    "business_city": "string",
    "business_state": "string",
    "business_pincode": "string"
  },
  "payment_info": {
    "bank_account_number": "string",
    "bank_ifsc_code": "string",
    "bank_account_holder_name": "string",
    "bank_name": "string",
    "upi_id": "string (optional)"
  }
}
```

## Example Requests

### 1. Basic Owner (No Business/Payment Info)
```json
{
  "email": "owner@example.com",
  "password": "SecurePass@123",
  "first_name": "John",
  "last_name": "Doe"
}
```

### 2. Owner with Business Info
```json
{
  "email": "business-owner@example.com",
  "password": "SecurePass@123",
  "first_name": "Priya",
  "last_name": "Sharma",
  "business_info": {
    "business_name": "Sharma Co-working Spaces",
    "business_type": "Co-working",
    "gst_number": "27AAPFU0939F1ZV",
    "pan_number": "AAPFU0939F",
    "business_address": "123 Business District, MG Road",
    "business_city": "Mumbai",
    "business_state": "Maharashtra",
    "business_pincode": "400001"
  }
}
```

### 3. Complete Owner (Business + Payment Info)
```json
{
  "email": "complete-owner@example.com",
  "password": "SecurePass@123",
  "first_name": "Rajesh",
  "last_name": "Kumar",
  "business_info": {
    "business_name": "Kumar Co-working Hub",
    "business_type": "Shared Office",
    "gst_number": "07AABCS1234N1Z5",
    "pan_number": "AABCS1234N",
    "business_address": "456 Tech Park Avenue",
    "business_city": "Bangalore",
    "business_state": "Karnataka",
    "business_pincode": "560001"
  },
  "payment_info": {
    "bank_account_number": "1234567890123456",
    "bank_ifsc_code": "HDFC0000123",
    "bank_account_holder_name": "Rajesh Kumar",
    "bank_name": "HDFC Bank",
    "upi_id": "rajesh@oksbi"
  }
}
```

## Response Format

### Success Response (201)
```json
{
  "message": "Complete space owner account created successfully",
  "auth_id": "uuid",
  "owner": {
    "id": "uuid",
    "auth_id": "uuid",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "membership_type": "grey",
    "premium_plan": "basic",
    "commission_rate": 10.00,
    "is_active": true,
    "onboarding_completed": false
  },
  "business": {
    "id": "uuid",
    "space_owner_id": "uuid",
    "business_name": "string",
    "business_type": "string",
    "gst_number": "string",
    "pan_number": "string",
    "business_address": "string",
    "business_city": "string",
    "business_state": "string",
    "business_pincode": "string",
    "verification_status": "pending"
  },
  "payment": {
    "id": "uuid",
    "space_owner_id": "uuid",
    "bank_account_number": "string",
    "bank_ifsc_code": "string",
    "bank_account_holder_name": "string",
    "bank_name": "string",
    "upi_id": "string"
  },
  "login_info": {
    "email": "string",
    "password": "string",
    "signin_url": "http://localhost:3001/signin"
  }
}
```

### Error Response (400/500)
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

## Database Tables Created

1. **Auth User**: Created via Supabase Auth Admin API
2. **space_owners**: Main owner record
3. **space_owner_business_info**: Business verification details (optional)
4. **space_owner_payment_info**: Payment processing details (optional)

## Rollback Strategy

If any step fails, the API automatically rolls back all previous operations:
1. Delete payment info (if created)
2. Delete business info (if created)  
3. Delete space_owner record
4. Delete auth user

This ensures data consistency and prevents partial records.

## Testing

Use the provided test script:
```bash
node create-complete-owner-test.js
```

This creates three test accounts:
- Basic owner (no business/payment)
- Owner with business info only
- Complete owner with business and payment info

## Authentication Flow

After creating an account:
1. User can immediately sign in at `/signin`
2. Email is already verified (email_confirm: true)
3. User will be redirected to `/owner` dashboard
4. Business and payment info is available for onboarding completion

## Integration Notes

- User metadata includes `user_type: 'space_owner'` for auth callback routing
- Business verification status defaults to 'pending'
- Commission rate defaults to 10.00%
- Membership type defaults to 'grey'
- Premium plan defaults to 'basic'
