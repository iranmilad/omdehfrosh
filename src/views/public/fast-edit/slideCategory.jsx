import { Box, Flex, Group, Image, Indicator, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import React, { act } from 'react';
import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

// brand mode
import SliderComponentBrands from './slidercomponents/slider-components-brand/sliderComponentBrands';
import SliderComponentCategories from './slidercomponents/slider-components-brand/sliderComponentCategories';
import SliderComponentSubCategories from './slidercomponents/slider-components-brand/sliderComponentSubCategories';

// category mode
import SliderComponentCategoriesCM from './slidercomponents/slider-components-category/sliderComponentCategories';
import SliderComponentSubCategoriesCM from './slidercomponents/slider-components-category/sliderComponentSubCategories'
import SliderComponentBrandsCM from './slidercomponents/slider-components-category/sliderComponentBrands'

import { useBrandRowSelection } from './BrandRowSelectionContext';
import { useCategoryRowSelection } from './CategoryRowSelectionContext';

function SlideCategory({ 
  items, 
  click, 
  clickType, 
  selectedBrand, 
  setBrands,
  subCategoryBrandsUniqueID,
  setSubCategoryBrandsUniqueID, 
  filtersContext, 
  searchType,
  selectedCategory,
  selectedSubCategory,
  filterBrandStorage,
  setFilterBrandStorage,
  filterBrandsCategoryStorage,
  setFilterBrandsCategoryStorage,
  filterBrandsSubCategoryCategoryStorage,
  setFilterBrandsSubCategoryCategoryStorage,
  filterSubCategoryCategoryStorage,
  setFilterSubCategoryCategoryStorage,
  filterBrandsCategorySubCategoryStorage,
  setFilterBrandsCategorySubCategoryStorage,
  filterCategoryStorage,
  setFilterCategoryStorage,
  filterCategorySubCategoryStorage,
  setFilterCategorySubCategoryStorage,
  filterCategorySubCategoryBrandsStorage,
  setFilterCategorySubCategoryBrandsStorage,
  tab, 
  brandsContext, 
  setSubCategoryUniqueID, 
  subCategoryUniqueID 
}) {
  const brandContext = searchType === 'brand' ? useBrandRowSelection() : null;
  const categoryContext = searchType === 'category' ? useCategoryRowSelection() : null;
  const checkedRows = brandContext?.checkedRows || categoryContext?.checkedRows || new Set();
  const isSlideSelectionActive = checkedRows.size > 0;

  switch (searchType) {
    case "category":
      return (
        <>
          {/* 1st row: categories - always show, disabled when saved filter active */}
          <div>
            <SliderComponentCategoriesCM
              items={items} 
              clickType="categories"
              searchType={searchType}
              tab={tab}
              filterCategoryStorage={filterCategoryStorage}
              setFilterCategoryStorage={setFilterCategoryStorage}
              filterCategorySubCategoryStorage={filterCategorySubCategoryStorage}
              setFilterCategorySubCategoryStorage={setFilterCategorySubCategoryStorage}
              filterCategorySubCategoryBrandsStorage={filterCategorySubCategoryBrandsStorage}
              setFilterCategorySubCategoryBrandsStorage={setFilterCategorySubCategoryBrandsStorage}
            />
          </div>

          {/* 2nd & 3rd rows: hide when saved filter is active */}
          {!isSlideSelectionActive && (
            <>
              <div>
                <SliderComponentSubCategoriesCM
                  items={items} 
                  clickType="categorySubCategories"
                  searchType={searchType}
                  tab={tab}
                  filterCategoryStorage={filterCategoryStorage}
                  setFilterCategoryStorage={setFilterCategoryStorage}
                  filterCategorySubCategoryStorage={filterCategorySubCategoryStorage}
                  setFilterCategorySubCategoryStorage={setFilterCategorySubCategoryStorage}
                  filterCategorySubCategoryBrandsStorage={filterCategorySubCategoryBrandsStorage}
                  setFilterCategorySubCategoryBrandsStorage={setFilterCategorySubCategoryBrandsStorage}
                />
              </div>
              <div>
                <SliderComponentBrandsCM 
                  items={items} 
                  clickType="categoryBrands"
                  searchType={searchType}
                  tab={tab}
                  filterCategoryStorage={filterCategoryStorage}
                  setFilterCategoryStorage={setFilterCategoryStorage}
                  filterCategorySubCategoryStorage={filterCategorySubCategoryStorage}
                  setFilterCategorySubCategoryStorage={setFilterCategorySubCategoryStorage}
                  filterCategorySubCategoryBrandsStorage={filterCategorySubCategoryBrandsStorage}
                  setFilterCategorySubCategoryBrandsStorage={setFilterCategorySubCategoryBrandsStorage}
                />
              </div>
            </>
          )}
        </>
      );
    case "brand":
      return (
        <div>
          {/* 1st row: brands - always show, disabled when saved filter active */}
          <div>
            <SliderComponentBrands 
              items={items} 
              clickType="brands"
              searchType={searchType}
              tab={tab}
              filterBrandStorage={filterBrandStorage}
              setFilterBrandStorage={setFilterBrandStorage}
            />
          </div>

          {/* 2nd & 3rd rows: hide when saved filter is active */}
          {!isSlideSelectionActive && (
            <>
              <div>
                <SliderComponentCategories 
                  items={items} 
                  clickType="brandCategories"
                  searchType={searchType}
                  tab={tab}
                  filterBrandStorage={filterBrandStorage}
                  setFilterBrandStorage={setFilterBrandStorage}
                  filterBrandsCategoryStorage={filterBrandsCategoryStorage}
                  setFilterBrandsCategoryStorage={setFilterBrandsCategoryStorage}
                />
              </div>
              <div>
                <SliderComponentSubCategories
                  items={items} 
                  clickType="brandSubCategories"
                  searchType={searchType}
                  tab={tab}
                  filterBrandStorage={filterBrandStorage}
                  setFilterBrandStorage={setFilterBrandStorage}
                  filterBrandsCategoryStorage={filterBrandsCategoryStorage}
                  setFilterBrandsCategoryStorage={setFilterBrandsCategoryStorage}
                  filterBrandsCategorySubCategoryStorage={filterBrandsCategorySubCategoryStorage}
                  setFilterBrandsCategorySubCategoryStorage={setFilterBrandsCategorySubCategoryStorage}
                />
              </div>
            </>
          )}
        </div>
      );
    default:
      return null;
  }


      // if (searchType === "category") {

      //     return (
      //       <Swiper modules={[FreeMode]} slidesPerView="auto">
      //       {items?.map((item, index) => {
      //         // Check if the item is active based on the selected brands
      //         const isActive = tab[clickType]?.includes(item.id)
              
      //         return (
      //           <SwiperSlide key={index} style={{ width: "100px", textAlign: "right" }}>
      //             <SingleCategory
      //               {...item}
      //               onClick={() => onClick(item)} // Pass the item itself to the onClick function
      //               active={tab[clickType]?.includes(item.id) || isActive}
      //               />
      //           </SwiperSlide>
      //         );
      //       })}
      //     </Swiper>
      //   );
      // } 

      // if (searchType === "brand") {

      //   return (
      //     <>
      //     {/* brands slider */}
      //     <div>
      //       <SliderComponentBrands 
      //         items={items} 
      //         clickType={clickType}
      //         tab={tab}
      //         />
      //     </div>

      //       {/* categories slider */}
      //       <div>
      //       <SliderComponentCategories 
      //         items={items} 
      //         clickType={clickType}
      //         tab={tab}
      //         />
      //       </div>

      //       {/* sub categories slider */}
      //       <div>
      //       <SliderComponentSubCategories
      //         items={items} 
      //         clickType={clickType}
      //         tab={tab}
      //         />
      //       </div>
      //     </>
      // );

      // }
      }


export default SlideCategory;
