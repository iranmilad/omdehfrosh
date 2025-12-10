import FastOrderFilter from '../models/FastOrderFilter.js'
import FastOrderBrand from '../models/FastOrderBrand.js';
import SingleProduct from '../models/SingleProduct.js';
import FastOrderCategory from '../models/FastOrderCategory.js';
import FastOrderLocation from '../models/FastOrderLocation.js';
import getUserFromToken from '../libs/verifyToken.js';

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

// ============================================
// CATEGORY MODE API
// ============================================
export const getFastEditCategoryModeTableData = async (req, res) => {
    console.log("========== REQUEST START ==========");
    console.log("Received request body:", JSON.stringify(req.body, null, 2));

    // Handle array of filter objects
    if (!Array.isArray(req.body)) {
        return res.status(400).json({ message: "Request body must be an array of filter objects" });
    }

    if (req.body.length === 0) {
        return res.status(400).json({ message: "At least one filter object is required" });
    }

    // User authentication check
    const { user_id, decoded, role } = getUserFromToken(req, res);  
    console.log("User Info:", { user_id, role });
    
    if (role !== "supplier") return res.status(400).json({ message: "no access" });

    try {
        // Collect all unique category IDs from all filter objects
        const allUniqueCategoryIds = new Set();
        const allUniqueSubCategoryIds = new Set();
        const allUniqueSubCategoryBrands = new Set();
        let primarySearchType = null;
        let combinedFilters = {}; // To merge filters from all objects

        console.log("\n========== PROCESSING FILTER OBJECTS ==========");
        // Process each filter object
        req.body.forEach((filterObj, index) => {
            console.log(`\n--- Filter Object ${index} ---`);
            const { 
                searchType,
                uniqueIDClickedCategories,
                uniqueIDClickedSubCategories,
                uniqueIDClickedSubCategoriesBrands,
                filters // Extract filters from each object
            } = filterObj;

            console.log("Search Type:", searchType);
            console.log("Categories:", uniqueIDClickedCategories);
            console.log("SubCategories:", uniqueIDClickedSubCategories);
            console.log("Brands:", uniqueIDClickedSubCategoriesBrands);
            console.log("Filters:", filters);

            // Validate search type for each filter
            if (searchType !== "category") {
                console.warn(`Filter ${index}: Invalid search type "${searchType}", skipping`);
                return;
            }

            // Set primary search type from first valid filter
            if (!primarySearchType) {
                primarySearchType = searchType;
            }

            // Merge filters - last filter wins if there are conflicts
            if (filters && typeof filters === 'object') {
                combinedFilters = { ...combinedFilters, ...filters };
            }

            // Collect category IDs
            if (Array.isArray(uniqueIDClickedCategories)) {
                uniqueIDClickedCategories.forEach(categoryId => {
                    if (categoryId && typeof categoryId === 'string' && categoryId.trim()) {
                        allUniqueCategoryIds.add(categoryId);
                        console.log(`Added category ID: ${categoryId}`);
                    }
                });
            }

            // Collect sub-category IDs - handle both strings and objects
            if (Array.isArray(uniqueIDClickedSubCategories)) {
                uniqueIDClickedSubCategories.forEach(subCategory => {
                    if (subCategory) {
                        // If it's a string, use it directly
                        if (typeof subCategory === 'string' && subCategory.trim()) {
                            allUniqueSubCategoryIds.add(subCategory);
                            console.log(`Added sub-category ID (string): ${subCategory}`);
                        } 
                        // If it's an object, extract the ID
                        else if (typeof subCategory === 'object') {
                            // Try different possible ID field names
                            const id = subCategory.id || subCategory._id || subCategory.value || subCategory.key;
                            if (id && typeof id === 'string' && id.trim()) {
                                allUniqueSubCategoryIds.add(id);
                                console.log(`Added sub-category ID (object): ${id}`);
                            }
                        }
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
        const finalSubCategoryIds = Array.from(allUniqueSubCategoryIds);
        const finalSubCategoryBrands = Array.from(allUniqueSubCategoryBrands).map(brand => {
            try {
                return JSON.parse(brand);
            } catch (e) {
                return brand;
            }
        });

        console.log("\n========== PROCESSED IDS ==========");
        console.log("Final Category IDs:", finalCategoryIds);
        console.log("Final SubCategory IDs:", finalSubCategoryIds);
        console.log("Final Brands:", finalSubCategoryBrands);
        console.log("Combined Filters:", combinedFilters);

        // If no valid category IDs found, return empty results
        if (finalCategoryIds.length === 0 && finalSubCategoryIds.length === 0) {
            console.log("\n⚠️  NO CATEGORY OR SUBCATEGORY IDS FOUND - Returning empty results");
            
            // Still return categories, brands and filters for UI
            const allLocations = await FastOrderLocation.find({idSupplier: String(user_id)});
            const sortedLocations = allLocations[0]?.locations || [];
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
                supplierLocations: sortedLocations,
                meta: {
                    totalFilters: req.body.length,
                    processedCategoryIds: finalCategoryIds,
                    processedSubCategoryIds: finalSubCategoryIds,
                    combinedFilters,
                    message: "No products found for the provided filters"
                }
            });
        }

        // Build query conditions
        let productQuery = {};
        
        console.log("\n========== BUILDING QUERY ==========");
        // Add category conditions
        if (finalCategoryIds.length > 0 && finalSubCategoryIds.length > 0) {
            // If both categories and sub-categories are selected, use OR condition
            productQuery.$or = [
                { "general.categoryId": { $in: finalCategoryIds } },
                { "general.subCategoryId": { $in: finalSubCategoryIds } }
            ];
            console.log("Query condition: Both categories and subcategories (OR)");
        } else if (finalCategoryIds.length > 0) {
            // Only categories
            productQuery["general.categoryId"] = { $in: finalCategoryIds };
            console.log("Query condition: Only categories");
        } else if (finalSubCategoryIds.length > 0) {
            // Only sub-categories
            productQuery["general.subCategoryId"] = { $in: finalSubCategoryIds };
            console.log("Query condition: Only subcategories");
        }

        console.log("Initial productQuery:", JSON.stringify(productQuery, null, 2));

        // Apply filters to the query based on combinedFilters
        console.log("\n========== APPLYING FILTERS ==========");

        if (combinedFilters.stockStatus && combinedFilters.stockStatus !== 'all') {
            const hasStock = combinedFilters.stockStatus === 'true' || combinedFilters.stockStatus === true;
            console.log(`Applying stock filter: hasStock = ${hasStock}`);
            if (hasStock) {
                productQuery["combinations.suppliers.stock"] = { $gt: 0 };
            }
        }

        if (combinedFilters.minStock && !isNaN(combinedFilters.minStock)) {
            const minStock = parseInt(combinedFilters.minStock);
            console.log(`Applying minStock filter: ${minStock}`);
            productQuery["combinations.suppliers.stock"] = { 
                $gte: minStock
            };
        }

        if (combinedFilters.supplier && combinedFilters.supplier !== 'all') {
            console.log(`Applying supplier filter: ${combinedFilters.supplier}`);
            productQuery["combinations.suppliers.id"] = combinedFilters.supplier;
        }

        console.log("\n========== FINAL QUERY ==========");
        console.log("Final productQuery:", JSON.stringify(productQuery, null, 2));

        // Find products using the built query
        console.log("\n========== EXECUTING DATABASE QUERY ==========");
        const products = await SingleProduct.find(productQuery).lean();
        console.log(`Found ${products.length} products from database`);

        if (products.length > 0) {
            console.log("\n--- First Product Sample ---");
            console.log("Product ID:", products[0].id);
            console.log("Product Title:", products[0].general?.title);
            console.log("Category ID:", products[0].general?.categoryId);
            console.log("SubCategory ID:", products[0].general?.subCategoryId);
            console.log("Combinations count:", products[0].combinations?.length);
            if (products[0].combinations && products[0].combinations.length > 0) {
                console.log("First combination suppliers count:", products[0].combinations[0].suppliers?.length);
            }
        }

        // Group by category
        console.log("\n========== GROUPING PRODUCTS BY CATEGORY ==========");
        const sortedProductsMap = new Map();
        let skippedProducts = 0;
        let processedProducts = 0;

        products.forEach((product, index) => {
            const { categoryId, categoryNamePer: categoryName, title, image } = product.general;
            const allSuppliers = [];
            let allSuppliersF = [];

            if (!sortedProductsMap.has(categoryId)) {
                sortedProductsMap.set(categoryId, {
                    idCategory: categoryId,
                    label: categoryName,
                    items: []
                });
                console.log(`Created category group: ${categoryId} - ${categoryName}`);
            }

            // Get the first combination and first supplier
            const firstCombination = product.combinations[0];  
            if (!firstCombination || !firstCombination.suppliers || firstCombination.suppliers.length === 0) {
                console.log(`⚠️  Product ${index} (${product.id}) skipped - no suppliers in first combination`);
                skippedProducts++;
                return; // Skip this product if no suppliers
            }
            
            const firstSupplier = firstCombination.suppliers[0];
            const { id, name, ...restSupplierData } = firstSupplier;

            // Process product combinations and collect all suppliers
            let combinationsProcessed = 0;
            let suppliersCollected = 0;
            
            product.combinations.forEach(combination => {
                if (!combination.suppliers || combination.suppliers.length === 0) return;

                combination.suppliers.forEach(item => {
                    // Apply supplier-specific filters
                    if (combinedFilters.supplier && combinedFilters.supplier !== 'all') {
                        if (item.id !== combinedFilters.supplier) {
                            return;
                        }
                    }

                    if (combinedFilters.stockStatus && combinedFilters.stockStatus !== 'all') {
                        const hasStock = combinedFilters.stockStatus === 'true' || combinedFilters.stockStatus === true;
                        if (hasStock && (!item.stock || item.stock <= 0)) {
                            return;
                        }
                    }

                    if (combinedFilters.minStock && !isNaN(combinedFilters.minStock)) {
                        const minStock = parseInt(combinedFilters.minStock);
                        if (!item.stock || item.stock < minStock) {
                            return;
                        }
                    }

                    allSuppliers.push({
                        ...item,
                        combinationsID: combination.id,
                        attributes: combination.options,
                    });
                    suppliersCollected++;
                });
                combinationsProcessed++;
            });

            console.log(`Product ${index} (${product.id}): ${combinationsProcessed} combinations processed, ${suppliersCollected} suppliers collected`);

            // If no suppliers pass the filters, skip this product
            if (allSuppliers.length === 0) {
                console.log(`⚠️  Product ${index} (${product.id}) skipped - no suppliers passed filters`);
                skippedProducts++;
                return;
            }

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
            sortedProductsMap.get(categoryId).items.push(supplierWithProductID);
            processedProducts++;
            console.log(`✓ Product ${index} (${product.id}) added with ${allSuppliersF.length} child nodes`);
        });

        console.log(`\nProcessing Summary: ${processedProducts} products added, ${skippedProducts} products skipped`);

        const sortedProducts = Array.from(sortedProductsMap.values());
        console.log(`\n${sortedProducts.length} categories with products`);

        // Apply sorting if specified
        if (combinedFilters.sort) {
            console.log(`\n========== APPLYING SORT: ${combinedFilters.sort} ==========`);
            sortedProducts.forEach(category => {
                if (combinedFilters.sort === 'bestPrice') {
                    category.items.sort((a, b) => {
                        const priceA = a.price?.discountedPrice || a.price?.regularPrice || 0;
                        const priceB = b.price?.discountedPrice || b.price?.regularPrice || 0;
                        return priceA - priceB;
                    });
                    console.log(`Category ${category.idCategory} sorted by bestPrice`);
                } else if (combinedFilters.sort === 'highestStock') {
                    category.items.sort((a, b) => (b.stock || 0) - (a.stock || 0));
                    console.log(`Category ${category.idCategory} sorted by highestStock`);
                }
            });
        }

        // Get supplier locations
        console.log("\n========== FETCHING ADDITIONAL DATA ==========");
        const allLocations = await FastOrderLocation.find({idSupplier: String(user_id)});
        const sortedLocations = allLocations[0]?.locations || [];
        console.log(`Found ${sortedLocations.length} locations`);

        // Get brands, filters, and categories
        const allFastEditBrands = await FastOrderBrand.find().lean();
        const allFastEditFilters = await FastOrderFilter.find().lean();
        const allCats = await FastOrderCategory.find().lean();
        
        console.log(`Found ${allFastEditBrands.length} brands`);
        console.log(`Found ${allFastEditFilters.length} filter sets`);
        console.log(`Found ${allCats.length} categories`);
        
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

        console.log("\n========== RESPONSE SUMMARY ==========");
        console.log(`Products: ${cleanProducts.length} categories`);
        cleanProducts.forEach(cat => {
            console.log(`  - ${cat.label} (${cat.idCategory}): ${cat.items.length} items`);
        });
        console.log(`Brands: ${cleanBrands.length}`);
        console.log(`Filters: sellers=${newFilters.sellers.length}, colors=${newFilters.colors.length}, deliveryTime=${newFilters.deliveryTime.length}`);
        console.log(`Categories: ${cleanCategories.length}`);
        console.log(`Locations: ${sortedLocations.length}`);
        console.log("========== REQUEST END ==========\n");

        res.status(200).json({
            products: cleanProducts,
            brands: cleanBrands,
            filters: newFilters,
            category: cleanCategories,
            supplierLocations: sortedLocations,
            meta: {
                totalFilters: req.body.length,
                processedCategoryIds: finalCategoryIds,
                processedSubCategoryIds: finalSubCategoryIds,
                appliedFilters: combinedFilters,
                totalProductsFound: products.length,
                totalCategoriesWithProducts: sortedProducts.length,
                supplierId: user_id
            }
        });

    } catch (error) {
        console.error("\n========== ERROR ==========");
        console.error("Error fetching table data:", error);
        console.error("Error stack:", error.stack);
        console.error("========== ERROR END ==========\n");
        
        res.status(500).json({ 
            message: "Failed to fetch fast edit category mode table data",
            error: error.message 
        });
    }
};

// ============================================
// BRAND MODE API
// ============================================
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