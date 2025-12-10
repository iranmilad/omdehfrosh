import { Box, Container } from '@mantine/core';
import { FreeMode, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

const SliderComponentSubCategoriesFastOrder = ({ 
  items,
  clickType,
  searchType,
  tab,
  filterBrandStorage,
  setFilterBrandStorage,
  filterBrandsCategoryStorage,
  setFilterBrandsCategoryStorage,
  filterBrandsCategorySubCategoryStorage,
  setFilterBrandsCategorySubCategoryStorage
}) => {

  return (
    <div style={{ width: "100%", margin: 0, padding: 0 }}>
      <Swiper 
        modules={[FreeMode, Navigation]}       
        freeMode={true} 
        slidesPerView="auto" 
        spaceBetween={8}
        className="mt-2 !m-0 !p-0"
        style={{ 
          width: "100%",
          margin: 0,
          padding: 0
        }}
        loop={true}
      >
        {items?.map((item, index) => (
          <SwiperSlide 
            key={index} 
            style={{ width: "auto", margin: 0, padding: 0 }}
            className="!m-0 !p-0"
          >
            <SingleCategoryWithSubcategories 
              parentItem={item} 
              clickType={clickType}
              searchType={searchType}
              tab={tab}
              filterBrandStorage={filterBrandStorage}
              setFilterBrandStorage={setFilterBrandStorage}
              filterBrandsCategoryStorage={filterBrandsCategoryStorage}
              setFilterBrandsCategoryStorage={setFilterBrandsCategoryStorage}
              filterBrandsCategorySubCategoryStorage={filterBrandsCategorySubCategoryStorage}
              setFilterBrandsCategorySubCategoryStorage={setFilterBrandsCategorySubCategoryStorage}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

// Enhanced SVG Icon Component for subcategory fallback
const SubCategoryIcon = () => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="w-[24px] h-[24px] rounded-full"
  >
    <circle cx="12" cy="12" r="11" fill="#F8F9FA" stroke="#E9ECEF" strokeWidth="1"/>
    <circle cx="8" cy="8" r="2" fill="#9CA3AF"/>
    <circle cx="16" cy="8" r="2" fill="#9CA3AF"/>
    <circle cx="8" cy="16" r="2" fill="#9CA3AF"/>
    <circle cx="16" cy="16" r="2" fill="#9CA3AF"/>
  </svg>
);

export function SingleCategoryWithSubcategories({ 
  parentItem, 
  clickType,
  searchType,
  tab,
  filterBrandStorage,
  setFilterBrandStorage,
  filterBrandsCategoryStorage,
  setFilterBrandsCategoryStorage,
  filterBrandsCategorySubCategoryStorage,
  setFilterBrandsCategorySubCategoryStorage
}) {
  if (!parentItem || !Array.isArray(parentItem.categories)) return null;

  const isActiveBrands = filterBrandStorage.includes(parentItem.idBrand);
  const isActiveCategories = parentItem.categories.some((category) =>
    filterBrandsCategoryStorage.some(
      (entry) =>
        entry.idBrand === parentItem.idBrand && entry.idCategories.includes(category.idCategory)
    )
  );
  const shouldShow = isActiveBrands && isActiveCategories;

  const onClick = (item, itemSubCategory, idBrand) => {
    if (searchType === "brand" && clickType === "brandSubCategories") {
      setFilterBrandsCategorySubCategoryStorage((prevState) => {
        const safePrevState = prevState || [];
  
        const newState = safePrevState.map(entry => ({
          ...entry,
          idCategories: [...entry.idCategories],
          idSubCategories: entry.idSubCategories.map(subEntry => ({
            ...subEntry,
            idSubCategories: [...subEntry.idSubCategories]
          }))
        }));

        const brandEntry = newState.find((entry) => entry.idBrand === idBrand);
  
        if (brandEntry) {
          if (!brandEntry.idCategories.includes(item.idCategory)) {
            brandEntry.idCategories.push(item.idCategory);
          }
  
          let categoryEntry = brandEntry.idSubCategories.find(sub => sub.idCategory === item.idCategory);
  
          if (categoryEntry) {
            if (categoryEntry.idSubCategories.includes(itemSubCategory.idSubCategory)) {
              categoryEntry.idSubCategories = categoryEntry.idSubCategories.filter(sub => sub !== itemSubCategory.idSubCategory);
              if (categoryEntry.idSubCategories.length === 0) {
                brandEntry.idSubCategories = brandEntry.idSubCategories.filter(sub => sub.idCategory !== item.idCategory);
                brandEntry.idCategories = brandEntry.idCategories.filter(cat => cat !== item.idCategory);
              }
            } else {
              categoryEntry.idSubCategories.push(itemSubCategory.idSubCategory);
            }
          } else {
            brandEntry.idSubCategories.push({
              idCategory: item.idCategory,
              idSubCategories: [itemSubCategory.idSubCategory],
            });
          }
  
          if (brandEntry.idSubCategories.length === 0) {
            return newState.filter(entry => entry.idBrand !== idBrand);
          }
  
          return newState;
        } else {
          return [
            ...newState,
            {
              idBrand,
              idCategories: [item.idCategory],
              idSubCategories: [
                {
                  idCategory: item.idCategory,
                  idSubCategories: [itemSubCategory.idSubCategory],
                }
              ]
            }
          ];
        }
      });
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
  const handleImageError = (e, subCategoryName) => {
    console.warn(`Failed to load subcategory image: ${e.target.src} for subcategory: ${subCategoryName}`);
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

  return (
    <>
      {shouldShow && (
        <div className="flex flex-col mt-2">
          <div className="flex flex-row flex-wrap gap-2">
            {/* Categories mapped horizontally */}
            {parentItem.categories.map((category, index) => {
              const isCategoryActive = filterBrandsCategoryStorage.some(
                (entry) => entry.idBrand === parentItem.idBrand && entry.idCategories.includes(category.idCategory)
              );

              if (!isCategoryActive) return null;

              return (
                <div key={index} className="flex flex-col items-center rounded-lg">
                  {/* Subcategories row */}
                  <div className="flex flex-row gap-2">
                    {category.subCategories.map((subCategory, subIndex) => {
                      const isActiveBorder = filterBrandsCategorySubCategoryStorage.some(
                        (member) =>
                          member.idBrand === parentItem.idBrand &&
                          member.idSubCategories.some(
                            (categoryEntry) =>
                              categoryEntry.idCategory === category.idCategory &&
                              categoryEntry.idSubCategories.includes(subCategory.idSubCategory)
                          )
                      );

                      const showImage = isValidImage(subCategory.image);

                      return (
                        <div
                          key={subIndex}
                          className="cursor-pointer"
                          onClick={() => onClick(category, subCategory, parentItem.idBrand)}
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
                              className='rounded-full overflow-hidden flex-shrink-0 image-container relative'
                              style={{ 
                                width: '24px', 
                                height: '24px',
                                lineHeight: 0
                              }}
                            >
                              {showImage ? (
                                <>
                                  <img
                                    className="w-full inline-block"
                                    style={{ objectFit: 'cover', display: 'block', width: '24px', height: '24px' }}
                                    src={subCategory.image}
                                    alt={subCategory.name}
                                    onError={(e) => handleImageError(e, subCategory.name)}
                                    width="24"
                                    height="24"
                                  />
                                  <div className="fallback-icon absolute inset-0 items-center justify-center" style={{ display: 'none' }}>
                                    <SubCategoryIcon />
                                  </div>
                                </>
                              ) : (
                                <SubCategoryIcon />
                              )}
                            </div>
                            <span className="leading-none">
                              {subCategory.name}
                            </span>
                          </div>
                        </div>
                      );
                    })}
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

export default SliderComponentSubCategoriesFastOrder;