import {
  Box,
  Stack,
  NavLink as MantineNavLink,
  Text,
  Divider,
  Image,
  Paper
} from "@mantine/core";
import { IconCategory } from "@tabler/icons-react";
import React, { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

const MENU_ICON_SIZE = 24;

const isValidIcon = (icon) => {
  if (!icon) return false;
  if (Array.isArray(icon)) {
    return icon.length > 0 && icon[0] && icon[0].trim() !== "";
  }
  if (typeof icon === "string") {
    return icon.trim() !== "";
  }
  return false;
};

const getIconSrc = (icon) => {
  if (Array.isArray(icon) && icon.length > 0) return icon[0];
  return icon;
};

function MenuIcon({ icon, label }) {
  const [hasError, setHasError] = useState(false);
  const showImage = isValidIcon(icon) && !hasError;

  return (
    <Box
      w={MENU_ICON_SIZE}
      h={MENU_ICON_SIZE}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        borderRadius: 4,
        backgroundColor: showImage ? "transparent" : "#f3f4f6",
      }}
    >
      {showImage ? (
        <Image
          src={getIconSrc(icon)}
          w={MENU_ICON_SIZE}
          h={MENU_ICON_SIZE}
          fit="contain"
          alt={label || ""}
          onError={() => setHasError(true)}
        />
      ) : (
        <IconCategory size={16} color="#9ca3af" stroke={1.5} />
      )}
    </Box>
  );
}

const DropDownMenu = ({ menuItems }) => {
  const { user } = useSelector((state) => state.auth);

  // Memoize the rendered content to prevent unnecessary re-renders
  const menuContent = useMemo(() => {
    if (!menuItems || menuItems.length === 0) return null;

    return menuItems.map((item, index) => {
      const isMainMenu = item.label === "منوی اصلی";

      return (
        <Box key={index} style={{ zIndex: 1001 }}>
          {/* Links */}
          {item.links?.map((link, linkIndex) => {
            // Main menu items
            if (isMainMenu) {
              return (
                <MantineNavLink
                  key={link.id || linkIndex}
                  component={link.url ? NavLink : "div"}
                  to={link.url || undefined}
                  label={link.label}
                  active={false}
                  leftSection={<MenuIcon icon={link.icon} label={link.label} />}
                  styles={{
                    root: {
                      padding: "4px 6px",
                      borderRadius: "4px",
                      backgroundColor: "transparent",
                      cursor: link.url ? "pointer" : "default",
                      width: "fit-content",
                      minWidth: "100%",
                      zIndex: 1001,
                      "&:hover": {
                        backgroundColor: link.url ? "#f8f9fa" : "transparent"
                      }
                    },
                    label: { fontSize: "14px", fontWeight: 400, color: "#093672" }
                  }}
                />
              );
            }

            // Items with sub-links
            if (link.links && link.links.length > 0) {
              return (
                <Box key={link.id || linkIndex} style={{ zIndex: 1001 }}>
                  <Text
                    size="xs"
                    fw={600}
                    tt="uppercase"
                    px="6px"
                    py="3px"
                    style={{ color: "#093672" }}
                  >
                    {link.label}
                  </Text>

                  <Stack gap={1} style={{ zIndex: 1001 }}>
                    {link.links.map((child, childIndex) => (
                      <MantineNavLink
                        key={child.id || childIndex}
                        component={NavLink}
                        to={child.url}
                        label={child.label}
                        active={false}
                        leftSection={<MenuIcon icon={child.icon} label={child.label} />}
                        styles={{
                          root: {
                            padding: "4px 6px",
                            marginLeft: "4px",
                            borderRadius: "4px",
                            backgroundColor: "transparent",
                            width: "fit-content",
                            minWidth: "calc(100% - 4px)",
                            zIndex: 1001,
                            "&:hover": { backgroundColor: "#f8f9fa" }
                          },
                          label: { fontSize: "14px", color: "#093672" }
                        }}
                      />
                    ))}
                  </Stack>

                  {linkIndex < item.links.length - 1 && (
                    <Divider my={3} />
                  )}
                </Box>
              );
            }

            // Normal link (no children)
            if (user?.role === "supplier" || link.id !== 232) {
              return (
                <MantineNavLink
                  key={link.id || linkIndex}
                  component={NavLink}
                  to={link.url}
                  label={link.label}
                  active={false}
                  leftSection={<MenuIcon icon={link.icon} label={link.label} />}
                  styles={{
                    root: {
                      padding: "4px 6px",
                      borderRadius: "4px",
                      backgroundColor: "transparent",
                      width: "fit-content",
                      minWidth: "100%",
                      zIndex: 1001,
                      "&:hover": { backgroundColor: "#f8f9fa" }
                    },
                    label: { fontSize: "14px", fontWeight: 400, color: "#093672" }
                  }}
                />
              );
            }

            return null;
          })}

          {index < menuItems.length - 1 && <Divider my={4} />}
        </Box>
      );
    });
  }, [menuItems, user?.role]);

  if (!menuItems || menuItems.length === 0) return null;

  return (
    <Paper
      radius="md"
      bg="transparent"
      shadow="none"
      p={0}
      style={{ 
        background: "transparent", 
        width: "fit-content", 
        maxWidth: "180px",
        zIndex: 1001
      }}
    >
      {menuContent}
    </Paper>
  );
};

export default React.memo(DropDownMenu);