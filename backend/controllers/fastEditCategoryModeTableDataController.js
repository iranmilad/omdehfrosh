import FastOrderFilter from '../models/FastOrderFilter.js'
import FastOrderBrand from '../models/FastOrderBrand.js';
import SingleProduct from '../models/SingleProduct.js';
import FastOrderCategory from '../models/FastOrderCategory.js';
import FastOrderLocation from '../models/FastOrderLocation.js';
import getUserFromToken from '../libs/verifyToken.js';


export const getFastEditCategoryModeTableData = async (req, res) => {
    console.log("Received request body:", req.body);

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
        // Collect all unique category IDs from all filter objects
        const allUniqueCategoryIds = new Set();
        const allUniqueSubCategoryIds = new Set();
        const allUniqueSubCategoryBrands = new Set();
        let primarySearchType = null;
        let combinedFilters = {}; // To merge filters from all objects

        // Process each filter object
        req.body.forEach((filterObj, index) => {
            const { 
                searchType,
                uniqueIDClickedCategories,
                uniqueIDClickedSubCategories,
                uniqueIDClickedSubCategoriesBrands,
                filters // Extract filters from each object
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

            // Merge filters - last filter wins if there are conflicts
            if (filters && typeof filters === 'object') {
                combinedFilters = { ...combinedFilters, ...filters };
            }

            // Collect category IDs
            if (Array.isArray(uniqueIDClickedCategories)) {
                uniqueIDClickedCategories.forEach(categoryId => {
                    if (categoryId && typeof categoryId === 'string' && categoryId.trim()) {
                        allUniqueCategoryIds.add(categoryId);
                    }
                });
            }

            // 🔥 FIXED: Collect sub-category IDs - handle both strings and objects
            if (Array.isArray(uniqueIDClickedSubCategories)) {
                uniqueIDClickedSubCategories.forEach(subCategory => {
                    if (subCategory) {
                        // If it's a string, use it directly
                        if (typeof subCategory === 'string' && subCategory.trim()) {
                            allUniqueSubCategoryIds.add(subCategory);
                        } 
                        // If it's an object, extract the ID
                        else if (typeof subCategory === 'object') {
                            // Try different possible ID field names
                            const id = subCategory.id || subCategory._id || subCategory.value || subCategory.key;
                            if (id && typeof id === 'string' && id.trim()) {
                                allUniqueSubCategoryIds.add(id);
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


        // If no valid category IDs found, return empty results
        if (finalCategoryIds.length === 0 && finalSubCategoryIds.length === 0) {
            
            // Still return categories, brands and filters for UI
            const allLocations = await FastOrderLocation.find({idSupplier: String(user_id)});
            const sortedLocations = allLocations[0]?.locations || [];
            const allFastEditBrands = await FastOrderBrand.find().select('-_id');
            const allFastEditFilters = await FastOrderFilter.find().select('-_id');
            const allCats = await FastOrderCategory.find().select('-_id');
            
            const newFilters = {
                sellers: allFastEditFilters[0]?.sellers || [],
                colors: allFastEditFilters[0]?.colors || [],
                deliveryTime: allFastEditFilters[0]?.deliveryTime || []
            };

            return res.status(200).json({
                products: [],
                brands: allFastEditBrands,
                filters: newFilters,
                category: allCats,
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
        
        // Add category conditions
        if (finalCategoryIds.length > 0 && finalSubCategoryIds.length > 0) {
            // If both categories and sub-categories are selected, use OR condition
            productQuery.$or = [
                { "general.categoryId": { $in: finalCategoryIds } },
                { "general.subCategoryId": { $in: finalSubCategoryIds } }
            ];
        } else if (finalCategoryIds.length > 0) {
            // Only categories
            productQuery["general.categoryId"] = { $in: finalCategoryIds };
        } else if (finalSubCategoryIds.length > 0) {
            // Only sub-categories
            productQuery["general.subCategoryId"] = { $in: finalSubCategoryIds };
        }

        // Apply filters to the query based on combinedFilters
        if (combinedFilters.color && combinedFilters.color !== 'all') {
            productQuery["combinations.options.color"] = combinedFilters.color;
        }

        if (combinedFilters.stockStatus && combinedFilters.stockStatus !== 'all') {
            const hasStock = combinedFilters.stockStatus === 'true' || combinedFilters.stockStatus === true;
            if (hasStock) {
                productQuery["combinations.suppliers.stock"] = { $gt: 0 };
            }
        }

        if (combinedFilters.minStock && !isNaN(combinedFilters.minStock)) {
            productQuery["combinations.suppliers.stock"] = { 
                $gte: parseInt(combinedFilters.minStock) 
            };
        }

        if (combinedFilters.supplier && combinedFilters.supplier !== 'all') {
            productQuery["combinations.suppliers.id"] = combinedFilters.supplier;
        }


        // Find products using the built query
        const products = await SingleProduct.find(productQuery).select('-_id').lean();


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
            if (!firstCombination || !firstCombination.suppliers || firstCombination.suppliers.length === 0) {
                return; // Skip this product if no suppliers
            }
            
            const firstSupplier = firstCombination.suppliers[0];
            const { id, name, ...restSupplierData } = firstSupplier;

            // Process product combinations and collect all suppliers
            product.combinations.forEach(combination => {
                if (!combination.suppliers || combination.suppliers.length === 0) return;

                combination.suppliers.forEach(item => {
                    // Apply supplier-specific filters
                    if (combinedFilters.supplier && combinedFilters.supplier !== 'all') {
                        if (item.id !== combinedFilters.supplier) return;
                    }

                    if (combinedFilters.stockStatus && combinedFilters.stockStatus !== 'all') {
                        const hasStock = combinedFilters.stockStatus === 'true' || combinedFilters.stockStatus === true;
                        if (hasStock && (!item.stock || item.stock <= 0)) return;
                    }

                    if (combinedFilters.minStock && !isNaN(combinedFilters.minStock)) {
                        const minStock = parseInt(combinedFilters.minStock);
                        if (!item.stock || item.stock < minStock) return;
                    }

                    allSuppliers.push({
                        ...item, // Spread supplier details
                        combinationsID: combination.id, // Attach combination ID
                        attributes: combination.options, // Add attributes
                    });
                });
            });

            // If no suppliers pass the filters, skip this product
            if (allSuppliers.length === 0) return;

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

        // Apply sorting if specified
        if (combinedFilters.sort) {
            sortedProducts.forEach(category => {
                if (combinedFilters.sort === 'bestPrice') {
                    category.items.sort((a, b) => (a.price || 0) - (b.price || 0));
                } else if (combinedFilters.sort === 'highestStock') {
                    category.items.sort((a, b) => (b.stock || 0) - (a.stock || 0));
                }
            });
        }

        // Get supplier locations
        const allLocations = await FastOrderLocation.find({idSupplier: String(user_id)});
        const sortedLocations = allLocations[0]?.locations || [];

        // Get brands, filters, and categories
        const allFastEditBrands = await FastOrderBrand.find().select('-_id');
        const allFastEditFilters = await FastOrderFilter.find().select('-_id');
        const allCats = await FastOrderCategory.find().select('-_id');
        
        const newFilters = {
            sellers: allFastEditFilters[0]?.sellers || [],
            colors: allFastEditFilters[0]?.colors || [],
            deliveryTime: allFastEditFilters[0]?.deliveryTime || []
        };

        res.status(200).json({
            products: sortedProducts,
            brands: allFastEditBrands,
            filters: newFilters,
            category: allCats,
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
        console.error("Error fetching table data:", error);
        res.status(500).json({ 
            message: "Failed to fetch fast edit category mode table data",
            error: error.message 
        });


    }
};