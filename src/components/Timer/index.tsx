import { Typography } from "@material-ui/core";
import React, { useEffect } from "react";

const Timer = ({ counting, timeLeft, setTimeLeft, setCounting }: any) => {
  useEffect(() => {
    let timer = setInterval(() => {
      if (counting && timeLeft > 0) {
        setTimeLeft(timeLeft - 1);
      } else {
        setCounting(false);
      }
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line
  }, [counting, timeLeft]);

  return (
    <Typography variant="body2" color="primary">
      {timeLeft} seconds left in this raid
      {timeLeft < 1 && "! Start a new one!"}
    </Typography>
  );
};

export default Timer;
