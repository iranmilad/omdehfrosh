import { Box, Container } from '@mantine/core';
import { FreeMode, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

const SliderComponentBrandsCM = ({ 
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

  // Extract all selected subcategory IDs
  const selectedSubcategories = filterCategorySubCategoryStorage
    ?.flatMap(category => category.idSubCategories) || [];

  // Filter items to show only brands of selected subcategories
  const filteredItems = items?.map((item) => {
    return {
      ...item,
      subCategories: item.subCategories.filter((sub) =>
        selectedSubcategories.includes(sub.idSubCategory)
      ),
    };
  }).filter((item) => item.subCategories.length > 0); // Remove categories with no subcategories left

  return (
    <Container fluid>
      <Box w="100%" pos="relative">
        <Swiper 
          modules={[FreeMode, Navigation]}       
          freeMode={true} 
          slidesPerView="auto" 
          spaceBetween={8}          // Add spacing between slides
          className="mt-2"          // Add margin top for spacing
          style={{ width: "100%" }}
          loop={true}
        >
          {filteredItems?.map((item) => (
            <SwiperSlide key={item.idCategory} style={{ width: "auto" }}>
              <SingleCategory1 
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
      </Box>
    </Container>
  );
};

// Enhanced SVG Icon Component for brand fallback
const BrandIcon = () => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="w-[20px] h-[20px] rounded-full"
  >
    <circle cx="12" cy="12" r="11" fill="#F8F9FA" stroke="#E9ECEF" strokeWidth="1"/>
    <path d="M12 6 L14 10 L18 10 L15 13 L16 18 L12 15 L8 18 L9 13 L6 10 L10 10 L12 6 Z" fill="#9CA3AF"/>
  </svg>
);

export function SingleCategory1({ 
  parentItem, 
  clickType, 
  searchType, 
  filterCategoryStorage,
  setFilterCategoryStorage,
  filterCategorySubCategoryStorage,
  setFilterCategorySubCategoryStorage,
  filterCategorySubCategoryBrandsStorage,
  setFilterCategorySubCategoryBrandsStorage,
  tab,
}) {

  const onClick = (subcategory, brand, parentItem) => {
    setFilterCategorySubCategoryBrandsStorage(prevSelected => {
        let updatedCategories = [...prevSelected];

        // Check if the category already exists
        const categoryIndex = updatedCategories.findIndex(c => c.idCategory === parentItem.id);

        if (categoryIndex !== -1) {
            // Category exists
            let category = updatedCategories[categoryIndex];

            // Check if subcategory exists
            const subCategoryIndex = category.idBrands.findIndex(sb => sb.idSubCategory === subcategory.idSubCategory);

            if (subCategoryIndex !== -1) {
                // Subcategory exists
                let brandList = category.idBrands[subCategoryIndex].idBrands;

                if (brandList.includes(brand.idBrand)) {
                    // Remove brand if already selected
                    category.idBrands[subCategoryIndex].idBrands = brandList.filter(b => b !== brand.idBrand);

                    // If no brands left, remove subcategory
                    if (category.idBrands[subCategoryIndex].idBrands.length === 0) {
                        category.idBrands.splice(subCategoryIndex, 1);
                        category.idSubCategories = category.idSubCategories.filter(id => id !== subcategory.idSubCategory);
                    }
                } else {
                    // Add brand to subcategory
                    category.idBrands[subCategoryIndex].idBrands.push(brand.idBrand);
                }
            } else {
                // Subcategory doesn't exist, add it with the brand
                category.idSubCategories.push(subcategory.idSubCategory);
                category.idBrands.push({
                    idSubCategory: subcategory.idSubCategory,
                    idBrands: [brand.idBrand]
                });
            }

            // If no subcategories left, remove category
            if (category.idBrands.length === 0) {
                updatedCategories.splice(categoryIndex, 1);
            }
        } else {
            // Category doesn't exist, add it
            updatedCategories.push({
                idCategory: parentItem.id,
                idSubCategories: [subcategory.idSubCategory],
                idBrands: [{
                    idSubCategory: subcategory.idSubCategory,
                    idBrands: [brand.idBrand]
                }]
            });
        }

        return updatedCategories;
    });
  };

  // Function to check if the brand is active
  const isBorderActive = (subcategory, brand) => {
    return filterCategorySubCategoryBrandsStorage.some(category =>
      category.idBrands.some(sb =>
        sb.idSubCategory === subcategory.idSubCategory &&
        sb.idBrands.includes(brand.idBrand)
      )
    );
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
  const handleImageError = (e, brandName) => {
    console.warn(`Failed to load brand image: ${e.target.src} for brand: ${brandName}`);
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
      {parentItem?.subCategories?.length > 0 && (
        <div className="items-center justify-center border-gray-300 rounded-lg flex flex-row gap-2">
          {/* Subcategories mapped horizontally */}
          {parentItem.subCategories.map((subcategory, index) => {
            return (
              <div key={index} className="flex flex-col items-center rounded-lg">
                {/* Brands row */}
                <div className="flex flex-row gap-2">
                  {subcategory.brands.map((brand, brandIndex) => {
                    const isActiveBorder = isBorderActive(subcategory, brand);
                    const showImage = isValidImage(brand.image);

                    return (
                      <div
                        key={brandIndex}
                        className="text-sm w-fit flex flex-row items-center justify-center cursor-pointer"
                        onClick={() => onClick(subcategory, brand, parentItem)}
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
                                  src={brand.image}
                                  alt={brand.name}
                                  onError={(e) => handleImageError(e, brand.name)}
                                  style={{ display: 'block' }}
                                />
                                <div className="fallback-icon w-[20px] h-[20px] bg-white rounded-full items-center justify-center absolute inset-0" style={{ display: 'none' }}>
                                  <BrandIcon />
                                </div>
                              </>
                            ) : (
                              <BrandIcon />
                            )}
                          </div>
                          <span className="text-center text-[10px] font-medium leading-tight break-words">
                            {brand.name}
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
      )}
    </>
  );
}

export default SliderComponentBrandsCM;