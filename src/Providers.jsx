import { DirectionProvider, MantineProvider, createTheme } from "@mantine/core";
import { queryClientConfig } from "./Libs/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./assets/fontiran.css";
import Theme from "./Libs/theme";
import "@mantine/core/styles.css";
import "./global.css";
import { createBrowserRouter, Route, RouterProvider } from "react-router";
import routes from "./routes";


const theme = createTheme(Theme);
const queryClient = new QueryClient(queryClientConfig);
const browserRoutes = createBrowserRouter(routes)

function Providers({ children }) {
  return (
    <DirectionProvider initialDirection="rtl">
      <MantineProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={browserRoutes} />
          {children}
        </QueryClientProvider>
      </MantineProvider>
    </DirectionProvider>
  );
}

export default Providers;
