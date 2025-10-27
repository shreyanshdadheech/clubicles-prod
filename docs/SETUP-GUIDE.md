# Clubicles Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Database Configuration](#database-configuration)
4. [MySQL Database Setup](#mysql-database-setup)
5. [Razorpay Configuration](#razorpay-configuration)
6. [Environment Variables](#environment-variables)
7. [Database Migration](#database-migration)
8. [Running the Application](#running-the-application)
9. [Testing Setup](#testing-setup)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js**: v18 or higher
- **npm**: v9 or higher (or yarn/pnpm)
- **Git**: Latest version
- **MySQL**: 8.0 or higher

### Accounts Needed
1. **Razorpay Account**: For payment processing
2. **Vercel Account**: For deployment (optional)

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/clubicles-prod.git
cd clubicles-prod
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 15
- React 18
- Prisma ORM
- Tailwind CSS
- Radix UI components
- Razorpay SDK
- And more...

### 3. Generate Prisma Client

```bash
npm run db:generate
```

---

## Database Configuration

### Option 1: Local MySQL

For local development, you can use a local MySQL instance.

### Option 2: Cloud MySQL

For production, use a managed MySQL service:
- AWS RDS MySQL
- Google Cloud SQL
- Azure Database for MySQL
- PlanetScale

---

## MySQL Setup

### 1. Create MySQL Database

Create a new database for the project:

```sql
CREATE DATABASE clubicles;
```

### 2. Configure Prisma

The Prisma schema is already configured for MySQL. The schema file includes:
- User models
- SpaceOwner models
- Space models with VIBGYOR tracking
- Booking models
- Review models
- Support ticket models

### 3. Run Prisma Migrations

```bash
# Push schema to database (creates tables automatically)
npm run db:push

# Or run migrations with history
npm run db:migrate
```

This will create all the necessary tables based on the Prisma schema.

### 4. Seed Database (Optional)

```bash
npm run db:seed
```

This will populate the database with sample data for development.

---

## Razorpay Configuration

### 1. Create Razorpay Account

1. Go to [razorpay.com](https://razorpay.com)
2. Sign up for a business account
3. Complete KYC verification

### 2. Get API Keys

1. Go to Settings > API Keys
2. Generate Key ID and Key Secret
3. Keep these secure

### 3. Configure Webhooks

1. Go to Settings > Webhooks
2. Add webhook URL: `https://your-domain.com/api/payment/webhook`
3. Select events: `payment.captured`, `payment.failed`

### 4. Test Mode (Optional)

For development:
1. Use Razorpay test keys
2. Test mode allows testing without real payments

---

## Environment Variables

### Create `.env.local` File

Create a `.env.local` file in the root directory:

```bash
# Database (MySQL)
DATABASE_URL=mysql://username:password@localhost:3306/clubicles

# Razorpay Configuration
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Admin Emails (comma-separated)
ADMIN_EMAILS=admin@clubicles.com,shreyanshdadheech@gmail.com
```

### Security Notes

- Never commit `.env.local` to Git
- Use `.env.example` as a template
- Keep JWT secret secure
- Rotate keys regularly
- Use strong passwords for database

---

## Database Migration

### Initial Migration

```bash
# Create initial migration
npx prisma migrate dev --name initial_migration

# This will:
# 1. Create migration files
# 2. Apply migrations to database
# 3. Generate Prisma Client
```

### Apply Migrations

```bash
# Apply pending migrations
npx prisma migrate deploy

# Or for development
npx prisma migrate dev
```

### View Database

```bash
# Open Prisma Studio (visual database editor)
npm run db:studio
```

This will open Prisma Studio at `http://localhost:5555`

---

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at:
- **URL**: `http://localhost:3000`
- **Admin Panel**: `http://localhost:3000/admin`
- **Owner Dashboard**: `http://localhost:3000/owner`
- **User Dashboard**: `http://localhost:3000/dashboard`

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Using Development Script

```bash
# Using the provided dev script
./dev.sh
```

---

## Testing Setup

### 1. Create Test Users

#### Individual User
- Email: `user@test.com`
- Password: `test123`
- Professional Role: Select any VIBGYOR category

#### Space Owner
- Email: `owner@test.com`
- Password: `test123`
- Business Info: Fill required fields

#### Admin
Add your email to `ADMIN_EMAILS` in `.env.local`

### 2. Test Key Flows

#### User Flow
1. Sign up as individual user
2. Complete email verification
3. Browse spaces
4. Create a booking
5. Complete payment
6. View QR code

#### Owner Flow
1. Sign up as space owner
2. Complete business information
3. Wait for admin approval (or auto-approve in dev)
4. Create a space
5. View bookings
6. Scan QR codes

#### Admin Flow
1. Login with admin email
2. View platform dashboard
3. Approve space owners
4. Manage tax configurations
5. View analytics

### 3. Payment Testing

**Razorpay Test Cards**:
- Success: `4111 1111 1111 1111`
- Failure: `4111 1111 1111 4444`
- CVV: Any 3 digits
- Expiry: Any future date

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Error

```bash
Error: Can't reach database server
```

**Solution**:
- Check `DATABASE_URL` in `.env.local`
- Verify MySQL server is running
- Check network firewall
- Verify database credentials are correct

#### 2. Prisma Client Not Generated

```bash
Error: PrismaClient is not generated
```

**Solution**:
```bash
npm run db:generate
# Or
npx prisma generate
```

#### 3. Migration Conflicts

```bash
Error: Migration conflict detected
```

**Solution**:
```bash
# Reset database (DEV ONLY)
npx prisma migrate reset

# Or create new migration
npx prisma migrate dev
```

#### 4. Authentication Errors

```bash
Error: Invalid JWT token
```

**Solution**:
- Clear browser cookies
- Check JWT secret in environment variables
- Verify `.env.local` variables
- Regenerate JWT tokens

#### 5. Payment Gateway Errors

```bash
Error: Razorpay initialization failed
```

**Solution**:
- Verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- Check Razorpay account is active
- Use correct keys (test vs production)

### Debug Mode

Enable debug logging:

```bash
# In .env.local
DEBUG=*

# Or for specific modules
DEBUG=prisma:*
```

### Check Logs

```bash
# View database logs
# Check MySQL error logs
# For Windows: C:\ProgramData\MySQL\MySQL Server 8.0\Data\hostname.err
# For Linux: /var/log/mysql/error.log

# View application logs
# Check terminal output or server logs
```

---

## Additional Configuration

### Email Configuration

Configure SMTP for custom emails:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Storage Configuration

Configure file storage for uploads:

**Option 1: Local Storage**
- Files stored in `public/uploads/` directory
- Configure in environment variables

**Option 2: Cloud Storage**
- AWS S3, Google Cloud Storage, or Azure Blob Storage
- Set up buckets for:
  - `space-images` (public access)
  - `user-avatars` (private access)

### Analytics

Enable Google Analytics (optional):

```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## Production Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Razorpay in production mode
- [ ] Email SMTP configured
- [ ] Admin users configured
- [ ] SSL certificates installed
- [ ] Error monitoring set up
- [ ] Backup strategy in place
- [ ] Performance testing completed
- [ ] Security audit completed

---

## Getting Help

### Documentation
- PRD: `docs/PRD-CLUBICLES.md`
- Technical Docs: `docs/TECHNICAL-DOCUMENTATION.md`
- Architecture: `docs/FLOWCHARTS-ARCHITECTURE.md`

### Support
- GitHub Issues: [Create an issue]
- Email: support@clubicles.com
- Documentation: `/docs` folder

---

This setup guide provides step-by-step instructions to get the Clubicles platform up and running in both development and production environments.

