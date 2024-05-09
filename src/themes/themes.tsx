import { createTheme } from "@mui/material";

// Theming
export const darkTheme = createTheme({
  typography: {
    fontFamily: 'Caviar-Dreams',
    button: {
      textTransform: 'none'
    },
    allVariants: {
      color: "#ffffff",
    },
  },
  palette: {
    mode: "dark",
    primary: {
      main: "#ffffff",
    },
    background: {
      default: "#201f29",
      paper: "#201f29",
    },
  },
});