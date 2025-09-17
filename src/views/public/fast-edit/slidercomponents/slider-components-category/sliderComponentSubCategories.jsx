import { FreeMode, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

const SliderComponentSubCategoriesCM = ({ 
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
      spaceBetween={6}              // Added gap between slides for spacing
      className="mt-2"              // Added margin-top for some spacing above
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

// Enhanced SVG Icon Component for fallback
const SubCategoryIcon = () => (
  <svg 
    width="25" 
    height="25" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="w-[25px] h-[25px]"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" fill="#F8F9FA" stroke="#E9ECEF" strokeWidth="1"/>
    <circle cx="8" cy="8" r="2" fill="#9CA3AF"/>
    <circle cx="16" cy="8" r="2" fill="#9CA3AF"/>
    <circle cx="8" cy="16" r="2" fill="#9CA3AF"/>
    <circle cx="16" cy="16" r="2" fill="#9CA3AF"/>
    <path d="M8 10 L8 14 M10 8 L14 8 M10 16 L14 16 M16 10 L16 14" stroke="#6B7280" strokeWidth="1"/>
  </svg>
);

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

  // Enhanced image error handler
  const handleImageError = (e, subcategoryName) => {
    console.warn(`Failed to load subcategory image: ${e.target.src} for subcategory: ${subcategoryName}`);
    // Hide the broken image and let the icon show instead
    e.target.style.display = 'none';
    // Find the parent container and show the fallback icon
    const parent = e.target.parentElement;
    const fallbackIcon = parent.querySelector('.fallback-icon');
    if (fallbackIcon) {
      fallbackIcon.style.display = 'block';
    }
  };

  const isActive = filterCategoryStorage.includes(parentItem.idCategory);

  return (
    <>
      {parentItem?.subCategories?.length > 0 && isActive && (
        <div className="items-center border-gray-300 p-2 rounded-lg flex flex-col gap-4">
          {/* Subcategories Row */}
          <div className="flex flex-row gap-2 justify-center">
            {parentItem.subCategories.map((subcategory, subIndex) => {
              const isActiveBorder = filterCategorySubCategoryStorage.some(
                (member) => 
                  member.idCategory === parentItem.idCategory &&
                  member.idSubCategories.includes(subcategory.idSubCategory)
              );

              const showImage = isValidImage(subcategory.image);

              return (
                <div 
                  key={subIndex} 
                  className="text-sm w-fit flex flex-col items-center cursor-pointer"
                  onClick={() => onClick(subcategory, parentItem.idCategory)}
                >
                  <div
                    className={`flex w-fit px-2 flex-row gap-1 justify-center items-center h-[35px] overflow-hidden border-[1.5px] bg-gray-100
                      ${isActiveBorder ? "border-red-600" : "border-none"}`}
                    style={{ borderRadius: '18px' }}  // Rounded corners same as others
                  >
                    {showImage ? (
                      <div className="relative">
                        <img 
                          className="w-fit h-[25px] object-cover" 
                          src={subcategory.image} 
                          alt={subcategory.name}
                          onError={(e) => handleImageError(e, subcategory.name)}
                          style={{ display: 'block' }}
                        />
                        <div className="fallback-icon" style={{ display: 'none' }}>
                          <SubCategoryIcon />
                        </div>
                      </div>
                    ) : (
                      <SubCategoryIcon />
                    )}
                    <span className="cursor-pointer text-center text-[8px] whitespace-nowrap">
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

export default SliderComponentSubCategoriesCM;