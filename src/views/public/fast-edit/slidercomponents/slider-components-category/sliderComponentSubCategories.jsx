import { useRef, useState } from 'react';
import { FreeMode, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import SliderArrows from '../SliderArrows';
import SliderPillImage from '../../../fast-order/slidercomponents/SliderPillImage';
import { useSliderPillFontSize } from '../../../fast-order/slidercomponents/useSliderPillFontSize';

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
      </div>
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
  const pillFontSize = useSliderPillFontSize();

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
  const isActive = filterCategoryStorage.includes(parentItem.idCategory);

  return (
    <>
      {parentItem?.subCategories?.length > 0 && isActive && (
        <div className="flex flex-col">
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

export default SliderComponentSubCategoriesCMFastEdit;