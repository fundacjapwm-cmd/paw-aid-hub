// Image file validation and compression utilities

export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
export const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png'];
const MAX_IMAGE_DIMENSION = 1920; // Max width/height for images

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
      error: 'Nieprawidłowy format pliku. Dozwolone formaty: JPG, PNG' 
    };
  }
  
  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    return { 
      valid: false, 
      error: 'Nieprawidłowe rozszerzenie pliku. Dozwolone: .jpg, .jpeg, .png' 
    };
  }
  
  return { valid: true };
}

/**
 * Loads an image file and returns an HTMLImageElement
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Compresses an image file to fit within size limits
 * @param file - The image file to compress
 * @param maxSizeBytes - Maximum file size in bytes (default: 2MB)
 * @returns Compressed file as Blob
 */
export async function compressImage(
  file: File, 
  maxSizeBytes: number = MAX_FILE_SIZE
): Promise<File> {
  // If file is already small enough, return as-is
  if (file.size <= maxSizeBytes) {
    return file;
  }

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
  
  // Draw image on canvas
  ctx.drawImage(img, 0, 0, width, height);
  
  // Try different quality levels to get under max size
  const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  let quality = 0.9;
  let blob: Blob | null = null;
  
  // For PNG, we can only reduce dimensions, not quality
  if (outputType === 'image/png') {
    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });
    
    // If PNG is still too large, convert to JPEG
    if (blob && blob.size > maxSizeBytes) {
      quality = 0.85;
      blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', quality);
      });
    }
  } else {
    // For JPEG, progressively reduce quality
    while (quality >= 0.3) {
      blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', quality);
      });
      
      if (blob && blob.size <= maxSizeBytes) {
        break;
      }
      
      quality -= 0.1;
    }
  }
  
  // If still too large after quality reduction, reduce dimensions further
  if (blob && blob.size > maxSizeBytes) {
    const scaleFactor = Math.sqrt(maxSizeBytes / blob.size) * 0.9;
    const newWidth = Math.round(width * scaleFactor);
    const newHeight = Math.round(height * scaleFactor);
    
    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.drawImage(img, 0, 0, newWidth, newHeight);
    
    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.8);
    });
  }
  
  if (!blob) {
    throw new Error('Failed to compress image');
  }
  
  // Create new file with original name
  const extension = blob.type === 'image/png' ? '.png' : '.jpg';
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  
  return new File([blob], `${baseName}${extension}`, { type: blob.type });
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
  
  // Then compress if needed
  return compressImage(file);
}
