import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useBrandRowSelection } from '../../BrandRowSelectionContext';

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
  const isSlideSelectionActive = checkedRows.size > 0;

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

  return (
    <Swiper 
      modules={[FreeMode]} 
      slidesPerView="auto" 
      spaceBetween={6}            // ✅ Gap between boxes
      style={{ width: "100%" }}
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

      {/* Select All Button */}
      <SwiperSlide style={{ width: "auto", display: "flex", margin: 0, padding: 0 }}>
        <button
          className={`flex h-[35px] px-4 gap-2 justify-center items-center border-2 
            ${allSelected ? "border-green-400 bg-green-50" : "border-none bg-gray-100"} 
            ${isSlideSelectionActive ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          style={{ borderRadius: '18px' }}
          onClick={() => {
            if (!isSlideSelectionActive) handleSelectAll();
          }}
          disabled={isSlideSelectionActive}
        >
          <span className="text-[9px] font-medium whitespace-nowrap">
            انتخاب همه
          </span>
        </button>
      </SwiperSlide>

    </Swiper>
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
  isDisabled
}) {
  const isActive = filterBrandStorage.includes(item.idBrand);

  const onClick = () => {
    if (isDisabled) return;
    if (clickType === "brands") {
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

  // Helper function to get brand image source with fallback
  const getBrandImageSrc = (image) => {
    // Check if image exists and is not empty
    if (image && image.trim() !== '') {
      return image;
    }
    // Return default placeholder
    return DEFAULT_BRAND_IMAGE;
  };

  // Handle image error by setting default placeholder
  const handleImageError = (e) => {
    e.target.src = DEFAULT_BRAND_IMAGE;
  };

  return (
    <div className="flex flex-col">
      {!badge && !categories && (
        <div className="w-full">
          <div
            className={`flex flex-col items-center justify-center flex-shrink-0
              ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            onClick={onClick}
          >
            <div
              className={`flex w-fit h-[35px] px-4 gap-2 justify-center items-center overflow-hidden border-[1.5px] bg-gray-100
                ${!isDisabled && isActive ? "border-red-600" : "border-none"}`}
              style={{ borderRadius: '18px' }}
            >
              <div className='w-full h-[25px] bg-white rounded-full'>
                <img  
                  className="w-full h-full object-cover"
                  src={getBrandImageSrc(item.image)}
                  alt={item.title}
                  onError={handleImageError}
                />
              </div>
              <span className="text-center whitespace-nowrap text-[9px] w-full">
                {item.title}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SliderComponentBrands;