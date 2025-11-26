import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [filterStatus, setFilterStatus] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('checkout');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [revenueView, setRevenueView] = useState('7days');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return String(today.getMonth() + 1).padStart(2, '0');
  });
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Drinks',
    imageUrl: '',
  });

  // FUNCTIONS
  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      const result = await response.json();
      if (result.success) setData(result.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch('/api/products');
      const result = await response.json();
      console.log('Admin /products result:', result);
      if (response.ok && result.success) setProducts(result.data || []);
      else setProducts([]);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const body = editingProduct
        ? { id: editingProduct._id, ...newProduct, price: parseFloat(newProduct.price) }
        : { ...newProduct, price: parseFloat(newProduct.price) };

      const response = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        alert(editingProduct ? 'Product berhasil diupdate!' : 'Product berhasil ditambahkan!');
        setShowAddProduct(false);
        setEditingProduct(null);
        setNewProduct({ name: '', price: '', description: '', category: 'Drinks', imageUrl: '' });
        fetchProducts();
        fetchDashboardData();
      } else {
        const error = await response.json();
        alert('Error: ' + error.message);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Gagal menyimpan product');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      category: product.category,
      imageUrl: product.imageUrl || '',
    });
    setShowAddProduct(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Yakin ingin menghapus product ini?')) return;

    try {
      const response = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        alert('Product berhasil dihapus!');
        fetchProducts();
        fetchDashboardData();
      } else {
        const error = await response.json();
        alert('Error: ' + error.message);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Gagal menghapus product');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    router.push('/admin/login');
  };

  // EFFECTS
  useEffect(() => {
    const admin = localStorage.getItem('admin');
    if (!admin) {
      router.push('/admin/login');
      return;
    }
    fetchDashboardData();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (activeTab === 'products' && products.length === 0) {
      fetchProducts();
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5DD] flex items-center justify-center">
        <div className="text-xl font-bold text-zinc-800">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5DD]">
      {/* Header */}
      <div className="bg-[#FFFBE7]/90 backdrop-blur-md shadow-sm border-b border-[#E5D8CC] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo-sifted-house.png" alt="Sifted House Logo" className="h-10 w-auto" />
            <h1 className="text-2xl font-bold text-[#37432B]">Admin Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-5 py-2 bg-[#682C23] text-[#FFFBE7] rounded-full font-semibold hover:bg-[#37432B] transition-colors shadow-md"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('checkout')}
            className={`px-6 py-3 rounded-full font-semibold transition-colors shadow-md ${
              activeTab === 'checkout'
                ? 'bg-zinc-800 text-white'
                : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
            }`}
          >
            Checkout
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 rounded-full font-semibold transition-colors shadow-md ${
              activeTab === 'products'
                ? 'bg-zinc-800 text-white'
                : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 rounded-full font-semibold transition-colors shadow-md ${
              activeTab === 'analytics'
                ? 'bg-zinc-800 text-white'
                : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
            }`}
          >
            Analytics
          </button>
        </div>

        {/* CHECKOUT TAB */}
{activeTab === 'checkout' && (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#E5D8CC]">
    <div className="p-6 border-b border-[#E5D8CC] bg-[#FFFBE7]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#37432B]">📦 Checkout List</h2>
          <p className="text-sm text-[#6A6F4C] mt-1">Daftar semua transaksi checkout</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-[#37432B] mb-2">Filter Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border-2 border-[#6A6F4C]/40 rounded-full bg-white text-[#37432B] focus:ring-2 focus:ring-[#6A6F4C] focus:border-transparent"
          >
            <option value="All">All Status</option>
            <option value="PAID">PAID</option>
            <option value="PENDING">PENDING</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#37432B] mb-2">Start Date</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="px-4 py-2 border-2 border-[#6A6F4C]/40 rounded-full bg-white text-[#37432B] focus:ring-2 focus:ring-[#6A6F4C] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#37432B] mb-2">End Date</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="px-4 py-2 border-2 border-[#6A6F4C]/40 rounded-full bg-white text-[#37432B] focus:ring-2 focus:ring-[#6A6F4C] focus:border-transparent"
          />
        </div>

        {(filterStatus !== 'All' || dateRange.start || dateRange.end) && (
          <button
            onClick={() => {
              setFilterStatus('All');
              setDateRange({ start: '', end: '' });
            }}
            className="px-4 py-2 bg-[#6A6F4C]/20 text-[#37432B] rounded-full hover:bg-[#6A6F4C]/30 transition font-medium border border-[#6A6F4C]/30"
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full min-w-[1400px]">
        <thead className="bg-[#E5D8CC]/40 border-b border-[#E5D8CC]">
          <tr>
            <th className="text-left py-4 px-6 text-xs font-bold text-[#37432B] uppercase tracking-wider w-[180px]">
              Order ID
            </th>
            <th className="text-left py-4 px-6 text-xs font-bold text-[#37432B] uppercase tracking-wider w-[220px]">
              Customer
            </th>
            <th className="text-left py-4 px-6 text-xs font-bold text-[#37432B] uppercase tracking-wider w-[240px]">
              Order
            </th>
            <th className="text-left py-4 px-6 text-xs font-bold text-[#37432B] uppercase tracking-wider w-[200px]">
              Address
            </th>
            <th className="text-left py-4 px-6 text-xs font-bold text-[#37432B] uppercase tracking-wider w-[180px]">
              Notes
            </th>
            <th className="text-left py-4 px-6 text-xs font-bold text-[#37432B] uppercase tracking-wider w-[130px]">
              Amount
            </th>
            <th className="text-left py-4 px-6 text-xs font-bold text-[#37432B] uppercase tracking-wider w-[120px]">
              Status
            </th>
            <th className="text-left py-4 px-6 text-xs font-bold text-[#37432B] uppercase tracking-wider w-[130px]">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5D8CC]">
          {data?.payments
            ?.filter((payment) => {
              if (filterStatus !== 'All' && payment.status !== filterStatus) return false;
              if (dateRange.start || dateRange.end) {
                const paymentDate = new Date(payment.createdAt);
                const startDate = dateRange.start ? new Date(dateRange.start) : null;
                const endDate = dateRange.end ? new Date(dateRange.end + 'T23:59:59') : null;
                if (startDate && paymentDate < startDate) return false;
                if (endDate && paymentDate > endDate) return false;
              }
              return true;
            })
            .map((payment) => (
              <tr key={payment._id} className="transition bg-white hover:bg-[#E5D8CC]/30">
                {/* Order ID */}
                <td className="py-5 px-6">
                  <span className="font-mono text-sm font-semibold text-[#37432B]">
                    {payment.externalId}
                  </span>
                </td>

                {/* Customer - Nama Lengkap */}
                <td className="py-5 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#6A6F4C] rounded-full flex items-center justify-center text-[#FFFBE7] font-bold text-sm flex-shrink-0">
                      {payment.payerName ? payment.payerName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-[#37432B] truncate">
                        {payment.payerName || 'Unknown'}
                      </div>
                      <div className="text-xs text-[#6A6F4C] truncate">
                        {payment.payerEmail}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Order - Items yang dipesan */}
                <td className="py-5 px-6">
                  <div className="text-sm text-[#37432B] space-y-1.5">
                    {payment.items && payment.items.length > 0 ? (
                      payment.items.map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="font-bold text-[#682C23] text-base min-w-[35px]">
                            {item.quantity}x
                          </span>
                          <span className="flex-1">{item.name}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[#6A6F4C] italic">No items</span>
                    )}
                  </div>
                </td>

                {/* Address */}
                <td className="py-5 px-6">
                  <div className="text-sm text-[#37432B]">
                    <span className="line-clamp-3">
                      {payment.address || '-'}
                    </span>
                  </div>
                </td>

                {/* Notes */}
                <td className="py-5 px-6">
                  <div className="text-sm">
                    {payment.notes ? (
                      <span className="line-clamp-2 italic text-[#6A6F4C]">
                        "{payment.notes}"
                      </span>
                    ) : (
                      <span className="text-[#6A6F4C]">-</span>
                    )}
                  </div>
                </td>

                {/* Amount */}
                <td className="py-5 px-6">
                  <span className="text-base font-bold text-[#682C23] whitespace-nowrap">
                    Rp {payment.amount.toLocaleString('id-ID')}
                  </span>
                </td>

                {/* Status */}
                <td className="py-5 px-6">
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap ${
                      payment.status === 'PAID'
                        ? 'bg-[#6A6F4C]/20 text-[#37432B] border-[#6A6F4C]/40'
                        : payment.status === 'PENDING'
                        ? 'bg-[#E5D8CC]/50 text-[#6A6F4C] border-[#6A6F4C]/30'
                        : 'bg-[#682C23]/20 text-[#682C23] border-[#682C23]/40'
                    }`}
                  >
                    {payment.status}
                  </span>
                </td>

                {/* Date */}
                <td className="py-5 px-6 text-sm text-[#6A6F4C] whitespace-nowrap">
                  {new Date(payment.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>

    <div className="p-4 bg-zinc-50 border-t flex justify-between items-center">
      <span className="text-sm text-zinc-600">
        Showing{' '}
        {data?.payments?.filter((payment) => {
          if (filterStatus !== 'All' && payment.status !== filterStatus) return false;
          if (dateRange.start || dateRange.end) {
            const paymentDate = new Date(payment.createdAt);
            const startDate = dateRange.start ? new Date(dateRange.start) : null;
            const endDate = dateRange.end ? new Date(dateRange.end + 'T23:59:59') : null;
            if (startDate && paymentDate < startDate) return false;
            if (endDate && paymentDate > endDate) return false;
          }
          return true;
        }).length || 0}{' '}
        of {data?.payments?.length || 0} transactions
      </span>
    </div>
  </div>
)}

        {/* PRODUCTS TAB */}
{activeTab === 'products' && (
  <div className="min-h-screen">
    <div className="flex justify-between items-center mb-8">
      <div>
        <h2 className="text-3xl font-bold text-[#37432B]">Products Management</h2>
        <p className="text-[#6A6F4C] mt-1">Kelola semua produk di toko Anda</p>
      </div>
      <button
        onClick={() => {
          setShowAddProduct(!showAddProduct);
          setEditingProduct(null);
          setNewProduct({ name: '', price: '', description: '', category: 'Drinks', imageUrl: '' });
        }}
        className="px-6 py-3 bg-[#6A6F4C] text-[#FFFBE7] rounded-full font-semibold hover:bg-[#37432B] transition shadow-lg border border-[#6A6F4C]"
      >
        {showAddProduct ? '✕ Cancel' : '+ Add Product'}
      </button>
    </div>

    {showAddProduct && (
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-[#E5D8CC]">
        <h3 className="text-2xl font-bold mb-6 text-[#37432B]">
          {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
        </h3>
        <form onSubmit={handleAddProduct} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-[#37432B] mb-2">Product Name *</label>
              <input
                type="text"
                placeholder="Ex: Es Kopi Susu"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="w-full px-4 py-3 border border-[#E5D8CC] rounded-lg focus:ring-2 focus:ring-[#37432B] focus:border-transparent transition text-[#682C23] placeholder-[#E5D8CC]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#37432B] mb-2">Price (Rp) *</label>
              <input
                type="number"
                placeholder="22000"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                className="w-full px-4 py-3 border border-[#E5D8CC] rounded-lg focus:ring-2 focus:ring-[#37432B] focus:border-transparent transition text-[#682C23] placeholder-[#E5D8CC]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#37432B] mb-2">Category *</label>
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="w-full px-4 py-3 border border-[#E5D8CC] rounded-lg focus:ring-2 focus:ring-[#37432B] focus:border-transparent transition text-[#682C23]"
                required
              >
                <option value="Drinks">Drinks</option>
                <option value="Additional">Additional</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#37432B] mb-2">Image URL</label>
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={newProduct.imageUrl}
                onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                className="w-full px-4 py-3 border border-[#E5D8CC] rounded-lg focus:ring-2 focus:ring-[#37432B] focus:border-transparent transition text-[#682C23] placeholder-[#E5D8CC]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#37432B] mb-2">Description *</label>
            <textarea
              placeholder="Perpaduan kopi, susu, dan gula aren..."
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              className="w-full px-4 py-3 border border-[#E5D8CC] rounded-lg focus:ring-2 focus:ring-[#37432B] focus:border-transparent transition text-[#682C23] placeholder-[#E5D8CC]"
              rows="3"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#6A6F4C] text-[#FFFBE7] py-4 rounded-full font-bold text-lg hover:bg-[#37432B] transition shadow-lg border border-[#6A6F4C]"
          >
            {editingProduct ? '💾 Update Product' : '✨ Create Product'}
          </button>
        </form>
      </div>
    )}

    {loadingProducts ? (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-[#6A6F4C]"></div>
        <p className="mt-4 text-[#6A6F4C] font-medium">Loading products...</p>
      </div>
    ) : products.length > 0 ? (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-xl shadow-lg overflow-hidden flex transform hover:-translate-y-1 transition-transform duration-300 border border-[#E5D8CC]"
          >
            <div className="w-1/3 flex-shrink-0 relative">
              <img
                src={product.imageUrl || `https://placehold.co/400x400/FFFBE7/37432B?text=No+Image`}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2">
                <span className="px-2 py-1 bg-[#37432B] text-[#FFFBE7] text-xs font-bold rounded-full">
                  {product.category}
                </span>
              </div>
            </div>

            <div className="w-2/3 p-5 flex flex-col">
              <div>
                <h2 className="text-xl font-bold text-[#37432B]">{product.name}</h2>
                <p className="text-lg font-black text-[#682C23] mb-2">
                  Rp {product.price.toLocaleString('id-ID')}
                </p>
              </div>

              <p className="text-[#6A6F4C] text-sm mb-4 flex-grow line-clamp-3">
                {product.description}
              </p>

              <div className="mt-auto flex gap-2">
                <button
                  onClick={() => handleEditProduct(product)}
                  className="flex-1 bg-[#6A6F4C] text-[#FFFBE7] font-bold py-2 px-4 rounded-full hover:bg-[#37432B] transition-colors shadow-md border border-[#6A6F4C]"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteProduct(product._id)}
                  className="flex-1 bg-[#682C23] text-[#FFFBE7] font-bold py-2 px-4 rounded-full hover:opacity-90 transition-colors shadow-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="bg-white rounded-xl shadow-lg p-16 text-center border border-[#E5D8CC]">
        <svg className="w-32 h-32 mx-auto text-[#E5D8CC] mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-[#37432B] text-2xl font-bold mb-2">No products yet</p>
        <p className="text-[#6A6F4C] mb-6">Start by adding your first product to the store</p>
        <button
          onClick={() => setShowAddProduct(true)}
          className="px-8 py-3 bg-[#6A6F4C] text-[#FFFBE7] rounded-full font-bold hover:bg-[#37432B] transition border border-[#6A6F4C]"
        >
          + Add First Product
        </button>
      </div>
    )}
  </div>
)}


        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Summary Cards */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  {/* Total Revenue */}
  <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#37432B] hover:shadow-lg transition">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-[#6A6F4C] font-medium mb-1">Total Revenue</p>
        <h3 className="text-2xl font-bold text-[#37432B]">
          Rp {(data?.analytics?.totalRevenue || 0).toLocaleString('id-ID')}
        </h3>
        <p className="text-xs text-[#6A6F4C] font-semibold mt-1">
          ↑ {data?.analytics?.totalOrders || 0} transaksi
        </p>
      </div>
      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor:'#37432B1A'}}>
        <svg className="w-6 h-6" style={{color:'#37432B'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    </div>
  </div>

  {/* Transaksi Sukses */}
  <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#6A6F4C] hover:shadow-lg transition">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-[#6A6F4C] font-medium mb-1">Transaksi Sukses</p>
        <h3 className="text-2xl font-bold text-[#37432B]">
          {data?.analytics?.totalOrders || 0}
        </h3>
        <p className="text-xs text-[#6A6F4C] font-semibold mt-1">PAID orders</p>
      </div>
      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor:'#6A6F4C1A'}}>
        <svg className="w-6 h-6" style={{color:'#6A6F4C'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    </div>
  </div>

  {/* Rata-rata Order */}
  <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#682C23] hover:shadow-lg transition">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-[#6A6F4C] font-medium mb-1">Rata-rata Order</p>
        <h3 className="text-2xl font-bold text-[#37432B]">
          Rp {data?.analytics?.totalOrders > 0
            ? Math.round(data.analytics.totalRevenue / data.analytics.totalOrders).toLocaleString('id-ID')
            : 0}
        </h3>
        <p className="text-xs font-semibold mt-1" style={{color:'#682C23'}}>per transaksi</p>
      </div>
      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor:'#682C2314'}}>
        <svg className="w-6 h-6" style={{color:'#682C23'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
    </div>
  </div>

  {/* Conversion Rate */}
  <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#9C7A4C] hover:shadow-lg transition">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-[#6A6F4C] font-medium mb-1">Conversion Rate</p>
        <h3 className="text-2xl font-bold text-[#37432B]">
          {data?.payments?.length > 0
            ? ((data.analytics.totalOrders / data.payments.length) * 100).toFixed(1)
            : 0
          }%
        </h3>
        <p className="text-xs font-semibold mt-1" style={{color:'#9C7A4C'}}>
          dari {data?.payments?.length || 0} checkout
        </p>
      </div>
      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor:'#9C7A4C1A'}}>
        <svg className="w-6 h-6" style={{color:'#9C7A4C'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>
    </div>
  </div>
</div>


            {/* Daily Revenue Chart (Clean) */}
<div className="bg-white rounded-xl shadow-md p-6">
  <div className="mb-4">
    <h3 className="text-lg font-bold text-[#37432B] mb-4">Omset Harian</h3>

    <div className="flex flex-wrap gap-3 items-center">
      <div className="flex gap-2">
        <button
          onClick={() => setRevenueView('7days')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
            revenueView === '7days'
              ? 'bg-[#37432B] text-[#FFFBE7]'
              : 'bg-[#E5D8CC] text-[#37432B] hover:bg-[#6A6F4C] hover:text-[#FFFBE7]'
          }`}
        >
          7 Hari Terakhir
        </button>
        <button
          onClick={() => setRevenueView('30days')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
            revenueView === '30days'
              ? 'bg-[#37432B] text-[#FFFBE7]'
              : 'bg-[#E5D8CC] text-[#37432B] hover:bg-[#6A6F4C] hover:text-[#FFFBE7]'
          }`}
        >
          30 Hari Terakhir
        </button>
        <button
          onClick={() => setRevenueView('monthly')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
            revenueView === 'monthly'
              ? 'bg-[#37432B] text-[#FFFBE7]'
              : 'bg-[#E5D8CC] text-[#37432B] hover:bg-[#6A6F4C] hover:text-[#FFFBE7]'
          }`}
        >
          Per Bulan
        </button>
      </div>

      {revenueView === 'monthly' && (
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 text-sm border border-[#E5D8CC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37432B] text-[#37432B]"
        >
          <option value="01">Januari</option>
          <option value="02">Februari</option>
          <option value="03">Maret</option>
          <option value="04">April</option>
          <option value="05">Mei</option>
          <option value="06">Juni</option>
          <option value="07">Juli</option>
          <option value="08">Agustus</option>
          <option value="09">September</option>
          <option value="10">Oktober</option>
          <option value="11">November</option>
          <option value="12">Desember</option>
        </select>
      )}
    </div>
  </div>

  {(() => {
    let allDates = [];
    const today = new Date();

    if (revenueView === '7days') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        allDates.push(date.toISOString().split('T')[0]);
      }
    } else if (revenueView === '30days') {
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        allDates.push(date.toISOString().split('T')[0]);
      }
    } else if (revenueView === 'monthly') {
      const year = today.getFullYear();
      const month = parseInt(selectedMonth);
      const daysInMonth = new Date(year, month, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        allDates.push(date.toISOString().split('T')[0]);
      }
    }

    const dataMap = {};
    (data?.analytics?.dailyRevenue || []).forEach(item => {
      dataMap[item._id] = item;
    });

    const completeData = allDates.map(date => ({
      date: date,
      total: dataMap[date]?.total || 0,
      count: dataMap[date]?.count || 0,
      displayDate: new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
      })
    }));

    if (completeData.length === 0) {
      return (
        <div className="h-80 flex items-center justify-center bg-[#FFFBE7] rounded-lg border border-[#E5D8CC]">
          <div className="text-center text-[#6A6F4C]">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm font-medium">Tidak ada data</p>
          </div>
        </div>
      );
    }

    // Custom Tooltip Component (palette)
    const CustomTooltip = ({ active, payload }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white border border-[#E5D8CC] rounded-lg py-2 px-3 shadow-lg">
            <div className="font-bold mb-1 text-[#37432B]">
              {new Date(payload[0].payload.date).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
              })}
            </div>
            <div className="text-[#37432B] font-semibold">
              Rp {payload[0].value.toLocaleString('id-ID')}
            </div>
            {payload[0].payload.count > 0 && (
              <div className="text-[#6A6F4C] text-xs mt-1">
                {payload[0].payload.count} transaksi
              </div>
            )}
          </div>
        );
      }
      return null;
    };

    return (
      <div className="w-full" style={{ height: '320px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={completeData}
            margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5D8CC" />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 12, fill: '#6A6F4C' }}
              tickLine={false}
              axisLine={{ stroke: '#E5D8CC' }}
              interval={completeData.length > 15 ? Math.ceil(completeData.length / 8) : 'preserveStartEnd'}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6A6F4C' }}
              tickLine={false}
              axisLine={{ stroke: '#E5D8CC' }}
              tickFormatter={(value) => (value / 1000).toFixed(0) + 'k'}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#6A6F4C"
              strokeWidth={2}
              dot={{ fill: '#6A6F4C', r: 3 }}
              activeDot={{ r: 5, fill: '#37432B' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  })()}
</div>


            {/* Status Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-zinc-800 mb-4">Status Pesanan</h3>

                {data?.analytics?.statusSummary && data.analytics.statusSummary.length > 0 ? (
                  <div className="space-y-3">
                    {data.analytics.statusSummary.map((status) => (
                      <div
                        key={status._id}
                        className={`p-4 rounded-xl border-2 ${
                          status._id === 'PAID'
                            ? 'bg-green-50 border-green-200'
                            : status._id === 'PENDING'
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-sm font-bold ${
                              status._id === 'PAID'
                                ? 'text-green-800'
                                : status._id === 'PENDING'
                                ? 'text-yellow-800'
                                : 'text-red-800'
                            }`}
                          >
                            {status._id}
                          </span>
                          <span
                            className={`text-2xl font-bold ${
                              status._id === 'PAID'
                                ? 'text-green-700'
                                : status._id === 'PENDING'
                                ? 'text-yellow-700'
                                : 'text-red-700'
                            }`}
                          >
                            {status.count}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-600 font-medium">
                          Rp {status.total.toLocaleString('id-ID')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center bg-zinc-50 rounded-lg">
                    <p className="text-sm text-zinc-400">No data</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}