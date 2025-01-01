import {
  Center,
  Flex,
  Paper,
  SimpleGrid,
  Text,
  Rating,
  Pagination,
  Title,
  Loader,
  Divider,
  LoadingOverlay,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import SignleComment from "../../../../components/singleComment";
import { IconMessages } from "@tabler/icons-react";
import XTitle from "../../../../components/title";
import { useData } from "../../../../Libs/api";

function Comments({ activeTab }) {
  const [mounted, setMounted] = useState(0);
  const [activePage, setPage] = useState(1);
  const { data, isLoading,isFetching } = useData({
    url: `/seller/123/comments`,
    queryKey: ["seller-comments", activePage],
    queryOptions: { enabled: mounted >= 1,staleTime: 300000 },
    params: {
      limit: 15,
      page: activePage
    }
  });
  useEffect(() => {
    if (activeTab === "comments") setMounted((val) => val + 1);
  }, [activeTab]);
  return (
    <>
      {isLoading ? (
        <Center>
          <Loader />
        </Center>
      ) : (
        <>
          <>
            {data?.comments ? (
              <div style={{position:"relative"}}>
                <Paper mb="lg" p="xl">
                  <LoadingOverlay visible={isFetching} zIndex={1000} />
                  <Flex w="100%" justify="space-between" align="baseline">
                    <XTitle size="md">نقد و بررسی کاربران</XTitle>
                    <Flex align="align">
                      <Flex direction="column" align="end">
                        <Rating
                          size="md"
                          mb="xs"
                          value={data.rating}
                          readOnly
                        />
                        <Text c="gray" size="sm">
                          بر اساس نظرات {data.count} کاربر
                        </Text>
                      </Flex>
                      <Divider orientation="vertical" mx="md" />
                      <Title size="35" c="gray.7">
                        4.6
                      </Title>
                    </Flex>
                  </Flex>
                </Paper>
                <SimpleGrid cols={{base:1,xs:2,md:3 }} my="xl">
                  {data.comments.map((item, index) => (
                    <SignleComment key={index} paper={true} {...item} />
                  ))}
                </SimpleGrid>
                <Pagination
                  total={data.total / 15}
                  mt="xl"
                  value={activePage}
                  onChange={setPage}
                />
              </div>
            ) : (
              <Paper py="xl">
                <Center c="gray">
                  <Flex direction="column" align="center" gap="xl">
                    <IconMessages size={32} />
                    <Text>دیدگاهی برای این فروشنده ثبت نشده است.</Text>
                  </Flex>
                </Center>
              </Paper>
            )}
          </>
        </>
      )}
    </>
  );
}

export default Comments;
