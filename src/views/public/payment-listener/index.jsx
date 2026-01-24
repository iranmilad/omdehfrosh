import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { getApiUrl } from '../../../Libs/utils/apiutils/apiutils';

const PaymentListener = () => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    console.log('🎬 PaymentListener mounted, calling verifyPayment');
    verifyPayment();
  }, []);


  const verifyPayment = async () => {
    console.log('🔍 verifyPayment START');
    try {
      // Get the full URL with query params (from bank redirect)
      // Format: localhost:3000/?tried3637378&success=true
      const fullUrl = window.location.href;
      console.log('📍 Full URL:', fullUrl);
      const urlObj = new URL(fullUrl);
      // Keep the full URL including query params
      let link = `${urlObj.origin}${urlObj.pathname}${urlObj.search}`;
      console.log('🔗 Link to send:', link);

      // Get payment data from POST body (sent by fake gateway via backend redirect)
      // The backend encodes the body data in the URL as 'bodyData' param
      let bodyData = {};

      // First, try to get encoded body data from URL (from backend redirect)
      const encodedBodyData = searchParams.get('bodyData');
      console.log('📦 Encoded bodyData from URL:', encodedBodyData ? 'Found' : 'Not found');
      
      if (encodedBodyData) {
        try {
          // Decode base64
          const decodedString = atob(decodeURIComponent(encodedBodyData));
          bodyData = JSON.parse(decodedString);
          console.log('✅ Decoded bodyData:', bodyData);
        } catch (e) {
          console.error('❌ Error decoding bodyData:', e);
        }
      }

      // Extract success from bodyData if it exists there (from fake gateway)
      let successParam = searchParams.get('success');
      if (!successParam && bodyData.success) {
        successParam = bodyData.success;
        console.log('✅ Found success in bodyData:', successParam);
      }
      
      // If success is in bodyData, ensure it's in the link for backend
      if (successParam && !link.includes('success=')) {
        const separator = link.includes('?') ? '&' : '?';
        link = `${link}${separator}success=${successParam}`;
        console.log('✅ Updated link with success:', link);
      }

      // If no encoded data, try to get individual params (fallback)
      if (Object.keys(bodyData).length === 0) {
        console.log('⚠️ No bodyData from encoded param, trying individual params');
        for (const [key, value] of searchParams.entries()) {
          // Skip the success, transaction ref, and bodyData params
          if (key !== 'success' && !key.startsWith('tried') && key !== 'bodyData') {
            try {
              // Try to parse as JSON if it looks like JSON
              if (value.startsWith('{') || value.startsWith('[')) {
                bodyData[key] = JSON.parse(value);
              } else {
                bodyData[key] = value;
              }
            } catch {
              bodyData[key] = value;
            }
          }
        }
      }

      // If no data from URL params, try location state
      if (Object.keys(bodyData).length === 0 && location.state) {
        console.log('⚠️ Using location.state as bodyData');
        bodyData = location.state;
      }

      // If still no data, try sessionStorage (fallback)
      if (Object.keys(bodyData).length === 0) {
        const storedData = sessionStorage.getItem('paymentData');
        if (storedData) {
          console.log('⚠️ Using sessionStorage as bodyData');
          try {
            bodyData = JSON.parse(storedData);
            sessionStorage.removeItem('paymentData');
          } catch (e) {
            console.error('❌ Error parsing sessionStorage data:', e);
          }
        }
      }

      console.log('📤 Final data to send:', { link, body: bodyData });
      console.log('🌐 Making POST request to verify route...');

      // Send to verify route using fetch (more reliable than axios with Mirage)
      const fetchResponse = await fetch(
        getApiUrl('/universal-payment/verify-payment'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            link,
            body: bodyData
          })
        }
      );

      console.log('✅ Fetch response received!');
      console.log('📥 Fetch status:', fetchResponse.status);
      console.log('📥 Fetch ok:', fetchResponse.ok);

      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        console.error('❌ Fetch error response:', errorText);
        throw new Error(`HTTP ${fetchResponse.status}: ${errorText}`);
      }

      const responseData = await fetchResponse.json();
      console.log('✅ Response data parsed:', responseData);
      console.log('📥 Has link?', !!responseData?.link);
      console.log('📥 Has message?', !!responseData?.message);

      // Backend returns: { link: "...", message: "..." }
      // Just display the message and redirect - no processing here
      if (responseData && (responseData.link || responseData.message)) {
        console.log('✅ Setting result:', responseData);
        setResult(responseData);
        setLoading(false);
        console.log('✅ Loading set to false, result set');

        // Redirect after 3 seconds to the link provided by backend
        console.log('⏰ Setting redirect timer (3 seconds)...');
        setTimeout(() => {
          const redirectLink = responseData.link || '/';
          console.log('🔄 Redirecting to:', redirectLink);
          navigate(redirectLink);
        }, 5000);
      } else {
        console.error('❌ Invalid response format:', responseData);
        setError('پاسخ نامعتبر از سرور');
        setLoading(false);
        setTimeout(() => {
          navigate('/');
        }, 5000);
      }

    } catch (err) {
      console.error('❌ Verification error caught:', err);
      console.error('❌ Error type:', typeof err);
      console.error('❌ Error response:', err.response);
      console.error('❌ Error data:', err.response?.data);
      console.error('❌ Error message:', err.message);
      console.error('❌ Error stack:', err.stack);
      
      setError(err.response?.data?.message || err.message || 'خطا در تأیید پرداخت');
      setLoading(false);
      console.log('✅ Error state set, loading false');

      // Redirect to home after 5 seconds on error
      setTimeout(() => {
        console.log('🔄 Redirecting to home due to error');
        navigate('/');
      }, 5000);
    }
  };

  console.log('🎨 PaymentListener render:', { loading, result, error });

  if (loading) {
    console.log('⏳ Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto flex items-center justify-center mb-6 animate-pulse">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              در حال تأیید پرداخت
            </h1>

            <div className="flex items-center justify-center space-x-2 space-x-reverse mt-6">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>

            <p className="text-gray-500 mt-6">
              لطفا منتظر بمانید...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('❌ Showing error state:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-red-600 rounded-full mx-auto flex items-center justify-center mb-6">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-red-800 mb-4">
              خطا در پردازش
            </h1>

            <p className="text-gray-700 leading-relaxed">
              {error}
            </p>

            <p className="text-sm text-gray-500 mt-6">
              در حال هدایت به صفحه اصلی...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check if payment was successful based on message
  const isSuccess = result && result.message && (
    result.message.includes('موفق') || 
    result.message.includes('successful') ||
    result.message.includes('موفق بوده')
  );

  console.log('✅ Showing result state:', { isSuccess, result });

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${isSuccess ? 'from-green-50 to-green-100' : 'from-yellow-50 to-yellow-100'}`}>
      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
        <div className="mb-8">
          <div className={`w-24 h-24 ${isSuccess ? 'bg-green-600' : 'bg-yellow-600'} rounded-full mx-auto flex items-center justify-center mb-6`}>
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isSuccess ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              )}
            </svg>
          </div>

          <h1 className={`text-2xl font-bold mb-4 ${isSuccess ? 'text-green-800' : 'text-yellow-800'}`}>
            {isSuccess ? 'پرداخت موفق' : 'اطلاعیه پرداخت'}
          </h1>

          <div className="bg-gray-50 rounded-lg p-6 text-right">
            <p className="text-gray-700 leading-relaxed">
              {result?.message}
            </p>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            در حال هدایت...
          </p>

          <div className="w-full bg-gray-200 rounded-full h-2 mt-4 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full animate-pulse" style={{ width: '66%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentListener;
