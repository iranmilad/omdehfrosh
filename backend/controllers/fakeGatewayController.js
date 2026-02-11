// H:\projects\React\j2b.market\backend\controllers\fakeGatewayController.js

// Fake Gateway Controller - Handles POST requests to fake-gateway
export const handleFakeGatewayPost = (req, res) => {
  console.log('🎭 Fake Gateway POST request received');
  console.log('📦 Request body:', req.body);
  
  try {
    // Extract payment data from POST body
    const paymentData = req.body;
    
    // Create a temporary storage mechanism (in production, you'd use Redis or database)
    const tempId = `fake_gateway_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store payment data temporarily (using a simple in-memory store for demo)
    // In production, this should be stored in Redis or database with TTL
    global.fakeGatewayStore = global.fakeGatewayStore || {};
    global.fakeGatewayStore[tempId] = {
      data: paymentData,
      timestamp: Date.now(),
      expires: Date.now() + (5 * 60 * 1000) // 5 minutes expiry
    };
    
    // Redirect to the frontend fake-gateway page with the temp ID
    const frontendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://j2b.market/fake-gateway' 
      : 'http://localhost:3000/fake-gateway';
    
    const redirectUrl = `${frontendUrl}?temp_id=${tempId}`;
    
    console.log('🔗 Redirecting to:', redirectUrl);
    
    // Redirect to the frontend fake-gateway page
    return res.redirect(302, redirectUrl);
    
  } catch (error) {
    console.error('❌ Error in fake gateway POST handler:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process fake gateway request'
    });
  }
};

// Helper function to get temporary data
export const getTemporaryData = (tempId) => {
  if (!global.fakeGatewayStore || !global.fakeGatewayStore[tempId]) {
    return null;
  }
  
  const item = global.fakeGatewayStore[tempId];
  
  // Check if expired
  if (Date.now() > item.expires) {
    delete global.fakeGatewayStore[tempId];
    return null;
  }
  
  return item.data;
};

// Get temporary data API endpoint
export const getTemporaryDataApi = (req, res) => {
  try {
    const { tempId } = req.params;
    
    if (!tempId) {
      return res.status(400).json({
        success: false,
        error: 'Missing temporary ID'
      });
    }
    
    const data = getTemporaryData(tempId);
    
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Temporary data not found or expired'
      });
    }
    
    // Clean up the data after retrieval (one-time use)
    if (global.fakeGatewayStore && global.fakeGatewayStore[tempId]) {
      delete global.fakeGatewayStore[tempId];
    }
    
    return res.status(200).json({
      success: true,
      data: data
    });
    
  } catch (error) {
    console.error('❌ Error retrieving temporary data:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Helper function to cleanup expired data
export const cleanupExpiredData = () => {
  if (!global.fakeGatewayStore) return;
  
  const now = Date.now();
  Object.keys(global.fakeGatewayStore).forEach(key => {
    if (now > global.fakeGatewayStore[key].expires) {
      delete global.fakeGatewayStore[key];
    }
  });
};