const mongoose = require('mongoose');
const Product = require('./models/Product').default;
require('dotenv').config({ path: './.env.local' });

// --- LIST PRODUK ---
const productsToSeed = [
  {
    name: "sifted aren creamy latte",
    price: 29000,
    description: "salted aren foam, espresso signature milk.",
    category: "Drinks",
    imageUrl: "/aren.png"
  },
  {
    name: "honey sea salt matcha latte",
    price: 58000,
    description: "ceremonial grade matcha, water, signature milk, honey sea salt foam.",
    category: "Drinks",
    imageUrl: "/honey_sea_salt.png"
  },
    {
    name: "earl grey matcha latte",
    price: 55000,
    description: "ceremonial grade matcha, water, signature milk, earl grey syrup.",
    category: "Drinks",
    imageUrl: "/earl_grey.png"
  },
      {
    name: "sifted yugen matcha latte",
    price: 50000,
    description: "ceremonial grade matcha, water, signature milk, less sugar / no sugar.",
    category: "Drinks",
    imageUrl: "/yugen.png"
  },
      {
    name: "sifted anzu matcha latte",
    price: 44000,
    description: "cold whisked ceremonial grade matcha, signature milk, less sugar.",
    category: "Drinks",
    imageUrl: "https://i.postimg.cc/DZYKN9ML/earl-grey-bnr-removebg-preview.png"
  },
  {
    name: "Additional Oat Milk",
    price: 5000,
    description: "please only add this item ONLY IF you want to use Oat Milk on your order.",
    category: "Additional",
    imageUrl: "https://oatside.com/wp-content/uploads/2021/09/OAT_Pkg_Web_Barista.jpg"
  },
];

const seedDB = async () => {
  try {
    // 1
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Berhasil terhubung ke MongoDB...');

    // 2
    await Product.deleteMany({});
    console.log('🧹 Collection Product berhasil dikosongkan...');

    // 3
    await Product.insertMany(productsToSeed);
    console.log('🌱 Berhasil memasukkan data produk baru...');

    // 4
  } catch (err) {
    console.error('❌ Gagal melakukan seeding:', err);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Koneksi ke MongoDB diputus.');
  }
};

seedDB();