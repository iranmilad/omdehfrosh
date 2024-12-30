import {
  ActionIcon,
  Avatar,
  Button,
  Flex,
  Indicator,
  Paper,
  Rating,
  Text,
  Title,
} from "@mantine/core";
import {
  IconCircleCheck,
  IconCircleCheckFilled,
  IconShare,
} from "@tabler/icons-react";
import React from "react";

function Info({toggleShareModal}) {
  return (
    <Flex justify="space-between" align="center">
      <Flex align="center" gap="sm">
        <Avatar size="xl" />
        <Flex direction="column" align="start" gap="xs">
          <Title>دیجیکالا</Title>
          <Text size="sm" c="gray">
            تهران
          </Text>
          <Flex align="center" gap="5" c="blue">
            <IconCircleCheckFilled size={14} />
            <Text size="xs">تایید شده</Text>
          </Flex>
        </Flex>
      </Flex>
      <Flex direction="column" align="end" gap="sm">
        <Rating value={4} readOnly />
        <Button leftSection={<IconShare size={16} />} variant="light" onClick={toggleShareModal}>
          اشتراک گذاری
        </Button>
      </Flex>
    </Flex>
  );
}

export default Info;
