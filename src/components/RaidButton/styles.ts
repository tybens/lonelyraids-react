import { makeStyles } from "@material-ui/core/styles";

const styles = makeStyles((theme) => ({
  spinner: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  center: {
    position: "fixed",
    left: '50%',
    top: "50%",
    transform: 'translateX(-50%)',
  }
}));

export default styles;
