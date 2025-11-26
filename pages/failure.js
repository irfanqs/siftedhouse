import Link from 'next/link';

export default function FailurePage() {
  return (
    <div className="bg-[#F5F5DD] min-h-screen flex items-center justify-center font-sans text-zinc-800">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
        <h1 className="text-4xl font-bold text-red-500 mb-4">❌</h1>
        <h2 className="text-2xl font-bold mb-2">Pembayaran Gagal</h2>
        <p className="text-zinc-600 mb-6">
          Maaf, terjadi masalah saat memproses pembayaranmu. Keranjang belanjamu masih tersimpan.
        </p>
        <Link href="/checkout">
          <button className="w-full bg-zinc-800 text-white font-bold py-3 px-6 rounded-lg hover:bg-zinc-700 transition-colors">
            Coba Bayar Lagi
          </button>
        </Link>
      </div>
    </div>
  );
}
