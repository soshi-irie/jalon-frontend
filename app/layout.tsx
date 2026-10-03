import { CssBaseline, ThemeProvider } from "@mui/material";
import type { Metadata } from "next";

import theme from "../theme/appTheme";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

export const metadata: Metadata = {
  title: "JALÓN | Share the way",
  description: "Find people heading your way and share a ride with a small detour.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
