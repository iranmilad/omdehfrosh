import { Button, Center, Loader, Modal, Stack, Text } from "@mantine/core";
import { useClipboard, useDisclosure } from "@mantine/hooks";
import { IconCheck, IconCopy, IconShare } from "@tabler/icons-react";
import React from "react";
import { useData } from "../../../Libs/api";
import React from "react";

function ShareModal() {
  const [opened, { open, close }] = useDisclosure();
  const clipboard = useClipboard({ timeout: 2000 });
  const { data, isLoading } = useData({
    url: "/edit-account",
    queryKey: ["edit-account",true],
  });

  return (
    <>
      {data && data?.userType !== "user" && <Button size="xs" rightSection={<IconShare size={16} />} onClick={open}>
        اشتراک گذاری
      </Button>}
      <Modal
        centered
        title="اشتراک گذاری محصولات شما"
        onClose={close}
        opened={opened}
      >
        {isLoading ? (
          <Center>
            <Loader />
          </Center>
        ) : (
          <Button
            size="sm"
            variant="light"
            fullWidth
            mt="md"
            color={clipboard.copied ? "" : "dark"}
            onClick={() => clipboard.copy(`${window.location}/${data.id}`)}
          >
            {clipboard.copied ? (
              <IconCheck style={{ marginLeft: "10px" }} />
            ) : (
              <IconCopy style={{ marginLeft: "10px" }} />
            )}
            {clipboard.copied ? "کپی شد" : "کپی کردن لینک"}
          </Button>
        )}
      </Modal>
    </>
  );
}

export default ShareModal;
