import {
  Flex,
  Grid,
  GridCol,
  Image,
  Title,
  Text,
  Container,
} from "@mantine/core";
import React from "react";
import ToolbarItem from "../editor/toolbar/toolbarItem";
import { useNode } from "@craftjs/core";
import { useDispatch } from "react-redux";
import { setEdit } from "../../redux/editor";
import { EditorContainer } from "../editor/container";
import placeholder from "../../assets/placeholder.png"

function HeroSection({ title, text, image }) {

  return (
    <EditorContainer>
      <Grid gutter="70">
        <GridCol GridCol span={{ md: 6 }}>
          <Flex gap="xl" direction="column">
            <div dangerouslySetInnerHTML={{__html: title}}/>
            <div dangerouslySetInnerHTML={{__html: text}} />
          </Flex>
        </GridCol>
        <GridCol span={{ md: 6 }}>
          <Image src={image} h={500} radius="25" />
        </GridCol>
      </Grid>
    </EditorContainer>
  );
}

HeroSection.craft = {
  props: {
    title: "عنوان",
    text: "متن پیشفرض",
    image: '',
  },
  related: {
    settings: () => (
      <div>
        <ToolbarItem type="image" propKey="image" label="تصویر" />
        <ToolbarItem type="wysiwyg" propKey="title" label="عنوان" />
        <ToolbarItem type="wysiwyg" propKey="text" label="متن" />
      </div>
    ),
  },
};

export default HeroSection;
