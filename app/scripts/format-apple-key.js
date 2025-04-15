// scripts/format-apple-key.js
const fs = require('fs');
const path = require('path');

/**
 * This script takes an Apple private key (.p8 file) and formats it correctly
 * for use with the jsonwebtoken library.
 */

// Path to your downloaded Apple private key
const inputKeyPath = process.argv[2] || path.join(__dirname, 'AuthKey.p8');
const outputKeyPath = inputKeyPath.replace('.p8', '.formatted.p8');

try {
    // Read the key file
    let keyContent = fs.readFileSync(inputKeyPath, 'utf8');
    console.log(`Read key file from: ${inputKeyPath}`);

    // Remove any existing headers and footers
    keyContent = keyContent
        .replace('-----BEGIN PRIVATE KEY-----', '')
        .replace('-----END PRIVATE KEY-----', '')
        .replace(/\s+/g, '');

    // Format the key with proper headers and line breaks (PEM format)
    let formattedKey = '-----BEGIN PRIVATE KEY-----\n';

    // Add content in lines of 64 characters
    for (let i = 0; i < keyContent.length; i += 64) {
        formattedKey += keyContent.substring(i, i + 64) + '\n';
    }

    formattedKey += '-----END PRIVATE KEY-----';

    // Write the formatted key to a new file
    fs.writeFileSync(outputKeyPath, formattedKey);
    console.log(`Formatted key written to: ${outputKeyPath}`);
    console.log('You can now use this formatted key with the generate-apple-client-secret.js script');

} catch (error) {
    console.error('Error processing the key file:', error);
}