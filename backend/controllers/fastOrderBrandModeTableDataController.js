import FastOrderFilter from '../models/FastOrderFilter.js';
import FastOrderBrand from '../models/FastOrderBrand.js';
import SingleProduct from '../models/SingleProduct.js';
import FastOrderLocation from '../models/FastOrderLocation.js';
import FiltersSettingsBrand from '../models/SearchBrandSchema.js'

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
      if (key !== '_id' && key !== '__v' && key !== 'ICPrice') { // ⭐ Added ICPrice
        newObj[key] = removeIdFields(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
};

export const getFastOrderBrandModeTableData = async (req, res) => {
    console.log("Received request body:", JSON.stringify(req.body));

    if (!Array.isArray(req.body)) {
        return res.status(400).json({ message: "Request body must be an array of filter objects" });
    }

    if (req.body.length === 0) {
        return res.status(400).json({ message: "At least one filter object is required" });
    }

    try {
        const allUniqueBrandIds = new Set();
        const allUniqueBrandCategories = new Set();
        const allFilterStorage = [];
        let primarySearchType = null;

        req.body.forEach((filterObj, index) => {
            const { 
                searchType, 
                uniqueIDClickedBrands, 
                uniqueIDClickedBrandsCategories, 
                filterBrandsCategorySubCategoryStorage,
            } = filterObj;

            if (searchType !== "brand") {
                console.warn(`Filter ${index}: Invalid search type "${searchType}", skipping`);
                return;
            }

            if (!primarySearchType) {
                primarySearchType = searchType;
            }

            if (Array.isArray(uniqueIDClickedBrands)) {
                uniqueIDClickedBrands.forEach(brandId => {
                    if (brandId && brandId.trim()) {
                        allUniqueBrandIds.add(brandId);
                    }
                });
            }

            if (Array.isArray(uniqueIDClickedBrandsCategories)) {
                uniqueIDClickedBrandsCategories.forEach(category => {
                    if (category) {
                        allUniqueBrandCategories.add(JSON.stringify(category));
                    }
                });
            }

            if (Array.isArray(filterBrandsCategorySubCategoryStorage)) {
                filterBrandsCategorySubCategoryStorage.forEach(storage => {
                    if (storage) {
                        allFilterStorage.push(storage);
                    }
                });
            }
        });

        const finalBrandIds = Array.from(allUniqueBrandIds);
        const finalBrandCategories = Array.from(allUniqueBrandCategories).map(cat => {
            try {
                return JSON.parse(cat);
            } catch (e) {
                return cat;
            }
        });

        console.log("Processed filters:", {
            searchType: primarySearchType,
            totalFilterObjects: req.body.length,
            finalBrandIds,
            finalBrandCategoriesCount: finalBrandCategories.length,
            filterStorageCount: allFilterStorage.length
        });

        if (finalBrandIds.length === 0) {
            console.log("No valid brand IDs found, returning empty results");
            
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
                meta: {
                    totalFilters: req.body.length,
                    processedBrandIds: finalBrandIds,
                    message: "No products found for the provided filters"
                }
            });
        }

        const products = await SingleProduct.find({
            "general.brandId": { $in: finalBrandIds }
        }).lean();

        console.log(`Found ${products.length} products for brand IDs:`, finalBrandIds);

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

            const firstCombination = product.combinations[0];  
            const firstSupplier = firstCombination.suppliers[0];  

            const { id, name, ...restSupplierData } = firstSupplier;

            product.combinations.map(combination => {
                if (!combination.suppliers || combination.suppliers.length === 0) return;

                combination.suppliers.map(item => {
                    allSuppliers.push({
                        ...item,
                        combinationsID: combination.id,
                        attributes: addOptionLabels(combination.options), // ----- MODIFIED 2026-02-07: include color label -----
                    });
                });
            });

            allSuppliersF = allSuppliers.filter(supplier => supplier.psid !== firstSupplier.psid);

            const supplierWithProductID = {
                ...restSupplierData,
                seller: { id, label: name },
                productId: product.id,
                id: product.id,
                combinationsID: firstCombination.id,
                attributes: addOptionLabels(firstCombination.options), // ----- MODIFIED 2026-02-07: include color label -----
                name: product.general.title,
                nodes: allSuppliersF.map(supplier => ({
                    ...supplier,
                    seller: { id: supplier.id, label: supplier.name },
                    name: product.general.title,
                    id: product.id,
                    productId: product.id,
                }))
            };

            sortedProductsMap.get(brandId).items.push(supplierWithProductID);
        });

        const sortedProducts = Array.from(sortedProductsMap.values());

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
            meta: {
                totalFilters: req.body.length,
                processedBrandIds: finalBrandIds,
                totalProductsFound: products.length,
                totalBrandsWithProducts: sortedProducts.length
            }
        });

    } catch (error) {
        console.error("Error fetching table data:", error);
        res.status(500).json({ 
            message: "Failed to fetch fast order brand mode table data",
            error: error.message 
        });
    }
};

export const fetchTableDataByIds = async (req, res) => {
    const { searchType } = req.query;
    const { ids } = req.body;

    console.log(JSON.stringify(req.body))

  if (searchType !== "brand") {
    return res.status(400).json({ message: "Only 'brand' search type is supported currently" });
  }

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "No filter IDs provided" });
  }

  try {
    const savedFiltersDoc = await FiltersSettingsBrand.findOne({
      "searches.id": { $in: ids }
    }).lean();

    if (!savedFiltersDoc) {
      return res.status(404).json({ message: "No saved filters found" });
    }

    const selectedFilters = savedFiltersDoc.searches.filter(search => 
      ids.includes(search.id)
    );

    const allBrandIds = new Set();
    const allBrandCategories = [];
    const allBrandSubCategories = [];

    selectedFilters.forEach(filter => {
      if (filter.uniqueIDClickedBrands) {
        filter.uniqueIDClickedBrands.forEach(brandId => allBrandIds.add(brandId));
      }

      if (filter.uniqueIDClickedBrandsCategories) {
        allBrandCategories.push(...filter.uniqueIDClickedBrandsCategories);
      }

      if (filter.filterBrandsCategorySubCategoryStorage) {
        allBrandSubCategories.push(...filter.filterBrandsCategorySubCategoryStorage);
      }
    });

    const uniqueIDClickedBrands = Array.from(allBrandIds);

    if (uniqueIDClickedBrands.length === 0) {
      return res.status(400).json({ message: "No brand IDs found in saved filters" });
    }

    const products = await SingleProduct.find({
      "general.brandId": { $in: uniqueIDClickedBrands }
    }).lean();

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

      const firstCombination = product.combinations[0];  
      const firstSupplier = firstCombination.suppliers[0];  

      const { id, name, ...restSupplierData } = firstSupplier;

      product.combinations.map(combination => {
        if (!combination.suppliers || combination.suppliers.length === 0) return;

        combination.suppliers.map(item => {
          allSuppliers.push({
            ...item,
            combinationsID: combination.id,
            attributes: addOptionLabels(combination.options), // ----- MODIFIED 2026-02-07: include color label -----
          });
        });
      });

      allSuppliersF = allSuppliers.filter(supplier => supplier.psid !== firstSupplier.psid);

      const supplierWithProductID = {
        ...restSupplierData,
        seller: { id, label: name },
        productId: product.id,
        id: product.id,
        combinationsID: firstCombination.id,
        attributes: addOptionLabels(firstCombination.options), // ----- MODIFIED 2026-02-07: include color label -----
        name: product.general.title,
        nodes: allSuppliersF.map(supplier => ({
          ...supplier,
          seller: { id: supplier.id, label: supplier.name },
          name: product.general.title,
          id: product.id,
          productId: product.id,
        }))
      };

      sortedProductsMap.get(brandId).items.push(supplierWithProductID);
    });

    const sortedProducts = Array.from(sortedProductsMap.values());

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
      appliedFilters: selectedFilters.map(f => ({ id: f.id, name: f.filterName }))
    });

  } catch (error) {
    console.error("Failed to fetch table data by filter IDs:", error);
    res.status(500).json({ message: "Server error fetching table data by filter IDs" });
  }
};