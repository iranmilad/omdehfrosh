import {
  ActionIcon,
  Badge,
  Button,
  Container,
  Flex,
  Image,
  Indicator,
  Menu,
  MenuDropdown,
  MenuItem,
  MenuTarget,
  Drawer,
  Stack,
  ScrollArea 
} from "@mantine/core";
import Logo from "../../assets/logo.png";
import {
  IconArrowLeft,
  IconBasketHeart,
  IconLogout,
  IconShoppingCart,
  IconTrash,
  IconUser,
  IconUserCog,
} from "@tabler/icons-react";
import { NavLink } from "react-router";
import { useDisclosure } from "@mantine/hooks";

const Header = () => {
  const [opened, { open, close }] = useDisclosure(false)
  return (
    <>
      <div class=" z-50 bg-white">
        <div>
          <div class="relative px-5 z-30 gap-x-4 bg-white py-4 shadow-sm">
            <Container>
              <Flex w="100%" justify="space-between" align="center">
                <Image src={Logo} h={80} w="auto" fit="contain" />
                <Flex align="center" gap="md">
                  <Indicator
                    offset={2}
                    withBorder
                    size={12}
                    label="2"
                    color="red"
                    inline
                    styles={{
                      indicator: { height: "15px", paddingTop: "2px" },
                    }}
                  >
                    <ActionIcon color="red" variant="light" size="xl" onClick={open}>
                      <IconShoppingCart />
                    </ActionIcon>
                  </Indicator>
                  <Menu shadow="md" width={200} position="bottom-end">
                    <MenuTarget>
                      <ActionIcon variant="light" size="xl">
                        <IconUser />
                      </ActionIcon>
                    </MenuTarget>
                    <MenuDropdown>
                      <MenuItem
                        rightSection={<IconUserCog size={18} />}
                        component={NavLink}
                        to="/user/edit"
                      >
                        ویرایش
                      </MenuItem>
                      <MenuItem
                        rightSection={<IconShoppingCart size={18} />}
                        component={NavLink}
                        to="/user/edit"
                      >
                        سفارش ها
                      </MenuItem>
                      <MenuItem
                        rightSection={<Badge variant="light">0</Badge>}
                        component={NavLink}
                        to="/user/edit"
                      >
                        پیام ها
                      </MenuItem>
                      <MenuItem
                        color="red"
                        rightSection={<IconLogout size={18} />}
                        component={NavLink}
                        to="/logout"
                      >
                        خروج
                      </MenuItem>
                    </MenuDropdown>
                  </Menu>
                </Flex>
              </Flex>
            </Container>
          </div>
        </div>
      </div>
      <Drawer.Root scrollAreaComponent={ScrollArea.Autosize}  opened={opened} onClose={close}>
        <Drawer.Overlay />

        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>سبد خرید</Drawer.Title>
            <Drawer.CloseButton />
          </Drawer.Header>
          <Drawer.Body  pb="sm">
            hello
          </Drawer.Body>
          <Flex w="100%" justify="space-between" px="sm" pb="sm">
            <Button w="auto" color="red" rightSection={<IconTrash size={20} />}>خالی کردن سبد</Button>
            <Button w="auto" rightSection={<IconArrowLeft size={20} />}>ادامه</Button>
          </Flex>
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
};

export default Header;
