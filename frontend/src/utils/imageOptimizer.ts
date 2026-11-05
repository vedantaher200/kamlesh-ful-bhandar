/**
 * Browser-side image optimization.
 * Resizes large smartphone/camera photos (e.g. 5-20MB) to maximum 1920px dimensions
 * and compresses to high-quality JPEG/WEBP (~300-800KB) before uploading.
 * Retains crisp visual fidelity while ensuring fast uploads and zero timeout risk.
 * If the image is already small (<= 800KB) or an animated GIF / vector SVG, it returns untouched.
 */
export async function optimizeImage(file: File, maxWidth = 1920, quality = 0.88): Promise<File> {
  // If file is SVG or GIF or already under 800KB, keep as is
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return file;
  if (file.size <= 800 * 1024) return file;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const outputType = file.type === 'image/webp' ? 'image/webp' : 'image/jpeg';
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const extension = outputType === 'image/webp' ? '.webp' : '.jpg';
              const optimizedFileName = file.name.replace(/\.[^/.]+$/, '') + extension;
              const optimizedFile = new File([blob], optimizedFileName, {
                type: outputType,
                lastModified: Date.now()
              });
              resolve(optimizedFile);
            } else {
              resolve(file);
            }
          },
          outputType,
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
