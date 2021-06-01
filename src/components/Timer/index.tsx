import React, { useEffect, useState } from 'react'

const Timer = ({onMount}: any) => {
  const [timeLeft, setTimeLeft] = useState(120);
  const [counting, setCounting] = useState(false);

  useEffect(() => {
    setCounting(true)
    onMount([timeLeft, setTimeLeft, counting, setCounting])

  }, [onMount, timeLeft])
 
    // start ticking on load (only counts down if seconds since)
    useEffect(() => {
      const timer = setTimeout(() => {
        if (counting) {
          setTimeLeft(timeLeft - 1);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }, []);
  
  
    if (timeLeft === 0) {
      setCounting(false);
    }

    return (
        <div>
            {timeLeft} seconds left
        </div>
    )
}

export default Timer
