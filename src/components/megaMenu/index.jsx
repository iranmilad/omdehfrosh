import React, { useState } from "react";
import {
  Menu,
  Button,
  Container,
  GridCol,
  Grid,
  Text,
  Box,
  useMantineTheme,
  Portal,
  Overlay,
  Tabs,
  Anchor,
  Stack,
  MenuTarget,
  MenuItem,
} from "@mantine/core";
import { IconMenu2 } from "@tabler/icons-react";
import { CONTAINER_SIZES } from "../../Libs/theme";
import MegaMenuTabs from "./tab";
import { NavLink } from "react-router";

const MegaMenu = ({ menuItems }) => {
  const [menuOpened, setMenuOpened] = useState(false);

  const handleMenuOpen = () => setMenuOpened(true);
  const handleMenuClose = () => setMenuOpened(false);

  return (
    <Box mt="lg">
      <Stack  style={{flexDirection:"row"}} align="center" gap="xl">
        <Menu
          width="100%"
          openDelay={100}
          closeDelay={200}
          onOpen={handleMenuOpen}
          onClose={handleMenuClose}
          trigger="hover"
          styles={{
            dropdown: {
              left: "50%",
              marginRight: "-50%",
              transform: "translateX(-50%)",
            },
          }}
        >
          <Menu.Target>
            <Button
              variant="transparent"
              c="dark"
              leftSection={<IconMenu2 size={20} />}
              px="0"
            >
              دسته‌بندی کالاها
            </Button>
          </Menu.Target>

          <Menu.Dropdown
            style={{
              borderBottomRightRadius: "5px",
              background: "transparent",
              border: "none",
            }}
          >
            <Container>
              <Box py="0" bg="white">
                <MegaMenuTabs menuItems={menuItems?.category} />
              </Box>
            </Container>
          </Menu.Dropdown>
        </Menu>
          {menuItems?.other.map((item,index) => {
            if(item.children){
                return (
                  <Menu key={index} trigger="hover" styles={{dropdown:{minWidth: 170,padding:"7px"}}}  position="bottom-start">
                  <MenuTarget>
                    <Anchor c="dark" size="sm" fw="600" underline="never">
                      {item.label}
                    </Anchor>
                  </MenuTarget>
                  <Menu.Dropdown>
                    {item.children.map((child,index2) => <MenuItem key={index2} component={NavLink} to={child.path}>{child.title}</MenuItem>)}
                  </Menu.Dropdown>
                </Menu>
                )
            }
            else{
              return <Anchor key={index} c="dark" size="sm" fw="600" underline="never" component={NavLink} to={item.path}>
                {item.label}
              </Anchor>
            }
          })}


      </Stack>
      {menuOpened && (
        <Portal target="body">
          <Overlay zIndex={40} onClick={handleMenuClose} />
        </Portal>
      )}
    </Box>
  );
};
export default MegaMenu;
