import { Button, Modal, Stack, Text } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import React from "react";

function ShareModal(props) {
  const clipboard = useClipboard({ timeout: 2000 });
  return (
    <Modal
      centered
      title="اشتراک گذاری"
      onClose={props.close}
      opened={props.opened}
    >
      <Stack>
        <Text size="sm">این کالا را با دوستان خود به اشتراک بگذارید!</Text>
        <Button
          size="sm"
          variant="light"
          fullWidth
          mt="md"
          color={clipboard.copied ? "" : "dark"}
          onClick={() => clipboard.copy(props.link)}
        >
          {clipboard.copied ? (
            <IconCheck style={{ marginLeft: "10px" }} />
          ) : (
            <IconCopy style={{ marginLeft: "10px" }} />
          )}
          {clipboard.copied ? "کپی شد" : "کپی کردن لینک"}
        </Button>
      </Stack>
    </Modal>
  );
}

export default ShareModal;
