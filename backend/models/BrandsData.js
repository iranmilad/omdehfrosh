import mongoose from 'mongoose';

const socialMediaSchema = new mongoose.Schema({
  twitter: {
    type: String,
    trim: true
  },
  instagram: {
    type: String,
    trim: true
  },
  facebook: {
    type: String,
    trim: true
  }
}, { _id: false });

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Brand name is required'],
    trim: true,
    maxlength: [100, 'Brand name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Brand slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens']
  },
  logo: {
    type: String,
    required: [true, 'Brand logo URL is required'],
    trim: true
  },
  tagline: {
    type: String,
    trim: true,
    maxlength: [200, 'Tagline cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Brand description is required'],
    trim: true
  },
  established_year: {
    type: Number,
    min: [1800, 'Established year must be after 1800'],
    max: [new Date().getFullYear(), 'Established year cannot be in the future']
  },
  origin_country: {
    type: String,
    required: [true, 'Origin country is required'],
    trim: true
  },
  headquarters: {
    type: String,
    required: [true, 'Headquarters location is required'],
    trim: true
  },
  features: {
    type: [String],
    default: [],
    validate: {
      validator: function(features) {
        return features.length <= 20;
      },
      message: 'Features cannot exceed 20 items'
    }
  },
  total_products: {
    type: Number,
    min: [0, 'Total products cannot be negative'],
    default: 0
  },
  rating: {
    type: Number,
    min: [0, 'Rating must be between 0 and 5'],
    max: [5, 'Rating must be between 0 and 5'],
    default: 0
  },
  total_sales: {
    type: Number,
    min: [0, 'Total sales cannot be negative'],
    default: 0
  },
  market_share: {
    type: String,
    trim: true,
    match: [/^\d+(\.\d+)?%$/, 'Market share must be in percentage format (e.g., 15.8%)']
  },
  global_rank: {
    type: Number,
    min: [1, 'Global rank must be a positive number'],
    default: null
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Website must be a valid URL']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email must be a valid email address']
  },
  phone: {
    type: String,
    trim: true
  },
  social_media: {
    type: socialMediaSchema,
    default: {}
  },
  ceo: {
    type: String,
    trim: true,
    maxlength: [100, 'CEO name cannot exceed 100 characters']
  },
  employees: {
    type: String,
    trim: true
  },
  revenue: {
    type: String,
    trim: true
  },
  popular_products: {
    type: [String],
    default: [],
    validate: {
      validator: function(products) {
        return products.length <= 10;
      },
      message: 'Popular products cannot exceed 10 items'
    }
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // This will automatically handle createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
brandSchema.index({ slug: 1 });
brandSchema.index({ name: 1 });
brandSchema.index({ global_rank: 1 });
brandSchema.index({ rating: -1 });
brandSchema.index({ is_active: 1 });

// Virtual for formatted rating
brandSchema.virtual('formatted_rating').get(function() {
  return `${this.rating}/5`;
});

// Virtual for age calculation
brandSchema.virtual('brand_age').get(function() {
  if (!this.established_year) return null;
  return new Date().getFullYear() - this.established_year;
});

// Pre-save middleware to update the updated_at field
brandSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Static method to find by slug
brandSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug, is_active: true });
};

// Static method to get top rated brands
brandSchema.statics.getTopRated = function(limit = 10) {
  return this.find({ is_active: true })
    .sort({ rating: -1, total_sales: -1 })
    .limit(limit);
};

// Static method to search brands
brandSchema.statics.searchBrands = function(query, options = {}) {
  const searchRegex = new RegExp(query, 'i');
  const { limit = 20, skip = 0, sortBy = 'name' } = options;
  
  return this.find({
    is_active: true,
    $or: [
      { name: searchRegex },
      { slug: searchRegex },
      { tagline: searchRegex },
      { origin_country: searchRegex }
    ]
  })
  .sort(sortBy)
  .skip(skip)
  .limit(limit);
};

// Instance method to get brand summary
brandSchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.name,
    slug: this.slug,
    logo: this.logo,
    rating: this.rating,
    global_rank: this.global_rank,
    total_products: this.total_products
  };
};

const BrandsData = mongoose.model('BrandsData', brandSchema);

export default BrandsData;