import { FreeMode, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useBrandRowSelection } from '../../BrandRowSelectionContext';

// Default SVG image for brands when image is null or empty
const DEFAULT_BRAND_IMAGE = 'data:image/svg+xml;base64,' + btoa(`
<svg width="25" height="25" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle -->
  <circle cx="20" cy="20" r="19" fill="#F8F9FA" stroke="#E9ECEF" stroke-width="1"/>
  <!-- Brand/star icon -->
  <path d="M20 8 L22 14 L28 14 L23.5 18 L25.5 24 L20 21 L14.5 24 L16.5 18 L12 14 L18 14 L20 8 Z" fill="#9CA3AF"/>
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
      modules={[FreeMode, Navigation]} 
      slidesPerView="auto" 
      spaceBetween={6}            // ✅ Gap between boxes
      className="mt-2"            // Add margin top for spacing
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
          className={`flex h-[35px] px-4 gap-2 justify-center items-center border-[1.5px] 
            ${allSelected ? "border-green-400 bg-green-50" : "border-transparent bg-gray-100"} 
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

  const isActive = filterBrandStorage.includes(item.idBrand);

  return (
    <div className="flex flex-col">
      {!badge && !categories && (
        <div className="w-full">
          <div
            className={`flex flex-col items-center justify-center flex-shrink-0
              ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            onClick={() => onClick(item)}
          >
            <div
              className={`flex h-[35px] px-3 gap-2 justify-center items-center overflow-hidden border-[1.5px] bg-gray-100 flex-shrink-0
                ${!isDisabled && isActive ? "border-red-600" : "border-transparent"}`}
              style={{ 
                borderRadius: '18px',
                minWidth: 'fit-content',
                maxWidth: '120px'
              }}
            >
              <div className='w-[25px] h-[25px] bg-white rounded-full flex-shrink-0'>
                <img  
                  className="w-[25px] h-[25px] object-cover rounded-full"
                  src={getBrandImageSrc(item.image)}
                  alt={item.title}
                  onError={handleImageError}
                />
              </div>
              <span className="text-center whitespace-nowrap text-[9px] flex-shrink-0 truncate max-w-[70px]">
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