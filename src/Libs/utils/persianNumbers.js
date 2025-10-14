// Persian number conversion utilities

const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Convert English digits to Persian digits
 * @param {string|number} input - The input string or number
 * @returns {string} - String with Persian digits
 */
export const toPersianDigits = (input) => {
  if (input === null || input === undefined) return '';
  
  let str = input.toString();
  
  for (let i = 0; i < englishDigits.length; i++) {
    str = str.replace(new RegExp(englishDigits[i], 'g'), persianDigits[i]);
  }
  
  return str;
};

/**
 * Convert Persian digits to English digits
 * @param {string} input - The input string
 * @returns {string} - String with English digits
 */
export const toEnglishDigits = (input) => {
  if (input === null || input === undefined) return '';
  
  let str = input.toString();
  
  for (let i = 0; i < persianDigits.length; i++) {
    str = str.replace(new RegExp(persianDigits[i], 'g'), englishDigits[i]);
  }
  
  return str;
};

/**
 * Format number with Persian digits and thousands separator
 * @param {number|string} number - The number to format
 * @returns {string} - Formatted number with Persian digits
 */
export const formatPersianNumber = (number) => {
  if (number === null || number === undefined || number === '') return '';
  
  // Convert to number if string
  const num = typeof number === 'string' ? parseFloat(number) : number;
  
  if (isNaN(num)) return '';
  
  // Add thousands separator and convert to Persian
  return toPersianDigits(num.toLocaleString('en-US'));
};

/**
 * Format price with Persian digits and currency
 * @param {number|string} price - The price to format
 * @param {string} currency - Currency symbol (default: 'تومان')
 * @returns {string} - Formatted price with Persian digits
 */
export const formatPersianPrice = (price, currency = 'تومان') => {
  const formattedNumber = formatPersianNumber(price);
  return formattedNumber ? `${formattedNumber} ${currency}` : '';
};