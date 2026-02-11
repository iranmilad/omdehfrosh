import { Button, Center, Loader, Modal, Stack, Text } from "@mantine/core";
import { useClipboard, useDisclosure } from "@mantine/hooks";
import { IconCheck, IconCopy, IconShare } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useCookies } from "react-cookie";
import fakeTokenDecode, { decodeFakeJWT } from "../../../Libs/jwt";
import { verifyToken } from "../../../redux/auth/authusers/auth";

function ShareModal({ filters, data, isLoading }) {
  const [opened, { open, close }] = useDisclosure();
  const clipboard = useClipboard({ timeout: 2000 });
  const [cookies, setCookie] = useCookies(["user"]);
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    if (cookies.user) {
      try {
        const extractedData = fakeTokenDecode(cookies.user);
        setUserInfo(extractedData);
      } catch (error) {
        console.error("Error decoding token:", error);
        setUserInfo({});
      }
    }
  }, [cookies.user]); // Fixed dependency array

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?supplierid=${userInfo?.supplierId}&suppliername=${encodeURIComponent(userInfo?.supplierName || '')}`;
    clipboard.copy(shareUrl);
  };

  // Only show button if user is a supplier
  if (!userInfo?.role || userInfo.role !== "supplier") {
    return null;
  }

  return (
    <>
      <Button size="xs" rightSection={<IconShare size={16} />} onClick={open}>
        اشتراک گذاری
      </Button>

      <Modal
        centered
        title="اشتراک گذاری محصولات شما"
        onClose={close}
        removeScrollProps={{ removeScrollBar: false }}
        opened={opened}
        lockScroll={false}
        removeScrollBar={false}
      >
        {isLoading ? (
          <Center>
            <Loader />
          </Center>
        ) : (
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              با کلیک روی دکمه زیر، لینک صفحه محصولات شما کپی خواهد شد
            </Text>
            <Button
              size="sm"
              variant="light"
              fullWidth
              color={clipboard.copied ? "green" : "dark"}
              onClick={handleCopyLink}
              leftSection={
                clipboard.copied ? (
                  <IconCheck size={16} />
                ) : (
                  <IconCopy size={16} />
                )
              }
            >
              {clipboard.copied ? "کپی شد" : "کپی کردن لینک"}
            </Button>
            {clipboard.copied && (
              <Text size="xs" c="green" ta="center">
                لینک با موفقیت کپی شد!
              </Text>
            )}
          </Stack>
        )}
      </Modal>
    </>
  );
}

export default ShareModal;