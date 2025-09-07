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
  

        // switch case method to return in different modes
        switch(searchType) {
          case "category":
            return (
              <>
                {/* categories slider */}
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

                {/* sub categories slider */}
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

                {/* brands slider */}
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
          );
          case "brand":
            return (
              <div>
              {/* brands slider */}
              <div>
                <SliderComponentBrands 
                  items={items} 
                  clickType="brands"
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
    
                {/* categories slider */}
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
    
                {/* sub categories slider */}
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
              </div>
          );
          default: return null;
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
