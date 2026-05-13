import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
const envResult = dotenv.config({ path: join(__dirname, '../.env') });
if (!envResult) {
    console.warn('No .env file found. Make sure environment variables are set.');
}

const validateCredentials = (required, type) => {
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
        const errorMsg = `Missing ${type} credentials: ${missing.join(', ')}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
    }
};

export const getCredentials = (type) => {
    switch(type) {
        case 'qHttp':
            validateCredentials(['QSYS_USERNAME', 'QSYS_PASSWORD'], 'qHttp');
            return {
                username: process.env.QSYS_USERNAME,
                password: process.env.QSYS_PASSWORD
            };
        case 'qrc':
            validateCredentials(['QRC_USERNAME', 'QRC_PIN'], 'qrc');
            return {
                username: process.env.QRC_USERNAME,
                pin: process.env.QRC_PIN
            };
        case 'qrem':
            validateCredentials(['QSYS_TOKEN'], 'qrem');
            return {
                accessToken: process.env.QSYS_TOKEN
            };            
        case 'zoom':
            validateCredentials([
                'ZOOM_ACCOUNT_ID',
                'ZOOM_CLIENT_ID',
                'ZOOM_CLIENT_SECRET'
            ], 'Zoom');
            return {
                accountId: process.env.ZOOM_ACCOUNT_ID,
                clientId: process.env.ZOOM_CLIENT_ID,
                clientSecret: process.env.ZOOM_CLIENT_SECRET
            };
        case 'slack':
            validateCredentials([
                'SLACK_BOT_TOKEN'
            ], 'Slack');
            return {
                token: process.env.SLACK_BOT_TOKEN
            };
        case 'splunk':
            validateCredentials(['SPLUNK_TOKEN'], 'Splunk');
            return {
                token: process.env.SPLUNK_TOKEN
            };
        case 'domotz':
            validateCredentials([
                'DOMOTZ_KEY'
            ], 'Domotz');
            return {
                apiKey: process.env.DOMOTZ_KEY
            };
        case 'juniper':
            validateCredentials([
                'JUNIPER_USERNAME',
                'JUNIPER_PASSWORD'
            ], 'Juniper');
            return {
                username: process.env.JUNIPER_USERNAME,
                password: process.env.JUNIPER_PASSWORD
            };
        case 'google':
            validateCredentials([
                'GOOGLE_KEY',
                'GOOGLE_CLIENT_EMAIL'
            ], 'Google');
            
            // Properly format the private key
            let privateKey = process.env.GOOGLE_KEY;
            
            // Handle different key formats
            if (privateKey.includes('\\n')) {
                privateKey = privateKey.replace(/\\n/g, '\n');
            }
            
            // Ensure proper PEM format
            if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
                // If it's a raw key without headers, add them
                if (!privateKey.includes('-----BEGIN')) {
                    privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
                }
            }
            
            return {
                privateKey: privateKey,
                clientEmail: process.env.GOOGLE_CLIENT_EMAIL
            };
        case 'microsoft':
            validateCredentials([
                'MICROSOFT_SECRET_VALUE'
            ], 'Microsoft');
            return {
                clientSecret: process.env.MICROSOFT_SECRET_VALUE,
                clientId: '351ce072-2b29-46a8-9bc3-1248b8f1e242'  // Use the working client_id from curl
            };
        default:
            throw new Error(`Unknown credential type: ${type}`);
    }
};