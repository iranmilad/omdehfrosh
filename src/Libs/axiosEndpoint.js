import axios from "axios";
import Cookies from "js-cookie";
import { notifications } from "@mantine/notifications";

// Get API URL from environment variables
// For Rsbuild: process.env is defined in rsbuild.config.js
const getBaseUrl = () => {
  const apiUrl = process.env.REACT_APP_API_URL || process.env.API || '/api';

  return apiUrl;
};

const baseURL = getBaseUrl();

let headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

// Add current path to headers in development (for debugging)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  headers.url = window.location.pathname;
}

const axiosInstance = axios.create({
  headers,
  responseType: "json",
  baseURL,
});

axiosInstance.interceptors.request.use(
  (request) => {
    const token = Cookies.get("user");
    // Only set Authorization header if token exists and is not undefined
    if (token && token !== 'undefined') {
      request.headers["Authorization"] = `Bearer ${token}`;
    } else {
      // Remove Authorization header if no valid token
      delete request.headers["Authorization"];
    }
    return request;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // Handle 401 Unauthorized: clear token and notify app to show relogin modal
      if (status === 401) {
        if (Cookies.get("user")) {
          Cookies.remove("user");
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:401"));
        }
      }
    } else if (!error.response && error.request) {
      // Network error - no response received
      notifications.show({
        title: "پیام سیستم",
        message: "ارتباط با سرور برقرار نشد.",
        color: "red",
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
