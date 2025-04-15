// scripts/generate-apple-client-secret.js
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

/**
 * Generate Apple Client Secret as a JWT token
 * 
 * Prerequisites:
 * 1. Private Key (.p8 file) from Apple Developer Account
 * 2. Team ID from Apple Developer Account
 * 3. Client ID (Service ID) from Apple Developer Account
 * 4. Key ID from the private key you created
 */

// Configuration - replace these with your values or use environment variables
const TEAM_ID = '59T9LR42SG';
const CLIENT_ID = 'com.scanpro.auth.servicer';
const KEY_ID = 'J54NNM5VJ6';
const PRIVATE_KEY_PATH = path.join(__dirname, 'AuthKey.p8');

// Load private key and ensure it's in the correct format
let privateKey;
try {
  privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');

  // Ensure the key has the correct headers if they're missing
  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey.replace(/\s/g, '')}\n-----END PRIVATE KEY-----`;
  }

  console.log('Private key loaded successfully');
} catch (error) {
  console.error(`Error reading private key file at ${PRIVATE_KEY_PATH}:`, error);
  process.exit(1);
}

// Prepare JWT payload
const payload = {
  iss: TEAM_ID,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 15777000, // ~6 months in seconds
  aud: 'https://appleid.apple.com',
  sub: CLIENT_ID,
};

// Sign the JWT
const signOptions = {
  algorithm: 'ES256',
  keyid: KEY_ID,
};

try {
  console.log('Attempting to sign JWT...');
  const token = jwt.sign(payload, privateKey, signOptions);
  console.log('\nGenerated Apple Client Secret (JWT Token):');
  console.log('\n' + token + '\n');
  console.log('This secret will expire in 180 days.');
  console.log('Add this value as APPLE_CLIENT_SECRET in your .env file.');
} catch (error) {
  console.error('Error generating JWT token:', error);

  // More detailed error handling and hints
  if (error.message.includes('secretOrPrivateKey must be an asymmetric key')) {
    console.error('\nHINT: The private key format appears to be incorrect.');
    console.error('Make sure your .p8 file from Apple is properly formatted with:');
    console.error('- -----BEGIN PRIVATE KEY----- header');
    console.error('- -----END PRIVATE KEY----- footer');
    console.error('- No extra spaces or line breaks');
  }

  // Print debugging information
  console.error('\nDebugging information:');
  console.error(`Team ID: ${TEAM_ID}`);
  console.error(`Client ID: ${CLIENT_ID}`);
  console.error(`Key ID: ${KEY_ID}`);
  console.error(`Private Key Path: ${PRIVATE_KEY_PATH}`);
  console.error('Private Key Format (first 20 chars):', privateKey.substring(0, 20) + '...');
}