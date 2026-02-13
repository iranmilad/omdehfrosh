import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useQueryClient, INVALIDATION_PATTERNS } from '../../../Libs/reactQuery';
import { clearCommentsState } from '../../../redux/products/productcomments/getproductcomments/getProductCommentsSlice';

const PaymentListener = () => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      queryClient.invalidateQueries({ queryKey: ['ordersByUserId'] });
    };
  }, [queryClient]);

  useEffect(() => {
    const transactionId = searchParams.get('transactionId');
    const success = searchParams.get('success') ?? 'true';
    console.log('[PAYMENT][LISTENER] page loaded', { transactionId: transactionId ? `${String(transactionId).slice(0, 12)}...` : null, success });
    if (!transactionId) {
      console.warn('[PAYMENT][LISTENER] no transactionId');
      setError('نتیجه پرداخت یافت نشد.');
      setLoading(false);
      return;
    }
    const verifyUrl = `https://panel.j2b.market/api/universal-payment/verify-payment?transactionId=${encodeURIComponent(transactionId)}&success=${encodeURIComponent(success)}`;
    
    
    fetch(verifyUrl, { method: 'GET', credentials: 'omit' })
      .then(async (res) => {
        const contentType = res.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        const text = await res.text();
        console.log('[PAYMENT][LISTENER] response', { status: res.status, isJson, textLength: text?.length });
        if (!isJson) {
          throw new Error('سرور پرداخت پاسخ معتبر برنگرداند. مطمئن شوید سرور بک‌اند روشن است (مثلاً پورت ۵۰۰۰) و سرور فرانت را یک‌بار ریستارت کرده‌اید تا پروکسی /api فعال شود.');
        }
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error('پاسخ سرور معتبر نیست.');
        }
        // Verify endpoint must not require auth; 4xx = verification failed, do not show backend auth messages
        if (!res.ok) {
          const serverMsg = data?.message || data?.msg;
          const neutralMessage = res.status === 401 || res.status === 403
            ? 'تأیید پرداخت در این مرحله انجام نشد. در حال انتقال به صفحه اصلی...'
            : (serverMsg || `خطای سرور (${res.status})`);
          setError(neutralMessage);
          return;
        }
        const { link, message } = data;
        const msg = (message ?? data?.msg ?? '').toString();
        // Backend may return 200 with auth message when verify requires login; treat as verification failed
        const isAuthFailureMessage = /احراز هویت|وارد شوید|لطفا وارد|ورود مجدد|توکن|unauthorized|login required/i.test(msg);
        if (isAuthFailureMessage) {
          setError('تأیید پرداخت در این مرحله انجام نشد.');
          return;
        }
        console.log('[PAYMENT][LISTENER] data', { link, message });
        if (link !== undefined || message !== undefined) {
          setResult({ message: message ?? '', link: link ?? '/' });
          // پس از پرداخت: کل دیتاهای یوزر مجدد دریافت شوند (داشبورد، سبد، سفارش، کیف پول)
          INVALIDATION_PATTERNS.AFTER_PAYMENT.forEach((key) => {
            queryClient.invalidateQueries({ queryKey: [key] });
          });
          queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'orderById' });
          queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'userTicketById' });
          dispatch(clearCommentsState());
          console.log('[PAYMENT][LISTENER] success', { link: link || '/' });
        } else {
          console.warn('[PAYMENT][LISTENER] no link/message in response', data);
          setError(data?.message || data?.msg || 'پاسخ نامعتبر از سرور');
        }
      })
      .catch((err) => {
        console.error('[PAYMENT][LISTENER] error', err?.message || err);
        setError(err?.message || 'خطا در دریافت نتیجه پرداخت');
      })
      .finally(() => setLoading(false));
  }, [searchParams, navigate, queryClient, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" style={{ marginTop: 0 }}>
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto flex items-center justify-center mb-6 animate-pulse">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">در حال تأیید پرداخت</h1>
            <div className="flex items-center justify-center space-x-2 space-x-reverse mt-6">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-gray-500 mt-6">لطفا منتظر بمانید...</p>
          </div>
        </div>
      </div>
    );
  }

  const navButtons = (
    <div style={{ marginTop: 24 }}>
      <p className="text-gray-600 text-sm mb-3" style={{ marginBottom: 12, color: '#4b5563' }}>می‌توانید به یکی از صفحات زیر بروید:</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center" style={{ gap: 12, alignItems: 'center' }}>
        <Link
          to="/basket"
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 500, minWidth: 140 }}
        >
          سبد خرید
        </Link>
        <Link
          to="/account/orders"
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
          style={{ padding: '12px 24px', border: '2px solid #d1d5db', color: '#374151', borderRadius: 8, textDecoration: 'none', fontWeight: 500, minWidth: 140 }}
        >
          سفارشات من
        </Link>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" style={{ marginTop: 0 }}>
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-red-600 rounded-full mx-auto flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-800 mb-4">خطا در پردازش</h1>
            <p className="text-gray-700 leading-relaxed">{error}</p>
            {navButtons}
          </div>
        </div>
      </div>
    );
  }

  const isSuccess = result?.message && (
    result.message.includes('موفق') || result.message.includes('successful') || result.message.includes('موفق بوده')
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-white" style={{ marginTop: 0 }}>
      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
        <div className="mb-8">
          <div className={`w-24 h-24 ${isSuccess ? 'bg-green-600' : 'bg-yellow-600'} rounded-full mx-auto flex items-center justify-center mb-6`}>
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isSuccess ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              )}
            </svg>
          </div>
          <h1 className={`text-2xl font-bold mb-4 ${isSuccess ? 'text-green-800' : 'text-yellow-800'}`}>
            {isSuccess ? 'پرداخت موفق' : 'اطلاعیه پرداخت'}
          </h1>
          <div className="bg-gray-50 rounded-lg p-6 text-right">
            <p className="text-gray-700 leading-relaxed">{result?.message}</p>
          </div>
          {navButtons}
        </div>
      </div>
    </div>
  );
};

export default PaymentListener;
