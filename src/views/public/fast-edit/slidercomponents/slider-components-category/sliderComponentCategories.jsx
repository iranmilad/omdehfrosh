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
      spaceBetween={8}
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
          className={`flex items-center justify-center whitespace-nowrap
            ${isSlideSelectionActive ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          style={{
            height: '40px',
            paddingTop: '4px',
            paddingBottom: '4px',
            paddingLeft: '8px',
            paddingRight: '8px',
            backgroundColor: 'rgb(247, 247, 248)',
            borderRadius: '100px',
            border: allSelected 
              ? '0.666667px solid rgb(9, 54, 114)' 
              : '0.666667px solid rgb(250, 250, 250)',
            fontSize: '16px',
            fontWeight: allSelected ? 700 : 400,
            color: 'rgb(77, 80, 83)',
            gap: '8px',
            flexDirection: 'row'
          }}
          onClick={() => {
            if (!isSlideSelectionActive) handleSelectAll();
          }}
          disabled={isSlideSelectionActive}
        >
          <span className="leading-none">
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
    <div className="flex flex-col">
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
            fontSize: '16px',
            fontWeight: !isDisabled && isActive ? 700 : 400,
            color: 'rgb(77, 80, 83)',
            gap: '8px',
            flexDirection: 'row'
          }}
          onClick={() => onClick(parentItem)}
        >
          <div 
            className='rounded-full overflow-hidden flex-shrink-0'
            style={{ 
              width: '24px', 
              height: '24px',
              lineHeight: 0
            }}
          >
            <img 
              className="w-full inline-block" 
              style={{ objectFit: 'cover', width: '24px', height: '24px' }}
              src={getCategoryImageSrc(parentItem.image)} 
              alt={parentItem.title} 
              onError={handleImageError}
              width="24"
              height="24"
            />
          </div>
          <span className="leading-none">
            {parentItem.title}
          </span>
        </div>
      </div>
    </div>
  );
}

export default SliderComponentCategoriesCMFastEdit