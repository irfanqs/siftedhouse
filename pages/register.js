import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registrasi gagal');
      }

      alert('Registrasi berhasil! Silakan login.');
      router.push('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5DD] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border-2 border-zinc-200">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-800 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-zinc-800 mb-2">Daftar Akun</h1>
          <p className="text-zinc-600">Buat akun baru untuk melanjutkan</p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Nama Lengkap
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition text-zinc-800 placeholder-zinc-400 autofill:bg-white autofill:text-zinc-800"
              placeholder="Priscilla J"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition text-zinc-800 placeholder-zinc-400 autofill:bg-white autofill:text-zinc-800"
              placeholder="pris@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Nomor WhatsApp
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition text-zinc-800 placeholder-zinc-400 autofill:bg-white autofill:text-zinc-800"
              placeholder="6281234567890 (dengan kode negara)"
            />
            <p className="text-xs text-zinc-500 mt-1">Format: 6281234567890 (tanpa +)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-4 py-3 border-2 border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition text-zinc-800 placeholder-zinc-400 autofill:bg-white autofill:text-zinc-800"
              placeholder="Minimal 6 karakter"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Konfirmasi Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition text-zinc-800 placeholder-zinc-400 autofill:bg-white autofill:text-zinc-800"
              placeholder="Ketik ulang password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-800 text-white py-3 rounded-full font-semibold hover:bg-zinc-700 transition shadow-md disabled:bg-zinc-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Mendaftar...' : 'Daftar'}
          </button>
        </form>

        <p className="text-center text-zinc-600 mt-6">
          Sudah punya akun?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-zinc-800 hover:underline font-semibold"
          >
            Login di sini
          </button>
        </p>
      </div>
    </div>
  );
}