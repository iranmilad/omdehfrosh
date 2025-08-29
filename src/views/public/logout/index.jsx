import React, { useLayoutEffect } from 'react'
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { Center, Loader, Text, Stack } from '@mantine/core';

import { clearCart } from "../../../redux/cart";  
import { logout } from "../../../redux/auth/authusers/auth";



function Logout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    const performLogout = async () => {
      try {
        // Clear localStorage first
        localStorage.removeItem("user");
        localStorage.removeItem("token"); // Clear token if stored separately
        
        // Clear all Redux states
        dispatch(logout());
        dispatch(clearCart());
        
        // Clear any other user-related states you might have
        // dispatch(clearNotifications()); // If you have notifications state
        // dispatch(clearUserProfile()); // If you have user profile state
        
        // Force a small delay to ensure state updates are processed
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Navigate to home page
        navigate('/', { replace: true });
        
        window.location.reload();
        
      } catch (error) {
        navigate('/', { replace: true });
        window.location.reload();
      }
    };

    performLogout();
  }, [navigate, dispatch]);

  return (
    <Center style={{ height: '100vh' }}>
      <Stack align="center" spacing="md">
        <Loader size="lg" color="blue" />
        <Text size="lg" c="dimmed">
          در حال خروج...
        </Text>
      </Stack>
    </Center>
  );
}

export default Logout;