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
  NumberFormatter,
  Anchor
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
import { NavLink, useNavigate } from "react-router";
import { useDisclosure } from "@mantine/hooks";
import Search from "../search";
import { useCookies } from "react-cookie";
import { useSelector } from "react-redux";
import MegaMenu from "../megaMenu";

const Header = () => {
  const bootstrap = useSelector((state) => state.global.bootstrap);
  const [opened, { open, close }] = useDisclosure(false);
  const [cookies, setCookie,removeCookie] = useCookies(["user"]);
  const navigate = useNavigate();
  const Logout = () => {
    removeCookie('user',{path: '/'})
  }
  return (
    <>
    {bootstrap.banner ? <a className="relative z-50" href={bootstrap.banner.link} target="_blank"><Image src={bootstrap.banner.src} /></a> : null}
      <div className=" z-50 bg-white relative" id="header">
        <div>
          <div className="relative z-30 gap-x-4 bg-white py-4 pb-3 shadow-sm">
            <Container>
              <Flex w="100%" justify="space-between" align="center">
                <Flex align="center" gap={60}>
                  <Anchor component={NavLink} to="/">
                    <Image src={Logo} h={80} w="auto" fit="contain" />
                  </Anchor>
                  <Search />
                </Flex>
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
                  {cookies.user ? (<Menu shadow="md" width={200} position="bottom-end">
                    <MenuTarget>
                      <ActionIcon variant="light" size="xl">
                        <IconUser />
                      </ActionIcon>
                    </MenuTarget>
                    <MenuDropdown>
                      <MenuItem
                        rightSection={<IconUserCog size={18} />}
                        component={NavLink}
                        to="/account/edit-account"
                      >
                        ویرایش
                      </MenuItem>
                      <MenuItem
                        rightSection={<IconShoppingCart size={18} />}
                        component={NavLink}
                        to="/account/orders"
                      >
                        سفارش ها
                      </MenuItem>
                      <MenuItem
                        rightSection={<Badge variant="light">0</Badge>}
                        component={NavLink}
                        to="/account/notifications"
                      >
                        پیام ها
                      </MenuItem>
                      <MenuItem
                        color="red"
                        rightSection={<IconLogout size={18} />}
                        component={NavLink}
                        onClick={() => Logout()}
                      >
                        خروج
                      </MenuItem>
                    </MenuDropdown>
                  </Menu>) : (
                      <Button style={{height: 45}} variant="light" size="md" fz="sm" component={NavLink} to="/login">
                        ورود یا ثبت نام
                      </Button>)}

                </Flex>
              </Flex>
              <MegaMenu />
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
            <Button onClick={() => {
              close();
              navigate('/basket')
            }} w="auto" rightSection={<IconArrowLeft size={20} />}>ادامه</Button>
          </Flex>
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
};

export default Header;
