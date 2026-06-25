import { useNavigate } from 'react-router';
import { useRef, useState } from 'react';
import { FreeMode, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useCategoryRowSelection } from '../../CategoryRowSelectionContext';
import SliderArrows from '../SliderArrows';
import SliderPillImage from '../SliderPillImage';
import { useSliderPillFontSize } from '../useSliderPillFontSize';

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
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(true);

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

  const ROW_HEIGHT = 48;
  return (
    <div style={{ position: 'relative', width: '100%', minHeight: ROW_HEIGHT, display: 'flex', alignItems: 'center' }}>
      <div style={{ flex: 1, minWidth: 0, height: ROW_HEIGHT, display: 'flex', alignItems: 'center' }}>
      <Swiper
        modules={[FreeMode, Navigation]}
        freeMode={true}
        slidesPerView="auto"
        spaceBetween={8}
        className="!mt-0"
        style={{ width: "100%" }}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        onInit={(swiper) => {
          if (swiper.isBeginning !== isBeginning) setIsBeginning(swiper.isBeginning);
          if (swiper.isEnd !== isEnd) setIsEnd(swiper.isEnd);
        }}
        onProgress={(swiper) => {
          if (swiper.isBeginning !== isBeginning) setIsBeginning(swiper.isBeginning);
          if (swiper.isEnd !== isEnd) setIsEnd(swiper.isEnd);
        }}
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
      </div>
      {items && items.length > 0 && <SliderArrows prevRef={prevRef} nextRef={nextRef} isBeginning={isBeginning} isEnd={isEnd} />}
    </div>
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
  const pillFontSize = useSliderPillFontSize();

  if (!parentItem || !Array.isArray(parentItem.subCategories)) return null;

  const onClick = (e) => {

    
    if (isDisabled) {
      return;
    }
    
    // Set manual filter update flag to prevent URL sync from overriding during navigation
    sessionStorage.setItem('manualFilterUpdate', 'true');
    
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
    
    // Clear the flag after navigation has settled
    setTimeout(() => {
      sessionStorage.removeItem('manualFilterUpdate');
    }, 300);
  };

  const isActive = filterCategoryStorage.includes(parentItem.idCategory);

  return (
    <div className="flex flex-col">
      <div className="w-full">
        <div
          className={`flex items-center justify-center whitespace-nowrap
            ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          style={{
            height: '40px',
            paddingTop: '4px',
            paddingBottom: '4px',
            paddingLeft: '8px',
            paddingRight: '4px',
            backgroundColor: 'rgb(247, 247, 248)',
            borderRadius: '100px',
            border: !isDisabled && isActive 
              ? '0.666667px solid rgb(9, 54, 114)' 
              : '0.666667px solid rgb(250, 250, 250)',
            fontSize: pillFontSize,
            fontWeight: !isDisabled && isActive ? 700 : 400,
            color: 'rgb(77, 80, 83)',
            gap: '8px',
            flexDirection: 'row'
          }}
          onClick={onClick}
        >
          <SliderPillImage image={parentItem.image} alt={parentItem.title} />
          <span className="leading-none">
            {parentItem.title}
          </span>
        </div>
      </div>
    </div>
  );
}

export default SliderComponentCategoriesCMFastOrder;