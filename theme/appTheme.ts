"use client";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#285d4d",
      light: "#e5efea",
      dark: "#1a4035",
    },
    secondary: {
      main: "#c99b32",
    },
    background: {
      paper: "#ffffff",
      default: "#fafbfa",
    },
    text: { primary: "#252d29", secondary: "#6b746f" },
    divider: "#e0e5e1",
  },
  typography: {
    fontFamily: '"Avenir Next", Avenir, "Segoe UI", sans-serif',
    allVariants: { letterSpacing: 0 },
    h5: { fontWeight: 600, fontSize: "1.5rem" },
    h6: { fontWeight: 600, fontSize: "1.125rem" },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
    overline: { fontSize: "0.625rem", fontWeight: 600 },
  },
  shape: { borderRadius: 6 },
});

export default theme;
