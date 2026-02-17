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
import React, { useEffect, useState, useMemo } from "react";
import SignleComment from "../../../../components/singleComment";
import { IconMessages } from "@tabler/icons-react";
import XTitle from "../../../../components/title";
import { useDispatch, useSelector } from "react-redux";
import { getSellerComments } from "../../../../redux/seller/sellerComments/getSellerCommentsActions";

const limit = 15;

function Comments({ id, activeTab }) {
  const dispatch = useDispatch();
  const [mounted, setMounted] = useState(0);
  const [activePage, setPage] = useState(1);

  const { data, sellerCommentsLoading, sellerCommentsError } = useSelector(
    (state) => state.sellerComments
  );

  useEffect(() => {
    if (activeTab === "comments") setMounted((val) => val + 1);
  }, [activeTab]);

  useEffect(() => {
    if (id && activeTab === "comments" && mounted >= 1) {
      dispatch(getSellerComments(id));
    }
  }, [id, activeTab, mounted, dispatch]);

  const comments = useMemo(() => {
    return data?.comments ?? [];
  }, [data?.comments]);

  const approvedComments = useMemo(() => {
    return comments.filter(
      (c) => c.status === "approved" || c.status === "agreed"
    );
  }, [comments]);

  const totalPages = data?.total != null ? Math.max(1, Math.ceil(data.total / limit)) : 1;
  const paginatedComments = useMemo(() => {
    const start = (activePage - 1) * limit;
    return approvedComments.slice(start, start + limit);
  }, [approvedComments, activePage]);

  const ratingValue = useMemo(() => {
    const r = data?.rating;
    if (r == null) return 0;
    const n = typeof r === "string" ? parseFloat(r) : r;
    return Number.isFinite(n) ? n : 0;
  }, [data?.rating]);

  const count = data?.count ?? approvedComments.length;
  const total = data?.total ?? approvedComments.length;

  if (!id) return null;

  if (sellerCommentsError) {
    return (
      <Paper py="xl">
        <Center c="gray">
          <Text size="sm">{sellerCommentsError}</Text>
        </Center>
      </Paper>
    );
  }

  if (sellerCommentsLoading && comments.length === 0) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <Paper mb="lg" p="xl">
        <LoadingOverlay visible={sellerCommentsLoading} zIndex={1000} />
        <Flex w="100%" justify="space-between" align="baseline">
          <XTitle size="md">نقد و بررسی کاربران</XTitle>
          <Flex align="align">
            <Flex direction="column" align="end">
              <Rating size="md" mb="xs" value={ratingValue} readOnly />
              <Text c="gray" size="sm">
                بر اساس نظرات {count} کاربر
              </Text>
            </Flex>
            <Divider orientation="vertical" mx="md" />
            <Title size="35" c="gray.7">
              {ratingValue.toFixed(1)}
            </Title>
          </Flex>
        </Flex>
      </Paper>

      {paginatedComments.length > 0 ? (
        <>
          <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} my="xl">
            {paginatedComments.map((item, index) => (
              <SignleComment
                key={`${item.date}-${index}`}
                paper={true}
                name={item.name}
                date={item.date}
                rating={typeof item.rating === "string" ? parseFloat(item.rating) || 0 : item.rating}
                commentText={item.comment}
                status={item.status}
                seller={item.product?.title ?? ""}
                product={item.product}
              />
            ))}
          </SimpleGrid>
          <Pagination
            total={totalPages}
            mt="xl"
            value={activePage}
            onChange={setPage}
          />
        </>
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
    </div>
  );
}

export default Comments;
