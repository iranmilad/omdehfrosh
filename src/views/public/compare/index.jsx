import {
  Anchor,
  Button,
  Center,
  Flex,
  Image,
  Loader,
  Modal,
  NumberFormatter,
  Paper,
  Rating,
  ScrollArea,
  Table,
  Text,
  Title,
  Box,
} from "@mantine/core";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { NavLink, useParams } from "react-router";
import XTitle from "../../../components/title";

import InfoBox from "../../../components/InfoBox";
import { useDispatch, useSelector } from "react-redux";
import Category from "../../../components/category";
import CategoryCompare from "../../../components/categorycompare";
import { addToCompare, removeFromCompare, clearCompareList } from "../../../redux/compare/compare";
import { notifications } from "@mantine/notifications";
import { getCompareListData } from "../../../redux/compare/getcomparelist/getCompareListActions";

import DelayedFullScreenLoader from "../../../components/centerloading";
import { clearCompareListState } from "../../../redux/compare/getcomparelist/getCompareListSlice";
import ImageIcon from "../../../resources/defaultImageIcon";

// Component to handle product image with fallback
const ProductImageCell = ({ item, getValidImageUrl }) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getValidImageUrl(item.general.images);

  // Reset error when image URL changes
  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  return (
    <Anchor
      underline="never"
      component={NavLink}
      to={`/product/${item.id || "#"}`}
    >
      {imageUrl && !imageError ? (
        <Image
          src={imageUrl}
          w={200}
          h={200}
          fit="contain"
          onError={() => {
            setImageError(true);
          }}
          alt={item.general.title || "تصویر محصول"}
        />
      ) : (
        <Box
          w={200}
          h={200}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8f9fa',
            border: '2px solid #dee2e6',
            borderRadius: '4px'
          }}
        >
          <ImageIcon size={64} color="#6B7280" />
        </Box>
      )}
    </Anchor>
  );
};

function Compare() {

  const {category} = useParams()

  const compareItems = useSelector((state) => state.compare.items);
  // Memoize compare array to prevent infinite loops
  const compare = useMemo(() => {
    return compareItems.find((c) => c.category === category)?.items || [];
  }, [compareItems, category]);
  
  const maxCompareLimit = 4; // Maximum items allowed in compare list
 
  const [opened, setOpened] = useState(false);
  const dispatch = useDispatch();

  // Helper function to get valid image URL
  const getValidImageUrl = (images) => {
    // Handle null, undefined, or empty cases
    if (!images) return null;
    
    // Handle string case
    if (typeof images === 'string') {
      return images.trim() === '' ? null : images;
    }
    
    // Handle array case
    if (Array.isArray(images)) {
      // Filter out empty strings, null, undefined values
      const validImages = images.filter(img => 
        img && 
        typeof img === 'string' && 
        img.trim() !== ''
      );
      
      return validImages.length > 0 ? validImages[0] : null;
    }
    
    return null;
  };

  const handleAddProduct = (id) => {
    setOpened(false); // close modal after selection

    const isInCompare = compare.includes(id);
  
    if (isInCompare) {
      dispatch(removeFromCompare({ category, id }));
      notifications.show({
        color: "red",
        message: "محصول از مقایسه حذف شد",
        position: "bottom-left",
      });
    } else {
      if (compare.length >= 4) {
        notifications.show({
          color: "yellow",
          message: "حداکثر ۴ محصول را می‌توانید مقایسه کنید",
          position: "bottom-left",
        });
        return;
      }
      if (compare.length >= maxCompareLimit) {
        notifications.show({
          title: 'حداکثر تعداد انتخاب‌ها',
          message: 'شما فقط می‌توانید 4 محصول را برای مقایسه انتخاب کنید.',
          color: 'red',
        });
        return; // Prevent adding more than 4 items
      }

      dispatch(addToCompare({ category, id }));
  
      // Show notification
      notifications.show({
        message: "محصول به مقایسه اضافه شد",
        position: "bottom-left",
      });
    }
  };

  const {
    compareListData,
    loadingCompareList,
    errorCompareList
  } = useSelector((state) => state.getCompareList)

  // Log products to see image field structure
  useEffect(() => {
    if (compareListData && compareListData.length > 0) {
      compareListData.forEach((item, index) => {});
    }
  }, [compareListData]);

  // Create a stable string representation of compare IDs for dependency checking
  const compareIdsString = useMemo(() => {
    return compare.length > 0 ? JSON.stringify([...compare].sort()) : "";
  }, [compare]);

  useEffect(() => {
    if (!category) {
      return;
    }

    if (compare.length > 0) {
      dispatch(getCompareListData(compare));
    } else {
      dispatch(clearCompareListState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, compareIdsString, category]);

  // Show error if API call failed
  useEffect(() => {
    if (errorCompareList) {
      notifications.show({
        title: "خطا",
        message: errorCompareList || "خطا در دریافت اطلاعات مقایسه",
        color: "red",
        position: "top-right",
      });
    }
  }, [errorCompareList]);

  if (loadingCompareList) {
    return <DelayedFullScreenLoader showR={true} />;
  }

  // Show error message if there's an error
  if (errorCompareList) {
    return (
      <InfoBox mt="lg" shadow="0" bg="transparent" back={false}>
        خطا در دریافت اطلاعات مقایسه: {errorCompareList}
      </InfoBox>
    );
  }

  return (
    <>
      <Flex justify="center" mb="lg" mt="lg">
        <Button size="lg" onClick={() => setOpened(true)}>
          افزودن یا حذف محصول
        </Button>
      </Flex>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        fullScreen
        removeScrollProps={{ removeScrollBar: false }}
        title="افزودن محصول جدید"
      >
        <CategoryCompare
          enabled={opened}
          slug={`${category}`}
          url={`/category/${category}`}
          onSelectProduct={handleAddProduct}
        />
      </Modal>

      <XTitle>مقایسه محصولات</XTitle>

      {compareListData?.length ? (
        <Paper mt="xl" px="xl">
          <ScrollArea type="auto">
            <Table striped withRowBorders={false} verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th miw={150}>ویژگی‌ها</Table.Th>
                  {compareListData.map((item, index) => (
                    <Table.Th key={index} miw={200} maw={200}>
                      <Text
                        size="sm"
                        component={NavLink}
                        to={`/product/${item.id || "#"}`}
                      >
                        {item.general.title}
                      </Text>
                    </Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {/* Image - IMPROVED HANDLING */}
                <Table.Tr>
                  <Table.Td>تصویر</Table.Td>
                  {compareListData.map((item, index) => (
                    <Table.Td key={index}>
                      <ProductImageCell
                        item={item}
                        getValidImageUrl={getValidImageUrl}
                      />
                    </Table.Td>
                  ))}
                </Table.Tr>

                {/* Supplier(s) */}
                <Table.Tr>
                  <Table.Td>فروشنده‌ها</Table.Td>
                  {compareListData.map((item, index) => {
                    const allSuppliers = item.combinations
                      ?.flatMap((combo) => combo.suppliers || [])
                      ?.filter(
                        (s, idx, self) =>
                          idx === self.findIndex((t) => t.id === s.id)
                      ); // dedupe by id

                    return (
                      <Table.Td key={index}>
                        {allSuppliers?.length ? (
                          allSuppliers.map((s, idx) => (
                            <Text key={idx} size="sm">
                              {s.name}
                            </Text>
                          ))
                        ) : (
                          <Text size="sm" c="dimmed">
                            ندارد
                          </Text>
                        )}
                      </Table.Td>
                    );
                  })}
                </Table.Tr>

                {/* Price(s) */}
                <Table.Tr>
                  <Table.Td>قیمت</Table.Td>
                  {compareListData.map((item, index) => {
                    const allSuppliers = item.combinations
                      ?.flatMap((combo) => combo.suppliers || [])
                      ?.filter(
                        (s, idx, self) =>
                          idx === self.findIndex((t) => t.id === s.id)
                      );

                    return (
                      <Table.Td key={index}>
                        {allSuppliers?.length ? (
                          allSuppliers.map((s, idx) => {
                            const prices = s.price;
                            return (
                              <Flex direction="column" gap={4} key={idx}>
                                <Text size="xs" c="red">
                                  {s.name}
                                </Text>
                                {prices ? (
                                  prices.discountedPrice &&
                                  prices.discountedPrice <
                                    prices.regularPrice ? (
                                    <Flex gap="xs" wrap="wrap">
                                      <Text
                                        size="sm"
                                        c="gray"
                                        style={{
                                          textDecoration: "line-through",
                                        }}
                                      >
                                        <NumberFormatter
                                          thousandSeparator
                                          value={prices.regularPrice}
                                        />
                                      </Text>
                                      <Text size="sm">
                                        <NumberFormatter
                                          thousandSeparator
                                          value={prices.discountedPrice}
                                        />{" "}
                                        تومان
                                      </Text>
                                    </Flex>
                                  ) : (
                                    <Text size="sm">
                                      <NumberFormatter
                                        thousandSeparator
                                        value={prices.regularPrice}
                                      />{" "}
                                      تومان
                                    </Text>
                                  )
                                ) : (
                                  <Text size="sm" c="dimmed">
                                    قیمت ناموجود
                                  </Text>
                                )}
                              </Flex>
                            );
                          })
                        ) : (
                          <Text size="sm" c="dimmed">
                            ندارد
                          </Text>
                        )}
                      </Table.Td>
                    );
                  })}
                </Table.Tr>

                {/* View product */}
                <Table.Tr>
                  <Table.Td>مشاهده محصول</Table.Td>
                  {compareListData.map((item, index) => (
                    <Table.Td key={index}>
                      <Button
                        radius={999}
                        component={NavLink}
                        to={`/product/${item.id || "#"}`}
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