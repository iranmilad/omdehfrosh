import { useRef, useState } from "react";
import {
  Drawer,
  Button,
  Flex,
  Text,
  Box,
  ScrollArea,
  ActionIcon,
  Image,
  NumberFormatter,
} from "@mantine/core";
import { useDisclosure, useElementSize } from "@mantine/hooks";
import ProductPrice from "../ProductPrice";
import { IconTrash } from "@tabler/icons-react";
import Counter from "../counter";

const MiniCart = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const ref = useRef();

  console.log(ref.current);

  return (
    <>
      <Button onClick={open}>باز کردن دراور</Button>

      <Drawer.Root
        opened={opened}
        onClose={close}
        styles={{ inner: { right: 0 } }}
      >
        <Drawer.Overlay />
        <Drawer.Content ref={ref} h="100%">
          <Drawer.Header>
            <Drawer.Title>Drawer title</Drawer.Title>
            <Drawer.CloseButton />
          </Drawer.Header>
          <Drawer.Body h="83%">
            <ScrollArea h="100%" type="always">
              <Flex gap="5">
                <Image
                  src="https://placehold.co/70"
                  w={70}
                  h={70}
                  fit="contain"
                  radius="sm"
                />
                <Flex gap="0" direction="column" flex="1">
                  <Flex align="baseline" justify="space-between">
                    <Text>گوشی موبایل اپل مدل iPhone 16 Pro Max ZAA
                    </Text>
                    <ActionIcon color="red" variant="light">
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Flex>
                  <Flex
                    dir="ltr"
                    gap="sm"
                    align="end"
                    justify="space-between"
                    direction="row"
                    w="max-content"
                  >
                    <NumberFormatter thousandSeparator value={10_000_000} />{" "}
                    <Text c="var(--mantine-primary-color-filled)">x 2</Text>
                  </Flex>
                </Flex>
              </Flex>
            </ScrollArea>
          </Drawer.Body>
          <Flex
            justify="space-between"
            align="center"
            h="50px"
            pos="fixed"
            bottom={0}
            right={0}
            w="100%"
            px="xs"
            pb="sm"
          >
            <Button color="red">خالی کردن سبد خرید</Button>
            <Button>ادامه</Button>
          </Flex>
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
};

export default MiniCart;
