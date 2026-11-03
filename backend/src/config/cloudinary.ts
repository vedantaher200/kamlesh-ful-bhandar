import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Initializes Cloudinary configuration with trimmed environment variables,
 * stripping accidental outer quotes or whitespace.
 */
export const initCloudinary = () => {
  const cloud_name = (process.env.CLOUDINARY_CLOUD_NAME || '').trim().replace(/^["']|["']$/g, '');
  let api_key = (process.env.CLOUDINARY_API_KEY || '').trim().replace(/^["']|["']$/g, '');
  let api_secret = (process.env.CLOUDINARY_API_SECRET || '').trim().replace(/^["']|["']$/g, '');
  const cloudinary_url = (process.env.CLOUDINARY_URL || '').trim().replace(/^["']|["']$/g, '');

  if (cloudinary_url) {
    cloudinary.config({
      cloudinary_url,
      secure: true
    });
  }

  // Auto-correct if API Key and Secret are accidentally swapped
  if (/^[a-zA-Z0-9_-]{20,}$/.test(api_key) && /^\d+$/.test(api_secret)) {
    console.warn('[Cloudinary] Correcting swapped API Key and Secret configuration');
    const temp = api_key;
    api_key = api_secret;
    api_secret = temp;
  }

  if (cloud_name && api_key && api_secret) {
    cloudinary.config({
      cloud_name,
      api_key,
      api_secret,
      secure: true
    });
  }
};

// Initial setup on module load
initCloudinary();

/**
 * Checks if Cloudinary is configured with valid credentials.
 */
export const isCloudinaryConfigured = (): boolean => {
  initCloudinary();
  const cfg = cloudinary.config();
  return Boolean(cfg.cloud_name && cfg.api_key && cfg.api_secret);
};

/**
 * Safe diagnostic status of Cloudinary configuration without leaking secrets.
 */
export const getCloudinaryDiagnostics = () => {
  initCloudinary();
  const cfg = cloudinary.config();
  const rawCloud = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
  const rawKey = (process.env.CLOUDINARY_API_KEY || '').trim();
  const rawSecret = (process.env.CLOUDINARY_API_SECRET || '').trim();
  const rawUrl = (process.env.CLOUDINARY_URL || '').trim();

  return {
    isConfigured: Boolean(cfg.cloud_name && cfg.api_key && cfg.api_secret),
    activeCloudName: cfg.cloud_name || null,
    hasCloudName: Boolean(rawCloud),
    cloudNameMasked: rawCloud ? `${rawCloud.slice(0, 3)}***${rawCloud.slice(-2)}` : null,
    hasApiKey: Boolean(rawKey),
    apiKeyLength: rawKey.length,
    apiKeyMasked: rawKey ? `${rawKey.slice(0, 3)}***` : null,
    isKeyNumeric: /^\d+$/.test(rawKey),
    hasApiSecret: Boolean(rawSecret),
    apiSecretLength: rawSecret.length,
    apiSecretMasked: rawSecret ? `${rawSecret.slice(0, 3)}***` : null,
    isSecretNumeric: /^\d+$/.test(rawSecret),
    areKeyAndSecretSame: rawKey === rawSecret,
    hasCloudinaryUrl: Boolean(rawUrl)
  };
};

/**
 * Safely deletes an asset from Cloudinary by its public ID.
 */
export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  if (!isCloudinaryConfigured() || !publicId) return false;
  try {
    initCloudinary();
    const res = await cloudinary.uploader.destroy(publicId);
    return res.result === 'ok';
  } catch (err) {
    console.warn(`[Cloudinary] Failed to delete asset ${publicId}:`, err);
    return false;
  }
};

export { cloudinary };
