import { Button, Modal, Stack, Text } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import React from "react";

function ShareModal({close,opened,link,children}) {
  const clipboard = useClipboard({ timeout: 2000 });
  return (
    <Modal
      centered
      title="اشتراک گذاری"
      onClose={close}
      opened={opened}
    >
      <Stack>
        <Text size="sm">
          {children}
        </Text>
        <Button
          size="sm"
          variant="light"
          fullWidth
          mt="md"
          color={clipboard.copied ? "" : "dark"}
          onClick={() => clipboard.copy(link)}
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
