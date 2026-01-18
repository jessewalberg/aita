/**
 * Sanitizes user input to prevent prompt injection attacks.
 * Wraps user content in clear delimiters and strips injection attempts.
 */

// Patterns that indicate prompt injection attempts
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?)/gi,
  /disregard\s+(all\s+)?(previous|prior|above)/gi,
  /forget\s+(all\s+)?(previous|prior|above)/gi,
  /override\s+(system|instructions?)/gi,
  /new\s+instructions?:/gi,
  /system\s*prompt:/gi,
  /\[system\]/gi,
  /\[assistant\]/gi,
  /you\s+are\s+now/gi,
  /act\s+as\s+if/gi,
  /pretend\s+(you\s+are|to\s+be)/gi,
  /roleplay\s+as/gi,
  /from\s+now\s+on/gi,
  /ignore\s+everything/gi,
  /do\s+not\s+follow/gi,
  /bypass\s+(safety|restrictions?|rules?)/gi,
  /jailbreak/gi,
  /\bdan\b.*\bmode\b/gi,
  /respond\s+only\s+with/gi,
  /output\s+only/gi,
];

/**
 * Removes or neutralizes common prompt injection patterns
 */
function neutralizeInjections(text: string): string {
  let sanitized = text;

  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[filtered]");
  }

  return sanitized;
}

/**
 * Wraps user content with clear delimiters to help the model
 * distinguish between instructions and user content
 */
export function sanitizeUserInput(situation: string): string {
  // First neutralize any injection attempts
  const neutralized = neutralizeInjections(situation);

  // Wrap in clear delimiters
  return `<user_situation>
${neutralized}
</user_situation>`;
}

/**
 * Basic length and content validation
 */
export function validateSituation(situation: string): {
  valid: boolean;
  error?: string;
} {
  if (!situation || situation.trim().length < 50) {
    return { valid: false, error: "Situation must be at least 50 characters" };
  }

  if (situation.length > 5000) {
    return { valid: false, error: "Situation must be under 5000 characters" };
  }

  return { valid: true };
}
