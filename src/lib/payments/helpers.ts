import { PaymentProvider } from './types';

/**
 * Format Cameroon Phone Number to +237 6XXXXXXXX
 */
export function formatCameroonPhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('237')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  return `+237${cleaned}`;
}

/**
 * Clean phone for APIs (e.g. 237671159461 without +)
 */
export function cleanPhoneForApi(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (!cleaned.startsWith('237')) {
    if (cleaned.startsWith('0')) {
      cleaned = '237' + cleaned.substring(1);
    } else {
      cleaned = '237' + cleaned;
    }
  }
  return cleaned;
}

/**
 * Detect Cameroon Carrier (MTN vs Orange)
 * MTN Cameroon prefixes: 670-679, 680-689, 650-654
 * Orange Cameroon prefixes: 690-699, 655-659
 */
export function detectCarrier(phone: string): PaymentProvider | null {
  const cleaned = phone.replace(/[^0-9]/g, '');
  const localPart = cleaned.startsWith('237') ? cleaned.substring(3) : cleaned;
  
  if (localPart.length < 2) return null;
  
  const prefix2 = localPart.substring(0, 2);
  const prefix3 = localPart.substring(0, 3);
  
  if (prefix2 === '67' || prefix2 === '68') return 'mtn';
  if (prefix2 === '69') return 'orange';
  
  const num3 = parseInt(prefix3, 10);
  if (num3 >= 650 && num3 <= 654) return 'mtn';
  if (num3 >= 655 && num3 <= 659) return 'orange';
  
  return null;
}

/**
 * Validate Cameroon Phone Number
 */
export function validateCameroonPhone(phone: string): boolean {
  const cleaned = phone.replace(/[^0-9]/g, '');
  const localPart = cleaned.startsWith('237') ? cleaned.substring(3) : cleaned;
  // Valid local phone is 9 digits starting with 6
  return /^6[0-9]{8}$/.test(localPart);
}

/**
 * Format Currency in FCFA (XAF)
 */
export function formatXAF(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0
  }).format(amount).replace('FCFA', 'FCFA');
}
