const Search = () => {
  console.log('🎨 MINIMAL SEARCH RENDERING');
  
  const handleChange = (e) => {
    console.log('✏️ INPUT CHANGED:', e.target.value);
  };
  
  return (
    <input 
      type="text"
      placeholder="جستجو"
      onChange={handleChange}
      style={{
        width: '100%',
        padding: '6px',
        fontSize: '16px',
        border: 'none',
        zIndex: 1001,
        outline: 'none',
        backgroundColor: 'transparent',
        boxSizing: 'border-box',
      }}
    />
  );
};

export default Search;