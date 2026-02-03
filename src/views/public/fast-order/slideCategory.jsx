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

// Import the context hooks
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
  subCategoryUniqueID,
  isMobile,
  isTablet,
  // ✅ NEW: Add isEditMode prop to control slider visibility during edit
  isEditMode = false
}) {
  
  // Conditionally get checked rows state based on searchType
  const brandContext = searchType === 'brand' ? useBrandRowSelection() : null;
  const categoryContext = searchType === 'category' ? useCategoryRowSelection() : null;
  
  const checkedRows = brandContext?.checkedRows || categoryContext?.checkedRows || new Set();
  
  // ✅ FIXED: Don't hide sliders when in edit mode
  // isSlideSelectionActive should be false during edit mode so all sliders remain visible
  const isSlideSelectionActive = !isEditMode && checkedRows.size > 0;

  console.log('📊 [SlideCategory] RENDER', {
    searchType,
    checkedRowsSize: checkedRows.size,
    isEditMode,
    isSlideSelectionActive,
    filterCategoryStorage,
    filterCategorySubCategoryStorage,
    filterCategorySubCategoryBrandsStorage,
    filterBrandStorage,
    filterBrandsCategoryStorage,
    filterBrandsCategorySubCategoryStorage,
    timestamp: Date.now()
  });

// Debug logging
  // console.log('🎚️ [SlideCategory] Render state:', {
  //   searchType,
  //   checkedRowsSize: checkedRows.size,
  //   isEditMode,
  //   isSlideSelectionActive,
  //   filterBrandStorage,
  //   filterBrandsCategoryStorage,
  //   filterBrandsCategorySubCategoryStorage,
  //   filterCategoryStorage,  // ✅ ADD THIS
  //   filterCategorySubCategoryStorage,  // ✅ ADD THIS
  //   filterCategorySubCategoryBrandsStorage  // ✅ ADD THIS
  // });

  // switch case method to return in different modes
  switch(searchType) {
    case "category":
      return (
        <>
          {/* categories slider - Always show, disable when filters active */}
          <div>
            <SliderComponentCategoriesCM
              key={`categories-${JSON.stringify(filterCategoryStorage)}`}
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
              isDisabled={isSlideSelectionActive}
            />
          </div>

          {/* 2nd & 3rd rows: hide when saved filter is active */}
          {!isSlideSelectionActive && (
            <>
              <div>
                <SliderComponentSubCategoriesCM
                  key={`subcategories-${JSON.stringify(filterCategorySubCategoryStorage)}`}
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
                  isDisabled={isSlideSelectionActive}
                />
              </div>
              <div>
                <SliderComponentBrandsCM 
                  key={`brands-${JSON.stringify(filterCategorySubCategoryBrandsStorage)}`}
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
                  isDisabled={isSlideSelectionActive}
                />
              </div>
            </>
          )}
        </>
      );
    case "brand":
      return (
        <>
          {/* brands slider - Always show, disable when filters active (but not in edit mode) */}
          <div>
            <SliderComponentBrands 
              key={`brands-${JSON.stringify(filterBrandStorage)}`}
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
              isDisabled={isSlideSelectionActive}
            />
          </div>

          {/* 2nd & 3rd rows: hide when saved filter is active */}
          {!isSlideSelectionActive && (
            <>
              <div>
                <SliderComponentCategories 
                  key={`categories-${JSON.stringify(filterBrandsCategoryStorage)}`}
                  items={items} 
                  clickType="brandCategories"
                  searchType={searchType}
                  tab={tab}
                  filterBrandStorage={filterBrandStorage}
                  setFilterBrandStorage={setFilterBrandStorage}
                  filterBrandsCategoryStorage={filterBrandsCategoryStorage}
                  setFilterBrandsCategoryStorage={setFilterBrandsCategoryStorage}
                  filterBrandsCategorySubCategoryStorage={filterBrandsCategorySubCategoryStorage}
                  setFilterBrandsCategorySubCategoryStorage={setFilterBrandsCategorySubCategoryStorage}
                  isDisabled={isSlideSelectionActive}
                />
              </div>
              <div>
                <SliderComponentSubCategories
                  key={`subcategories-${JSON.stringify(filterBrandsCategorySubCategoryStorage)}`}
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
                  isDisabled={isSlideSelectionActive}
                />
              </div>
            </>
          )}
        </>
      );
    default: 
      return null;
  }
}

export default SlideCategory;