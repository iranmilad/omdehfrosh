import React from 'react'
import ProductCarousel from '../../../../components/productCarousel'
import { useParams } from 'react-router'
import { useData } from '../../../../Libs/api';
import { shallowEqual } from '@mantine/hooks';

function RelatedProducts() {
  const {slug} = useParams();
  const {isLoading,data} = useData({url: "/product/related",queryKey: ['product-related',slug],params:{slug}});

  if(isLoading && !data) return;
  return (
    <div className='mt-10'>
      <ProductCarousel style={{marginTop: "20px"}} items={data} title="محصولات مرتبط" />
    </div>
  )
}

const MemoizedProducts = React.memo(RelatedProducts,(prev,next) => {
  return shallowEqual(prev,next);
})

export default RelatedProducts