import { useEffect, useState } from "react";
import { Flex, Text, useMantineTheme } from "@mantine/core";
import { IconClock12 } from "@tabler/icons-react";
import persianDate from "persian-date";

function daysBetween(date1, date2) {
  const d1 = new persianDate(date1);
  const d2 = new persianDate(date2);

  const diffMil = d2.valueOf() - d1.valueOf();
  return Math.floor(diffMil / (1000 * 60 * 60 * 24));
}

const CountdownTimer = ({ shamsiDate }) => {
  const { colors } = useMantineTheme();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const today = new persianDate().toArray().slice(0, 3); 
    const targetDate = shamsiDate.split("-").map(Number);

    const calculateTimeLeft = () => {
      const days = daysBetween(today, targetDate);
      const now = new Date();
      

      if (days === 0) {
        const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        const diff = midnight - now;

        return {
          days: 0,
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        };
      }


      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days, 0, 0, 0);
      const diff = midnight - now;

      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

      return {
        days,
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [shamsiDate]);

  return (
    <Flex gap="xs" align="center">
      <Flex gap={4} dir="ltr">
        <Text fw="bold" size="sm" c={colors.red[5]} component="span">{String(timeLeft.days).padStart(2, "0")}</Text><Text fw="bold" size="sm" c={colors.red[5]} component="span">:</Text>
        <Text fw="bold" size="sm" c={colors.red[5]} component="span">{String(timeLeft.hours).padStart(2, "0")}</Text><Text fw="bold" size="sm" c={colors.red[5]} component="span">:</Text>
        <Text fw="bold" size="sm" c={colors.red[5]} component="span">{String(timeLeft.minutes).padStart(2, "0")}</Text><Text fw="bold" size="sm" c={colors.red[5]} component="span">:</Text>
        <Text fw="bold" size="sm" c={colors.red[5]} component="span">{String(timeLeft.seconds).padStart(2, "0")}</Text>
      </Flex>
      <IconClock12 size={14} color={colors.red[5]} />
    </Flex>
  );
};

export default CountdownTimer;
