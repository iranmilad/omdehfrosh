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

const SliderComponentSubCategoriesCMFastOrder = ({
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
      spaceBetween={8}
      className="mt-2 !m-0 !p-0"
      style={{ width: "100%" }}
    >
      {items?.map((item, index) => (
        <SwiperSlide
          key={index}
          style={{ width: "auto", display: "flex", margin: 0, padding: 0 }}
          className="!m-0 !p-0"
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
      // Find existing entry for this category
      const existingCategoryIndex = filterCategorySubCategoryStorage.findIndex(
        (entry) => entry.idCategory === idCategory
      );
      
      if (existingCategoryIndex !== -1) {
        // Category exists, check if the same subcategory is already selected
        const existingEntry = filterCategorySubCategoryStorage[existingCategoryIndex];
        const isSubcategorySelected = existingEntry.idSubCategories.includes(item.idSubCategory);
        
        if (isSubcategorySelected) {
          // If clicking the same subcategory, deselect it (remove entire category entry)
          const newStorage = filterCategorySubCategoryStorage.filter(
            (_, index) => index !== existingCategoryIndex
          );
          setFilterCategorySubCategoryStorage(newStorage);
        } else {
          // If clicking a different subcategory, replace the current selection
          const newStorage = [...filterCategorySubCategoryStorage];
          newStorage[existingCategoryIndex] = {
            ...existingEntry,
            idSubCategories: [item.idSubCategory] // Only one subcategory allowed
          };
          setFilterCategorySubCategoryStorage(newStorage);
        }
      } else {
        // Category doesn't exist, create new entry with single subcategory
        const newEntry = {
          idCategory,
          idSubCategories: [item.idSubCategory]
        };
        setFilterCategorySubCategoryStorage([
          ...filterCategorySubCategoryStorage,
          newEntry
        ]);
      }
    }
  };

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

  // Check if parent category is active
  const isActive = Array.isArray(filterCategoryStorage) && 
    filterCategoryStorage.includes(parentItem.idCategory);

  return (
    <>
      {parentItem?.subCategories?.length > 0 && isActive && (
        <div className="flex flex-col mt-2">
          <div className="flex flex-row flex-wrap gap-2">
            {parentItem.subCategories.map((subcategory, subIndex) => {
              // Check if this specific subcategory is selected for this category
              const isActiveBorder = filterCategorySubCategoryStorage.some(
                (entry) =>
                  entry.idCategory === parentItem.idCategory &&
                  entry.idSubCategories.includes(subcategory.idSubCategory)
              );

              return (
                <div
                  key={subIndex}
                  className="cursor-pointer"
                  onClick={() => onClick(subcategory, parentItem.idCategory)}
                >
                  <div
                    className="flex items-center justify-center whitespace-nowrap"
                    style={{
                      height: '40px',
                      paddingTop: '4px',
                      paddingBottom: '4px',
                      paddingLeft: '8px',
                      paddingRight: '8px',
                      backgroundColor: 'rgb(247, 247, 248)',
                      borderRadius: '100px',
                      border: isActiveBorder 
                        ? '0.666667px solid rgb(9, 54, 114)' 
                        : '0.666667px solid rgb(250, 250, 250)',
                      fontSize: '16px',
                      fontWeight: isActiveBorder ? 700 : 400,
                      color: 'rgb(77, 80, 83)',
                      gap: '8px',
                      flexDirection: 'row'
                    }}
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
                        src={getSubcategoryImageSrc(subcategory.image)}
                        alt={subcategory.name}
                        onError={(e) => handleImageError(e, subcategory.name)}
                        width="24"
                        height="24"
                      />
                    </div>
                    <span className="leading-none">
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

export default SliderComponentSubCategoriesCMFastOrder;