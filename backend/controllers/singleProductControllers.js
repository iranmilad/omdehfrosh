import SingleProduct from '../models/SingleProduct.js'
import ProductComments from '../models/ProductComments.js'
import { v4 as uuidv4 } from 'uuid';
import getUserFromToken from '../libs/verifyToken.js'
import HomePageProduct from '../models/HomePageProduct.js'



// Get all single products
export const getAllSingleProducts = async (req, res) => {
  try {
    const singleProducts = await SingleProduct.find();
    res.json(singleProducts);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving single products", error });
  }
};

export const getSingleProductById = async (req, res) => {
  const { productId } = req.params; // keep this name in URL: /product/:productId

  try {
    // Use the correct field from DB
    const singleProduct = await SingleProduct.findOne({ id: productId });

    if (!singleProduct) {
      return res.status(404).json({ message: "Single product not found" });
    }

    // Example: related products by same subCategoryId
    const relatedProducts = await HomePageProduct.find().limit(10);

    // Convert to plain object and remove _id and ICPrice fields recursively
    const productObj = singleProduct.toObject();
    const cleanedProduct = removeUnwantedFields(productObj);
    const cleanedRelatedProducts = relatedProducts.map(p => removeUnwantedFields(p.toObject()));

    res.json({
      ...cleanedProduct,
      relatedProducts: cleanedRelatedProducts,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving single product", error });
  }
};

// Helper function to recursively remove unwanted fields
function removeUnwantedFields(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => removeUnwantedFields(item));
  } else if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      if (key !== '_id' && key !== '__v' && key !== 'ICPrice') {
        newObj[key] = removeUnwantedFields(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}



export const createSingleProductComments = async (req, res) => {
  try {
    const { commentText, rating, name, date, supplierId, supplierName, supplierPsid } = req.body;

    const {productId } = req.params

    // Validation
    if (!productId) {
      return res.status(400).json({
        state: "error",
        message: "شناسه محصول الزامی است",
        error: { productId: "شناسه محصول الزامی است" }
      });
    }

    if (!commentText || commentText.trim().length < 5) {
      return res.status(400).json({
        state: "error", 
        message: "متن کامنت باید حداقل ۵ کاراکتر باشد",
        error: { commentText: "متن کامنت باید حداقل ۵ کاراکتر باشد" }
      });
    }

    if (commentText.trim().length > 500) {
      return res.status(400).json({
        state: "error",
        message: "متن کامنت نمی‌تواند بیش از ۵۰۰ کاراکتر باشد", 
        error: { commentText: "متن کامنت نمی‌تواند بیش از ۵۰۰ کاراکتر باشد" }
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        state: "error",
        message: "امتیاز باید بین ۱ تا ۵ باشد",
        error: { rating: "امتیاز باید بین ۱ تا ۵ باشد" }
      });
    }

    if (!supplierId) {
      return res.status(400).json({
        state: "error",
        message: "انتخاب تامین‌کننده الزامی است",
        error: { supplier: "انتخاب تامین‌کننده الزامی است" }
      });
    }

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        state: "error",
        message: "نام کاربر الزامی است",
        error: { name: "نام کاربر الزامی است" }
      });
    }

    // Create new comment object
    const newComment = {
      commentId: uuidv4(), // Generate unique ID
      name: name.trim(),
      date: date || new Date().toLocaleDateString("fa-IR"),
      rating: rating.toString(),
      status: 'pending', // Default status - you can modify this based on your business logic
      commentText: commentText.trim(),
      supplierId: parseInt(supplierId),
      supplierName: supplierName || '',
      // You can also store supplierPsid if needed:
      // supplierPsid: supplierPsid || ''
    };

    // Find existing product comments or create new document
    let productComments = await ProductComments.findOne({ productId });

    if (!productComments) {
      // Create new product comments document
      productComments = new ProductComments({
        productId,
        comments: [newComment],
        suppliers: [],
        totalComments: 1,
        averageRating: parseFloat(rating)
      });
    } else {
      // Add comment to existing document
      productComments.addComment(newComment);
    }

    // Save the document (this will trigger the pre-save middleware to update supplier stats)
    const savedDocument = await productComments.save();

    // Return success response
    return res.status(201).json({
      state: "ok",
      message: "دیدگاه شما با موفقیت ثبت شد و پس از بررسی منتشر خواهد شد",
      data: {
        commentId: newComment.commentId,
        productId,
        status: newComment.status,
        totalComments: savedDocument.totalComments,
        averageRating: parseFloat(savedDocument.averageRating.toFixed(1))
      }
    });

  } catch (error) {
    console.error("Error in submitComment:", error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      
      return res.status(422).json({
        state: "error",
        message: "خطا در اعتبارسنجی داده‌ها",
        error: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        state: "error", 
        message: "این کامنت قبلاً ثبت شده است",
        error: { commentId: "این کامنت قبلاً ثبت شده است" }
      });
    }

    // Generic server error
    return res.status(500).json({
      state: "error",
      message: "خطای داخلی سرور. لطفاً دوباره تلاش کنید",
      error: { server: "خطای داخلی سرور" }
    });
  }
};

// Alternative version if you want to auto-approve comments from certain suppliers or users
export const submitCommentWithAutoApproval = async (req, res) => {
  try {
    const { productId, commentText, rating, name, date, supplierId, supplierName, supplierPsid, userId } = req.body;

    // ... same validation as above ...

    // Determine comment status based on business logic
    let commentStatus = 'pending'; // default
    
    // Example: Auto-approve comments from verified suppliers or premium users
    // You can modify this logic based on your requirements
    const trustedSupplierIds = [1, 2]; // Example trusted supplier IDs
    const premiumUsers = ['premium_user_id']; // Example premium user IDs
    
    if (trustedSupplierIds.includes(parseInt(supplierId)) || premiumUsers.includes(userId)) {
      commentStatus = 'agreed';
    }

    const newComment = {
      commentId: uuidv4(),
      name: name.trim(),
      date: date || new Date().toLocaleDateString("fa-IR"),
      rating: rating.toString(),
      status: commentStatus,
      commentText: commentText.trim(),
      supplierId: parseInt(supplierId),
      supplierName: supplierName || ''
    };

    // ... rest of the logic remains the same ...

    let productComments = await ProductComments.findOne({ productId });

    if (!productComments) {
      productComments = new ProductComments({
        productId,
        comments: [newComment],
        suppliers: [],
        totalComments: 1,
        averageRating: parseFloat(rating)
      });
    } else {
      productComments.addComment(newComment);
    }

    const savedDocument = await productComments.save();

    const responseMessage = commentStatus === 'agreed' 
      ? "دیدگاه شما با موفقیت ثبت و منتشر شد"
      : "دیدگاه شما با موفقیت ثبت شد و پس از بررسی منتشر خواهد شد";

    return res.status(201).json({
      state: "ok",
      message: responseMessage,
      data: {
        commentId: newComment.commentId,
        productId,
        status: newComment.status,
        totalComments: savedDocument.totalComments,
        averageRating: parseFloat(savedDocument.averageRating.toFixed(1))
      }
    });

  } catch (error) {
    // ... same error handling as above ...
    console.error("Error in submitCommentWithAutoApproval:", error);
    return res.status(500).json({
      state: "error",
      message: "خطای داخلی سرور. لطفاً دوباره تلاش کنید",
      error: { server: "خطای داخلی سرور" }
    });
  }
};











export const getSingleProductComments = async (req, res) => {
  const { productId } = req.body;

  try {
    // Find the product in the database
    const product = await ProductComments.findOne({ productId });
    if (!product) {
      return res.json({ 
        message: "Product not found", 
        data: {
          id: productId,
          suppliers: [],
          comments: [],
          totalComments: 0,
          averageRating: 0
        }
      });
    }

    // Build suppliers data (already pre-aggregated in your schema)
    const suppliersData = product.suppliers.map(s => ({
      supplierId: s.supplierId,
      supplierName: s.supplierName,
      commentsCount: s.commentsCount,
      averageRating: parseFloat(s.averageRating.toFixed(1))
    }));

    // Map all comments with supplier info
    const commentsData = product.comments.map(c => ({
      commentId: c.commentId,
      name: c.name,
      date: c.date,
      rating: parseFloat(c.rating),
      status: c.status,
      commentText: c.commentText,
      supplierId: c.supplierId,
      supplierName: c.supplierName
    }));

    // Overall statistics
    const totalComments = product.totalComments;
    const averageRating = parseFloat(product.averageRating.toFixed(1));

    return res.json({ 
      message: "Success", 
      data: {
        id: productId,
        suppliers: suppliersData,
        comments: commentsData,
        totalComments,
        averageRating
      },
      meta: {
        id: productId,
        fetchedAt: new Date().toISOString(),
        suppliersCount: suppliersData.length,
        totalComments
      }
    });

  } catch (error) {
    console.error("Error in getSingleProductComments:", error);
    res.status(500).json({ 
      message: "Error retrieving product comments", 
      data: {
        suppliers: [],
        comments: [],
        totalComments: 0,
        averageRating: 0
      },
      error: error.message 
    });
  }
};

// Create a new single product
export const createSingleProduct = async (req, res) => {
  try {
    const newSingleProduct = new SingleProduct(req.body);
    await newSingleProduct.save();
    res.status(201).json(newSingleProduct);
  } catch (error) {
    res.status(500).json({ message: "Error creating single product", error });
  }
};

// Update an existing single product
export const updateSingleProduct = async (req, res) => {
  try {
    const updatedSingleProduct = await SingleProduct.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedSingleProduct) {
      return res.status(404).json({ message: "Single product not found" });
    }
    res.json(updatedSingleProduct);
  } catch (error) {
    res.status(500).json({ message: "Error updating single product", error });
  }
};

// Delete a single product by ID
export const deleteSingleProduct = async (req, res) => {
  try {
    const deletedSingleProduct = await SingleProduct.findByIdAndDelete(req.params.id);
    if (!deletedSingleProduct) {
      return res.status(404).json({ message: "Single product not found" });
    }
    res.json({ message: "Single product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting single product", error });
  }
};

// Batch import single products
export const batchImportSingleProducts = async (req, res) => {
  const { singleProducts } = req.body


  try {
    const singleProductsInsert = await SingleProduct.insertMany(singleProducts);
    res.status(201).json({ message: "Single products imported successfully", singleProductsInsert });
  } catch (error) {
    console.error("Error importing single products:", error);
    res.status(500).json({ message: "Error importing single products", error: error.message });
}
};
