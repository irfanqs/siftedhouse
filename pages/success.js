import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useEffect } from 'react';

function useClearCart() {
  const { setCart } = useCart(); 
  useEffect(() => {
    if (setCart) {
      setCart([]);
    }
  }, [setCart]);
}

export default function SuccessPage() {
  useClearCart();

  return (
    <div className="bg-[#FFFBE7] min-h-screen flex items-center justify-center font-sans text-[#37432B]">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md border border-[#E5D8CC]">
        <h1 className="text-4xl font-bold text-[#6A6F4C] mb-4">✅</h1>
        <h2 className="text-2xl font-bold mb-2">Pembayaran Berhasil!</h2>
        <p className="text-[#6A6F4C] mb-6">
          Terima kasih telah berbelanja. Kami akan segera memproses pesananmu.
        </p>
        <Link href="/select-items">
          <button className="w-full bg-[#6A6F4C] text-[#FFFBE7] font-bold py-3 px-6 rounded-full hover:bg-[#37432B] transition-colors border border-[#6A6F4C]">
            Kembali ke Menu
          </button>
        </Link>
      </div>
    </div>
  );
}
