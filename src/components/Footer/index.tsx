import useStyles from "./styles";
import React from "react";
import { Grid, Link, Typography } from "@material-ui/core";

const Footer = () => {
  const classes = useStyles();

  const info = [
    {
      url: "https://www.github.com/tybens",
      link: "github",
    },
    {
      url: "https://www.linkedin.com/in/tybens",
      link: "linkedin",
    },
    {
      url: "https://twitter.com/tyloben",
      link: "twitter",
    },
    {
      url: "https://www.nobody.live",
      link: "the inspiration",
    },
  ];
  return (
    <Grid
      item
      xs={12}
      className={classes.footer}
      alignItems="flex-start"
      justify="center"
      container
    >
      <Grid item container justify="space-around">
        {info.map(({ url, link }) => (
          <Link href={url} color="primary" variant="body2">
            {link}
          </Link>
        ))}
      </Grid>
    </Grid>
  );
};

export default Footer;
