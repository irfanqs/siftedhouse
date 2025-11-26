// components/ProfileIcon.jsx
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

export default function ProfileIcon() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // admin only
  const menuRef = useRef(null);

  // Helper aman-SSR
  const getAdminFromStorage = () => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem('admin');
    } catch {
      return null;
    }
  };

  // Cek status login admin saat mount
  useEffect(() => {
    const admin = getAdminFromStorage();
    if (admin) setIsLoggedIn(true);
  }, []);

  // Tutup menu kalau klik di luar
  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }
    if (showMenu) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [showMenu]);

  // Tutup menu saat tekan ESC
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setShowMenu(false);
    if (showMenu) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showMenu]);

  // Sinkronisasi status jika login/logout dari tab lain
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'admin') {
        setIsLoggedIn(!!e.newValue);
        if (!e.newValue) setShowMenu(false);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Tutup menu saat berpindah route
  useEffect(() => {
    const handleRoute = () => setShowMenu(false);
    router.events.on('routeChangeStart', handleRoute);
    return () => router.events.off('routeChangeStart', handleRoute);
  }, [router.events]);

  const handleIconClick = () => {
    if (!isLoggedIn) {
      // Belum login -> arahkan ke halaman login admin
      router.push('/admin/login');
      return;
    }
    setShowMenu((v) => !v);
  };

  const gotoAdmin = () => router.push('/admin/dashboard');

  const doLogout = () => {
    try {
      localStorage.removeItem('admin');
    } catch {}
    setIsLoggedIn(false);
    setShowMenu(false);
    router.push('/select-items');
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleIconClick}
        className="relative bg-[#6A6F4C] text-[#FFFBE7] p-2 rounded-full hover:bg-[#37432B] transition-colors focus:outline-none focus:ring-2 focus:ring-[#37432B]"
        aria-label={isLoggedIn ? 'Buka menu admin' : 'Login admin'}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>

        {isLoggedIn && (
          <span className="absolute -top-1 -right-1 bg-green-500 h-3 w-3 rounded-full border-2 border-[#FFFBE7]" />
        )}
      </button>

      {/* Dropdown menu saat admin sudah login */}
      {isLoggedIn && showMenu && (
        <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#E5D8CC] overflow-hidden z-20">
          <div className="px-4 py-3 border-b border-[#E5D8CC]">
            <p className="text-xs text-[#6A6F4C]">Signed in as</p>
            <p className="text-sm font-semibold text-[#37432B]">admin</p>
          </div>

          <button
            onClick={gotoAdmin}
            className="w-full text-left px-4 py-2.5 hover:bg-[#FFFBE7] text-[#37432B]"
          >
            Admin Dashboard
          </button>

          <button
            onClick={doLogout}
            className="w-full text-left px-4 py-2.5 hover:bg-[#FFFBE7] text-[#682C23] border-t border-[#E5D8CC]"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
