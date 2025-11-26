import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name.'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Please provide a product price.'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a product description.'],
  },
  category: {
    type: String,
    required: [true, 'Please provide a category.'],
    enum: ['Drinks', 'Additional', 'Snacks', 'Bundles', 'Other'], 
  },
  imageUrl: {
    type: String,
    required: false, 
  },
}, { timestamps: true }); 

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);