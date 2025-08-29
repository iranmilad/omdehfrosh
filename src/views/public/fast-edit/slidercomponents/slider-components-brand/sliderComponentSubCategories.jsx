import { Box, Container } from '@mantine/core';
import { FreeMode, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
// import { SingleCategoryWithSubcategories } from '../SingleCategoryWithSubcategories';

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
          spaceBetween={15} 
          className="p-4"
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
  
        const brandEntry = safePrevState.find((entry) => entry.idBrand === idBrand);
  
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
            return safePrevState.filter(entry => entry.idBrand !== idBrand);
          }
  
          return [...safePrevState];
        } else {
          return [
            ...safePrevState,
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
  
  
  


  // const isActiveBrands = filterBrandStorage.includes(parentItem.idBrand)




  return (
    <>
    {
      shouldShow &&
      <div className="border-2 w-full items-center border-gray-300 p-4 rounded-lg flex flex-row gap-3">

      {/* Categories */}
      {parentItem.categories.map((category, index) => {

      const isCategoryActive = filterBrandsCategoryStorage.some(
        (entry) => entry.idBrand === parentItem.idBrand && entry.idCategories.includes(category.idCategory)
      );

        return (
          isCategoryActive && (
            <div key={index} className="border p-3 flex flex-col items-center rounded-lg">

            {/* Subcategories Row */}
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
                  className=" text-sm w-[80px] flex flex-col items-center cursor-pointer"
                  onClick={() => onClick(category, subCategory, parentItem.idBrand)}
  
                >
                  <div
                    className={`flex w-[60px] h-[60px] rounded-full overflow-hidden border-2
                    ${isActiveBorder ? "border-green-400" : "border-gray-500"}`}
                  >
                    <img className="w-full h-full object-cover" src={subCategory.image || "https://via.placeholder.com/60"} alt={subCategory.name} />
                  </div>
                  <span className="text-center whitespace-nowrap">{subCategory.name}</span>
                </div>
                )

              }
              )}
            </div>
            <div className='flex flex-row items-center gap-4'>
              <div className=''>
                <span>برند: {parentItem.title}</span>
              </div>
              <div>
                <span>دسته بندی: {category.title}</span>
              </div>
              <br />
            </div>
          </div>
          )

        )

      })
      
      }
    </div>
    
    }

    </>
  );
}


export default SliderComponentSubCategories;