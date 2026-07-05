import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css'; // Import Swiper styles
import { Navigation } from 'swiper/modules';
import ProductBox from '../../components/productBox'
import { ActionIcon, Group, Box, Text, Center } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconPackage } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import "./style.css"

function ProductCarousel(props) {

    const { title, items = [], style } = props;
    const isMobile = useMediaQuery('(max-width: 576px)', true);
    const sliderRef = useRef(null);

    const handlePrev = () => {
        if (sliderRef.current && sliderRef.current.swiper) {
            sliderRef.current.swiper.slidePrev();
        }
    };

    const handleNext = () => {
        if (sliderRef.current && sliderRef.current.swiper) {
            sliderRef.current.swiper.slideNext();
        }
    };

    // Early return for empty or invalid items
    if (!items || items.length === 0) {
        return (
            <Box>
                {title?.trim() && (
                <Group justify="space-between" mb="md">
                    <Text 
                        size="md" 
                        fw="600"
                        style={{ color: 'rgb(9, 54, 114)' }}
                    >
                        {title}
                    </Text>
                </Group>
                )}
                <Box
                    p="xl"
                    style={{
                        background: "linear-gradient(135deg, #A5D6A7 0%, #81C784 100%)",
                        borderRadius: "var(--mantine-radius-lg)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        position: "relative",
                        overflow: "hidden",
                        minHeight: "200px",
                    }}
                >
                    {/* Subtle pattern overlay */}
                    <Box
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Ccircle cx='5' cy='5' r='2'/%3E%3Ccircle cx='15' cy='15' r='2'/%3E%3Ccircle cx='25' cy='25' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
                            opacity: 0.6
                        }}
                    />
                    
                    <Center h="100%" style={{ flexDirection: 'column', gap: 'var(--mantine-spacing-md)' }}>
                        <IconPackage 
                            size={48} 
                            color="rgba(255, 255, 255, 0.8)" 
                            style={{ zIndex: 2 }} 
                        />
                        <Box ta="center" style={{ zIndex: 2 }}>
                            <Text 
                                c="white" 
                                fw={600} 
                                size="lg" 
                                mb="xs"
                                style={{ 
                                    textShadow: "0 1px 3px rgba(0,0,0,0.3)",
                                }}
                            >
                                هیچ محصولی یافت نشد
                            </Text>
                            <Text 
                                c="rgba(255, 255, 255, 0.9)" 
                                fw={400} 
                                size="sm"
                                style={{ 
                                    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                                }}
                            >
                                در حال حاضر محصولی در این بخش موجود نیست
                            </Text>
                        </Box>
                    </Center>
                </Box>
            </Box>
        );
    }

    // Determine if navigation should be shown (only if more than slidesPerView items)
    const showNavigation = items.length > 1;
    const hasTitle = Boolean(title?.trim());

    return (
        <Box>
            {(hasTitle || (showNavigation && !isMobile)) && (
            <Group justify={hasTitle ? "space-between" : "flex-end"} mb="md">
                {hasTitle && (
                    <Text 
                        size="md" 
                        fw="600"
                        style={{ color: 'rgb(9, 54, 114)' }}
                    >
                        {title}
                    </Text>
                )}
                {showNavigation && !isMobile && (
                    <Group>
                        <ActionIcon 
                            variant='light' 
                            color='gray' 
                            onClick={handlePrev}
                            style={{
                                transition: 'all 0.2s ease',
                            }}
                            styles={{
                                root: {
                                    '&:hover': {
                                        transform: 'translateX(-2px)',
                                        backgroundColor: 'var(--mantine-color-gray-1)',
                                    }
                                }
                            }}
                        >
                            <IconChevronRight size={18} />
                        </ActionIcon>
                        <ActionIcon 
                            variant='light' 
                            color='gray' 
                            onClick={handleNext}
                            style={{
                                transition: 'all 0.2s ease',
                            }}
                            styles={{
                                root: {
                                    '&:hover': {
                                        transform: 'translateX(2px)',
                                        backgroundColor: 'var(--mantine-color-gray-1)',
                                    }
                                }
                            }}
                        >
                            <IconChevronLeft size={18} />
                        </ActionIcon>
                    </Group>
                )}
            </Group>
            )}image.pngimage.pngno
            <Swiper
                className="swiper-products-related"
                spaceBetween={6}
                style={style}
                ref={sliderRef}
                modules={[Navigation]}
                loop={false}
                slidesPerView={2.5}
                breakpoints={{
                    577: {
                        slidesPerView: "auto",
                        spaceBetween: 6,
                    },
                }}
            >
            {items.map((item, index) => (
            <SwiperSlide
                key={index}
                className="product-carousel-slide"
                style={{ height: "auto", display: "flex" }}
            >
                <ProductBox 
                {...item}
                compact
                dense={isMobile}
                defaultSellerId={item.sellerId || item.seller?.id}
                defaultCombinationId={item.combinationId || item.combinations?.[0]?.id}
                attributes={item.attributes}
            />
            </SwiperSlide>
            ))}
            </Swiper>
        </Box>
    );
}

export default ProductCarousel;