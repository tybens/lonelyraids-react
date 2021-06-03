import React, { useState } from "react";
import { Grid } from "@material-ui/core";
import useStyles from "./styles";
import Header from "./components/Header";
import { TwitchEmbed } from "react-twitch-embed";

function App() {
  const [raid, setRaid] = useState("");
  const [buttonClicked, setButtonClicked] = useState(false);
  // const [timeLeft, setTimeLeft] = useState(60);
  // const ReactTwitchEmbed = await import("react-twitch-embed");

  const classes = useStyles();

  return (
    <Grid container alignItems="center" className={classes.app}>
      <Header
        buttonClicked={buttonClicked}
        setButtonClicked={setButtonClicked}
        setRaid={setRaid}
        raid={raid}
      />
      <Grid
        item
        xs={12}
        container
        justify="center"
        alignItems="center"
        className={classes.embed}
      >
        {raid !== "" && buttonClicked && (
          <TwitchEmbed
            width="100%"
            height="100%"
            id="this-id"
            channel={raid}
            theme="dark"
            onVideoPause={() => console.log(":(")}
          />
        )}
      </Grid>
    </Grid>
  );
}

export default App;
