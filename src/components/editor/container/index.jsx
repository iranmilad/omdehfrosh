import { useNode } from "@craftjs/core";
import { Box } from "@mantine/core";
import React from "react";
import { useDispatch } from "react-redux";
import { setEdit } from "../../../redux/editor"; // Adjust the import path as needed
import ToolbarItem from "../toolbar/toolbarItem"; // Import the ToolbarItem component

export const EditorContainer = ({ children, padding, margin, backgroundColor, borderRadius, ...props }) => {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp },
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(setEdit()); // Dispatch the setEdit action
  };

  return (
    <Box
      ref={(ref) => connect(drag(ref))}
      style={{
        padding: `${padding}`,
        margin: `${margin}`,
        backgroundColor,
        borderRadius: `${borderRadius}`,
      }}
      onClick={handleClick} // Add the onClick handler
      {...props}
    >
      {children}
    </Box>
  );
};

EditorContainer.craft = {
  displayName: "Container",
  props: {
    padding: '10px 10px 10px 10px',
    margin: '10px 10px 10px 10px',
    backgroundColor: "",
    borderRadius: "4px 4px 4px 4px",
  },
  related: {
    settings: () => (
      <div>
        <ToolbarItem type="edge" propKey="padding" label="فاصله داخلی" /> {/* Padding */}
        <ToolbarItem type="edge" propKey="margin" label="فاصله خارجی" /> {/* Margin */}
        <ToolbarItem type="color" propKey="backgroundColor" label="رنگ پس‌زمینه" /> {/* Background Color */}
        <ToolbarItem type="edge" propKey="borderRadius" label="شعاع گوشه‌ها" /> {/* Border Radius */}
      </div>
    ),
  },
};