import { useNavigate } from 'react-router';
import { useRef, useState } from 'react';
import { FreeMode, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useBrandRowSelection } from '../../BrandRowSelectionContext';
import SliderArrows from '../SliderArrows';

// Default SVG image for brands when image is null or empty
const DEFAULT_BRAND_IMAGE = 'data:image/svg+xml;base64,' + btoa(`
<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle -->
  <circle cx="20" cy="20" r="20" fill="#F8F9FA"/>
  <!-- Brand/tag icon -->
  <path d="M12 14 L22 14 C23.1 14 24 14.9 24 16 L24 24 C24 25.1 23.1 26 22 26 L12 26 C10.9 26 10 25.1 10 24 L10 16 C10 14.9 10.9 14 12 14 Z" fill="#E9ECEF" stroke="#ADB5BD" stroke-width="1"/>
  <!-- Star/brand symbol -->
  <path d="M17 18 L18 21 L21 21 L18.5 22.5 L19.5 25.5 L17 24 L14.5 25.5 L15.5 22.5 L13 21 L16 21 L17 18 Z" fill="#6C757D"/>
</svg>
`);

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
  const navigate = useNavigate();
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
        navigate('/fastorder/brand');
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

  const ROW_HEIGHT = 48;
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
        onSlideChange={(swiper) => {
          setSwiperState({ isBeginning: swiper.isBeginning, isEnd: swiper.isEnd });
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
            navigate={navigate}
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
  item, 
  clickType, 
  searchType, 
  filterBrandStorage, 
  setFilterBrandStorage,
  filterBrandsCategoryStorage,
  setFilterBrandsCategoryStorage,
  filterBrandsCategorySubCategoryStorage,
  setFilterBrandsCategorySubCategoryStorage,
  tab, 
  badge, 
  categories,
  isDisabled,
  navigate
}) {
  const isActive = filterBrandStorage.includes(item.idBrand);

  const onClick = (e) => {

    
    if (isDisabled) {
      return;
    }
    if (clickType === "brands") {
      // Set manual filter update flag to prevent URL sync from overriding during navigation
      sessionStorage.setItem('manualFilterUpdate', 'true');
      
      if (isActive) {
        // Deselecting current brand - clear all filters and go back to base
        setFilterBrandStorage([]);
        setFilterBrandsCategoryStorage([]);
        setFilterBrandsCategorySubCategoryStorage([]);
        navigate('/fastorder/brand');
      } else {
        // Selecting new brand - set only this brand, clear category filters, and update URL
        setFilterBrandStorage([item.idBrand]);
        setFilterBrandsCategoryStorage([]);
        setFilterBrandsCategorySubCategoryStorage([]);
        navigate(`/fastorder/brand/${item.name}`);
      }
      
      // Clear the flag after navigation has settled
      setTimeout(() => {
        sessionStorage.removeItem('manualFilterUpdate');
      }, 300);
    }
  };

  const getBrandImageSrc = (image) => {
    if (image && image.trim() !== '') {
      return image;
    }
    return DEFAULT_BRAND_IMAGE;
  };

  const handleImageError = (e) => {
    e.target.src = DEFAULT_BRAND_IMAGE;
  };

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
              paddingRight: '4px',
              backgroundColor: 'rgb(247, 247, 248)',
              borderRadius: '100px',
              border: !isDisabled && isActive 
                ? '0.666667px solid rgb(9, 54, 114)' 
                : '0.666667px solid rgb(250, 250, 250)',
              fontSize: '16px',
              fontWeight: !isDisabled && isActive ? 700 : 400,
              color: 'rgb(77, 80, 83)',
              gap: '8px',
              flexDirection: 'row'
            }}
            onClick={onClick}
          >
            <div
              className='rounded-full overflow-hidden flex-shrink-0'
              style={{
                width: '28px',
                height: '28px',
                lineHeight: 0,
                marginRight: 0
              }}
            >
              <img
                className="w-full inline-block"
                style={{ objectFit: 'cover', width: '28px', height: '28px', marginRight: 0 }}
                src={getBrandImageSrc(item.image)}
                alt={item.title}
                onError={handleImageError}
                width="28"
                height="28"
              />
            </div>
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