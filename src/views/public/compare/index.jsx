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
} from "@mantine/core";
import React, { useEffect, useState } from "react";
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

function Compare() {

  const {category} = useParams()

  const compareItems = useSelector((state) => state.compare.items);
  const compare = compareItems.find((c) => c.category === category)?.items || [];
  
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

  useEffect(() => {
    if (compare.length > 0) {
      dispatch(getCompareListData({ itemIds: compare }));
    } else {
      dispatch(clearCompareList({ category }));
      dispatch(clearCompareListState())
    }
  }, [dispatch, compare.length]);

  if (loadingCompareList) {
    return (
      <DelayedFullScreenLoader showR={true} />
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
                      <Text size="sm" component={NavLink} to={`/product/${item.id || "#"}`}>
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
                  {compareListData.map((item, index) => {
                    const imageUrl = getValidImageUrl(item.general.images);
                    
                    return (
                      <Table.Td key={index}>
                        <Anchor
                          underline="never"
                          component={NavLink}
                          to={`/product/${item.id || "#"}`}
                        >
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              w={200}
                              h={200}
                              fit="contain"
                              fallbackSrc="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8IS0tIEJhY2tncm91bmQgLS0+CiAgPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmOGY5ZmEiIHN0cm9rZT0iI2RlZTJlNiIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgCiAgPCEtLSBNb3VudGFpbiBzaWxob3VldHRlIC0tPgogIDxwYXRoIGQ9Ik0wIDE0MCBMNDAGMTAWIEL4MCKXAXL4TDEYMUMKWHMCSMWMMEWEMKCXMXKMAKXMDAGMTXYMJMMMJBMMSB6IiAKICAgICAgICBmaWxsPSIjZTllY2VmIiBvcGFjaXR5PSIwLjYiLz4KICA8IS0tIFN1bi9Nb29uIGNpcmNsZSAtLT4KICA8Y2lyY2xlIGN4PSIxNTAiIGN5PSI2MCIgcj0iMjAiIGZpbGw9IiNmZmQ0M2IiIG9wYWNpdHk9IjAuNyIvPgogIAogIDwhLS0gQ2FtZXJhIGljb24gaW4gY2VudGVyIC0tPgogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwMCwgMTAwKSI+CiAgICA8IS0tIENhbWVyYSBib2R5IC0tPgogICAgPHJlY3QgeD0iLTI1IiB5PSItMTUiIHdpZHRoPSI1MCIgaGVpZ2h0PSIzMCIgcng9IjQiIGZpbGw9IiM4NjhlOTYiLz4KICAgICAgPCEtLSBDYW1lcmEgbGVucyAtLT4KICAgIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIxMiIgZmlsbD0iIzQ5NTA1NyIvPgogICAgPGNpcmNsZSBjeD0iMCIgY3k9IjAiIHI9IjgiIGZpbGw9IiM2Yzc1N2QiLz4KICAgIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSI0IiBmaWxsPSIjODY4ZTk2Ii8+CiAgICA8IS0tIENhbWVyYSBmbGFzaCAtLT4KICAgIDxyZWN0IHg9Ii0yMCIgeT0iLTEyIiB3aWR0aD0iOCIgaGVpZ2h0PSI2IiByeD0iMiIgZmlsbD0iI2FkYjViZCIvPgogICAgPCEtLSBDYW1lcmEgdmlld2ZpbmRlciAtLT4KICAgIDxyZWN0IHg9IjE1IiB5PSItMTgiIHdpZHRoPSI4IiBoZWlnaHQ9IjQiIHJ4PSIxIiBmaWxsPSIjNDk1MDU3Ii8+CiAgPC9nPgogIDwhLS0gT3B0aW9uYWwgdGV4dCAtLT4KICA8dGV4dCB4PSIxMDAiIHk9IjE3MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNmM3NTdkIiBvcGFjaXR5PSIwLjgiPiq2o9i12YjbjNixINmF2YjYrNmI2K8g2YbbjNiz2Ko8L3RleHQ+Cjwvc3ZnPg=="
                              onError={(e) => {
                                // Additional fallback - create SVG as data URI if even the base64 fails
                                e.target.src = "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='200' height='200' fill='%23f8f9fa' stroke='%23dee2e6' stroke-width='2'/%3E%3Cpath d='M0 140 L40 100 L80 120 L120 80 L160 100 L200 60 L200 200 L0 200 Z' fill='%23e9ecef' opacity='0.6'/%3E%3Ccircle cx='150' cy='60' r='20' fill='%23ffd43b' opacity='0.7'/%3E%3Cg transform='translate(100, 100)'%3E%3Crect x='-25' y='-15' width='50' height='30' rx='4' fill='%23868e96'/%3E%3Ccircle cx='0' cy='0' r='12' fill='%23495057'/%3E%3Ccircle cx='0' cy='0' r='8' fill='%236c757d'/%3E%3Ccircle cx='0' cy='0' r='4' fill='%23868e96'/%3E%3Crect x='-20' y='-12' width='8' height='6' rx='2' fill='%23adb5bd'/%3E%3Crect x='15' y='-18' width='8' height='4' rx='1' fill='%23495057'/%3E%3C/g%3E%3Ctext x='100' y='170' text-anchor='middle' font-family='Arial, sans-serif' font-size='12' fill='%236c757d' opacity='0.8'%3Eتصویر موجود نیست%3C/text%3E%3C/svg%3E";
                              }}
                              alt={item.general.title || "تصویر محصول"}
                            />
                          ) : (
                            // Show custom SVG placeholder when no valid image is available
                            <div style={{ 
                              width: 200, 
                              height: 200, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              backgroundColor: '#f8f9fa',
                              border: '2px solid #dee2e6',
                              borderRadius: '4px'
                            }}>
                              <svg 
                                width="200" 
                                height="200" 
                                viewBox="0 0 200 200" 
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <rect width="200" height="200" fill="#f8f9fa" stroke="#dee2e6" strokeWidth="2"/>
                                <path d="M0 140 L40 100 L80 120 L120 80 L160 100 L200 60 L200 200 L0 200 Z" 
                                      fill="#e9ecef" opacity="0.6"/>
                                <circle cx="150" cy="60" r="20" fill="#ffd43b" opacity="0.7"/>
                                <g transform="translate(100, 100)">
                                  <rect x="-25" y="-15" width="50" height="30" rx="4" fill="#868e96"/>
                                  <circle cx="0" cy="0" r="12" fill="#495057"/>
                                  <circle cx="0" cy="0" r="8" fill="#6c757d"/>
                                  <circle cx="0" cy="0" r="4" fill="#868e96"/>
                                  <rect x="-20" y="-12" width="8" height="6" rx="2" fill="#adb5bd"/>
                                  <rect x="15" y="-18" width="8" height="4" rx="1" fill="#495057"/>
                                </g>
                                <text x="100" y="170" textAnchor="middle" fontFamily="Arial, sans-serif" 
                                      fontSize="12" fill="#6c757d" opacity="0.8">
                                  تصویر موجود نیست
                                </text>
                              </svg>
                            </div>
                          )}
                        </Anchor>
                      </Table.Td>
                    );
                  })}
                </Table.Tr>

                {/* Supplier(s) */}
                <Table.Tr>
                  <Table.Td>فروشنده‌ها</Table.Td>
                  {compareListData.map((item, index) => {
                    const allSuppliers = item.combinations
                      ?.flatMap((combo) => combo.suppliers || [])
                      ?.filter((s, idx, self) => idx === self.findIndex(t => t.id === s.id)); // dedupe by id

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
                      ?.filter((s, idx, self) => idx === self.findIndex(t => t.id === s.id));

                    return (
                      <Table.Td key={index}>
                        {allSuppliers?.length ? (
                          allSuppliers.map((s, idx) => {
                            const prices = s.price;
                            return (
                              <Flex direction="column" gap={4} key={idx}>
                                <Text size="xs" c="red">{s.name}</Text>
                                {prices ? (
                                  prices.discountedPrice && prices.discountedPrice < prices.regularPrice ? (
                                    <Flex gap="xs" wrap="wrap">
                                      <Text size="sm" c="gray" style={{ textDecoration: "line-through" }}>
                                        <NumberFormatter thousandSeparator value={prices.regularPrice} />
                                      </Text>
                                      <Text size="sm">
                                        <NumberFormatter thousandSeparator value={prices.discountedPrice} /> تومان
                                      </Text>
                                    </Flex>
                                  ) : (
                                    <Text size="sm">
                                      <NumberFormatter thousandSeparator value={prices.regularPrice} /> تومان
                                    </Text>
                                  )
                                ) : (
                                  <Text size="sm" c="dimmed">قیمت ناموجود</Text>
                                )}
                              </Flex>
                            );
                          })
                        ) : (
                          <Text size="sm" c="dimmed">ندارد</Text>
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