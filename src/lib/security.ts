export function sanitizeString(str: string): string {
  if (!str) return '';
  // Basic manual sanitization: remove < > and other suspicious chars
  return str
    .trim()
    .replace(/[<>]/g, '') 
    .replace(/javascript:/gi, '')
    .slice(0, 1000); // Limit length
}

export function sanitizeAmount(amount: any): number {
  const num = Math.floor(Number(amount));
  if (isNaN(num)) return 0;
  return Math.abs(num);
}

export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
