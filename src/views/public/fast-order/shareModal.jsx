import { Button, Center, Loader, Modal } from "@mantine/core";
import { useClipboard, useDisclosure } from "@mantine/hooks";
import { IconCheck, IconCopy, IconShare } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import fakeTokenDecode from "../../../Libs/jwt";

function ShareModal(filters) {
  const [opened, { open, close }] = useDisclosure();
  const clipboard = useClipboard({ timeout: 2000 });

  const [userInfo, setUserInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("user");

    if (token) {
      try {
        const extractedData = fakeTokenDecode(token);
        setUserInfo(extractedData);
      } catch (err) {
      }
    }

    setIsLoading(false);
  }, []);

  return (
    <>
      {userInfo?.role === "supplier" && (
        <Button size="xs" rightSection={<IconShare size={16} />} onClick={open}>
          اشتراک گذاری
        </Button>
      )}

      <Modal
        centered
        title="اشتراک گذاری محصولات شما"
        onClose={close}
        opened={opened}
        removeScrollProps={{ removeScrollBar: false }}
        lockScroll={false}
        removeScrollBar={false}
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
            onClick={() =>
              clipboard.copy(
                `${window.location}?supplierid=${userInfo?.supplierId}`
              )
            }
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
