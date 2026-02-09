// backend/controllers/bulkPriceUpdateController.js
import SingleProduct from "../models/SingleProduct.js";
import getUserFromToken from "../libs/verifyToken.js";

/**
 * Bulk update prices for products based on filters
 * Supports both brand mode and category mode
 */
export const bulkUpdatePrices = async (req, res) => {
  console.log("========== BULK PRICE UPDATE START ==========");
  console.log("Received request body:", JSON.stringify(req.body, null, 2));

  const { searchType, filters, percentage } = req.body;

  console.log(JSON.stringify({ searchType, filters, percentage }));

  // Validate required fields
  if (!searchType || !filters || percentage === undefined || percentage === null) {
    return res.status(400).json({
      message: "پارامترهای ضروری ارسال نشده‌اند",
      required: ["searchType", "filters", "percentage"]
    });
  }

  // Validate percentage
  if (typeof percentage !== "number" || percentage < -100 || percentage > 100) {
    return res.status(400).json({
      message: "درصد باید عددی بین -100 تا 100 باشد"
    });
  }

  // User authentication check
  const tokenData = getUserFromToken(req, res);
  if (!tokenData || !tokenData.user_id) {
    return res.status(401).json({ message: "Unauthorized: user not found" });
  }
  const { user_id, decoded, role } = tokenData;
  console.log("User Info:", { user_id, role });
  if (role !== "supplier") {
    return res.status(403).json({ message: "شما دسترسی به این عملیات را ندارید" });
  }

  try {
    let productQuery = {};
    let updateResult;

    // Build query based on search type
    if (searchType === "brand") {
      const {
        uniqueIDClickedBrands = [],
        uniqueIDClickedBrandsCategories = [],
        filterBrandsCategorySubCategoryStorage = []
      } = filters;

      console.log("Brand Mode Filters:");
      console.log("- Brands:", uniqueIDClickedBrands);
      console.log("- Brand Categories:", uniqueIDClickedBrandsCategories);
      console.log("- Sub Categories:", filterBrandsCategorySubCategoryStorage);

      if (uniqueIDClickedBrands.length === 0) {
        return res.status(400).json({
          message: "هیچ برندی انتخاب نشده است"
        });
      }

      // Build query for brand mode
      // If brand categories are selected, filter by both brand and category
      if (uniqueIDClickedBrandsCategories.length > 0) {
        const brandCategoryConditions = uniqueIDClickedBrandsCategories.map(bc => ({
          $and: [
            { "general.brandId": bc.idBrand },
            { "general.categoryId": { $in: bc.idCategories || [] } }
          ]
        }));

        // Also include brands without specific category filters
        const brandsWithoutCategoryFilter = uniqueIDClickedBrands.filter(brandId => 
          !uniqueIDClickedBrandsCategories.some(bc => bc.idBrand === brandId)
        );

        if (brandsWithoutCategoryFilter.length > 0) {
          productQuery.$or = [
            ...brandCategoryConditions,
            { "general.brandId": { $in: brandsWithoutCategoryFilter } }
          ];
        } else {
          productQuery.$or = brandCategoryConditions;
        }
      } else {
        // Simple brand filter
        productQuery["general.brandId"] = { $in: uniqueIDClickedBrands };
      }

    } else if (searchType === "category") {
      const {
        uniqueIDClickedCategories = [],
        uniqueIDClickedSubCategories = [],
        uniqueIDClickedSubCategoriesBrands = []
      } = filters;

      console.log("Category Mode Filters:");
      console.log("- Categories:", uniqueIDClickedCategories);
      console.log("- Sub Categories:", uniqueIDClickedSubCategories);
      console.log("- Brands:", uniqueIDClickedSubCategoriesBrands);

      if (uniqueIDClickedCategories.length === 0 && uniqueIDClickedSubCategories.length === 0) {
        return res.status(400).json({
          message: "هیچ دسته‌بندی یا زیردسته‌ای انتخاب نشده است"
        });
      }

      // Build query for category mode
      const conditions = [];

      if (uniqueIDClickedCategories.length > 0) {
        conditions.push({ "general.categoryId": { $in: uniqueIDClickedCategories } });
      }

      if (uniqueIDClickedSubCategories.length > 0) {
        // Handle both string IDs and object IDs
        const subCategoryIds = uniqueIDClickedSubCategories.map(sc => 
          typeof sc === 'string' ? sc : (sc.id || sc._id || sc.value)
        ).filter(Boolean);
        
        if (subCategoryIds.length > 0) {
          conditions.push({ "general.subCategoryId": { $in: subCategoryIds } });
        }
      }

      if (conditions.length > 1) {
        productQuery.$or = conditions;
      } else if (conditions.length === 1) {
        productQuery = conditions[0];
      }

    } else {
      return res.status(400).json({
        message: "نوع جستجو نامعتبر است. باید 'brand' یا 'category' باشد"
      });
    }

    console.log("Final Product Query:", JSON.stringify(productQuery, null, 2));

    // Find matching products first to get count
    const matchingProducts = await SingleProduct.find(productQuery).lean();
    console.log(`Found ${matchingProducts.length} products matching the criteria`);

    if (matchingProducts.length === 0) {
      return res.status(404).json({
        message: "هیچ محصولی با فیلترهای انتخاب شده یافت نشد",
        updatedCount: 0
      });
    }

    // Calculate the multiplier for price update
    // percentage > 0 means increase, percentage < 0 means decrease
    const multiplier = 1 + (percentage / 100);
    console.log(`Price multiplier: ${multiplier} (${percentage}%)`);

    // Update all matching products
    // We need to update the price in all suppliers within all combinations
    let totalSuppliersUpdated = 0;

    for (const product of matchingProducts) {
      const updateOperations = {};
      let supplierIndex = 0;

      if (product.combinations && Array.isArray(product.combinations)) {
        product.combinations.forEach((combination, combIdx) => {
          if (combination.suppliers && Array.isArray(combination.suppliers)) {
            combination.suppliers.forEach((supplier, suppIdx) => {
              // Update regularPrice
              const currentRegularPrice = supplier.price?.regularPrice || 0;
              const newRegularPrice = Math.round(currentRegularPrice * multiplier);
              updateOperations[`combinations.${combIdx}.suppliers.${suppIdx}.price.regularPrice`] = newRegularPrice;

              // Update discountedPrice if exists
              const currentDiscountedPrice = supplier.price?.discountedPrice || 0;
              if (currentDiscountedPrice > 0) {
                const newDiscountedPrice = Math.round(currentDiscountedPrice * multiplier);
                updateOperations[`combinations.${combIdx}.suppliers.${suppIdx}.price.discountedPrice`] = newDiscountedPrice;
              }

              // Optionally update foreignCurrencyPrice
              const currentForeignPrice = supplier.price?.foreignCurrencyPrice || 0;
              if (currentForeignPrice > 0) {
                const newForeignPrice = Math.round(currentForeignPrice * multiplier);
                updateOperations[`combinations.${combIdx}.suppliers.${suppIdx}.price.foreignCurrencyPrice`] = newForeignPrice;
              }

              supplierIndex++;
            });
          }
        });
      }

      if (Object.keys(updateOperations).length > 0) {
        await SingleProduct.findOneAndUpdate(
          { id: product.id },
          { $set: updateOperations },
          { new: true, runValidators: false }
        );
        totalSuppliersUpdated += supplierIndex;
      }
    }

    console.log(`Updated ${matchingProducts.length} products, ${totalSuppliersUpdated} suppliers`);
    console.log("========== BULK PRICE UPDATE END ==========");

    res.status(200).json({
      message: `قیمت ${matchingProducts.length} محصول با موفقیت ${percentage > 0 ? 'افزایش' : 'کاهش'} یافت`,
      state: "ok",
      updatedCount: matchingProducts.length,
      totalSuppliersUpdated,
      percentage,
      searchType,
      filters: {
        brandCount: searchType === "brand" ? (filters.uniqueIDClickedBrands?.length || 0) : 0,
        categoryCount: searchType === "category" ? (filters.uniqueIDClickedCategories?.length || 0) : 0,
      }
    });

  } catch (error) {
    console.error("========== ERROR ==========");
    console.error("Error in bulk price update:", error);
    console.error("Error stack:", error.stack);
    console.error("========== ERROR END ==========");

    res.status(500).json({
      message: "خطایی در بروزرسانی قیمت‌ها رخ داد",
      error: error.message
    });
  }
};