import { Flex, Text, Image, Box, Anchor, Center } from "@mantine/core";
import React from "react";
import { NavLink } from "react-router";

function ProductGrid({ items }) {
  return (
    <Box className="grid sm:grid-cols-2 lg:grid-cols-4 bg-white overflow-hidden rounded-xl border">
      {items &&
        items.map((item, index) => (
          <div
            key={index}
            className={`bg-white p-3 ${index !== items.length - 1 ? "border-l" : ''}`}
          >
            <Flex mb="md" gap="md">
              <Text className="text-zinc-700">{item.title}</Text>
            </Flex>
            <div className="grid grid-cols-2">
              {item.children.map((child, index2) => {
                let border = "";

                switch (index2) {
                  case 0:
                    border = "border-l border-b";
                    break;
                  case 1:
                    border = "border-b";
                    break;
                  case 2:
                    border = "border-l";
                    break;
                  case 3:
                    border = "";
                    break;
                  default:
                    border = "";
                    break;
                }
                return (
                  <div
                    key={index2}
                    className={`py-5 ${border}`}
                  >
                    <NavLink to={`/product/${child.url}`}>
                      <Image
                        className="max-w-[120px] mx-auto"
                        fit="contain"
                        src={child.image}
                        alt={child.alt}
                      />
                    </NavLink>
                  </div>
                );
              })}
            </div>
            <Center pt="lg" pb="md"><Anchor size="sm" component={NavLink} to={`/category/${item.url}`}>مشاهده همه</Anchor></Center>
          </div>
        ))}
    </Box>
  );
}

export default ProductGrid;
