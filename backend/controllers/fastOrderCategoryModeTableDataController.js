import FastOrderFilter from '../models/FastOrderFilter.js'
import FastOrderBrand from '../models/FastOrderBrand.js';
import SingleProduct from '../models/SingleProduct.js';
import FastOrderCategory from '../models/FastOrderCategory.js';
import FastOrderLocation from '../models/FastOrderLocation.js';
import FiltersSettingsCategory from '../models/SeachCategorySchema.js'


export const getFastOrderCategoryModeTableData = async (req, res) => {
    const {     
      searchType,
      uniqueIDClickedCategories,
      uniqueIDClickedSubCategories,
      uniqueIDClickedSubCategoriesBrands 
    } = req.body;



    
    if (searchType !== "category") return res.status(400).json({ message: "Invalid search type" });

    try {
        if (!Array.isArray(uniqueIDClickedCategories)) {
            return res.status(400).json({ message: "Invalid brand IDs array" });
        }

        const products = await SingleProduct.find({
            "general.categoryId": { $in: uniqueIDClickedCategories }
        }).lean();

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

        const allFastEditBrands = await FastOrderBrand.find();
        const allFastEditFilters = await FastOrderFilter.find();
        const newFilters = {
            sellers: allFastEditFilters[0]?.sellers || [],
            colors: allFastEditFilters[0]?.colors || [],
            deliveryTime: allFastEditFilters[0]?.deliveryTime || []
        };
        const allCats = await FastOrderCategory.find()

        res.status(200).json({
            products: sortedProducts,
            brands: allFastEditBrands,
            filters: newFilters,
            category: allCats,

        });
    } catch (error) {
        console.error("Error fetching table data:", error);
        res.status(500).json({ message: "Failed to fetch fast order brand mode table data" });
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
        });

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
        const allFastEditCategories = await FastOrderCategory.find();
        const allFastEditFilters = await FastOrderFilter.find();
        const newFilters = {
            sellers: allFastEditFilters[0]?.sellers || [],
            colors: allFastEditFilters[0]?.colors || [],
            deliveryTime: allFastEditFilters[0]?.deliveryTime || []
        };


        res.status(200).json({
            products: sortedProducts,
            category: allFastEditCategories, // Changed from 'brands' to 'category'
            filters: newFilters,
            // Optional: include metadata about which filters were applied
            appliedFilters: selectedFilters.map(f => ({ id: f.id, name: f.filterName }))
        });

    } catch (error) {
        console.error("Failed to fetch table data by filter IDs:", error);
        res.status(500).json({ message: "Server error fetching table data by filter IDs" });
    }
};