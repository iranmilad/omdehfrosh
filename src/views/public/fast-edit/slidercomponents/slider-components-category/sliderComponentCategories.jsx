import { useRef, useState } from 'react';
import { FreeMode, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useCategoryRowSelection } from '../../CategoryRowSelectionContext';
import SliderArrows from '../SliderArrows';
import SliderPillImage from '../../../fast-order/slidercomponents/SliderPillImage';
import { useSliderPillFontSize } from '../../../fast-order/slidercomponents/useSliderPillFontSize';

const SliderComponentCategoriesCMFastEdit = ({ 
  items, 
  clickType, 
  searchType, 
  tab, 
  filterCategoryStorage = [],
  setFilterCategoryStorage,
  filterCategorySubCategoryStorage,
  setFilterCategorySubCategoryStorage,
  filterCategorySubCategoryBrandsStorage,
  setFilterCategorySubCategoryBrandsStorage,
}) => {

  const { checkedRows } = useCategoryRowSelection();
  const isSlideSelectionActive = checkedRows.size > 0;
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [swiperState, setSwiperState] = useState({ isBeginning: true, isEnd: true });

  // Early return with helpful message
  if (!items) {
    return <div>Loading categories...</div>;
  }

  if (!Array.isArray(items)) {
    return <div>Invalid data format</div>;
  }

  if (items.length === 0) {
    return <div>No categories available</div>;
  }

  const handleSelectAll = () => {
    if (clickType === "categories") {
      const allCategoryIds = items?.map(item => item.idCategory) || [];
      const allSelected = allCategoryIds.every(id => filterCategoryStorage.includes(id));
      
      if (allSelected) {
        // Clear all filters when deselecting all
        setFilterCategoryStorage([]);
        setFilterCategorySubCategoryStorage([]);
        setFilterCategorySubCategoryBrandsStorage([]);
      } else {
        // Select all categories and clear subcategory filters
        setFilterCategoryStorage(allCategoryIds);
        setFilterCategorySubCategoryStorage([]);
        setFilterCategorySubCategoryBrandsStorage([]);
      }
    }
  };

  const allCategoryIds = items?.map(item => item.idCategory) || [];
  const allSelected = allCategoryIds.length > 0 && allCategoryIds.every(id => filterCategoryStorage.includes(id));

  const ROW_HEIGHT = 48;
  return (
    <div style={{ position: 'relative', width: '100%', minHeight: ROW_HEIGHT, display: 'flex', alignItems: 'center' }}>
      <div style={{ flex: 1, minWidth: 0, height: ROW_HEIGHT, display: 'flex', alignItems: 'center' }}>
      <Swiper
        modules={[FreeMode, Navigation]}
        slidesPerView="auto"
        spaceBetween={8}
        className="!mt-0"
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
      {/* Category items */}
      {items.map((item, index) => {
        return (
          <SwiperSlide 
            key={item.idCategory || index} 
            style={{ width: "auto", display: "flex", margin: 0, padding: 0 }}
          >
            <SingleCategoryGroupCM 
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
              isDisabled={isSlideSelectionActive} 
            />
          </SwiperSlide>
        );
      })}

      </Swiper>
      </div>
      {items && items.length > 0 && <SliderArrows prevRef={prevRef} nextRef={nextRef} isBeginning={swiperState.isBeginning} isEnd={swiperState.isEnd} />}
    </div>
  );
};

export function SingleCategoryGroupCM({ 
  parentItem, 
  searchType,
  clickType, 
  tab,
  filterCategoryStorage = [],
  setFilterCategoryStorage,
  filterCategorySubCategoryStorage,
  setFilterCategorySubCategoryStorage,
  filterCategorySubCategoryBrandsStorage,
  setFilterCategorySubCategoryBrandsStorage,
  isDisabled
}) {
  const pillFontSize = useSliderPillFontSize();

  if (!parentItem) {
    return null;
  }

  const onClick = (item) => {
    if (isDisabled) return;

    if (clickType === "categories") {
      const isActive = filterCategoryStorage?.includes(item.idCategory) ?? false;

      if (isActive) {
        // Deselecting current category - clear all filters
        setFilterCategoryStorage([]);
        setFilterCategorySubCategoryStorage([]);
        setFilterCategorySubCategoryBrandsStorage([]);
      } else {
        // Selecting new category - set only this category and clear subcategory filters
        setFilterCategoryStorage([item.idCategory]);
        setFilterCategorySubCategoryStorage([]);
        setFilterCategorySubCategoryBrandsStorage([]);
      }
    }
  }

  const isActive = filterCategoryStorage.includes(parentItem.idCategory);

  return (
    <div className="flex flex-col">
      <div className="w-full">
        <div
          className={`flex items-center justify-center whitespace-nowrap
            ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          style={{
            height: '40px',
            paddingTop: '4px',
            paddingBottom: '4px',
            paddingLeft: '8px',
            paddingRight: '8px',
            backgroundColor: 'rgb(247, 247, 248)',
            borderRadius: '100px',
            border: !isDisabled && isActive 
              ? '0.666667px solid rgb(9, 54, 114)' 
              : '0.666667px solid rgb(250, 250, 250)',
            fontSize: pillFontSize,
            fontWeight: !isDisabled && isActive ? 700 : 400,
            color: 'rgb(77, 80, 83)',
            gap: '8px',
            flexDirection: 'row'
          }}
          onClick={() => onClick(parentItem)}
        >
          <SliderPillImage image={parentItem.image} alt={parentItem.title} />
          <span className="leading-none">
            {parentItem.title}
          </span>
        </div>
      </div>
    </div>
  );
}

export default SliderComponentCategoriesCMFastEdit