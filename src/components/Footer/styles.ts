import { makeStyles } from "@material-ui/core/styles";

const styles = makeStyles((theme) => ({

    footer: {
        background: "transparent",
        padding: "30px 50px",
        position: "fixed",
        bottom: 0,
        [theme.breakpoints.down("sm")]: {
          position: "relative",
          padding: "0 20px",
        },
      },

}));

export default styles;
