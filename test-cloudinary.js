// test-cloudinary.js
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

console.log('Starting Cloudinary Test...');

// Check if credentials are loaded
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('ERROR: Cloudinary credentials are not loaded from .env file.');
    process.exit(1);
}

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloudinary configured. Attempting to upload test.txt...');

// Perform the upload
cloudinary.uploader.upload('./test.txt', { folder: 'test_uploads' })
    .then(result => {
        console.log('SUCCESS! Upload worked.');
        console.log('Result:', result);
        // Clean up the test file from Cloudinary
        return cloudinary.uploader.destroy(result.public_id);
    })
    .then(destroyResult => {
        console.log('Test file on Cloudinary deleted.');
        console.log('Destroy Result:', destroyResult);
    })
    .catch(error => {
        console.error('FAILURE! Upload failed.');
        console.error('Full Error Object:', error);
    });