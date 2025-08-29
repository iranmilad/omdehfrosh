import { useNavigate } from 'react-router-dom';
import {
  ActionIcon,
  Indicator,
} from "@mantine/core";
import { IoIosNotificationsOutline } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef } from 'react';
import { getNotificationNumber, clearNotificationCache } from '../../redux/usermyaccounts/usermyaccounts/notifications/getnotificationnumber/getNotificationNumberActions';

const Notifications = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const previousCountRef = useRef(0);
  const fetchAttemptedRef = useRef(false);

  // Get auth state
  const { user, isVerified } = useSelector((state) => state.auth);
  
  const {
    notificationNumber,
    loadingNotificationNumber,
    errorNotificationNumber
  } = useSelector((state) => state.notificationNumber);

  // Listen for notification refresh events
  useEffect(() => {
    const handleNotificationRefresh = () => {
      dispatch(getNotificationNumber({ forceRefresh: true }));
    };

    // Listen for custom event
    window.addEventListener('refreshNotificationCount', handleNotificationRefresh);
    
    return () => {
      window.removeEventListener('refreshNotificationCount', handleNotificationRefresh);
    };
  }, [dispatch]);

  // Fetch notifications only once per session (persists across page refreshes)
  useEffect(() => {
    // Reset flag when user changes
    if (!user || !isVerified) {
      fetchAttemptedRef.current = false;
      return;
    }

    // Only attempt to fetch once per component lifecycle
    if (!fetchAttemptedRef.current && !loadingNotificationNumber) {
      fetchAttemptedRef.current = true;
      
      try {
        dispatch(getNotificationNumber()); // No force refresh for initial load
      } catch (error) {
      }
    }
  }, [dispatch, user, isVerified, loadingNotificationNumber]);

  // Clear cache on logout (when user becomes null)
  useEffect(() => {
    if (!user && fetchAttemptedRef.current) {
      clearNotificationCache();
      fetchAttemptedRef.current = false;
    }
  }, [user]);

  // Handle push notifications - only show for NEW notifications
  useEffect(() => {
    if (!user || !isVerified || !notificationNumber) return;

    const count = notificationNumber.unreadCount || 0;
    const previousCount = previousCountRef.current;

    if (count > previousCount && count > 0 && 'serviceWorker' in navigator && 'Notification' in window) {
      navigator.serviceWorker.ready.then(registration => {
        const show = () => {
          registration.showNotification("پیام جدید!", {
            body: `شما ${count} پیام خوانده‌نشده دارید.`,
            icon: '/icons/64.png',
            data: { url: '/account/notifications' }
          });
        };

        if (Notification.permission === 'granted') {
          show();
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') show();
          });
        }
      }).catch(error => {
        console.warn('Service worker not available:', error);
      });
    }

    previousCountRef.current = count;
  }, [notificationNumber?.unreadCount, user, isVerified]);

  const handleClick = () => {
    if (user && isVerified) {
      const event = new CustomEvent('refreshNotificationCount');
      window.dispatchEvent(event);
      
      navigate('/account/notifications');
    } else {
      navigate('/login');
    }
  };

  // Don't render if user is not authenticated
  if (!user || !isVerified) {
    return null;
  }

  // Don't render if there's an error loading notifications
  if (errorNotificationNumber) {
    console.error('Notification error:', errorNotificationNumber);
    return null;
  }

  // Show loading state only when actively loading and no cached data
  if (loadingNotificationNumber && !notificationNumber) {
    return (
      <ActionIcon
        h={45}
        color="blue"
        variant="light"
        size="xl"
        onClick={handleClick}
        loading
      >
        <IoIosNotificationsOutline size={25} />
      </ActionIcon>
    );
  }

  // Get the actual count - handle both object and number formats
  const unreadCount = (() => {
    if (!notificationNumber) return 0;
    
    // If it's an object with unreadCount property
    if (typeof notificationNumber === 'object' && notificationNumber.unreadCount !== undefined) {
      return notificationNumber.unreadCount;
    }
    
    // If it's a direct number (backward compatibility)
    if (typeof notificationNumber === 'number') {
      return notificationNumber;
    }
    
    // Default fallback
    return 0;
  })();

  // Don't render indicator if no notifications, but still show the bell icon
  if (unreadCount === 0) {
    return (
      <ActionIcon
        h={45}
        color="blue"
        variant="light"
        size="xl"
        onClick={handleClick}
      >
        <IoIosNotificationsOutline size={25} />
      </ActionIcon>
    );
  }

  return (
    <Indicator
      offset={2}
      withBorder
      size={20}
      label={unreadCount}
      color="green"
      inline
      styles={{
        indicator: { paddingTop: "1px" },
      }}
    >
      <ActionIcon
        h={45}
        color="blue"
        variant="light"
        size="xl"
        onClick={handleClick}
      >
        <IoIosNotificationsOutline size={25} />
      </ActionIcon>
    </Indicator>
  );
};

export default Notifications;