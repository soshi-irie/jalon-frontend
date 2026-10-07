import { Container, CssBaseline, ThemeProvider } from "@mui/material";
import type { Metadata } from "next";

import theme from "../theme/appTheme";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import Header from "./components/Header";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "JALÓN | Compartí el viaje",
  description:
    "Encontrá personas que van hacia el mismo lugar y compartí el viaje.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR">
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Header />
            <Container component="main" maxWidth="lg">{children}</Container>
            <Footer />
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
