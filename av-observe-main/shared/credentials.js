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
                // The historical value of this Azure App Registration client_id
                // was hardcoded; it is now overridable via env without changing
                // the default. Override with MICROSOFT_CLIENT_ID once rotated.
                clientId: process.env.MICROSOFT_CLIENT_ID || '351ce072-2b29-46a8-9bc3-1248b8f1e242'
            };
        case 'googleCalendar':
            validateCredentials([
                'GOOGLE_CALENDAR_KEY',
                'GOOGLE_CALENDAR_CLIENT_EMAIL'
            ], 'Google Calendar');
            
            // Properly format the private key
            let calendarPrivateKey = process.env.GOOGLE_CALENDAR_KEY;
            
            // Handle different key formats
            if (calendarPrivateKey.includes('\\n')) {
                calendarPrivateKey = calendarPrivateKey.replace(/\\n/g, '\n');
            }
            
            // Ensure proper PEM format
            if (!calendarPrivateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
                if (!calendarPrivateKey.includes('-----BEGIN')) {
                    calendarPrivateKey = `-----BEGIN PRIVATE KEY-----\n${calendarPrivateKey}\n-----END PRIVATE KEY-----`;
                }
            }
            
            return {
                privateKey: calendarPrivateKey,
                clientEmail: process.env.GOOGLE_CALENDAR_CLIENT_EMAIL
            };
        case 'googleMeet':
            validateCredentials([
                'GOOGLE_ADMIN_KEY',
                'GOOGLE_ADMIN_CLIENT_EMAIL',
                'GOOGLE_ADMIN_EMAIL'
            ], 'Google Meet (Admin SDK)');
            
            // Properly format the private key
            let meetPrivateKey = process.env.GOOGLE_ADMIN_KEY;
            
            // Handle different key formats
            if (meetPrivateKey.includes('\\n')) {
                meetPrivateKey = meetPrivateKey.replace(/\\n/g, '\n');
            }
            
            // Ensure proper PEM format
            if (!meetPrivateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
                if (!meetPrivateKey.includes('-----BEGIN')) {
                    meetPrivateKey = `-----BEGIN PRIVATE KEY-----\n${meetPrivateKey}\n-----END PRIVATE KEY-----`;
                }
            }
            
            return {
                privateKey: meetPrivateKey,
                clientEmail: process.env.GOOGLE_ADMIN_CLIENT_EMAIL,
                adminEmail: process.env.GOOGLE_ADMIN_EMAIL,
                customerId: process.env.GOOGLE_CUSTOMER_ID
            };
        default:
            throw new Error(`Unknown credential type: ${type}`);
    }
};