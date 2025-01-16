import {
  Editor,
  Frame,
  Canvas,
  Selector,
  useNode,
  Element,
  useEditor,
} from "@craftjs/core";
import React from "react";
import { EditorText } from "../../../components/editor/text";
import { EditorContainer } from "../../../components/editor/container";

function EditorPage() {
  const {query} = useEditor(); 
  return (
    <>
      <Frame>
        <Element is={EditorContainer} canvas data-cy="root-container">
          <EditorText text="سلام" />
        </Element>
      </Frame>
    </>
  );
}

export default EditorPage;
