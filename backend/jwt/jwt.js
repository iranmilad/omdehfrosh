export default function fakeTokenDecode(encodedString) {
    // Decode the URL-encoded string
    const decodedString = decodeURIComponent(encodedString);
  
    // Split the string by '&&' to separate different key-value pairs
    const params = decodedString.split('&&');
  
    // Extract the supplierId, supplierName, and role using string manipulation
    let id = null;
    let name = null;
    let role = null;
  
    params.forEach(param => {
      // Ensure we're looking for the correct parameter names
      if (param.includes('id=')) {
        id = param.split('=')[1];  // Extract supplierId
      }
      if (param.includes('name=')) {
        name = param.split('=')[1];  // Extract supplierName
      }
      if (param.includes('role=')) {
        role = param.split('=')[1];  // Extract role
      }
    });
  
    // Return the extracted values
    return { id, name, role };
  }
  

  