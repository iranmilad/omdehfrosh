import { ThemeIcon, Flex, Skeleton, Text, Image, Button } from "@mantine/core";
import { IconBasket, IconBellRinging, IconBrandProducthunt, IconDeviceSpeaker, IconHeart, IconSpeakerphone } from "@tabler/icons-react";
import React from "react";
import { NavLink } from "react-router";

function NotificationItem(props) {
  return (
    <>
      {props.type && props.type === "product" ? (
        <Flex justify="space-between" align={{lg: "center"}} component={NavLink} to={`/product/${props.slug}`}>
          <Flex align={{lg: "center"}} gap={10}>
            <ThemeIcon variant="light"  size={50} radius={999}>
              <IconBasket />
            </ThemeIcon>
            <Flex direction="column" gap={3}>
              <Text size="sm">{props.title}</Text>
              <Text size="xs" c="gray.7">{props.subtitle}</Text>
              <Text size="xs" c="gray.6">{props.date}</Text>
            </Flex>
          </Flex>
          <Image w={50} h={50} radius="md" fit="contain" src={props.image} />
        </Flex>
      ) : (
        <Flex justify="space-between" align={{lg: "center"}}>
          <Flex align={{lg: "center"}} gap={10}>
            <ThemeIcon variant="light" color="red" size={50} radius={999}>
              <IconSpeakerphone />
            </ThemeIcon>
            <Flex direction="column" gap={3}>
            <Text size="sm">{props.title}</Text>
              <Text size="xs" c="gray.7">{props.subtitle}</Text>
              <Text size="xs" c="gray.6">{props.date}</Text>
            </Flex>
          </Flex>
          {props.link && <Button component="a" target="_blank" href={props.link} size="xs">مشاهده</Button>}
        </Flex>
      )}
    </>
  );
}

export default NotificationItem;
