import { Grid, GridCol, Group, Image, ScrollArea } from "@mantine/core";
import React from "react";
import { NavLink } from "react-router";

function GridBanner({items}) {
  return (
      <Grid gap="md">
        {items && items.map((item,index) => (
            <GridCol key={index} span={{base: 6,lg: 3}}>
              <NavLink to={item.url}><Image h={{lg: 242}} fit={{lg: "cover"}} display="block" radius="lg" src={item.image} /></NavLink>
            </GridCol>
        ))}
      </Grid>
  );
}

export default GridBanner;
