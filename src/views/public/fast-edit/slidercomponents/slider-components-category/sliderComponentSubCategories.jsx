import { FreeMode, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

// SVG icon created using data URL - Subcategory placeholder with folder icon
const DEFAULT_SUBCATEGORY_PLACEHOLDER = 'data:image/svg+xml;base64,' + btoa(`
<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="20" fill="#F3F4F6"/>
  <path d="M11 14h6l2 2h10v12H11V14z" fill="#D1D5DB" stroke="#9CA3AF" stroke-width="1" stroke-linejoin="round"/>
  <path d="M11 18h18v10H11V18z" fill="#E5E7EB"/>
  <circle cx="16" cy="22" r="1" fill="#9CA3AF"/>
  <circle cx="20" cy="22" r="1" fill="#9CA3AF"/>
  <circle cx="24" cy="22" r="1" fill="#9CA3AF"/>
</svg>
`);

const SliderComponentSubCategoriesCMFastEdit = ({ 
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
  return (
    <Swiper 
      modules={[FreeMode, Navigation]}       
      freeMode={true} 
      slidesPerView="auto" 
      spaceBetween={6}
      className="mt-2"
      style={{ width: "100%" }}
    >
      {items?.map((item, index) => (
        <SwiperSlide 
          key={index} 
          style={{ width: "auto", display: "flex", margin: 0, padding: 0 }}
        >
          <SingleCategoryWithSubcategories 
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
      ))}
    </Swiper>
  );
};

export function SingleCategoryWithSubcategories({ 
  parentItem, 
  clickType,
  searchType,
  tab,
  filterCategoryStorage,
  setFilterCategoryStorage,
  filterCategorySubCategoryStorage,
  setFilterCategorySubCategoryStorage,
  filterCategorySubCategoryBrandsStorage,
  setFilterCategorySubCategoryBrandsStorage,
}) {

  if (!parentItem || !Array.isArray(parentItem.subCategories)) return null;

  const onClick = (item, idCategory) => {
    if (searchType === "category" && clickType === "categorySubCategories") {
      setFilterCategorySubCategoryStorage((prevState) => {
        const safePrevState = prevState || [];
    
        // Find the category entry in the state
        const categoryEntry = safePrevState.find((entry) => entry.idCategory === idCategory);
    
        if (categoryEntry) {
          // Check if the subcategory already exists
          const subCategoryExists = categoryEntry.idSubCategories.includes(item.idSubCategory);
    
          if (subCategoryExists) {
            // Remove subcategory (toggle off)
            categoryEntry.idSubCategories = categoryEntry.idSubCategories.filter(
              (subId) => subId !== item.idSubCategory
            );
    
            // If no subcategories left, remove the category entry
            if (categoryEntry.idSubCategories.length === 0) {
              return safePrevState.filter((entry) => entry.idCategory !== idCategory);
            }
          } else {
            // Add subcategory
            categoryEntry.idSubCategories.push(item.idSubCategory);
          }
    
          return [...safePrevState];
        } else {
          // Add new category with its first subcategory
          return [...safePrevState, { idCategory, idSubCategories: [item.idSubCategory] }];
        }
      });
    }
  }

  // Comprehensive image validation function
  const isValidImage = (imageValue) => {
    if (imageValue == null) return false;
    if (Array.isArray(imageValue)) {
      if (imageValue.length === 0) return false;
      return imageValue.some(img => img && typeof img === 'string' && img.trim() !== '');
    }
    if (typeof imageValue === 'string') {
      const trimmed = imageValue.trim();
      if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined' || trimmed === '[]') {
        return false;
      }
      return true;
    }
    return false;
  };

  // Helper function to get image source with fallback for subcategories
  const getSubcategoryImageSrc = (image) => {
    if (isValidImage(image)) {
      return image;
    }
    return DEFAULT_SUBCATEGORY_PLACEHOLDER;
  };

  // Handle image error by setting default placeholder
  const handleImageError = (e, subcategoryName) => {
    console.warn(`Failed to load subcategory image: ${e.target.src} for subcategory: ${subcategoryName}`);
    e.target.src = DEFAULT_SUBCATEGORY_PLACEHOLDER;
  };

  const isActive = filterCategoryStorage.includes(parentItem.idCategory);

  return (
    <>
      {parentItem?.subCategories?.length > 0 && isActive && (
        <div className="flex flex-col mt-2">
          <div className="flex flex-row flex-wrap gap-2">
            {parentItem.subCategories.map((subcategory, subIndex) => {
              const isActiveBorder = filterCategorySubCategoryStorage.some(
                (member) => 
                  member.idCategory === parentItem.idCategory &&
                  member.idSubCategories.includes(subcategory.idSubCategory)
              );

              return (
                <div 
                  key={subIndex} 
                  className="text-sm w-fit flex flex-col items-center cursor-pointer"
                  onClick={() => onClick(subcategory, parentItem.idCategory)}
                >
                  <div
                    className={`flex w-fit flex-row justify-center items-center px-3 gap-2 h-[35px] bg-gray-100 overflow-hidden border-[1.5px] ${
                      isActiveBorder ? "border-gray-400" : "border-none"
                    }`}
                    style={{ borderRadius: '18px' }}
                  >
                    <div className='w-[20px] h-[20px] bg-white rounded-full flex-shrink-0'>
                      <img
                        className="w-full h-full object-cover"
                        src={getSubcategoryImageSrc(subcategory.image)}
                        alt={subcategory.name}
                        onError={(e) => handleImageError(e, subcategory.name)}
                      />
                    </div>
                    <span className="cursor-pointer text-xs leading-none whitespace-nowrap">
                      {subcategory.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

export default SliderComponentSubCategoriesCMFastEdit;