import {
  Anchor,
  Box,
  Button,
  Container,
  Menu,
  Overlay,
  Portal,
  Stack
} from "@mantine/core";
import React, { useState } from "react";
import { NavLink } from "react-router";
import MegaMenuTabs from "./tab";

const MegaMenu = ({ menuItems }) => {
  const [menuOpened, setMenuOpened] = useState(false);

  const handleMenuOpen = () => setMenuOpened(true);
  const handleMenuClose = () => setMenuOpened(false);

  return (
    <Box mt="lg">
<Stack style={{ flexDirection: "row" }} align="center" gap="xl">
  {menuItems?.map((item,index) => {
    if (item.mega) {
      return (
        <Menu
          key={index} // Use item.id instead of index
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
              leftSection={<Box fz="20px" dangerouslySetInnerHTML={{__html: item.icon}} />}
              px="0"
            >
              {item.label}
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
                <MegaMenuTabs menuItems={item?.links} />
              </Box>
            </Container>
          </Menu.Dropdown>
        </Menu>
      );
    } else {
      return (
        <React.Fragment key={index}> {/* Use React.Fragment with a key */}
          {item.links.map((item2,index2) => {
            if (item2.links.length > 0) {
              return (
                <Menu
                  key={index2} // Use item2.id instead of index
                  trigger="hover"
                  styles={{ dropdown: { minWidth: 170, padding: "7px" } }}
                  position="bottom-start"
                >
                  <Menu.Target> {/* Fix typo: MenuTarget -> Menu.Target */}
                    <Anchor c="dark" size="sm" fw="600" underline="never">
                      <Box fz="20px" dangerouslySetInnerHTML={{__html:item.icon}} />
                      {item.label}
                    </Anchor>
                  </Menu.Target>
                  <Menu.Dropdown>
                    {item2.links.map((child,childIndex) => (
                      <Menu.Item
                        key={childIndex} // Use child.id instead of index
                        component={NavLink}
                        to={child.url}
                      >
                        {child.label}
                      </Menu.Item>
                    ))}
                  </Menu.Dropdown>
                </Menu>
              );
            } else {
              return (
                <Button
                key={index2}
                variant="transparent"
                c="dark"
                leftSection={<Box fz="20px" dangerouslySetInnerHTML={{__html: item2.icon}} />}
                px="0"
                fw="600"
                underline="never"
                component={NavLink}
                to={item2.url}
                >
                  {item2.label}
                </Button>
              );
            }
          })}
        </React.Fragment>
      );
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
