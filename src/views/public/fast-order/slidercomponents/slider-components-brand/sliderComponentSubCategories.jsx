import { Box, Container } from '@mantine/core';
import { FreeMode, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

const SliderComponentSubCategories = ({ 
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

  return (
    <Container fluid>
      <Box w="100%" pos="relative">
        <Swiper 
          modules={[FreeMode, Navigation]}       
          freeMode={true} 
          slidesPerView="auto" 
          spaceBetween={8}          // Add spacing between slides
          className="mt-2"          // Add margin top for spacing
          style={{ width: "100%" }}
          loop={true}
        >
          {items?.map((item, index) => (
            <SwiperSlide key={index} style={{ width: "auto" }}>
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
      </Box>
    </Container>
  );
};

// SVG Icon Component for fallback
const SubCategoryIcon = () => (
  <svg 
    width="25" 
    height="25" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="w-[25px] h-[25px] rounded-full"
  >
    <rect x="6" y="6" width="12" height="12" rx="2" fill="#9CA3AF" />
  </svg>
);

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
        <div className="items-center justify-center border-gray-300 rounded-lg flex flex-row gap-2">
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
                        className="text-sm w-fit flex flex-row items-center justify-center cursor-pointer"
                        onClick={() => onClick(category, subCategory, parentItem.idBrand)}
                      >
                        <div
                          className={`flex px-2 h-[35px] w-full gap-2 justify-center items-center border-[1.5px]
                          ${isActiveBorder ? "border-red-600" : "border-none"} bg-gray-100`}
                          style={{ borderRadius: '18px' }}
                        >
                          <div className='w-fit h-[25px] bg-white rounded-full flex-shrink-0'>
                            {subCategory.image && subCategory.image.trim() !== "" ? (
                              <img
                                className="w-fit h-full object-cover rounded-full"
                                src={subCategory.image}
                                alt={subCategory.name}
                              />
                            ) : (
                              <div className="w-[25px] h-[25px] bg-white rounded-full flex items-center justify-center">
                                <SubCategoryIcon />
                              </div>
                            )}
                          </div>
                          <span className="text-center text-[9px] leading-tight break-words">
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
      )}
    </>
  );
}

export default SliderComponentSubCategories;