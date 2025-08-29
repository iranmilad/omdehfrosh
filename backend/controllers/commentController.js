import ProductComments from "../models/ProductComments.js";

// Get all product comments
export const getAllProductComments = async (req, res) => {
  try {
    const productComments = await ProductComments.find(); // Fetch all product comments from the database
    res.status(200).json(productComments);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve product comments", error });
  }
};

// Get product comments by product ID
export const getProductCommentsById = async (req, res) => {
  try {
  
    const productComments = await ProductComments.findOne({ productId: req.params.productId }); // Fetch product comments by product ID
    
    if (!productComments) {
      return res.status(404).json({ message: "Product comments not found" });
    }


    res.status(200).json(productComments);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve product comments", error });
  }
};

// Create or update comments for a product combination
export const addProductComment = async (req, res) => {
  const { productId, combinationId, supplierId, comment } = req.body;

  try {
    // Find product comments by productId
    const productComments = await ProductComments.findOne({ productId });

    if (!productComments) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find the specific combination and supplier
    const combination = productComments.productCombinations.find(comb => comb.combinationId === combinationId);
    if (!combination) {
      return res.status(404).json({ message: "Combination not found" });
    }

    const supplier = combination.suppliers.find(sup => sup.supplierId === supplierId);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    // Add the new comment to the supplier's comments array
    supplier.comments.push(comment);

    await productComments.save(); // Save the updated product comments

    res.status(200).json({ message: "Comment added successfully", productComments });
  } catch (error) {
    res.status(500).json({ message: "Failed to add comment", error });
  }
};

// Update an existing comment by commentId
export const updateProductComment = async (req, res) => {
  const { productId, combinationId, supplierId, commentId, updatedComment } = req.body;

  try {
    const productComments = await ProductComments.findOne({ productId });

    if (!productComments) {
      return res.status(404).json({ message: "Product not found" });
    }

    const combination = productComments.productCombinations.find(comb => comb.combinationId === combinationId);
    if (!combination) {
      return res.status(404).json({ message: "Combination not found" });
    }

    const supplier = combination.suppliers.find(sup => sup.supplierId === supplierId);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    // Find the comment to update
    const commentIndex = supplier.comments.findIndex(comment => comment.commentId === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Update the comment
    supplier.comments[commentIndex] = { ...supplier.comments[commentIndex], ...updatedComment };

    await productComments.save();

    res.status(200).json({ message: "Comment updated successfully", productComments });
  } catch (error) {
    res.status(500).json({ message: "Failed to update comment", error });
  }
};

// Delete a comment by commentId
export const deleteProductComment = async (req, res) => {
  const { productId, combinationId, supplierId, commentId } = req.params;

  try {
    const productComments = await ProductComments.findOne({ productId });

    if (!productComments) {
      return res.status(404).json({ message: "Product not found" });
    }

    const combination = productComments.productCombinations.find(comb => comb.combinationId === combinationId);
    if (!combination) {
      return res.status(404).json({ message: "Combination not found" });
    }

    const supplier = combination.suppliers.find(sup => sup.supplierId === supplierId);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    // Find and remove the comment
    const commentIndex = supplier.comments.findIndex(comment => comment.commentId === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Remove the comment from the array
    supplier.comments.splice(commentIndex, 1);

    await productComments.save();

    res.status(200).json({ message: "Comment deleted successfully", productComments });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete comment", error });
  }
};


// Batch import product comments
export const batchImportProductComments = async (req, res) => {
    const { productComments } = req.body; // Array of product comment data to be imported
  

    if (!Array.isArray(productComments) || productComments.length === 0) {
      return res.status(400).json({ message: "Invalid data. Expected an array of product comments." });
    }
  
    try {
      // Loop through each product comment and insert it into the database
      const result = await ProductComments.insertMany(productComments, { ordered: false }); // Insert many documents
  
      res.status(201).json({
        message: `${result.length} product comments imported successfully`,
        productComments: result,
      });
    } catch (error) {
      res.status(500).json({ message: "Error importing product comments", error });
    }
  };
  