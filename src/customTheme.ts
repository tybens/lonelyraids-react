import { createMuiTheme } from "@material-ui/core/styles";
import green from "@material-ui/core/colors/green";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#fff",
    },
    secondary: {
      main: green[500],
    },
  },
  typography: {
    button: {
      textTransform: "none",
    },
    fontFamily: ["Courier New", "Courier", "monospace"].join(","),
  },

  overrides: {
    MuiTypography: {
      h1: {
        fontFamily: "Courier New, Courier, monospace",
        fontSize: "3rem",
      },
    },

    MuiButton: {
        containedSizeLarge: {
            fontSize: "1.5rem",
        }
    }
  },
});

export default theme;
