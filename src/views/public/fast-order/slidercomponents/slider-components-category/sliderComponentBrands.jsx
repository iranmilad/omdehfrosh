import { useRef, useState } from 'react';
import { FreeMode, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import SliderArrows from '../SliderArrows';

// Default SVG image for brands
const DEFAULT_BRAND_IMAGE = 'data:image/svg+xml;base64,' + btoa(`
<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="20" fill="#F8F9FA"/>
  <path d="M12 14 L22 14 C23.1 14 24 14.9 24 16 L24 24 C24 25.1 23.1 26 22 26 L12 26 C10.9 26 10 25.1 10 24 L10 16 C10 14.9 10.9 14 12 14 Z" fill="#E9ECEF" stroke="#ADB5BD" stroke-width="1"/>
  <path d="M17 18 L18 21 L21 21 L18.5 22.5 L19.5 25.5 L17 24 L14.5 25.5 L15.5 22.5 L13 21 L16 21 L17 18 Z" fill="#6C757D"/>
</svg>
`);

const SliderComponentBrandsCMFastOrder = ({
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
  isDisabled = false // Add isDisabled prop
}) => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(true);

  // Only show arrows if there are items with visible brands
  const hasVisibleContent = items && items.length > 0 &&
    filterCategoryStorage && filterCategoryStorage.length > 0 &&
    filterCategorySubCategoryStorage && filterCategorySubCategoryStorage.length > 0 &&
    items.some(item => {
      const isCategoryActive = filterCategoryStorage.includes(item.idCategory);
      return isCategoryActive && item.subCategories && item.subCategories.some(subcategory => {
        const isSubcategoryActive = filterCategorySubCategoryStorage.some(
          (entry) =>
            entry.idCategory === item.idCategory &&
            entry.idSubCategories.includes(subcategory.idSubCategory)
        );
        return isSubcategoryActive && subcategory.brands && subcategory.brands.length > 0;
      });
    });

  const ROW_HEIGHT = 48;
  return (
    <div style={{ position: 'relative', width: '100%', minHeight: ROW_HEIGHT, display: 'flex', alignItems: 'center' }}>
      <div style={{ flex: 1, minWidth: 0, height: ROW_HEIGHT, display: 'flex', alignItems: 'center' }}>
      <Swiper
        modules={[FreeMode, Navigation]}
        freeMode={true}
        slidesPerView="auto"
        spaceBetween={8}
        className="!mt-0 !m-0 !p-0"
        style={{ width: "100%" }}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        onInit={(swiper) => {
          if (swiper.isBeginning !== isBeginning) setIsBeginning(swiper.isBeginning);
          if (swiper.isEnd !== isEnd) setIsEnd(swiper.isEnd);
        }}
        onProgress={(swiper) => {
          if (swiper.isBeginning !== isBeginning) setIsBeginning(swiper.isBeginning);
          if (swiper.isEnd !== isEnd) setIsEnd(swiper.isEnd);
        }}
      >
      {items?.map((item, index) => (
        <SwiperSlide
          key={index}
          style={{ width: "auto", display: "flex", margin: 0, padding: 0 }}
          className="!m-0 !p-0"
        >
          <SingleSubcategoryWithBrands
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
            isDisabled={isDisabled}
          />
        </SwiperSlide>
      ))}
      </Swiper>
      </div>
      {hasVisibleContent && <SliderArrows prevRef={prevRef} nextRef={nextRef} isBeginning={isBeginning} isEnd={isEnd} />}
    </div>
  );
};

export function SingleSubcategoryWithBrands({
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
  isDisabled = false // Add isDisabled prop
}) {
  if (!parentItem || !Array.isArray(parentItem.subCategories)) return null;

  const onClick = (brand, idCategory, idSubCategory) => {
    if (isDisabled) return; // Prevent click when disabled
    
    if (searchType === "category" && clickType === "categoryBrands") {
      const existingEntryIndex = filterCategorySubCategoryBrandsStorage.findIndex(
        (entry) =>
          entry.idCategory === idCategory &&
          entry.idSubCategory === idSubCategory
      );

      if (existingEntryIndex !== -1) {
        const existingEntry = filterCategorySubCategoryBrandsStorage[existingEntryIndex];
        const isBrandSelected = existingEntry.idBrands.includes(brand.idBrand);

        if (isBrandSelected) {
          const newStorage = filterCategorySubCategoryBrandsStorage.filter(
            (_, index) => index !== existingEntryIndex
          );
          setFilterCategorySubCategoryBrandsStorage(newStorage);
        } else {
          const newStorage = [...filterCategorySubCategoryBrandsStorage];
          newStorage[existingEntryIndex] = {
            ...existingEntry,
            idBrands: [brand.idBrand]
          };
          setFilterCategorySubCategoryBrandsStorage(newStorage);
        }
      } else {
        const newEntry = {
          idCategory,
          idSubCategory,
          idBrands: [brand.idBrand]
        };
        setFilterCategorySubCategoryBrandsStorage([
          ...filterCategorySubCategoryBrandsStorage,
          newEntry
        ]);
      }
    }
  };

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

  const getBrandImageSrc = (image) => {
    if (isValidImage(image)) {
      return image;
    }
    return DEFAULT_BRAND_IMAGE;
  };

  const handleImageError = (e) => {
    e.target.src = DEFAULT_BRAND_IMAGE;
  };

  const isCategoryActive = Array.isArray(filterCategoryStorage) && 
    filterCategoryStorage.includes(parentItem.idCategory);

  return (
    <>
      {isCategoryActive && parentItem.subCategories.map((subcategory) => {
        const isSubcategoryActive = filterCategorySubCategoryStorage.some(
          (entry) =>
            entry.idCategory === parentItem.idCategory &&
            entry.idSubCategories.includes(subcategory.idSubCategory)
        );

        if (!isSubcategoryActive || !subcategory.brands || subcategory.brands.length === 0) {
          return null;
        }

        return (
          <div key={subcategory.idSubCategory} className="flex flex-col">
            <div className="flex flex-row flex-wrap gap-2">
              {subcategory.brands.map((brand, brandIndex) => {
                const isActiveBorder = filterCategorySubCategoryBrandsStorage.some(
                  (entry) =>
                    entry.idCategory === parentItem.idCategory &&
                    entry.idSubCategory === subcategory.idSubCategory &&
                    entry.idBrands.includes(brand.idBrand)
                );

                return (
                  <div
                    key={brandIndex}
                    className={isDisabled ? "cursor-not-allowed" : "cursor-pointer"}
                    onClick={() => onClick(brand, parentItem.idCategory, subcategory.idSubCategory)}
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
                        paddingRight: '4px',
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
                          lineHeight: 0,
                          marginRight: 0
                        }}
                      >
                        <img
                          className="w-full inline-block"
                          style={{ objectFit: 'cover', width: '24px', height: '24px', marginRight: 0 }}
                          src={getBrandImageSrc(brand.image)}
                          alt={brand.title}
                          onError={handleImageError}
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
            </div>
          </div>
        );
      })}
    </>
  );
}

export default SliderComponentBrandsCMFastOrder;