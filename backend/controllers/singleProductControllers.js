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
  const { productId } = req.params;

  try {
    const singleProduct = await SingleProduct.findOne({ id: productId });

    if (!singleProduct) {
      return res.status(404).json({ message: "Single product not found" });
    }

    // Get related products by same subCategoryId from SingleProduct collection
    const relatedProducts = await SingleProduct.find({
      'general.subCategoryId': singleProduct.general.subCategoryId,
      id: { $ne: productId } // Exclude current product
    }).limit(10);

    // Convert to plain object and remove unwanted fields recursively
    // Use toObject with getters to ensure dates are properly handled
    const productObj = singleProduct.toObject({ 
      getters: true,
      virtuals: false 
    });
    const cleanedProduct = removeUnwantedFields(productObj);
    const cleanedRelatedProducts = relatedProducts.map(p => 
      removeUnwantedFields(p.toObject({ getters: true, virtuals: false }))
    );

    res.json({
      ...cleanedProduct,
      relatedProducts: cleanedRelatedProducts,
    });
  } catch (error) {
    console.error("Error in getSingleProductById:", error);
    res.status(500).json({ message: "Error retrieving single product", error: error.message });
  }
};

// Helper function to recursively remove unwanted fields
function removeUnwantedFields(obj) {
  // Handle null or undefined
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  // Handle Date objects - convert to ISO string
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  
  // Handle MongoDB extended JSON date format: { "$date": { "$numberLong": "..." } }
  // This format can appear when data is imported or exported
  if (obj && typeof obj === 'object' && obj.$date) {
    try {
      if (obj.$date.$numberLong !== undefined) {
        const timestamp = parseInt(obj.$date.$numberLong);
        if (!isNaN(timestamp)) {
          return new Date(timestamp).toISOString();
        }
      } else if (obj.$date instanceof Date) {
        return obj.$date.toISOString();
      } else if (typeof obj.$date === 'string') {
        const date = new Date(obj.$date);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      } else if (typeof obj.$date === 'number') {
        const date = new Date(obj.$date);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      }
    } catch (error) {
      console.error('Error parsing date from MongoDB format:', error);
      return null;
    }
  }
  
  // Handle empty objects - check if it's a special_offer field that should be null
  // Empty objects in special_offer should be treated as null
  if (obj && typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).length === 0) {
    // Check if this might be a date field that got corrupted
    // If it's an empty object, return null (will be filtered out if needed)
    return null;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => removeUnwantedFields(item));
  } else if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      if (key !== '_id' && key !== '__v' && key !== 'ICPrice') {
        const value = removeUnwantedFields(obj[key]);
        // Only add non-null values (unless it's explicitly null in the data)
        if (value !== undefined) {
          newObj[key] = value;
        }
      }
    }
    return newObj;
  }
  return obj;
}

export const createSingleProductComments = async (req, res) => {
  try {
    const { commentText, rating, name, date, supplierId, supplierName, supplierPsid, orderId } = req.body;
    const { productId } = req.params;

    // When submitting from order details: enforce one comment per (order, product) per user
    const tokenData = getUserFromToken(req);
    const user_id = tokenData?.user_id ?? null;

    if (orderId) {
      if (user_id == null) {
        return res.status(401).json({
          state: "error",
          message: "برای ثبت دیدگاه از صفحه سفارش باید وارد حساب باشید",
          error: { auth: "Unauthorized" }
        });
      }
      const existing = await ProductComments.findOne({
        productId,
        'comments.orderId': orderId,
        'comments.userId': user_id
      });
      if (existing) {
        return res.status(400).json({
          state: "error",
          message: "شما قبلاً برای این محصول در این سفارش دیدگاه ثبت کرده‌اید",
          error: { orderId: "یک دیدگاه به ازای هر محصول در هر سفارش" },
          alreadyCommented: true
        });
      }
    }

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

    // Create new comment object (orderId/userId for one-comment-per-order enforcement)
    const newComment = {
      commentId: uuidv4(),
      name: name.trim(),
      date: date || new Date().toLocaleDateString("fa-IR"),
      rating: rating.toString(),
      status: 'pending',
      commentText: commentText.trim(),
      supplierId: parseInt(supplierId),
      supplierName: supplierName || '',
      ...(orderId != null && { orderId: String(orderId) }),
      ...(user_id != null && { userId: user_id })
    };

    // Find existing product comments or create new document
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

    if (error.code === 11000) {
      return res.status(409).json({
        state: "error", 
        message: "این کامنت قبلاً ثبت شده است",
        error: { commentId: "این کامنت قبلاً ثبت شده است" }
      });
    }

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

    const suppliersData = product.suppliers.map(s => ({
      supplierId: s.supplierId,
      supplierName: s.supplierName,
      commentsCount: s.commentsCount,
      averageRating: parseFloat(s.averageRating.toFixed(1))
    }));

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
  const { singleProducts } = req.body;

  try {
    const singleProductsInsert = await SingleProduct.insertMany(singleProducts);
    res.status(201).json({ 
      message: "Single products imported successfully", 
      count: singleProductsInsert.length,
      singleProductsInsert 
    });
  } catch (error) {
    console.error("Error importing single products:", error);
    res.status(500).json({ 
      message: "Error importing single products", 
      error: error.message 
    });
  }
};