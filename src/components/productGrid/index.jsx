import React, { useState } from 'react';

// Utility function to check if image path is valid
const isValidImagePath = (imagePath) => {
  return imagePath && 
         typeof imagePath === 'string' && 
         imagePath.trim() !== '' &&
         (imagePath.startsWith('http') || imagePath.startsWith('/'));
};

// Enhanced placeholder image component with modern design
const PlaceholderImage = ({ className = "" }) => (
  <div className={`bg-gradient-to-br from-green-50 via-emerald-100 to-teal-200 flex items-center justify-center ${className} rounded-xl relative overflow-hidden group`}>
    {/* Animated background pattern */}
    <div className="absolute inset-0 opacity-30">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
    </div>
    
    {/* Modern product icon */}
    <div className="relative z-10 p-4">
      <svg 
        width="40" 
        height="40" 
        viewBox="0 0 24 24" 
        fill="none" 
        className="text-green-500 group-hover:text-green-600 transition-colors duration-300"
      >
        <path 
          d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="none"
        />
        <path 
          d="M19 12L20.09 16.26L24 17L20.09 17.74L19 22L17.91 17.74L14 17L17.91 16.26L19 12Z" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="none"
          opacity="0.6"
        />
        <path 
          d="M5 5L5.5 7L7 7.5L5.5 8L5 10L4.5 8L3 7.5L4.5 7L5 5Z" 
          fill="currentColor"
          opacity="0.7"
        />
      </svg>
    </div>
    
    {/* Subtle corner accent */}
    <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-emerald-100 to-transparent rounded-bl-2xl opacity-50"></div>
  </div>
);

// Enhanced Image component with advanced loading states
const SafeImage = ({ src, alt, className = "", onError, onLoad }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  if (!isValidPath || imageError) {
    return <PlaceholderImage className={className} />;
  }

  return (
    <div className="relative group">
      {isLoading && (
        <div className={`absolute inset-0 rounded-xl overflow-hidden ${className}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-green-200 via-emerald-300 to-green-200 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -translate-x-full animate-shimmer"></div>
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-all duration-500 rounded-xl group-hover:scale-102 transform`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
    </div>
  );
};

// Premium Product Card Component
const ProductCard = ({ item, categoryTitle, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="group relative">
      <a 
        href={`/product/${item.url}`}
        className="block relative bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-green-100 hover:border-emerald-200 transform hover:-translate-y-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          transform: 'translateZ(0)',
          animationDelay: `${index * 50}ms`,
        }}
      >
        {/* Premium gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-green-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
        
        {/* Image container with advanced effects */}
        <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-green-50 to-emerald-100/50">
          <div className="h-36 sm:h-40 md:h-44 lg:h-48 relative">
            <SafeImage
              src={item.image}
              alt={`${categoryTitle} - ${item.url}`}
              className="w-full h-full object-contain bg-white/80 backdrop-blur-sm p-4 group-hover:p-3 transition-all duration-300"
            />
            
            {/* Floating badge - optional */}
            {index < 3 && (
              <div className="absolute top-3 left-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg transform -translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                جدید
              </div>
            )}
            
            {/* Interactive overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl"></div>
          </div>
        </div>

        {/* Content section with premium styling */}
        <div className="p-5 relative">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {/* Product name or URL as title */}
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors duration-300 truncate mb-1">
                {item.title || item.url}
              </h3>
              
              {/* Category tag */}
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors duration-300">
                {categoryTitle}
              </span>
            </div>
            
            {/* Arrow icon with animation */}
            <div className="w-8 h-8 bg-green-100 group-hover:bg-emerald-500 rounded-full flex items-center justify-center transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-green-600 group-hover:text-white rotate-180">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Bottom accent line */}
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
      </a>
    </div>
  );
};

const ProductGrid = ({ items = [] }) => {
  const validCategories = items.filter(category => 
    category.children && category.children.length > 0
  );

  if (validCategories.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100 flex items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center shadow-lg">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-emerald-500">
              <path d="M3 7h18l-2 10H5L3 7zm0 0L2 4h3m16 3v0m-7 4h.01M9 15h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            هیچ محصولی یافت نشد
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed">
            در حال حاضر محصولی در این بخش موجود نیست
          </p>
          <div className="mt-8 inline-flex items-center gap-2 text-emerald-600 font-medium">
            <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
            به‌زودی محصولات جدید اضافه خواهد شد
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50" dir="rtl">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-700 to-teal-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-400/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
              کاتالوگ محصولات
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100 max-w-3xl mx-auto leading-relaxed font-light">
              مجموعه کاملی از بهترین و با کیفیت‌ترین محصولات را در دسته‌بندی‌های مختلف کشف کنید
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">{validCategories.length} دسته‌بندی</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">
                  {validCategories.reduce((total, cat) => total + cat.children.length, 0)} محصول
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 -mt-10 relative z-10">
        {validCategories.map((category, categoryIndex) => {
          const itemCount = category.children?.length || 0;
          
          const getGridClasses = () => {
            if (itemCount === 1) return 'grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center';
            if (itemCount === 2) return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8';
            if (itemCount === 3) return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6';
            if (itemCount <= 6) return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6';
            return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6';
          };

          return (
            <section 
              key={category.url || categoryIndex} 
              className="mb-20"
              style={{
                animation: `fadeInUp 0.6s ease-out ${categoryIndex * 0.1}s both`
              }}
            >
              {/* Enhanced Category Header */}
              <div className="bg-white rounded-3xl shadow-lg border border-green-100 p-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-50 to-transparent rounded-tr-full"></div>
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                        <path d="M12 2L2 7V17C2 18.1 2.9 19 4 19H20C21.1 19 22 18.1 22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        {category.title}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          {itemCount} محصول
                        </span>
                        <span className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          موجود در انبار
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {itemCount > 8 && (
                    <a 
                      href={`/category/${category.url}`}
                      className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      <span>مشاهده همه</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="rotate-180 group-hover:translate-x-1 transition-transform duration-300">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </a>
                  )}
                </div>
              </div>
              
              {/* Products Grid */}
              <div className={getGridClasses()}>
                {category.children.map((item, index) => (
                  <div 
                    key={`${item.url}-${index}`}
                    className="w-full max-w-sm mx-auto"
                    style={{
                      animation: `fadeInUp 0.6s ease-out ${(index * 0.1) + 0.3}s both`
                    }}
                  >
                    <ProductCard
                      item={item}
                      categoryTitle={category.title}
                      index={index}
                    />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
        
        {/* Premium Footer CTA */}
        <div className="text-center mt-24 pt-16 border-t border-green-200">
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-4">همیشه به‌روز باشید</h3>
              <p className="text-emerald-100 mb-8 text-lg max-w-2xl mx-auto">
                از جدیدترین محصولات و پیشنهادات ویژه مطلع شوید
              </p>
              <button className="bg-white text-emerald-600 font-bold px-10 py-4 rounded-2xl hover:bg-emerald-50 transform hover:scale-105 transition-all duration-300 shadow-lg">
                عضویت در خبرنامه
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .scale-102 {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default ProductGrid;