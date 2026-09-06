import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

let client;

/**
 * Retrieves the Gemini API Key strictly following Workspace Constitution Rule #1:
 * - Attempts to fetch from Google Cloud Secret Manager if configured
 * - Gracefully falls back to process.env.GEMINI_API_KEY for local development
 */
export async function getGeminiApiKey() {
  const secretName = process.env.GEMINI_SECRET_NAME || 'GEMINI_API_KEY';
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID;

  // Try GCP Secret Manager if project ID is available
  if (projectId) {
    try {
      if (!client) {
        client = new SecretManagerServiceClient();
      }
      const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
      const [version] = await client.accessSecretVersion({ name });
      const secretPayload = version.payload?.data?.toString();
      if (secretPayload) {
        console.log('[SecretManager] Successfully retrieved GEMINI_API_KEY from Secret Manager');
        return secretPayload.trim();
      }
    } catch (err) {
      console.warn(`[SecretManager] Could not fetch secret from Secret Manager: ${err.message}. Falling back to process.env.GEMINI_API_KEY.`);
    }
  }

  // Fallback to process.env.GEMINI_API_KEY
  const envKey = process.env.GEMINI_API_KEY;
  if (envKey && envKey.trim()) {
    console.log('[SecretManager] Using GEMINI_API_KEY from environment variables');
    return envKey.trim();
  }

  console.warn('[SecretManager] No Gemini API key found in Secret Manager or process.env.GEMINI_API_KEY');
  return null;
}
