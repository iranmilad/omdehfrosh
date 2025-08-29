import { Box, Container } from '@mantine/core';
import { FreeMode, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
// import { SingleCategory1 } from "../SlideCategory";



const SliderComponentBrandsCM = ({ 
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

  // Extract all selected subcategory IDs
  const selectedSubcategories = filterCategorySubCategoryStorage
    ?.flatMap(category => category.idSubCategories) || [];

  // Filter items to show only brands of selected subcategories
  const filteredItems = items?.map((item) => {
    return {
      ...item,
      subCategories: item.subCategories.filter((sub) =>
        selectedSubcategories.includes(sub.idSubCategory)
      ),
    };
  }).filter((item) => item.subCategories.length > 0); // Remove categories with no subcategories left

  return (
    <Container fluid>
      <Box w="100%" pos="relative">
        <Swiper 
          modules={[FreeMode, Navigation]} 
          slidesPerView="auto" 
          spaceBetween={15} 
          freeMode={true} 
          className="p-4"
          style={{ width: "100%" }}
          loop={true}
        >
          {filteredItems?.map((item) => (
            <SwiperSlide key={item.idCategory} style={{ width: "auto" }}>
              <SingleCategory1 
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
      </Box>
    </Container>
  );
};


export function SingleCategory1({ 
  parentItem, 
  clickType, 
  searchType, 
  filterCategoryStorage,
  setFilterCategoryStorage,
  filterCategorySubCategoryStorage,
  setFilterCategorySubCategoryStorage,
  filterCategorySubCategoryBrandsStorage,
  setFilterCategorySubCategoryBrandsStorage,
  tab,
}) {



  



  
  
  const onClick = (subcategory, brand, parentItem) => {

    setFilterCategorySubCategoryBrandsStorage(prevSelected => {
        let updatedCategories = [...prevSelected];

        // Check if the category already exists
        const categoryIndex = updatedCategories.findIndex(c => c.idCategory === parentItem.id);

        if (categoryIndex !== -1) {
            // Category exists
            let category = updatedCategories[categoryIndex];

            // Check if subcategory exists
            const subCategoryIndex = category.idBrands.findIndex(sb => sb.idSubCategory === subcategory.idSubCategory);

            if (subCategoryIndex !== -1) {
                // Subcategory exists
                let brandList = category.idBrands[subCategoryIndex].idBrands;

                if (brandList.includes(brand.idBrand)) {
                    // Remove brand if already selected
                    category.idBrands[subCategoryIndex].idBrands = brandList.filter(b => b !== brand.idBrand);

                    // If no brands left, remove subcategory
                    if (category.idBrands[subCategoryIndex].idBrands.length === 0) {
                        category.idBrands.splice(subCategoryIndex, 1);
                        category.idSubCategories = category.idSubCategories.filter(id => id !== subcategory.idSubCategory);
                    }
                } else {
                    // Add brand to subcategory
                    category.idBrands[subCategoryIndex].idBrands.push(brand.idBrand);
                }
            } else {
                // Subcategory doesn't exist, add it with the brand
                category.idSubCategories.push(subcategory.idSubCategory);
                category.idBrands.push({
                    idSubCategory: subcategory.idSubCategory,
                    idBrands: [brand.idBrand]
                });
            }

            // If no subcategories left, remove category
            if (category.idBrands.length === 0) {
                updatedCategories.splice(categoryIndex, 1);
            }
        } else {
            // Category doesn't exist, add it
            updatedCategories.push({
                idCategory: parentItem.id,
                idSubCategories: [subcategory.idSubCategory],
                idBrands: [{
                    idSubCategory: subcategory.idSubCategory,
                    idBrands: [brand.idBrand]
                }]
            });
        }

        return updatedCategories;
    });
};


  // Function to check if the brand is active
  const isBorderActive = (subcategory, brand) => {
    return filterCategorySubCategoryBrandsStorage.some(category =>
      category.idBrands.some(sb =>
        sb.idSubCategory === subcategory.idSubCategory &&
        sb.idBrands.includes(brand.idBrand)
      )
    );
  };



  return (
    <>
      {
       (
        <div className="border-2 border-gray-300 p-4 rounded-lg flex flex-row gap-3">
            {parentItem?.subCategories.map((subcategory, index) => {

              return (
                <div key={index} className="border p-3 rounded-lg">
                  <div className="flex flex-row gap-2 justify-center">
                    {subcategory.brands.map((brand, brandIndex) => (
                      <div 
                        key={brandIndex} 
                        className="text-sm min-w-[80px] flex flex-col items-center cursor-pointer"
                        onClick={() => onClick(subcategory, brand, parentItem)}
                      >
                        <div className={`flex w-[60px] h-[60px] rounded-full overflow-hidden border-2
                        ${isBorderActive(subcategory, brand) ? "border-green-400" : "border-gray-500"}`}>
                          <img 
                            className="w-full h-full object-cover" 
                            src={brand.image || "https://via.placeholder.com/60"} 
                            alt={brand.name} 
                          />
                        </div>
                        <span className="text-center truncate w-full">
                          {brand.name}
                        </span>
                      </div>
                    ))

                    }
                  </div>
                  <div className='flex flex-row items-center gap-4'>
                    <span>دسته بندی: {parentItem.title}</span>
                      <span>زیر دسته بندی: {subcategory.name}</span>
                    </div>
              </div>
              )
              }
            
            )}

        </div>
        
      )}

    </>
  );
}



export default SliderComponentBrandsCM;