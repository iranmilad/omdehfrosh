import { useNavigate } from 'react-router';
import { FreeMode, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useCategoryRowSelection } from '../../CategoryRowSelectionContext';

// Default SVG image for categories when image is null or empty
const DEFAULT_CATEGORY_IMAGE = 'data:image/svg+xml;base64,' + btoa(`
<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle -->
  <circle cx="20" cy="20" r="20" fill="#F8F9FA"/>
  <!-- Category icon -->
  <rect x="10" y="10" width="20" height="20" rx="2" fill="#E9ECEF" stroke="#ADB5BD" stroke-width="1"/>
  <rect x="13" y="13" width="6" height="6" rx="1" fill="#9CA3AF"/>
  <rect x="21" y="13" width="6" height="6" rx="1" fill="#9CA3AF"/>
  <rect x="13" y="21" width="6" height="6" rx="1" fill="#9CA3AF"/>
  <rect x="21" y="21" width="6" height="6" rx="1" fill="#9CA3AF"/>
</svg>
`);

const SliderComponentCategoriesCMFastOrder = ({ 
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
  const navigate = useNavigate();

  console.log("SliderComponentCategoriesCM rendered with items:", items);
  
  const isSlideSelectionActive = checkedRows.size > 0;

  const handleSelectAll = () => {
    if (clickType === "categories") {
      const allCategoryIds = items?.map(item => item.idCategory) || [];
      const allSelected = allCategoryIds.every(id => filterCategoryStorage.includes(id));
      
      if (allSelected) {
        setFilterCategoryStorage([]);
        navigate('/fastorder/category');
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
      spaceBetween={6}
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
            navigate={navigate}
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
  navigate
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
        className={`flex flex-row justify-center items-center w-fit bg-gray-100 px-3 gap-2 h-[35px] overflow-hidden border-[1.5px]
          ${!isDisabled && isActive ? "border-gray-400" : "border-none"}
          ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        style={{ borderRadius: '18px' }}
        onClick={onClick}
      >
        <div className='w-[20px] h-[20px] bg-white rounded-full flex-shrink-0'>
          <img 
            className="w-full h-full object-cover" 
            src={getCategoryImageSrc(parentItem.image)} 
            alt={parentItem.title} 
            onError={handleImageError}
          />
        </div>
        <span className="cursor-pointer text-xs leading-none whitespace-nowrap">
          {parentItem.title}
        </span>
      </div>
    </div>
  );
}

export default SliderComponentCategoriesCMFastOrder;