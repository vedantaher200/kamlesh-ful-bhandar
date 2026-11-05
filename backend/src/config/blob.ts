import dotenv from 'dotenv';

dotenv.config();

/**
 * Returns sanitized BLOB_READ_WRITE_TOKEN from environment.
 * Strips accidental whitespace and surrounding quotes.
 */
export const getBlobToken = (): string => {
  return (process.env.BLOB_READ_WRITE_TOKEN || '')
    .trim()
    .replace(/^["']|["']$/g, '')
    .trim();
};

/**
 * Checks if Vercel Blob storage is configured on this environment.
 */
export const isBlobConfigured = (): boolean => {
  const token = getBlobToken();
  return Boolean(token && token.length > 10);
};

/**
 * Safe diagnostic status of Vercel Blob configuration without leaking secrets.
 */
export const getBlobDiagnostics = () => {
  const rawToken = getBlobToken();
  const rawStoreId = (process.env.BLOB_STORE_ID || '').trim().replace(/^["']|["']$/g, '');
  const hasWebhookKey = Boolean(process.env.BLOB_WEBHOOK_PUBLIC_KEY);

  return {
    isConfigured: Boolean(rawToken && rawToken.length > 10),
    hasToken: Boolean(rawToken),
    tokenLength: rawToken.length,
    tokenPrefix: rawToken ? `${rawToken.slice(0, 16)}***` : null,
    storeId: rawStoreId || null,
    hasWebhookPublicKey: hasWebhookKey
  };
};

