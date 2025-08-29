import { Button, Center, Loader, Modal, Stack, Text } from "@mantine/core";
import { useClipboard, useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconCheck, IconCopy, IconShare } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { useData } from "../../../Libs/api";
import React from "react";
import Cookies from "js-cookie";
import { useCookies }  from "react-cookie";
import fakeTokenDecode, { decodeFakeJWT } from "../../../Libs/jwt";
import { useDispatch, useSelector } from "react-redux";
import { verifyToken } from "../../../redux/auth/authusers/auth";


function ShareModal(filters) {
  const [opened, { open, close }] = useDisclosure();

  const clipboard = useClipboard({ timeout: 2000 });

  const { data, isLoading } = useData({
    url: "/edit-account",
    queryKey: ["edit-account",true],
  });


  const dispatch = useDispatch()

  const [ cookies, setCookie ] = useCookies(["user"]);
  const [ userInfo, setUserInfo ] = useState({})



  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");


  const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);

  useEffect(() => {

        const extractedData = fakeTokenDecode(cookies.user);
        setUserInfo(extractedData)
          

  }, [data, cookies])


      useEffect(() => {
        dispatch(verifyToken());
      }, [dispatch]);


  useEffect(() => {

        const extractedData = fakeTokenDecode(cookies.user);
        setUserInfo(extractedData)
          

  }, [data, cookies])



  return (
    <>
      {data && user?.role === "supplier" && <Button size="xs" rightSection={<IconShare size={16} />} onClick={open}>
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
              styles={{
                root: {
                  height: isMobile ? '32px' : '36px',
                  fontSize: isMobile ? '11px' : '13px'
                }
              }}
            color={clipboard.copied ? "" : "dark"}
            onClick={() => clipboard.copy(`${window.location}?supplierid=${user?.id}&suppliername=${user?.name}`)}
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
