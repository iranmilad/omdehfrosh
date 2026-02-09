import SingleProduct from "../models/SingleProduct.js";
import FastOrderBrand from "../models/FastOrderBrand.js";
import FastOrderFilter from "../models/FastOrderFilter.js";

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

export const fetchTableDataByIds = async (req, res) => {
  const { searchType } = req.params;
  const { ids } = req.body;

  if (searchType !== "brand") {
    return res.status(400).json({ message: "Only 'brand' search type is supported currently" });
  }

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "No IDs provided" });
  }

  try {
    const products = await SingleProduct.find({
      "general.brandId": { $in: ids }
    }).lean();

    const sortedProductsMap = new Map();

    products.forEach(product => {
      const { brandId, brandNamePer: brandName } = product.general;
      const allSuppliers = [];

      if (!sortedProductsMap.has(brandId)) {
        sortedProductsMap.set(brandId, {
          idBrand: brandId,
          label: brandName,
          items: []
        });
      }

      const firstCombination = product.combinations?.[0];
      const firstSupplier = firstCombination?.suppliers?.[0];

      if (!firstCombination || !firstSupplier) return;

      const { id, name, ...restSupplierData } = firstSupplier;

      product.combinations.forEach(comb => {
        comb.suppliers?.forEach(supplier => {
          allSuppliers.push({
            ...supplier,
            combinationsID: comb.id,
            attributes: addOptionLabels(comb.options) // ----- MODIFIED 2026-02-07: include color label -----
          });
        });
      });

      const otherSuppliers = allSuppliers.filter(s => s.psid !== firstSupplier.psid);

      const supplierWithProductID = {
        ...restSupplierData,
        seller: { id, label: name },
        productId: product.id,
        id: product.id,
        combinationsID: firstCombination.id,
        attributes: addOptionLabels(firstCombination.options), // ----- MODIFIED 2026-02-07: include color label -----
        name: product.general.title,
        nodes: otherSuppliers.map(supplier => ({
          ...supplier,
          seller: { id: supplier.id, label: supplier.name },
          name: product.general.title,
          id: product.id,
          productId: product.id
        }))
      };

      sortedProductsMap.get(brandId).items.push(supplierWithProductID);
    });

    const sortedProducts = Array.from(sortedProductsMap.values());
    const allBrands = await FastOrderBrand.find();
    const filtersDoc = await FastOrderFilter.findOne();

    res.status(200).json({
      products: sortedProducts,
      brands: allBrands,
      filters: {
        sellers: filtersDoc?.sellers || [],
        colors: filtersDoc?.colors || [],
        deliveryTime: filtersDoc?.deliveryTime || []
      }
    });
  } catch (error) {
    console.error("Failed to fetch table data by IDs:", error);
    res.status(500).json({ message: "Server error fetching table data by IDs" });
  }
};

