import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css'; // Import Swiper styles
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import XTitle from '../title';
import ProductBox from '../../components/productBox'
import { ActionIcon, Group } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import "./style.css"

function ProductCarousel(props) {
    const { title, items, style } = props;
    const sliderRef = useRef(null);

    // Handler functions for custom navigation
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

    return (
        <>
            <Group justify="space-between">
                <XTitle>{title}</XTitle>
                <Group>
                    <ActionIcon variant='light' color='gray' onClick={handlePrev}><IconChevronRight size={18} /></ActionIcon>
                    <ActionIcon variant='light' color='gray' onClick={handleNext}><IconChevronLeft size={18} /></ActionIcon>
                </Group>
            </Group>
            <Swiper
                    className="swiper-products-related"
                    spaceBetween={10}
                    style={style}
                    ref={sliderRef}
                    modules={[Navigation]} // Include Navigation module if needed
                    loop={true}
                    breakpoints={{
                        // Define breakpoints for different screen sizes
                        320: { slidesPerView: 1, spaceBetween: 10 },  // Mobile portrait
                        480: { slidesPerView: 2, spaceBetween: 10 }, // Mobile landscape
                        768: { slidesPerView: 3, spaceBetween: 10 }, // Tablet
                        1024: { slidesPerView: 4, spaceBetween: 10 }, // Small desktop
                        1200: { slidesPerView: 5, spaceBetween: 10 }, // Larger screens
                    }}
                >
                    {items.map((item, index) => (
                        <SwiperSlide key={index} style={{ height: 'auto' }}>
                            <ProductBox {...item} />
                        </SwiperSlide>
                    ))}
                </Swiper>
        </>
    );
}

export default ProductCarousel;
