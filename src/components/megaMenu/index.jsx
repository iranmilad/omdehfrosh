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
} from "@mantine/core";
import { IconMenu2 } from "@tabler/icons-react";
import { CONTAINER_SIZES } from "../../Libs/theme";
import MegaMenuTabs from "./tab";

const MegaMenu = () => {
  const [menuOpened, setMenuOpened] = useState(false);

  const handleMenuOpen = () => setMenuOpened(true);
  const handleMenuClose = () => setMenuOpened(false);

  return (
    <>
      <Menu
        width="100%"
        openDelay={100}
        closeDelay={200}
        onOpen={handleMenuOpen}
        onClose={handleMenuClose}
        
        styles={{
          dropdown: {
            left: "50%",
            marginRight: "-50%",
            transform: "translateX(-50%)",
          },
        }}
      >
        <Menu.Target>
          <Button variant="transparent" leftSection={<IconMenu2 size={20} />} px="0">
            دسته‌بندی کالاها
          </Button>
        </Menu.Target>

        <Menu.Dropdown style={{borderBottomRightRadius: "5px",background:"transparent",border:"none"}}>
          <Container>
            <Box py="0" bg="white">
                <MegaMenuTabs />
            </Box>
          </Container>
        </Menu.Dropdown>
      </Menu>
      {menuOpened && (
        <Portal target="body">
          <Overlay zIndex={40} onClick={handleMenuClose} />
        </Portal>
      )}
    </>
  );
};
export default MegaMenu;
