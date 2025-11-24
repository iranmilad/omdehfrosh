import {
  Box,
  Stack,
  NavLink as MantineNavLink,
  Text,
  Divider,
  Image,
  Paper
} from "@mantine/core";
import React, { useEffect, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { verifyToken } from "../../redux/auth/authusers/auth";

const DropDownMenu = ({ menuItems }) => {
  const { user } = useSelector((state) => state.auth);

  console.log("DropDownMenu rendered at ", menuItems);

  // Remove this - it's causing re-renders on every hover!
  // const dispatch = useDispatch();
  // useEffect(() => {
  //   dispatch(verifyToken());
  // }, [dispatch]);

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

  // Memoize the rendered content to prevent unnecessary re-renders
  const menuContent = useMemo(() => {
    if (!menuItems || menuItems.length === 0) return null;

    return menuItems.map((item, index) => {
      const isMainMenu = item.label === "منوی اصلی";

      return (
        <Box key={index}>
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
                  leftSection={
                    isValidIcon(link.icon) ? (
                      <Image
                        src={getIconSrc(link.icon)}
                        w={25}
                        h={25}
                        fit="contain"
                        alt={link.label}
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    ) : null
                  }
                  styles={{
                    root: {
                      padding: "4px 6px",
                      borderRadius: "4px",
                      backgroundColor: "transparent",
                      cursor: link.url ? "pointer" : "default",
                      width: "fit-content",
                      minWidth: "100%",
                      "&:hover": {
                        backgroundColor: link.url ? "#f8f9fa" : "transparent"
                      }
                    },
                    label: { fontSize: "14px", fontWeight: 400 }
                  }}
                />
              );
            }

            // Items with sub-links
            if (link.links && link.links.length > 0) {
              return (
                <Box key={link.id || linkIndex}>
                  <Text
                    size="xs"
                    fw={600}
                    c="dimmed"
                    tt="uppercase"
                    px="6px"
                    py="3px"
                  >
                    {link.label}
                  </Text>

                  <Stack gap={1}>
                    {link.links.map((child, childIndex) => (
                      <MantineNavLink
                        key={child.id || childIndex}
                        component={NavLink}
                        to={child.url}
                        label={child.label}
                        active={false}
                        leftSection={
                          isValidIcon(child.icon) ? (
                            <Image
                              src={getIconSrc(child.icon)}
                              w={18}
                              h={18}
                              fit="contain"
                              alt={child.label}
                              onError={(e) =>
                                (e.target.style.display = "none")
                              }
                            />
                          ) : null
                        }
                        styles={{
                          root: {
                            padding: "4px 6px",
                            marginLeft: "4px",
                            borderRadius: "4px",
                            backgroundColor: "transparent",
                            width: "fit-content",
                            minWidth: "calc(100% - 4px)",
                            "&:hover": { backgroundColor: "#f8f9fa" }
                          },
                          label: { fontSize: "14px" }
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
                  leftSection={
                    isValidIcon(link.icon) ? (
                      <Image
                        src={getIconSrc(link.icon)}
                        w={20}
                        h={20}
                        fit="contain"
                        alt={link.label}
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    ) : null
                  }
                  styles={{
                    root: {
                      padding: "4px 6px",
                      borderRadius: "4px",
                      backgroundColor: "transparent",
                      width: "fit-content",
                      minWidth: "100%",
                      "&:hover": { backgroundColor: "#f8f9fa" }
                    },
                    label: { fontSize: "14px", fontWeight: 400 }
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
      style={{ background: "transparent", width: "fit-content", maxWidth: "180px" }}
    >
      {menuContent}
    </Paper>
  );
};

export default React.memo(DropDownMenu);