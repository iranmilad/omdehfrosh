import { useRef, useState } from 'react';
import { FreeMode, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import SliderArrows from '../SliderArrows';
import SliderPillImage from '../SliderPillImage';
import { useSliderPillFontSize } from '../useSliderPillFontSize';

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
  isDisabled = false // Add isDisabled prop
}) => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(true);

  // Only show arrows if there are items AND category is active with subcategories to show
  const hasVisibleContent = items && items.length > 0 &&
    filterCategoryStorage && filterCategoryStorage.length > 0 &&
    items.some(item =>
      filterCategoryStorage.includes(item.idCategory) &&
      item.subCategories &&
      item.subCategories.length > 0
    );

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
  isDisabled = false // Add isDisabled prop
}) {
  const pillFontSize = useSliderPillFontSize();

  if (!parentItem || !Array.isArray(parentItem.subCategories)) return null;

  const onClick = (item, idCategory) => {
    if (isDisabled) return; // Prevent click when disabled
    
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
  const isActive = Array.isArray(filterCategoryStorage) && 
    filterCategoryStorage.includes(parentItem.idCategory);

  return (
    <>
      {parentItem?.subCategories?.length > 0 && isActive && (
        <div className="flex flex-col">
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
                  className={isDisabled ? "cursor-not-allowed" : "cursor-pointer"}
                  onClick={() => onClick(subcategory, parentItem.idCategory)}
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
                      fontSize: pillFontSize,
                      fontWeight: isActiveBorder ? 700 : 400,
                      color: 'rgb(77, 80, 83)',
                      gap: '8px',
                      flexDirection: 'row'
                    }}
                  >
                    <SliderPillImage image={subcategory.image} alt={subcategory.name} />
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