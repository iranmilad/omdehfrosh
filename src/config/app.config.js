const appConfig = {
    apiPrefix: '/api',
    authenticatedEntryPath: '/home',
    unAuthenticatedEntryPath: '/sign-in',
    tourPath: '/',
    enableMock: false, // Mirage mock server disabled; app uses real API only
}

export default appConfig;