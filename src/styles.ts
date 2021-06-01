import { makeStyles } from "@material-ui/core/styles";

const styles = makeStyles((theme) => ({
  app: {
    minHeight: "100vh",
    overflowX: "hidden",
  },
  header: {
    background: "transparent",
    padding: "30px 50px",
    minHeight: "100px",
    position: "fixed",
    top: 0,
    [theme.breakpoints.down("sm")]: {
      position: "relative",
      padding: "0 20px",
    },
  },
  headerInner: {
    height: "100%",
  },

  embed: {
    [theme.breakpoints.down("md")]: {
      padding: "0",
    },
    padding: "0 50px",
    height: "75vh",
  },

  spinner: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
}));

export default styles;
