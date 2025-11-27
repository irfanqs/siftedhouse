// pages/select-items.js
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import ProfileIcon from '../components/ProfileIcon';
import LoginChooser from '../components/LoginChooser';

// HANYA 3 kategori yang ditampilkan di UI
const categories = ['All', 'Drinks', 'Additional'];

export default function SelectItemsPage() {
  const { cart, addToCart, removeFromCart, getItemQuantity } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products (sama seperti admin dashboard)
  const fetchProducts = async () => {
    console.log('🔄 [SELECT-ITEMS] Starting fetch products...');
    setLoading(true);
    try {
      console.log('📡 [SELECT-ITEMS] Fetching from /api/products...');
      const response = await fetch('/api/products');
      console.log('📥 [SELECT-ITEMS] Response status:', response.status, response.statusText);
      
      const result = await response.json();
      console.log('📦 [SELECT-ITEMS] Response data:', result);
      console.log('✅ [SELECT-ITEMS] Products count:', result?.data?.length || 0);
      
      if (response.ok && result.success) {
        setProducts(result.data || []);
        console.log('💾 [SELECT-ITEMS] Products set to state:', result.data?.length || 0, 'items');
      } else {
        setProducts([]);
        console.warn('⚠️ [SELECT-ITEMS] Response not OK or not successful');
      }
    } catch (error) {
      console.error('❌ [SELECT-ITEMS] Error fetching products:', error);
      console.error('❌ [SELECT-ITEMS] Error details:', error.message);
      setProducts([]);
    } finally {
      setLoading(false);
      console.log('✔️ [SELECT-ITEMS] Fetch completed, loading:', false);
    }
  };

  // Fetch products on mount
  useEffect(() => {
    console.log('🚀 [SELECT-ITEMS] Component mounted, calling fetchProducts...');
    fetchProducts();
  }, []);

  // "All" hanya menampilkan Drinks & Additional
  const allowedForAll = ['Drinks', 'Additional'];

  const filteredProducts = (products || [])
    .filter((product) => {
      if (selectedCategory === 'All') {
        return allowedForAll.includes(product?.category);
      }
      return product?.category === selectedCategory;
    })
    .filter((product) =>
      (product?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  console.log('🔍 [SELECT-ITEMS] Filter state:', {
    totalProducts: products?.length || 0,
    selectedCategory,
    searchTerm,
    filteredCount: filteredProducts?.length || 0
  });

  // Langsung add ke cart tanpa login
  const handleAddToCart = (product) => {
    console.log('➕ [SELECT-ITEMS] Adding to cart:', product.name);
    addToCart(product);
  };

  return (
    <div className="bg-[#FFFBE7] min-h-screen font-sans text-[#37432B]">
      {/* Header */}
      <header className="bg-[#FFFBE7]/95 backdrop-blur-md shadow-sm p-4 flex justify-between items-center sticky top-0 z-10 border-b border-[#E5D8CC]">
        <div className="flex items-center gap-4">
          <ProfileIcon />
          <img
            src="/logo-sifted-house.png"
            alt="Sifted House"
            className="h-12 md:h-14 w-auto"
          />
        </div>

        {/* Search & Cart */}
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Cari menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#6A6F4C] text-[#FFFBE7] placeholder-[#E5D8CC] rounded-full px-4 py-2 w-40 md:w-64 focus:outline-none focus:ring-2 focus:ring-[#37432B] transition-all duration-300"
          />
          <Link href="/checkout">
            <button className="relative bg-[#6A6F4C] text-[#FFFBE7] font-bold py-2 px-5 rounded-full hover:bg-[#37432B] transition-colors">
              <span>🛒</span>
              <span className="absolute -top-2 -right-2 bg-[#682C23] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        {/* Filter Kategori */}
        <div className="flex justify-center space-x-2 md:space-x-4 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-semibold transition-colors text-sm md:text-base ${
                selectedCategory === category
                  ? 'bg-[#37432B] text-[#FFFBE7] shadow-md'
                  : 'bg-[#E5D8CC] text-[#37432B] hover:bg-[#6A6F4C] hover:text-[#FFFBE7] border border-[#6A6F4C]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-[#6A6F4C]"></div>
            <p className="mt-4 text-[#6A6F4C] font-medium">Loading products...</p>
          </div>
        ) : (
          /* Grid Produk */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {filteredProducts.map((product) => {
            const quantityInCart = getItemQuantity(product._id);
            return (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden flex transform hover:-translate-y-1 transition-transform duration-300 border border-[#6A6F4C]/30"
              >
                <div className="w-1/3 flex-shrink-0">
                  <img
                    src={
                      product.imageUrl ||
                      `https://placehold.co/400x400/6A6F4C/FFFBE7?text=No+Image`
                    }
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="w-2/3 p-5 flex flex-col">
                  <div>
                    <h2 className="text-xl font-bold text-[#37432B]">
                      {product.name}
                    </h2>
                    <p className="text-lg font-black text-[#682C23] mb-2">
                      Rp {product.price.toLocaleString('id-ID')}
                    </p>
                  </div>

                  <p className="text-[#6A6F4C] text-sm mb-4 flex-grow">
                    {product.description}
                  </p>

                  <div className="mt-auto flex justify-end">
                    {quantityInCart === 0 ? (
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="bg-[#6A6F4C] text-[#FFFBE7] font-bold py-2 px-5 rounded-full hover:bg-[#37432B] transition-colors focus:outline-none focus:ring-2 focus:ring-[#37432B]"
                      >
                        Add
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 bg-[#37432B] text-[#FFFBE7] rounded-full px-3 py-1.5 shadow-md">
                        <button
                          onClick={() => removeFromCart(product)}
                          className="font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#FFFBE7] rounded"
                        >
                          ➖
                        </button>
                        <span className="font-bold text-lg w-5 text-center">
                          {quantityInCart}
                        </span>
                        <button
                          onClick={() => addToCart(product)}
                          className="font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#FFFBE7] rounded"
                        >
                          ➕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </main>

      {/* Dummy LoginChooser (tidak muncul) */}
      <LoginChooser />
    </div>
  );
}
