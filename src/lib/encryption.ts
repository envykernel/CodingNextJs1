import crypto from 'crypto'

// Encryption configuration
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16 // For AES, this is always 16 bytes
const KEY_LENGTH = 32 // 256 bits
const ITERATIONS = 100000 // Number of PBKDF2 iterations

/**
 * Derives an encryption key from the master key and organization ID
 */
function deriveKey(masterKey: string, organizationId: number): Buffer {
  const salt = Buffer.from(organizationId.toString()).toString('hex')

  return crypto.pbkdf2Sync(masterKey, salt, ITERATIONS, KEY_LENGTH, 'sha512')
}

/**
 * Encrypts sensitive data using AES-256-GCM
 * Returns a single string containing IV + encrypted data + auth tag
 */
export function encryptData(data: string, organizationId: number, masterKey: string): string {
  if (!data) return ''

  const iv = crypto.randomBytes(IV_LENGTH)
  const key = deriveKey(masterKey, organizationId)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  // Combine IV + encrypted data + auth tag into a single base64 string
  const combined = Buffer.concat([iv, encrypted, tag])

  return combined.toString('base64')
}

/**
 * Decrypts sensitive data using AES-256-GCM
 * Expects a single string containing IV + encrypted data + auth tag
 */
export function decryptData(encryptedData: string, organizationId: number, masterKey: string): string {
  if (!encryptedData) return ''

  try {
    const combined = Buffer.from(encryptedData, 'base64')

    // Extract IV, encrypted data, and auth tag
    const iv = combined.subarray(0, IV_LENGTH)
    const tag = combined.subarray(combined.length - 16) // Last 16 bytes are the auth tag
    const encrypted = combined.subarray(IV_LENGTH, combined.length - 16) // Everything in between

    const key = deriveKey(masterKey, organizationId)
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)

    decipher.setAuthTag(tag)

    return decipher.update(encrypted) + decipher.final('utf8')
  } catch (error) {
    console.error('Decryption error:', error)

    return ''
  }
}
