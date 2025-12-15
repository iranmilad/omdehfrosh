import { FreeMode, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

const SliderComponentCategoriesFastOrder = ({ 
  items, 
  clickType, 
  searchType, 
  tab, 
  filterBrandStorage,
  setFilterBrandStorage,
  filterBrandsCategoryStorage,
  setFilterBrandsCategoryStorage,
  isDisabled = false // Add isDisabled prop
}) => {
  return (
    <Swiper 
      modules={[FreeMode, Navigation]}
      freeMode={true}
      slidesPerView="auto"
      spaceBetween={8}
      style={{ 
        width: "100%",
        margin: 0,
        padding: 0
      }}
      className="!m-0 !p-0"
    >
      {items?.map((item, index) => (
        <SwiperSlide 
          key={index} 
          style={{
            width: "auto",
            display: "flex",
            margin: 0,
            padding: 0
          }}
          className="!m-0 !p-0"
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
            isDisabled={isDisabled}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

// Enhanced SVG Icon Component for fallback
const CategoryIcon = () => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="w-[24px] h-[24px]"
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
  isDisabled = false // Add isDisabled prop
}) {

  if (!parentItem || !Array.isArray(parentItem.categories)) return null;

  const onClick = (item, idBrand) => {
    if (isDisabled) return; // Prevent click when disabled
    
    if (searchType === "brand" && clickType === "brandCategories") {
      const brandExists = (filterBrandsCategoryStorage || []).some(
        (member) => member.idBrand === idBrand
      );

      let newValIDCat;

      if (brandExists) {
        const existingBrand = filterBrandsCategoryStorage.find(
          (member) => member.idBrand === idBrand
        );

        const categoryExists = existingBrand.idCategories.includes(item.idCategory);

        if (categoryExists) {
          newValIDCat = existingBrand.idCategories.filter(
            (category) => category !== item.idCategory
          );
        } else {
          newValIDCat = [...existingBrand.idCategories, item.idCategory];
        }

        setFilterBrandsCategoryStorage((prevState) =>
          prevState
            .map((member) =>
              member.idBrand === idBrand
                ? { ...member, idCategories: newValIDCat }
                : member
            )
            .filter((member) => member.idCategories.length > 0)
        );
      } else {
        newValIDCat = [item.idCategory];
        setFilterBrandsCategoryStorage((prevState) => [
          ...prevState,
          { idBrand: idBrand, idCategories: newValIDCat }
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

  // Enhanced image error handler
  const handleImageError = (e, categoryTitle) => {
    console.warn(`Failed to load category image: ${e.target.src} for category: ${categoryTitle}`);
    // Hide the broken image and let the icon show instead
    e.target.style.display = 'none';
    // Find the parent container and show the fallback icon
    const parent = e.target.parentElement;
    const fallbackIcon = parent.querySelector('.fallback-icon');
    if (fallbackIcon) {
      fallbackIcon.style.display = 'block';
    }
  };

  const isActive = filterBrandStorage.includes(parentItem.idBrand);

  return (
    <>
      {isActive && (
        <div className="flex flex-col mt-2">
          {/* Categories Row */}
          <div className="flex flex-row flex-wrap gap-2">
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
                  className={isDisabled ? "cursor-not-allowed" : "cursor-pointer"}
                  onClick={() => onClick(category, parentItem.idBrand)}
                  style={{
                    opacity: isDisabled ? 0.5 : 1,
                    pointerEvents: isDisabled ? 'none' : 'auto'
                  }}
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
                    {showImage ? (
                      <div 
                        className='rounded-full overflow-hidden flex-shrink-0 relative'
                        style={{ 
                          width: '24px', 
                          height: '24px',
                          lineHeight: 0
                        }}
                      >
                        <img 
                          className="w-full inline-block" 
                          style={{ objectFit: 'cover', display: 'block', width: '24px', height: '24px' }}
                          src={category.image} 
                          alt={category.title}
                          onError={(e) => handleImageError(e, category.title)}
                          width="24"
                          height="24"
                        />
                        <div className="fallback-icon" style={{ display: 'none' }}>
                          <CategoryIcon />
                        </div>
                      </div>
                    ) : (
                      <div 
                        className='rounded-full overflow-hidden flex-shrink-0'
                        style={{ 
                          width: '24px', 
                          height: '24px',
                          lineHeight: 0
                        }}
                      >
                        <CategoryIcon />
                      </div>
                    )}
                    <span className="leading-none">
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

export default SliderComponentCategoriesFastOrder;