import FastOrderFilter from '../models/FastOrderFilter.js'
import FastOrderBrand from '../models/FastOrderBrand.js';
import SingleProduct from '../models/SingleProduct.js';
import FastOrderCategory from '../models/FastOrderCategory.js';
import FastOrderLocation from '../models/FastOrderLocation.js';
import getUserFromToken from '../libs/verifyToken.js';



export const getFastEditCategoryModeTableData = async (req, res) => {
    const {     
        searchType,
        uniqueIDClickedCategories,
        uniqueIDClickedSubCategories,
        uniqueIDClickedSubCategoriesBrands 
    
    } = req.body;
  


      if (searchType !== "category") return res.status(400).json({ message: "Invalid search type" });
  
  
      const { user_id, decoded, role } = getUserFromToken(req, res);  
          
      if (role !== "supplier") return res.status(400).json({ message: "no access" });

      


      try {
          if (!Array.isArray(uniqueIDClickedCategories)) {
              return res.status(400).json({ message: "Invalid brand IDs array" });
          }
  
          const products = await SingleProduct.find({
            "general.categoryId": { $in: uniqueIDClickedCategories }
        }).select('-_id').lean();
        
  
          // Group by brand
          const sortedProductsMap = new Map();
  
          products.forEach(product => {
              const { categoryId, categoryNamePer: categoryName, title, image } = product.general;
              const allSuppliers = [];
              let allSuppliersF = [];
  
              if (!sortedProductsMap.has(categoryId)) {
                  sortedProductsMap.set(categoryId, {
                      idCategory: categoryId,
                      label: categoryName,
                      items: []
                  });
              }
  
              // Get the first combination and first supplier
              const firstCombination = product.combinations[0];  
              const firstSupplier = firstCombination.suppliers[0];  
  
              const { id, name, ...restSupplierData } = firstSupplier;
  
              // Process product combinations and collect all suppliers
              product.combinations.map(combination => {
                  if (!combination.suppliers || combination.suppliers.length === 0) return;
  
                  combination.suppliers.map(item => {
                      allSuppliers.push({
                          ...item, // Spread supplier details
                          combinationsID: combination.id, // Attach combination ID
                          attributes: combination.options, // Add attributes
  
                      });
                  });
                  
              });
  
              // Remove the first supplier from all suppliers
              allSuppliersF = allSuppliers.filter(supplier => supplier.psid !== firstSupplier.psid);
  
              // Create the primary supplier object with nodes
              const supplierWithProductID = {
                  ...restSupplierData, // Remaining supplier data (excluding id & name)
                  seller: { id, label: name }, // New seller field
                  productId: product.id, // Add product ID
                  id: product.id, // Add product ID
                  combinationsID: firstCombination.id, // Add combination ID
                  attributes: firstCombination.options, // Add attributes
                  name: product.general.title,
                  nodes: allSuppliersF.map(supplier => ({
                      ...supplier,
                      seller: { id: supplier.id, label: supplier.name },
                      name: product.general.title,
                      id: product.id, // Add product ID
                      productId: product.id, // Add product ID
  
                  }))
              };
  
              // Push the processed supplier into sortedProductsMap
              sortedProductsMap.get(categoryId).items.push(supplierWithProductID);
  
          });
  
          const sortedProducts = Array.from(sortedProductsMap.values());
  
          const allFastEditBrands = await FastOrderBrand.find().select('-_id');
          const allFastEditFilters = await FastOrderFilter.find().select('-_id');
          const newFilters = {
              sellers: allFastEditFilters[0]?.sellers || [],
              colors: allFastEditFilters[0]?.colors || [],
              deliveryTime: allFastEditFilters[0]?.deliveryTime || []
          };
          const allCats = await FastOrderCategory.find().select('-_id');

        const allLocations = await FastOrderLocation.find({idSupplier: String(user_id)})

        
        const sortedLocations = allLocations[0].locations

        res.status(200).json({
              products: sortedProducts,
              brands: allFastEditBrands,
              filters: newFilters,
              category: allCats,
              supplierLocations: sortedLocations

          });
      } catch (error) {
          console.error("Error fetching table data:", error);
          res.status(500).json({ message: "Failed to fetch fast order brand mode table data" });
      }

};
