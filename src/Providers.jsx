import '@mantine/charts/styles.css';
import { createTheme, DirectionProvider, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./assets/fonts/iranyekan/font.css";
import NoInternet from "./components/noInternet";
import "./global.css";
import { getQueryClient } from "./Libs/reactQuery";
import Theme from "./Libs/theme";
import store from "./redux";
import routes from "./routes";
import Auth401Modal from "./components/Auth401Modal";

const theme = createTheme(Theme);
const queryClient = getQueryClient();
const browserRoutes = createBrowserRouter(routes);

function Providers({ children }) {
  return (
    <DirectionProvider initialDirection="rtl">
    <MantineProvider theme={theme}>
      <Notifications position="top-right" zIndex={1100} />
      <NoInternet />
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
          )}
          <RouterProvider router={browserRoutes} />
          <Auth401Modal />
          {children}
        </QueryClientProvider>
      </Provider>
    </MantineProvider>
  </DirectionProvider>
  );
}

export default Providers;
