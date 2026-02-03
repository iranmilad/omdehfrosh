import React, { useState, useEffect } from 'react';
import { Modal, Stack, NumberInput, Text, Group, Button, Select, Loader, Center } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { notifications } from '@mantine/notifications';
import { updateCurrencyPrice } from '../../../redux/currencyPrice/currencyPriceActions';
import { clearCurrencyPriceState } from '../../../redux/currencyPrice/currencyPriceSlice'

const CURRENCY_PRICE_QUERY_KEY = ["currency-price", "get"];

const CurrencyPriceModal = ({ opened, onClose, currencyPriceFromCache, currencyPriceLoading }) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [priceInput, setPriceInput] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  const { 
    currencyPrice, 
    currency,
    loading, 
    error, 
    successMessage 
  } = useSelector((state) => state.currencyPrice);

  // useApiQuery transformer returns the inner object { price, currency, ... }, not { data: { price, currency } }
  const displayPrice = currencyPriceFromCache?.price ?? currencyPrice;
  const displayCurrency = currencyPriceFromCache?.currency ?? currency ?? 'USD';
  const isLoadingData = currencyPriceLoading;

  // Currency options
  const currencyOptions = [
    { value: 'USD', label: 'دلار آمریکا (USD)' },
    { value: 'EUR', label: 'یورو (EUR)' },
    { value: 'CNY', label: 'یوان چین (CNY)' },
    { value: 'TRY', label: 'لیر ترکیه (TRY)' },
    { value: 'AED', label: 'درهم امارات (AED)' },
  ];

  // Set input values when modal opens or when cache/Redux data is available
  useEffect(() => {
    if (opened) {
      if (displayPrice !== null && displayPrice !== undefined) {
        setPriceInput(displayPrice.toString());
      } else {
        setPriceInput('');
      }
      setSelectedCurrency(displayCurrency || 'USD');
    }
  }, [opened, displayPrice, displayCurrency]);

  // Handle success message - invalidate cache so parent refetches
  useEffect(() => {
    if (successMessage) {
      notifications.show({
        title: 'موفق',
        message: successMessage,
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: CURRENCY_PRICE_QUERY_KEY });
      onClose();
      dispatch(clearCurrencyPriceState());
    }
  }, [successMessage, onClose, dispatch, queryClient]);

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
      title="ثبت قیمت ارز"
      size="md"
      centered
      overlayProps={{
        opacity: 0.55,
        blur: 3,
      }}
      lockScroll={false}
      removeScrollBar={false}
      trapFocus={false}
      withCloseButton={true}
      styles={{
        root: {
          marginTop: '0 !important',
          paddingTop: '0 !important',
          paddingRight: '0 !important',
        },
        inner: {
          marginTop: '0 !important',
          paddingTop: '0 !important',
          paddingBottom: 0,
          top: '0 !important',
          alignItems: 'flex-start',
        },
        content: {
          marginTop: '0 !important',
          paddingTop: '0 !important',
          top: '0 !important',
          maxHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
        },
        title: {
          fontSize: 18,
          fontWeight: 600,
          marginTop: '0 !important',
          marginBottom: '0 !important',
          paddingTop: '0 !important',
          paddingBottom: '0 !important',
          margin: '0 !important',
          padding: '0 !important',
        },
        header: {
          position: 'sticky',
          top: 0,
          marginTop: '0 !important',
          marginBottom: 0,
          paddingTop: '0 !important',
          paddingBottom: '1rem',
          paddingLeft: 'var(--mantine-spacing-md)',
          paddingRight: 'var(--mantine-spacing-md)',
          margin: '0 !important',
          zIndex: 101,
          backgroundColor: 'white',
          borderBottom: '1px solid #dee2e6',
        },
        body: {
          marginTop: 0,
          paddingTop: 0,
          paddingLeft: 'var(--mantine-spacing-md)',
          paddingRight: 'var(--mantine-spacing-md)',
          paddingBottom: 'var(--mantine-spacing-lg)',
          overflowY: 'auto',
          flex: 1,
        },
        close: {
          marginTop: 0,
          paddingTop: 0,
        },
      }}
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
            c={displayPrice ? '#059669' : '#6b7280'}
            style={{
              backgroundColor: displayPrice ? '#d1fae5' : '#f3f4f6',
              padding: '12px 16px',
              borderRadius: '8px',
              border: `1px solid ${displayPrice ? '#a7f3d0' : '#e5e7eb'}`,
              lineHeight: 1.6,
            }}
          >
            {displayPrice 
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