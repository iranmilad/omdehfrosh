import React, { useState, useEffect } from "react";
import ProductCarousel from "../../../../components/productCarousel";
import { shallowEqual } from "@mantine/hooks";

function RelatedProducts({ slug, dataRelatedProducts }) {

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Use dataRelatedProducts if available, otherwise fetch from API
  useEffect(() => {
    if (dataRelatedProducts && Array.isArray(dataRelatedProducts) && dataRelatedProducts.length > 0) {
      // Use the provided data
      setData(dataRelatedProducts);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (!slug) return;

    // Fallback to API call if no data provided
    const fetchRelatedProducts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/product/related/${slug}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(Array.isArray(result) ? result : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [slug, dataRelatedProducts]);

  // Transform data to match ProductCarousel expected format if needed
  const transformedData = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(product => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      regularPrice: product.regularPrice,
      discountedPrice: product.discountedPrice,
      discountPercent: product.discountPercent,
      image: product.image,
      // Add any other fields that ProductCarousel expects
    }));
  }, [data]);

  // Loading state
  if (isLoading) {
    return (
      <div className="mt-10">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
          <div className="flex gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-48 h-64 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state - you might want to handle this silently or show a message
  if (error) {
    return null; // Silently fail
  }

  // Don't render if no data or empty array
  if (!transformedData || transformedData.length === 0) {
    return null;
  }

  return (
    <div className="mt-10">
      <ProductCarousel
        style={{ marginTop: "20px" }}
        items={transformedData}
        title="محصولات مرتبط"
      />
    </div>
  );
}

// Optimized memo comparison
const MemoizedProducts = React.memo(RelatedProducts, (prev, next) => {
  // Only re-render if props actually changed
  return (
    prev.slug === next.slug && 
    shallowEqual(prev.dataRelatedProducts, next.dataRelatedProducts)
  );
});

export default MemoizedProducts;