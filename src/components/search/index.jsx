import { useState, useEffect } from 'react';

const Search = () => {
  console.log('🎨 MINIMAL SEARCH RENDERING');
  
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  const handleChange = (e) => {
    console.log('✏️ INPUT CHANGED:', e.target.value);
  };
  
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {isMobile && (
        <svg
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '20px',
            height: '20px',
            pointerEvents: 'none',
            color: '#999',
          }}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      )}
      <input 
        type="text"
        placeholder={isMobile ? "" : "جستجو"}
        onChange={handleChange}
        style={{
          width: '100%',
          padding: '6px',
          paddingRight: isMobile ? '36px' : '6px',
          fontSize: '16px',
          border: 'none',
          zIndex: 1001,
          outline: 'none',
          backgroundColor: 'transparent',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
};

export default Search;