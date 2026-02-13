import { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { logout } from "../../redux/auth/authusers/auth";
import { logout as logoutMaster } from "../../redux/auth/authmaster/authMasterSlice";
import { clearCart, setInitial } from "../../redux/cart";
import { clearCacheOnLogout } from "../../Libs/reactQuery";
import ReloginRequiredModal from "../ReloginRequiredModal";
import Cookies from "js-cookie";

/** Paths where the user can browse without login; do not show relogin modal on 401 here */
const PUBLIC_BROWSE_PATHS = ["/", "/home", "/login", "/sign-in", "/sign-up", "/product", "/brands", "/category", "/search", "/incredible-offers", "/payment-listener"];

function isPublicBrowsePath(pathname) {
  if (!pathname) return true;
  const normalized = pathname.replace(/\/$/, "") || "/";
  return PUBLIC_BROWSE_PATHS.some((p) => normalized === p || normalized.startsWith(p + "/"));
}

/**
 * Listens for global auth:401 (server 401). Clears token/cache/Redux and shows
 * ReloginRequiredModal only when not on a public browse page (so guests can browse without seeing it).
 */
export default function Auth401Modal() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [opened, setOpened] = useState(false);

  const clearAuthAndShowModal = useCallback(() => {
    const hadToken = typeof window !== "undefined" && (localStorage.getItem("user") || Cookies.get("user"));
    if (!hadToken) return;
    if (queryClient) queryClient.cancelQueries();
    localStorage.removeItem("user");
    localStorage.removeItem("user_master");
    if (Cookies.get("user")) Cookies.remove("user");
    dispatch(logout());
    dispatch(logoutMaster());
    dispatch(clearCart());
    dispatch(setInitial([]));
    // Only show modal when user is on a page that requires auth (basket, account, payment, etc.)
    if (typeof window !== "undefined" && !isPublicBrowsePath(window.location.pathname)) {
      setOpened(true);
    }
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
