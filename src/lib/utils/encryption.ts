import crypto from 'crypto';

// Use a fixed key from environment variable or generate from a base key
// In production, this should be a strong, environment-specific key
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-development-key-change-in-production';

// Normalize key to 32 bytes for AES-256
function getNormalizedKey(): Buffer {
  const hash = crypto.createHash('sha256');
  hash.update(ENCRYPTION_KEY);
  return hash.digest();
}

export function encryptValue(value: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', getNormalizedKey(), iv);

  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Return IV + encrypted data (IV is not secret, just needed for decryption)
  return `${iv.toString('hex')}:${encrypted}`;
}

export function decryptValue(encrypted: string): string {
  try {
    const [ivHex, encryptedData] = encrypted.split(':');

    if (!ivHex || !encryptedData) {
      throw new Error('Invalid encrypted value format');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', getNormalizedKey(), iv);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt value');
  }
}
