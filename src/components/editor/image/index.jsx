import { Image, Text } from "@mantine/core";
import React from "react";
import React from "react";
import { setEdit } from "../../../redux/editor";
import { useNode } from "@craftjs/core";
import placeholder from "../../../assets/placeholder.png";
import ImageSettings from "./settings";
import { useDispatch } from "react-redux";
import { EditorContainer } from "../container";

export const EditorImage = ({label, w, h, src, fit, radius, ...props }) => {
  return (
    <>
    <Text size="xs" mb="sm">{label}</Text>
      <Image {...props} src={src} fit={fit} w={w} h={h} radius={radius} />
    </>
  );
};

EditorImage.craft = {
  props: {
    src: "https://placehold.co/600x400.png",
    fit: "contain",
    w: "100%",
    h: "100%",
    radius: "0",
  },
  related: {
    settings: ImageSettings,
  },
};
