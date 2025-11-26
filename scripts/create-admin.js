require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  role: String,
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('admin123', 12);

    const admin = await Admin.create({
      username: 'admin',
      password: hashedPassword,
      email: 'admin@ecommerce.com',
      role: 'admin',
    });

    console.log('✅ Admin created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Email:', admin.email);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();