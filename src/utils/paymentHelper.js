import axios from 'axios';
import { getApiUrl } from '../Libs/utils/apiutils/apiutils';

/**
 * Universal Payment Helper
 * Handles both wallet and order payments through a unified API
 */

export const initiatePayment = async (paymentData) => {
  try {
    console.log('📞 initiatePayment START');
  const { order_id, gateway, amount } = paymentData;
  // Support legacy 'geteway' for backward compatibility
  const geteway = gateway || paymentData.geteway;
  console.log('📋 Payment data:', { order_id, gateway: gateway || geteway, amount });
  // MODIFIED 2026-02-09 - Removed payment_type field from API call

    // Get token from localStorage
    const token = localStorage.getItem("user");
    console.log('🔑 Token exists:', !!token);

    const apiUrl = getApiUrl('/universal-payment/get-payment-link');
    
    // Build request body - only send what's needed
    // For wallet recharge: { amount, gateway }
    // For order gateway: { order_id, gateway }
    // For order COD: { order_id, gateway }
    // For order wallet: { order_id, gateway }
    const requestBody = {};
    if (order_id) {
      requestBody.order_id = order_id;
    }
    if (amount) {
      requestBody.amount = amount;
    }
    
    // Always send gateway - backend will determine payment type from gateway name
    requestBody.gateway = gateway || geteway;
    
    console.log('🌐 Making POST request to:', apiUrl);
    console.log('📤 Request payload:', requestBody);
    
    // Call universal payment link API
    console.log('⏳ Waiting for response...');
    
    // Try using fetch instead of axios to bypass potential Mirage issues
    try {
      const fetchResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('✅ Fetch response received!');
      console.log('📥 Fetch status:', fetchResponse.status);
      console.log('📥 Fetch ok:', fetchResponse.ok);
      
      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        console.error('❌ Fetch error response:', errorText);
        throw new Error(`HTTP ${fetchResponse.status}: ${errorText}`);
      }
      
      const responseData = await fetchResponse.json();
      console.log('📥 Fetch response data:', responseData);
      
      // Convert to axios-like response format
      const response = {
        status: fetchResponse.status,
        data: responseData,
        headers: fetchResponse.headers
      };
      
      console.log('✅ Converted response:', response);

      console.log('📥 Response received!');
      console.log('📥 Full response object:', response);
      console.log('📥 Response status:', response.status);
      console.log('📥 Response data:', response.data);
      console.log('📥 Response data type:', typeof response.data);
      console.log('📥 Has link?', !!response.data?.link);
      console.log('📥 Has body?', !!response.data?.body);
      console.log('📥 Link value:', response.data?.link);
      console.log('📥 Body value:', response.data?.body);
    
      if (response.data && response.data.link && response.data.body) {
        console.log('✅ Valid response received');
        console.log('🔗 Link:', response.data.link);
        console.log('📄 Body:', JSON.stringify(response.data.body, null, 2));
        return {
          success: true,
          link: response.data.link,
          body: response.data.body
        };
      } else {
        console.error('❌ Invalid response structure');
        console.error('❌ Response.data:', response.data);
        console.error('❌ Missing fields:', {
          hasLink: !!response.data?.link,
          hasBody: !!response.data?.body,
          linkValue: response.data?.link,
          bodyValue: response.data?.body,
          fullData: response.data
        });
        return {
          success: false,
          error: 'Invalid response from server - missing link or body'
        };
      }
    } catch (fetchError) {
      console.error('❌ Fetch error:', fetchError);
      throw fetchError;
    }
  } catch (error) {
    console.error('❌ Payment initiation ERROR');
    console.error('❌ Error object:', error);
    console.error('❌ Error response:', error.response);
    console.error('❌ Error data:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'خطا در ایجاد لینک پرداخت'
    };
  }
};

/**
 * Redirect to payment gateway with POST method
 * @param {string} link - Gateway URL
 * @param {object} body - Payment data to send
 */
export const redirectToGateway = (link, body) => {
  console.log('🔄 redirectToGateway called with:', { link, body });
  
  if (!link || !body) {
    console.error('❌ Missing link or body:', { link, body });
    return;
  }

  // Store body in sessionStorage for fake gateway/listener to access
  sessionStorage.setItem('paymentData', JSON.stringify(body));
  console.log('💾 Stored payment data in sessionStorage');

  // For listener (COD/wallet payments), redirect directly with encoded data in URL
  if (link.includes('payment-listener')) {
    console.log('📞 Redirecting directly to listener (COD/wallet payment)...');
    
    // Encode body data as base64 for URL
    try {
      const jsonString = JSON.stringify(body);
      const encodedData = btoa(unescape(encodeURIComponent(jsonString)));
      // Link already has success=true from backend, just add bodyData
      const listenerUrl = link.includes('?') 
        ? `${link}&bodyData=${encodeURIComponent(encodedData)}`
        : `${link}?bodyData=${encodeURIComponent(encodedData)}`;
      console.log('🔗 Navigating to listener:', listenerUrl);
      console.log('📦 Body data:', body);
      
      setTimeout(() => {
        window.location.href = listenerUrl;
      }, 100);
      return;
    } catch (error) {
      console.error('❌ Error encoding data:', error);
      setTimeout(() => {
        window.location.href = link;
      }, 100);
      return;
    }
  }

  // For fake gateway: never put payment data in URL. Store in sessionStorage and redirect to clean URL only.
  if (link.includes('fake-gateway')) {
    console.log('🎭 Redirecting to fake gateway (body via sessionStorage, no data in URL)...');
    sessionStorage.setItem('paymentData', JSON.stringify(body));
    const cleanLink = link.split('?')[0];
    setTimeout(() => {
      window.location.href = cleanLink;
    }, 100);
    return;
  }

  // For real gateway, create a form and submit with POST directly
  console.log('🌐 Creating form for real gateway...');
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = link;
  form.style.display = 'none';

  // Add all body fields as hidden inputs
  Object.keys(body).forEach((key) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = typeof body[key] === 'object' ? JSON.stringify(body[key]) : String(body[key]);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  console.log('✅ Form created, submitting to real gateway...');
  form.submit();
};

/**
 * Complete payment flow
 * @param {object} paymentData - Payment data (order_id + gateway OR amount + gateway)
 * @returns {Promise<boolean>} - Success status
 */
export const processPayment = async (paymentData) => {
  try {
    console.log('🚀 processPayment called with:', paymentData);
    const result = await initiatePayment(paymentData);
    console.log('📦 Payment initiation result:', result);
    console.log('📦 Result type:', typeof result);
    console.log('📦 Result.success:', result?.success);
    console.log('📦 Result.link:', result?.link);
    console.log('📦 Result.body:', result?.body);

    if (result && result.success === true) {
      console.log('✅ Payment initiated successfully, redirecting to gateway...');
      console.log('🔗 Link:', result.link);
      console.log('📄 Body:', result.body);
      
      if (!result.link || !result.body) {
        console.error('❌ Missing link or body in result:', result);
        throw new Error('Invalid payment response: missing link or body');
      }
      
      redirectToGateway(result.link, result.body);
      return true;
    } else {
      const errorMsg = result?.error || 'خطا در ایجاد لینک پرداخت';
      console.error('❌ Payment failed:', errorMsg);
      console.error('❌ Full result object:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Error in processPayment:', error);
    console.error('❌ Error stack:', error.stack);
    return false;
  }
};
