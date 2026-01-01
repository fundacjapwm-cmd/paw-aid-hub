/**
 * Image compression and resizing utility
 * Compresses images to reduce file size and optionally resizes them
 */

interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/webp' | 'image/png';
}

const DEFAULT_OPTIONS: CompressOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.8,
  format: 'image/webp',
};

/**
 * Creates an image element from a file or blob
 */
const createImageFromFile = (file: File | Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

/**
 * Calculates new dimensions while maintaining aspect ratio
 */
const calculateDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  let width = originalWidth;
  let height = originalHeight;

  // Only resize if image is larger than max dimensions
  if (width > maxWidth || height > maxHeight) {
    const widthRatio = maxWidth / width;
    const heightRatio = maxHeight / height;
    const ratio = Math.min(widthRatio, heightRatio);
    
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  return { width, height };
};

/**
 * Compresses and optionally resizes an image file
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns A compressed Blob
 */
export const compressImage = async (
  file: File | Blob,
  options: CompressOptions = {}
): Promise<Blob> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Skip compression for small files (< 100KB)
  if (file.size < 100 * 1024) {
    return file;
  }

  const img = await createImageFromFile(file);
  
  const { width, height } = calculateDimensions(
    img.width,
    img.height,
    opts.maxWidth!,
    opts.maxHeight!
  );

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Use high-quality image scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Draw the image
  ctx.drawImage(img, 0, 0, width, height);

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          console.log(`Image compressed: ${(file.size / 1024).toFixed(1)}KB → ${(blob.size / 1024).toFixed(1)}KB (${((1 - blob.size / file.size) * 100).toFixed(0)}% reduction)`);
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      opts.format,
      opts.quality
    );
  });
};

/**
 * Compresses an image for product/animal uploads (smaller size for thumbnails)
 */
export const compressProductImage = (file: File | Blob): Promise<Blob> => {
  return compressImage(file, {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.75,
    format: 'image/webp',
  });
};

/**
 * Compresses an image for logos (smaller, higher quality)
 */
export const compressLogoImage = (file: File | Blob): Promise<Blob> => {
  return compressImage(file, {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.85,
    format: 'image/webp',
  });
};

/**
 * Compresses an image for animal gallery (medium size)
 */
export const compressGalleryImage = (file: File | Blob): Promise<Blob> => {
  return compressImage(file, {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.8,
    format: 'image/webp',
  });
};
