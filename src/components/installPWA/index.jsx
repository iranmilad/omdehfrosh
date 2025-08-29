import { useState, useEffect } from "react";
import { Drawer, Button, Text, List, ThemeIcon, Image, Center, Flex, Divider } from "@mantine/core";
import { useDisclosure, useMediaQuery, useOs } from "@mantine/hooks";
import { IconCheck, IconDeviceMobileDown, IconDotsVertical, IconSquarePlus, IconUpload } from "@tabler/icons-react";
import { useSelector } from "react-redux";

const IOSDevice =() =>{
  return (
    <List size="sm" spacing="lg">
      <List.Item icon={<ThemeIcon variant="transparent"><IconUpload /></ThemeIcon>}>
      1 - در نوار پایین روی دکمه Share بزنید.
      </List.Item>
      <List.Item icon={<ThemeIcon variant="transparent"><IconSquarePlus /></ThemeIcon>}>
      2 - در منوی باز شده، در قسمت پایین ، گزینه Add to Home Screen را انتخاب کنید.
      </List.Item>
      <List.Item icon={<ThemeIcon variant="transparent"><IconCheck /></ThemeIcon>}>
      3 - مرحله بعد در قسمت بالا روی Add بزنید.
      </List.Item>
    </List>
  )
}

const AndroidDevice =() =>{
  return (
    <List size="sm" spacing="lg">
      <List.Item icon={<ThemeIcon variant="transparent"><IconDotsVertical /></ThemeIcon>}>
      1 - در نوار پایین روی دکمه Menu بزنید.
      </List.Item>
      <List.Item icon={<ThemeIcon variant="transparent"><IconDeviceMobileDown /></ThemeIcon>}>
      2 - در منوی باز شده، در قسمت پایین ، گزینه Install App را انتخاب کنید.
      </List.Item>
      <List.Item icon={<ThemeIcon variant="transparent"><IconCheck /></ThemeIcon>}>
      3 - مرحله بعد در قسمت بالا روی Install بزنید.
      </List.Item>
    </List>
  )
}

function InstallPWA() {
  const [opened, { open, close }] = useDisclosure(false);
  const bootstrap = useSelector((state) => state.global.bootstrap);
  const os = useOs();
  const smallWidth = useMediaQuery("(max-width: 991px)")

  useEffect(() => {
    const local = localStorage.getItem("installPWA");
    if(local === null){
      setTimeout(() => {
        open()
      },10000)
    }
  }, [open]);

  const standalone =
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone;

  const handleClose = () => {
    close();
    localStorage.setItem("installPWA", "true");
  };

  return (
    <>
      <Drawer
        opened={opened && smallWidth && !standalone}
        onClose={handleClose}
        position="bottom"
        size="90%"
        styles={{
          body: { padding: "20px" },
          inner:{right:0}
        }}
      >
        <Center>
          <Flex justify="center" align="center" direction="column" gap="lg">
            <Image fit="contain" w={130} h={130} src={bootstrap.logo} />
            <Text size="sm" component="span" ta="center">وب‌اپلیکیشن فروشگاه را به صفحه اصلی موبایل خود اضافه کنید.</Text>
          </Flex>
        </Center>
        <Divider my="xl" />
        {os === "ios" && <IOSDevice />}
        {os === "android" && <AndroidDevice />}
        <Button fullWidth mt="xl" onClick={handleClose}>
          متوجه شدم
        </Button>
      </Drawer>
    </>
  );
}


export default InstallPWA