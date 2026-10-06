import { Request, Response } from 'express';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import fs from 'fs';

export const handleImageUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded.' });
      return;
    }

    const filePath = req.file.path;

    if (isCloudinaryConfigured) {
      // Upload to Cloudinary
      try {
        const result = await cloudinary.uploader.upload(filePath, {
          folder: 'kamlesh-ful-bhandar',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }]
        });

        // Clean up temporary local file after successful Cloudinary upload
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        res.json({
          success: true,
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          source: 'cloudinary'
        });
        return;
      } catch (cloudErr: any) {
        console.error('Cloudinary upload error, using local fallback:', cloudErr.message);
        // Fall back to local URL
      }
    }

    // Local static fallback
    const localUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      url: localUrl,
      publicId: req.file.filename,
      source: 'local'
    });
  } catch (error: any) {
    console.error('Upload handling error:', error);
    res.status(500).json({ success: false, message: 'Failed to process file upload.', error: error.message });
  }
};
