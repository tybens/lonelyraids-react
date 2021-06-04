import { Grid, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import Timer from "../Timer";
import RaidButton from "../RaidButton";
import useStyles from "./styles";
import classNames from "classnames";

const Header = ({ buttonClicked, setRaid, raid, setButtonClicked }: any) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [counting, setCounting] = useState(false);

  const functionUrl = window.location.href.includes("localhost")
    ? "http://localhost:5001/lonelyraids/us-central1/fetchStream"
    : "https://us-central1-lonelyraids.cloudfunctions.net/fetchStream";

  // search for a stream when a user opens the site and start ticking
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
          setTimeLeft(60 - json.secondsSince);
          setRaid(json.streamName);
          setCounting(true);
        } else {
          console.log("error jsonstreamname:", json.streamName);
          setRaid("");
        }
      });

    // eslint-disable-next-line
  }, []);

  const handleClick = () => {
    // just toggle for now
    setLoading(true);
    fetch(functionUrl)
      .then((res) => res.json())
      .then((json) => {
        if (json.streamName) {
          setLoading(false);
          setRaid(json.streamName);
          setTimeLeft(60 - json.secondsSince);
          setCounting(true);
          setButtonClicked(true);
        } else {
          console.log("error jsonstreamname:", json.streamName);
          setRaid("");
        }
      });
  };

  return (
    <Grid
      item
      xs={12}
      className={classes.header}
      alignItems="flex-start"
      container
      justify={!buttonClicked ? "center" : "space-between"}
    >
      <Grid item sm={9} xs={12}>
        <Typography variant="h1" color="primary">
          Lonely Raids
        </Typography>
        <Typography variant="body2" color="primary" gutterBottom>
          collectively joining streams with low view counts
        </Typography>
        <Timer
          timeLeft={timeLeft}
          setTimeLeft={setTimeLeft}
          setCounting={setCounting}
          counting={counting}
        />
      </Grid>
      <Grid item xs>
        <RaidButton
          fullWidth={false}
          loading={loading}
          handleClick={handleClick}
          buttonClicked={buttonClicked}
        />
      </Grid>
    </Grid>
  );
};

export default Header;
