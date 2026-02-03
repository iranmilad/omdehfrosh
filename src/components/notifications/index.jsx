import { useNavigate } from 'react-router-dom';
import {
  Indicator,
} from "@mantine/core";
import { IoIosNotificationsOutline } from "react-icons/io";
import { useSelector } from 'react-redux';
import { useEffect, useRef } from 'react';
import { useSessionQuery, useQueryClient } from '../../Libs/reactQuery';

const Notifications = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const previousCountRef = useRef(0);

  const token = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const { user, isVerified } = useSelector((state) => state.auth);

  // Cached with React Query (2 min staleTime, no refetch on mount); invalidated when marking as read
  const {
    data: notificationNumberData,
    isLoading: loadingNotificationNumber,
    error: errorNotificationNumber,
  } = useSessionQuery({
    endpoint: "/user-myaccounts/notifications/number",
    queryKey: ["notificationNumber"],
    enabled: !!token && !!user && !!isVerified,
    queryOptions: { staleTime: 2 * 60 * 1000, refetchOnMount: false },
    retry: (failureCount, err) => {
      const msg = typeof err === "string" ? err : err?.message || String(err);
      if (msg.includes("401")) return false;
      return failureCount < 2;
    },
  });

  const notificationNumber = notificationNumberData?.data ?? notificationNumberData;

  // Listen for notification refresh events (e.g. after mark as read)
  useEffect(() => {
    const handleNotificationRefresh = () => {
      queryClient.invalidateQueries({ queryKey: ["notificationNumber"] });
    };

    window.addEventListener('refreshNotificationCount', handleNotificationRefresh);
    return () => window.removeEventListener('refreshNotificationCount', handleNotificationRefresh);
  }, [queryClient]);

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

  // Unified container style - matching MiniCart exactly
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: '50px',
    height: '42px',
    cursor: 'pointer'
  };

  // Text style matching MiniCart
  const textStyle = {
    fontSize: '12px',
    fontWeight: '400',
    color: '#6E7172',
    margin: 0,
    lineHeight: 1.2,
    marginTop: '2px'
  };

  // Icon style
  const iconStyle = { width: '24px', height: '24px', color: '#6E7172' };

  // Always render something - never return null to avoid Menu.Target issues
  // If user is not authenticated, show a simple notification icon that leads to login
  if (!user || !isVerified) {
    return (
      <div
        style={containerStyle}
        onClick={() => navigate('/login')}
        title="وارد شوید تا اعلان‌ها را ببینید"
      >
        <IoIosNotificationsOutline style={iconStyle} />
        <p style={textStyle}>اعلانات</p>
      </div>
    );
  }

  // If there's an error, show a disabled state but still render the component
  if (errorNotificationNumber) {
    console.error('Notification error:', errorNotificationNumber);
    return (
      <div
        style={{ ...containerStyle, opacity: 0.5 }}
        onClick={handleClick}
        title="خطا در بارگیری اعلان‌ها"
      >
        <IoIosNotificationsOutline style={iconStyle} />
        <p style={textStyle}>اعلانات</p>
      </div>
    );
  }

  // Show loading state only when actively loading and no cached data
  if (loadingNotificationNumber && !notificationNumber) {
    return (
      <div
        style={containerStyle}
        onClick={handleClick}
      >
        <IoIosNotificationsOutline style={iconStyle} />
        <p style={textStyle}>اعلانات</p>
      </div>
    );
  }

  // Show with indicator if there are unread notifications
  if (unreadCount > 0) {
    return (
      <div
        style={containerStyle}
        onClick={handleClick}
      >
        <Indicator
          offset={4}
          withBorder
          size={18}
          label={unreadCount}
          color="green"
          inline
          styles={{
            indicator: {
              paddingTop: "1px",
              fontSize: "10px",
              borderRadius: "5px",
              width: "20px",
              height: "18px"
            }
          }}
        >
          <IoIosNotificationsOutline style={iconStyle} />
        </Indicator>
        <p style={textStyle}>اعلانات</p>
      </div>
    );
  }

  // Default: show without indicator
  return (
    <div
      style={containerStyle}
      onClick={handleClick}
    >
      <IoIosNotificationsOutline style={iconStyle} />
      <p style={textStyle}>اعلانات</p>
    </div>
  );
};

export default Notifications;