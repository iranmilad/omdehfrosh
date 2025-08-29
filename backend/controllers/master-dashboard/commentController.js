import ProductComments from "../../models/ProductComments.js";

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
    const productComments = await ProductComments.findOne({ productId: req.params.id }); // Fetch product comments by product ID
    if (!productComments) {
      return res.status(404).json({ message: "Product comments not found" });
    }
    res.status(200).json(productComments);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve product comments", error });
  }
};



export const addProductComment = async (req, res) => {
  try {
    const { productComments } = req.body;

    if (!Array.isArray(productComments) || productComments.length === 0) {
      return res.status(400).json({ message: "productComments must be a non-empty array" });
    }

    const results = [];

    // Process each product separately
    for (const pc of productComments) {
      if (!pc.productId || !Array.isArray(pc.comments)) {
        results.push({
          productId: pc.productId || null,
          status: "failed",
          reason: "Missing productId or comments array"
        });
        continue;
      }

      try {
        const savedDoc = await ProductComments.createOrUpdate(pc.productId, pc);
        results.push({
          productId: pc.productId,
          status: "success",
          totalComments: savedDoc.totalComments,
          averageRating: savedDoc.averageRating
        });
      } catch (err) {
        console.error(`Error saving productId ${pc.productId}:`, err.message);
        results.push({
          productId: pc.productId,
          status: "failed",
          reason: err.message
        });
      }
    }

    return res.status(200).json({
      message: "Batch import completed",
      results
    });

  } catch (error) {
    console.error("Batch import error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
