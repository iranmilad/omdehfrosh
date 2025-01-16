import { Image } from "@mantine/core";
import React from "react";
import React from "react";
import { setEdit } from "../../../redux/editor";
import { useNode } from "@craftjs/core";
import placeholder from "../../../assets/placeholder.png"
import ImageSettings from "./settings";
import { useDispatch } from "react-redux";

export const EditorImage = ({w,h,src,fit,radius, ...props})=> {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp },
  } = useNode((state) => ({
    selected: state.events.selected,
    dragged: state.events.dragged,
  }));
  const dispatch = useDispatch();
  const click = ({src,fit}) => {
    dispatch(setEdit());
  };
  return (
    <Image
      {...props}
      ref={(ref) => connect(drag(ref))}
      onClick={click}
      src={src}
      fit={fit}
      w={w}
      h={h}
      radius={radius}
    />
  );
}

EditorImage.craft = {
    props: {
      src: 'https://placehold.co/600x400.png',
      fit: "contain",
      w: "100%",
      h: "100%",
      radius: "0"
    },
    related: {
      settings: ImageSettings,
    },
  };

