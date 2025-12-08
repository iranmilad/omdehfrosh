import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useEffect } from 'react';
import { useCategoryRowSelection } from '../../CategoryRowSelectionContext';

// Default SVG image for categories when image is null or empty
const DEFAULT_CATEGORY_IMAGE = 'data:image/svg+xml;base64,' + btoa(`
<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle -->
  <circle cx="20" cy="20" r="20" fill="#F8F9FA"/>
  <!-- Category icon -->
  <rect x="10" y="10" width="20" height="20" rx="2" fill="#E9ECEF" stroke="#ADB5BD" stroke-width="1"/>
  <rect x="13" y="13" width="6" height="6" rx="1" fill="#9CA3AF"/>
  <rect x="21" y="13" width="6" height="6" rx="1" fill="#9CA3AF"/>
  <rect x="13" y="21" width="6" height="6" rx="1" fill="#9CA3AF"/>
  <rect x="21" y="21" width="6" height="6" rx="1" fill="#9CA3AF"/>
</svg>
`);

const SliderComponentCategoriesCMFastEdit = ({ 
  items, 
  clickType, 
  searchType, 
  tab, 
  filterCategoryStorage = [],
  setFilterCategoryStorage,
  filterCategorySubCategoryStorage,
  setFilterCategorySubCategoryStorage,
  filterCategorySubCategoryBrandsStorage,
  setFilterCategorySubCategoryBrandsStorage,
}) => {

  const { checkedRows } = useCategoryRowSelection();
  const isSlideSelectionActive = checkedRows.size > 0;

  // Early return with helpful message
  if (!items) {
    return <div>Loading categories...</div>;
  }

  if (!Array.isArray(items)) {
    return <div>Invalid data format</div>;
  }

  if (items.length === 0) {
    return <div>No categories available</div>;
  }

  const handleSelectAll = () => {
    if (clickType === "categories") {
      const allCategoryIds = items?.map(item => item.idCategory) || [];
      const allSelected = allCategoryIds.every(id => filterCategoryStorage.includes(id));
      
      if (allSelected) {
        // Clear all filters when deselecting all
        setFilterCategoryStorage([]);
        setFilterCategorySubCategoryStorage([]);
        setFilterCategorySubCategoryBrandsStorage([]);
      } else {
        // Select all categories and clear subcategory filters
        setFilterCategoryStorage(allCategoryIds);
        setFilterCategorySubCategoryStorage([]);
        setFilterCategorySubCategoryBrandsStorage([]);
      }
    }
  };

  const allCategoryIds = items?.map(item => item.idCategory) || [];
  const allSelected = allCategoryIds.length > 0 && allCategoryIds.every(id => filterCategoryStorage.includes(id));

  return (
    <Swiper 
      modules={[FreeMode]} 
      slidesPerView="auto" 
      spaceBetween={6}
      className="mt-2"
      style={{ width: "100%" }}
    >
      {/* Category items */}
      {items.map((item, index) => {
        return (
          <SwiperSlide 
            key={item.idCategory || index} 
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
        );
      })}

      {/* Select All Button */}
      <SwiperSlide style={{ width: "auto", display: "flex", margin: 0, padding: 0 }}>
        <button
          className={`flex h-[35px] px-3 gap-2 justify-center items-center border-2 
            ${allSelected ? "border-green-400 bg-green-50" : "border-none bg-gray-100"} 
            ${isSlideSelectionActive ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          style={{ borderRadius: '18px' }}
          onClick={() => {
            if (!isSlideSelectionActive) handleSelectAll();
          }}
          disabled={isSlideSelectionActive}
        >
          <span className="text-xs leading-none font-medium whitespace-nowrap">
            انتخاب همه
          </span>
        </button>
      </SwiperSlide>
    </Swiper>
  );
};

export function SingleCategoryGroupCM({ 
  parentItem, 
  searchType,
  clickType, 
  tab,
  filterCategoryStorage = [],
  setFilterCategoryStorage,
  filterCategorySubCategoryStorage,
  setFilterCategorySubCategoryStorage,
  filterCategorySubCategoryBrandsStorage,
  setFilterCategorySubCategoryBrandsStorage,
  isDisabled
}) {

  if (!parentItem) {
    return null;
  }

  const onClick = (item) => {
    if (isDisabled) return;

    if (clickType === "categories") {
      const isActive = filterCategoryStorage?.includes(item.idCategory) ?? false;

      if (isActive) {
        // Deselecting current category - clear all filters
        setFilterCategoryStorage([]);
        setFilterCategorySubCategoryStorage([]);
        setFilterCategorySubCategoryBrandsStorage([]);
      } else {
        // Selecting new category - set only this category and clear subcategory filters
        setFilterCategoryStorage([item.idCategory]);
        setFilterCategorySubCategoryStorage([]);
        setFilterCategorySubCategoryBrandsStorage([]);
      }
    }
  }

  // Helper function to get category image source with fallback
  const getCategoryImageSrc = (image) => {
    if (image && image.trim() !== '') {
      return image;
    }
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
        className={`flex flex-row justify-center items-center w-fit bg-gray-100 px-3 gap-2 h-[35px] overflow-hidden border-[1.5px]
          ${!isDisabled && isActive ? "border-gray-400" : "border-none"}
          ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        style={{ borderRadius: '18px' }}
        onClick={() => onClick(parentItem)}
      >
        <div className='w-[20px] h-[20px] bg-white rounded-full flex-shrink-0'>
          <img 
            className="w-full h-full object-cover" 
            src={getCategoryImageSrc(parentItem.image)} 
            alt={parentItem.title} 
            onError={handleImageError}
          />
        </div>
        <span className="cursor-pointer text-xs leading-none whitespace-nowrap">
          {parentItem.title}
        </span>
      </div>
    </div>
  );
}

export default SliderComponentCategoriesCMFastEdit