import React, { useLayoutEffect } from 'react';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { Center, Loader, Text, Stack } from '@mantine/core';

import { clearCart } from "../../../redux/cart";
import { logout } from "../../../redux/auth/authusers/auth";
import { useQueryClient, clearCacheOnLogout } from "../../../Libs/reactQuery";

function Logout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  useLayoutEffect(() => {
    const performLogout = async () => {
      try {
        // Clear token
        localStorage.removeItem("user");
        localStorage.removeItem("token");

        // Clear all React Query cache and persisted cache so no user data remains after reload
        clearCacheOnLogout(queryClient);

        // Clear Redux state
        dispatch(logout());
        dispatch(clearCart());

        await new Promise((resolve) => setTimeout(resolve, 100));

        navigate("/", { replace: true });
        window.location.reload();
      } catch (error) {
        navigate("/", { replace: true });
        window.location.reload();
      }
    };

    performLogout();
  }, [navigate, dispatch, queryClient]);

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