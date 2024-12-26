import {
  Button,
  Flex,
  Image,
  NumberFormatter,
  Paper,
  Rating,
  ScrollArea,
  Table,
  Text,
  Title,
} from "@mantine/core";
import React from "react";

function Compare() {
  return (
    <>
      <Title>مقایسه محصولات</Title>
      <Paper mt="xl" px="xl">
        <ScrollArea type="auto">
          <Table striped withRowBorders={false} verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th miw={150}>ویژگی ها</Table.Th>
                <Table.Th miw={200}>آیفون 13 پرو 256</Table.Th>
                <Table.Th miw={200}>آیفون 16 پرومکس 256 ZAA</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>تصویر</Table.Td>
                <Table.Td>
                  <Image
                    src="https://placehold.co/600x400"
                    w="200"
                    h={200}
                    fit="contain"
                  />
                </Table.Td>
                <Table.Td>
                  <Image
                    src="https://placehold.co/600x400"
                    w="200"
                    h={200}
                    fit="contain"
                  />
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>امتیاز</Table.Td>
                <Table.Td>
                  <Rating value={5} />
                </Table.Td>
                <Table.Td>
                  <Rating value={3} />
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>قیمت</Table.Td>
                <Table.Td>
                  <Text size="sm">
                    <NumberFormatter thousandSeparator value={25000000} /> تومان
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Flex gap="xs">
                    <Text size="sm" c="gray">
                      <NumberFormatter
                        thousandSeparator
                        value={30000000}
                        style={{ textDecoration: "line-through" }}
                      />
                    </Text>
                    <Text size="sm">
                      <NumberFormatter thousandSeparator value={27000000} />
                      تومان
                    </Text>
                  </Flex>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>افزودن به سبد</Table.Td>
                <Table.Td>
                  <Button size="sm" radius={999}>
                    افزودن
                  </Button>
                </Table.Td>
                <Table.Td>
                  <Button size="sm" radius={999}>
                    افزودن
                  </Button>
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>
    </>
  );
}

export default Compare;
