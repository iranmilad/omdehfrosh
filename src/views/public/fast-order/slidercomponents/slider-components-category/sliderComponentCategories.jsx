import { useNavigate } from 'react-router';
import { FreeMode, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useCategoryRowSelection } from '../../CategoryRowSelectionContext';

// ... (keep DEFAULT_CATEGORY_IMAGE as is)

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

  const { checkedRows } = useCategoryRowSelection();
  const navigate = useNavigate(); // Add this

  console.log("SliderComponentCategoriesCM rendered with items:", items);
  
  const isSlideSelectionActive = checkedRows.size > 0;

  const handleSelectAll = () => {
    if (clickType === "categories") {
      const allCategoryIds = items?.map(item => item.idCategory) || [];
      const allSelected = allCategoryIds.every(id => filterCategoryStorage.includes(id));
      
      if (allSelected) {
        setFilterCategoryStorage([]);
        navigate('/fastorder/category'); // Navigate to base category page
      } else {
        setFilterCategoryStorage(allCategoryIds);
      }
    }
  };

  const allCategoryIds = items?.map(item => item.idCategory) || [];
  const allSelected = allCategoryIds.length > 0 && allCategoryIds.every(id => filterCategoryStorage.includes(id));

  return (
    <Swiper 
      modules={[FreeMode, Navigation]}       
      freeMode={true} 
      slidesPerView="auto" 
      spaceBetween={4}
      style={{ width: "100%" }}
    >
      {items?.map((item, index) => (
        <SwiperSlide 
          key={index} 
          style={{ width: "auto", display: "flex", margin: 0, padding: 0 }}
        >
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
            isDisabled={isSlideSelectionActive}
            navigate={navigate} // Pass navigate down
          />
        </SwiperSlide>
      ))}

      <SwiperSlide style={{ width: "auto", display: "flex", margin: 0, padding: 0 }}>
        {/* Select All Button commented out */}
      </SwiperSlide>
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
  isDisabled,
  navigate // Add this prop
}) {
  if (!parentItem || !Array.isArray(parentItem.subCategories)) return null;

  const onClick = () => {
    if (isDisabled) return;
    const isActive = filterCategoryStorage.includes(parentItem.idCategory);
    
    if (isActive) {
      // Deselecting - go back to base category page
      setFilterCategoryStorage([]);
      navigate('/fastorder/category');
    } else {
      // Selecting - update URL with category name
      setFilterCategoryStorage([parentItem.idCategory]);
      navigate(`/fastorder/category/${parentItem.name}`);
    }
  };

  const getCategoryImageSrc = (image) => {
    if (image && image.trim() !== '') {
      return image;
    }
    return DEFAULT_CATEGORY_IMAGE;
  };

  const handleImageError = (e) => {
    e.target.src = DEFAULT_CATEGORY_IMAGE;
  };

  const isActive = filterCategoryStorage.includes(parentItem.idCategory);

  return (
    <div className="flex items-center justify-center">
      <div
        className={`flex flex-row justify-center items-center w-fit bg-gray-100 px-4 gap-2 h-[35px] overflow-hidden border-[1.5px]
          ${!isDisabled && isActive ? "border-red-600" : "border-none"}
          ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        style={{ borderRadius: '18px' }}
        onClick={onClick}
      >
        <img 
          className="w-full h-[25px] object-cover" 
          src={getCategoryImageSrc(parentItem.image)} 
          alt={parentItem.title} 
          onError={handleImageError}
        />
        <span className="cursor-pointer text-[8px] whitespace-nowrap ml-1">
          {parentItem.title}
        </span>
      </div>
    </div>
  );
}

export default SliderComponentCategoriesCM;