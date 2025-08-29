import mongoose from 'mongoose';

const brandsPageDataSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  logo: {
    type: String,
    required: false
  },
  tagline: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  established_year: {
    type: Number,
    min: 1800,
    max: new Date().getFullYear()
  },
  origin_country: {
    type: String,
    trim: true
  },
  headquarters: {
    type: String,
    trim: true
  },
  features: [{
    type: String,
    trim: true
  }],
  total_products: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  total_sales: {
    type: Number,
    default: 0,
    min: 0
  },
  market_share: {
    type: String,
    trim: true
  },
  global_rank: {
    type: Number,
    min: 1
  },
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Website must be a valid URL'
    }
  },
  email: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^\S+@\S+\.\S+$/.test(v);
      },
      message: 'Email must be valid'
    }
  },
  phone: {
    type: String,
    trim: true
  },
  social_media: {
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
    },
    linkedin: {
      type: String,
      trim: true
    }
  },
  ceo: {
    type: String,
    trim: true
  },
  employees: {
    type: String,
    trim: true
  },
  revenue: {
    type: String,
    trim: true
  },
  popular_products: [{
    type: String,
    trim: true
  }],
  is_active: {
    type: Boolean,
    default: true
  },
  meta: {
    seo_title: {
      type: String,
      trim: true
    },
    seo_description: {
      type: String,
      trim: true
    },
    keywords: [{
      type: String,
      trim: true
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance (removed duplicate slug index to fix warning)
brandsPageDataSchema.index({ name: 1 });
brandsPageDataSchema.index({ is_active: 1 });
brandsPageDataSchema.index({ createdAt: -1 }); // Changed from created_at to createdAt (Mongoose timestamps convention)

// Virtual to get products count (if you have a products collection)
brandsPageDataSchema.virtual('productsCount', {
  ref: 'Product', // Reference to Product model
  localField: '_id',
  foreignField: 'brand',
  count: true
});

// Pre-save middleware to generate slug if not provided
brandsPageDataSchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }
  next();
});

// Static method to find active brands
brandsPageDataSchema.statics.findActive = function() {
  return this.find({ is_active: true });
};

// Instance method to get full social media URLs
brandsPageDataSchema.methods.getSocialMediaUrls = function() {
  const social = this.social_media;
  if (!social) return {};
  
  return {
    twitter: social.twitter ? `https://twitter.com/${social.twitter.replace('@', '')}` : null,
    instagram: social.instagram ? `https://instagram.com/${social.instagram.replace('@', '')}` : null,
    facebook: social.facebook ? `https://facebook.com/${social.facebook}` : null,
    linkedin: social.linkedin ? `https://linkedin.com/company/${social.linkedin}` : null
  };
};

const BrandsPageData = mongoose.model('BrandsPageData', brandsPageDataSchema);

export default BrandsPageData;