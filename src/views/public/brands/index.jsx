import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getBrandBySlug } from '../../../redux/brands/getbrandsdata/getBrandsDataActions';

const Brands = () => {
    const { slug } = useParams();
    const dispatch = useDispatch();
    const [imageError, setImageError] = useState(false);

    const { brands, currentBrand, isLoading, error, errorCode, errorType } = useSelector((state) => state.brandsData);

    // Fix: Extract the actual brand data from the nested response
    const brand = currentBrand?.brand || currentBrand;

    // Helper function to check if data is empty
    const isDataEmpty = (data) => {
        if (data === null || data === undefined) return true;
        if (typeof data === 'string' && data.trim() === '') return true;
        if (Array.isArray(data) && data.length === 0) return true;
        if (Array.isArray(data) && data.length === 1 && data[0] === '') return true;
        if (typeof data === 'object' && Object.keys(data).length === 0) return true;
        if (typeof data === 'object' && Object.values(data).every(val => val === '' || val === null || val === undefined)) return true;
        return false;
    };

    // Helper function to check if image is valid
    const isImageValid = (imgSrc) => {
        if (!imgSrc) return false;
        if (typeof imgSrc !== 'string') return false;
        if (imgSrc.trim() === '') return false;
        if (Array.isArray(imgSrc) && (imgSrc.length === 0 || imgSrc[0] === '')) return false;
        return true;
    };

    // Brand placeholder SVG
    const BrandPlaceholderSVG = () => (
        <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="128" height="128" rx="16" fill="#F8FAFC"/>
            <rect width="128" height="128" rx="16" stroke="#E2E8F0" strokeWidth="2"/>
            <g transform="translate(32, 24)">
                <rect x="0" y="16" width="64" height="48" rx="4" fill="#64748B" opacity="0.6"/>
                <rect x="8" y="24" width="8" height="8" rx="2" fill="#94A3B8"/>
                <rect x="20" y="24" width="8" height="8" rx="2" fill="#94A3B8"/>
                <rect x="36" y="24" width="8" height="8" rx="2" fill="#94A3B8"/>
                <rect x="48" y="24" width="8" height="8" rx="2" fill="#94A3B8"/>
                <rect x="8" y="36" width="8" height="8" rx="2" fill="#94A3B8"/>
                <rect x="20" y="36" width="8" height="8" rx="2" fill="#94A3B8"/>
                <rect x="36" y="36" width="8" height="8" rx="2" fill="#94A3B8"/>
                <rect x="48" y="36" width="8" height="8" rx="2" fill="#94A3B8"/>
                <rect x="8" y="48" width="8" height="12" rx="2" fill="#CBD5E1"/>
                <rect x="20" y="48" width="8" height="12" rx="2" fill="#CBD5E1"/>
                <rect x="36" y="48" width="8" height="12" rx="2" fill="#CBD5E1"/>
                <rect x="48" y="48" width="8" height="12" rx="2" fill="#CBD5E1"/>
                <rect x="26" y="48" width="12" height="16" rx="2" fill="#475569"/>
                <circle cx="34" cy="56" r="1" fill="#94A3B8"/>
                <circle cx="32" cy="8" r="8" fill="#3B82F6"/>
                <rect x="28" y="4" width="8" height="8" rx="2" fill="white"/>
                <rect x="30" y="6" width="4" height="4" rx="1" fill="#3B82F6"/>
            </g>
            <rect x="20" y="88" width="88" height="6" rx="3" fill="#E2E8F0"/>
            <rect x="32" y="100" width="64" height="4" rx="2" fill="#F1F5F9"/>
        </svg>
    );

    // Helper component for displaying empty state message
    const EmptyDataMessage = () => (
        <p className="text-gray-500 italic text-center py-4">
            اطلاعاتی در این باره وجود ندارد
        </p>
    );

    // Handle image error
    const handleImageError = () => {
        setImageError(true);
    };

    // Reset image error when brand changes
    useEffect(() => {
        setImageError(false);
    }, [brand]);

    useEffect(() => {
        if (slug) {
            dispatch(getBrandBySlug(slug));
        }
    }, [dispatch, slug]);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
                </div>
            </div>
        );
    }

    // Handle all error states with HTTP status codes
    if (error) {
        const getErrorStyle = () => {
            if (errorType === 'HTTP_ERROR' && errorCode) {
                switch (errorCode) {
                    case 400:
                        return {
                            gradient: 'from-green-50 to-green-100',
                            border: 'border-green-200',
                            iconBg: 'bg-green-100',
                            iconColor: 'text-green-600',
                            titleColor: 'text-green-800',
                            textColor: 'text-green-700',
                            title: 'درخواست نامعتبر',
                            icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                        };
                    case 401:
                        return {
                            gradient: 'from-green-50 to-green-100',
                            border: 'border-green-200',
                            iconBg: 'bg-green-100',
                            iconColor: 'text-green-600',
                            titleColor: 'text-green-800',
                            textColor: 'text-green-700',
                            title: 'عدم دسترسی',
                            icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                        };
                    case 403:
                        return {
                            gradient: 'from-green-50 to-green-100',
                            border: 'border-green-200',
                            iconBg: 'bg-green-100',
                            iconColor: 'text-green-600',
                            titleColor: 'text-green-800',
                            textColor: 'text-green-700',
                            title: 'دسترسی مجاز نیست',
                            icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636'
                        };
                    case 404:
                        return {
                            gradient: 'from-green-50 to-green-100',
                            border: 'border-green-200',
                            iconBg: 'bg-green-100',
                            iconColor: 'text-green-600',
                            titleColor: 'text-green-800',
                            textColor: 'text-green-700',
                            title: 'برند یافت نشد',
                            icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                        };
                    case 500:
                        return {
                            gradient: 'from-green-50 to-green-100',
                            border: 'border-green-200',
                            iconBg: 'bg-green-100',
                            iconColor: 'text-green-600',
                            titleColor: 'text-green-800',
                            textColor: 'text-green-700',
                            title: 'خطای سرور',
                            icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                        };
                    case 503:
                        return {
                            gradient: 'from-green-50 to-green-100',
                            border: 'border-green-200',
                            iconBg: 'bg-green-100',
                            iconColor: 'text-green-600',
                            titleColor: 'text-green-800',
                            textColor: 'text-green-700',
                            title: 'سرویس در دسترس نیست',
                            icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                        };
                    default:
                        return {
                            gradient: 'from-green-50 to-green-100',
                            border: 'border-green-200',
                            iconBg: 'bg-green-100',
                            iconColor: 'text-green-600',
                            titleColor: 'text-green-800',
                            textColor: 'text-green-700',
                            title: `خطای HTTP ${errorCode}`,
                            icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                        };
                }
            }
            
            switch (errorType) {
                case 'API_ERROR':
                    return {
                        gradient: 'from-green-50 to-green-100',
                        border: 'border-green-200',
                        iconBg: 'bg-green-100',
                        iconColor: 'text-green-600',
                        titleColor: 'text-green-800',
                        textColor: 'text-green-700',
                        title: 'خطا در بارگذاری برند',
                        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                    };
                case 'NETWORK_ERROR':
                    return {
                        gradient: 'from-green-50 to-green-100',
                        border: 'border-green-200',
                        iconBg: 'bg-green-100',
                        iconColor: 'text-green-600',
                        titleColor: 'text-green-800',
                        textColor: 'text-green-700',
                        title: 'خطا در اتصال',
                        icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    };
                default:
                    return {
                        gradient: 'from-green-50 to-green-100',
                        border: 'border-green-200',
                        iconBg: 'bg-green-100',
                        iconColor: 'text-green-600',
                        titleColor: 'text-green-800',
                        textColor: 'text-green-700',
                        title: 'خطا در بارگذاری',
                        icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    };
            }
        };

        const style = getErrorStyle();

        return (
            <div className="container mx-auto px-4 py-8" dir="rtl">
                <div className="max-w-md mx-auto">
                    <div className={`bg-gradient-to-br ${style.gradient} border ${style.border} rounded-xl p-8 shadow-lg`}>
                        <div className="text-center">
                            <div className={`w-16 h-16 mx-auto mb-4 ${style.iconBg} rounded-full flex items-center justify-center`}>
                                <svg className={`w-8 h-8 ${style.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={style.icon}></path>
                                </svg>
                            </div>
                            <h2 className={`text-2xl font-bold ${style.titleColor} mb-3`}>{style.title}</h2>
                            <p className={`${style.textColor} leading-relaxed mb-4`}>
                                {error}
                            </p>
                            
                            {(errorType === 'NETWORK_ERROR' || errorCode >= 500) && (
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                    تلاش مجدد
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Handle case when brand not found or invalid response
    if (!currentBrand || currentBrand.success === "false" || !brand) {
        return (
            <div className="container mx-auto px-4 py-8" dir="rtl">
                <div className="max-w-md mx-auto">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-8 shadow-lg">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-green-800 mb-3">برند یافت نشد</h2>
                            <p className="text-green-700 leading-relaxed mb-6">
                                {currentBrand?.message || "برند مورد نظر شما یافت نشد."}
                            </p>
                            <a 
                                href="/brands" 
                                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                                </svg>
                                بازگشت به لیست برندها
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8" dir="rtl">
            {/* Brand Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    {/* Brand Logo with Error Handling */}
                    <div className="flex-shrink-0">
                        {isImageValid(brand.logo) && !imageError ? (
                            <img 
                                src={brand.logo} 
                                alt={brand.name || 'Brand Logo'}
                                className="w-32 h-32 object-contain rounded-lg shadow-md bg-white p-2"
                                onError={handleImageError}
                            />
                        ) : (
                            <div className="w-32 h-32 flex items-center justify-center rounded-lg shadow-md bg-white p-2">
                                <BrandPlaceholderSVG />
                            </div>
                        )}
                    </div>
                    
                    {/* Brand Info */}
                    <div className="flex-1 text-center md:text-right">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                            {brand.name}
                        </h1>
                        
                        {!isDataEmpty(brand.tagline) ? (
                            <p className="text-lg text-gray-600 mb-4">
                                {brand.tagline}
                            </p>
                        ) : (
                            <EmptyDataMessage />
                        )}
                        
                        <div className="flex flex-col md:flex-row gap-4 text-sm text-gray-500">
                            {!isDataEmpty(brand.established_year) ? (
                                <p>
                                    تاسیس: {brand.established_year}
                                </p>
                            ) : null}
                            
                            {!isDataEmpty(brand.origin_country) ? (
                                <p>
                                    کشور مبدا: {brand.origin_country}
                                </p>
                            ) : null}

                            {!isDataEmpty(brand.headquarters) ? (
                                <p>
                                    دفتر مرکزی: {brand.headquarters}
                                </p>
                            ) : null}

                            {/* Show message if all three fields are empty */}
                            {isDataEmpty(brand.established_year) && 
                             isDataEmpty(brand.origin_country) && 
                             isDataEmpty(brand.headquarters) && (
                                <EmptyDataMessage />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Company Stats */}
            <div className="mb-8">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        آمار برند
                    </h2>
                    {/* Check if any stats exist */}
                    {(!isDataEmpty(brand.total_products) || 
                      !isDataEmpty(brand.rating) || 
                      !isDataEmpty(brand.total_sales) || 
                      !isDataEmpty(brand.global_rank)) ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {!isDataEmpty(brand.total_products) && (
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600 mb-1">
                                        {brand.total_products.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-600">محصولات</div>
                                </div>
                            )}
                            
                            {!isDataEmpty(brand.rating) && (
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600 mb-1">
                                        {brand.rating}/5
                                    </div>
                                    <div className="text-sm text-gray-600">امتیاز کیفیت</div>
                                </div>
                            )}
                            
                            {!isDataEmpty(brand.total_sales) && (
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600 mb-1">
                                        {brand.total_sales.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-600">فروش</div>
                                </div>
                            )}

                            {!isDataEmpty(brand.global_rank) && (
                                <div className="text-center p-4 bg-orange-50 rounded-lg">
                                    <div className="text-2xl font-bold text-orange-600 mb-1">
                                        #{brand.global_rank}
                                    </div>
                                    <div className="text-sm text-gray-600">رتبه جهانی</div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <EmptyDataMessage />
                    )}
                </div>
            </div>

            {/* Company Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Company Details */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        اطلاعات شرکت
                    </h2>
                    {/* Check if any company details exist */}
                    {(!isDataEmpty(brand.ceo) ||
                      !isDataEmpty(brand.employees) ||
                      !isDataEmpty(brand.revenue) ||
                      !isDataEmpty(brand.market_share)) ? (
                        <div className="space-y-3">
                            {!isDataEmpty(brand.ceo) && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">مدیرعامل:</span>
                                    <span className="font-medium">{brand.ceo}</span>
                                </div>
                            )}
                            {!isDataEmpty(brand.employees) && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">تعداد کارکنان:</span>
                                    <span className="font-medium">{brand.employees}</span>
                                </div>
                            )}
                            {!isDataEmpty(brand.revenue) && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">درآمد:</span>
                                    <span className="font-medium">{brand.revenue}</span>
                                </div>
                            )}
                            {!isDataEmpty(brand.market_share) && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">سهم بازار:</span>
                                    <span className="font-medium">{brand.market_share}</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <EmptyDataMessage />
                    )}
                </div>

                {/* Popular Products */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        محصولات محبوب
                    </h2>
                    {!isDataEmpty(brand.popular_products) ? (
                        <div className="space-y-2">
                            {brand.popular_products.map((product, index) => (
                                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold ml-3">
                                        {index + 1}
                                    </div>
                                    <span className="text-gray-700">{product}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyDataMessage />
                    )}
                </div>
            </div>

            {/* Brand Description */}
            <div className="mb-8">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        درباره برند
                    </h2>
                    {!isDataEmpty(brand.description) ? (
                        <div 
                            className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: brand.description }}
                        />
                    ) : (
                        <EmptyDataMessage />
                    )}
                </div>
            </div>

            {/* Brand Features/Highlights */}
            <div className="mb-8">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        ویژگی‌های برند
                    </h2>
                    {!isDataEmpty(brand.features) ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {brand.features.map((feature, index) => (
                                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full ml-3"></div>
                                    <span className="text-gray-700">{feature}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyDataMessage />
                    )}
                </div>
            </div>

            {/* Contact Information */}
            <div className="mb-8">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        اطلاعات تماس
                    </h2>
                    {(!isDataEmpty(brand.website) ||
                      !isDataEmpty(brand.email) ||
                      !isDataEmpty(brand.phone)) ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {!isDataEmpty(brand.website) && (
                                <a 
                                    href={brand.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <span className="text-gray-700">🌐 وب‌سایت</span>
                                </a>
                            )}
                            
                            {!isDataEmpty(brand.email) && (
                                <a 
                                    href={`mailto:${brand.email}`}
                                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <span className="text-gray-700">📧 ایمیل</span>
                                </a>
                            )}
                            
                            {!isDataEmpty(brand.phone) && (
                                <a 
                                    href={`tel:${brand.phone}`}
                                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <span className="text-gray-700">📞 تلفن</span>
                                </a>
                            )}
                        </div>
                    ) : (
                        <EmptyDataMessage />
                    )}
                </div>
            </div>

            {/* Social Media */}
            <div className="mb-8">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        شبکه‌های اجتماعی
                    </h2>
                    {(!isDataEmpty(brand.social_media) && 
                      (!isDataEmpty(brand.social_media.twitter) ||
                       !isDataEmpty(brand.social_media.instagram) ||
                       !isDataEmpty(brand.social_media.facebook))) ? (
                        <div className="flex gap-4 flex-wrap">
                            {!isDataEmpty(brand.social_media.twitter) && (
                                <a 
                                    href={`https://twitter.com/${brand.social_media.twitter.replace('@', '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                                >
                                    🐦 Twitter
                                </a>
                            )}
                            {!isDataEmpty(brand.social_media.instagram) && (
                                <a 
                                    href={`https://instagram.com/${brand.social_media.instagram.replace('@', '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center px-4 py-2 bg-pink-100 text-pink-800 rounded-lg hover:bg-pink-200 transition-colors"
                                >
                                    📷 Instagram
                                </a>
                            )}
                            {!isDataEmpty(brand.social_media.facebook) && (
                                <a 
                                    href={`https://facebook.com/${brand.social_media.facebook}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                                >
                                    📘 Facebook
                                </a>
                            )}
                        </div>
                    ) : (
                        <EmptyDataMessage />
                    )}
                </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
                <a 
                    href={`/shop?brand=${brand.slug}`}
                    className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                    مشاهده محصولات این برند
                </a>
            </div>
        </div>
    );
};

export default Brands;