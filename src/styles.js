import { makeStyles } from "@material-ui/core/styles";

const styles = makeStyles(() => ({
  app: {
    minHeight: "100vh",
    overflowX: "hidden",
  },
  header: {
    background: "#f1f3f5",
    padding: "20px 50px",
    minHeight: "100px",
    position: "fixed",
    top: 0,
  },
  headerInner: {
    maxWidth: 1000,
    height: "100%",
  },
  spinner: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
}));

export default styles;
