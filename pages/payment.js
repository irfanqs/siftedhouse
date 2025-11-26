// // pages/payment.js
// import { useCart } from '../context/CartContext';
// import Link from 'next/link';
// import { useEffect, useMemo, useState } from 'react';

// export default function PaymentPage() {
//   const { cart } = useCart();

//   const [isLoading, setIsLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState('');
//   const [customer, setCustomer] = useState({
//     name: '',
//     email: '',
//     address: '',
//     phone: '',
//     notes: '',
//   });

//   // Restore dari localStorage biar ga hilang saat reload
//   useEffect(() => {
//     try {
//       const saved = localStorage.getItem('payment_customer');
//       if (saved) {
//         const parsed = JSON.parse(saved);
//         setCustomer((prev) => ({ ...prev, ...parsed }));
//       }
//     } catch (e) {
//     }
//   }, []);

//   // Simpan tiap perubahan
//   useEffect(() => {
//     try {
//       localStorage.setItem('payment_customer', JSON.stringify(customer));
//     } catch (e) {
//     }
//   }, [customer]);

//   const subtotal = useMemo(
//     () => cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0),
//     [cart]
//   );
//   const total = useMemo(() => subtotal, [subtotal]); // tanpa pajak

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setErrorMsg('');
//     setCustomer((prev) => ({ ...prev, [name]: value }));
//   };

//   // 62xxxxxxxxxx
//   const normalizePhone = (raw) => {
//     if (!raw) return '';
//     let v = raw.replace(/[^\d+]/g, ''); // keep digits & plus
//     // If starts with 0 -> replace with 62
//     if (v.startsWith('0')) v = '62' + v.slice(1);
//     // If starts with +62 -> make it 62
//     if (v.startsWith('+62')) v = '62' + v.slice(3);
//     // If already 62..., keep it
//     return v;
//   };

//   const validateEmail = (email) => {
//     if (!email) return false;
//     // simple email check
//     return /\S+@\S+\.\S+/.test(email);
//   };

//   const validateForm = () => {
//     if (!customer.name.trim()) return 'Nama wajib diisi.';
//     if (!validateEmail(customer.email)) return 'Format email tidak valid.';
//     if (!customer.address.trim()) return 'Alamat wajib diisi.';
//     const normalized = normalizePhone(customer.phone);
//     if (!normalized || !/^62\d{7,15}$/.test(normalized)) {
//       return 'Nomor WhatsApp tidak valid. Gunakan format Indonesia, contoh 0812… (akan diubah ke 62…).';
//     }
//     return '';
//   };

//   const handlePayment = async () => {
//     const message = validateForm();
//     if (message) {
//       setErrorMsg(message);
//       return;
//     }

//     setIsLoading(true);
//     setErrorMsg('');
//     try {
//       const normalizedPhone = normalizePhone(customer.phone);

//       const response = await fetch('/api/payments', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           cart,
//           total,
//           customer: {
//             ...customer,
//             phone: normalizedPhone,
//           },
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.error || 'Payment creation failed');
//       }

//       const { invoiceUrl } = await response.json();

//       // Optional: bersihkan localStorage setelah sukses
//       try {
//         localStorage.removeItem('payment_customer');
//       } catch (e) {
//         // ignore
//       }

//       // Redirect ke halaman invoice/payment gateway
//       window.location.href = invoiceUrl;
//     } catch (error) {
//       console.error('Payment error:', error);
//       setErrorMsg(`Gagal membuat link pembayaran: ${error.message}`);
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="bg-[#FFFBE7] min-h-screen font-sans text-[#37432B] py-8">
//       <div className="container mx-auto p-4 max-w-3xl">
//         <Link href="/checkout" className="inline-block mb-4">
//           <button className="text-[#37432B] hover:text-[#6A6F4C] font-semibold">
//             &larr; Kembali ke Keranjang
//           </button>
//         </Link>

//         <div className="bg-white p-6 rounded-xl shadow-lg border border-[#E5D8CC]">
//           <h1 className="text-3xl font-bold mb-6 border-b border-[#E5D8CC] pb-4">
//             Detail Pembayaran
//           </h1>

//           {/* Info error */}
//           {errorMsg ? (
//             <div className="mb-4 p-3 rounded-lg bg-[#682C23]/10 text-[#682C23] border border-[#682C23]/30">
//               {errorMsg}
//             </div>
//           ) : null}

//           {/* Daftar Item */}
//           <div className="mb-8">
//             <h2 className="text-xl font-semibold mb-3">Item di Keranjang</h2>

//             {cart.length === 0 ? (
//               <div className="p-4 border border-[#E5D8CC] rounded-lg text-[#6A6F4C]">
//                 Keranjang kosong. <Link href="/" className="underline">Belanja dulu</Link> ya.
//               </div>
//             ) : (
//               <div className="divide-y divide-[#E5D8CC] border border-[#E5D8CC] rounded-lg">
//                 {cart.map((item, idx) => {
//                   const line = (item.price || 0) * (item.quantity || 0);
//                   return (
//                     <div key={idx} className="p-4 flex items-start justify-between gap-4">
//                       <div className="flex-1">
//                         <div className="font-medium">{item.name || 'Produk'}</div>
//                         <div className="text-sm text-[#6A6F4C] mt-1">
//                           Qty: {item.quantity || 0} × Rp {(item.price || 0).toLocaleString('id-ID')}
//                         </div>
//                       </div>
//                       <div className="text-right font-semibold text-[#682C23]">
//                         Rp {line.toLocaleString('id-ID')}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           {/* Form Informasi Customer */}
//           <div className="mb-8">
//             <h2 className="text-xl font-semibold mb-3">Informasi Kontak</h2>
//             <div className="grid grid-cols-1 gap-4">
//               <input
//                 type="text"
//                 name="name"
//                 placeholder="Nama Lengkap"
//                 value={customer.name}
//                 onChange={handleInputChange}
//                 className="w-full p-3 border border-[#E5D8CC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37432B] text-[#37432B] placeholder-[#E5D8CC]"
//                 required
//               />
//               <input
//                 type="email"
//                 name="email"
//                 placeholder="Email"
//                 value={customer.email}
//                 onChange={handleInputChange}
//                 className="w-full p-3 border border-[#E5D8CC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37432B] text-[#37432B] placeholder-[#E5D8CC]"
//                 required
//               />
//               <input
//                 type="tel"
//                 name="phone"
//                 placeholder="Nomor WhatsApp (contoh: 081234567890)"
//                 value={customer.phone}
//                 onChange={handleInputChange}
//                 className="w-full p-3 border border-[#E5D8CC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37432B] text-[#37432B] placeholder-[#E5D8CC]"
//                 required
//               />
//               <textarea
//                 name="address"
//                 placeholder="Alamat Pengiriman"
//                 value={customer.address}
//                 onChange={handleInputChange}
//                 className="w-full p-3 border border-[#E5D8CC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37432B] text-[#37432B] placeholder-[#E5D8CC]"
//                 rows="3"
//                 required
//               />
//               <textarea
//                 name="notes"
//                 placeholder="Catatan untuk penjual (opsional)"
//                 value={customer.notes}
//                 onChange={handleInputChange}
//                 className="w-full p-3 border border-[#E5D8CC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37432B] text-[#37432B] placeholder-[#E5D8CC]"
//                 rows="2"
//               />
//               <p className="text-xs text-[#6A6F4C]">
//                 Nomor WhatsApp akan digunakan untuk mengirim status pesanan & link pembayaran.
//               </p>
//             </div>
//           </div>

//           {/* Rangkuman Biaya */}
//           <div>
//             <h2 className="text-xl font-semibold mb-3">Rangkuman Pesanan</h2>
//             <div className="space-y-2 text-lg border-t border-[#E5D8CC] pt-4">
//               <div className="flex justify-between text-[#6A6F4C]">
//                 <span>Subtotal</span>
//                 <span>Rp {subtotal.toLocaleString('id-ID')}</span>
//               </div>
//               <div className="flex justify-between font-bold text-xl pt-2 mt-2 text-[#37432B]">
//                 <span>Total Pembayaran</span>
//                 <span className="text-[#682C23]">Rp {total.toLocaleString('id-ID')}</span>
//               </div>
//             </div>
//           </div>

//           <button
//             onClick={handlePayment}
//             disabled={
//               isLoading ||
//               cart.length === 0 ||
//               !customer.name ||
//               !customer.email ||
//               !customer.address ||
//               !customer.phone
//             }
//             className="w-full bg-[#6A6F4C] text-[#FFFBE7] font-bold py-4 px-6 rounded-full hover:bg-[#37432B] transition-colors mt-8 text-lg border border-[#6A6F4C] disabled:bg-[#6A6F4C]/50 disabled:border-[#6A6F4C]/50"
//           >
//             {isLoading ? 'Memproses...' : 'Konfirmasi & Bayar'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
// pages/payment.js
import { useCart } from '../context/CartContext';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

export default function PaymentPage() {
  const { cart } = useCart();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    notes: '',
  });

  // Restore dari localStorage biar ga hilang saat reload
  useEffect(() => {
    try {
      const saved = localStorage.getItem('payment_customer');
      if (saved) {
        const parsed = JSON.parse(saved);
        setCustomer((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Simpan tiap perubahan
  useEffect(() => {
    try {
      localStorage.setItem('payment_customer', JSON.stringify(customer));
    } catch (e) {
      // ignore
    }
  }, [customer]);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0),
    [cart]
  );
  const total = useMemo(() => subtotal, [subtotal]); // tanpa pajak

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setErrorMsg('');
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  // 62xxxxxxxxxx
  const normalizePhone = (raw) => {
    if (!raw) return '';
    let v = raw.replace(/[^\d+]/g, ''); // keep digits & plus
    // If starts with 0 -> replace with 62
    if (v.startsWith('0')) v = '62' + v.slice(1);
    // If starts with +62 -> make it 62
    if (v.startsWith('+62')) v = '62' + v.slice(3);
    // If already 62..., keep it
    return v;
  };

  const validateEmail = (email) => {
    if (!email) return false;
    // simple email check
    return /\S+@\S+\.\S+/.test(email);
  };

  const validateForm = () => {
    if (!customer.name.trim()) return 'Nama wajib diisi.';
    if (!validateEmail(customer.email)) return 'Format email tidak valid.';
    if (!customer.address.trim()) return 'Alamat wajib diisi.';
    const normalized = normalizePhone(customer.phone);
    if (!normalized || !/^62\d{7,15}$/.test(normalized)) {
      return 'Nomor WhatsApp tidak valid. Gunakan format Indonesia, contoh 0812… (akan diubah ke 62…).';
    }
    return '';
  };

  const handlePayment = async () => {
    const message = validateForm();
    if (message) {
      setErrorMsg(message);
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const normalizedPhone = normalizePhone(customer.phone);

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart,
          total,
          customer: {
            ...customer,
            phone: normalizedPhone,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Payment creation failed');
      }

      const { snapToken } = await response.json();

      // Load Midtrans Snap script
      const snapScript = 'https://app.sandbox.midtrans.com/snap/snap.js';
      const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

      let scriptTag = document.querySelector(`script[src="${snapScript}"]`);
      
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.src = snapScript;
        scriptTag.setAttribute('data-client-key', clientKey);
        document.body.appendChild(scriptTag);
      }

      // Wait for script to load
      await new Promise((resolve) => {
        if (window.snap) {
          resolve();
        } else {
          scriptTag.onload = resolve;
        }
      });

      // Optional: bersihkan localStorage setelah sukses
      try {
        localStorage.removeItem('payment_customer');
      } catch (e) {
        // ignore
      }

      // Open Midtrans Snap popup
      window.snap.pay(snapToken, {
        onSuccess: function (result) {
          console.log('✅ Payment success:', result);
          window.location.href = '/success';
        },
        onPending: function (result) {
          console.log('⏳ Payment pending:', result);
          window.location.href = '/success';
        },
        onError: function (result) {
          console.error('❌ Payment error:', result);
          window.location.href = '/failure';
        },
        onClose: function () {
          console.log('👋 Customer closed the popup');
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMsg(`Gagal membuat link pembayaran: ${error.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#FFFBE7] min-h-screen font-sans text-[#37432B] py-8">
      <div className="container mx-auto p-4 max-w-3xl">
        <Link href="/checkout" className="inline-block mb-4">
          <button className="text-[#37432B] hover:text-[#6A6F4C] font-semibold">
            &larr; Kembali ke Keranjang
          </button>
        </Link>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-[#E5D8CC]">
          <h1 className="text-3xl font-bold mb-6 border-b border-[#E5D8CC] pb-4">
            Detail Pembayaran
          </h1>

          {/* Info error */}
          {errorMsg ? (
            <div className="mb-4 p-3 rounded-lg bg-[#682C23]/10 text-[#682C23] border border-[#682C23]/30">
              {errorMsg}
            </div>
          ) : null}

          {/* Daftar Item */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Item di Keranjang</h2>

            {cart.length === 0 ? (
              <div className="p-4 border border-[#E5D8CC] rounded-lg text-[#6A6F4C]">
                Keranjang kosong. <Link href="/" className="underline">Belanja dulu</Link> ya.
              </div>
            ) : (
              <div className="divide-y divide-[#E5D8CC] border border-[#E5D8CC] rounded-lg">
                {cart.map((item, idx) => {
                  const line = (item.price || 0) * (item.quantity || 0);
                  return (
                    <div key={idx} className="p-4 flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-medium">{item.name || 'Produk'}</div>
                        <div className="text-sm text-[#6A6F4C] mt-1">
                          Qty: {item.quantity || 0} × Rp {(item.price || 0).toLocaleString('id-ID')}
                        </div>
                      </div>
                      <div className="text-right font-semibold text-[#682C23]">
                        Rp {line.toLocaleString('id-ID')}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Form Informasi Customer */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Informasi Kontak</h2>
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Nama Lengkap"
                value={customer.name}
                onChange={handleInputChange}
                className="w-full p-3 border border-[#E5D8CC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37432B] text-[#37432B] placeholder-[#E5D8CC]"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={customer.email}
                onChange={handleInputChange}
                className="w-full p-3 border border-[#E5D8CC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37432B] text-[#37432B] placeholder-[#E5D8CC]"
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Nomor WhatsApp (contoh: 081234567890)"
                value={customer.phone}
                onChange={handleInputChange}
                className="w-full p-3 border border-[#E5D8CC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37432B] text-[#37432B] placeholder-[#E5D8CC]"
                required
              />
              <textarea
                name="address"
                placeholder="Alamat Pengiriman"
                value={customer.address}
                onChange={handleInputChange}
                className="w-full p-3 border border-[#E5D8CC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37432B] text-[#37432B] placeholder-[#E5D8CC]"
                rows="3"
                required
              />
              <textarea
                name="notes"
                placeholder="Catatan untuk penjual (opsional)"
                value={customer.notes}
                onChange={handleInputChange}
                className="w-full p-3 border border-[#E5D8CC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37432B] text-[#37432B] placeholder-[#E5D8CC]"
                rows="2"
              />
              <p className="text-xs text-[#6A6F4C]">
                Nomor WhatsApp akan digunakan untuk mengirim status pesanan & link pembayaran.
              </p>
            </div>
          </div>

          {/* Rangkuman Biaya */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Rangkuman Pesanan</h2>
            <div className="space-y-2 text-lg border-t border-[#E5D8CC] pt-4">
              <div className="flex justify-between text-[#6A6F4C]">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-bold text-xl pt-2 mt-2 text-[#37432B]">
                <span>Total Pembayaran</span>
                <span className="text-[#682C23]">Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={
              isLoading ||
              cart.length === 0 ||
              !customer.name ||
              !customer.email ||
              !customer.address ||
              !customer.phone
            }
            className="w-full bg-[#6A6F4C] text-[#FFFBE7] font-bold py-4 px-6 rounded-full hover:bg-[#37432B] transition-colors mt-8 text-lg border border-[#6A6F4C] disabled:bg-[#6A6F4C]/50 disabled:border-[#6A6F4C]/50"
          >
            {isLoading ? 'Memproses...' : 'Konfirmasi & Bayar'}
          </button>
        </div>
      </div>
    </div>
  );
}