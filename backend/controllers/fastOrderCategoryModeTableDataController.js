// backend/controllers/fastEditCategoryModeControllers.js
import FastOrderFilter from '../models/FastOrderFilter.js'
import FastOrderBrand from '../models/FastOrderBrand.js';
import SingleProduct from '../models/SingleProduct.js';
import FastOrderCategory from '../models/FastOrderCategory.js';
import FastOrderLocation from '../models/FastOrderLocation.js';
import FiltersSettingsCategory from '../models/SeachCategorySchema.js'

// ⭐ Helper function to recursively remove _id, __v, and ICPrice fields
const removeIdFields = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(item => removeIdFields(item));
  } else if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      if (key !== '_id' && key !== '__v' && key !== 'ICPrice') {
        newObj[key] = removeIdFields(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
};

export const getFastOrderCategoryModeTableData = async (req, res) => {
    console.log("Received request body:",JSON.stringify(req.body));

    // Handle array of filter objects
    if (!Array.isArray(req.body)) {
        return res.status(400).json({ message: "Request body must be an array of filter objects" });
    }

    if (req.body.length === 0) {
        return res.status(400).json({ message: "At least one filter object is required" });
    }

    try {
        // Collect all unique category IDs and related data from all filter objects
        const allUniqueCategoryIds = new Set();
        const allUniqueSubCategories = new Set();
        const allUniqueSubCategoryBrands = new Set();
        let primarySearchType = null;

        // Process each filter object
        req.body.forEach((filterObj, index) => {
            const { 
                searchType,
                uniqueIDClickedCategories,
                uniqueIDClickedSubCategories,
                uniqueIDClickedSubCategoriesBrands 
            } = filterObj;

            // Validate search type for each filter
            if (searchType !== "category") {
                console.warn(`Filter ${index}: Invalid search type "${searchType}", skipping`);
                return;
            }

            // Set primary search type from first valid filter
            if (!primarySearchType) {
                primarySearchType = searchType;
            }

            // Collect category IDs
            if (Array.isArray(uniqueIDClickedCategories)) {
                uniqueIDClickedCategories.forEach(categoryId => {
                    if (categoryId && categoryId.trim && categoryId.trim()) {
                        allUniqueCategoryIds.add(categoryId);
                    } else if (categoryId) {
                        allUniqueCategoryIds.add(categoryId);
                    }
                });
            }

            // Collect sub-categories
            if (Array.isArray(uniqueIDClickedSubCategories)) {
                uniqueIDClickedSubCategories.forEach(subCategory => {
                    if (subCategory) {
                        allUniqueSubCategories.add(JSON.stringify(subCategory));
                    }
                });
            }

            // Collect sub-category brands
            if (Array.isArray(uniqueIDClickedSubCategoriesBrands)) {
                uniqueIDClickedSubCategoriesBrands.forEach(brand => {
                    if (brand) {
                        allUniqueSubCategoryBrands.add(JSON.stringify(brand));
                    }
                });
            }
        });

        // Convert Sets back to arrays
        const finalCategoryIds = Array.from(allUniqueCategoryIds);
        const finalSubCategories = Array.from(allUniqueSubCategories).map(cat => {
            try {
                return JSON.parse(cat);
            } catch (e) {
                return cat;
            }
        });
        const finalSubCategoryBrands = Array.from(allUniqueSubCategoryBrands).map(brand => {
            try {
                return JSON.parse(brand);
            } catch (e) {
                return brand;
            }
        });

        console.log("Processed category filters:", {
            searchType: primarySearchType,
            totalFilterObjects: req.body.length,
            finalCategoryIds,
            finalSubCategoriesCount: finalSubCategories.length,
            finalSubCategoryBrandsCount: finalSubCategoryBrands.length
        });

        // If no valid category IDs found, return empty results
        if (finalCategoryIds.length === 0) {
            console.log("No valid category IDs found, returning empty results");
            
            // Still return brands, filters, and categories for UI
            const allFastEditBrands = await FastOrderBrand.find().lean();
            const allFastEditFilters = await FastOrderFilter.find().lean();
            const allCats = await FastOrderCategory.find().lean();
            
            // ⭐ Remove all _id, __v, and ICPrice fields recursively
            const cleanBrands = removeIdFields(allFastEditBrands);
            const cleanFilters = removeIdFields(allFastEditFilters);
            const cleanCategories = removeIdFields(allCats);
            
            const newFilters = {
                sellers: cleanFilters[0]?.sellers || [],
                colors: cleanFilters[0]?.colors || [],
                deliveryTime: cleanFilters[0]?.deliveryTime || []
            };

            return res.status(200).json({
                products: [],
                brands: cleanBrands,
                filters: newFilters,
                category: cleanCategories,
                meta: {
                    totalFilters: req.body.length,
                    processedCategoryIds: finalCategoryIds,
                    message: "No products found for the provided filters"
                }
            });
        }

        // Find products using the combined category IDs
        const products = await SingleProduct.find({
            "general.categoryId": { $in: finalCategoryIds }
        }).lean();

        console.log(`Found ${products.length} products for category IDs:`, finalCategoryIds);

        // Group by category
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

        // Get brands, filters, and categories
        const allFastEditBrands = await FastOrderBrand.find().lean();
        const allFastEditFilters = await FastOrderFilter.find().lean();
        const allCats = await FastOrderCategory.find().lean();
        
        // ⭐ Remove all _id, __v, and ICPrice fields recursively
        const cleanBrands = removeIdFields(allFastEditBrands);
        const cleanFilters = removeIdFields(allFastEditFilters);
        const cleanCategories = removeIdFields(allCats);
        const cleanProducts = removeIdFields(sortedProducts);
        
        const newFilters = {
            sellers: cleanFilters[0]?.sellers || [],
            colors: cleanFilters[0]?.colors || [],
            deliveryTime: cleanFilters[0]?.deliveryTime || []
        };

        res.status(200).json({
            products: cleanProducts,
            brands: cleanBrands,
            filters: newFilters,
            category: cleanCategories,
            meta: {
                totalFilters: req.body.length,
                processedCategoryIds: finalCategoryIds,
                totalProductsFound: products.length,
                totalCategoriesWithProducts: sortedProducts.length
            }
        });

    } catch (error) {
        console.error("Error fetching table data:", error);
        res.status(500).json({ 
            message: "Failed to fetch fast order category mode table data",
            error: error.message 
        });
    }

};


export const fetchTableDataByIds = async (req, res) => {
    const { searchType } = req.query;
    const { ids } = req.body; 

    if (searchType !== "category") {
        return res.status(400).json({ message: "Only 'category' search type is supported currently" });
    }

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "No filter IDs provided" });
    }

    try {
        // Step 1: Find the saved filters by their IDs
        const savedFiltersDoc = await FiltersSettingsCategory.findOne({
            "searches.id": { $in: ids }
        }).lean();

        if (!savedFiltersDoc) {
            return res.status(404).json({ message: "No saved filters found" });
        }

        // Step 2: Extract the selected filters
        const selectedFilters = savedFiltersDoc.searches.filter(search => 
            ids.includes(search.id)
        );

        // Step 3: Merge all the category IDs from selected filters
        const allCategoryIds = new Set();
        const allSubCategories = [];
        const allSubCategoryBrands = [];

        selectedFilters.forEach(filter => {
            // Add category IDs
            if (filter.uniqueIDClickedCategories) {
                filter.uniqueIDClickedCategories.forEach(categoryId => allCategoryIds.add(categoryId));
            }

            // Add subcategories
            if (filter.uniqueIDClickedSubCategories) {
                allSubCategories.push(...filter.uniqueIDClickedSubCategories);
            }

            // Add subcategory brands
            if (filter.uniqueIDClickedSubCategoriesBrands) {
                allSubCategoryBrands.push(...filter.uniqueIDClickedSubCategoriesBrands);
            }
        });

        const uniqueIDClickedCategories = Array.from(allCategoryIds);

        if (uniqueIDClickedCategories.length === 0) {
            return res.status(400).json({ message: "No category IDs found in saved filters" });
        }

        // Step 4: Fetch products using the merged category IDs
        const products = await SingleProduct.find({
            "general.categoryId": { $in: uniqueIDClickedCategories }
        }).lean();

        // Step 5: Process products (same logic as getFastOrderCategoryModeTableData)
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

        // Step 6: Get categories and filters
        const allFastEditCategories = await FastOrderCategory.find().lean();
        const allFastEditFilters = await FastOrderFilter.find().lean();
        
        // ⭐ Remove all _id, __v, and ICPrice fields recursively
        const cleanCategories = removeIdFields(allFastEditCategories);
        const cleanFilters = removeIdFields(allFastEditFilters);
        const cleanProducts = removeIdFields(sortedProducts);
        
        const newFilters = {
            sellers: cleanFilters[0]?.sellers || [],
            colors: cleanFilters[0]?.colors || [],
            deliveryTime: cleanFilters[0]?.deliveryTime || []
        };

        res.status(200).json({
            products: cleanProducts,
            category: cleanCategories,
            filters: newFilters,
            appliedFilters: selectedFilters.map(f => ({ id: f.id, name: f.filterName }))
        });

    } catch (error) {
        console.error("Failed to fetch table data by filter IDs:", error);
        res.status(500).json({ message: "Server error fetching table data by filter IDs" });
    }
};