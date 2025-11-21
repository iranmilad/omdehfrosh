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
      style={{padding: '10px', fontSize: '16px', border: '4px'}}
    />
  );
};

export default Search;