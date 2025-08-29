import TrendProduct from "../../models/TrendProduct.js";

// Get all trend products
export const getAllTrendProducts = async (req, res) => {
  try {
    const trendProducts = await TrendProduct.find(); // Fetch all trend products from the database
    res.status(200).json(trendProducts);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve trend products", error });
  }
};

// Get a trend product by ID
export const getTrendProductById = async (req, res) => {
  try {
    const trendProduct = await TrendProduct.findById(req.params.id); // Fetch trend product by ID
    if (!trendProduct) {
      return res.status(404).json({ message: "Trend product not found" });
    }
    res.status(200).json(trendProduct);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve trend product", error });
  }
};

// Create a new trend product
export const createTrendProduct = async (req, res) => {
  const { category, products } = req.body;

  try {
    const newTrendProduct = new TrendProduct({
      category,
      products,
    });

    await newTrendProduct.save(); // Save new trend product to database
    res.status(201).json({ message: "Trend product created successfully", product: newTrendProduct });
  } catch (error) {
    res.status(500).json({ message: "Failed to create trend product", error });
  }
};

// Update an existing trend product by ID
export const updateTrendProduct = async (req, res) => {
  const { id } = req.params;
  const { category, products } = req.body;

  try {
    const updatedTrendProduct = await TrendProduct.findByIdAndUpdate(
      id,
      { category, products },
      { new: true } // Return the updated document
    );

    if (!updatedTrendProduct) {
      return res.status(404).json({ message: "Trend product not found" });
    }

    res.status(200).json({ message: "Trend product updated successfully", product: updatedTrendProduct });
  } catch (error) {
    res.status(500).json({ message: "Failed to update trend product", error });
  }
};

// Delete a trend product by ID
export const deleteTrendProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTrendProduct = await TrendProduct.findByIdAndDelete(id); // Delete trend product by ID

    if (!deletedTrendProduct) {
      return res.status(404).json({ message: "Trend product not found" });
    }

    res.status(200).json({ message: "Trend product deleted successfully", product: deletedTrendProduct });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete trend product", error });
  }
};

// Batch import trend products
export const batchImportTrendProducts = async (req, res) => {
  const trendProducts = req.body; // Extract trend products array properly

  // if (!Array.isArray(trendProducts) || trendProducts.length === 0) {
  //   return res.status(400).json({ message: "Invalid data. Expected an array of trend products." });
  // }

  try {
    // Insert trend products into the database using insertMany
    const result = await TrendProduct.insertMany(trendProducts);

    res.status(201).json({
      message: `${result.length} trend products imported successfully`,
      products: result,
    });
  } catch (error) {
    res.status(500).json({ message: "Error importing trend products", error });
  }
};
