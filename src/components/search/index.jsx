import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSearchResults } from '../../redux/search/searchActions';
import { clearSearchResults } from '../../redux/search/searchSlice.js';

const Search = ({ onSearchClick }) => {
  const dispatch = useDispatch();
  const [isMobile, setIsMobile] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showResults, setShowResults] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  
  // Get search results from Redux
  const { results, loading, error } = useSelector((state) => state.search);
  
  // Transform array structure to object structure (same as MobileSearch)
  const transformedResults = Array.isArray(results) 
    ? results.reduce((acc, item) => {
        if (item.searchResultName === 'product') {
          acc.products = item.products || [];
        } else if (item.searchResultName === 'brand') {
          acc.brands = item.brands || [];
        } else if (item.searchResultName === 'category') {
          acc.categories = item.categories || [];
        }
        return acc;
      }, {})
    : results || {};
  
  useEffect(() => {
    const checkIfMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 900);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dispatch search with debounce
  useEffect(() => {
    if (!isMobile && searchValue.length > 2) {
      const timer = setTimeout(() => {
        dispatch(getSearchResults({ query: searchValue }));
        setShowResults(true);
      }, 500);
      return () => clearTimeout(timer);
    } else if (searchValue.length === 0) {
      dispatch(clearSearchResults());
      setShowResults(false);
    }
  }, [searchValue, isMobile, dispatch]);
  
  const handleChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleClick = (e) => {
    if (isMobile && onSearchClick) {
      e.preventDefault();
      onSearchClick();
    }
  };

  const handleResultClick = (url) => {
    console.log('Navigate to:', url);
    setSearchValue('');
    setShowResults(false);
    dispatch(clearSearchResults());
  };

  const hasProducts = transformedResults?.products?.length > 0;
  const hasCategories = transformedResults?.categories?.length > 0;
  const hasBrands = transformedResults?.brands?.length > 0;
  const hasResults = hasProducts || hasCategories || hasBrands;
  
  return (
    <div style={{ position: 'relative', width: '', flex: 1, minWidth: 0 }}>
      <div 
        ref={inputRef}
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: isMobile ? '200px' : '286px',
          height: '36px',
          backgroundColor: 'transparent',
          border: '1px solid #e6e7e8',
          borderRadius: '6px',
          padding: '4px 12px 4px 12px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          direction: 'rtl',
          cursor: isMobile ? 'pointer' : 'default',
          color: '#1a1b1c',
          transition: 'color 0.15s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          outline: '2px solid transparent',
          outlineOffset: '2px',
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: '',
          width: '100%',
          minWidth: 0,
        }}>
          <div style={{ display: 'flex', flexShrink: 0, marginLeft: '8px' }}>
            <svg style={{ width: '20px', height: '20px', fill: '#4d5053' }} viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </div>
          
        {isMobile ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexGrow: 1,
            overflow: 'hidden'
          }}>
            <span style={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: '14px',
              fontWeight: 400,
              color: '#9a9da2',
              whiteSpace: 'nowrap'
            }}>
              جستجو در
            </span>
            <img 
              src="/uploads/assets/logo.png" 
              alt="Logo"
              style={{
                height: '20px',
                width: 'auto',
                flexShrink: 0
              }}
            />
          </div>
        ) : (
          <input
            type="text"
            value={searchValue}
            onChange={handleChange}
            onFocus={(e) => {
              const container = e.currentTarget.parentElement.parentElement;
              container.style.borderColor = '#A5A5A5';
              container.style.boxShadow = '0 0 0 4px #D1D1D1';
            }}
            onBlur={(e) => {
              const container = e.currentTarget.parentElement.parentElement;
              container.style.borderColor = '#e6e7e8';
              container.style.boxShadow = 'none';
            }}
            placeholder="جستجوی موبایل، لپتاپ، هدفون و ..."
            onClick={(e) => e.stopPropagation()}
            style={{
              flexGrow: 1,
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              padding: 0,
              fontSize: '14px',
              fontWeight: 400,
              color: '#1a1b1c',
              direction: 'rtl',
              width: '100%',
              fontFamily: 'inherit',
            }}
          />
        )}
        </div>
      </div>

      {/* Desktop Search Results Dropdown */}
      {!isMobile && showResults && searchValue.length > 2 && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            backgroundColor: 'white',
            border: '1px solid #e6e7e8',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            maxHeight: '500px',
            overflowY: 'auto',
            zIndex: 1002,
            direction: 'rtl',
          }}
        >
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#81858b' }}>
              در حال جستجو...
            </div>
          ) : error ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#fa5252' }}>
              {error}
            </div>
          ) : hasResults ? (
            <div style={{ padding: '12px' }}>
              {/* Brands */}
              {hasBrands && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: 600, 
                    color: '#81858b', 
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#81858b">
                      <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
                    </svg>
                    برندها ({transformedResults.brands.length})
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {transformedResults.brands.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleResultClick(`/brand/${item.slug || item.id}`)}
                        style={{
                          padding: '10px 12px',
                          border: '1px solid #e6e7e8',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontSize: '13px',
                          fontWeight: 500,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f0f1f2';
                          e.currentTarget.style.borderColor = '#cdced1';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.borderColor = '#e6e7e8';
                        }}
                      >
                        {item.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              {hasCategories && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: 600, 
                    color: '#81858b', 
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#81858b">
                      <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>
                    </svg>
                    دسته‌بندی‌ها ({transformedResults.categories.length})
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    {transformedResults.categories.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleResultClick(`/category/${item.slug || item.id}`)}
                        style={{
                          padding: '10px 12px',
                          border: '1px solid #e6e7e8',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontSize: '13px',
                          fontWeight: 500,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f0f1f2';
                          e.currentTarget.style.borderColor = '#cdced1';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.borderColor = '#e6e7e8';
                        }}
                      >
                        {item.name || item.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {hasProducts && (
                <div>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: 600, 
                    color: '#81858b', 
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#81858b">
                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                    محصولات ({transformedResults.products.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {transformedResults.products.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleResultClick(`/product/${item.slug || item.id}`)}
                        style={{
                          padding: '12px',
                          border: '1px solid #e6e7e8',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontSize: '14px',
                          fontWeight: 500,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f0f1f2';
                          e.currentTarget.style.borderColor = '#cdced1';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.borderColor = '#e6e7e8';
                        }}
                      >
                        {item.name || item.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="#cdced1" style={{ margin: '0 auto 16px' }}>
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <div style={{ fontSize: '14px', color: '#81858b', marginBottom: '4px' }}>
                نتیجه‌ای یافت نشد
              </div>
              <div style={{ fontSize: '12px', color: '#9a9da2' }}>
                لطفاً عبارت دیگری را جستجو کنید
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;