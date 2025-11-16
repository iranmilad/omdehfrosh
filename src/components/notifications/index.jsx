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
// Fetch notifications when component mounts and user is authenticated
useEffect(() => {
  if (!user || !isVerified) {
    return;
  }

  // Fetch notifications every time the component mounts
  if (!loadingNotificationNumber) {
    dispatch(getNotificationNumber());
  }
}, [dispatch, user, isVerified]); // Remove loadingNotificationNumber from deps
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

  // Always render something - never return null to avoid Menu.Target issues
  // If user is not authenticated, show a simple notification icon that leads to login
  if (!user || !isVerified) {
    return (
      <ActionIcon
        style={{ height: 39, width: 44 }}
        // color="gray"
        variant="light"
        onClick={() => navigate('/login')}
        title="وارد شوید تا اعلان‌ها را ببینید"
      >
        <IoIosNotificationsOutline size={25} />
      </ActionIcon>

    );
  }

  // If there's an error, show a disabled state but still render the component
  if (errorNotificationNumber) {
    console.error('Notification error:', errorNotificationNumber);
    return (
      <ActionIcon
        // h={35}
        color="gray"
        variant="light"
        // size="xl"
        style={{ height: 45, width: 44 }}
        onClick={handleClick}
        title="خطا در بارگیری اعلان‌ها"
        disabled
      >
        <IoIosNotificationsOutline size={25} />
      </ActionIcon>
    );
  }

  // Show loading state only when actively loading and no cached data
  if (loadingNotificationNumber && !notificationNumber) {
    return (
      <ActionIcon
        // h={35}
        color="blue"
        variant="light"
        // size="xl"
        style={{ height: 45, width: 44 }}
        onClick={handleClick}
        loading
      >
        <IoIosNotificationsOutline size={25} />
      </ActionIcon>
    );
  }

  // Show with indicator if there are unread notifications
  if (unreadCount > 0) {
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
          // h={35}
          color="blue"
          variant="light"
          // size="xl"
          style={{ height: 45, width: 44 }}
          onClick={handleClick}
        >
          <IoIosNotificationsOutline size={25} />
        </ActionIcon>
      </Indicator>
    );
  }

  // Default: show without indicator
  return (
    <ActionIcon
      // h={44}
      color="blue"
      variant="light"
      // size="xl"
      style={{ height: 45, width: 44 }}
      onClick={handleClick}
    >
      <IoIosNotificationsOutline size={25} />
    </ActionIcon>
  );
};

export default Notifications;