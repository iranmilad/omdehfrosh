import { useRef, useState } from 'react';
import { FreeMode, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import SliderArrows from '../SliderArrows';
import SliderPillImage from '../../../fast-order/slidercomponents/SliderPillImage';
import { useSliderPillFontSize } from '../../../fast-order/slidercomponents/useSliderPillFontSize';

const SliderComponentCategoriesFastEdit = ({ 
  items, 
  clickType, 
  searchType, 
  tab, 
  filterBrandStorage,
  setFilterBrandStorage,
  filterBrandsCategoryStorage,
  setFilterBrandsCategoryStorage,
}) => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [swiperState, setSwiperState] = useState({ isBeginning: true, isEnd: true });

  // Only show arrows if there are items AND at least one brand is active with categories to show
  const hasVisibleContent = items && items.length > 0 &&
    filterBrandStorage && filterBrandStorage.length > 0 &&
    items.some(item =>
      filterBrandStorage.includes(item.idBrand) &&
      item.categories &&
      item.categories.length > 0
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
        style={{
          width: "100%",
          margin: 0,
          padding: 0
        }}
        className="!m-0 !p-0"
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
          />
        </SwiperSlide>
      ))}
      </Swiper>
      </div>
      {hasVisibleContent && <SliderArrows prevRef={prevRef} nextRef={nextRef} isBeginning={swiperState.isBeginning} isEnd={swiperState.isEnd} />}
    </div>
  );
};

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
  const pillFontSize = useSliderPillFontSize();

  if (!parentItem || !Array.isArray(parentItem.categories)) return null;

  const onClick = (item, idBrand) => {
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

  const isActive = filterBrandStorage.includes(parentItem.idBrand);

  return (
    <>
      {isActive && (
        <div className="flex flex-col">
          {/* Categories Row - no mt-2 so slider row is 48px and arrows align */}
          <div className="flex flex-row flex-wrap gap-2">
            {parentItem.categories.map((category, index) => {
              const isActiveBorder = filterBrandsCategoryStorage.some(
                (member) => 
                  member.idBrand === parentItem.idBrand && 
                  member.idCategories.includes(category.idCategory)
              );

              return (
                <div 
                  key={index} 
                  className="cursor-pointer"
                  onClick={() => onClick(category, parentItem.idBrand)}
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
                    <SliderPillImage image={category.image} alt={category.title} />
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

export default SliderComponentCategoriesFastEdit;