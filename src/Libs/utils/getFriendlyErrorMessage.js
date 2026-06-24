const NETWORK_ERROR_PATTERNS = [
  /failed to fetch/i,
  /network error/i,
  /networkrequestfailed/i,
  /load failed/i,
  /err_connection_refused/i,
  /err_internet_disconnected/i,
  /err_network_changed/i,
  /net::err/i,
];

const NETWORK_ERROR_MESSAGE =
  'اتصال به اینترنت برقرار نیست یا سرور در دسترس نیست. لطفاً اتصال خود را بررسی کنید.';

function isNetworkError(message) {
  return NETWORK_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

/**
 * Converts API / fetch errors into user-friendly Persian messages.
 */
export function getFriendlyErrorMessage(error, fallback = 'خطایی رخ داده است') {
  if (!error) return fallback;

  if (typeof error === 'string') {
    const trimmed = error.trim();
    if (!trimmed) return fallback;
    return isNetworkError(trimmed) ? NETWORK_ERROR_MESSAGE : trimmed;
  }

  const message =
    error?.response?.data?.message ||
    error?.message ||
    fallback;

  const normalized = String(message).trim();
  if (!normalized) return fallback;

  return isNetworkError(normalized) ? NETWORK_ERROR_MESSAGE : normalized;
}
