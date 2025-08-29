import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
// import { SingleCategoryGroupCM } from '../SingleCategoryGroupCM';


const SliderComponentCategoriesCM = ({ 
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
    <Swiper modules={[FreeMode]} slidesPerView="auto" spaceBetween={15} className="p-4">
      {items?.map((item, index) => {
        return (
          <SwiperSlide key={index} style={{ width: "auto" }}>
            <SingleCategoryGroupCM 
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
        );
      })}
    </Swiper>
  );
};


export function SingleCategoryGroupCM({ 
  parentItem, 
  searchType,
  clickType, 
  tab,
  filterCategoryStorage,
  setFilterCategoryStorage,
  filterCategorySubCategoryStorage,
  setFilterCategorySubCategoryStorage,
  filterCategorySubCategoryBrandsStorage,
  setFilterCategorySubCategoryBrandsStorage,
}) {

  if (!parentItem || !Array.isArray(parentItem.subCategories)) return null;


  const onClick = (item) => {


    if (clickType === "categories") {

      const isActive = filterCategoryStorage?.includes(item.idCategory) ?? false; // Check if brand is selected


    const newVal = isActive
    ? filterCategoryStorage?.filter((idCategory) => idCategory !== item.idCategory) // Remove if active
    : item.idCategory; // Add if inactive
    

    const exists = filterCategoryStorage?.includes(item.idCategory) ?? false; // Check if the category is already selected

    if (exists) {
      // If the item is active, remove it from the list
      setFilterCategoryStorage(prevState => prevState.filter(id => id !== item.idCategory));
    } else {
      // If it's inactive, add it to the list
      setFilterCategoryStorage(prevState => [...prevState, item.idCategory]);
    }
    
  }
}


  const isActive = filterCategoryStorage.includes(parentItem.idCategory)



return (
    <>
          <div className="flex flex-col w-fit">
            {(
              <div className="w-full">
                <div
                  className={`flex flex-col w-[80px] h-full items-center justify-center flex-shrink-0`}
                  onClick={() => onClick(parentItem)}
                  >
                  <div
                    className={`flex cursor-pointer w-[70px] h-[70px] rounded-full overflow-hidden border-[3px] border-solid ${
                      isActive ? "border-green-400" : "border-gray-500"
                    }`}
                  >
                    <img className="w-full h-full object-cover" src={parentItem.image} alt={parentItem.title} />
                  </div>
                  <div>
                    <span className="cursor-pointer text-center whitespace-nowrap">
                      {parentItem.title ? parentItem.title : null}
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>

               
    </>
  );
}

export default SliderComponentCategoriesCM;
