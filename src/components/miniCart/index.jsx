import { useRef, useState } from "react";
import { Drawer, Button, Flex, Text, Box, ScrollArea } from "@mantine/core";
import { useDisclosure, useElementSize } from "@mantine/hooks";

const MiniCart = () => {
  const [opened , {open,close}] = useDisclosure(false);
  const ref = useRef();

  console.log(ref.current);

  return (
    <>
      <Button onClick={open}>باز کردن دراور</Button>

      <Drawer.Root opened={opened} onClose={close} styles={{inner:{right:0}}}>
        <Drawer.Overlay />
        <Drawer.Content ref={ref}>
          <Drawer.Header>
            <Drawer.Title>Drawer title</Drawer.Title>
            <Drawer.CloseButton />
          </Drawer.Header>
          <Drawer.Body>
            <ScrollArea h="100%">
                <Box>1</Box>
            </ScrollArea>
            <Box mt="auto">Footer</Box>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
};

export default MiniCart;
