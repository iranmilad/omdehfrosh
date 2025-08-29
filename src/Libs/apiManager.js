// utils/apiManager.js - Global API call coordinator
class ApiManager {
  constructor() {
    this.pendingCalls = new Map();
    this.lastCallTimes = new Map();
    this.rateLimitStates = new Map();
    this.DEFAULT_COOLDOWN = 2000; // 2 seconds
    this.RATE_LIMIT_COOLDOWN = 10000; // 10 seconds for 429 errors
  }

  // Check if we should allow an API call
  canMakeCall(endpoint, options = {}) {
    const { cooldown = this.DEFAULT_COOLDOWN, force = false } = options;
    const now = Date.now();
    const lastCall = this.lastCallTimes.get(endpoint) || 0;
    const isRateLimited = this.rateLimitStates.get(endpoint);

    // Force override (use carefully)
    if (force) return true;

    // Check rate limiting
    if (isRateLimited && now < isRateLimited) {
      console.warn(`API call blocked - rate limited: ${endpoint}`);
      return false;
    }

    // Check cooldown
    if (now - lastCall < cooldown) {
      console.debug(`API call blocked - cooldown active: ${endpoint}`);
      return false;
    }

    return true;
  }

  // Register an API call
  registerCall(endpoint) {
    this.lastCallTimes.set(endpoint, Date.now());
    // Clear rate limit if it was set
    this.rateLimitStates.delete(endpoint);
  }

  // Handle rate limit response
  handleRateLimit(endpoint, retryAfter = 60) {
    const retryTime = Date.now() + (retryAfter * 1000);
    this.rateLimitStates.set(endpoint, retryTime);
    console.warn(`Rate limit set for ${endpoint}, retry after: ${new Date(retryTime)}`);
  }

  // Check if there's a pending call for this endpoint
  hasPendingCall(endpoint) {
    return this.pendingCalls.has(endpoint);
  }

  // Set pending call
  setPendingCall(endpoint, promise) {
    this.pendingCalls.set(endpoint, promise);
    promise.finally(() => {
      this.pendingCalls.delete(endpoint);
    });
    return promise;
  }

  // Get existing pending call
  getPendingCall(endpoint) {
    return this.pendingCalls.get(endpoint);
  }

  // Clear all states for logout
  clearAll() {
    this.pendingCalls.clear();
    this.lastCallTimes.clear();
    this.rateLimitStates.clear();
  }

  // Get rate limit info
  getRateLimitInfo(endpoint) {
    const rateLimitTime = this.rateLimitStates.get(endpoint);
    if (rateLimitTime && Date.now() < rateLimitTime) {
      return {
        isRateLimited: true,
        retryAfter: Math.ceil((rateLimitTime - Date.now()) / 1000)
      };
    }
    return { isRateLimited: false };
  }
}

// Create singleton instance
const apiManager = new ApiManager();

// Enhanced fetch wrapper with rate limiting
export const safeFetch = async (url, options = {}) => {
  const endpoint = new URL(url, window.location.origin).pathname;
  
  // Check if we can make the call
  if (!apiManager.canMakeCall(endpoint, options.rateLimitOptions)) {
    const rateLimitInfo = apiManager.getRateLimitInfo(endpoint);
    if (rateLimitInfo.isRateLimited) {
      throw new Error(`Rate limited. Retry after ${rateLimitInfo.retryAfter} seconds`);
    }
    throw new Error(`API call blocked by cooldown: ${endpoint}`);
  }

  // Check for pending identical call
  if (apiManager.hasPendingCall(endpoint) && !options.rateLimitOptions?.allowDuplicates) {
    console.debug(`Returning existing pending call for: ${endpoint}`);
    return apiManager.getPendingCall(endpoint);
  }

  // Register the call
  apiManager.registerCall(endpoint);

  // Make the actual fetch call
  const fetchPromise = fetch(url, options)
    .then(async (response) => {
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || 60;
        apiManager.handleRateLimit(endpoint, parseInt(retryAfter));
        throw new Error(`Rate limited: ${endpoint}`);
      }
      return response;
    })
    .catch((error) => {
      // Handle network errors
      throw error;
    });

  // Track pending call if not allowing duplicates
  if (!options.rateLimitOptions?.allowDuplicates) {
    return apiManager.setPendingCall(endpoint, fetchPromise);
  }

  return fetchPromise;
};

export default apiManager;