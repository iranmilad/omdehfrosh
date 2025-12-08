import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

// Default SVG image for brands when image is null or empty
const DEFAULT_BRAND_IMAGE = 'data:image/svg+xml;base64,' + btoa(`
<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle -->
  <circle cx="20" cy="20" r="20" fill="#F8F9FA"/>
  <!-- Brand/tag icon -->
  <path d="M12 14 L22 14 C23.1 14 24 14.9 24 16 L24 24 C24 25.1 23.1 26 22 26 L12 26 C10.9 26 10 25.1 10 24 L10 16 C10 14.9 10.9 14 12 14 Z" fill="#E9ECEF" stroke="#ADB5BD" stroke-width="1"/>
  <!-- Star/brand symbol -->
  <path d="M17 18 L18 21 L21 21 L18.5 22.5 L19.5 25.5 L17 24 L14.5 25.5 L15.5 22.5 L13 21 L16 21 L17 18 Z" fill="#6C757D"/>
</svg>
`);

const SliderComponentBrandsCMFastOrder = ({ 
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
  // Get selected category (assuming one at a time)
  const selectedCategoryID = filterCategoryStorage?.[0];

  // Get selected subcategory IDs for the selected category
  const selectedSubCategoryIDs = filterCategorySubCategoryStorage?.find(
    (entry) => entry.idCategory === selectedCategoryID
  )?.idSubCategories || [];

  // Filter items (brands) that have at least one matching subcategory
  const filteredItems = items?.map((brand) => {
    const filteredSubCategories = brand.subCategories?.filter((sub) =>
      selectedSubCategoryIDs.includes(sub.idSubCategory)
    ) || [];

    return {
      ...brand,
      subCategories: filteredSubCategories,
    };
  }).filter((brand) => brand.subCategories.length > 0);

  return (
    <Swiper 
      modules={[FreeMode]} 
      slidesPerView="auto" 
      spaceBetween={6}
      className="mt-2"
      style={{ width: "100%" }}
    >
      {filteredItems?.map((item) => (
        <SwiperSlide 
          key={item.idBrand} 
          style={{ width: "auto", display: "flex", margin: 0, padding: 0 }}
        >
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
      const updatedCategories = prevSelected.map(category => ({
        ...category,
        idSubCategories: [...category.idSubCategories],
        idBrands: category.idBrands.map(brandEntry => ({
          ...brandEntry,
          idBrands: [...brandEntry.idBrands]
        }))
      }));

      const categoryIndex = updatedCategories.findIndex(c => c.idCategory === parentItem.id);

      if (categoryIndex !== -1) {
        const category = updatedCategories[categoryIndex];
        const subCategoryIndex = category.idBrands.findIndex(sb => sb.idSubCategory === subcategory.idSubCategory);

        if (subCategoryIndex !== -1) {
          const brandList = category.idBrands[subCategoryIndex].idBrands;
          if (brandList.includes(brand.idBrand)) {
            category.idBrands[subCategoryIndex].idBrands = brandList.filter(b => b !== brand.idBrand);
            if (category.idBrands[subCategoryIndex].idBrands.length === 0) {
              category.idBrands.splice(subCategoryIndex, 1);
              category.idSubCategories = category.idSubCategories.filter(id => id !== subcategory.idSubCategory);
            }
          } else {
            category.idBrands[subCategoryIndex].idBrands.push(brand.idBrand);
          }
        } else {
          category.idSubCategories.push(subcategory.idSubCategory);
          category.idBrands.push({
            idSubCategory: subcategory.idSubCategory,
            idBrands: [brand.idBrand],
          });
        }

        if (category.idBrands.length === 0) {
          updatedCategories.splice(categoryIndex, 1);
        }
      } else {
        updatedCategories.push({
          idCategory: parentItem.id,
          idSubCategories: [subcategory.idSubCategory],
          idBrands: [{
            idSubCategory: subcategory.idSubCategory,
            idBrands: [brand.idBrand],
          }],
        });
      }

      return updatedCategories;
    });
  };

  const isBorderActive = (subcategory, brand) => {
    return filterCategorySubCategoryBrandsStorage.some(category =>
      category.idBrands.some(sb =>
        sb.idSubCategory === subcategory.idSubCategory &&
        sb.idBrands.includes(brand.idBrand)
      )
    );
  };

  const handleSelectAllForSubcategory = (subcategory, parentItem) => {
    const subcategoryBrands = subcategory.brands.map(brand => brand.idBrand);
    const allSelected = subcategoryBrands.every(brandId =>
      filterCategorySubCategoryBrandsStorage.some(category =>
        category.idBrands.some(sb =>
          sb.idSubCategory === subcategory.idSubCategory &&
          sb.idBrands.includes(brandId)
        )
      )
    );

    setFilterCategorySubCategoryBrandsStorage(prevSelected => {
      const updatedCategories = prevSelected.map(category => ({
        ...category,
        idSubCategories: [...category.idSubCategories],
        idBrands: category.idBrands.map(brandEntry => ({
          ...brandEntry,
          idBrands: [...brandEntry.idBrands]
        }))
      }));

      const categoryIndex = updatedCategories.findIndex(c => c.idCategory === parentItem.id);

      if (allSelected) {
        if (categoryIndex !== -1) {
          const category = updatedCategories[categoryIndex];
          const subCategoryIndex = category.idBrands.findIndex(sb => sb.idSubCategory === subcategory.idSubCategory);
          
          if (subCategoryIndex !== -1) {
            category.idBrands.splice(subCategoryIndex, 1);
            category.idSubCategories = category.idSubCategories.filter(id => id !== subcategory.idSubCategory);
            if (category.idBrands.length === 0) updatedCategories.splice(categoryIndex, 1);
          }
        }
      } else {
        if (categoryIndex !== -1) {
          const category = updatedCategories[categoryIndex];
          const subCategoryIndex = category.idBrands.findIndex(sb => sb.idSubCategory === subcategory.idSubCategory);
          
          if (subCategoryIndex !== -1) {
            category.idBrands[subCategoryIndex].idBrands = [...subcategoryBrands];
          } else {
            if (!category.idSubCategories.includes(subcategory.idSubCategory)) {
              category.idSubCategories.push(subcategory.idSubCategory);
            }
            category.idBrands.push({
              idSubCategory: subcategory.idSubCategory,
              idBrands: [...subcategoryBrands],
            });
          }
        } else {
          updatedCategories.push({
            idCategory: parentItem.id,
            idSubCategories: [subcategory.idSubCategory],
            idBrands: [{
              idSubCategory: subcategory.idSubCategory,
              idBrands: [...subcategoryBrands],
            }],
          });
        }
      }

      return updatedCategories;
    });
  };

  const areAllBrandsSelectedInSubcategory = (subcategory) => {
    const subcategoryBrands = subcategory.brands.map(brand => brand.idBrand);
    return subcategoryBrands.length > 0 && subcategoryBrands.every(brandId =>
      filterCategorySubCategoryBrandsStorage.some(category =>
        category.idBrands.some(sb =>
          sb.idSubCategory === subcategory.idSubCategory &&
          sb.idBrands.includes(brandId)
        )
      )
    );
  };

  // Helper function to get brand image source with fallback
  const getBrandImageSrc = (image) => {
    // Check if image exists and is not empty
    if (image && image.trim() !== '') {
      return image;
    }
    // Return default placeholder
    return DEFAULT_BRAND_IMAGE;
  };

  // Handle image error by setting default placeholder
  const handleImageError = (e) => {
    e.target.src = DEFAULT_BRAND_IMAGE;
  };

  return (
    <div className="flex flex-col gap-4">
      {parentItem?.subCategories.map((subcategory, subcategoryIndex) => (
        <div key={subcategoryIndex} className="flex flex-col gap-2">
          <div className="flex flex-row flex-wrap gap-2">
            {subcategory.brands.map((brand, brandIndex) => (
              <div key={`${subcategoryIndex}-${brandIndex}`} className="flex-shrink-0">
                <div
                  className="flex flex-col gap-1 items-center justify-center cursor-pointer"
                  onClick={() => onClick(subcategory, brand, parentItem)}
                >
                  <div
                    className={`flex w-full h-[35px] px-3 gap-2 justify-center items-center overflow-hidden border-[1.5px] bg-gray-100 ${
                      isBorderActive(subcategory, brand) ? "border-gray-400" : "border-none"
                    }`}
                    style={{ borderRadius: '18px' }}
                  >
                    <div className='w-[20px] h-[20px] bg-white rounded-full flex-shrink-0'>
                      <img  
                        className="w-full h-full object-cover"
                        src={getBrandImageSrc(brand.image)}
                        alt={brand.name}
                        onError={handleImageError}
                      />
                    </div>
                    <span className="cursor-pointer text-xs leading-none whitespace-nowrap">
                      {brand.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {subcategory.brands && subcategory.brands.length > 0 && (
              <div className="flex-shrink-0">
                <button
                  className={`flex h-[35px] px-3 gap-2 justify-center items-center border-2 ${
                    areAllBrandsSelectedInSubcategory(subcategory) 
                      ? "border-green-400 bg-green-50" 
                      : "border-none bg-gray-100"
                  }`}
                  style={{ borderRadius: '18px' }}
                  onClick={() => handleSelectAllForSubcategory(subcategory, parentItem)}
                >
                  <span className="text-xs leading-none font-medium whitespace-nowrap">
                    انتخاب همه
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default SliderComponentBrandsCMFastOrder;