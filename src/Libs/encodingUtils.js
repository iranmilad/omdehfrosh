// utils/encodingUtils.js

/**
 * Simple Base64 encoding/decoding utilities
 */
export const base64Encode = (data) => {
  try {
    const jsonString = JSON.stringify(data);
    return btoa(unescape(encodeURIComponent(jsonString)));
  } catch (error) {
    console.warn('Base64 encoding failed:', error);
    return null;
  }
};

export const base64Decode = (encodedData) => {
  try {
    const jsonString = decodeURIComponent(escape(atob(encodedData)));
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Base64 decoding failed:', error);
    return null;
  }
};

/**
 * Simple XOR encoding for additional obfuscation
 */
const XOR_KEY = process.env.REACT_APP_CACHE_ENCRYPTION_KEY || 'fallbackKey2024';

export const xorEncode = (data) => {
  try {
    const jsonString = JSON.stringify(data);
    let encoded = '';
    
    for (let i = 0; i < jsonString.length; i++) {
      const keyChar = XOR_KEY.charCodeAt(i % XOR_KEY.length);
      const dataChar = jsonString.charCodeAt(i);
      encoded += String.fromCharCode(dataChar ^ keyChar);
    }
    
    return btoa(unescape(encodeURIComponent(encoded)));
  } catch (error) {
    console.warn('XOR encoding failed:', error);
    return null;
  }
};

export const xorDecode = (encodedData) => {
  try {
    const decoded = decodeURIComponent(escape(atob(encodedData)));
    let original = '';
    
    for (let i = 0; i < decoded.length; i++) {
      const keyChar = XOR_KEY.charCodeAt(i % XOR_KEY.length);
      const encodedChar = decoded.charCodeAt(i);
      original += String.fromCharCode(encodedChar ^ keyChar);
    }
    
    return JSON.parse(original);
  } catch (error) {
    console.warn('XOR decoding failed:', error);
    return null;
  }
};

/**
 * Compression + Base64 encoding (using LZ-string like compression)
 */
export const compressAndEncode = (data) => {
  try {
    const jsonString = JSON.stringify(data);
    // Simple run-length encoding for demonstration
    const compressed = jsonString.replace(/(.)\1+/g, (match, char) => {
      return match.length > 3 ? `${char}${match.length}` : match;
    });
    return base64Encode(compressed);
  } catch (error) {
    console.warn('Compression encoding failed:', error);
    return null;
  }
};

export const decompressAndDecode = (encodedData) => {
  try {
    const compressed = base64Decode(encodedData);
    if (!compressed) return null;
    
    // Decompress (reverse run-length encoding)
    const decompressed = compressed.replace(/(.)\d+/g, (match, char) => {
      const count = parseInt(match.slice(1));
      return char.repeat(count);
    });
    
    return JSON.parse(decompressed);
  } catch (error) {
    console.warn('Compression decoding failed:', error);
    return null;
  }
};

/**
 * Advanced encoding with timestamp and checksum
 */
export const advancedEncode = (data) => {
  try {
    const timestamp = Date.now();
    const payload = {
      data,
      timestamp,
      checksum: btoa(JSON.stringify(data)).slice(0, 8) // Simple checksum
    };
    
    return xorEncode(payload);
  } catch (error) {
    console.warn('Advanced encoding failed:', error);
    return null;
  }
};

export const advancedDecode = (encodedData, maxAge = 24 * 60 * 60 * 1000) => { // 24 hours default
  try {
    const payload = xorDecode(encodedData);
    if (!payload) return null;
    
    const { data, timestamp, checksum } = payload;
    
    // Check if data is too old
    if (Date.now() - timestamp > maxAge) {
      console.warn('Cached data expired');
      return null;
    }
    
    // Verify checksum
    const expectedChecksum = btoa(JSON.stringify(data)).slice(0, 8);
    if (checksum !== expectedChecksum) {
      console.warn('Data integrity check failed');
      return null;
    }
    
    return data;
  } catch (error) {
    console.warn('Advanced decoding failed:', error);
    return null;
  }
};

/**
 * Session storage utilities with encoding
 */
export const setEncodedStorage = (key, data, encoding = 'base64') => {
  let encodedData;
  
  switch (encoding) {
    case 'xor':
      encodedData = xorEncode(data);
      break;
    case 'compress':
      encodedData = compressAndEncode(data);
      break;
    case 'advanced':
      encodedData = advancedEncode(data);
      break;
    case 'base64':
    default:
      encodedData = base64Encode(data);
      break;
  }
  
  if (encodedData) {
    sessionStorage.setItem(key, encodedData);
    return true;
  }
  return false;
};

export const getEncodedStorage = (key, encoding = 'base64', maxAge) => {
  const encodedData = sessionStorage.getItem(key);
  if (!encodedData) return null;
  
  switch (encoding) {
    case 'xor':
      return xorDecode(encodedData);
    case 'compress':
      return decompressAndDecode(encodedData);
    case 'advanced':
      return advancedDecode(encodedData, maxAge);
    case 'base64':
    default:
      return base64Decode(encodedData);
  }
};