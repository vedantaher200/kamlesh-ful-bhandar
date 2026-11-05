import { Request, Response } from 'express';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { put } from '@vercel/blob';
import { getBlobToken, isBlobConfigured } from '../config/blob.js';
import { cloudinary, isCloudinaryConfigured, initCloudinary } from '../config/cloudinary.js';

/**
 * Uploads an in-memory buffer to Cloudinary using direct base64 data URI upload.
 * Preserved for backwards compatibility with existing systems and legacy fallback.
 */
export const uploadToCloudinary = (
  buffer: Buffer,
  mimetype?: string
): Promise<{ secure_url: string; public_id: string; format?: string }> => {
  return new Promise((resolve, reject) => {
    initCloudinary();

    if (!isCloudinaryConfigured()) {
      return reject(
        new Error(
          'Cloudinary is not configured. Please ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in environment variables.'
        )
      );
    }

    const mime = mimetype || 'image/jpeg';
    const base64Data = `data:${mime};base64,${buffer.toString('base64')}`;

    cloudinary.uploader.upload(
      base64Data,
      {
        folder: 'kamlesh-ful-bhandar',
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        timeout: 25000
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary Upload Error]:', error);
          reject(error);
        } else if (!result || !result.secure_url) {
          reject(new Error('Cloudinary returned an empty response.'));
        } else {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            format: result.format
          });
        }
      }
    );
  });
};

/**
 * Express handler for generating client upload tokens for Vercel Blob.
 * Protected by authenticateAdmin middleware.
 * Called by @vercel/blob/client upload() from browser.
 */
export const handleBlobUploadToken = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isBlobConfigured()) {
      res.status(503).json({
        success: false,
        message: 'Vercel Blob storage is not configured. BLOB_READ_WRITE_TOKEN is missing.'
      });
      return;
    }

    const body = req.body as HandleUploadBody;
    const token = getBlobToken();

    const jsonResponse = await handleUpload({
      body,
      request: req,
      token,
      onBeforeGenerateToken: async (pathname: string, clientPayload: string | null) => {
        const adminId = (req as any).user?.id || 'admin';
        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'image/svg+xml'
          ],
          maximumSizeInBytes: 15 * 1024 * 1024, // 15MB
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            userId: adminId,
            pathname,
            timestamp: Date.now()
          })
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('[Vercel Blob Upload Finished]:', blob.url, tokenPayload);
      }
    });

    res.status(200).json(jsonResponse);
  } catch (error: any) {
    console.error('[Blob HandleUpload Error]:', error);
    res.status(400).json({
      error: error?.message || 'Failed to generate Blob upload token'
    });
  }
};

/**
 * Express handler for direct multipart upload (POST /api/upload and POST /api/upload/image).
 * Used for direct server uploads, automated test harnesses, and backwards compatibility.
 */
export const handleImageUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image file was received in the request.' });
      return;
    }

    let finalUrl = '';
    let finalPublicId: string | null = null;
    let uploadSource = 'vercel-blob';
    let warningMessage: string | null = null;

    // 1. Primary: Upload to Vercel Blob store
    if (isBlobConfigured()) {
      try {
        const originalName = req.file.originalname || `upload-${Date.now()}.jpg`;
        const sanitizedFilename = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const token = getBlobToken();

        const blob = await put(sanitizedFilename, req.file.buffer, {
          access: 'public',
          token,
          addRandomSuffix: true,
          contentType: req.file.mimetype || 'image/jpeg'
        });

        finalUrl = blob.url;
        finalPublicId = blob.pathname;
        uploadSource = 'vercel-blob';
      } catch (blobErr: any) {
        console.warn('[Vercel Blob Direct Put Failed, falling back]:', blobErr?.message || blobErr);
        warningMessage = `Blob storage notice: ${blobErr?.message || 'Failed'}.`;
      }
    }

    // 2. Secondary fallback: Cloudinary
    if (!finalUrl && isCloudinaryConfigured()) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
        finalUrl = result.secure_url;
        finalPublicId = result.public_id;
        uploadSource = 'cloudinary';
      } catch (cloudErr: any) {
        console.warn('[Cloudinary Fallback Error]:', cloudErr?.message || cloudErr);
      }
    }

    // 3. Resilient Database / Data-URI fallback
    if (!finalUrl) {
      const mime = req.file.mimetype || 'image/jpeg';
      finalUrl = `data:${mime};base64,${req.file.buffer.toString('base64')}`;
      finalPublicId = null;
      uploadSource = 'database-storage';
    }

    res.json({
      success: true,
      url: finalUrl,
      publicId: finalPublicId,
      format: req.file.mimetype,
      source: uploadSource,
      warning: warningMessage
    });
  } catch (error: any) {
    console.error('Upload handling error:', error);
    const errorMsg = error?.message || (typeof error === 'string' ? error : 'Image upload failed');
    res.status(500).json({
      success: false,
      message: `Image upload failed: ${errorMsg}`,
      error: errorMsg
    });
  }
};
