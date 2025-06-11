import arcjet, { detectBot, shield, tokenBucket } from '@arcjet/next'
import { isSpoofedBot } from '@arcjet/inspect'

// Initialize Arcjet with security rules
export const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  characteristics: ['ip.src'], // Track requests by IP
  rules: [
    // Shield protects against common attacks like SQL injection
    shield({ mode: 'LIVE' }),

    // Bot detection rule - more strict for patient data
    detectBot({
      mode: 'LIVE',
      allow: [
        'CATEGORY:SEARCH_ENGINE', // Allow search engines
        'CATEGORY:MONITOR', // Allow monitoring services
        'CATEGORY:PREVIEW' // Allow link previews
      ]
    }),

    // Rate limiting - 50 requests per minute
    tokenBucket({
      mode: 'LIVE',
      refillRate: 50, // Refill 50 tokens per interval
      interval: 60, // Refill every 60 seconds
      capacity: 50 // Bucket capacity of 50 tokens
    })
  ]
})

// Helper function to handle Arcjet protection
export async function protectWithArcjet(req: Request, requested: number = 1) {
  const decision = await aj.protect(req, { requested })

  console.log('Arcjet decision', decision)

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return {
        error: 'Too Many Requests',
        reason: decision.reason,
        status: 429
      }
    } else if (decision.reason.isBot()) {
      return {
        error: 'Access Denied',
        reason: decision.reason,
        status: 403
      }
    } else {
      return {
        error: 'Forbidden',
        reason: decision.reason,
        status: 403
      }
    }
  }

  // Check for spoofed bots
  if (decision.results.some(isSpoofedBot)) {
    return {
      error: 'Access Denied',
      reason: 'Spoofed bot detected',
      status: 403
    }
  }

  return null // No protection issues
}
