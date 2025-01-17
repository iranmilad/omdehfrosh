import { Grid, GridCol, Group, Image, ScrollArea } from "@mantine/core";
import React from "react";
import { NavLink } from "react-router";
import { EditorContainer } from "../editor/container";
import ToolbarItem from "../editor/toolbar/toolbarItem"

function GridBanner({items}) {
  return (
      <EditorContainer>
          <Grid gap="md">
          {items && items.map((item,index) => (
              <GridCol key={index} span={{base: 6,lg: 3}}>
                <NavLink to={item.url}><Image h={{lg: 242}} fit={{lg: "cover"}} display="block" radius="lg" src={item.image} /></NavLink>
              </GridCol>
          ))}
        </Grid>
      </EditorContainer>
  );
}

GridBanner.craft = {
  props: {
    items: [
      {
        url: "",
        image: ""
      }
    ],
  },
  related: {
    settings: () => {
      const fields = [
        {
          name: "url",
          type: "text",
          label: "لینک",
        },
        {
          name: "image",
          type: "image",
          label: "تصویر",
        },
      ];
      return (
        <div>
          <ToolbarItem
            type="repeater"
            propKey="items"
            label="آیتم ها"
            fields={fields}
          />
        </div>
      );
    },
  },
}



export default GridBanner;
