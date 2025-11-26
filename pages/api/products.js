import connectDB from '../../lib/mongodb';
import Product from '../../models/Product';

export default async function handler(req, res) {
  await connectDB();
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const products = await Product.find({}).sort({ createdAt: -1 }); 
        res.status(200).json({ success: true, data: products });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      try {
        const product = await Product.create(req.body); 
        res.status(201).json({ success: true, data: product });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'PUT':
      try {
        const { id, ...updateData } = req.body;
        
        if (!id) {
          return res.status(400).json({ success: false, message: 'Product ID required' });
        }

        const product = await Product.findByIdAndUpdate(id, updateData, {
          new: true,
          runValidators: true,
        });

        if (!product) {
          return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, data: product });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        
        if (!id) {
          return res.status(400).json({ success: false, message: 'Product ID required' });
        }

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
          return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, message: 'Product deleted successfully' });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}