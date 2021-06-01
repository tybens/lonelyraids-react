import React, { useState, useEffect } from "react";
import {
  Button,
  Grid,
  CircularProgress,
  Typography,
  Drawer,
} from "@material-ui/core";
import useStyles from "./styles";
const TwitchEmbed = require("react-twitch-embed").TwitchEmbed
function App() {
  const [raid, setRaid] = useState("");
  const [buttonClicked, setButtonClicked] = useState(false);
  const [loading, setLoading] = useState(false);
  // const [timeLeft, setTimeLeft] = useState(60);
  // const ReactTwitchEmbed = await import("react-twitch-embed");

  const classes = useStyles();
  const functionUrl = window.location.href.includes("localhost")
    ? "http://localhost:5001/lonelyraids/us-central/fetchStream"
    : "https://us-central1-lonelyraids.cloudfunctions.net/fetchStream";

  // search for a stream when a user opens the site
  useEffect(() => {
    fetch(functionUrl)
      .then((res) => res.json())
      .then((json) => {
        if (json.streamName) {
          console.log(
            "found stream: ",
            json.streamName,
            " with seconds since: ",
            60 - json.secondsSince
          );
          // setCounting(true);
          // setTimeLeft(60 - json.secondsSince);
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
    fetch(functionUrl)
      .then((res) => res.json())
      .then((json) => {
        if (json.streamName) {
          setLoading(false)
          setRaid(json.streamName);
          setButtonClicked(true);
        } else {
          console.log("error jsonstreamname:", json.streamName);
          setRaid("");
        }
      });
  };

  const RaidButton = ({ fullWidth = true }: any) => (
    <>
      <Button
        variant="contained"
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
          justify={!buttonClicked ? "center" : "space-between"}
          className={classes.headerInner}
        >
          <Grid item sm={9} xs={12}>
            <Typography variant="h1" color="primary">
              Lonely Raids
            </Typography>
            <Typography variant="body2" color="primary">
              collectively joining streams with zero viewers
            </Typography>
          </Grid>
          <Grid item xs>
            {raid !== "" && buttonClicked && <RaidButton />}
          </Grid>
        </Grid>
      </Grid>
      <Grid
        item
        xs={12}
        container
        justify="center"
        alignItems="center"
        className={classes.embed}
      >
        {raid !== "" && buttonClicked ? (
          <TwitchEmbed
            width="100%"
            height="100%"
            id="this-id"
            channel={raid}
            theme="dark"
            onVideoPause={() => console.log(":(")}
          />
        ) : (
          <RaidButton fullWidth={false} />
        )}
      </Grid>
    </Grid>
  );
}

export default App;
