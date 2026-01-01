// Image file validation and compression utilities

export const MAX_FILE_SIZE = 500 * 1024; // 500KB - more aggressive for better performance
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
export const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const MAX_IMAGE_DIMENSION = 1200; // Reduced max width/height for better compression

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates an image file for upload
 * @param file - The file to validate
 * @returns Validation result with error message if invalid
 */
export function validateImageFile(file: File): ImageValidationResult {
  if (!file) {
    return { valid: false, error: 'Nie wybrano pliku' };
  }
  
  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Nieprawidłowy format pliku. Dozwolone formaty: JPG, PNG, WebP' 
    };
  }
  
  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    return { 
      valid: false, 
      error: 'Nieprawidłowe rozszerzenie pliku. Dozwolone: .jpg, .jpeg, .png, .webp' 
    };
  }
  
  return { valid: true };
}

/**
 * Loads an image file and returns an HTMLImageElement
 */
function loadImage(file: File | Blob): Promise<HTMLImageElement> {
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
}

/**
 * Compresses an image file to WebP format with aggressive compression
 * @param file - The image file to compress
 * @param maxSizeBytes - Maximum file size in bytes (default: 500KB)
 * @returns Compressed file as Blob
 */
export async function compressImage(
  file: File, 
  maxSizeBytes: number = MAX_FILE_SIZE
): Promise<File> {
  const img = await loadImage(file);
  
  // Calculate new dimensions (maintain aspect ratio)
  let width = img.naturalWidth;
  let height = img.naturalHeight;
  
  // Resize if dimensions are too large
  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }
  }

  // Create canvas for compression
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  // Use high-quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Draw image on canvas
  ctx.drawImage(img, 0, 0, width, height);
  
  // Try WebP first (best compression), then JPEG as fallback
  let blob: Blob | null = null;
  let quality = 0.8;
  
  // Try WebP with progressive quality reduction
  while (quality >= 0.4) {
    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/webp', quality);
    });
    
    if (blob && blob.size <= maxSizeBytes) {
      break;
    }
    
    quality -= 0.1;
  }
  
  // If still too large after quality reduction, reduce dimensions further
  if (blob && blob.size > maxSizeBytes) {
    const scaleFactor = Math.sqrt(maxSizeBytes / blob.size) * 0.85;
    const newWidth = Math.round(width * scaleFactor);
    const newHeight = Math.round(height * scaleFactor);
    
    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.drawImage(img, 0, 0, newWidth, newHeight);
    
    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/webp', 0.7);
    });
  }
  
  if (!blob) {
    throw new Error('Failed to compress image');
  }
  
  console.log(`Image compressed: ${(file.size / 1024).toFixed(1)}KB → ${(blob.size / 1024).toFixed(1)}KB (${((1 - blob.size / file.size) * 100).toFixed(0)}% reduction)`);
  
  // Create new file with .webp extension
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  
  return new File([blob], `${baseName}.webp`, { type: 'image/webp' });
}

/**
 * Validates and compresses an image file
 * Returns compressed file if valid, throws error if invalid format
 */
export async function validateAndCompressImage(file: File): Promise<File> {
  // First validate format
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  // Then compress to WebP
  return compressImage(file);
}
