import React from 'react';
import { Card, Typography, Space, Divider, Flex, Alert } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { IconInfoCircleFilled } from '@tabler/icons-react';

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
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        width: '100%'
      }}
      styles={{ body: { padding: '16px' } }}
    >
      <Title level={5} style={{ marginBottom: '16px', fontWeight: 'bold', fontSize: '20px' }}>
        خلاصه فاکتور
      </Title>

      <Flex
        align="flex-start"
        gap={8}
        style={{
          backgroundColor: '#eef9fe',
          border: '0px solid #1a181c',
          borderRadius: '8px',
          marginBottom: '10px',
          padding: '12px'
        }}
      >
        <IconInfoCircleFilled size={18} color="#2196f3" style={{ flexShrink: 0, marginTop: '2px' }} />
        <Text style={{ color: '#196d94', fontSize: '14px', fontWeight: 400 }}>
          فاکتور رسمی پس از پرداخت و ثبت سفارش، در صفحه جزئیات سفارش قابل دانلود است.
        </Text>
      </Flex>

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Items Count */}
        <Flex justify="space-between" align="center">
          <Text type="secondary">
            قیمت کالا‌ها ({orderfinalreceipt.sellers.reduce((total, seller) => 
              total + seller.items.reduce((sum, item) => sum + item.item.count, 0), 0
            )} عدد)
          </Text>
          <Text fontWeight={700} style={{ fontSize: '14px', fontWeight: 700 }}>
            {formatPrice(orderfinalreceipt.totalPriceApply)} تومان
          </Text>
        </Flex>

        {/* Shipping */}
        <Flex justify="space-between" align="center">
          <Text type="secondary">هزینه ارسال</Text>
          <Text fontWeight={700} style={{ fontSize: '14px', fontWeight: 700 }}>رایگان</Text>
        </Flex>

        {/* Discount if exists */}
        {orderfinalreceipt.totalPriceApply !== orderfinalreceipt.totalPriceToPay && (
          <Flex justify="space-between" align="center">
            <Text style={{ color: '#4caf50' }}>سود شما از این خرید</Text>
            <Text fontWeight={700} style={{ fontSize: '16px', fontWeight: 700, color: '#4caf50' }}>
              {formatPrice(orderfinalreceipt.totalPriceApply - orderfinalreceipt.totalPriceToPay)} تومان
            </Text>
          </Flex>
        )}

        <Divider style={{ margin: '8px 0', borderColor: '#e0e0e0' }} />

        {/* Final Total */}
        <Flex justify="space-between" align="center">
          <Text fontWeight={400} style={{ fontSize: '12px', fontWeight: '400' }}>مبلغ قابل پرداخت</Text>
          <Text strong style={{ fontSize: '14px', color: '#000' }}>
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