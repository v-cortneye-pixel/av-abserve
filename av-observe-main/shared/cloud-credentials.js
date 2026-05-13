import { KMSClient, DecryptCommand } from '@aws-sdk/client-kms';

// Simple Lambda-specific credentials handler
const kmsClient = new KMSClient({ region: process.env.AWS_REGION || 'us-west-2' });

// Decrypt KMS-encrypted environment variable
const decryptKey = async (encryptedValue) => {
    if (!encryptedValue || !encryptedValue.startsWith('AQICA')) {
        return encryptedValue; // Return as-is if not encrypted
    }
    
    try {
        const command = new DecryptCommand({
            CiphertextBlob: Buffer.from(encryptedValue, 'base64'),
            EncryptionContext: { 
                LambdaFunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME 
            }
        });
        const response = await kmsClient.send(command);
        return new TextDecoder().decode(response.Plaintext);
    } catch (error) {
        console.warn(`KMS decryption failed, using raw value: ${error.message}`);
        return encryptedValue;
    }
};

// Initialize all KMS-encrypted environment variables once
let initialized = false;
export const decodeCloudCredentials = async () => {
    if (initialized) return;    
    
    // Iterate through all environment variables and decrypt any that look like KMS encrypted values
    const decryptPromises = [];
    for (const [key, value] of Object.entries(process.env)) {
        // Check if the value looks like a KMS encrypted value (starts with 'AQICA')
        if (value && value.startsWith('AQICA')) {            
            decryptPromises.push(
                decryptKey(value).then(decryptedValue => {
                    process.env[key] = decryptedValue;
                }).catch(error => {
                    console.warn(`⚠ Failed to decrypt ${key}: ${error.message}`);
                })
            );
        }
    }
    
    // Wait for all decryptions to complete
    await Promise.all(decryptPromises);    
    
    initialized = true;
};
