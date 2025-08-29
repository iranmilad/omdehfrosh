import HomePageProduct from "../models/HomePageProduct.js";

// Get all home page products
export const getAllHomePageProducts = async (req, res) => {
  try {
    const products = await HomePageProduct.find(); // Fetch all products from the database
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve products", error });
  }
};

// Get a product by ID
export const getHomePageProductById = async (req, res) => {
  try {
    const product = await HomePageProduct.findById(req.params.id); // Fetch product by ID
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve product", error });
  }
};

// Create a new home page product
export const createHomePageProduct = async (req, res) => {
  const { id, title, slug, regularPrice, discountedPrice, discountPercent, image } = req.body;

  try {
    const newProduct = new HomePageProduct({
      id,
      title,
      slug,
      regularPrice,
      discountedPrice,
      discountPercent,
      image,
    });

    await newProduct.save(); // Save new product to database
    res.status(201).json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Failed to create product", error });
  }
};

// Update an existing product by ID
export const updateHomePageProduct = async (req, res) => {
  const { id } = req.params;
  const { title, slug, regularPrice, discountedPrice, discountPercent, image } = req.body;

  try {
    const updatedProduct = await HomePageProduct.findByIdAndUpdate(
      id,
      { title, slug, regularPrice, discountedPrice, discountPercent, image },
      { new: true } // Return the updated document
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: "Failed to update product", error });
  }
};

// Delete a product by ID
export const deleteHomePageProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProduct = await HomePageProduct.findByIdAndDelete(id); // Delete product by ID

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully", product: deletedProduct });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product", error });
  }
};


export const batchImportHomePageProducts = async (req, res) => {
  const products = req.body.products;

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: "products must be a non-empty array" });
  }

  try {
    const result = await HomePageProduct.insertMany(products, {
      ordered: false, // continue inserting even if some fail
    });

    res.status(201).json({
      message: `${result.length} products imported successfully`,
      products: result,
    });
  } catch (error) {
    // insertMany throws if any duplicates exist, but successful ones still get inserted
    console.error("Error importing products:", error);

    res.status(207).json({
      message: "Batch import completed with some errors",
      insertedCount: error.result?.insertedCount || 0,
      errors: error.writeErrors?.map(e => e.errmsg) || [error.message],
    });
  }
};