import { FreeMode, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

// SVG icon created using data URL - Subcategory placeholder with folder icon
const DEFAULT_SUBCATEGORY_PLACEHOLDER = 'data:image/svg+xml;base64,' + btoa(`
<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="20" fill="#F3F4F6"/>
  <path d="M11 14h6l2 2h10v12H11V14z" fill="#D1D5DB" stroke="#9CA3AF" stroke-width="1" stroke-linejoin="round"/>
  <path d="M11 18h18v10H11V18z" fill="#E5E7EB"/>
  <circle cx="16" cy="22" r="1" fill="#9CA3AF"/>
  <circle cx="20" cy="22" r="1" fill="#9CA3AF"/>
  <circle cx="24" cy="22" r="1" fill="#9CA3AF"/>
</svg>
`);

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
    <Swiper
      modules={[FreeMode, Navigation]}
      freeMode={true}
      slidesPerView="auto"
      spaceBetween={6}
      style={{ width: "100%" }}
    >
      {items?.map((item, index) => (
        <SwiperSlide
          key={index}
          style={{
            width: "auto",
            display: "flex",
            margin: 0,
            padding: 0
          }}
        >
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
      // Find existing entry for this category
      const existingCategoryIndex = filterCategorySubCategoryStorage.findIndex(
        (entry) => entry.idCategory === idCategory
      );
      
      if (existingCategoryIndex !== -1) {
        // Category exists, check if the same subcategory is already selected
        const existingEntry = filterCategorySubCategoryStorage[existingCategoryIndex];
        const isSubcategorySelected = existingEntry.idSubCategories.includes(item.idSubCategory);
        
        if (isSubcategorySelected) {
          // If clicking the same subcategory, deselect it (remove entire category entry)
          const newStorage = filterCategorySubCategoryStorage.filter(
            (_, index) => index !== existingCategoryIndex
          );
          setFilterCategorySubCategoryStorage(newStorage);
        } else {
          // If clicking a different subcategory, replace the current selection
          const newStorage = [...filterCategorySubCategoryStorage];
          newStorage[existingCategoryIndex] = {
            ...existingEntry,
            idSubCategories: [item.idSubCategory] // Only one subcategory allowed
          };
          setFilterCategorySubCategoryStorage(newStorage);
        }
      } else {
        // Category doesn't exist, create new entry with single subcategory
        const newEntry = {
          idCategory,
          idSubCategories: [item.idSubCategory]
        };
        setFilterCategorySubCategoryStorage([
          ...filterCategorySubCategoryStorage,
          newEntry
        ]);
      }
    }
  };

  // Helper function to get image source with fallback for subcategories
  const getSubcategoryImageSrc = (image) => {
    if (image && image.trim() !== '') {
      return image;
    }
    return DEFAULT_SUBCATEGORY_PLACEHOLDER;
  };

  // Handle image error by setting default placeholder
  const handleImageError = (e) => {
    e.target.src = DEFAULT_SUBCATEGORY_PLACEHOLDER;
  };

  // Check if parent category is active
  const isActive = Array.isArray(filterCategoryStorage) && 
    filterCategoryStorage.includes(parentItem.idCategory);

  return (
    <>
      {parentItem?.subCategories?.length > 0 && isActive && (
        <div className="flex flex-col mt-2">
          <div className="flex flex-row flex-wrap gap-2">
            {parentItem.subCategories.map((subcategory, subIndex) => {
              // Check if this specific subcategory is selected for this category
              const isActiveBorder = filterCategorySubCategoryStorage.some(
                (entry) =>
                  entry.idCategory === parentItem.idCategory &&
                  entry.idSubCategories.includes(subcategory.idSubCategory)
              );

              return (
                <div
                  key={subIndex}
                  className="text-sm flex-shrink-0 flex items-center cursor-pointer"
                  onClick={() => onClick(subcategory, parentItem.idCategory)}
                >
                  <div
                    className={`flex w-fit flex-row justify-center items-center px-2 h-[35px] bg-gray-100 overflow-hidden border-[1.5px] ${
                      isActiveBorder ? "border-red-600" : "border-none"
                    }`}
                    style={{ borderRadius: '18px' }}
                  >
                    <img
                      className="w-fit h-[25px] object-cover"
                      src={getSubcategoryImageSrc(subcategory.image)}
                      alt={subcategory.name}
                      onError={handleImageError}
                    />
                    <span className="cursor-pointer text-[8px] whitespace-nowrap ml-1">
                      {subcategory.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

export default SliderComponentSubCategoriesCM;