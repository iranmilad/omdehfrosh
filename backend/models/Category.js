import mongoose from 'mongoose';



const SubscriptionModelSchema = new mongoose.Schema({
  modelId: {
    type: String,
    required: true
  }
}, { _id: false }); // prevents creating a separate _id for subdocument

const CategorySchema = new mongoose.Schema({
  image: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  display: {
    type: Boolean,
    default: true
  },
  subscriptionModel: {
    type: SubscriptionModelSchema,
    required: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

const Category = mongoose.model('Category', CategorySchema);

export default Category;
