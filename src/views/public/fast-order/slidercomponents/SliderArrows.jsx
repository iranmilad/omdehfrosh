const SliderArrows = ({ prevRef, nextRef, isBeginning = false, isEnd = false }) => {
  return (
    <>
      {/* Previous Arrow - on the right for RTL (hidden when at beginning) */}
      <div
        ref={prevRef}
        className="swiper-button-prev-custom"
        style={{
          position: 'absolute',
          right: '0',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          cursor: 'pointer',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: '#1e3a5f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          opacity: isBeginning ? 0 : 1,
          pointerEvents: isBeginning ? 'none' : 'auto',
          visibility: isBeginning ? 'hidden' : 'visible'
        }}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.5 2L8.5 6L4.5 10"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Next Arrow - on the left for RTL (hidden when at end) */}
      <div
        ref={nextRef}
        className="swiper-button-next-custom"
        style={{
          position: 'absolute',
          left: '0',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          cursor: 'pointer',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: '#1e3a5f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          opacity: isEnd ? 0 : 1,
          pointerEvents: isEnd ? 'none' : 'auto',
          visibility: isEnd ? 'hidden' : 'visible'
        }}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.5 2L3.5 6L7.5 10"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </>
  );
};

export default SliderArrows;
