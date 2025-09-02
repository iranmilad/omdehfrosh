const appConfig = {
    apiPrefix: '/api',
    authenticatedEntryPath: '/home',
    unAuthenticatedEntryPath: '/sign-in',
    tourPath: '/',
    
    // Environment-based mock configuration
    enableMock: process.env.NODE_ENV === 'development' ? 
        (process.env.REACT_APP_USE_MOCK === 'true' || process.env.REACT_APP_USE_MOCK === undefined) : 
        false,
    
    // API configuration based on mock status
    apiBaseUrl: process.env.NODE_ENV === 'development' && 
                (process.env.REACT_APP_USE_MOCK === 'true' || process.env.REACT_APP_USE_MOCK === undefined) ?
        'http://localhost:3000' : // Mock server
        (process.env.REACT_APP_API_BASE_URL || 'https://panel.j2b.market/api'), // Real API
    
    // Credentials configuration
    withCredentials: process.env.NODE_ENV === 'development' && 
                    (process.env.REACT_APP_USE_MOCK === 'true' || process.env.REACT_APP_USE_MOCK === undefined) ?
        false : // Don't send credentials to mock
        false,   // Send credentials to real API
}

// Helper function to get full API URL
export const getApiUrl = (path) => {
    const baseUrl = appConfig.apiBaseUrl;
    const apiPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${appConfig.apiPrefix}${apiPath}`;
};

// Helper function to check if mock is enabled
export const isMockEnabled = () => appConfig.enableMock;

// Export configuration
export default appConfig;