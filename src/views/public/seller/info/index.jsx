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
  Divider,
  Group,
} from "@mantine/core";
import {
  IconCircleCheck,
  IconCircleCheckFilled,
  IconShare,
} from "@tabler/icons-react";
import React from "react";
import LabelValue from "../../../../components/labelValue"

function Info({
  toggleShareModal,
  name,
  rating,
  province,
  userComments,
  image,
  others
}) {
  return (
    <>
      <Flex
        justify={{ base: "center", xs: "space-between", lg: "space-between" }}
        align="center"
      >
        <Flex direction={{ base: "column", xs: "row" }} align="center" gap="sm">
          <Avatar size="xl" src={image} />
          <Flex
            direction="column"
            align={{ base: "center", md: "start" }}
            gap="xs"
          >
            <Title>{name}</Title>
            <Text size="sm" c="gray">
              {province}
            </Text>
            <Flex align="center" gap="5" c="blue">
              <IconCircleCheckFilled size={14} />
              <Text size="xs">تایید شده</Text>
            </Flex>
            <Rating size="md" mb="xs" value={rating} readOnly hiddenFrom="xs" />
            <Flex align="center" hiddenFrom="xs">
              <Text c="gray" size="sm">
                بر اساس نظرات {userComments} کاربر
              </Text>
              <Divider orientation="vertical" mx="md" />
              <Title size={25} c="gray.7">
                {rating}
              </Title>
            </Flex>
            <Button
              size="xs"
              leftSection={<IconShare size={16} />}
              variant="light"
              onClick={toggleShareModal}
              hiddenFrom="xs"
            >
              اشتراک گذاری
            </Button>
          </Flex>
        </Flex>
        <Flex
          direction={{ base: "column" }}
          align="end"
          gap="sm"
          visibleFrom="xs"
        >
          <Flex align="align">
            <Flex direction="column" align="end">
              <Rating size="md" mb="xs" value={rating} readOnly />
              <Text c="gray" size="sm">
                بر اساس نظرات {userComments} کاربر
              </Text>
            </Flex>
            <Divider orientation="vertical" mx="md" visibleFrom="xs" />
            <Title size={35} c="gray.7" visibleFrom="xs">
              {rating}
            </Title>
          </Flex>
          <Button
            size="xs"
            leftSection={<IconShare size={16} />}
            variant="light"
            onClick={toggleShareModal}
          >
            اشتراک گذاری
          </Button>
        </Flex>
      </Flex>
      <Group mt="lg">
        {others.map((item, index) => (
          <React.Fragment key={index}>
            <LabelValue label={`${item.label} : `} value={item.value} />
            {index !== others.length - 1 && <Divider orientation="vertical" />}
          </React.Fragment>
        ))}
      </Group>
    </>
  );
}

export default Info;
