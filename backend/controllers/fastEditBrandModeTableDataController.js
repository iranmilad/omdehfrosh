import FastOrderFilter from '../models/FastOrderFilter.js'
import FastOrderBrand from '../models/FastOrderBrand.js';
import SingleProduct from '../models/SingleProduct.js';
import FastOrderCategory from '../models/FastOrderCategory.js';
import FastOrderLocation from '../models/FastOrderLocation.js';
import getUserFromToken from '../libs/verifyToken.js';

// ============================================
// HELPER FUNCTION TO REMOVE ICPrice
// ============================================
const removeICPriceFromSupplier = (supplier) => {
    if (!supplier) return supplier;
    
    const cleanedSupplier = { ...supplier };
    
    if (cleanedSupplier.price && cleanedSupplier.price.ICPrice) {
        cleanedSupplier.price = {
            regularPrice: cleanedSupplier.price.regularPrice,
            discountedPrice: cleanedSupplier.price.discountedPrice,
            discountPercent: cleanedSupplier.price.discountPercent
        };
    }
    
    return cleanedSupplier;
};

const removeICPriceFromProducts = (products) => {
    return products.map(product => {
        const cleanedProduct = { ...product };
        
        if (cleanedProduct.combinations && Array.isArray(cleanedProduct.combinations)) {
            cleanedProduct.combinations = cleanedProduct.combinations.map(combination => {
                const cleanedCombination = { ...combination };
                
                if (cleanedCombination.suppliers && Array.isArray(cleanedCombination.suppliers)) {
                    cleanedCombination.suppliers = cleanedCombination.suppliers.map(removeICPriceFromSupplier);
                }
                
                return cleanedCombination;
            });
        }
        
        return cleanedProduct;
    });
};



// ============================================
// BRAND MODE API
// ============================================
export const getFastEditBrandModeTableData = async (req, res) => {
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
            const allFastEditBrands = await FastOrderBrand.find();
            const allFastEditFilters = await FastOrderFilter.find();
            const newFilters = {
                sellers: allFastEditFilters[0]?.sellers || [],
                colors: allFastEditFilters[0]?.colors || [],
                deliveryTime: allFastEditFilters[0]?.deliveryTime || []
            };

            return res.status(200).json({
                products: [],
                brands: allFastEditBrands,
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
        let products = await SingleProduct.find({
            "general.brandId": { $in: finalBrandIds }
        }).lean();

        // 🔥 REMOVE ICPrice FROM ALL PRODUCTS
        products = removeICPriceFromProducts(products);
        console.log(`✓ Removed ICPrice from ${products.length} products`);

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
                        ...item, // Spread supplier details (ICPrice already removed)
                        combinationsID: combination.id, // Attach combination ID
                        attributes: combination.options, // Add attributes
                    });
                });
            });

            // Remove the first supplier from all suppliers
            allSuppliersF = allSuppliers.filter(supplier => supplier.psid !== firstSupplier.psid);

            // Create the primary supplier object with nodes
            const supplierWithProductID = {
                ...restSupplierData, // Remaining supplier data (excluding id & name, ICPrice already removed)
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
            sortedProductsMap.get(brandId).items.push(supplierWithProductID);
        });

        const sortedProducts = Array.from(sortedProductsMap.values());

        // Get supplier locations
        const allLocations = await FastOrderLocation.find({idSupplier: String(user_id)});
        const sortedLocations = allLocations[0]?.locations || [];

        // Get brands and filters
        const allFastEditBrands = await FastOrderBrand.find();
        const allFastEditFilters = await FastOrderFilter.find();
        const newFilters = {
            sellers: allFastEditFilters[0]?.sellers || [],
            colors: allFastEditFilters[0]?.colors || [],
            deliveryTime: allFastEditFilters[0]?.deliveryTime || []
        };


        res.status(200).json({
            products: sortedProducts,
            brands: allFastEditBrands,
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