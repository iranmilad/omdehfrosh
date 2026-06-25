import { Box, Container } from '@mantine/core';
import { useRef, useState } from 'react';
import { FreeMode, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import SliderArrows from '../SliderArrows';
import SliderPillImage from '../SliderPillImage';
import { useSliderPillFontSize } from '../useSliderPillFontSize';

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
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(true);

  // Only show arrows if there are items with visible subcategories
  const hasVisibleContent = items && items.length > 0 &&
    filterBrandStorage && filterBrandStorage.length > 0 &&
    filterBrandsCategoryStorage && filterBrandsCategoryStorage.length > 0 &&
    items.some(item => {
      const isActiveBrands = filterBrandStorage.includes(item.idBrand);
      const isActiveCategories = item.categories && item.categories.some((category) =>
        filterBrandsCategoryStorage.some(
          (entry) =>
            entry.idBrand === item.idBrand && entry.idCategories.includes(category.idCategory)
        )
      );
      return isActiveBrands && isActiveCategories && item.categories && item.categories.length > 0;
    });

  const ROW_HEIGHT = 48;
  return (
    <div style={{ width: "100%", margin: 0, padding: 0, position: 'relative', minHeight: ROW_HEIGHT, display: 'flex', alignItems: 'center' }}>
      <div style={{ flex: 1, minWidth: 0, height: ROW_HEIGHT, display: 'flex', alignItems: 'center' }}>
      <Swiper
        modules={[FreeMode, Navigation]}
        freeMode={true}
        slidesPerView="auto"
        spaceBetween={8}
        className="!mt-0 !m-0 !p-0"
        style={{
          width: "100%",
          margin: 0,
          padding: 0
        }}
        loop={true}
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
      {hasVisibleContent && <SliderArrows prevRef={prevRef} nextRef={nextRef} isBeginning={isBeginning} isEnd={isEnd} />}
    </div>
  );
};

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
  const pillFontSize = useSliderPillFontSize();

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

  return (
    <>
      {shouldShow && (
        <div className="flex flex-col">
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
                            <SliderPillImage image={subCategory.image} alt={subCategory.name} />
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