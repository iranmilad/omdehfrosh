import React from 'react';
import { Card, Typography, Space, Divider, Flex, Alert } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const PaymentSummary = ({ orderfinalreceipt }) => {
  const formatPrice = (price) => {
    return price?.toLocaleString('fa-IR') || '0';
  };

  if (!orderfinalreceipt?.sellers?.length) {
    return null;
  }

  return (
    <Card 
      style={{ 
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}
    >

      <Title level={5} style={{ marginBottom: '16px', fontWeight: 'bold' }}>
        خلاصه فاکتور
      </Title>

                        <Alert
                    message="فاکتور رسمی پس از پرداخت و ثبت سفارش، در صفحه جزئیات سفارش قابل دانلود است."
                    type="info"
                    showIcon
                    icon={<InfoCircleOutlined />}
                    style={{ 
                      backgroundColor: '#e3f2fd',
                      border: '1px solid #90caf9',
                      borderRadius: '8px'
                    }}
                  />

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Items Count */}
        <Flex justify="space-between" align="center">
          <Text type="secondary">
            قیمت کالا‌ها ({orderfinalreceipt.sellers.reduce((total, seller) => 
              total + seller.items.reduce((sum, item) => sum + item.item.count, 0), 0
            )} عدد)
          </Text>
          <Text strong style={{ fontSize: '14px' }}>
            {formatPrice(orderfinalreceipt.totalPriceApply)} تومان
          </Text>
        </Flex>

        {/* Shipping */}
        <Flex justify="space-between" align="center">
          <Text type="secondary">هزینه ارسال</Text>
          <Text strong style={{ fontSize: '14px' }}>رایگان</Text>
        </Flex>

        {/* Discount if exists */}
        {orderfinalreceipt.totalPriceApply !== orderfinalreceipt.totalPriceToPay && (
          <Flex justify="space-between" align="center">
            <Text style={{ color: '#4caf50' }}>سود شما از این خرید</Text>
            <Text strong style={{ fontSize: '15px', color: '#4caf50' }}>
              {formatPrice(orderfinalreceipt.totalPriceApply - orderfinalreceipt.totalPriceToPay)} تومان
            </Text>
          </Flex>
        )}

        <Divider style={{ margin: '8px 0', borderColor: '#e0e0e0' }} />

        {/* Final Total */}
        <Flex justify="space-between" align="center">
          <Text strong style={{ fontSize: '15px' }}>مبلغ قابل پرداخت</Text>
          <Text strong style={{ fontSize: '18px', color: '#000' }}>
            {formatPrice(orderfinalreceipt.totalPriceToPay)} تومان
          </Text>
        </Flex>

        {/* VAT Notice */}
        <Flex align="flex-start" gap={8}>
          <InfoCircleOutlined style={{ color: '#757575', fontSize: '16px', marginTop: '2px' }} />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            قیمت‌ها شامل ۱۰٪ مالیات بر ارزش افزوده است.
          </Text>
        </Flex>
      </Space>
    </Card>
  );
};

export default PaymentSummary;