// utils/secureEncodingUtils.js

/**
 * Get encryption key from environment variables with validation
 */
const getEncryptionKey = () => {
  const key = process.env.REACT_APP_CACHE_ENCRYPTION_KEY;
  
  if (!key || key === 'fallbackKey2024') {
    console.warn('⚠️ Using fallback encryption key! Set REACT_APP_CACHE_ENCRYPTION_KEY in your .env file');
  }
  
  if (key && key.length < 16) {
    console.warn('⚠️ Encryption key should be at least 16 characters long for better security');
  }
  
  return key || 'fallbackKey2024';
};

const ENCRYPTION_KEY = getEncryptionKey();

/**
 * Enhanced XOR encoding with key stretching
 */
const stretchKey = (key, length) => {
  let stretched = key;
  while (stretched.length < length) {
    stretched += key;
  }
  return stretched.substring(0, length);
};

export const secureXorEncode = (data) => {
  try {
    const jsonString = JSON.stringify(data);
    const key = stretchKey(ENCRYPTION_KEY, jsonString.length);
    let encoded = '';
    
    for (let i = 0; i < jsonString.length; i++) {
      const keyChar = key.charCodeAt(i);
      const dataChar = jsonString.charCodeAt(i);
      encoded += String.fromCharCode(dataChar ^ keyChar);
    }
    
    // Add random salt to make identical data look different
    const salt = Math.random().toString(36).substring(2, 10);
    const saltedData = salt + encoded;
    
    return btoa(unescape(encodeURIComponent(saltedData)));
  } catch (error) {
    console.warn('Secure XOR encoding failed:', error);
    return null;
  }
};

export const secureXorDecode = (encodedData) => {
  try {
    const saltedData = decodeURIComponent(escape(atob(encodedData)));
    const salt = saltedData.substring(0, 8);
    const encoded = saltedData.substring(8);
    
    const key = stretchKey(ENCRYPTION_KEY, encoded.length);
    let original = '';
    
    for (let i = 0; i < encoded.length; i++) {
      const keyChar = key.charCodeAt(i);
      const encodedChar = encoded.charCodeAt(i);
      original += String.fromCharCode(encodedChar ^ keyChar);
    }
    
    return JSON.parse(original);
  } catch (error) {
    console.warn('Secure XOR decoding failed:', error);
    return null;
  }
};

/**
 * Advanced encoding with environment-based key and additional security features
 */
export const secureAdvancedEncode = (data) => {
  try {
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(2, 15);
    
    const payload = {
      data,
      timestamp,
      nonce,
      checksum: btoa(JSON.stringify(data) + ENCRYPTION_KEY).slice(0, 12),
      version: '1.0'
    };
    
    return secureXorEncode(payload);
  } catch (error) {
    console.warn('Secure advanced encoding failed:', error);
    return null;
  }
};

export const secureAdvancedDecode = (encodedData, maxAge = 24 * 60 * 60 * 1000) => {
  try {
    const payload = secureXorDecode(encodedData);
    if (!payload) return null;
    
    const { data, timestamp, nonce, checksum, version } = payload;
    
    // Check version compatibility
    if (version !== '1.0') {
      console.warn('Incompatible cache version');
      return null;
    }
    
    // Check if data is too old
    if (Date.now() - timestamp > maxAge) {
      console.warn('Cached data expired');
      return null;
    }
    
    // Verify checksum with key
    const expectedChecksum = btoa(JSON.stringify(data) + ENCRYPTION_KEY).slice(0, 12);
    if (checksum !== expectedChecksum) {
      console.warn('Data integrity check failed - possible tampering detected');
      return null;
    }
    
    return data;
  } catch (error) {
    console.warn('Secure advanced decoding failed:', error);
    return null;
  }
};

/**
 * Secure session storage utilities
 */
export const setSecureStorage = (key, data, encoding = 'advanced', options = {}) => {
  if (!process.env.REACT_APP_ENABLE_CACHING || process.env.REACT_APP_ENABLE_CACHING === 'false') {
    return false;
  }

  let encodedData;
  
  switch (encoding) {
    case 'xor':
      encodedData = secureXorEncode(data);
      break;
    case 'advanced':
    default:
      encodedData = secureAdvancedEncode(data);
      break;
  }
  
  if (encodedData) {
    try {
      sessionStorage.setItem(key, encodedData);
      
      if (process.env.NODE_ENV === 'development') {
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }
  return false;
};

export const getSecureStorage = (key, encoding = 'advanced', maxAge) => {
  if (!process.env.REACT_APP_ENABLE_CACHING || process.env.REACT_APP_ENABLE_CACHING === 'false') {
    return null;
  }

  const encodedData = sessionStorage.getItem(key);
  if (!encodedData) return null;
  
  let decodedData;
  
  switch (encoding) {
    case 'xor':
      decodedData = secureXorDecode(encodedData);
      break;
    case 'advanced':
    default:
      decodedData = secureAdvancedDecode(encodedData, maxAge);
      break;
  }
  
  if (process.env.NODE_ENV === 'development' && decodedData) {
  }
  
  return decodedData;
};

export const clearSecureCache = (prefix = '') => {
  const keysToRemove = [];
  
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (prefix === '' || key.startsWith(prefix))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    sessionStorage.removeItem(key);
  });
  
  if (process.env.NODE_ENV === 'development') {
  }
  
  return keysToRemove.length;
};