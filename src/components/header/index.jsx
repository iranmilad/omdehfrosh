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
  ScrollArea, 
  Text,
  NumberInput,
  NumberFormatter
} from "@mantine/core";
import Logo from "../../assets/logo.png";
import {
  IconArrowLeft,
  IconBasketHeart,
  IconLayoutSidebarLeftCollapse,
  IconLogout,
  IconMenu2,
  IconMenuDeep,
  IconShoppingCart,
  IconTrash,
  IconUser,
  IconUserCog,
  IconX,
} from "@tabler/icons-react";
import { NavLink } from "react-router";
import { useDisclosure } from "@mantine/hooks";
import Search from "../search";

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
                <Search />
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
      <Drawer.Root styles={{inner:{right:0}}}  opened={opened} onClose={close}>
        <Drawer.Overlay />

        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>سبد خرید</Drawer.Title>
            <ActionIcon variant="transparent" onClick={close}><IconMenu2 /></ActionIcon>
          </Drawer.Header>
          <Drawer.Body  pb="sm">
            <Flex justify="space-between" align="start">
              <Flex gap="md">
                <Image src="https://placehold.co/70" w={70} h={70} fit="contain" radius="sm" />
                <Flex justify="space-between" direction="column">
                  <Text>سلام</Text>
                  <Text size="sm" dir="ltr" c="green"><NumberFormatter value={2000000} thousandSeparator /> x 2</Text>
                </Flex>
              </Flex>
              <ActionIcon color="red" variant="white"><IconX size={16} /></ActionIcon>
            </Flex>
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
