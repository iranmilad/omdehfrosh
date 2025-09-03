import Archive from "../models/Archive.js"; // Mongo model


// POST /brandproducts
export const getBrandProducts = async (req, res) => {

  
  


  try {
    const { brand, page } = req.body;



    const archive = await Archive.findOne(); // assuming single archive document

    if (!archive) {
      return res.status(404).json({ status: 404, message: "No brand products found" });
    }

    // 🔹 Remove the "brands" filter if brand is specified
    const updatedFilters = brand
      ? archive.filters.filter((f) => f.key !== "brands")
      : archive.filters;

      
    res.json({
      message: "محصولات با موفقیت ارسال شدند",
      state: "ok",
      data: {
        products: archive.products,        // ✅ full list
        totalPages: archive.totalPages,
        currentPage: page,
        totalProducts: archive.products.length,
        price: archive.price,
        filters: updatedFilters,           // ✅ brands removed if requested
      },
    });
  } catch (err) {
    console.error("Error fetching brand products:", err);
    res.status(500).json({ status: 500, message: "Server error while fetching brand products" });
  }
};


// GET /brandproducts/filters
export const getFilterOptions = async (req, res) => {
  try {
    const archive = await Archive.findOne();

    if (!archive) {
      return res.status(404).json({ status: 404, message: "No filters found" });
    }

    res.json({
      data: archive.filters,
    });
  } catch (err) {
    console.error("Error fetching filter options:", err);
    res.status(500).json({ status: 500, message: "Server error while fetching filters" });
  }
};
