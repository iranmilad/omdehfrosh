import FastOrderBrand from '../models/FastOrderBrand.js';
import SingleProduct from '../models/SingleProduct.js';
import FastOrderCategory from '../models/FastOrderCategory.js';
import FastOrderLocation from '../models/FastOrderLocation.js';
import getUserFromToken from '../libs/verifyToken.js';

// ----- MODIFIED 2026-02-07: hardcoded Persian color labels for attribute tooltip (no backend lib) -----
const COLOR_LABELS = { "#000000": "مشکی", "#000080": "آبی تیره", "#0000ff": "آبی", "#008000": "سبز تیره", "#00ff00": "سبز", "#00ffff": "فیروزه‌ای", "#808080": "خاکستری", "#800000": "قهوه‌ای تیره", "#800080": "بنفش", "#a52a2a": "قهوه‌ای", "#ff0000": "قرمز", "#ff00ff": "ارغوانی", "#ffa500": "نارنجی", "#ffff00": "زرد", "#ffffff": "سفید" };
const addOptionLabels = (opts) => {
  if (!opts || !Array.isArray(opts)) return opts;
  return opts.map(o => {
    const isColor = (o.type && o.type.toLowerCase() === 'color') || o.attribute_name === 'رنگ';
    const hex = o.value && String(o.value).trim();
    const normalized = hex ? (hex.startsWith('#') ? hex.toLowerCase() : '#' + hex.toLowerCase()) : '';
    const label = isColor && normalized ? (COLOR_LABELS[normalized] ?? o.value) : o.label;
    return { ...o, ...(label != null && { label }) };
  });
};
// ----- END MODIFIED 2026-02-07 -----

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
    const tokenData = getUserFromToken(req, res);
    if (!tokenData || !tokenData.user_id) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }
    const { user_id, decoded, role } = tokenData;
    console.log("User Info:", { user_id, role });
    if (role !== "supplier") return res.status(400).json({ message: "no access" });

    try {
        // Collect all unique category IDs from all filter objects
        const allUniqueCategoryIds = new Set();
        const allUniqueSubCategoryIds = new Set();
        const allUniqueSubCategoryBrands = new Set();
        let primarySearchType = null;

        console.log("\n========== PROCESSING FILTER OBJECTS ==========");
        // Process each filter object
        req.body.forEach((filterObj, index) => {
            console.log(`\n--- Filter Object ${index} ---`);
            const { 
                searchType,
                uniqueIDClickedCategories,
                uniqueIDClickedSubCategories,
                uniqueIDClickedSubCategoriesBrands,
                // filters removed
            } = filterObj;

            console.log("Search Type:", searchType);
            console.log("Categories:", uniqueIDClickedCategories);
            console.log("SubCategories:", uniqueIDClickedSubCategories);
            console.log("Brands:", uniqueIDClickedSubCategoriesBrands);

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

        // If no valid category IDs found, return empty results
        if (finalCategoryIds.length === 0 && finalSubCategoryIds.length === 0) {
            console.log("\n⚠️  NO CATEGORY OR SUBCATEGORY IDS FOUND - Returning empty results");
            
            // Still return categories and brands for UI (filters removed)
            const allLocations = await FastOrderLocation.find({idSupplier: String(user_id)});
            const sortedLocations = allLocations[0]?.locations || [];
            const allFastEditBrands = await FastOrderBrand.find().lean();
            const allCats = await FastOrderCategory.find().lean();
            
            // ⭐ Remove all _id, __v, and ICPrice fields recursively
            const cleanBrands = removeIdFields(allFastEditBrands);
            const cleanCategories = removeIdFields(allCats);

            return res.status(200).json({
                products: [],
                brands: cleanBrands,
                category: cleanCategories,
                supplierLocations: sortedLocations,
                meta: {
                    totalFilters: req.body.length,
                    processedCategoryIds: finalCategoryIds,
                    processedSubCategoryIds: finalSubCategoryIds,
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
                    // ----- MODIFIED 2026-02-07: attributes include label for color -----
                    allSuppliers.push({
                        ...item,
                        combinationsID: combination.id,
                        attributes: addOptionLabels(combination.options),
                    });
                    suppliersCollected++;
                });
                combinationsProcessed++;
            });

            console.log(`Product ${index} (${product.id}): ${combinationsProcessed} combinations processed, ${suppliersCollected} suppliers collected`);

            // Remove the first supplier from all suppliers
            allSuppliersF = allSuppliers.filter(supplier => supplier.psid !== firstSupplier.psid);

            // Create the primary supplier object with nodes
            const supplierWithProductID = {
                ...restSupplierData,
                seller: { id, label: name },
                productId: product.id,
                id: product.id,
                combinationsID: firstCombination.id,
                attributes: addOptionLabels(firstCombination.options),
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

        // Get supplier locations
        console.log("\n========== FETCHING ADDITIONAL DATA ==========");
        const allLocations = await FastOrderLocation.find({idSupplier: String(user_id)});
        const sortedLocations = allLocations[0]?.locations || [];
        console.log(`Found ${sortedLocations.length} locations`);

        // Get brands and categories (filters removed)
        const allFastEditBrands = await FastOrderBrand.find().lean();
        const allCats = await FastOrderCategory.find().lean();
        
        console.log(`Found ${allFastEditBrands.length} brands`);
        console.log(`Found ${allCats.length} categories`);
        
        // ⭐ Remove all _id, __v, and ICPrice fields recursively
        const cleanBrands = removeIdFields(allFastEditBrands);
        const cleanCategories = removeIdFields(allCats);
        const cleanProducts = removeIdFields(sortedProducts);

        console.log("\n========== RESPONSE SUMMARY ==========");
        console.log(`Products: ${cleanProducts.length} categories`);
        cleanProducts.forEach(cat => {
            console.log(`  - ${cat.label} (${cat.idCategory}): ${cat.items.length} items`);
        });
        console.log(`Brands: ${cleanBrands.length}`);
        console.log(`Categories: ${cleanCategories.length}`);
        console.log(`Locations: ${sortedLocations.length}`);
        console.log("========== REQUEST END ==========\n");

        res.status(200).json({
            products: cleanProducts,
            brands: cleanBrands,
            category: cleanCategories,
            supplierLocations: sortedLocations,
            meta: {
                totalFilters: req.body.length,
                processedCategoryIds: finalCategoryIds,
                processedSubCategoryIds: finalSubCategoryIds,
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