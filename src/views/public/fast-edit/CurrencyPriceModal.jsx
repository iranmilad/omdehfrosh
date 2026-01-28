import React, { useState, useEffect } from 'react';
import { Modal, Stack, NumberInput, Text, Group, Button, Select, Loader, Center } from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { notifications } from '@mantine/notifications';
import { 
  updateCurrencyPrice, 
  getCurrencyPrice 
} from '../../../redux/currencyPrice/currencyPriceActions';
import { clearCurrencyPriceState } from '../../../redux/currencyPrice/currencyPriceSlice'

const CurrencyPriceModal = ({ opened, onClose }) => {
  const dispatch = useDispatch();
  const [priceInput, setPriceInput] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isLoadingData, setIsLoadingData] = useState(false);

  const { 
    currencyPrice, 
    currency,
    loading, 
    error, 
    successMessage 
  } = useSelector((state) => state.currencyPrice);

  // Currency options
  const currencyOptions = [
    { value: 'USD', label: 'دلار آمریکا (USD)' },
    { value: 'EUR', label: 'یورو (EUR)' },
    { value: 'CNY', label: 'یوان چین (CNY)' },
    { value: 'TRY', label: 'لیر ترکیه (TRY)' },
    { value: 'AED', label: 'درهم امارات (AED)' },
  ];

  // Load current price when modal opens
  useEffect(() => {
    if (opened) {
      setIsLoadingData(true);
      // Reset first
      setPriceInput('');
      setSelectedCurrency('USD');
      
      dispatch(getCurrencyPrice()).finally(() => {
        setIsLoadingData(false);
      });
    }
  }, [opened, dispatch]);

  // Set input values when price is loaded from backend
  useEffect(() => {
    if (opened && !isLoadingData) {
      if (currencyPrice !== null && currencyPrice !== undefined) {
        setPriceInput(currencyPrice.toString());
      } else {
        setPriceInput(''); // Clear if no price exists
      }
      
      if (currency) {
        setSelectedCurrency(currency);
      } else {
        setSelectedCurrency('USD'); // Default fallback
      }
    }
  }, [currencyPrice, currency, opened, isLoadingData]);

  // Handle success message
  useEffect(() => {
    if (successMessage) {
      notifications.show({
        title: 'موفق',
        message: successMessage,
        color: 'green',
      });
      onClose();
      dispatch(clearCurrencyPriceState());
    }
  }, [successMessage, onClose, dispatch]);

  // Handle error message
  useEffect(() => {
    if (error) {
      notifications.show({
        title: 'خطا',
        message: error.message || 'خطا در ثبت قیمت ارز',
        color: 'red',
      });
      dispatch(clearCurrencyPriceState());
    }
  }, [error, dispatch]);

  const handleSubmit = async () => {
    if (!priceInput || isNaN(priceInput) || parseFloat(priceInput) <= 0) {
      notifications.show({
        title: 'خطا',
        message: 'لطفا قیمت معتبر وارد کنید',
        color: 'red',
      });
      return;
    }

    await dispatch(updateCurrencyPrice({ 
      price: parseFloat(priceInput),
      currency: selectedCurrency 
    }));
  };

  const handleClose = () => {
    // Don't reset values on close, they'll be reset on next open
    dispatch(clearCurrencyPriceState());
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      zIndex={1006}
      title={
        <Text size="lg" fw={600} c="#1f2937">
          ثبت قیمت ارز
        </Text>
      }
      centered
      size="md"
      overlayProps={{
        opacity: 0.55,
        blur: 3,
      }}
      styles={{
        content: {
          borderRadius: '12px',
        },
        header: {
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          padding: '16px 24px',
        },
        body: {
          padding: '24px',
        },
      }}
      // Fix for screen margin issue when modal opens
      lockScroll={false}
      removeScrollBar={false}
      trapFocus={false}
      withCloseButton={true}
    >
      {isLoadingData ? (
        <Center py="xl">
          <Loader size="md" color="#3b82f6" />
        </Center>
      ) : (
        <Stack spacing="lg">
          <Select
            label={
              <Text size="sm" fw={500} c="#374151" mb={8}>
                نوع ارز
              </Text>
            }
            placeholder="انتخاب ارز"
            data={currencyOptions}
            value={selectedCurrency}
            onChange={setSelectedCurrency}
            size="md"
            required
            disabled={loading}
            styles={{
              input: {
                borderColor: '#d1d5db',
                backgroundColor: '#ffffff',
                color: '#1f2937',
                fontWeight: 500,
                '&:focus': {
                  borderColor: '#3b82f6',
                },
                '&:disabled': {
                  backgroundColor: '#f3f4f6',
                  color: '#9ca3af',
                  opacity: 0.7,
                },
              },
              dropdown: {
                borderColor: '#d1d5db',
              },
              item: {
                color: '#1f2937',
                '&[data-selected]': {
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                },
                '&:hover': {
                  backgroundColor: '#eff6ff',
                },
              },
            }}
          />

          <NumberInput
            label={
              <Text size="sm" fw={500} c="#374151" mb={8}>
                قیمت ارز (به تومان)
              </Text>
            }
            placeholder="مثلا: 55000"
            value={priceInput}
            onChange={(val) => setPriceInput(val)}
            onKeyPress={handleKeyPress}
            min={0}
            step={100}
            required
            size="md"
            thousandsSeparator=","
            disabled={loading}
            styles={{
              input: {
                textAlign: 'right',
                borderColor: '#d1d5db',
                backgroundColor: '#ffffff',
                color: '#1f2937',
                fontWeight: 500,
                fontSize: '16px',
                '&:focus': {
                  borderColor: '#3b82f6',
                },
                '&:disabled': {
                  backgroundColor: '#f3f4f6',
                  color: '#9ca3af',
                  opacity: 0.7,
                },
                '&::placeholder': {
                  color: '#9ca3af',
                },
              },
            }}
          />
          
          <Text 
            size="sm" 
            c={currencyPrice ? '#059669' : '#6b7280'}
            style={{
              backgroundColor: currencyPrice ? '#d1fae5' : '#f3f4f6',
              padding: '12px 16px',
              borderRadius: '8px',
              border: `1px solid ${currencyPrice ? '#a7f3d0' : '#e5e7eb'}`,
              lineHeight: 1.6,
            }}
          >
            {currencyPrice 
              ? '✓ قیمت فعلی نمایش داده شده است. می‌توانید آن را به‌روزرسانی کنید.'
              : 'ℹ این قیمت برای محاسبات ارزی در سیستم استفاده خواهد شد'}
          </Text>

          <Group position="right" mt="md" spacing="sm">
            <Button
              variant="light"
              color="gray"
              onClick={handleClose}
              disabled={loading}
              size="md"
              styles={{
                root: {
                  backgroundColor: '#f3f4f6',
                  color: '#4b5563',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: '#e5e7eb',
                  },
                  '&:disabled': {
                    backgroundColor: '#f9fafb',
                    color: '#d1d5db',
                  },
                },
              }}
            >
              انصراف
            </Button>
            <Button
              onClick={handleSubmit}
              loading={loading}
              disabled={!priceInput || parseFloat(priceInput) <= 0}
              size="md"
              styles={{
                root: {
                  backgroundColor: '#f59e0b',
                  color: '#ffffff',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#d97706',
                  },
                  '&:disabled': {
                    backgroundColor: '#fde68a',
                    color: '#d1d5db',
                    opacity: 0.6,
                  },
                },
              }}
            >
              {loading ? 'در حال ثبت...' : 'ثبت قیمت'}
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
};

export default CurrencyPriceModal;