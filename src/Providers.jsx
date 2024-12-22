import { useState } from "react";
import { DirectionProvider, MantineProvider, createTheme } from "@mantine/core";
import { queryClientConfig } from "./Libs/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./assets/fonts/iranyekan/font.css";
import Theme from "./Libs/theme";
import "@mantine/core/styles.css";
import "./global.css";
import { createBrowserRouter, Route, RouterProvider } from "react-router";
import routes from "./routes";
import { Provider } from "react-redux";
import store from "./redux";
import '@mantine/notifications/styles.css';
import { Notifications } from '@mantine/notifications';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'



const theme = createTheme(Theme);
const queryClient = new QueryClient(queryClientConfig);
const browserRoutes = createBrowserRouter(routes);

function Providers({ children }) {
  return (
    <DirectionProvider initialDirection="rtl">
    <MantineProvider theme={theme}>
      <Notifications  position="top-right" />
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
          <RouterProvider router={browserRoutes} />
          {children}
        </QueryClientProvider>
      </Provider>
    </MantineProvider>
  </DirectionProvider>
  );
}

export default Providers;
