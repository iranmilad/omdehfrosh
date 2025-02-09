import { useEffect, useState } from "react";
import { Flex, Text } from "@mantine/core";
import { IconClock12 } from "@tabler/icons-react";
import moment from "moment-jalaali";

const CountdownTimer = ({ shamsiDate }) => {
  const convertToTimestamp = (shamsiDate) => {
    return moment(shamsiDate, "jYYYY/jMM/jDD HH:mm:ss").toDate().getTime();
  };

  const targetTime = convertToTimestamp(shamsiDate);

  const calculateTimeLeft = () => {
    const difference = targetTime - new Date().getTime();
    if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Flex gap="sm" align="center">
      <Text size="sm" c="red.5">
        {String(timeLeft.days).padStart(2, "0")}:
        {String(timeLeft.hours).padStart(2, "0")}:
        {String(timeLeft.minutes).padStart(2, "0")}:
        {String(timeLeft.seconds).padStart(2, "0")}
      </Text>
      <IconClock12 size={14} color="red" />
    </Flex>
  );
};

export default CountdownTimer;
