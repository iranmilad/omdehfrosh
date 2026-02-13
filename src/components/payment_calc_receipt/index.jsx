import React, { useEffect } from 'react';
import { Card, Typography, Space, Divider, Row, Col, Tag, Alert, Flex, Image } from 'antd';
import { ShoppingOutlined, CheckCircleOutlined, InfoCircleOutlined, DollarOutlined, FileTextOutlined, WalletOutlined } from '@ant-design/icons';
import { Button } from '@mantine/core';
import { useDispatch, useSelector } from "react-redux";
import { fetchFinalReceipt } from "../../redux/cartfinalreceipt/cartfinalreceipt";
import { updateFinalReceiptPaymentMethod } from "../../redux/cartfinalreceipt/cartfinalreceiptupdategateway/cartFinalReceiptUpdateGatewayActions";
import { useNavigate } from "react-router";
import { requestFinalReceipt } from "../../redux/cartfinalreceipt/cartfinalreceiptrequestreceipt/cartFinalReceiptRequestReceiptActions";
import { notifications } from "@mantine/notifications";
import ImageIcon from '../../resources/defaultImageIcon';
import { processPayment } from '../../utils/paymentHelper';

const { Title, Text } = Typography;

// Helper function to validate image source
const isValidImageSource = (src) => {
  if (!src) return false;
  if (Array.isArray(src)) {
    if (src.length === 0) return false;
    const firstItem = src[0];
    if (!firstItem || typeof firstItem !== 'string' || firstItem.trim() === '') return false;
    // Check if it's a valid path (starts with / or http)
    if (!firstItem.startsWith('/') && !firstItem.startsWith('http')) return false;
    return true;
  }
  if (typeof src !== 'string') return false;
  if (src.trim() === '') return false;
  // Check if it's a valid path (starts with / or http)
  if (!src.startsWith('/') && !src.startsWith('http')) return false;
  return true;
};

// Get valid image source
const getValidImageSource = (src) => {
  if (!src) return null;
  if (Array.isArray(src)) {
    if (src.length === 0) return null;
    const firstItem = src[0];
    if (!firstItem || typeof firstItem !== 'string' || firstItem.trim() === '') return null;
    if (!firstItem.startsWith('/') && !firstItem.startsWith('http')) return null;
    return firstItem;
  }
  if (typeof src !== 'string' || src.trim() === '') return null;
  if (!src.startsWith('/') && !src.startsWith('http')) return null;
  return src;
};

const PaymentCalcReceipt = ({ children = "پرداخت", prev, gateway, queryClient }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();









  const { orderfinalreceipt, loadingfinalreceipt, errorfinalreceipt } = useSelector(
    (state) => state.cartfinalreceipt
  );


  const getOrderIdForSeller = (sellerId) => {
    if (!orderfinalreceipt?.orderTracking) return null;
    const tracking = orderfinalreceipt.orderTracking.find(
      track => track.supplierId === sellerId
    );
    return tracking ? tracking.orderId : null;
  };

  const applySettings = async (sellerId = null) => {
    dispatch(updateFinalReceiptPaymentMethod({ paymentMethod: gateway }));
    dispatch(fetchFinalReceipt());

    // Get orderId for this seller
    const orderId = getOrderIdForSeller(sellerId);

    if (!orderId) {
      notifications.show({
        title: "خطا",
        message: "شناسه سفارش یافت نشد!",
        color: "red",
      });
      return;
    }

    // Calculate amount for this seller
    let amount = 0;
    if (sellerId && orderfinalreceipt?.sellers) {
      const seller = orderfinalreceipt.sellers.find(s => s.seller.id === sellerId);
      amount = seller?.priceApplyEachSeller || 0;
    } else {
      amount = orderfinalreceipt?.totalPriceToPay || 0;
    }

    // Determine COD by paymentMethod (type), not name; backend still receives info.name
    const isCODPayment = gateway?.paymentMethod === "cod";
    
    // For COD and regular gateways: Use processPayment which redirects through listener

    // For all payment methods (COD, wallet, and regular gateways): Use processPayment
    // This will redirect to listener (COD/wallet) or gateway (regular gateways)
    console.log('[PAYMENT][BASKET] پرداخت (order)', { order_id: orderId, amount, gateway: gateway?.name });
    try {
      const success = await processPayment({
        order_id: orderId,
        amount: amount,
        gateway: gateway.name
      });
      console.log('[PAYMENT][BASKET] processPayment returned', success);
      // MODIFIED 2026-02-09 - Removed payment_type field - backend will determine from gateway name
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ["userInitialData"] });
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        queryClient.invalidateQueries({ queryKey: ["finalReceipt"] });
        queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
      }
    } catch (error) {
      const status = error?.response?.status;
      const msg = String(error?.message || '');
      const is401 = status === 401 || msg.includes('401') || msg.toLowerCase().includes('unauthorized');
      if (is401) return; // relogin modal handles; do not invalidate (would cause excessive refetches)
      console.error('Error in applySettings:', error);
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ["userInitialData"] });
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        queryClient.invalidateQueries({ queryKey: ["finalReceipt"] });
        queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
      }
    }
  };

  // Handle wallet payment from order - use processPayment (same flow as gateway payments)
  const handleWalletPayment = async (sellerId = null) => {
    const orderId = getOrderIdForSeller(sellerId);

    if (!orderId) {
      notifications.show({
        title: "خطا",
        message: "شناسه سفارش یافت نشد!",
        color: "red",
      });
      return;
    }

    // Calculate amount for this seller
    let amount = 0;
    if (sellerId && orderfinalreceipt?.sellers) {
      const seller = orderfinalreceipt.sellers.find(s => s.seller.id === sellerId);
      amount = seller?.priceApplyEachSeller || 0;
    } else {
      amount = orderfinalreceipt?.totalPriceToPay || 0;
    }

    // Use processPayment for wallet; backend receives info.name (e.g. "کیف پول")
    console.log('[PAYMENT][BASKET] پرداخت از کیف پول (order)', { order_id: orderId, amount, gateway: gateway?.name });
    try {
      const success = await processPayment({
        order_id: orderId,
        amount: amount,
        gateway: gateway?.name
      });
      console.log('[PAYMENT][BASKET] processPayment (wallet) returned', success);
      // MODIFIED 2026-02-09 - Removed payment_type field, using gateway: 'wallet' instead
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ["userInitialData"] });
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        queryClient.invalidateQueries({ queryKey: ["finalReceipt"] });
        queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
      }
    } catch (error) {
      const status = error?.response?.status;
      const msg = String(error?.message || '');
      const is401 = status === 401 || msg.includes('401') || msg.toLowerCase().includes('unauthorized');
      if (is401) return; // relogin modal handles; do not invalidate (would cause excessive refetches)
      console.error('Error in wallet payment from order:', error);
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ["userInitialData"] });
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        queryClient.invalidateQueries({ queryKey: ["finalReceipt"] });
        queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
      }
    }
  };

  const applyReceipt = async (sellerId) => {
    const orderId = getOrderIdForSeller(sellerId);
    
    if (!orderId) {
      notifications.show({
        title: "خطا",
        message: "شناسه سفارش یافت نشد!",
        color: "red",
      });
      return;
    }

    const response = await dispatch(requestFinalReceipt({ 
      vatRequested: true, 
      orderId: orderId
    }));
    
    if (response?.payload?.status === "OK") {
      notifications.show({
        title: "پیام سیستم",
        message: "درخواست فاکتور با موفقیت ثبت شد",
        color: "green",
      });
    } else {
      notifications.show({
        title: "خطا",
        message: "مشکلی در ثبت درخواست فاکتور پیش آمد!",
        color: "red",
      });
    }
    
    dispatch(fetchFinalReceipt());
  };

  const removeReceipt = async (sellerId) => {
    const orderId = getOrderIdForSeller(sellerId);
    
    if (!orderId) {
      notifications.show({
        title: "خطا",
        message: "شناسه سفارش یافت نشد!",
        color: "red",
      });
      return;
    }

    const response = await dispatch(requestFinalReceipt({ 
      vatRequested: false, 
      orderId: orderId
    }));
    
    if (response?.payload?.status === "OK") {
      notifications.show({
        title: "پیام سیستم",
        message: "درخواست حذف فاکتور با موفقیت ثبت شد",
        color: "green",
      });
    } else {
      notifications.show({
        title: "خطا",
        message: "مشکلی در ثبت درخواست حذف فاکتور پیش آمد!",
        color: "red",
      });
    }
    
    dispatch(fetchFinalReceipt());
  };

  const renderAttributesStructured = (item) => {
    const attributes = item.item.attributes;
    
    if (!attributes || !Array.isArray(attributes) || attributes.length === 0) {
      return null;
    }

    const attributeMap = new Map();

    attributes.forEach(attrGroup => {
      Object.entries(attrGroup).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          attributeMap.set(key, value);
        }
      });
    });

    if (attributeMap.size === 0) {
      return null;
    }

    const attributeLabels = {
      'material': 'جنس',
      'جنس': 'جنس',
      'color': 'رنگ', 
      'رنگ': 'رنگ',
      'size': 'سایز',
      'سایز': 'سایز',
      'brand': 'برند',
      'برند': 'برند'
    };

    return (
      <Space size={4} wrap>
        {Array.from(attributeMap.entries()).map(([key, value]) => {
          const label = attributeLabels[key] || key;
          const isColor = key === 'color' || key === 'رنگ';

          let displayValue;
          if (typeof value === "object") {
            displayValue = value.name || JSON.stringify(value); 
          } else {
            displayValue = value;
          }

          return (
            <Text key={key} type="secondary" style={{ fontSize: '12px' }}>
              {label}: {isColor ? (
                <span style={{ 
                  display: 'inline-block',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: displayValue,
                  border: '1px solid #d9d9d9',
                  verticalAlign: 'middle',
                  marginRight: '4px'
                }} />
              ) : (
                displayValue
              )}
            </Text>
          );
        })}
      </Space>
    );
  };

  const formatPrice = (price) => {
    return price?.toLocaleString('fa-IR') || '0';
  };
  
  useEffect(() => {
    dispatch(fetchFinalReceipt());
  }, [dispatch]);

  // On 401/Unauthorized only the global relogin modal should show – no error text here
  const isAuthError = typeof errorfinalreceipt === 'string' && (
    errorfinalreceipt.includes('401') ||
    errorfinalreceipt.toLowerCase().includes('unauthorized') ||
    errorfinalreceipt.toLowerCase().includes('user not found')
  );
  if (errorfinalreceipt && !isAuthError) {
    return <Alert message="خطا" description={errorfinalreceipt} type="error" showIcon />;
  }
  if (errorfinalreceipt && isAuthError) {
    return null;
  }

  // Determine COD and wallet by paymentMethod (type); backend always receives info.name
  const isWalletPayment = gateway?.paymentMethod === "wallet";
  const isCODPayment = gateway?.paymentMethod === "cod";

  return (
    <div style={{ maxWidth: '', margin: '', padding: '' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Seller Groups */}
        {orderfinalreceipt?.sellers?.length > 0 ? (
          orderfinalreceipt.sellers.map((sellerGroup) => (
            <Card
              key={sellerGroup.seller.id}
              style={{
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >

        {/* Order Invoice Header */}
        <Card 
          style={{ 
            borderRadius: '8px',
            background: '#fff'
          }}
        >
              <Text fontWeight={700} style={{ fontSize: '20px', fontWeight: 700 }}>
                  صورتحساب سفارش
                </Text>
          

              </Card>
              {/* Seller Header */}
              <Flex justify="space-between" align="center" style={{ marginBottom: '16px' }}>
                <Space direction="vertical" size={0}>
                  <Text strong style={{ fontSize: '16px' }}>
                    <ShoppingOutlined style={{ marginLeft: '8px' }} />
                    فروشنده: {sellerGroup.seller.label}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '13px' }}>
                    شناسه فروشنده: {sellerGroup.seller.id}
                  </Text>
                </Space>
                
                <Space>
                  {/* Wallet Payment Button - Only show if wallet gateway is selected */}
                  {isWalletPayment && (
                    <Button 
                      variant="light"
                      color="green"
                      leftSection={<WalletOutlined />}
                      onClick={() => handleWalletPayment(sellerGroup.seller.id)}
                      style={{ 
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}
                    >
                      پرداخت با کیف پول
                    </Button>
                  )}
                  
                  {/* COD Payment Button - Only show if COD gateway is selected */}
                  {isCODPayment && (
                    <Button 
                      variant="light"
                      color="green"
                      leftSection={<DollarOutlined />}
                      onClick={() => applySettings(sellerGroup.seller.id)}
                      style={{ 
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}
                    >
                      تایید پرداخت در محل
                    </Button>
                  )}
                  
                  {/* Regular Payment Button - Show for all other payment methods */}
                  {!isWalletPayment && !isCODPayment && (
                    <Button 
                      variant="filled"
                      color="brand"
                      onClick={() => applySettings(sellerGroup.seller.id)}
                      style={{ 
                        minWidth: '120px',
                        fontWeight: 'bold',
                        fontSize: '15px'
                      }}
                    >
                      {children}
                    </Button>
                  )}
                </Space>
              </Flex>

              <Divider style={{ margin: '12px 0' }} />

              {/* Items List */}
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {sellerGroup.items.map((item, index) => (
                  <Card 
                    key={index}
                    type="inner"
                    style={{ 
                      backgroundColor: '#fafafa',
                      borderRadius: '8px',
                      border: '1px solid #f0f0f0'
                    }}
                  >
                    <Row gutter={16} align="middle">
                      <Col xs={4} sm={3}>
                        {(() => {
                          const imageSrc = getValidImageSource(item.item.image);
                          const hasValidImage = isValidImageSource(item.item.image);

                          return (
                            <div
                              style={{
                                width: '100%',
                                maxWidth: '60px',
                                height: '60px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: !hasValidImage ? '#f3f4f6' : 'transparent',
                                borderRadius: '8px',
                                overflow: 'hidden'
                              }}
                            >
                              {!hasValidImage ? (
                                <ImageIcon size={32} color="#9ca3af" />
                              ) : (
                                  <Image
                                    src={imageSrc}
                                    alt={item.item.name}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover',
                                    }}
                                    preview={false}
                                    fallback={
                                      <div style={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#f3f4f6'
                                      }}>
                                        <ImageIcon size={32} color="#9ca3af" />
                                      </div>
                                    }
                                  />
                              )}
                            </div>
                          );
                        })()}
                      </Col>
                      <Col xs={20} sm={21}>
                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                          <Text strong style={{ fontSize: '14px' }}>
                            {item.item.name}
                          </Text>
                          
                          {!String(item.item.productId ?? '').includes("subscription") && (
                            renderAttributesStructured(item)
                          )}

                          <Flex justify="space-between" align="center" style={{ marginTop: '8px' }}>
                            <Text type="secondary" style={{ fontSize: '13px' }}>
                              تعداد: {item.item.count}
                            </Text>
                            <Space size={8}>
                              {item.item.priceWithVat.discountedPriceWithVat && 
                               item.item.priceWithVat.discountedPriceWithVat !== item.item.priceWithVat.regularPriceWithVat && (
                                <Text 
                                  delete 
                                  type="secondary" 
                                  style={{ fontSize: '13px' }}
                                >
                                  {formatPrice(item.item.priceWithVat.regularPriceWithVat)} تومان
                                </Text>
                              )}
                              <Text strong style={{ fontSize: '15px', color: '#000' }}>
                                {formatPrice(item.item.priceWithVat.discountedPriceWithVat || item.item.priceWithVat.regularPriceWithVat)} تومان
                              </Text>
                            </Space>
                          </Flex>
                        </Space>
                      </Col>
                    </Row>
                  </Card>
                ))}

                {/* VAT Request Button */}
                <Flex justify="flex-start">
                  {sellerGroup.vatRequested ? (
                    <Button
                      onClick={() => removeReceipt(sellerGroup.seller.id)}
                      leftSection={<CheckCircleOutlined />}
                      color="green"
                      variant="filled"
                      style={{ 
                        fontWeight: 'bold'
                      }}
                    >
                      حذف فاکتور رسمی
                    </Button>
                  ) : (
                    <Button
                      onClick={() => applyReceipt(sellerGroup.seller.id)}
                      leftSection={<FileTextOutlined />}
                      variant="default"
                      style={{ 
                        fontWeight: 'bold'
                      }}
                    >
                      درخواست فاکتور رسمی
                    </Button>
                  )}
                </Flex>

                {/* Seller Total */}
                <Card 
                  style={{ 
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    border: 'none'
                  }}
                >
                  <Flex justify="space-between" align="center">
                    <Text style={{ fontSize: '14px' }}>
                      مجموع قیمت از این فروشنده
                    </Text>
                    <Text strong style={{ fontSize: '16px', color: '#000' }}>
                      {formatPrice(sellerGroup.priceApplyEachSeller)} تومان
                    </Text>
                  </Flex>
                </Card>
              </Space>
            </Card>
          ))
        ) : (
          <Card>
            <Alert message="هیچ آیتمی موجود نیست" type="warning" showIcon />
          </Card>
        )}


      </Space>
    </div>
  );
};

export default PaymentCalcReceipt;