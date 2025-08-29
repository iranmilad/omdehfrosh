import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  id: { 
    type: Number, 
    required: true, 
    unique: true 
  },
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  description: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 1000
  },
  imagePath: { 
    type: mongoose.Schema.Types.Mixed, // Can be string or array
    default: '/uploads/notifications/default-icon.png',
    validate: {
      validator: function(value) {
        if (!value) return true;
        if (typeof value === 'string') return true;
        if (Array.isArray(value)) {
          return value.every(path => typeof path === 'string');
        }
        return false;
      },
      message: 'imagePath must be a string or array of strings'
    }
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  userId: {
    type: Number,
    ref: 'User', // Reference to User model if you have one
    required: false, // Optional for global notifications
    index: true // Add index for better performance
  },
  // Notification type for categorization
  type: {
    type: String,
    enum: ['system', 'personal', 'promotion', 'security', 'order', 'support', 'achievement'],
    default: 'personal'
  },
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  // Action URL if notification is clickable
  actionUrl: {
    type: String,
    trim: true
  },
  // Expiration date for temporary notifications
  expiresAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This automatically manages createdAt and updatedAt
});

// Compound indexes for better query performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ type: 1, priority: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired notifications

// Pre-save middleware to update the updatedAt field
notificationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to find notifications for a user
notificationSchema.statics.findForUser = function(userId, options = {}) {
  const query = {
    $or: [
      { userId: userId },
      { userId: { $exists: false } },
      { userId: null }
    ]
  };
  
  // Add expiration filter
  query.expiresAt = { $or: [{ $exists: false }, { $gte: new Date() }] };
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.updatedAt = new Date();
  return this.save();
};

const NotificationTable = mongoose.model('NotificationTable', notificationSchema);

export default NotificationTable;