import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useEffect } from 'react';

// Default SVG image for categories when image is null or empty
const DEFAULT_CATEGORY_IMAGE = 'data:image/svg+xml;base64,' + btoa(`
<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle -->
  <circle cx="20" cy="20" r="20" fill="#F8F9FA"/>
  <!-- Category/folder icon -->
  <path d="M8 12 L16 12 L18 14 L32 14 C33.1 14 34 14.9 34 16 L34 26 C34 27.1 33.1 28 32 28 L8 28 C6.9 28 6 27.1 6 26 L6 14 C6 12.9 6.9 12 8 12 Z" fill="#E9ECEF" stroke="#ADB5BD" stroke-width="1"/>
  <!-- Grid/category symbol -->
  <rect x="12" y="18" width="4" height="4" fill="#6C757D"/>
  <rect x="18" y="18" width="4" height="4" fill="#6C757D"/>
  <rect x="24" y="18" width="4" height="4" fill="#6C757D"/>
  <rect x="12" y="24" width="4" height="4" fill="#6C757D"/>
  <rect x="18" y="24" width="4" height="4" fill="#6C757D"/>
  <rect x="24" y="24" width="4" height="4" fill="#6C757D"/>
</svg>
`);

const SliderComponentCategoriesCM = ({ 
  items, 
  clickType, 
  searchType, 
  tab, 
  filterCategoryStorage = [], // Add default value
  setFilterCategoryStorage,
  filterCategorySubCategoryStorage,
  setFilterCategorySubCategoryStorage,
  filterCategorySubCategoryBrandsStorage,
  setFilterCategorySubCategoryBrandsStorage,
}) => {



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
      spaceBetween={6}            // ✅ Gap between boxes
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
            />
          </SwiperSlide>
        );
      })}

      {/* Select All Button */}
      <SwiperSlide style={{ width: "auto", display: "flex", margin: 0, padding: 0 }}>
        <button
          className={`flex h-[35px] px-4 gap-2 justify-center items-center border-2 
            ${allSelected ? "border-green-400 bg-green-50" : "border-transparent bg-gray-100"} 
            cursor-pointer`}
          style={{ borderRadius: '18px' }}
          onClick={handleSelectAll}
        >
          <span className="text-[9px] font-medium whitespace-nowrap">
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
  filterCategoryStorage = [], // Add default value
  setFilterCategoryStorage,
  filterCategorySubCategoryStorage,
  setFilterCategorySubCategoryStorage,
  filterCategorySubCategoryBrandsStorage,
  setFilterCategorySubCategoryBrandsStorage,
}) {



  if (!parentItem) {
    return null;
  }

  const onClick = (item) => {

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
    <div className="flex flex-col">
      <div className="w-full">
        <div
          className={`flex flex-col items-center justify-center flex-shrink-0 cursor-pointer`}
          onClick={() => onClick(parentItem)}
        >
          <div
            className={`flex w-fit h-[35px] px-4 gap-2 justify-center items-center overflow-hidden border-[1.5px] bg-gray-100
              ${isActive ? "border-red-600" : "border-transparent"}`}
            style={{ borderRadius: '18px' }}
          >
            <div className='w-full h-[25px] bg-white rounded-full'>
              <img 
                className="w-full h-full object-cover" 
                src={getCategoryImageSrc(parentItem.image)}
                alt={parentItem.title}
                onError={handleImageError}
                onLoad={() => {
                }}
              />
            </div>
            <span className="text-center whitespace-nowrap text-[9px] w-full">
              {parentItem.title ? parentItem.title : 'No title'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SliderComponentCategoriesCM