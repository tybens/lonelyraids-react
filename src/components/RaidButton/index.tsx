import {
  Button,
  CircularProgress,
  Drawer,
  Typography,
} from "@material-ui/core";
import React from "react";
import useStyles from "./styles";

const RaidButton = ({
  fullWidth = true,
  loading,
  handleClick,
  buttonClicked,
}: any) => {
  const classes = useStyles();
  return (
    <>
      <Button
        variant="contained"
        className={!buttonClicked ? classes.center : ""}
        size={buttonClicked ? "medium" : "large"}
        color="primary"
        fullWidth={fullWidth}
        onClick={handleClick}
      >
        {loading ? (
          <CircularProgress className={classes.spinner} />
        ) : (
          "Join or start raid!"
        )}
      </Button>
      <Drawer open={false}>
        <Typography variant="body2" color="primary">
          {"If starting a new raid, it could take >10s to find."}
        </Typography>
      </Drawer>
    </>
  );
};

export default RaidButton;
