import { Request, Response } from 'express';
import { cloudinary, isCloudinaryConfigured, initCloudinary } from '../config/cloudinary.js';

/**
 * Uploads an in-memory buffer to Cloudinary using direct base64 data URI upload.
 * This avoids stream pipe issues, socket hangs, and unhandled stream errors in serverless runtimes.
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
 * Express handler for POST /api/upload and POST /api/upload/image
 */
export const handleImageUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image file was received in the request.' });
      return;
    }

    if (!isCloudinaryConfigured()) {
      res.status(503).json({
        success: false,
        message:
          'Image storage is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Vercel environment variables before uploading.'
      });
      return;
    }

    const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);

    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      source: 'cloudinary'
    });
  } catch (error: any) {
    console.error('Upload handling error:', error);
    const errorMsg = error?.message || (typeof error === 'string' ? error : 'Image upload failed');
    res.status(502).json({
      success: false,
      message: `Image upload failed: ${errorMsg}. Please verify your Cloudinary configuration.`,
      error: errorMsg
    });
  }
};
