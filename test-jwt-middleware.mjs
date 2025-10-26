import { jwtVerify } from 'jose';
import fs from 'fs';

async function testJWT() {
  try {
    // Read the token from the cookie file
    const cookieContent = fs.readFileSync('cookies-user.txt', 'utf8');
    const lines = cookieContent.split('\n');
    let token = null;
    
    for (const line of lines) {
      if (line.includes('auth_token')) {
        const parts = line.split('\t');
        token = parts[6]; // The token is in the 7th column
        break;
      }
    }
    
    if (!token) {
      console.log('No token found in cookie file');
      return;
    }
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
