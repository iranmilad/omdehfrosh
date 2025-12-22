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

  // Fetch notifications when component mounts and user is authenticated
  useEffect(() => {
    if (!user || !isVerified) {
      return;
    }

    // Fetch notifications every time the component mounts
    if (!loadingNotificationNumber) {
      dispatch(getNotificationNumber());
    }
  }, [dispatch, user, isVerified]);
  
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
      <div 
        className="flex flex-col items-center" 
        style={{ cursor: 'pointer' }}
        onClick={() => navigate('/login')}
        title="وارد شوید تا اعلان‌ها را ببینید"
      >
        <div className="flex">
          <IoIosNotificationsOutline style={{ fontSize: '8px', fontWeight: '700', width: '20px', height: '24px', color: '#6E7172'}} />
        </div>
        <p className="font-uiKit-normal text-uiKit-muted-foreground" style={{ 
          fontSize: '12px',
          lineHeight: '',
          fontWeight: '400',
          color: '#6E7172',
          margin: 0
        }}>
          اعلانات
        </p>
      </div>
    );
  }

  // If there's an error, show a disabled state but still render the component
  if (errorNotificationNumber) {
    console.error('Notification error:', errorNotificationNumber);
    return (
      <div 
        className="flex flex-col items-center" 
        style={{ cursor: 'pointer', opacity: 0.5 }}
        onClick={handleClick}
        title="خطا در بارگیری اعلان‌ها"
      >
        <div className="flex">
          <IoIosNotificationsOutline style={{ fontSize: '8px', fontWeight: '700', width: '20px', height: '24px', color: '#6E7172'}} />
        </div>
        <p className="font-uiKit-normal text-uiKit-muted-foreground" style={{ 
          fontSize: '12px',
          lineHeight: '',
          fontWeight: '400',
          color: '#6E7172',
          margin: 0
        }}>
          اعلانات
        </p>
      </div>
    );
  }

  // Show loading state only when actively loading and no cached data
  if (loadingNotificationNumber && !notificationNumber) {
    return (
      <div 
        className="flex flex-col items-center" 
        style={{ cursor: 'pointer' }}
        onClick={handleClick}
      >
        <div className="flex">
          <IoIosNotificationsOutline style={{ fontSize: '8px', fontWeight: '700', width: '20px', height: '24px', color: '#6E7172'}} />
        </div>
        <p className="font-uiKit-normal text-uiKit-muted-foreground" style={{ 
          fontSize: '12px',
          lineHeight: '',
          fontWeight: '400',
          color: '#6E7172',
          margin: 0
        }}>
          اعلانات
        </p>
      </div>
    );
  }

  // Show with indicator if there are unread notifications
  if (unreadCount > 0) {
    return (
      <div 
        className="flex flex-col items-center" 
        style={{ cursor: 'pointer' }}
        onClick={handleClick}
      >
        <div className="flex" style={{ position: 'relative' }}>
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
            <IoIosNotificationsOutline style={{ fontSize: '8px', fontWeight: '700', width: '20px', height: '24px', color: '#6E7172'}} />
          </Indicator>
        </div>
        <p className="font-uiKit-normal text-uiKit-muted-foreground" style={{ 
          fontSize: '12px',
          lineHeight: '',
          fontWeight: '400',
          color: '#6E7172',
          margin: 0
        }}>
          اعلانات
        </p>
      </div>
    );
  }

  // Default: show without indicator
  return (
    <div 
      className="flex flex-col items-center" 
      style={{ cursor: 'pointer' }}
      onClick={handleClick}
    >
      <div className="flex">
        <IoIosNotificationsOutline style={{ fontSize: '8px', fontWeight: '700', width: '20px', height: '24px', color: '#6E7172'}} />
      </div>
      <p className="font-uiKit-normal text-uiKit-muted-foreground" style={{ 
        fontSize: '12px',
        lineHeight: '',
        fontWeight: '400',
        color: '#6E7172',
        margin: 0
      }}>
        اعلانات
      </p>
    </div>
  );
};

export default Notifications;