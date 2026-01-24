import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

const FakeGateway = () => {
  const [countdown, setCountdown] = useState(5);
  const [paymentData, setPaymentData] = useState(null);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Get payment data from multiple sources
    let data = {};

    // First, try to get from URL search params (encoded data from backend redirect)
    const encodedData = searchParams.get('data');
    if (encodedData) {
      try {
        // Decode base64 in browser
        const decodedString = atob(decodeURIComponent(encodedData));
        const decodedData = JSON.parse(decodedString);
        data = decodedData;
      } catch (e) {
        console.error('Error decoding URL data:', e);
      }
    }

    // Also try to get individual params (fallback)
    if (Object.keys(data).length === 0) {
      for (const [key, value] of searchParams.entries()) {
        if (key !== 'data') {
          try {
            // Try to parse as JSON if it looks like JSON
            if (value.startsWith('{') || value.startsWith('[')) {
              data[key] = JSON.parse(value);
            } else {
              data[key] = value;
            }
          } catch {
            data[key] = value;
          }
        }
      }
    }

    // If no data from URL params, try sessionStorage (set by paymentHelper)
    if (Object.keys(data).length === 0) {
      const storedData = sessionStorage.getItem('paymentData');
      if (storedData) {
        try {
          data = JSON.parse(storedData);
        } catch (e) {
          console.error('Error parsing sessionStorage data:', e);
        }
      }
    }

    // Fallback to location state
    if (Object.keys(data).length === 0 && location.state) {
      data = location.state;
    }

    setPaymentData(data);

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect to listener page with success
          redirectToListener(data);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [location, searchParams]);

  const redirectToListener = (data) => {
    if (!data || !data.redirect_url) {
      console.error('❌ Missing data or redirect_url');
      return;
    }

    console.log('🔄 Redirecting to listener with data:', data);

    // Generate a random transaction reference (simulating bank redirect)
    const transactionRef = `tried${Math.floor(Math.random() * 10000000)}`;

    // Create redirect URL with query params (simulating bank redirect)
    // Format: /payment-listener?tried3637378&success=true
    const baseUrl = data.redirect_url.split('?')[0]; // Remove existing query params if any
    
    // Encode the body data as base64 to include in URL (simulating POST body from bank)
    try {
      const jsonString = JSON.stringify(data);
      const encodedBody = btoa(unescape(encodeURIComponent(jsonString)));
      
      // Build URL with both bank redirect params and encoded body
      // Format: /payment-listener?tried3637378&success=true&bodyData=<encoded>
      const redirectUrl = `${baseUrl}?${transactionRef}&success=true&bodyData=${encodeURIComponent(encodedBody)}`;
      
      console.log('🔗 Redirecting to:', redirectUrl);
      
      // Redirect directly to listener page (no backend route needed)
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('❌ Error encoding body data:', error);
      // Fallback: redirect without body data
      const redirectUrl = `${baseUrl}?${transactionRef}&success=true`;
      window.location.href = redirectUrl;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-white animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            درگاه پرداخت آزمایشی
          </h1>

          <p className="text-gray-600 mb-2">
            در حال پردازش پرداخت شما...
          </p>

          {paymentData && (
            <div className="bg-blue-50 rounded-lg p-4 mt-4 text-right">
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-semibold">مبلغ:</span> {parseInt(paymentData.amount).toLocaleString('fa-IR')} تومان
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">شماره تراکنش:</span> {paymentData.transactionId}
              </p>
            </div>
          )}
        </div>

        <div className="mb-8">
          <div className="relative w-32 h-32 mx-auto">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                className="text-gray-200"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="58"
                cx="64"
                cy="64"
              />
              <circle
                className="text-blue-600 transition-all duration-1000 ease-linear"
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 58}
                strokeDashoffset={2 * Math.PI * 58 * (1 - (5 - countdown) / 5)}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="58"
                cx="64"
                cy="64"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-bold text-blue-600">{countdown}</span>
            </div>
          </div>

          <p className="text-gray-500 mt-4">
            ثانیه تا هدایت به صفحه نتیجه
          </p>
        </div>

        <div className="flex items-center justify-center space-x-2 space-x-reverse">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        <p className="text-xs text-gray-400 mt-8">
          این یک درگاه پرداخت آزمایشی است
        </p>
      </div>
    </div>
  );
};

export default FakeGateway;
