import { useRef, useState } from 'react';
import { FreeMode, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useBrandRowSelection } from '../../BrandRowSelectionContext';
import SliderArrows from '../SliderArrows';
import SliderPillImage from '../../../fast-order/slidercomponents/SliderPillImage';
import { useSliderPillFontSize } from '../../../fast-order/slidercomponents/useSliderPillFontSize';

const SliderComponentBrands = ({ 
  items, 
  clickType, 
  searchType, 
  tab, 
  filterBrandStorage, 
  setFilterBrandStorage,
  filterBrandsCategoryStorage,
  setFilterBrandsCategoryStorage,
  filterBrandsCategorySubCategoryStorage,
  setFilterBrandsCategorySubCategoryStorage,
}) => {

  const { checkedRows } = useBrandRowSelection();
  const isSlideSelectionActive = checkedRows.size > 0;
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [swiperState, setSwiperState] = useState({ isBeginning: true, isEnd: true });

  const handleSelectAll = () => {
    if (clickType === "brands") {
      const allBrandIds = items?.map(item => item.idBrand) || [];
      const allSelected = allBrandIds.every(id => filterBrandStorage.includes(id));
      
      if (allSelected) {
        // Clear all filters when deselecting all
        setFilterBrandStorage([]);
        setFilterBrandsCategoryStorage([]);
        setFilterBrandsCategorySubCategoryStorage([]);
      } else {
        // Select all brands and clear category filters
        setFilterBrandStorage(allBrandIds);
        setFilterBrandsCategoryStorage([]);
        setFilterBrandsCategorySubCategoryStorage([]);
      }
    }
  };

  const allBrandIds = items?.map(item => item.idBrand) || [];
  const allSelected = allBrandIds.length > 0 && allBrandIds.every(id => filterBrandStorage.includes(id));

  const ROW_HEIGHT = 48; // match item pill height (40px + 8px padding) so arrows align with row
  return (
    <div style={{ position: 'relative', width: '100%', minHeight: ROW_HEIGHT, display: 'flex', alignItems: 'center' }}>
      <div style={{ flex: 1, minWidth: 0, height: ROW_HEIGHT, display: 'flex', alignItems: 'center' }}>
      <Swiper
        modules={[FreeMode, Navigation]}
        slidesPerView="auto"
        spaceBetween={8}
        className="!mt-0"
        style={{ width: "100%" }}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        onSwiper={(swiper) => {
          setSwiperState({ isBeginning: swiper.isBeginning, isEnd: swiper.isEnd });
        }}
        onProgress={(swiper) => {
          setSwiperState({ isBeginning: swiper.isBeginning, isEnd: swiper.isEnd });
        }}
        onReachBeginning={() => {
          setSwiperState(prev => ({ ...prev, isBeginning: true }));
        }}
        onReachEnd={() => {
          setSwiperState(prev => ({ ...prev, isEnd: true }));
        }}
      >
      {/* Brand items */}
      {items?.map((item) => (
        <SwiperSlide 
          key={item.idBrand} 
          style={{ width: "auto", display: "flex", margin: 0, padding: 0 }}
        >
          <SingleCategory1
            item={item}
            clickType={clickType}
            searchType={searchType}
            tab={tab}
            filterBrandStorage={filterBrandStorage}
            setFilterBrandStorage={setFilterBrandStorage}
            filterBrandsCategoryStorage={filterBrandsCategoryStorage}
            setFilterBrandsCategoryStorage={setFilterBrandsCategoryStorage}
            filterBrandsCategorySubCategoryStorage={filterBrandsCategorySubCategoryStorage}
            setFilterBrandsCategorySubCategoryStorage={setFilterBrandsCategorySubCategoryStorage}
            isDisabled={isSlideSelectionActive} 
          />
        </SwiperSlide>
      ))}

      </Swiper>
      </div>
      {items && items.length > 0 && <SliderArrows prevRef={prevRef} nextRef={nextRef} isBeginning={swiperState.isBeginning} isEnd={swiperState.isEnd} />}
    </div>
  );
};

export function SingleCategory1({ 
  size = "md", 
  image, 
  title, 
  searchType, 
  filterBrandStorage, 
  setFilterBrandStorage,
  filterBrandsCategoryStorage,
  setFilterBrandsCategoryStorage,
  filterBrandsCategorySubCategoryStorage,
  setFilterBrandsCategorySubCategoryStorage,
  tab, 
  item, 
  idBrand, 
  badge, 
  clickType, 
  active, 
  categories, 
  items,
  isDisabled
}) {
  const pillFontSize = useSliderPillFontSize();

  const onClick = (item) => {
    if (isDisabled) return;
    if (clickType === "brands") {
      const isActive = filterBrandStorage.includes(item.idBrand);

      if (isActive) {
        // Deselecting current brand - clear all filters
        setFilterBrandStorage([]);
        setFilterBrandsCategoryStorage([]);
        setFilterBrandsCategorySubCategoryStorage([]);
      } else {
        // Selecting new brand - set only this brand and clear category filters
        setFilterBrandStorage([item.idBrand]);
        setFilterBrandsCategoryStorage([]);
        setFilterBrandsCategorySubCategoryStorage([]);
      }
    }
  };

  const isActive = filterBrandStorage.includes(item.idBrand);

  return (
    <div className="flex flex-col">
      {!badge && !categories && (
        <div className="w-full">
          <div
            className={`flex items-center justify-center whitespace-nowrap
              ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            style={{
              height: '40px',
              paddingTop: '4px',
              paddingBottom: '4px',
              paddingLeft: '8px',
              paddingRight: '8px',
              backgroundColor: 'rgb(247, 247, 248)',
              borderRadius: '100px',
              border: !isDisabled && isActive 
                ? '0.666667px solid rgb(9, 54, 114)' 
                : '0.666667px solid rgb(250, 250, 250)',
              fontSize: pillFontSize,
              fontWeight: !isDisabled && isActive ? 700 : 400,
              color: 'rgb(77, 80, 83)',
              gap: '8px',
              flexDirection: 'row'
            }}
            onClick={() => onClick(item)}
          >
            <SliderPillImage image={item.image} alt={item.title} />
            <span className="leading-none">
              {item.title}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default SliderComponentBrands;