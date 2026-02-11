import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Title, 
  Container, 
  Stack, 
  Loader, 
  Box, 
  Center, 
  Alert,
  Button,
  Modal,
  Text,
  Flex,
  ActionIcon,
} from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { IconInfoCircle } from '@tabler/icons-react';
import { markNotificationAsRead } from '../../../redux/usermyaccounts/usermyaccounts/usermessagesgetcomponent/userMessagesGetComponentActions';
import { useNavigate } from 'react-router';
import { useSessionQuery, useQueryClient } from '../../../Libs/reactQuery';

// Default SVG image as a data URL
const DEFAULT_IMAGE_SVG = `data:image/svg+xml;base64,${btoa(`
<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#f8f9fa" stroke="#dee2e6" stroke-width="2" rx="8"/>
  <circle cx="35" cy="35" r="8" fill="#6c757d"/>
  <path d="M20 70 L35 55 L50 70 L65 55 L80 70 V80 H20 V70Z" fill="#6c757d"/>
  <rect x="55" y="25" width="25" height="4" fill="#6c757d" rx="2"/>
  <rect x="55" y="35" width="20" height="3" fill="#adb5bd" rx="1.5"/>
  <rect x="55" y="42" width="15" height="3" fill="#adb5bd" rx="1.5"/>
</svg>
`)}`;

// Image validation and fallback utility
const validateImagePath = (imagePath) => {
  if (!imagePath) return false;
  if (Array.isArray(imagePath) && (imagePath.length === 0 || imagePath[0] === "")) return false;
  if (typeof imagePath === 'string' && (imagePath.trim() === "" || imagePath === "null" || imagePath === "undefined")) return false;
  return true;
};

// Get safe image URL with fallback
const getSafeImageUrl = (imagePath, baseUrl = '') => {
  if (!validateImagePath(imagePath)) {
    return DEFAULT_IMAGE_SVG;
  }
  
  // Handle array of image paths
  const path = Array.isArray(imagePath) ? imagePath[0] : imagePath;
  
  // Return full URL or relative path
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  
  return `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
};

// Enhanced Image Component with error handling
const SafeImage = ({ src, alt = "تصویر", className, style, onError, ...props }) => {
  const [imageSrc, setImageSrc] = useState(getSafeImageUrl(src));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImageSrc(getSafeImageUrl(src));
    setHasError(false);
  }, [src]);

  const handleImageError = (e) => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(DEFAULT_IMAGE_SVG);
      if (onError) onError(e);
    }
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      style={style}
      onError={handleImageError}
      {...props}
    />
  );
};

// Dynamic Component Renderer Hook with Image Support
const useDynamicComponent = (jsxString, props = {}) => {
  const [component, setComponent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!jsxString) {
      setComponent(null);
      return;
    }

    try {
      // Create a function that returns the component
      const componentFunction = new Function(
        'React',
        'props',
        'SafeImage',
        'getSafeImageUrl',
        'validateImagePath',
        'DEFAULT_IMAGE_SVG',
        `
        // React hooks are available through React object
        const { useState, useEffect, useMemo, useCallback } = React;
        
        // Image handling utilities available in component scope
        const defaultImage = DEFAULT_IMAGE_SVG;
        
        ${jsxString}
        
        return Component;
        `
      );

      // Execute the function with all necessary dependencies
      const DynamicComponent = componentFunction(
        React, 
        props, 
        SafeImage, 
        getSafeImageUrl, 
        validateImagePath, 
        DEFAULT_IMAGE_SVG
      );

      setComponent(() => DynamicComponent);
      setError(null);
    } catch (err) {
      setError(err.message);
      setComponent(null);
    }
  }, [jsxString, props]);

  return { component, error };
};

// Alternative: Pre-process JSX string to replace img tags
const preprocessJSXForImages = (jsxString) => {
  if (!jsxString) return jsxString;
  
  // Replace standard img tags with SafeImage components
  return jsxString
    .replace(/<img\s+([^>]*)\s*\/?>/g, '<SafeImage $1 />')
    .replace(/src=\{([^}]+)\}/g, 'src={getSafeImageUrl($1)}');
};

// Utility function to trigger notification count refresh
const triggerNotificationRefresh = () => {
  const event = new CustomEvent('refreshNotificationCount');
  window.dispatchEvent(event);
};

// Main Account Notifications Component
function Account_Notifications() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [redirectTimer, setRedirectTimer] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const token = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const { isVerified, loading: authLoading, user: userVerified } = useSelector((state) => state.auth);

  const { data: notificationResult, isLoading: isLoading, error: queryComponentError, refetch } = useSessionQuery({
    endpoint: '/user-myaccounts/user-messages/notification-component',
    queryKey: ['userNotificationsComponent'],
    enabled: !!token,
    queryOptions: { staleTime: 2 * 60 * 1000 },
    retry: (failureCount, error) => {
      const msg = typeof error === "string" ? error : error?.message || String(error);
      if (msg.includes("401")) return false;
      return failureCount < 2;
    },
  });

  const reduxComponentError = queryComponentError ? (typeof queryComponentError === "string" ? queryComponentError : queryComponentError?.message || String(queryComponentError)) : null;

  const notificationData = useMemo(() => {
    const base = notificationResult ?? {};
    const component =
      base?.component != null ? preprocessJSXForImages(base.component) : base?.component;
    const modalComponent =
      base?.modalComponent != null ? preprocessJSXForImages(base.modalComponent) : base?.modalComponent;
    return { ...base, component, modalComponent, notifications: base?.notifications ?? [] };
  }, [notificationResult]);

  useEffect(() => {
    if (!authLoading && (!isVerified || !userVerified)) {
      setLoginModalOpen(true);
      const timer = setTimeout(() => navigate("/login"), 3000);
      setRedirectTimer(timer);
      return () => clearTimeout(timer);
    }
    setLoginModalOpen(false);
    if (redirectTimer) {
      clearTimeout(redirectTimer);
      setRedirectTimer(null);
    }
  }, [isVerified, userVerified, authLoading, navigate]);

  const invalidateNotifications = () => {
    if (queryClient) {
      queryClient.invalidateQueries({ queryKey: ['userNotificationsComponent'] });
      queryClient.invalidateQueries({ queryKey: ['userInitialData'] });
      queryClient.invalidateQueries({ queryKey: ['notificationNumber'] });
    }
    triggerNotificationRefresh();
  };

  const handleNotificationClick = async (notificationId, index) => {
    const list = Array.isArray(notificationResult?.notifications) ? notificationResult.notifications : [];
    const notif = list[index - 1] ?? list.find((n) => String(n._id) === String(notificationId));
    setSelectedNotification(notif ?? null);
    setMessageModalOpen(true);
    // Mark as read in DB (NotificationTable) when user opens the modal
    const idToSend = notif?._id ?? notificationId;
    if (idToSend) {
      try {
        await dispatch(markNotificationAsRead({ notificationId: String(idToSend), index })).unwrap();
        invalidateNotifications();
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  };

  const handleMarkAsRead = async (notificationId, index, isRead) => {
    try {
      await dispatch(markNotificationAsRead({ notificationId, index, isRead })).unwrap();
      invalidateNotifications();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Handle immediate redirect to login page
  const handleGoToLogin = () => {
    if (redirectTimer) {
      clearTimeout(redirectTimer);
      setRedirectTimer(null);
    }
    navigate('/login');
  };

  // Handle modal close (if needed)
  const handleModalClose = () => {
    if (redirectTimer) {
      clearTimeout(redirectTimer);
      setRedirectTimer(null);
    }
    setLoginModalOpen(false);
    // Optionally redirect immediately or allow user to stay
    navigate('/login');
  };

  // Create props to pass to dynamic component
  const dynamicComponentProps = useMemo(() => ({
    onNotificationClick: handleNotificationClick,
    onMarkAsRead: handleMarkAsRead,
    notificationIds: notificationData?.notificationIds || [],
    count: notificationData?.count || 0,
    // Add image utilities to props
    SafeImage,
    getSafeImageUrl,
    validateImagePath,
    defaultImage: DEFAULT_IMAGE_SVG
  }), [notificationData]);

  // Use the dynamic component hook for the list
  const { component: DynamicComponent, error: dynamicError } = useDynamicComponent(
    notificationData?.component,
    dynamicComponentProps
  );

  // Props for the backend modal body component (notification, onClose, image utils)
  const modalCloseHandler = () => {
    setMessageModalOpen(false);
    setSelectedNotification(null);
  };
  const modalBodyProps = useMemo(() => ({
    notification: selectedNotification,
    onClose: modalCloseHandler,
    SafeImage,
    getSafeImageUrl,
    validateImagePath,
    DEFAULT_IMAGE_SVG
  }), [selectedNotification]);

  // Backend-provided modal body component (renders inside Modal when opened)
  const { component: ModalBodyComponent, error: modalBodyError } = useDynamicComponent(
    notificationData?.modalComponent,
    modalBodyProps
  );

  const handleRefresh = () => {
    if (queryClient) {
      queryClient.invalidateQueries({ queryKey: ['userNotificationsComponent'] });
      queryClient.invalidateQueries({ queryKey: ['userInitialData'] });
      queryClient.invalidateQueries({ queryKey: ['notificationNumber'] });
    }
    triggerNotificationRefresh();
  };

  // List and modal come entirely from backend; no frontend-built list/modal content
  const hasWorkingBackendComponent = notificationResult?.component && !dynamicError && DynamicComponent;
  // All UI strings from backend (fallbacks for when backend does not send labels)
  const labels = useMemo(() => ({
    pageTitle: 'پیام‌های من',
    refreshTitle: 'بروزرسانی',
    emptyTitle: 'هیچ پیامی یافت نشد',
    emptySubtitle: 'پیام‌های جدید در اینجا نمایش داده می‌شوند.',
    modalDefaultTitle: 'پیام',
    sentAtLabel: 'تاریخ ارسال',
    lastUpdatedLabel: 'آخرین بروزرسانی',
    descriptionLabel: 'توضیحات',
    viewLinkLabel: 'مشاهده لینک',
    closeButtonLabel: 'بستن',
    noContentPlaceholder: 'محتوایی ثبت نشده است.',
    modalLoadError: 'محتوای پیام از سرور بارگذاری نشد.',
    readStatusRead: 'خوانده شده',
    readStatusUnread: 'خوانده نشده',
    newMessageDefaultTitle: 'پیام جدید',
    typeLabels: { system: 'سیستم', personal: 'شخصی', promotion: 'تخفیف', security: 'امنیت', order: 'سفارش', support: 'پشتیبانی', achievement: 'دستاورد' },
    priorityLabels: { urgent: 'فوری', high: 'مهم', normal: 'عادی', low: 'کم' },
    ...(notificationResult?.labels || {})
  }), [notificationResult?.labels]);

  if (authLoading) {
    return (
      <Container size="md" py="xl">
        <Center>
          <Stack align="center" spacing="md">
            <Loader size="lg" />
            <Title order={3}>در حال بررسی وضعیت ورود...</Title>
          </Stack>
        </Center>
      </Container>
    );
  }

  // Show modal and placeholder if not authenticated
  if (!isVerified || !userVerified) {
    return (
      <>
        <Modal
          opened={loginModalOpen}
          onClose={handleModalClose}
          closeOnClickOutside={false}
          closeOnEscape={false}
          removeScrollProps={{ removeScrollBar: false }}
          withCloseButton={true}
          title="ورود به حساب کاربری"
          centered
          zIndex={1100}
          overlayProps={{
            backgroundOpacity: 0.6,
            blur: 3,
          }}
        >
          <Text mb="md">لطفا وارد حساب کاربری شوید</Text>
          <Text size="sm" c="dimmed" mb="md">
            در حال انتقال به صفحه ورود در 3 ثانیه...
          </Text>
          <Flex gap="sm" justify="flex-end">
            <Button onClick={handleGoToLogin} variant="filled">
              رفتن به صفحه ورود
            </Button>
          </Flex>
        </Modal>

        {/* Show a placeholder content while modal is open */}
        <Container size="md" py="xl">
          <Center h={400}>
            <Stack align="center" gap="md">
              <Text size="xl" c="dimmed">
                در حال بررسی وضعیت ورود...
              </Text>
              <Loader size="md" />
            </Stack>
          </Center>
        </Container>
      </>
    );
  }

  // Loading state for notifications
  if (isLoading) {
    return (
      <Container size="md" py="xl">
        <Center>
          <Stack align="center" spacing="md">
            <Loader size="lg" />
            <Title order={3}>بارگذاری پیام‌ها...</Title>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (reduxComponentError || dynamicError || !DynamicComponent) {
    return (
      <Container size="md" py="xl">
        <Stack spacing="md">
          <Alert
            icon={<IconInfoCircle size="1rem" />}
            title="خطا در بارگذاری"
            color="red"
            variant="light"
          >
            {reduxComponentError || dynamicError || "خطا در بارگذاری پیام‌ها"}
          </Alert>
          <Center>
            <Button onClick={handleRefresh} variant="light">
              تلاش مجدد
            </Button>
          </Center>
        </Stack>
      </Container>
    );
  }

  // Main authenticated view
  return (
    <Container size="md" py="md" px="xs" style={{ maxWidth: "100%" }}>
      <Flex justify="space-between" align="center" mb="md" wrap="wrap" gap="xs">
        <Title order={2} style={{ textAlign: "right" }}>
          {labels.pageTitle}
        </Title>
        <ActionIcon
          variant="subtle"
          size="lg"
          onClick={handleRefresh}
          title={labels.refreshTitle}
          aria-label={labels.refreshTitle}
        >
          <IconRefresh size={20} />
        </ActionIcon>
      </Flex>

      {/* List: 100% from backend – no frontend-built list */}
      <Box style={{ width: "100%", minWidth: 0 }}>
        {DynamicComponent && <DynamicComponent {...dynamicComponentProps} />}
      </Box>

      {/* Modal: 100% content from backend – above bottom nav (z-index 1000) */}
      <Modal
        opened={messageModalOpen}
        removeScrollProps={{ removeScrollBar: false }}
        onClose={modalCloseHandler}
        title={selectedNotification?.title || labels.modalDefaultTitle}
        size="md"
        centered
        lockScroll={false}
        removeScrollBar={false}
        zIndex={1100}
        styles={{ title: { textAlign: "right", fontWeight: 600 } }}
      >
        {selectedNotification &&
          (notificationData?.modalComponent &&
          ModalBodyComponent &&
          !modalBodyError ? (
            <ModalBodyComponent {...modalBodyProps} />
          ) : (
            <Text size="sm" c="dimmed" style={{ textAlign: "right" }}>
              {labels.modalLoadError}
            </Text>
          ))}
      </Modal>
    </Container>
  );
}

export default Account_Notifications;