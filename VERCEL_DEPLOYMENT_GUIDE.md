# 🚀 Vercel Deployment Guide for Clubicles

## Prerequisites

Before deploying to Vercel, ensure you have:

1. **MySQL Database**: Set up a production MySQL database (PlanetScale, Railway, or AWS RDS)
2. **Razorpay Account**: Production Razorpay keys
3. **Resend Account**: For email notifications
4. **Vercel Account**: Connected to your GitHub repository

## Environment Variables for Vercel

Add these environment variables in your Vercel project settings:

### Required Environment Variables

```bash
# Database (MySQL)
DATABASE_URL="mysql://username:password@host:port/database_name"

# Razorpay (Production Keys)
NEXT_PUBLIC_RAZORPAY_KEY_ID="your_production_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_production_razorpay_secret"

# Email Service (Resend)
RESEND_API_KEY="your_resend_api_key"
ADMIN_EMAIL="admin@clubicles.com"

# Application Configuration
NEXTAUTH_URL="https://your-app-name.vercel.app"
NEXTAUTH_SECRET="your_super_secret_jwt_key_change_this_in_production"
APP_URL="https://your-app-name.vercel.app"

# Node Environment
NODE_ENV="production"
```

### Optional Environment Variables

```bash
# Google Maps API (if using location services)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"

# Cloudinary (if using image uploads)
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
```

## Build Configuration

The project includes optimized configurations:

- ✅ `vercel.json` with proper Next.js build configuration
- ✅ `next.config.ts` with MySQL2 external package configuration
- ✅ Prisma client generation in `postinstall` script
- ✅ Image optimization settings

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
- ✅ Ensure all environment variables are set
- ✅ Check that the database is accessible from Vercel
- ✅ Verify that all API keys are valid
- ✅ Ensure MySQL2 is properly configured

### Email Issues
- ✅ Verify Resend API key is correct
- ✅ Check that the domain is verified in Resend dashboard
- ✅ Test email endpoints manually

### Database Issues
- ✅ Ensure DATABASE_URL is correct
- ✅ Run database migrations if needed
- ✅ Check database connection limits
- ✅ Verify MySQL connection string format

## Database Setup

For production, consider these MySQL providers:

1. **PlanetScale**: Serverless MySQL with branching
2. **Railway**: Simple MySQL hosting
3. **AWS RDS**: Enterprise-grade MySQL
4. **DigitalOcean**: Managed MySQL databases

## Security Considerations

- ✅ Use strong, unique secrets for `NEXTAUTH_SECRET`
- ✅ Never commit environment variables to git
- ✅ Use production Razorpay keys only
- ✅ Enable SSL/TLS for database connections
- ✅ Set up proper CORS policies

## Performance Optimization

- ✅ Enable Vercel's Edge Functions for API routes
- ✅ Use Vercel's Image Optimization
- ✅ Configure proper caching headers
- ✅ Monitor database connection pooling

## Monitoring

After deployment, monitor:

- ✅ Vercel Function logs
- ✅ Database performance
- ✅ API response times
- ✅ Error rates
- ✅ Payment success rates

## Support

If you encounter issues:

1. Check Vercel Function logs
2. Verify environment variables
3. Test database connectivity
4. Check API endpoint responses
5. Review payment gateway logs
