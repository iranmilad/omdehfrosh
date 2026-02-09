import { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { logout } from "../../redux/auth/authusers/auth";
import { logout as logoutMaster } from "../../redux/auth/authmaster/authMasterSlice";
import { clearCart, setInitial } from "../../redux/cart";
import { clearCacheOnLogout } from "../../Libs/reactQuery";
import ReloginRequiredModal from "../ReloginRequiredModal";
import Cookies from "js-cookie";

/**
 * Listens for global auth:401 (server 401). Clears token/cache/Redux and shows
 * ReloginRequiredModal with a button that routes to /login.
 */
export default function Auth401Modal() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [opened, setOpened] = useState(false);

  const clearAuthAndShowModal = useCallback(() => {
    // Only run once per session (multiple 401s can fire)
    const hadToken = typeof window !== "undefined" && (localStorage.getItem("user") || Cookies.get("user"));
    if (!hadToken) return;
    // Cancel in-flight queries immediately so they don't complete with 401 and trigger more work
    if (queryClient) queryClient.cancelQueries();
    // Clear token so next render sees token=null and queries use enabled: false
    localStorage.removeItem("user");
    localStorage.removeItem("user_master");
    if (Cookies.get("user")) Cookies.remove("user");
    dispatch(logout());
    dispatch(logoutMaster());
    dispatch(clearCart());
    dispatch(setInitial([]));
    setOpened(true);
    // Defer clear so React re-renders with token=null first; then clearing cache won't trigger refetches
    if (queryClient) {
      const q = queryClient;
      setTimeout(() => clearCacheOnLogout(q), 0);
    }
  }, [queryClient, dispatch]);

  useEffect(() => {
    const handle401 = () => clearAuthAndShowModal();
    window.addEventListener("auth:401", handle401);
    return () => window.removeEventListener("auth:401", handle401);
  }, [clearAuthAndShowModal]);

  return (
    <ReloginRequiredModal
      opened={opened}
      onClose={() => setOpened(false)}
    />
  );
}
