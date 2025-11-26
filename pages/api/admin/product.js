import connectDB from '../../../lib/mongodb';
import Product from '../../../models/Product';

export default async function handler(req, res) {
  await connectDB();

  // GET - Get all products
  if (req.method === 'GET') {
    try {
      const products = await Product.find({}).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: products });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // POST - Create new product
  if (req.method === 'POST') {
    try {
      const { name, price, description, category, imageUrl } = req.body;

      if (!name || !price || !description || !category) {
        return res.status(400).json({ message: 'Name, price, description, dan category harus diisi' });
      }

      const product = await Product.create({
        name,
        price,
        description,
        category,
        imageUrl,
      });

      return res.status(201).json({ success: true, data: product });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // PUT - Update product
  if (req.method === 'PUT') {
    try {
      const { id, ...updateData } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'Product ID harus diisi' });
      }

      const product = await Product.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!product) {
        return res.status(404).json({ message: 'Product tidak ditemukan' });
      }

      return res.status(200).json({ success: true, data: product });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // DELETE - Delete product
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ message: 'Product ID harus diisi' });
      }

      const product = await Product.findByIdAndDelete(id);

      if (!product) {
        return res.status(404).json({ message: 'Product tidak ditemukan' });
      }

      return res.status(200).json({ success: true, message: 'Product berhasil dihapus' });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}