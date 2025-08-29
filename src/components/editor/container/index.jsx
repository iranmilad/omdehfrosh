import { useNode } from "@craftjs/core";
import { Box, Container } from "@mantine/core";
import React, { useState } from "react";
import "./style.css";
import { useDispatch } from "react-redux";
import { setEdit } from "../../../redux/editor";

export const EditorContainer = ({ children, container = true }) => {
  return (
    <Box component={location.pathname === "/editor" ? ContainerBox : "div"}>
      {container ? <Container>{children}</Container> : children}
    </Box>
  );
};

const ContainerBox = ({ children }) => {
  const {
    connectors: { connect, drag },
    selected,
    id,
    actions: { setProp },
  } = useNode((state) => ({
    selected: state.events.selected,
  }));
  const dispatch = useDispatch();

  return <div ref={(ref) => connect(drag(ref))} onClick={() => dispatch(setEdit())}>{children}</div>;
};
