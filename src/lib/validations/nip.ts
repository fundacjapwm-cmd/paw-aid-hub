/**
 * Validates Polish NIP (Tax Identification Number) using MOD 11 algorithm
 * @param nip - 10 digit NIP number as string
 * @returns true if NIP is valid, false otherwise
 */
export function validateNIP(nip: string): boolean {
  // Remove any whitespace and hyphens
  const cleanNip = nip.replace(/[\s-]/g, '');
  
  // Check if NIP has exactly 10 digits
  if (!/^\d{10}$/.test(cleanNip)) {
    return false;
  }

  // Weights for MOD 11 algorithm
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  
  // Calculate checksum
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanNip[i]) * weights[i];
  }
  
  // Calculate MOD 11
  const checksum = sum % 11;
  
  // If checksum is 10, NIP is invalid
  if (checksum === 10) {
    return false;
  }
  
  // Compare with control digit (10th digit)
  const controlDigit = parseInt(cleanNip[9]);
  
  return checksum === controlDigit;
}

/**
 * Formats NIP for display with hyphens
 * @param nip - 10 digit NIP number as string
 * @returns formatted NIP (XXX-XXX-XX-XX) or original value if invalid
 */
export function formatNIP(nip: string): string {
  const cleanNip = nip.replace(/[\s-]/g, '');
  
  if (!/^\d{10}$/.test(cleanNip)) {
    return nip;
  }
  
  return `${cleanNip.slice(0, 3)}-${cleanNip.slice(3, 6)}-${cleanNip.slice(6, 8)}-${cleanNip.slice(8, 10)}`;
}
