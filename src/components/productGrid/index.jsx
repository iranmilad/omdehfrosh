import React, { useState } from 'react';

// Utility function to check if image path is valid
const isValidImagePath = (imagePath) => {
  return imagePath && 
         typeof imagePath === 'string' && 
         imagePath.trim() !== '' &&
         (imagePath.startsWith('http') || imagePath.startsWith('/'));
};

// Default placeholder image component
const PlaceholderImage = ({ className = "" }) => (
  <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
    <svg 
      width="32" 
      height="32" 
      viewBox="0 0 24 24" 
      fill="none" 
      className="text-gray-400"
    >
      <path 
        d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z" 
        fill="currentColor"
      />
    </svg>
  </div>
);

// Enhanced Image component with error handling
const SafeImage = ({ src, alt, className = "", onError, onLoad }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if image path is valid initially
  const isValidPath = isValidImagePath(src);

  const handleImageError = (e) => {
    setImageError(true);
    setIsLoading(false);
    if (onError) onError(e);
  };

  const handleImageLoad = (e) => {
    setIsLoading(false);
    if (onLoad) onLoad(e);
  };

  // If path is invalid or image failed to load, show placeholder
  if (!isValidPath || imageError) {
    return <PlaceholderImage className={className} />;
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`} />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
    </div>
  );
};

// Product Card Component
const ProductCard = ({ item, categoryTitle }) => {
  return (
    <a 
      href={`/product/${item.url}`}
      className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100 hover:scale-105 transform transition-transform"
    >
      {/* Smaller image container with responsive heights */}
      <div className="h-32 sm:h-36 md:h-40 lg:h-44">
        <SafeImage
          src={item.image}
          alt={`${categoryTitle} - ${item.url}`}
          className="w-full h-full object-contain bg-white"
        />
      </div>

    </a>
  );
};

const ProductGrid = ({ items = [] }) => {

  const validCategories = items.filter(category => 
    category.children && category.children.length > 0
  );

  if (validCategories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">هیچ محصولی یافت نشد</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        کاتالوگ محصولات
      </h1>
      
      {validCategories.map((category) => (
        <section key={category.url} className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              {category.title}
            </h2>
            <a 
              href={`/category/${category.url}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200 flex items-center gap-1"
            >
              مشاهده همه
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="rotate-180">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {category.children.map((item, index) => (
              <ProductCard
                key={`${item.url}-${index}`}
                item={item}
                categoryTitle={category.title}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default ProductGrid;