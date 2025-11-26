import { useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login gagal');
      }

      localStorage.setItem('admin', JSON.stringify(data.admin));
      router.push('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBE7] flex items-center justify-center p-4 font-sans text-[#37432B]">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-[#E5D8CC]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#6A6F4C] rounded-full mb-4">
            <svg className="w-8 h-8 text-[#FFFBE7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Admin Login</h1>

          {/* Logo di bawah judul, di atas subjudul */}
          <img
            src="/logo-sifted-house.png"
            alt="Sifted House"
            className="h-10 mx-auto mb-2"
          />

          <p className="text-[#6A6F4C]">*This page is ONLY for Sifted House Admin!*</p>
        </div>

        {error && (
          <div className="bg-[#682C23]/10 border border-[#682C23]/30 text-[#682C23] px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 border border-[#E5D8CC] rounded-lg focus:ring-2 focus:ring-[#37432B] focus:border-transparent transition placeholder-[#E5D8CC] text-[#37432B]"
              placeholder="admin"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-[#E5D8CC] rounded-lg focus:ring-2 focus:ring-[#37432B] focus:border-transparent transition placeholder-[#E5D8CC] text-[#37432B]"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6A6F4C] text-[#FFFBE7] py-3 rounded-full font-semibold hover:bg-[#37432B] transition shadow-md border border-[#6A6F4C] disabled:bg-[#6A6F4C]/50 disabled:border-[#6A6F4C]/50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
