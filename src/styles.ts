import { makeStyles } from "@material-ui/core/styles";

const styles = makeStyles((theme) => ({
  app: {
    minHeight: "100vh",
    overflowX: "hidden",
  },

  embed: {
    [theme.breakpoints.down("md")]: {
      padding: "0",
    },
    padding: "0 50px",
    height: "75vh",
  },

}));

export default styles;
