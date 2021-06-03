import { makeStyles } from "@material-ui/core/styles";

const styles = makeStyles((theme) => ({


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
  spinner: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },


  fullHeight: {
    height: "100vh",
  },
  
}));

export default styles;
