// File: src/views/public/walletpayment/index.jsx
// Complete updated version with proper order status checking

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Loader, Alert } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { CheckCircleOutlined, WalletOutlined, InfoCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { getApiUrl } from '../../../Libs/utils/apiutils/apiutils';
import { fetchCartData } from '../../../redux/cart/cartdata/cartDataGetActions';
import { setInitial } from '../../../redux/cart';

const WalletPaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { orderId, sellerId, amount } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [isAlreadyPaid, setIsAlreadyPaid] = useState(false);

  // Reset state when component mounts or location changes
  useEffect(() => {

    // Reset all state
    setLoading(false);
    setWalletBalance(0);
    setOrderDetails(null);
    setLoadingDetails(true);
    setIsAlreadyPaid(false);

    if (!orderId || !amount) {
      notifications.show({
        title: "خطا",
        message: "اطلاعات پرداخت یافت نشد",
        color: "red",
      });
      navigate('/payment');
      return;
    }
    
    checkOrderStatus();
    fetchWalletBalance();
  }, [orderId, amount, location.key]);

  const checkOrderStatus = async () => {
    const token = localStorage.getItem("user");

    if (!token) {
      notifications.show({
        title: "خطا",
        message: "لطفاً وارد حساب کاربری خود شوید",
        color: "red",
      });
      navigate('/login');
      return;
    }


    try {
      // Fetch from user's orders list
      const ordersResponse = await fetch(getApiUrl('/orders/allordersbyuserid'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!ordersResponse.ok) {
        throw new Error('Failed to fetch orders');
      }

      const ordersData = await ordersResponse.json();
      
      // Find the current order
      let currentOrder = null;

      if (ordersData.success && ordersData.orders && Array.isArray(ordersData.orders)) {
        currentOrder = ordersData.orders.find(order => 
          order.orderId === orderId
        );
      }
      
      
      if (currentOrder) {
        setOrderDetails(currentOrder);
        
        // Check multiple payment indicators
        const isPaidStatus = 
          currentOrder.isPaid === 'paid' || 
          currentOrder.isPaid === true ||
          currentOrder.paymentMethod === 'wallet' ||
          currentOrder.status === 'paid';
        
 
        
        if (isPaidStatus) {
          setIsAlreadyPaid(true);
          setLoadingDetails(false);
          
          notifications.show({
            title: "اطلاع",
            message: "این سفارش قبلاً پرداخت شده است",
            color: "blue",
          });
          
          // Redirect to orders page after 2 seconds
          setTimeout(() => {
            navigate('/account/orders', {
              state: { 
                orderId: orderId 
              }
            });
          }, 2000);
          return;
        }
      } else {
      }

      // If we reach here, order is not paid yet
      setLoadingDetails(false);

    } catch (error) {
      // console.error('Error checking order status:', error);
      // Don't block payment if there's an error checking status
      setLoadingDetails(false);
    }
  };

  const fetchWalletBalance = async () => {
    const token = localStorage.getItem("user");

    if (!token) {
      notifications.show({
        title: "خطا",
        message: "لطفاً وارد حساب کاربری خود شوید",
        color: "red",
      });
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(getApiUrl('/user-myaccounts/wallet'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        console.error('Wallet fetch failed:', response.status);
        const errorData = await response.json();
        console.error('Wallet error:', errorData);
        throw new Error('Failed to fetch wallet balance');
      }

      const data = await response.json();
      setWalletBalance(data.wallet?.balance || data.balance || 0);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      notifications.show({
        title: "خطا",
        message: "خطا در دریافت موجودی کیف پول",
        color: "red",
      });
    }
  };

  const refreshCartData = async () => {
    const token = localStorage.getItem("user");
    if (!token) return;
    
    try {
      const response = await fetch(getApiUrl("/cart"), {
        method: "GET",
        headers: { 
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },        
      });
      
      if (response.ok) {
        const serverData = await response.json();
        const newCartData = { 
          cart: serverData.cart || [], 
          totalPrice: serverData.total || 0 
        };
        
        if (newCartData.cart.length > 0) {
          dispatch(setInitial(newCartData.cart));
        } else {
          dispatch(setInitial([]));
        }
      }
    } catch (error) {
      console.error("Cart refresh error:", error);
    }
  };

  const handlePayment = async () => {
    if (walletBalance < amount) {
      notifications.show({
        title: "موجودی ناکافی",
        message: "موجودی کیف پول شما کافی نیست",
        color: "red",
      });
      return;
    }

    const token = localStorage.getItem("user");

    if (!token) {
      notifications.show({
        title: "خطا",
        message: "لطفاً وارد حساب کاربری خود شوید",
        color: "red",
      });
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Deduct wallet balance
      const deductResponse = await fetch(getApiUrl('/user-myaccounts/wallet/deduct'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          description: `پرداخت سفارش ${orderId}${sellerId ? ` - فروشنده ${sellerId}` : ''}`,
        }),
      });

      if (!deductResponse.ok) {
        const errorData = await deductResponse.json();
        throw new Error(errorData.message || 'Failed to deduct from wallet');
      }

      const deductData = await deductResponse.json();

      // Step 2: Call payment webhook to update order status
      const webhookResponse = await fetch(getApiUrl('/payment/paymentwebhook'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'OK',
          body: {
            order_id: orderId,
            sellerId: sellerId || null,
            amount,
            payment_method: 'wallet',
            transaction_id: deductData.transaction?.transactionId || `wallet_txn_${Date.now()}`,
            user_id: deductData.transaction?.userId,
          },
        }),
      });

      if (webhookResponse.ok) {
        // Rollback wallet deduction if webhook fails
        await fetch(getApiUrl('/user-myaccounts/wallet/refund'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount,
            description: `بازگشت وجه سفارش ${orderId} - خطا در پردازش`,
          }),
        });
        
        throw new Error('Failed to process payment');
      }

      // Refresh cart data after successful payment
      await refreshCartData();

      notifications.show({
        title: "پرداخت موفق",
        message: "پرداخت با موفقیت انجام شد",
        color: "green",
      });

      dispatch(fetchCartData());

      // Redirect to orders page
      setTimeout(() => {
        navigate('/account/orders', {
          state: { 
            orderId: orderId,
            paymentMethod: 'wallet' 
          }
        });
      }, 1500);

    } catch (error) {
      console.error('Payment error:', error);
      notifications.show({
        title: "خطا در پرداخت",
        message: error.message || "مشکلی در پردازش پرداخت پیش آمد",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return price?.toLocaleString('fa-IR') || '0';
  };

  if (loadingDetails) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  // Show message if order is already paid
  if (isAlreadyPaid) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">سفارش پرداخت شده</h2>
            <p className="text-gray-600">این سفارش قبلاً پرداخت شده است</p>
            <p className="text-sm text-gray-500">شماره سفارش: {orderId}</p>
            <Button
              size="lg"
              color="blue"
              onClick={() => navigate('/account/orders')}
              className="mt-4"
            >
              مشاهده سفارش‌ها
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const insufficientBalance = walletBalance < amount;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <WalletOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">پرداخت با کیف پول</h1>
            <p className="text-sm text-gray-500">شماره سفارش: {orderId}</p>
          </div>
        </div>
      </div>

      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 mb-4 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm opacity-90 mb-1">موجودی کیف پول</p>
            <p className="text-3xl font-bold">{formatPrice(walletBalance)} تومان</p>
          </div>
          <WalletOutlined style={{ fontSize: '48px', opacity: 0.3 }} />
        </div>
      </div>

      {/* Payment Amount Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <h2 className="text-lg font-bold text-gray-800 mb-4">جزئیات پرداخت</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <span className="text-gray-600">مبلغ قابل پرداخت</span>
            <span className="text-lg font-bold text-gray-800">
              {formatPrice(amount)} تومان
            </span>
          </div>

          {sellerId && (
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-600">شناسه فروشنده</span>
              <span className="text-gray-800">{sellerId}</span>
            </div>
          )}

          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <span className="text-gray-600">موجودی پس از پرداخت</span>
            <span className={`text-lg font-bold ${insufficientBalance ? 'text-red-600' : 'text-green-600'}`}>
              {formatPrice(walletBalance - amount)} تومان
            </span>
          </div>
        </div>

        {insufficientBalance && (
          <Alert
            color="red"
            icon={<InfoCircleOutlined />}
            className="mt-4"
            title="موجودی ناکافی"
          >
            موجودی کیف پول شما برای این پرداخت کافی نیست. لطفاً ابتدا کیف پول خود را شارژ کنید.
          </Alert>
        )}

        {!insufficientBalance && (
          <Alert
            color="blue"
            icon={<InfoCircleOutlined />}
            className="mt-4"
          >
            با تایید پرداخت، مبلغ از کیف پول شما کسر خواهد شد.
          </Alert>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          fullWidth
          size="lg"
          variant="outline"
          onClick={() => navigate(-1)}
          disabled={loading}
        >
          انصراف
        </Button>
        
        <Button
          fullWidth
          size="lg"
          color="blue"
          disabled={insufficientBalance || loading}
          loading={loading}
          onClick={handlePayment}
          leftSection={!loading && <CheckCircleOutlined />}
        >
          {loading ? 'در حال پردازش...' : 'تایید و پرداخت'}
        </Button>
      </div>

      {/* Charge Wallet Link */}
      {insufficientBalance && (
        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/account/wallet')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            شارژ کیف پول →
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletPaymentPage;