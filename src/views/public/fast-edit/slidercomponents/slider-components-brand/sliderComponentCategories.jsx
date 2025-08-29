import { FreeMode, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
// import { SingleCategoryGroup } from '../SingleCategoryGroup';


const SliderComponentCategories = ({ 
  items, 
  clickType, 
  searchType, 
  tab, 
  filterBrandStorage,
  setFilterBrandStorage,
  filterBrandsCategoryStorage,
  setFilterBrandsCategoryStorage,
}) => {
  return (
    <Swiper modules={[FreeMode, Navigation]}       
      freeMode={true} 
      slidesPerView="auto" 
      spaceBetween={15} 
      className="p-4"
      style={{ width: "100%" }}
      >
      {items?.map((item, index) => {
        return (
          <SwiperSlide key={index} style={{ width: "auto" }}>
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
        );
      })}
    </Swiper>
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

  if (!parentItem || !Array.isArray(parentItem.categories)) return null;


  const onClick = (item, idBrand) => {

    if (searchType === "brand" && clickType === "brandCategories") {
    
      // Check if the brand already exists in the storage
      const brandExists = (filterBrandsCategoryStorage || []).some(
        (member) => member.idBrand === idBrand
      );
    

      let newValIDCat;
      let newValIDBrand;
    
      if (brandExists) {
        // If the brand exists, update the list of categories
        const existingBrand = filterBrandsCategoryStorage.find(
          (member) => member.idBrand === idBrand
        );
    
        // Check if the category already exists in the list for the specific brand
        const categoryExists = existingBrand.idCategories.includes(item.idCategory);
    
        if (categoryExists) {
          // Remove the category if it's already active
          newValIDCat = existingBrand.idCategories.filter(
            (category) => category !== item.idCategory
          );
        } else {
          // Add the category if it's not already active
          newValIDCat = [...existingBrand.idCategories, item.idCategory];
        }
    
        // Update the storage by removing the old entry and replacing it with the new list of categories
        setFilterBrandsCategoryStorage((prevState) =>
          prevState.map((member) =>
            member.idBrand === idBrand
              ? { ...member, idCategories: newValIDCat }
              : member
          ).filter((member) => member.idCategories.length > 0) // Filter out brands with no categories
        );
      } else {
        // If the brand doesn't exist, create a new entry with the category
        newValIDCat = [item.idCategory];
    
        setFilterBrandsCategoryStorage((prevState) => [
          ...prevState,
          { idBrand: idBrand, idCategories: newValIDCat }
        ]);
      }
    
    }
    
    

  
    }
  




  const isActive = filterBrandStorage.includes(parentItem.idBrand)

  return (
    <>
    {
    isActive &&
    <div className="border-2 flex items-center border-gray-300 p-2 rounded-lg flex flex-col gap-2">
      {/* Categories Row */}
      <div className="flex flex-row gap-2 justify-center">
        {parentItem.categories.map((category, index) => {

          const isActiveBorder = filterBrandsCategoryStorage.some(
            (member) => 
              member.idBrand === parentItem.idBrand && 
              member.idCategories.includes(category.idCategory) // Check if category is in the list of categories for the brand
          );


            return (
              <div 
              key={index} 
              className="text-sm w-[80px] flex flex-col items-center cursor-pointer"
              onClick={() => onClick(category, parentItem.idBrand)}
              >
                <div
                  className={`flex w-[60px] h-[60px] rounded-full overflow-hidden border-2
                  ${isActiveBorder ? "border-green-400" : "border-gray-500"}`}
                >
                  <img className="w-full h-full object-cover" src={category.image} alt={category.title} />
                </div>
  
                <span 
                className="cursor-pointer text-center whitespace-nowrap" 
                // onClick={onClick}
                >
                  {category.title}
                </span>
                
            </div>
            
            )

        }
        
        )}
        
      </div>
      <div className='flex flex-row items-stretch'>
        <span>برند: {parentItem.title}</span>
      </div>
    </div>
    }
    </>
  );
}

export default SliderComponentCategories;
