import { jwtVerify } from 'jose';
import fs from 'fs';

async function testJWT() {
  try {
    // Read the token from the cookie file
    const cookieContent = fs.readFileSync('cookies-user.txt', 'utf8');
    const tokenMatch = cookieContent.match(/auth_token=([^;]+)/);
    
    if (!tokenMatch) {
      console.log('No token found in cookie file');
      return;
    }
    
    const token = tokenMatch[1];
    console.log('Token found:', token.substring(0, 20) + '...');
    
    // Verify the token
    const secret = new TextEncoder().encode('your-super-secret-jwt-key-change-this-in-production');
    const { payload } = await jwtVerify(token, secret);
    console.log('Decoded payload:', payload);
    
  } catch (error) {
    console.error('JWT verification failed:', error);
  }
}

testJWT();
