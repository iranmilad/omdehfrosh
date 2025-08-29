import { FreeMode, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useCategoryRowSelection } from '../../CategoryRowSelectionContext';

// Default SVG image for categories when image is null or empty
const DEFAULT_CATEGORY_IMAGE = 'data:image/svg+xml;base64,' + btoa(`
<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle -->
  <circle cx="20" cy="20" r="20" fill="#F3F4F6"/>
  <!-- Image icon -->
  <rect x="10" y="12" width="20" height="16" rx="2" fill="#E5E7EB" stroke="#9CA3AF" stroke-width="1"/>
  <!-- Mountain/landscape icon inside -->
  <path d="M12 24 L16 18 L20 22 L28 16 L28 26 L12 26 Z" fill="#D1D5DB"/>
  <!-- Sun/circle in corner -->
  <circle cx="16" cy="16" r="2" fill="#9CA3AF"/>
</svg>
`);

const SliderComponentCategoriesCM = ({ 
  items, 
  clickType, 
  searchType, 
  tab, 
  filterCategoryStorage,
  setFilterCategoryStorage,
  filterCategorySubCategoryStorage,
  setFilterCategorySubCategoryStorage,
  filterCategorySubCategoryBrandsStorage,
  setFilterCategorySubCategoryBrandsStorage,
}) => {

  const { checkedRows } = useCategoryRowSelection();
  
  // Disable when multiple filters checked
  const isSlideSelectionActive = checkedRows.size > 0;

  const handleSelectAll = () => {
    if (clickType === "categories") {
      const allCategoryIds = items?.map(item => item.idCategory) || [];
      const allSelected = allCategoryIds.every(id => filterCategoryStorage.includes(id));
      
      if (allSelected) {
        setFilterCategoryStorage([]); // Deselect all
      } else {
        setFilterCategoryStorage(allCategoryIds); // Select all
      }
    }
  };

  const allCategoryIds = items?.map(item => item.idCategory) || [];
  const allSelected = allCategoryIds.length > 0 && allCategoryIds.every(id => filterCategoryStorage.includes(id));

  return (
    <Swiper 
      modules={[FreeMode, Navigation]}       
      freeMode={true} 
      slidesPerView="auto" 
      spaceBetween={4}
      style={{ width: "100%" }}
    >
      {/* Category items */}
      {items?.map((item, index) => (
        <SwiperSlide 
          key={index} 
          style={{ width: "auto", display: "flex", margin: 0, padding: 0 }}
        >
          <SingleCategoryGroupCM 
            parentItem={item} 
            clickType={clickType}
            searchType={searchType}
            tab={tab}
            filterCategoryStorage={filterCategoryStorage}
            setFilterCategoryStorage={setFilterCategoryStorage}
            filterCategorySubCategoryStorage={filterCategorySubCategoryStorage}
            setFilterCategorySubCategoryStorage={setFilterCategorySubCategoryStorage}
            filterCategorySubCategoryBrandsStorage={filterCategorySubCategoryBrandsStorage}
            setFilterCategorySubCategoryBrandsStorage={setFilterCategorySubCategoryBrandsStorage}
            isDisabled={isSlideSelectionActive}
          />
        </SwiperSlide>
      ))}

      {/* Select All Button as last slide */}
      <SwiperSlide style={{ width: "auto", display: "flex", margin: 0, padding: 0 }}>
        {/* <div
          className={`flex flex-row justify-center items-center w-[85px] h-[35px] overflow-hidden
            ${allSelected ? "border-green-400 bg-green-50" : "border-gray-500 bg-gray-100"} 
            ${isSlideSelectionActive ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          style={{ borderRadius: '18px' }}
          onClick={() => {
            if (isSlideSelectionActive) return;
            handleSelectAll();
          }}
        >
          <span className="text-[8px] font-medium whitespace-nowrap text-center px-2">
            انتخاب همه
          </span>
        </div> */}
      </SwiperSlide>
    </Swiper>
  );
};

export function SingleCategoryGroupCM({
  parentItem,
  searchType,
  clickType,
  tab,
  filterCategoryStorage,
  setFilterCategoryStorage,
  filterCategorySubCategoryStorage,
  setFilterCategorySubCategoryStorage,
  filterCategorySubCategoryBrandsStorage,
  setFilterCategorySubCategoryBrandsStorage,
  isDisabled
}) {
  if (!parentItem || !Array.isArray(parentItem.subCategories)) return null;

  const onClick = () => {
    if (isDisabled) return;
    const isActive = filterCategoryStorage.includes(parentItem.idCategory);
    setFilterCategoryStorage(isActive ? [] : [parentItem.idCategory]);
  };

  // Helper function to get image source with fallback
  const getCategoryImageSrc = (image) => {
    // Check if image exists and is not empty
    if (image && image.trim() !== '') {
      return image;
    }
    // Return default placeholder
    return DEFAULT_CATEGORY_IMAGE;
  };

  // Handle image error by setting default placeholder
  const handleImageError = (e) => {
    e.target.src = DEFAULT_CATEGORY_IMAGE;
  };

  const isActive = filterCategoryStorage.includes(parentItem.idCategory);

  return (
    <div className="flex items-center justify-center">
      <div
        className={`flex flex-row justify-center items-center w-fit bg-gray-100 px-4 gap-2 h-[35px] overflow-hidden border-[1.5px]
          ${!isDisabled && isActive ? "border-red-600" : "border-none"}
          ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        style={{ borderRadius: '18px' }}
        onClick={onClick}
      >
        <img 
          className="w-full h-[25px] object-cover" 
          src={getCategoryImageSrc(parentItem.image)} 
          alt={parentItem.title} 
          onError={handleImageError}
        />
        <span className="cursor-pointer text-[8px] whitespace-nowrap ml-1">
          {parentItem.title}
        </span>
      </div>
    </div>
  );
}

export default SliderComponentCategoriesCM;