import React, { useState, useEffect } from "react";
import { TwitchEmbed } from "react-twitch-embed";
import {
  Button,
  Grid,
  CircularProgress,
  Typography,
  Drawer,
} from "@material-ui/core";
import useStyles from "./styles";

function App() {
  const [raid, setRaid] = useState("");
  const [buttonClicked, setButtonClicked] = useState(false)
  const [loading, setLoading] = useState(false);
  const classes = useStyles();
  const functionUrl = window.location.href.includes("localhost")
    ? "http://localhost:5001/lonelyraids/us-central/fetchStream"
    : "https://us-central1-lonelyraids.cloudfunctions.net/fetchStream";

  useEffect(() => {
    fetch(functionUrl)
      .then((res) => res.json())
      .then((json) => {
        if (json.streamName) {
          setRaid(json.streamName);
        } else {
          console.log("error jsonstreamname:", json.streamName);
          setRaid("");
        }
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = () => {
    // just toggle for now
    setLoading(true);
    setButtonClicked(true);
    fetch(functionUrl)
      .then((res) => res.json())
      .then((json) => {
        if (json.streamName) {
          setRaid(json.streamName);
          setLoading(false);
        } else {
          console.log("error jsonstreamname:", json.streamName);
          setRaid("");
        }
      });
  };

  const RaidButton = () => (
    <>
      <Button
        variant="contained"
        size="large"
        color="default"
        onClick={handleClick}
      >
        {loading ? (
          <CircularProgress className={classes.spinner} />
        ) : (
          "Start or join raid!"
        )}
      </Button>
      <Drawer in={loading}>
        <Typography variant="body2" color="primary">
          {"If starting a new raid, it could take >10s to find."}
        </Typography>
      </Drawer>
    </>
  );

  return (
    <Grid container alignItems="center" className={classes.app}>
      <Grid
        item
        xs={12}
        className={classes.header}
        alignItems="center"
        justify="center"
        container
      >
        <Grid
          item
          alignItems="center"
          xs={12}
          container
          justify={raid === "" ? "center" : "flex-end"}
          className={classes.headerInner}
        >
          {(raid !== "" && buttonClicked) && <RaidButton />}
        </Grid>
      </Grid>
      <Grid item xs={12} container justify="center" alignItems="center">
        {(raid !== "" && buttonClicked) ? (
          <TwitchEmbed
            channel={raid}
            theme="dark"
            onVideoPause={() => console.log(":(")}
          />
        ) : (
          <RaidButton />
        )}
      </Grid>
    </Grid>
  );
}

export default App;
