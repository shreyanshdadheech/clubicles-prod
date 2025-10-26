# 🚀 Vercel Deployment Guide

## Prerequisites

1. **Resend API Key**: `re_QSLSJXqB_Po79iSdiKGUaxpew9QXWDfMH`
2. **Database URL**: Your production database connection string
3. **Razorpay Keys**: Your production Razorpay credentials

## Environment Variables for Vercel

Add these environment variables in your Vercel project settings:

### Required Environment Variables

```bash
# Database
DATABASE_URL="your-production-database-url"

# JWT Secret (use a strong, unique secret)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Razorpay (Production Keys)
NEXT_PUBLIC_RAZORPAY_KEY_ID="your-production-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-production-razorpay-secret"

# Resend Email Service
RESEND_API_KEY="re_QSLSJXqB_Po79iSdiKGUaxpew9QXWDfMH"

# Admin Configuration
ADMIN_EMAIL="admin@clubicles.com"

# App URL (Your Vercel domain)
APP_URL="https://your-app-name.vercel.app"
```

## Build Configuration

The project includes:
- `.npmrc` file with `legacy-peer-deps=true` to resolve React version conflicts
- `vercel.json` with proper Next.js build configuration

## Deployment Steps

1. **Push to GitHub**: Ensure all changes are pushed to your repository
2. **Set Environment Variables**: Add all required environment variables in Vercel dashboard
3. **Deploy**: Vercel will automatically build and deploy

## Post-Deployment

1. **Database Migration**: Run `npx prisma db push` to sync your production database
2. **Test Email System**: Verify that emails are being sent correctly
3. **Test Payment Flow**: Ensure Razorpay integration works in production

## Troubleshooting

### Build Failures
- Ensure all environment variables are set
- Check that the database is accessible from Vercel
- Verify that all API keys are valid

### Email Issues
- Verify Resend API key is correct
- Check that the domain is verified in Resend dashboard
- Test email endpoints manually

### Database Issues
- Ensure DATABASE_URL is correct
- Run database migrations if needed
- Check database connection limits

## Email System Features

✅ **Booking Confirmation Emails**: Sent automatically after successful bookings
✅ **Owner Signup Notifications**: Sent to space owners with admin CC
✅ **Payout Notifications**: Sent when admin processes payouts
✅ **Password Reset**: Available for users, owners, and admins

## Security Notes

- Use strong, unique JWT secrets in production
- Keep API keys secure and never commit them to version control
- Regularly rotate sensitive credentials
- Monitor email sending limits and costs
