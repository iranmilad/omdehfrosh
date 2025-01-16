import axios from "axios";
import Cookies from "js-cookie";
import { notifications } from "@mantine/notifications"; // Ensure mantine/notifications is installed: npm install @mantine/notifications


const environment = import.meta.env.MODE;

let headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
}

if(environment === "development"){
  headers.url = window.location.pathname
}

const axiosInstance = axios.create({
  headers,
  responseType: "json",
  baseURL: environment === "production" ? "" : "/api",
  // withCredentials: environment === "production",
});

axiosInstance.interceptors.request.use(
  (request) => {
    const token = Cookies.get("user");
    request.headers["Authorization"] = token;
    return request;
  },
  (error) => {
    Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    // If the response is successful, simply return it
    return response;
  },
  (error) => {
    // Check if there's an error response
    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 Unauthorized
      if (status === 401) {
        // Remove the 'user' cookie if it exists
        if (Cookies.get("user")) {
          Cookies.remove("user");
        }
        // Redirect the user to the /login page if they are not on /login or /register
        if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
          window.location.href = "/login";
        }
        
      } else {
        // Show notification for all other errors
        notifications.show({
          title: "پیام سیستم",
          message: `${data?.message || "خطایی رخ داده است"}`,
          color: "yellow", // Use yellow for all errors except 401
        });
      }
    } else {
      // Handle network errors or other issues without a response
      notifications.show({
        title: "پیام سیستم",
        message: "ارتباط با سرور برقرار نشد.",
        color: "red",
      });
    }

    // Reject the promise with the error to propagate it
    return Promise.reject(error);
  }
);


export default axiosInstance;