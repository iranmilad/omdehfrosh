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
  Flex
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { verifyToken } from '../../../redux/auth/authusers/auth';
import { markNotificationAsRead, userMessagesGetComponent } from '../../../redux/usermyaccounts/usermyaccounts/usermessagesgetcomponent/userMessagesGetComponentActions';
import { useNavigate } from 'react-router';
import { getUserMyAccount } from '../../../redux/usermyaccounts/usermyaccounts/getusermyaccounts/userMyAccountsGetActions';

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
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState(null);
  const navigate = useNavigate();

  const { isVerified, loading: authLoading, error: authError, user: userVerified } = useSelector((state) => state.auth);
  
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [notificationData, setNotificationData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Redux selectors (adjust based on your actual state structure)
  const { 
    user,
    userMessagesComponent,
    isLoadingComponent,
    reduxComponentError 
  } = useSelector(state => ({
    user: state.auth?.user,
    userMessagesComponent: state.userMessages?.component,
    isLoadingComponent: state.userMessages?.isLoading,
    reduxComponentError: state.userMessages?.error
  }));

  // Initial auth check - only verify token
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await dispatch(verifyToken()).unwrap();
      } catch (error) {
        // console.log('Auth verification failed:', error);
      } finally {
        setAuthCheckComplete(true);
      }
    };

    if (!authCheckComplete) {
      checkAuth();
    }
  }, [dispatch, authCheckComplete]);

  // Handle auth state changes after initial check
  useEffect(() => {
    // Only proceed after auth check is complete
    if (!authCheckComplete) return;

    const isAuthenticated = isVerified && userVerified;

    if (!isAuthenticated) {
      // Clear any existing timer
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }

      // Show modal first
      setLoginModalOpen(true);
      
      // Set up redirect timer
      const timer = setTimeout(() => {
        navigate('/login');
      }, 3000);
      
      setRedirectTimer(timer);
    } else {
      // User is authenticated
      setLoginModalOpen(false);
      
      // Clear redirect timer if it exists
      if (redirectTimer) {
        clearTimeout(redirectTimer);
        setRedirectTimer(null);
      }
      
      // Fetch user account data
      if (user?.id) {
        dispatch(getUserMyAccount({userId: user.id}));
      }
    }

    // Cleanup function
    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [dispatch, isVerified, userVerified, authCheckComplete, navigate, user?.id]);

  // Load notifications only when authenticated
  useEffect(() => {
    const loadNotifications = async () => {
      // Only load if authenticated
      if (!authCheckComplete || !isVerified || !userVerified) {
        return;
      }

      setIsLoading(true);
      try {
        // Trigger notification count refresh when this component opens
        triggerNotificationRefresh();
        
        // Fetch the dynamic component
        const result = await dispatch(userMessagesGetComponent()).unwrap();
        
        // Preprocess component string to handle images
        if (result?.component) {
          result.component = preprocessJSXForImages(result.component);
        }
        
        setNotificationData(result);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [dispatch, refreshKey, authCheckComplete, isVerified, userVerified]);

  // Handle notification click
  const handleNotificationClick = async (notificationId, index) => {
    try {
      // Mark as read
      await dispatch(markNotificationAsRead({ notificationId, index })).unwrap();
      
      // Trigger notification count refresh
      triggerNotificationRefresh();
      
      // Refresh the notifications to update read status
      setRefreshKey(prev => prev + 1);
      
    } catch (error) {
      console.error('Failed to handle notification click:', error);
    }
  };

  // Handle mark as read/unread
  const handleMarkAsRead = async (notificationId, index, isRead) => {
    try {
      // Call the API to mark as read/unread
      await dispatch(markNotificationAsRead({ 
        notificationId, 
        index, 
        isRead // Pass the read status (true for read, false for unread)
      })).unwrap();
      
      // Trigger notification count refresh
      triggerNotificationRefresh();
      
      // Refresh the notifications to update read status
      setRefreshKey(prev => prev + 1);
      
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

  // Use the dynamic component hook
  const { component: DynamicComponent, error: dynamicError } = useDynamicComponent(
    notificationData?.component,
    dynamicComponentProps
  );

  // Refresh handler
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    // Also trigger notification count refresh
    triggerNotificationRefresh();
  };

  // Show loading while checking auth
  if (!authCheckComplete || authLoading) {
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
          withCloseButton={true}
          title="ورود به حساب کاربری"
          centered
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
            <Button 
              onClick={handleGoToLogin}
              variant="filled"
            >
              رفتن به صفحه ورود
            </Button>
          </Flex>
        </Modal>
        
        {/* Show a placeholder content while modal is open */}
        <Container size="md" py="xl">
          <Center h={400}>
            <Stack align="center" gap="md">
              <Text size="xl" c="dimmed">در حال بررسی وضعیت ورود...</Text>
              <Loader size="md" />
            </Stack>
          </Center>
        </Container>
      </>
    );
  }

  // Loading state for notifications
  if (isLoading || isLoadingComponent) {
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

  // Error state
  if (reduxComponentError || dynamicError || !DynamicComponent) {
    return (
      <Container size="md" py="xl">
        <Stack spacing="md">
          <Title order={2} ta="center">پیام‌های من</Title>
          
          <Alert
            icon={<IconInfoCircle size="1rem" />}
            title="خطا در بارگذاری"
            color="red"
            variant="light"
          >
            {reduxComponentError || dynamicError || 'خطا در بارگذاری کامپوننت پیام‌ها'}
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
    <Container size="md" py="xl">
      <Stack spacing="md">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title order={2} ta="center" style={{ flex: 1 }}>
            پیام‌های من
          </Title>
          <Button onClick={handleRefresh} variant="light" size="sm">
            بروزرسانی
          </Button>
        </div>

        {/* Render the dynamic component */}
        <Box>
          {DynamicComponent && <DynamicComponent {...dynamicComponentProps} />}
        </Box>

        {/* Debug info (remove in production) */}
        <Alert
          icon={<IconInfoCircle size="1rem" />}
          color="blue"
          variant="light"
          style={{ marginTop: '2rem' }}
        >
          تعداد پیام‌ها: {notificationData?.count || 0}
          <br />
          آخرین بروزرسانی: {new Date().toLocaleString('fa-IR')}
        </Alert>
      </Stack>
    </Container>
  );
}

export default Account_Notifications;