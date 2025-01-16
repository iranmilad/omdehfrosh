import {
  Anchor,
  Button,
  Center,
  Flex,
  Image,
  Loader,
  NumberFormatter,
  Paper,
  Rating,
  ScrollArea,
  Table,
  Text,
  Title,
} from "@mantine/core";
import React, { useEffect } from "react";
import { NavLink } from "react-router";
import XTitle from "../../../components/title";
import {
  useIsFirstRender,
  useLocalStorage,
  useSessionStorage,
} from "@mantine/hooks";
import { useData, useSend } from "../../../Libs/api";
import InfoBox from "../../../components/InfoBox";

function Compare() {
  const [compare, setCompare] = useLocalStorage({
    key: "compare",
    defaultValue: [],
  });
  const { data, isLoading } = useData({
    url: "/compare",
    queryKey: ["compare", compare],
    bodyData: { id: compare },
    method: "POST",
    queryOptions: {
      enabled: compare && compare?.length > 0 ? true : false
    }
  });
  if (isLoading)
    return (
      <Center>
        <Loader />
      </Center>
    );
  return (
    <>
      <XTitle>مقایسه محصولات</XTitle>
      {data ? (
        <Paper mt="xl" px="xl">
          <ScrollArea type="auto">
            <Table striped withRowBorders={false} verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th miw={150}>ویژگی ها</Table.Th>
                  {data.title.map((title, index) => (
                    <Table.Th key={index} miw={200} maw={200}>
                      <Text size="sm" component={NavLink} to={`/product/${data.slug[index]}`}>{title}</Text>
                    </Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td>تصویر</Table.Td>
                  {data.image.map((image, index) => (
                    <Table.Td key={index}>
                      <Anchor underline="never" component={NavLink} to={`/product/${data.slug[index]}`}>
                        <Image src={image} w="200" h={200} fit="contain" />
                      </Anchor>
                    </Table.Td>
                  ))}
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>امتیاز</Table.Td>
                  {data.rating.map((product, index) => (
                    <Table.Td key={index}>
                      <Rating readOnly value={Number(product)} />
                    </Table.Td>
                  ))}
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>قیمت</Table.Td>
                  {data.price.map((product, index) => (
                    <Table.Td key={index}>
                      {product.discountedPrice ? (
                        <Flex gap="xs">
                          <Text size="sm" c="gray">
                            <NumberFormatter
                              thousandSeparator
                              value={product.regularPrice}
                              style={{ textDecoration: "line-through" }}
                            />
                          </Text>
                          <Text size="sm">
                            <NumberFormatter
                              thousandSeparator
                              value={product.discountedPrice}
                            />
                            تومان
                          </Text>
                        </Flex>
                      ) : (
                        <Text size="sm">
                          <NumberFormatter
                            thousandSeparator
                            value={product.regularPrice}
                          />
                          تومان
                        </Text>
                      )}
                    </Table.Td>
                  ))}
                </Table.Tr>
                {data.attributes.map((item, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>{item.label}</Table.Td>
                    {item.value.map((item2, index2) => (
                      <Table.Td key={index2}>{item2}</Table.Td>
                    ))}
                  </Table.Tr>
                ))}
                <Table.Tr>
                  <Table.Td>مشاهده محصول</Table.Td>
                  {data.slug.map((item, index) => (
                    <Table.Td key={index}>
                      <Button
                        radius={999}
                        component={NavLink}
                        to={`/product/${item}`}
                      >
                        مشاهده
                      </Button>
                    </Table.Td>
                  ))}
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Paper>
      ) : (
        <InfoBox mt="lg" shadow="0" bg="transparent" back={false}>
          محصولی برای مقایسه وجود ندارد
        </InfoBox>
      )}
    </>
  );
}

export default Compare;
