import { Button, Center, Loader, Modal, Stack, Text } from "@mantine/core";
import { useClipboard, useDisclosure } from "@mantine/hooks";
import { IconCheck, IconCopy, IconShare } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import React from "react";
import Cookies from "js-cookie";
import { useCookies }  from "react-cookie";
import fakeTokenDecode, { decodeFakeJWT } from "../../../Libs/jwt";
import { verifyToken } from "../../../redux/auth/authusers/auth";


function ShareModal(filters) {
  const [opened, { open, close }] = useDisclosure();

  const clipboard = useClipboard({ timeout: 2000 });

  const [ cookies, setCookie ] = useCookies(["user"]);
  const [ userInfo, setUserInfo ] = useState({})


  useEffect(() => {

        const extractedData = fakeTokenDecode(cookies.user);
        setUserInfo(extractedData)
          

  }, [data, cookies])




  return (
    <>
      {data && userInfo?.role === "supplier" && <Button size="xs" rightSection={<IconShare size={16} />} onClick={open}>
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
            onClick={() => clipboard.copy(`${window.location}?supplierid=${userInfo?.supplierId}&suppliername=${userInfo?.supplierName}`)}
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
