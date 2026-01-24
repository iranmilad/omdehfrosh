import { useRef, useState } from 'react';
import { FreeMode, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import SliderArrows from '../SliderArrows';

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
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [swiperState, setSwiperState] = useState({ isBeginning: true, isEnd: true });

  // Only show arrows if there are items AND category is active with subcategories to show
  const hasVisibleContent = items && items.length > 0 &&
    filterCategoryStorage && filterCategoryStorage.length > 0 &&
    items.some(item =>
      filterCategoryStorage.includes(item.idCategory) &&
      item.subCategories &&
      item.subCategories.length > 0
    );

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Swiper
        modules={[FreeMode, Navigation]}
        freeMode={true}
        slidesPerView="auto"
        spaceBetween={8}
        className="mt-2 !m-0 !p-0"
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
      {hasVisibleContent && <SliderArrows prevRef={prevRef} nextRef={nextRef} isBeginning={swiperState.isBeginning} isEnd={swiperState.isEnd} />}
    </div>
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
                        lineHeight: 0,
                        marginRight: 0
                      }}
                    >
                      <img
                        className="w-full inline-block"
                        style={{ objectFit: 'cover', width: '24px', height: '24px', marginRight: 0 }}
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

export default SliderComponentSubCategoriesCMFastEdit;