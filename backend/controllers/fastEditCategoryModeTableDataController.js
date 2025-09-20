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
                    if (categoryId && categoryId.trim()) {
                        allUniqueCategoryIds.add(categoryId);
                    }
                });
            }

            // Collect sub-category IDs
            if (Array.isArray(uniqueIDClickedSubCategories)) {
                uniqueIDClickedSubCategories.forEach(subCategoryId => {
                    if (subCategoryId && subCategoryId.trim()) {
                        allUniqueSubCategoryIds.add(subCategoryId);
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

        // console.log("Processed filters:", {
        //     searchType: primarySearchType,
        //     totalFilterObjects: req.body.length,
        //     finalCategoryIds,
        //     finalSubCategoryIdsCount: finalSubCategoryIds.length,
        //     finalSubCategoryBrandsCount: finalSubCategoryBrands.length,
        //     supplierId: user_id
        // });

        // If no valid category IDs found, return empty results
        if (finalCategoryIds.length === 0) {
            // console.log("No valid category IDs found, returning empty results");
            
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
                    message: "No products found for the provided filters"
                }
            });
        }

        // Find products using the combined category IDs
        const products = await SingleProduct.find({
            "general.categoryId": { $in: finalCategoryIds }
        }).select('-_id').lean();

        // console.log(`Found ${products.length} products for category IDs:`, finalCategoryIds);

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