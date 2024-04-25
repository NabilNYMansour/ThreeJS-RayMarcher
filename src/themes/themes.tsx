import { createTheme } from "@mui/material";

// Theming
export const darkTheme = createTheme({
  typography: {
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

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      // make the theme the light version of #201f29"
      default: "#fefefe",
      paper: "#fefefe",
    },
  },
});
