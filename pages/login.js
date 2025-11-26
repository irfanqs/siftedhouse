import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: login, 2: MFA
  const [userId, setUserId] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    mfaCode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setUserId(data.userId);
      setStep(2);
      alert('Kode verifikasi telah dikirim ke WhatsApp Anda');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMFA = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          code: formData.mfaCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      alert('Login berhasil!');
      router.push('/select-items');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5DD] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border-2 border-zinc-200">
        {step === 1 ? (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-800 rounded-full mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-zinc-800 mb-2">Login</h1>
              <p className="text-zinc-600">Masuk ke akun Anda</p>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition text-zinc-800 placeholder-zinc-400 autofill:bg-white autofill:text-zinc-800"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition text-zinc-800 placeholder-zinc-400 autofill:bg-white autofill:text-zinc-800"
                  placeholder="Password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-800 text-white py-3 rounded-full font-semibold hover:bg-zinc-700 transition shadow-md disabled:bg-zinc-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Login'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-zinc-800 mb-2">Verifikasi MFA</h1>
              <p className="text-zinc-600">
                Masukkan kode 6 digit yang dikirim ke WhatsApp Anda
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleVerifyMFA} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Kode Verifikasi
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={formData.mfaCode}
                  onChange={(e) => setFormData({ ...formData, mfaCode: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-zinc-200 rounded-lg text-center text-2xl tracking-widest font-bold focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition text-zinc-800 placeholder-zinc-400 autofill:bg-white autofill:text-zinc-800"
                  placeholder="000000"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-800 text-white py-3 rounded-full font-semibold hover:bg-zinc-700 transition shadow-md disabled:bg-zinc-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verifikasi'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-zinc-600 hover:text-zinc-800 font-medium py-2 transition"
              >
                ← Kembali
              </button>
            </form>
          </>
        )}

        <p className="text-center text-zinc-600 mt-6">
          Belum punya akun?{' '}
          <button
            onClick={() => router.push('/register')}
            className="text-zinc-800 hover:underline font-semibold"
          >
            Daftar di sini
          </button>
        </p>
      </div>
    </div>
  );
}