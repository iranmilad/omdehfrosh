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
  <div className={`bg-gradient-to-br from-emerald-100 via-teal-50 to-green-100 flex items-center justify-center ${className} rounded-2xl relative overflow-hidden group`}>
    {/* Animated background pattern */}
    <div className="absolute inset-0 opacity-40">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1500"></div>
    </div>
    
    {/* Modern product icon */}
    <div className="relative z-10 p-6">
      <svg 
        width="48" 
        height="48" 
        viewBox="0 0 24 24" 
        fill="none" 
        className="text-emerald-500 group-hover:text-emerald-600 transition-all duration-300 drop-shadow-sm"
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
    
    {/* Premium corner accent */}
    <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-emerald-200/60 to-transparent rounded-bl-3xl"></div>
    <div className="absolute bottom-0 left-0 w-8 h-8 bg-gradient-to-tr from-teal-200/50 to-transparent rounded-tr-2xl"></div>
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
        <div className={`absolute inset-0 rounded-2xl overflow-hidden ${className}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-200 via-teal-300 to-emerald-200 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent transform -translate-x-full animate-shimmer"></div>
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-all duration-700 rounded-2xl group-hover:scale-105 transform`}
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
  
  // Function to get display title for the product
  const getDisplayTitle = (item) => {
    if (item.title && item.title.trim()) {
      return item.title.trim();
    }
    if (item.url && item.url.trim()) {
      // Convert URL to a more readable format
      const urlParts = item.url.split('/').pop(); // Get last part of URL
      return urlParts
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
        .trim() || 'محصول';
    }
    return 'محصول بدون نام';
  };

  // Get truncated title for display
  const displayTitle = getDisplayTitle(item);
  const truncatedTitle = displayTitle.length > 50 ? displayTitle.substring(0, 50) + '...' : displayTitle;


  
  return (
    <div className="group relative h-full">
      <a 
        href={`/product/${item.url || item.id || '#'}`}
        className="block relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-md hover:shadow-2xl transition-all duration-700 overflow-hidden border border-emerald-100/50 hover:border-emerald-300/80 transform hover:-translate-y-3 hover:scale-[1.02] h-full flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          transform: 'translateZ(0)',
          animationDelay: `${index * 80}ms`,
        }}
      >
        {/* Premium gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-transparent to-teal-50/40 opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-3xl"></div>
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-400/60 rounded-full animate-ping"></div>
          <div className="absolute top-8 left-6 w-1 h-1 bg-teal-400/50 rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-6 right-8 w-1.5 h-1.5 bg-green-400/40 rounded-full animate-pulse delay-700"></div>
        </div>
        
        {/* Image container with advanced effects */}
        <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-emerald-50/50 to-teal-50/30 flex-shrink-0">
          <div className="h-44 sm:h-48 md:h-52 lg:h-56 relative">
            <SafeImage
              src={item.image}
              alt={`${categoryTitle} - ${displayTitle}`}
              className="w-full h-full object-contain bg-white/90 backdrop-blur-sm p-6 group-hover:p-4 transition-all duration-500"
            />
            
            {/* Premium badge for featured items */}
            {index < 2 && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xl transform -translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <span className="flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  ویژه
                </span>
              </div>
            )}
            
            {/* Interactive shimmer overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-t-3xl"></div>
          </div>
        </div>

        {/* Content section with premium styling - flexible height */}
        <div className="p-6 relative flex-grow flex flex-col justify-between">
          <div className="space-y-3">
            {/* Product title */}
            <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors duration-300 leading-tight min-h-[2.5rem] flex items-start">
              <span className="line-clamp-2">{displayTitle}</span>
            </h3>
            
            {/* Category and metadata */}
            <div className="space-y-2">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 group-hover:from-emerald-200 group-hover:to-teal-200 group-hover:text-emerald-800 transition-all duration-300 shadow-sm">
                {categoryTitle}
              </span>
              
              {/* Additional product info if available */}
              {item.id && (
                <div className="text-xs text-gray-500 font-medium">
                  کد: {item.id}
                </div>
              )}
            </div>
          </div>
          
          {/* Action area */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-emerald-100/50 group-hover:border-emerald-200/80 transition-colors duration-300">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 group-hover:text-emerald-700 transition-colors duration-300">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-current">
                <path d="M9 11H15M12 8V14M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>مشاهده جزئیات</span>
            </div>
            
            {/* Animated arrow icon */}
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-100 to-teal-100 group-hover:from-emerald-500 group-hover:to-teal-500 rounded-full flex items-center justify-center transform translate-x-3 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 shadow-sm group-hover:shadow-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-emerald-600 group-hover:text-white rotate-180 group-hover:scale-110 transition-all duration-300">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Premium bottom accent line with animation */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-right group-hover:origin-left rounded-b-3xl"></div>
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-100 flex items-center justify-center p-8">
        <div className="text-center max-w-lg mx-auto">
          <div className="w-32 h-32 mx-auto mb-10 bg-gradient-to-br from-emerald-100 via-teal-100 to-green-100 rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -translate-x-full animate-shimmer"></div>
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" className="text-emerald-500 relative z-10">
              <path d="M3 7h18l-2 10H5L3 7zm0 0L2 4h3m16 3v0m-7 4h.01M9 15h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            هیچ محصولی یافت نشد
          </h3>
          <p className="text-gray-600 text-xl leading-relaxed mb-6">
            در حال حاضر محصولی در این بخش موجود نیست
          </p>
          <div className="inline-flex items-center gap-3 text-emerald-600 font-semibold bg-emerald-50 px-6 py-3 rounded-full">
            <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
            به‌زودی محصولات جدید اضافه خواهد شد
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50" dir="rtl">
      {/* Enhanced Hero Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-green-800 text-white">
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-200">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span className="text-emerald-100 font-semibold">کالکشن ویژه</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black mb-8 bg-gradient-to-r from-white via-emerald-100 to-teal-100 bg-clip-text text-transparent leading-tight">
              کاتالوگ محصولات
            </h1>
            
            <p className="text-xl md:text-2xl text-emerald-100 max-w-4xl mx-auto leading-relaxed font-light mb-10">
              کشف کنید، انتخاب کنید، لذت ببرید - مجموعه‌ای بی‌نظیر از بهترین محصولات در دسته‌بندی‌های مختلف
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-5 py-3 shadow-lg">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold">{validCategories.length} دسته‌بندی منحصر به فرد</span>
              </div>
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-5 py-3 shadow-lg">
                <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold">
                  {validCategories.reduce((total, cat) => total + cat.children.length, 0)} محصول با کیفیت
                </span>
              </div>
            </div>
            
            {/* Scroll indicator */}
            <div className="inline-flex flex-col items-center gap-2 text-emerald-200 animate-bounce">
              <span className="text-sm font-medium">محصولات را کشف کنید</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M7 13l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="rotate(90 12 12)"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8 -mt-16 relative z-10">
        {validCategories.map((category, categoryIndex) => {
          const itemCount = category.children?.length || 0;
          
          const getGridClasses = () => {
            if (itemCount === 1) return 'grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center max-w-md mx-auto';
            if (itemCount === 2) return 'grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto';
            if (itemCount === 3) return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8';
            if (itemCount <= 6) return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6';
            return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6';
          };

          return (
            <section 
              key={category.url || categoryIndex} 
              className="mb-24"
              style={{
                animation: `fadeInUp 0.8s ease-out ${categoryIndex * 0.15}s both`
              }}
            >
              {/* Enhanced Category Header */}
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-emerald-100/60 p-10 mb-10 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-emerald-50/80 to-transparent rounded-bl-full"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-teal-50/70 to-transparent rounded-tr-full"></div>
                <div className="absolute top-1/2 right-10 w-2 h-16 bg-gradient-to-b from-emerald-200 to-teal-200 rounded-full opacity-30"></div>
                
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-500 to-green-600 rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden group">
                      <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white relative z-10">
                        <path d="M12 2L2 7V17C2 18.1 2.9 19 4 19H20C21.1 19 22 18.1 22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    
                    <div className="space-y-3">
                      <h2 className="text-4xl font-black text-gray-900 bg-gradient-to-r from-gray-900 via-emerald-800 to-teal-800 bg-clip-text text-transparent">
                        {category.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-6 text-sm">
                        <span className="flex items-center gap-2 text-gray-600 bg-emerald-50 px-4 py-2 rounded-full font-semibold">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                          {itemCount} محصول منحصر به فرد
                        </span>
                        <span className="flex items-center gap-2 text-gray-600 bg-teal-50 px-4 py-2 rounded-full font-semibold">
                          <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                          آماده ارسال فوری
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {itemCount > 6 && (
                    <a 
                      href={`/category/${category.url}`}
                      className="group relative inline-flex items-center gap-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:via-teal-700 hover:to-green-700 text-white font-bold px-10 py-5 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10">مشاهده همه محصولات</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="rotate-180 group-hover:translate-x-1 transition-transform duration-300 relative z-10">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
              
              {/* Products Grid */}
              <div className={getGridClasses()}>
                {category.children.map((item, index) => (
                  <div 
                    key={`${item.url || item.id}-${index}`}
                    className="w-full"
                    style={{
                      animation: `fadeInUp 0.6s ease-out ${(index * 0.1) + 0.4}s both`
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
        <div className="text-center mt-32 pt-20 border-t border-emerald-200/50">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 rounded-3xl p-16 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-black/20"></div>
            
            {/* Animated background elements */}
            <div className="absolute inset-0">
              <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-pulse delay-700"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse delay-300"></div>
            </div>
            
            <div className="relative z-10 max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-200">
                  <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
                <span className="text-emerald-100 font-semibold">خبرنامه ویژه</span>
              </div>
              
              <h3 className="text-4xl font-black mb-6 leading-tight">
                همیشه از جدیدترین‌ها باخبر باشید
              </h3>
              <p className="text-emerald-100 mb-10 text-xl max-w-3xl mx-auto leading-relaxed">
                از جدیدترین محصولات، پیشنهادات ویژه و تخفیف‌های انحصاری مطلع شوید
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="ایمیل خود را وارد کنید"
                  className="flex-1 px-6 py-4 rounded-2xl text-gray-900 font-medium focus:outline-none focus:ring-4 focus:ring-emerald-300 transition-all duration-300 text-center sm:text-right"
                />
                <button className="bg-white text-emerald-600 font-black px-8 py-4 rounded-2xl hover:bg-emerald-50 transform hover:scale-105 transition-all duration-300 shadow-xl whitespace-nowrap">
                  عضویت فوری
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Custom animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shimmer {
          0% { 
            transform: translateX(-100%); 
          }
          100% { 
            transform: translateX(100%); 
          }
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px); 
          }
          50% { 
            transform: translateY(-10px); 
          }
        }
        
        @keyframes glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); 
          }
          50% { 
            box-shadow: 0 0 30px rgba(16, 185, 129, 0.6); 
          }
        }
        
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-shimmer {
          animation: shimmer 2.5s infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
        
        .animate-slide-in-right {
          animation: slideInFromRight 0.8s ease-out;
        }
        
        .scale-102 {
          transform: scale(1.02);
        }
        
        .scale-105 {
          transform: scale(1.05);
        }
        
        /* Line clamp utility for text truncation */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Custom scrollbar for better UX */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #10b981, #059669);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #059669, #047857);
        }
        
        /* Smooth focus states */
        .focus-visible\:ring-emerald-500:focus-visible {
          ring-color: #10b981;
          ring-width: 3px;
          ring-offset-width: 2px;
        }
        
        /* Custom backdrop blur for better performance */
        .backdrop-blur-custom {
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
        }
        
        /* Enhanced transition for images */
        .image-transition {
          transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Subtle shadow animations */
        .shadow-animate {
          transition: box-shadow 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .shadow-animate:hover {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 
                      0 0 0 1px rgba(16, 185, 129, 0.1);
        }
        
        /* Performance optimizations */
        .gpu-accelerated {
          transform: translateZ(0);
          will-change: transform;
        }
        
        /* Gradient text animation */
        .gradient-text-animate {
          background: linear-gradient(45deg, #10b981, #059669, #047857, #065f46);
          background-size: 300% 300%;
          animation: gradientShift 4s ease infinite;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        /* Interactive pulse effect */
        .pulse-on-hover:hover {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        /* Stagger animation delays for grid items */
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }
        
        /* Smooth color transitions */
        .color-transition {
          transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
        }
        
        /* Modern glass morphism effect */
        .glass-morphism {
          background: rgba(255, 255, 255, 0.25);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        
        /* Enhanced border radius for modern look */
        .rounded-4xl {
          border-radius: 2rem;
        }
        
        /* Smooth reveal animation */
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .reveal.revealed {
          opacity: 1;
          transform: translateY(0);
        }
        
        /* Premium button effects */
        .btn-premium {
          position: relative;
          overflow: hidden;
          transform: translateZ(0);
        }
        
        .btn-premium::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.5s;
        }
        
        .btn-premium:hover::before {
          left: 100%;
        }
        
        /* Responsive text scaling */
        @media (max-width: 640px) {
          .text-responsive-xl {
            font-size: 1.5rem;
            line-height: 2rem;
          }
        }
        
        @media (min-width: 641px) {
          .text-responsive-xl {
            font-size: 2rem;
            line-height: 2.5rem;
          }
        }
        
        @media (min-width: 1024px) {
          .text-responsive-xl {
            font-size: 2.5rem;
            line-height: 3rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductGrid;