import mongoose from 'mongoose';

// Comment Schema
const commentSchema = new mongoose.Schema({
  commentId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  rating: {
    type: String, // Using String as your data shows ratings like "3.5"
    required: true
  },
  status: {
    type: String,
    enum: ['agreed', 'pending', 'rejected'],
    required: true
  },
  commentText: {
    type: String,
    required: true
  },
  supplierName: {
    type: String,
    required: false, // Changed to false
    default: ""      // Added default empty string
  },
  supplierId: {
    type: Number,
    required: false, // Changed to false  
    default: 0       // Added default value
  },
  // One comment per (order, product) – when set, user cannot add another for same order+product
  orderId: { type: String, required: false, default: null },
  userId: { type: Number, required: false, default: null }
}, {
  timestamps: true
});

// Rest of

// Supplier Schema
const supplierSchema = new mongoose.Schema({
  supplierId: {
    type: Number,
    required: true
  },
  supplierName: {
    type: String,
    required: true
  },
  commentsCount: {
    type: Number,
    required: true,
    default: 0
  },
  averageRating: {
    type: Number,
    required: true,
    default: 0
  }
});

// Main Product Comments Schema
const productCommentsSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true
  },
  comments: [commentSchema],
  suppliers: [supplierSchema],
  totalComments: {
    type: Number,
    required: true,
    default: 0
  },
  averageRating: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance (remove if you have index: true in schema fields)
// Only add these if you DON'T have index: true on the schema fields
// productCommentsSchema.index({ productId: 1 });
// productCommentsSchema.index({ 'comments.commentId': 1 });
// productCommentsSchema.index({ 'comments.supplierId': 1 });
// productCommentsSchema.index({ 'suppliers.supplierId': 1 });

// Method to add a new comment
productCommentsSchema.methods.addComment = function(commentData) {
  this.comments.push(commentData);
  this.totalComments = this.comments.length;
  this.markModified('comments');
  return this;
};

// Method to bulk replace all comments (for your use case)
productCommentsSchema.methods.replaceComments = function(commentsData) {
  this.comments = commentsData.comments || [];
  this.suppliers = commentsData.suppliers || [];
  this.totalComments = commentsData.totalComments || this.comments.length;
  this.averageRating = commentsData.averageRating || 0;
  this.markModified('comments');
  this.markModified('suppliers');
  return this;
};

// Method to update supplier statistics
productCommentsSchema.methods.updateSupplierStats = function() {
  const supplierStats = {};
  
  // Calculate stats for each supplier
  this.comments.forEach(comment => {
    const supplierId = comment.supplierId;
    if (!supplierStats[supplierId]) {
      supplierStats[supplierId] = {
        supplierId: supplierId,
        supplierName: comment.supplierName,
        ratings: [],
        commentsCount: 0
      };
    }
    supplierStats[supplierId].ratings.push(parseFloat(comment.rating));
    supplierStats[supplierId].commentsCount++;
  });

  // Update suppliers array
  this.suppliers = Object.values(supplierStats).map(stats => ({
    supplierId: stats.supplierId,
    supplierName: stats.supplierName,
    commentsCount: stats.commentsCount,
    averageRating: stats.ratings.reduce((sum, rating) => sum + rating, 0) / stats.ratings.length
  }));

  // Update overall average rating
  const allRatings = this.comments.map(comment => parseFloat(comment.rating));
  this.averageRating = allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length;
  
  return this;
};

// Pre-save middleware to automatically update stats
productCommentsSchema.pre('save', function(next) {
  if (this.isModified('comments')) {
    this.updateSupplierStats();
  }
  next();
});

// Transform output to match your API response format
productCommentsSchema.methods.toJSON = function() {
  const obj = this.toObject();
  // Remove mongoose specific fields if needed
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;
  return obj;
};

// Static method to create or update product comments
productCommentsSchema.statics.createOrUpdate = async function(productId, commentsData) {
  const existingDoc = await this.findOne({ productId });
  
  if (existingDoc) {
    // Update existing document
    existingDoc.replaceComments(commentsData);
    return await existingDoc.save();
  } else {
    // Create new document
    return await this.create({
      productId,
      ...commentsData
    });
  }
};

const ProductComments = mongoose.model("ProductComments", productCommentsSchema);

export default ProductComments;