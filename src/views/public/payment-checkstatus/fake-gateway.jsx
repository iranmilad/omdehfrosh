import React, { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Button, Loader, Text, Paper, Stack } from "@mantine/core";

const FakeGateway = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [countdown, setCountdown] = useState(5);
  const [paymentData, setPaymentData] = useState({});
  const [processing, setProcessing] = useState(false);

  // Extract payment data from POST form data (primary) or URL parameters (fallback)
  useEffect(() => {
    const extractedData = {};
    
    // Get data from URL search params (fallback for old GET method)
    for (const [key, value] of searchParams.entries()) {
      extractedData[key] = value;
    }
    
    // Try to get POST data from URL params that might contain encoded data
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const decodedData = decodeURIComponent(atob(dataParam));
        const postData = JSON.parse(decodedData);
        Object.assign(extractedData, postData);
      } catch (error) {
        console.error('Error decoding POST data from URL:', error);
      }
    }

    // For POST method, data should be available through window location after form submission
    // In a real POST submission, the data would be sent to the server and then redirected
    // For this fake gateway simulation, we'll check if we can extract from the URL hash or other means

    // Handle specific data structure from your API
    const userId = extractedData.user_id || searchParams.get('user_id');
    const orderId = extractedData.order_id || searchParams.get('order_id');
    const amountToPay = extractedData.amount || searchParams.get('amount_to_pay') || searchParams.get('amount');
    const transactionId = extractedData.transactionId || extractedData.transaction_id;
    const redirectUrl = extractedData.redirect_url;
    
    // Also support alternative naming from location state
    const receiptId = orderId || extractedData.orderId || searchParams.get('orderId');
    const amount = amountToPay;
    const sellerId = extractedData.sellerId || searchParams.get('sellerId');

    setPaymentData({
      ...extractedData,
      user_id: userId,
      order_id: orderId,
      amount_to_pay: amountToPay,
      transactionId,
      redirect_url: redirectUrl,
      // Also keep alternative names for compatibility
      receiptId,
      amountToPay: amount,
      sellerId
    });

  }, [location, searchParams]);
  // MODIFIED 2026-02-09 - Updated to handle POST data extraction from form submission

  // Simulate HTTP POST to the website's payment status check endpoint
  const sendPaymentResult = async (paymentStatus) => {
    setProcessing(true);
    
    try {
      const orderIdToUse = paymentData.order_id || paymentData.receiptId || searchParams.get('order_id');
      
      // Prepare the payment data in the format expected by API: {status, body}
      const completePaymentData = {
        status: paymentStatus === 'success' ? "OK" : "FAILED",
        body: {
          order_id: orderIdToUse,
          transaction_id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount: paymentData.amount_to_pay || paymentData.amountToPay || '0',
          user_id: paymentData.user_id || '',
          sellerId: paymentData.sellerId || '',
          timestamp: new Date().toISOString(),
          gateway: 'fake_gateway',
          payment_method: 'online',
          ...(paymentStatus === 'failed' && { 
            error_message: 'Payment was cancelled by user',
            error_code: 'USER_CANCELLED'
          })
        }
      };

      // Create URL with the complete payment data as a single parameter
      const queryString = new URLSearchParams({
        paymentData: JSON.stringify(completePaymentData)
      }).toString();
      
      // Navigate to payment status check with complete payment data
      const targetUrl = `${window.location.origin}/payment-statuscheck?${queryString}`;
      
      window.location.href = targetUrl;
      
    } catch (error) {
      console.error('Error sending payment result:', error);
      setProcessing(false);
    }
  };

  // Auto-send success result after countdown
  useEffect(() => {
    if (paymentData.order_id || paymentData.receiptId || searchParams.get('order_id')) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            sendPaymentResult('success');
            clearInterval(timer);
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [paymentData, searchParams]);

  // Handle manual payment confirmation (for testing)
  const handleManualConfirm = () => {
    sendPaymentResult('success');
  };

  // Handle payment failure simulation
  const handleFailPayment = () => {
    sendPaymentResult('failed');
  };

  return (
    <Paper padding="md" shadow="xs" radius="md" style={{ backgroundColor: "#f8f9fa" }}>
      <Stack spacing="lg">
        <Text size="xl" fw="600" ta="center" c="blue.8">
          درگاه پرداخت شبیه‌ساز
        </Text>
        
        <Text size="sm" ta="center" c="gray.6">
          🌐 این یک درگاه خارجی است (خارج از وب‌سایت شما)
        </Text>
        
        {/* Payment Details */}
        {(paymentData.order_id || paymentData.receiptId || searchParams.get('order_id')) && (
          <Paper p="md" bg="blue.0" radius="sm">
            <Stack spacing="sm">
              <Text size="sm" c="gray.7" fw="500">جزئیات پرداخت:</Text>
              {paymentData.user_id && (
                <Text size="xs">شناسه کاربر: {paymentData.user_id}</Text>
              )}
              {(paymentData.order_id || paymentData.receiptId) && (
                <Text size="xs">شماره سفارش: {paymentData.order_id || paymentData.receiptId}</Text>
              )}

              {paymentData.sellerId && (
                <Text size="xs">شناسه فروشنده: {paymentData.sellerId}</Text>
              )}
              {(paymentData.amount_to_pay || paymentData.amountToPay) && (
                <Text size="sm" fw="500" c="green.8">
                  مبلغ قابل پرداخت: {parseInt(paymentData.amount_to_pay || paymentData.amountToPay)?.toLocaleString()} تومان
                </Text>
              )}
            </Stack>
          </Paper>
        )}

        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && (
          <Paper p="sm" bg="yellow.0" radius="sm">
            <Text size="xs" c="gray.6">Debug - Payment Data:</Text>
            <Text size="xs" c="gray.6" style={{ wordBreak: 'break-all' }}>
              {JSON.stringify(paymentData, null, 2)}
            </Text>
          </Paper>
        )}

        {!processing ? (
          <>
            <Stack align="center" spacing="sm">
              <Loader size="md" color="blue" />
              <Text size="sm" c="gray">در حال پردازش پرداخت...</Text>
              <Text ta="center" size="sm" c="blue.6">
                پس از {countdown} ثانیه نتیجه پرداخت به وب‌سایت ارسال می‌شود.
              </Text>
            </Stack>

            {/* Manual confirmation buttons for testing */}
            <Stack spacing="sm">
              <Button 
                onClick={handleManualConfirm} 
                variant="filled"
                color="green"
                size="md"
              >
                ✓ تایید پرداخت (موفق)
              </Button>

              <Button 
                onClick={handleFailPayment} 
                variant="filled"
                color="red"
                size="md"
              >
                ✗ لغو پرداخت (ناموفق)
              </Button>
            </Stack>
          </>
        ) : (
          <Stack align="center" spacing="sm">
            <Loader size="md" color="green" />
            <Text size="sm" c="green">در حال ارسال نتیجه به وب‌سایت...</Text>
          </Stack>
        )}

        {/* Instructions for testing */}
        <Paper p="sm" bg="gray.0" radius="sm">
          <Text size="xs" c="gray.6" ta="center">
            این شبیه‌ساز درگاه خارجی است که نتیجه پرداخت را به وب‌سایت شما ارسال می‌کند.
          </Text>
        </Paper>
      </Stack>
    </Paper>
  );
};

export default FakeGateway;