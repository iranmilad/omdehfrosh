import FastOrderFilter from '../models/FastOrderFilter.js'
import FastOrderBrand from '../models/FastOrderBrand.js';
import SingleProduct from '../models/SingleProduct.js';
import FastOrderCategory from '../models/FastOrderCategory.js';
import FastOrderLocation from '../models/FastOrderLocation.js';
import getUserFromToken from '../libs/verifyToken.js';

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

export const getFastEditBrandModeTableData = async (req, res) => {
    console.log("Received request body:", JSON.stringify(req.body));

    // Handle array of filter objects
    if (!Array.isArray(req.body)) {
        return res.status(400).json({ message: "Request body must be an array of filter objects" });
    }

    if (req.body.length === 0) {
        return res.status(400).json({ message: "At least one filter object is required" });
    }

    // User authentication check
    const { user_id, decoded, role } = getUserFromToken(req, res);  
    
    if (role !== "supplier") return res.status(400).json({ message: "no access" });

    try {
        // Collect all unique brand IDs from all filter objects
        const allUniqueBrandIds = new Set();
        const allUniqueBrandCategories = new Set();
        const allFilterStorage = [];
        let primarySearchType = null;

        // Process each filter object
        req.body.forEach((filterObj, index) => {
            const { 
                searchType, 
                uniqueIDClickedBrands, 
                uniqueIDClickedBrandsCategories, 
                filterBrandsCategorySubCategoryStorage,
            } = filterObj;

            // Validate search type for each filter
            if (searchType !== "brand") {
                console.warn(`Filter ${index}: Invalid search type "${searchType}", skipping`);
                return;
            }

            // Set primary search type from first valid filter
            if (!primarySearchType) {
                primarySearchType = searchType;
            }

            // Collect brand IDs
            if (Array.isArray(uniqueIDClickedBrands)) {
                uniqueIDClickedBrands.forEach(brandId => {
                    if (brandId && brandId.trim()) {
                        allUniqueBrandIds.add(brandId);
                    }
                });
            }

            // Collect brand categories
            if (Array.isArray(uniqueIDClickedBrandsCategories)) {
                uniqueIDClickedBrandsCategories.forEach(category => {
                    if (category) {
                        allUniqueBrandCategories.add(JSON.stringify(category));
                    }
                });
            }

            // Collect filter storage
            if (Array.isArray(filterBrandsCategorySubCategoryStorage)) {
                filterBrandsCategorySubCategoryStorage.forEach(storage => {
                    if (storage) {
                        allFilterStorage.push(storage);
                    }
                });
            }
        });

        // Convert Sets back to arrays
        const finalBrandIds = Array.from(allUniqueBrandIds);
        const finalBrandCategories = Array.from(allUniqueBrandCategories).map(cat => {
            try {
                return JSON.parse(cat);
            } catch (e) {
                return cat;
            }
        });

        // If no valid brand IDs found, return empty results
        if (finalBrandIds.length === 0) {
            // Still return brands and filters for UI
            const allLocations = await FastOrderLocation.find({idSupplier: String(user_id)});
            const sortedLocations = allLocations[0]?.locations || [];
            const allFastEditBrands = await FastOrderBrand.find().lean();
            const allFastEditFilters = await FastOrderFilter.find().lean();
            
            // ⭐ Remove all _id, __v, and ICPrice fields recursively
            const cleanBrands = removeIdFields(allFastEditBrands);
            const cleanFilters = removeIdFields(allFastEditFilters);
            
            const newFilters = {
                sellers: cleanFilters[0]?.sellers || [],
                colors: cleanFilters[0]?.colors || [],
                deliveryTime: cleanFilters[0]?.deliveryTime || []
            };

            return res.status(200).json({
                products: [],
                brands: cleanBrands,
                filters: newFilters,
                supplierLocations: sortedLocations,
                meta: {
                    totalFilters: req.body.length,
                    processedBrandIds: finalBrandIds,
                    message: "No products found for the provided filters"
                }
            });
        }

        // Find products using the combined brand IDs
        const products = await SingleProduct.find({
            "general.brandId": { $in: finalBrandIds }
        }).lean();

        console.log(`Found ${products.length} products for brand IDs:`, finalBrandIds);

        // Group by brand
        const sortedProductsMap = new Map();

        products.forEach(product => {
            const { brandId, brandNamePer: brandName, title, image } = product.general;
            const allSuppliers = [];
            let allSuppliersF = [];

            if (!sortedProductsMap.has(brandId)) {
                sortedProductsMap.set(brandId, {
                    idBrand: brandId,
                    label: brandName,
                    items: []
                });
            }

            // Get the first combination and first supplier
            const firstCombination = product.combinations[0];  
            if (!firstCombination || !firstCombination.suppliers || firstCombination.suppliers.length === 0) {
                return; // Skip if no suppliers
            }

            const firstSupplier = firstCombination.suppliers[0];  
            const { id, name, ...restSupplierData } = firstSupplier;

            // Process product combinations and collect all suppliers
            product.combinations.forEach(combination => {
                if (!combination.suppliers || combination.suppliers.length === 0) return;

                combination.suppliers.forEach(item => {
                    allSuppliers.push({
                        ...item,
                        combinationsID: combination.id,
                        attributes: combination.options,
                    });
                });
            });

            // Remove the first supplier from all suppliers
            allSuppliersF = allSuppliers.filter(supplier => supplier.psid !== firstSupplier.psid);

            // Create the primary supplier object with nodes
            const supplierWithProductID = {
                ...restSupplierData,
                seller: { id, label: name },
                productId: product.id,
                id: product.id,
                combinationsID: firstCombination.id,
                attributes: firstCombination.options,
                name: product.general.title,
                nodes: allSuppliersF.map(supplier => ({
                    ...supplier,
                    seller: { id: supplier.id, label: supplier.name },
                    name: product.general.title,
                    id: product.id,
                    productId: product.id,
                }))
            };

            // Push the processed supplier into sortedProductsMap
            sortedProductsMap.get(brandId).items.push(supplierWithProductID);
        });

        const sortedProducts = Array.from(sortedProductsMap.values());

        // Get supplier locations
        const allLocations = await FastOrderLocation.find({idSupplier: String(user_id)});
        const sortedLocations = allLocations[0]?.locations || [];

        // Get brands and filters
        const allFastEditBrands = await FastOrderBrand.find().lean();
        const allFastEditFilters = await FastOrderFilter.find().lean();
        
        // ⭐ Remove all _id, __v, and ICPrice fields recursively
        const cleanBrands = removeIdFields(allFastEditBrands);
        const cleanFilters = removeIdFields(allFastEditFilters);
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
            supplierLocations: sortedLocations,
            meta: {
                totalFilters: req.body.length,
                processedBrandIds: finalBrandIds,
                totalProductsFound: products.length,
                totalBrandsWithProducts: sortedProducts.length,
                supplierId: user_id
            }
        });

    } catch (error) {
        console.error("Error fetching table data:", error);
        res.status(500).json({ 
            message: "Failed to fetch fast edit brand mode table data",
            error: error.message 
        });
    }
};