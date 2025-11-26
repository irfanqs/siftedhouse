import { useCart } from '../context/CartContext';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, addToCart, removeFromCart } = useCart();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal; // Pajak dihapus, jadi total = subtotal saja

  return (
    <div className="bg-[#FFFBE7] min-h-screen font-sans text-[#37432B] py-8">
      <div className="container mx-auto p-4 max-w-4xl">
        <Link href="/select-items">
          <button className="text-[#37432B] hover:text-[#6A6F4C] font-semibold mb-4">
            &larr; Kembali ke Menu
          </button>
        </Link>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-[#E5D8CC]">
          <h1 className="text-3xl font-bold mb-6 border-b border-[#E5D8CC] pb-4">
            Keranjang Belanja
          </h1>

          {cart.length === 0 ? (
            <p className="text-center text-[#6A6F4C] py-8">Keranjangmu masih kosong.</p>
          ) : (
            <div>
              {/* Header tabel (desktop) */}
              <div className="hidden md:flex items-center text-left text-sm font-semibold text-[#6A6F4C] uppercase border-b border-[#E5D8CC] pb-2 mb-4">
                <p className="w-5/12">Produk</p>
                <p className="w-2/12 text-center">Harga Satuan</p>
                <p className="w-3/12 text-center">Kuantitas</p>
                <p className="w-2/12 text-right">Subtotal</p>
              </div>

              {/* Items */}
              <div className="space-y-4">
                {cart.map(item => (
                  <div
                    key={item._id}
                    className="flex flex-col md:flex-row gap-4 items-center border-b border-[#E5D8CC] pb-4"
                  >
                    {/* Produk */}
                    <div className="w-full md:w-5/12 flex items-center gap-4">
                      <img
                        src={
                          item.imageUrl ||
                          'https://placehold.co/200x200/6A6F4C/FFFBE7?text=No+Image'
                        }
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border border-[#6A6F4C]/30"
                      />
                      <div>
                        <h2 className="text-lg font-bold">{item.name}</h2>
                        <p className="text-sm text-[#6A6F4C]">{item.description}</p>
                      </div>
                    </div>

                    {/* Harga Satuan */}
                    <div className="w-full md:w-2/12 text-left md:text-center">
                      <p className="md:hidden font-bold">Harga:</p>
                      <p className="text-[#682C23] font-bold">
                        Rp {item.price.toLocaleString('id-ID')}
                      </p>
                    </div>

                    {/* Kuantitas */}
                    <div className="w-full md:w-3/12 flex justify-start md:justify-center">
                      <div className="flex items-center gap-3 bg-[#37432B] text-[#FFFBE7] rounded-full px-3 py-1.5 shadow-md w-fit">
                        <button
                          onClick={() => removeFromCart(item)}
                          className="font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#FFFBE7] rounded"
                          aria-label="Kurangi"
                        >
                          ➖
                        </button>
                        <span className="font-bold text-lg w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#FFFBE7] rounded"
                          aria-label="Tambah"
                        >
                          ➕
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="w-full md:w-2/12 text-left md:text-right">
                      <p className="md:hidden font-bold">Subtotal:</p>
                      <p className="font-bold text-[#682C23]">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rangkuman Biaya */}
              <div className="mt-8 flex flex-col items-end">
                <div className="w-full md:w-1/3 space-y-2 text-lg">
                  <div className="flex justify-between text-[#6A6F4C]">
                    <span>Subtotal</span>
                    <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xl border-t border-[#E5D8CC] pt-2 mt-2 text-[#37432B]">
                    <span>Total</span>
                    <span>Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* CTA Pembayaran */}
              <div className="mt-8">
                <Link href="/payment">
                  <button className="w-full bg-[#6A6F4C] text-[#FFFBE7] font-bold py-4 px-6 rounded-full hover:bg-[#37432B] transition-colors text-lg border border-[#6A6F4C]">
                    Lanjut ke Pembayaran &rarr;
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
