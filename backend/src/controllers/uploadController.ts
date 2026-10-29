import { Request, Response } from 'express';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { Readable } from 'stream';

const uploadToCloudinary = (buffer: Buffer, mimetype: string) => new Promise<any>((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream({
    folder: 'kamlesh-ful-bhandar',
    resource_type: 'image',
    format: mimetype === 'image/png' ? 'png' : mimetype === 'image/webp' ? 'webp' : 'jpg',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }]
  }, (error, result) => error ? reject(error) : resolve(result));
  Readable.from(buffer).pipe(stream);
});

export const handleImageUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded.' });
      return;
    }

    if (!isCloudinaryConfigured) {
      res.status(503).json({ success: false, message: 'Image storage is not configured. Set the Cloudinary environment variables before uploading.' });
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
    res.status(502).json({ success: false, message: 'Image upload failed. Please retry; no product was saved.' });
  }
};
