import { useRef, useState } from 'react';
import { FreeMode, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import SliderArrows from '../SliderArrows';

// Default SVG image for brands when image is null or empty
const DEFAULT_BRAND_IMAGE = 'data:image/svg+xml;base64,' + btoa(`
<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle -->
  <circle cx="20" cy="20" r="20" fill="#F8F9FA"/>
  <!-- Brand/tag icon -->
  <path d="M12 14 L22 14 C23.1 14 24 14.9 24 16 L24 24 C24 25.1 23.1 26 22 26 L12 26 C10.9 26 10 25.1 10 24 L10 16 C10 14.9 10.9 14 12 14 Z" fill="#E9ECEF" stroke="#ADB5BD" stroke-width="1"/>
  <!-- Star/brand symbol -->
  <path d="M17 18 L18 21 L21 21 L18.5 22.5 L19.5 25.5 L17 24 L14.5 25.5 L15.5 22.5 L13 21 L16 21 L17 18 Z" fill="#6C757D"/>
</svg>
`);

const SliderComponentBrandsCMFastEdit = ({ 
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
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [swiperState, setSwiperState] = useState({ isBeginning: true, isEnd: true });

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
  }).filter((item) => item.subCategories.length > 0);

  // Only show arrows if there are filtered items with visible brands
  const hasVisibleContent = filteredItems && filteredItems.length > 0 &&
    filteredItems.some(item =>
      item.subCategories && item.subCategories.some(sub =>
        sub.brands && sub.brands.length > 0
      )
    );

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Swiper
        modules={[FreeMode, Navigation]}
        slidesPerView="auto"
        spaceBetween={8}
        className="mt-2"
        style={{ width: "100%" }}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        onSwiper={(swiper) => {
          setSwiperState({ isBeginning: swiper.isBeginning, isEnd: swiper.isEnd });
        }}
        onProgress={(swiper) => {
          setSwiperState({ isBeginning: swiper.isBeginning, isEnd: swiper.isEnd });
        }}
        onReachBeginning={() => {
          setSwiperState(prev => ({ ...prev, isBeginning: true }));
        }}
        onReachEnd={() => {
          setSwiperState(prev => ({ ...prev, isEnd: true }));
        }}
      >
      {filteredItems?.map((item) => (
        <SwiperSlide 
          key={item.idCategory} 
          style={{ width: "auto", display: "flex", margin: 0, padding: 0 }}
        >
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
      {hasVisibleContent && <SliderArrows prevRef={prevRef} nextRef={nextRef} isBeginning={swiperState.isBeginning} isEnd={swiperState.isEnd} />}
    </div>
  );
};

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
      const updatedCategories = prevSelected.map(category => ({
        ...category,
        idSubCategories: [...category.idSubCategories],
        idBrands: category.idBrands.map(brandEntry => ({
          ...brandEntry,
          idBrands: [...brandEntry.idBrands]
        }))
      }));

      const categoryIndex = updatedCategories.findIndex(c => c.idCategory === parentItem.id);

      if (categoryIndex !== -1) {
        const category = updatedCategories[categoryIndex];
        const subCategoryIndex = category.idBrands.findIndex(sb => sb.idSubCategory === subcategory.idSubCategory);

        if (subCategoryIndex !== -1) {
          const brandList = category.idBrands[subCategoryIndex].idBrands;
          if (brandList.includes(brand.idBrand)) {
            category.idBrands[subCategoryIndex].idBrands = brandList.filter(b => b !== brand.idBrand);
            if (category.idBrands[subCategoryIndex].idBrands.length === 0) {
              category.idBrands.splice(subCategoryIndex, 1);
              category.idSubCategories = category.idSubCategories.filter(id => id !== subcategory.idSubCategory);
            }
          } else {
            category.idBrands[subCategoryIndex].idBrands.push(brand.idBrand);
          }
        } else {
          category.idSubCategories.push(subcategory.idSubCategory);
          category.idBrands.push({
            idSubCategory: subcategory.idSubCategory,
            idBrands: [brand.idBrand],
          });
        }

        if (category.idBrands.length === 0) {
          updatedCategories.splice(categoryIndex, 1);
        }
      } else {
        updatedCategories.push({
          idCategory: parentItem.id,
          idSubCategories: [subcategory.idSubCategory],
          idBrands: [{
            idSubCategory: subcategory.idSubCategory,
            idBrands: [brand.idBrand],
          }],
        });
      }

      return updatedCategories;
    });
  };

  const isBorderActive = (subcategory, brand) => {
    return filterCategorySubCategoryBrandsStorage.some(category =>
      category.idBrands.some(sb =>
        sb.idSubCategory === subcategory.idSubCategory &&
        sb.idBrands.includes(brand.idBrand)
      )
    );
  };

  const handleSelectAllForSubcategory = (subcategory, parentItem) => {
    const subcategoryBrands = subcategory.brands.map(brand => brand.idBrand);
    const allSelected = subcategoryBrands.every(brandId =>
      filterCategorySubCategoryBrandsStorage.some(category =>
        category.idBrands.some(sb =>
          sb.idSubCategory === subcategory.idSubCategory &&
          sb.idBrands.includes(brandId)
        )
      )
    );

    setFilterCategorySubCategoryBrandsStorage(prevSelected => {
      const updatedCategories = prevSelected.map(category => ({
        ...category,
        idSubCategories: [...category.idSubCategories],
        idBrands: category.idBrands.map(brandEntry => ({
          ...brandEntry,
          idBrands: [...brandEntry.idBrands]
        }))
      }));

      const categoryIndex = updatedCategories.findIndex(c => c.idCategory === parentItem.id);

      if (allSelected) {
        if (categoryIndex !== -1) {
          const category = updatedCategories[categoryIndex];
          const subCategoryIndex = category.idBrands.findIndex(sb => sb.idSubCategory === subcategory.idSubCategory);
          
          if (subCategoryIndex !== -1) {
            category.idBrands.splice(subCategoryIndex, 1);
            category.idSubCategories = category.idSubCategories.filter(id => id !== subcategory.idSubCategory);
            if (category.idBrands.length === 0) updatedCategories.splice(categoryIndex, 1);
          }
        }
      } else {
        if (categoryIndex !== -1) {
          const category = updatedCategories[categoryIndex];
          const subCategoryIndex = category.idBrands.findIndex(sb => sb.idSubCategory === subcategory.idSubCategory);
          
          if (subCategoryIndex !== -1) {
            category.idBrands[subCategoryIndex].idBrands = [...subcategoryBrands];
          } else {
            if (!category.idSubCategories.includes(subcategory.idSubCategory)) {
              category.idSubCategories.push(subcategory.idSubCategory);
            }
            category.idBrands.push({
              idSubCategory: subcategory.idSubCategory,
              idBrands: [...subcategoryBrands],
            });
          }
        } else {
          updatedCategories.push({
            idCategory: parentItem.id,
            idSubCategories: [subcategory.idSubCategory],
            idBrands: [{
              idSubCategory: subcategory.idSubCategory,
              idBrands: [...subcategoryBrands],
            }],
          });
        }
      }

      return updatedCategories;
    });
  };

  const areAllBrandsSelectedInSubcategory = (subcategory) => {
    const subcategoryBrands = subcategory.brands.map(brand => brand.idBrand);
    return subcategoryBrands.length > 0 && subcategoryBrands.every(brandId =>
      filterCategorySubCategoryBrandsStorage.some(category =>
        category.idBrands.some(sb =>
          sb.idSubCategory === subcategory.idSubCategory &&
          sb.idBrands.includes(brandId)
        )
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

  // Helper function to get brand image source with fallback
  const getBrandImageSrc = (image) => {
    if (isValidImage(image)) {
      return image;
    }
    return DEFAULT_BRAND_IMAGE;
  };

  // Handle image error by setting default placeholder
  const handleImageError = (e, brandName) => {
    console.warn(`Failed to load brand image: ${e.target.src} for brand: ${brandName}`);
    e.target.src = DEFAULT_BRAND_IMAGE;
  };

  return (
    <>
      {parentItem?.subCategories?.length > 0 && (
        <div className="flex flex-row flex-wrap gap-2">
          {parentItem.subCategories.map((subcategory, subcategoryIndex) => (
            <>
              {subcategory.brands.map((brand, brandIndex) => {
                const isActiveBorder = isBorderActive(subcategory, brand);

                return (
                  <div key={`${subcategoryIndex}-${brandIndex}`} className="flex-shrink-0">
                    <div
                      className="flex items-center justify-center whitespace-nowrap cursor-pointer"
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
                      onClick={() => onClick(subcategory, brand, parentItem)}
                    >
                      <div
                        className='rounded-full overflow-hidden flex-shrink-0'
                        style={{
                          width: '24px',
                          height: '24px',
                          lineHeight: 0,
                          marginRight: 0
                        }}
                      >
                        <img
                          className="w-full inline-block"
                          style={{ objectFit: 'cover', width: '24px', height: '24px', marginRight: 0 }}
                          src={getBrandImageSrc(brand.image)}
                          alt={brand.name}
                          onError={(e) => handleImageError(e, brand.name)}
                          width="24"
                          height="24"
                        />
                      </div>
                      <span className="leading-none">
                        {brand.name}
                      </span>
                    </div>
                  </div>
                );
              })}

            </>
          ))}
        </div>
      )}
    </>
  );
}

export default SliderComponentBrandsCMFastEdit;