import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useDispatch } from 'react-redux';
import { Button, Loader, Alert } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { 
  CheckCircleOutlined, 
  DollarOutlined, 
  InfoCircleOutlined,
  HomeOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import { getApiUrl } from '../../../Libs/utils/apiutils/apiutils';
import { fetchCartData } from '../../../redux/cart/cartdata/cartDataGetActions';
import { setInitial } from '../../../redux/cart';

const CODPaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { orderId, sellerId, amount } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [isAlreadyConfirmed, setIsAlreadyConfirmed] = useState(false);

  // Reset state when component mounts or location changes
  useEffect(() => {

    // Reset all state
    setLoading(false);
    setOrderDetails(null);
    setLoadingDetails(true);
    setIsAlreadyConfirmed(false);

    if (!orderId || !amount) {
      notifications.show({
        title: "خطا",
        message: "اطلاعات پرداخت یافت نشد",
        color: "red",
      });
      navigate('/payment-method');
      return;
    }
    
    checkOrderStatus();
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
      
      let currentOrder = null;

      if (ordersData.success && ordersData.orders && Array.isArray(ordersData.orders)) {
        currentOrder = ordersData.orders.find(order => 
          order.orderId === orderId
        );
      }
      
      
      if (currentOrder) {
        setOrderDetails(currentOrder);
        
        // Check if COD is already confirmed (order status changed from pending)
        const isConfirmed = 
          currentOrder.status === 'processing' || 
          currentOrder.status === 'complete';

        
        if (isConfirmed) {
          setIsAlreadyConfirmed(true);
          setLoadingDetails(false);
          
          notifications.show({
            title: "اطلاع",
            message: "این سفارش قبلاً تایید شده است",
            color: "blue",
          });
          
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

      setLoadingDetails(false);

    } catch (error) {
      setLoadingDetails(false);
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

  const handleConfirmCOD = async () => {
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
      // Call COD confirmation endpoint
      const confirmResponse = await fetch(getApiUrl('/payment/cod/confirm'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId,
          sellerId: sellerId || null,
          amount,
          payment_method: 'cod',
        }),
      });

      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json();
        throw new Error(errorData.message || 'Failed to confirm COD order');
      }

      const confirmData = await confirmResponse.json();

      // Refresh cart data after successful confirmation
      await refreshCartData();

      notifications.show({
        title: "تایید موفق",
        message: "سفارش شما با موفقیت ثبت شد",
        color: "green",
      });

      dispatch(fetchCartData());

      // Redirect to orders page
      setTimeout(() => {
        navigate('/account/orders', {
          state: { 
            orderId: orderId,
            paymentMethod: 'cod' 
          }
        });
      }, 1500);

    } catch (error) {
      console.error('COD confirmation error:', error);
      notifications.show({
        title: "خطا در ثبت سفارش",
        message: error.message || "مشکلی در پردازش سفارش پیش آمد",
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

  // Show message if order is already confirmed
  if (isAlreadyConfirmed) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">سفارش تایید شده</h2>
            <p className="text-gray-600">این سفارش قبلاً تایید شده است</p>
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

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <DollarOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">پرداخت در محل</h1>
            <p className="text-sm text-gray-500">شماره سفارش: {orderId}</p>
          </div>
        </div>
      </div>

      {/* COD Info Card */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 mb-4 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm opacity-90 mb-1">شما پرداخت در محل را انتخاب کرده‌اید</p>
            <p className="text-3xl font-bold">{formatPrice(amount)} تومان</p>
          </div>
          <HomeOutlined style={{ fontSize: '48px', opacity: 0.3 }} />
        </div>
      </div>

      {/* Payment Details Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <h2 className="text-lg font-bold text-gray-800 mb-4">جزئیات سفارش</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <span className="text-gray-600">مبلغ قابل پرداخت در محل</span>
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
            <span className="text-gray-600">روش پرداخت</span>
            <span className="text-gray-800 font-medium">پرداخت در محل (COD)</span>
          </div>
        </div>

        <Alert
          color="blue"
          icon={<InfoCircleOutlined />}
          className="mt-4"
        >
          مبلغ سفارش را هنگام تحویل کالا به پیک پرداخت خواهید کرد. سفارش شما با وضعیت "پرداخت نشده" ثبت می‌شود و پس از پرداخت در محل، وضعیت آن به "پرداخت شده" تغییر خواهد کرد.
        </Alert>

        {/* COD Instructions */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            <ShoppingOutlined />
            راهنمای پرداخت در محل
          </h3>
          <ul className="text-sm text-gray-600 space-y-2 mr-6">
            <li className="list-disc">مبلغ کل سفارش را آماده نگه دارید</li>
            <li className="list-disc">فقط پول نقد قابل قبول است</li>
            <li className="list-disc">لطفاً مبلغ دقیق را آماده داشته باشید</li>
            <li className="list-disc">پس از تحویل، رسید پرداخت دریافت کنید</li>
          </ul>
        </div>
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
          color="green"
          disabled={loading}
          loading={loading}
          onClick={handleConfirmCOD}
          leftSection={!loading && <CheckCircleOutlined />}
        >
          {loading ? 'در حال پردازش...' : 'تایید سفارش'}
        </Button>
      </div>

      {/* Info Note */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          با تایید سفارش، شما موافقت می‌کنید که مبلغ کامل را هنگام تحویل کالا پرداخت کنید
        </p>
      </div>
    </div>
  );
};

export default CODPaymentPage;