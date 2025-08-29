import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { SingleCategoryWithSubcategories } from '../SingleCategoryWithSubcategories';


const SliderComponentSubCategoriesCM = ({ 
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

  
  return (
    <Swiper modules={[FreeMode]}       freeMode={true} 
    slidesPerView="auto" spaceBetween={15} className="p-4">
      {items?.map((item, index) => (
        <SwiperSlide key={index} style={{ width: "auto" }}>
          <SingleCategoryWithSubcategories 
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
  );
};


export function SingleCategoryWithSubcategories({ 
  parentItem, 
  clickType,
  searchType,
  tab,
  filterCategoryStorage,
  setFilterCategoryStorage,
  filterCategorySubCategoryStorage,
  setFilterCategorySubCategoryStorage,
  filterCategorySubCategoryBrandsStorage,
  setFilterCategorySubCategoryBrandsStorage,
}) {


  if (!parentItem || !Array.isArray(parentItem.subCategories)) return null;


  const onClick = (item, idCategory) => {


    if (searchType === "category" && clickType === "categorySubCategories") {
      setFilterCategorySubCategoryStorage((prevState) => {
        const safePrevState = prevState || [];
    
        // Find the category entry in the state
        const categoryEntry = safePrevState.find((entry) => entry.idCategory === idCategory);
    
        if (categoryEntry) {
          // Check if the subcategory already exists
          const subCategoryExists = categoryEntry.idSubCategories.includes(item.idSubCategory);
    
          if (subCategoryExists) {
            // Remove subcategory (toggle off)
            categoryEntry.idSubCategories = categoryEntry.idSubCategories.filter(
              (subId) => subId !== item.idSubCategory
            );
    
            // If no subcategories left, remove the category entry
            if (categoryEntry.idSubCategories.length === 0) {
              return safePrevState.filter((entry) => entry.idCategory !== idCategory);
            }
          } else {
            // Add subcategory
            categoryEntry.idSubCategories.push(item.idSubCategory);
          }
    
          return [...safePrevState];
        } else {
          // Add new category with its first subcategory
          return [...safePrevState, { idCategory, idSubCategories: [item.idSubCategory] }];
        }
      });
    }
    
    
    
    
  
    }
  
  
  const isActive = filterCategoryStorage.includes(parentItem.idCategory);



  return (
    <>
      {parentItem?.subCategories?.length > 0 && isActive && (
        <div className="border-2 border-gray-300 p-4 rounded-lg flex flex-col gap-3 items-center justify-center">
          {/* Categories */}
          <div className='flex flex-row gap-2 items-center justify-center'>
          {parentItem.subCategories.map((subcategory, subIndex) => {
            
            
          const isActiveBorder = filterCategorySubCategoryStorage.some(
            (member) => 
              member.idCategory === parentItem.idCategory &&
              member.idSubCategories.includes(subcategory.idSubCategory) // ✅ Fixed here
          );
          

  
            return (
              <div key={subIndex} className=" p-3 rounded-lg">
                {/* Subcategories Row */}
                <div className="flex flex-row gap-2 justify-center">
                  <div
                    className="text-sm w-[80px] flex flex-col items-center cursor-pointer"
                    onClick={() => onClick(subcategory, parentItem.idCategory)}
                  >
                    <div
                      className={`flex w-[60px] h-[60px] rounded-full overflow-hidden border-2
                      ${isActiveBorder ? "border-green-400" : "border-gray-500"}`}
                    >
                      <img 
                        className="w-full h-full object-cover" 
                        src={subcategory.image || "https://via.placeholder.com/60"} 
                        alt={subcategory.name} 
                      />
                    </div>
                    <span className="text-center whitespace-nowrap">
                      {subcategory.name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
          <div>
            <span>دسته بندی: {parentItem.title}</span>
          </div>
        </div>
        
      )}

    </>
  );
  
}


export default SliderComponentSubCategoriesCM;