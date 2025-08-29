import '@mantine/charts/styles.css';
import { createTheme, DirectionProvider, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./assets/fonts/iranyekan/font.css";
import NoInternet from "./components/noInternet";
import "./global.css";
import { queryClientConfig } from "./Libs/api";
import Theme from "./Libs/theme";
import store from "./redux";
import routes from "./routes";



const theme = createTheme(Theme);
const queryClient = new QueryClient(queryClientConfig);
const browserRoutes = createBrowserRouter(routes);

function Providers({ children }) {
  return (
    <DirectionProvider initialDirection="rtl">
    <MantineProvider theme={theme}>
      <Notifications position="top-right" />
      <NoInternet />
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
          <RouterProvider router={browserRoutes} />
          {children}
        </QueryClientProvider>
      </Provider>
    </MantineProvider>
  </DirectionProvider>
  );
}

export default Providers;
