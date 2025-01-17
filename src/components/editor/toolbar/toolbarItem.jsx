import { useNode } from "@craftjs/core";
import { Box, ColorInput, NumberInput, Select, TextInput, ActionIcon } from "@mantine/core";
import Editor from 'react-simple-wysiwyg';
import React from "react";
import TextEditor from "../../textEditor";
import ImageHandler from "./imageHandler";
import UnitInput from "./unitInput";
import EdgeSpacing from "./edgeSpacing";
import { IconX } from "@tabler/icons-react"; // Import IconX for the clear button
import Repeater from "../repeater";

function ToolbarItem({
  full = false,
  propKey,
  type,
  onChange,
  index,
  label,
  ...props
}) {
  const {
    actions: { setProp },
    propValue,
  } = useNode((node) => ({ propValue: node.data.props[propKey] }));

  const value = Array.isArray(propValue) ? propValue[index] : propValue;

  // Unified handleChange function
  const handleChange = (newValue) => {
    setProp((props) => {
      props[propKey] = onChange ? onChange(newValue) : newValue;
    });
  };

  const renderContent = (type) => {
    switch (type) {
      case "text":
        return (
          <TextInput
            size="xs"
            {...props}
            variant="filled"
            label={label}
            type={type}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
          />
        );
      case "number":
        return (
          <NumberInput
            {...props}
            size="xs"
            label={label}
            variant="filled"
            value={value}
            onChange={(value) => handleChange(value)}
          />
        );
      case "color":
        return (
          <ColorInput
            {...props}
            label={label}
            size="xs"
            variant="filled"
            value={value}
            onChange={(value) => handleChange(value)}
            withEyeDropper={false} // Disable eye dropper
            rightSection={
              value && (
                <ActionIcon
                  variant="transparent"
                  c="gray"
                  size="xs"
                  onClick={() => handleChange("")} // Clear the color
                >
                  <IconX />
                </ActionIcon>
              )
            }
          />
        );
      case "unit":
        return (
          <UnitInput
            {...props}
            label={label}
            number={value}
            onChange={(value) => handleChange(value)}
          />
        );
      case "select":
        return (
          <Select
            {...props}
            label={label}
            size="xs"
            variant="filled"
            value={value}
            onChange={(value) => handleChange(value)}
          />
        );
      case "wysiwyg":
        return (
          <TextEditor
            value={value || ''}
            onChange={(html) => handleChange(html)}
          />
        );
      case "image":
        return (
          <ImageHandler
            maxFiles={1}
            items={[value]}
            url="/upload"
            maxSize={6 * 1024 * 1024}
            {...props}
            onChange={(value) => handleChange(value)}
          />
        );
      case "edge":
        return (
          <EdgeSpacing
            value={value}
            label={label}
            onChange={(value) => handleChange(value)}
          />
        );
      case 'repeater': 
        return <Repeater label={label} onChange={(value) => handleChange(value)} {...props} />
      default:
        return null;
    }
  };

  return <Box mb="md">{renderContent(type)}</Box>;
}

export default ToolbarItem;