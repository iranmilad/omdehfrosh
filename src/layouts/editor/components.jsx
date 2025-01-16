import { Box, Button, Flex, Grid, SimpleGrid, Text } from "@mantine/core";
import { useEditor } from "@craftjs/core";
import "../../elementor-icons.css";
import WideCarousel from "../../components/wideSlider";
import Categories from '../../components/categories';
import GridBanner from '../../components/gridBanner';
import {EditorText} from "../../components/editor/text";
import { EditorImage } from "../../components/editor/image";
import HeroSection from "../../components/heroSection";



const elements = [
    {
      icon: "eicon-text",
      label: "متن",
      element: <EditorText />,
    },
    {
      icon: "eicon-image",
      label: "تصویر",
      element: <EditorImage />,
    },
    {
      icon: "eicon-container",
      label: "کانتینر",
      element: <GridBanner />,
    },
    // {
    //   icon: "eicon-gallery-justified",
    //   label: "دسته بندی ها",
    //   element: <Categories />,
    // },
    // {
    //   icon: "eicon-slider-3d",
    //   label: "اسلایدر عریض",
    //   element: <WideCarousel />,
    // },
    // {
    //   icon: "eicon-slider-push",
    //   label: "اسلایدر پیشنهاد منتخب",
    //   element: <WideCarousel />,
    // },
    // {
    //   icon: "eicon-gallery-grid",
    //   label: "بنر 4 ستونی",
    //   element: <GridBanner />,
    // },
    // {
    //   icon: "eicon-posts-grid",
    //   label: "محصولات منتخب",
    //   element: <GridBanner />,
    // },
    // {
    //   icon: "eicon-nested-carousel",
    //   label: "برند های محبوب",
    //   element: <GridBanner />,
    // },
    // {
    //   icon: "eicon-carousel",
    //   label: "اسلایدر باکس محصول",
    //   element: <GridBanner />,
    // },
    {
      icon: "eicon-single-post",
      label: "هیرو باکس",
      element: <HeroSection />,
    },
  ];

function Components() {
    const { connectors } = useEditor();
  return (
  <SimpleGrid cols={2}>
    {elements.map((item, index) => (
      <Box key={index} style={{ textAlign: 'center'}} ref={(ref) => connectors.create(ref, item.element)}>
        <Button
          h={70}
          variant="light"
          color=""
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          fullWidth
        >
          <i className={item.icon} style={{ fontSize: '35px' }}></i>
        </Button>
        <Text mt="sm" ta="center" size="xs" fw={600} style={{ whiteSpace: 'break-spaces' }}>
          {item.label}
        </Text>
      </Box>
    ))}
  </SimpleGrid>
  );
}

export default Components;
