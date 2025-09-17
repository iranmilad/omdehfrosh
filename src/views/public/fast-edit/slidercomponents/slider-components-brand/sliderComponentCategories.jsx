import { FreeMode, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

const SliderComponentCategories = ({ 
  items, 
  clickType, 
  searchType, 
  tab, 
  filterBrandStorage,
  setFilterBrandStorage,
  filterBrandsCategoryStorage,
  setFilterBrandsCategoryStorage,
}) => {
  return (
    <Swiper 
      modules={[FreeMode, Navigation]}       
      freeMode={true} 
      slidesPerView="auto" 
      spaceBetween={6}              // Updated spacing
      className="mt-2"              // Updated margin
      style={{ width: "100%" }}
    >
      {items?.map((item, index) => (
        <SwiperSlide 
          key={index} 
          style={{ width: "auto", display: "flex", margin: 0, padding: 0 }}
        >
          <SingleCategoryGroup 
            parentItem={item} 
            clickType={clickType}
            searchType={searchType}
            tab={tab}
            filterBrandStorage={filterBrandStorage}
            setFilterBrandStorage={setFilterBrandStorage}
            filterBrandsCategoryStorage={filterBrandsCategoryStorage}
            setFilterBrandsCategoryStorage={setFilterBrandsCategoryStorage}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

// Enhanced SVG Icon Component for fallback
const CategoryIcon = () => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="w-[20px] h-[20px]"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" fill="#F8F9FA" stroke="#E9ECEF" strokeWidth="1"/>
    <rect x="6" y="6" width="5" height="5" rx="1" fill="#9CA3AF"/>
    <rect x="13" y="6" width="5" height="5" rx="1" fill="#9CA3AF"/>
    <rect x="6" y="13" width="5" height="5" rx="1" fill="#9CA3AF"/>
    <rect x="13" y="13" width="5" height="5" rx="1" fill="#9CA3AF"/>
  </svg>
);

export function SingleCategoryGroup({ 
  parentItem, 
  searchType,
  clickType, 
  tab,
  filterBrandStorage, 
  setFilterBrandStorage,
  filterBrandsCategoryStorage,
  setFilterBrandsCategoryStorage,
}) {

  if (!parentItem || !Array.isArray(parentItem.categories)) return null;

  const onClick = (item, idBrand) => {
    if (searchType === "brand" && clickType === "brandCategories") {
      // Check if the brand already exists in the storage
      const brandExists = (filterBrandsCategoryStorage || []).some(
        (member) => member.idBrand === idBrand
      );

      let newValIDCat;

      if (brandExists) {
        // If the brand exists, update the list of categories
        const existingBrand = filterBrandsCategoryStorage.find(
          (member) => member.idBrand === idBrand
        );

        // Check if the category already exists in the list for the specific brand
        const categoryExists = existingBrand.idCategories.includes(item.idCategory);

        if (categoryExists) {
          // Remove the category if it's already active
          newValIDCat = existingBrand.idCategories.filter(
            (category) => category !== item.idCategory
          );
        } else {
          // Add the category if it's not already active
          newValIDCat = [...existingBrand.idCategories, item.idCategory];
        }

        // Update the storage by removing the old entry and replacing it with the new list of categories
        setFilterBrandsCategoryStorage((prevState) =>
          prevState.map((member) =>
            member.idBrand === idBrand
              ? { ...member, idCategories: newValIDCat }
              : member
          ).filter((member) => member.idCategories.length > 0) // Filter out brands with no categories
        );
      } else {
        // If the brand doesn't exist, create a new entry with the category
        newValIDCat = [item.idCategory];

        setFilterBrandsCategoryStorage((prevState) => [
          ...prevState,
          { idBrand: idBrand, idCategories: newValIDCat }
        ]);
      }
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
  const handleImageError = (e, categoryTitle) => {
    console.warn(`Failed to load category image: ${e.target.src} for category: ${categoryTitle}`);
    // Hide the broken image and let the icon show instead
    e.target.style.display = 'none';
    // Find the parent container and show the fallback icon
    const parent = e.target.closest('.image-container');
    if (parent) {
      const fallbackIcon = parent.querySelector('.fallback-icon');
      if (fallbackIcon) {
        fallbackIcon.style.display = 'flex';
      }
    }
  };

  const isActive = filterBrandStorage.includes(parentItem.idBrand);

  return (
    <>
      {isActive && (
        <div className="items-center border-gray-300 p-2 rounded-lg flex flex-col gap-4">
          {/* Categories Row */}
          <div className="flex flex-row gap-2 justify-center">
            {parentItem.categories.map((category, index) => {
              const isActiveBorder = filterBrandsCategoryStorage.some(
                (member) => 
                  member.idBrand === parentItem.idBrand && 
                  member.idCategories.includes(category.idCategory)
              );

              const showImage = isValidImage(category.image);

              return (
                <div 
                  key={index} 
                  className="text-sm w-fit flex flex-col items-center cursor-pointer"
                  onClick={() => onClick(category, parentItem.idBrand)}
                >
                  <div
                    className={`flex px-3 h-[32px] w-full gap-2 justify-center items-center border-[1.5px]
                    ${isActiveBorder ? "border-red-600" : "border-none"} bg-gray-100`}
                    style={{ borderRadius: '16px' }}
                  >
                    <div className='w-[20px] h-[20px] bg-white rounded-full flex-shrink-0 image-container relative flex items-center justify-center'>
                      {showImage ? (
                        <>
                          <img
                            className="w-[20px] h-[20px] object-cover rounded-full"
                            src={category.image}
                            alt={category.title}
                            onError={(e) => handleImageError(e, category.title)}
                            style={{ display: 'block' }}
                          />
                          <div className="fallback-icon w-[20px] h-[20px] bg-white rounded-full items-center justify-center absolute inset-0" style={{ display: 'none' }}>
                            <CategoryIcon />
                          </div>
                        </>
                      ) : (
                        <CategoryIcon />
                      )}
                    </div>
                    <span className="text-center text-[10px] font-medium leading-tight break-words">
                      {category.title}
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

export default SliderComponentCategories;