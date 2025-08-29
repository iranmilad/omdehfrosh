import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
// import { SingleCategory1 } from "../SlideCategory";


const SliderComponentBrands = ({ 
  items, 
  clickType, 
  searchType, 
  tab, 
  filterBrandStorage, 
  setFilterBrandStorage 
}) => {
    return (
        <Swiper modules={[FreeMode]} slidesPerView="auto">
          {items?.map((item, index) => {

            // Check if the item is active based on the selected brands
            // const isActive = clickType === "parentBrand" ? 
            // (tab?.clickedBrands ? tab.clickedBrands.includes(item.idBrand) : false) :
            // null;
          
            

            return (
              <SwiperSlide key={item.idBrand} style={{ width: "80px", textAlign: "center" }}>
                {
                  <SingleCategory1
                    item={item}
                    // onClick={onClick} // Pass the item itself to the onClick function
                    // active={isActive}
                    clickType={clickType}
                    searchType={searchType}
                    tab={tab}
                    filterBrandStorage={filterBrandStorage}
                    setFilterBrandStorage={setFilterBrandStorage}
                  /> 
                } 
              </SwiperSlide>
            );
          })}
        </Swiper>
    )
}

      export function SingleCategory1({ 
        size = "md", 
        image, 
        title, 
        searchType, 
        filterBrandStorage, 
        setFilterBrandStorage, 
        tab, 
        item, 
        idBrand, 
        badge, 
        clickType, 
        active, 
        categories, 
        items 
      }) {

        const borderColor = active === true ? 'border-green-500' : 'border-gray-300';

        const onClick = (item) => {


          if (clickType === "brands") {

            const isActive = tab["clickedBrands"]?.includes(item.idBrand) ?? false; // Check if brand is selected
            // Toggle the item in the selected brands list


          const newVal = isActive
          ? tab["clickedBrands"]?.filter((idBrand) => idBrand !== item.idBrand) // Remove if active
          : item.idBrand; // Add if inactive
          


          const exists = filterBrandStorage.includes(newVal) ?? false;

          if (exists) {
           return setFilterBrandStorage(filterBrandStorage => filterBrandStorage.filter(id => id !== newVal));
          } else {
           return setFilterBrandStorage(filterBrandStorage => [...filterBrandStorage, newVal])
          }
          
        }
      }
                

        const isActive = filterBrandStorage.includes(item.idBrand)

        
        return (
          <div className="flex flex-col w-fit">
            {!badge && !categories && (
              <div className="w-full">
                <div
                  className={`flex flex-col w-[80px] h-full items-center justify-center flex-shrink-0`}
                  onClick={() => onClick(item)}
                  >
                  <div
                    className={`flex cursor-pointer w-[70px] h-[70px] rounded-full overflow-hidden border-[3px] border-solid ${
                      isActive ? "border-green-400" : "border-gray-500"
                    }`}
                  >
                    <img className="w-full h-full object-cover" src={item.image} alt={item.title} />
                  </div>
                  <div>
                    <span className="cursor-pointer">
                      {item.title ? item.title : null}
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>

        );
      }


export default SliderComponentBrands;