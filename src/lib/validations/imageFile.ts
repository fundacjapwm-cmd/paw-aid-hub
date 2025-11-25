// Image file validation constants and function

export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
export const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png'];

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
  
  // Check file size (max 2MB)
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return { 
      valid: false, 
      error: `Plik jest za duży (${sizeMB}MB). Maksymalny rozmiar to 2MB` 
    };
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
