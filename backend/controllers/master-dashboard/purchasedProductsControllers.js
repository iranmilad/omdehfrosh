import PurchasedProduct from '../../models/PurchasedProducts.js'

// Get all purchased products
export const getAllPurchasedProducts = async (req, res) => {
  try {
    const purchasedProducts = await PurchasedProduct.find();
    res.status(200).json(purchasedProducts);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve purchased products", error });
  }
};

// Get a purchased product by ID
export const getPurchasedProductById = async (req, res) => {
  try {
    const purchasedProduct = await PurchasedProduct.findById(req.params.id);
    if (!purchasedProduct) {
      return res.status(404).json({ message: "Purchased product not found" });
    }
    res.status(200).json(purchasedProduct);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve purchased product", error });
  }
};

// Create a new purchased product
export const createPurchasedProduct = async (req, res) => {
  const { productId, sellerId, combinationsID, title, regularPrice, discountedPrice, discountPercent, image } = req.body;

  try {
    const newPurchasedProduct = new PurchasedProduct({ productId, sellerId, combinationsID, title, regularPrice, discountedPrice, discountPercent, image });
    await newPurchasedProduct.save();
    res.status(201).json({ message: "Purchased product created successfully", purchasedProduct: newPurchasedProduct });
  } catch (error) {
    res.status(500).json({ message: "Failed to create purchased product", error });
  }
};

// Update an existing purchased product by ID
export const updatePurchasedProduct = async (req, res) => {
  const { id } = req.params;
  const { productId, sellerId, combinationsID, title, regularPrice, discountedPrice, discountPercent, image } = req.body;

  try {
    const updatedPurchasedProduct = await PurchasedProduct.findByIdAndUpdate(id, { productId, sellerId, combinationsID, title, regularPrice, discountedPrice, discountPercent, image }, { new: true });

    if (!updatedPurchasedProduct) {
      return res.status(404).json({ message: "Purchased product not found" });
    }

    res.status(200).json({ message: "Purchased product updated successfully", purchasedProduct: updatedPurchasedProduct });
  } catch (error) {
    res.status(500).json({ message: "Failed to update purchased product", error });
  }
};

// Delete a purchased product by ID
export const deletePurchasedProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPurchasedProduct = await PurchasedProduct.findByIdAndDelete(id);

    if (!deletedPurchasedProduct) {
      return res.status(404).json({ message: "Purchased product not found" });
    }

    res.status(200).json({ message: "Purchased product deleted successfully", purchasedProduct: deletedPurchasedProduct });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete purchased product", error });
  }
};

// Batch import purchased products
export const batchImportPurchasedProducts = async (req, res) => {
    const { purchasedProducts } = req.body;
  
  
  
    try {

        
  
      // Insert purchased products into the database
      const result = await PurchasedProduct.insertMany(purchasedProducts);
  
      res.status(201).json({
        message: `${result.length} purchased products imported successfully`,
        purchasedProducts: result,
      });
    } catch (error) {
      console.error("Error importing purchased products:", error);
      res.status(500).json({ message: "Error importing purchased products", error: error.message });
    }
  };
  