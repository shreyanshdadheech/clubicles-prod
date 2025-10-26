# Test Space Owner Creation Commands

## Using curl (replace localhost:3001 with your actual server URL)

```bash
# Create the test space owner account
curl -X POST "http://localhost:3001/api/admin/create-test-owner" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "papa@example.com",
    "password": "oyepapaji",
    "first_name": "Test", 
    "last_name": "Owner"
  }'
```

## Using Node.js script

```bash
node scripts/create-test-owner.js
```

## Login Details

- **Email**: papa@example.com  
- **Password**: oyepapaji
- **First Name**: Test
- **Last Name**: Owner

## Test the account

1. Go to http://localhost:3001/signin
2. Switch to "Space Owner" tab  
3. Login with the credentials above
4. Should redirect to `/owner` dashboard

## API Response

The API returns:
- `auth_id`: Supabase authentication user ID
- `owner`: Complete space owner record from database
- `login_info`: Ready-to-use login credentials

## For Production

Replace `localhost:3001` with your production URL:

```bash
curl -X POST "https://your-domain.com/api/admin/create-test-owner" \
  -H "Content-Type: application/json" \
  -d '{"email":"test-owner@example.com","password":"SecurePassword123!","first_name":"Test","last_name":"Owner"}'
```
