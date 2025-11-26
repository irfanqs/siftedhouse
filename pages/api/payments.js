// // // pages/api/payments.js
// // import { Xendit } from 'xendit-node';
// // import connectDB from '../../lib/mongodb';
// // import Payment from '../../models/Payment';
// // import { sendPendingPaymentTemplate } from '../../lib/whatsapp';

// // // ===== Helpers =====
// // function resolveBaseUrl() {
// //   // PRIORITAS: NEXT_PUBLIC_APP_URL > NEXT_PUBLIC_VERCEL_URL > localhost
// //   const raw =
// //     process.env.NEXT_PUBLIC_APP_URL ||
// //     process.env.NEXT_PUBLIC_VERCEL_URL ||
// //     'http://localhost:3000';
// //   return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
// // }
// // const BASE_URL = resolveBaseUrl();

// // function isLiveMode() {
// //   const key = process.env.XENDIT_SECRET_KEY || '';
// //   return key.startsWith('xnd_production_');
// // }

// // function normalizePhone(phone) {
// //   if (!phone) return '';
// //   let v = String(phone).replace(/[^\d+]/g, ''); // keep digits & '+'
// //   if (v.startsWith('+62')) v = '62' + v.slice(3);
// //   else if (v.startsWith('0')) v = '62' + v.slice(1);
// //   // jika sudah 62..., biarkan
// //   return v;
// // }

// // // Toggle WA:
// // // - WHATSAPP_ENABLE=1 untuk aktifkan pengiriman WA
// // // - WHATSAPP_ALLOW_TEST=1 jika ingin kirim WA meski Xendit masih TEST key
// // const WA_ENABLED = (process.env.WHATSAPP_ENABLE || '0') === '1';
// // const WA_ALLOW_TEST = (process.env.WHATSAPP_ALLOW_TEST || '0') === '1';

// // const xenditClient = new Xendit({
// //   secretKey: process.env.XENDIT_SECRET_KEY,
// // });

// // export default async function handler(req, res) {
// //   if (req.method !== 'POST') {
// //     return res.status(405).json({ message: 'Method not allowed' });
// //   }

// //   await connectDB();

// //   try {
// //     // FE mengirim { cart, total, customer }
// //     // customer: { name, email, phone, address, notes? }
// //     const { cart, total, customer } = req.body;

// //     if (!Array.isArray(cart) || cart.length === 0) {
// //       return res.status(400).json({ error: 'Missing cart items' });
// //     }
// //     if (!total || !customer || !customer.email) {
// //       return res.status(400).json({ error: 'Missing required data in request' });
// //     }

// //     const amount = Number(total);
// //     if (Number.isNaN(amount) || amount <= 0) {
// //       return res.status(400).json({ error: 'Invalid amount' });
// //     }

// //     const externalId = `invoice-uts-${Date.now()}`;
// //     const normalizedPhone = normalizePhone(customer.phone);

// //     // ⬅️ FORMAT ITEMS untuk disimpan di MongoDB
// //     const items = cart.map(item => ({
// //       name: item?.name || 'Item',
// //       quantity: Number(item?.quantity || 0),
// //       price: Number(item?.price || 0)
// //     }));

// //     // ===== 1) Payload ke Xendit (pakai properti camelCase sesuai SDK) =====
// //     const invoicePayload = {
// //       externalId,
// //       amount,
// //       payerEmail: customer.email,
// //       description: `Pembayaran oleh ${customer.name || customer.email} untuk pesanan #${externalId}`,
// //       successRedirectUrl: `${BASE_URL}/success`,
// //       failureRedirectUrl: `${BASE_URL}/failure`,
// //       currency: 'IDR',
// //       customer: {
// //         given_names: customer.name || '',
// //         email: customer.email,
// //         mobile_number: normalizedPhone || undefined,
// //         address: customer.address || '',
// //       },
// //       metadata: {
// //         phone: normalizedPhone,
// //         notes: customer.notes || '',
// //       },
// //       items: cart.map((it) => ({
// //         name: it?.name || 'Item',
// //         quantity: Number(it?.quantity || 0),
// //         price: Number(it?.price || 0),
// //       })),
// //     };

// //     // ===== 2) Simpan payment lokal = PENDING ⬅️ TAMBAH SEMUA FIELD =====
// //     const paymentDoc = await Payment.create({
// //       externalId: invoicePayload.externalId,
// //       amount: invoicePayload.amount,
// //       payerEmail: invoicePayload.payerEmail,
// //       payerName: customer.name || '',
// //       phone: normalizedPhone,
// //       address: customer.address || '', // ⬅️ TAMBAH ADDRESS
// //       notes: customer.notes || '',
// //       status: 'PENDING',
// //       cart,
// //       items, // ⬅️ TAMBAH ITEMS UNTUK DITAMPILKAN DI ADMIN
// //     });

// //     console.log('✅ Payment created in MongoDB:', paymentDoc._id);
// //     console.log('📦 Items saved:', items);

// //     // ===== 3) Buat invoice di Xendit =====
// //     const invoice = await xenditClient.Invoice.createInvoice({ data: invoicePayload });
// //     const invoiceUrl = invoice?.invoiceUrl || invoice?.invoice_url || '';

// //     if (!invoiceUrl) {
// //       console.error('[XENDIT] Missing invoiceUrl:', invoice);
// //       return res.status(500).json({ error: 'Gagal membuat invoice Xendit (no URL)' });
// //     }

// //     // ===== 4) Update invoiceUrl di DB =====
// //     paymentDoc.invoiceUrl = invoiceUrl;
// //     await paymentDoc.save();

// //     console.log('✅ Invoice URL updated:', invoiceUrl);

// //     // ===== 5) (Opsional) Kirim WhatsApp PENDING =====
// //     // RULE:
// //     // - kalau Xendit LIVE → kirim WA hanya jika WHATSAPP_ENABLE=1
// //     // - kalau Xendit TEST → kirim WA HANYA jika WHATSAPP_ENABLE=1 **dan** WHATSAPP_ALLOW_TEST=1
// //     const canSendWA = isLiveMode()
// //       ? WA_ENABLED
// //       : (WA_ENABLED && WA_ALLOW_TEST);

// //     if (canSendWA && normalizedPhone) {
// //       try {
// //         await sendPendingPaymentTemplate({
// //           phone: normalizedPhone, // 62…
// //           customer_name: customer.name || (customer.email ? customer.email.split('@')[0] : 'Customer'),
// //           order_id: externalId,
// //           amount: amount.toLocaleString('id-ID'),
// //           order_date: new Date(paymentDoc.createdAt).toLocaleDateString('id-ID'),
// //           payment_link: invoiceUrl,
// //           notes: customer.notes || '',
// //         });
// //         console.log('✅ WA template PENDING sent:', externalId, `(mode: ${isLiveMode() ? 'LIVE' : 'TEST'})`);
// //       } catch (waErr) {
// //         console.error('❌ WA PENDING error:', waErr?.response?.data || waErr?.message || waErr);
// //         // jangan throw; biarkan checkout tetap berhasil
// //       }
// //     } else {
// //       if (!WA_ENABLED) console.log('ℹ️ Skip kirim WA: WHATSAPP_ENABLE != 1.');
// //       if (!isLiveMode() && !WA_ALLOW_TEST) console.log('ℹ️ Skip kirim WA: Xendit TEST & WHATSAPP_ALLOW_TEST != 1.');
// //       if (!normalizedPhone) console.log('ℹ️ Skip kirim WA: nomor kosong/tidak valid.');
// //     }

// //     // ===== 6) Response ke FE =====
// //     return res.status(200).json({ 
// //       invoiceUrl,
// //       externalId,
// //       paymentId: paymentDoc._id,
// //     });
// //   } catch (error) {
// //     console.error('Xendit API Error:', error?.response?.data || error);
// //     const errorMessage =
// //       error?.response?.data?.message ||
// //       error?.message ||
// //       'Failed to create payment invoice';
// //     return res.status(500).json({ error: errorMessage });
// //   }
// // }

// // pages/api/payments.js
// const midtransClient = require('midtrans-client');
// import connectDB from '../../lib/mongodb';
// import Payment from '../../models/Payment';
// import { sendPendingPaymentTemplate } from '../../lib/whatsapp';

// // ===== Helpers =====
// function resolveBaseUrl() {
//   const raw =
//     process.env.NEXT_PUBLIC_APP_URL ||
//     process.env.NEXT_PUBLIC_VERCEL_URL ||
//     'http://localhost:3000';
//   return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
// }
// const BASE_URL = resolveBaseUrl();

// function isLiveMode() {
//   const key = process.env.MIDTRANS_SERVER_KEY || '';
//   // Production key format: Mid-server-xxx (tanpa SB-)
//   return !key.includes('SB-') && !key.includes('sandbox');
// }

// function normalizePhone(phone) {
//   if (!phone) return '';
//   let v = String(phone).replace(/[^\d+]/g, '');
//   if (v.startsWith('+62')) v = '62' + v.slice(3);
//   else if (v.startsWith('0')) v = '62' + v.slice(1);
//   return v;
// }

// // Toggle WA
// const WA_ENABLED = (process.env.WHATSAPP_ENABLE || '0') === '1';
// const WA_ALLOW_TEST = (process.env.WHATSAPP_ALLOW_TEST || '0') === '1';

// export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method not allowed' });
//   }

//   await connectDB();

//   try {
//     const { cart, total, customer } = req.body;

//     if (!Array.isArray(cart) || cart.length === 0) {
//       return res.status(400).json({ error: 'Missing cart items' });
//     }
//     if (!total || !customer || !customer.email) {
//       return res.status(400).json({ error: 'Missing required data in request' });
//     }

//     const amount = Number(total);
//     if (Number.isNaN(amount) || amount <= 0) {
//       return res.status(400).json({ error: 'Invalid amount' });
//     }

//     const orderId = `ORDER-${Date.now()}`;
//     const normalizedPhone = normalizePhone(customer.phone);

//     // Format items untuk MongoDB
//     const items = cart.map(item => ({
//       name: item?.name || 'Item',
//       quantity: Number(item?.quantity || 0),
//       price: Number(item?.price || 0)
//     }));

//     // ===== 1) Simpan payment lokal = PENDING =====
//     const paymentDoc = await Payment.create({
//       externalId: orderId,
//       amount: amount,
//       payerEmail: customer.email,
//       payerName: customer.name || '',
//       phone: normalizedPhone,
//       address: customer.address || '',
//       notes: customer.notes || '',
//       status: 'PENDING',
//       cart,
//       items,
//     });

//     console.log('✅ Payment created in MongoDB:', paymentDoc._id);

//     // ===== 2) Inisialisasi Midtrans Snap =====
//     const snap = new midtransClient.Snap({
//       isProduction: isLiveMode(),
//       serverKey: process.env.MIDTRANS_SERVER_KEY,
//       clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
//     });

//     // ===== 3) Payload ke Midtrans Snap =====
//     const parameter = {
//       transaction_details: {
//         order_id: orderId,
//         gross_amount: amount,
//       },
//       customer_details: {
//         first_name: customer.name || 'Customer',
//         email: customer.email,
//         phone: normalizedPhone || '',
//         billing_address: {
//           address: customer.address || '',
//         },
//         shipping_address: {
//           address: customer.address || '',
//         },
//       },
//       item_details: cart.map((it) => ({
//         id: it?.id || it?.name?.toLowerCase().replace(/\s+/g, '-') || 'item',
//         name: it?.name || 'Item',
//         price: Number(it?.price || 0),
//         quantity: Number(it?.quantity || 0),
//       })),
//       callbacks: {
//         finish: `${BASE_URL}/success`,
//         error: `${BASE_URL}/failure`,
//         pending: `${BASE_URL}/pending`,
//       },
//     };

//     // ===== 4) Buat transaksi di Midtrans =====
//     const transaction = await snap.createTransaction(parameter);
//     const snapToken = transaction.token;
//     const snapUrl = transaction.redirect_url;

//     if (!snapToken || !snapUrl) {
//       console.error('[MIDTRANS] Missing token/URL:', transaction);
//       return res.status(500).json({ error: 'Gagal membuat transaksi Midtrans' });
//     }

//     // ===== 5) Update snapToken & invoiceUrl di DB =====
//     paymentDoc.snapToken = snapToken;
//     paymentDoc.invoiceUrl = snapUrl;
//     await paymentDoc.save();

//     console.log('✅ Snap Token & URL updated:', snapUrl);

//     // ===== 6) (Opsional) Kirim WhatsApp PENDING =====
//     const canSendWA = isLiveMode()
//       ? WA_ENABLED
//       : (WA_ENABLED && WA_ALLOW_TEST);

//     if (canSendWA && normalizedPhone) {
//       try {
//         await sendPendingPaymentTemplate({
//           phone: normalizedPhone,
//           customer_name: customer.name || (customer.email ? customer.email.split('@')[0] : 'Customer'),
//           order_id: orderId,
//           amount: amount.toLocaleString('id-ID'),
//           order_date: new Date(paymentDoc.createdAt).toLocaleDateString('id-ID'),
//           payment_link: snapUrl,
//           notes: customer.notes || '',
//         });
//         console.log('✅ WA template PENDING sent:', orderId, `(mode: ${isLiveMode() ? 'LIVE' : 'TEST'})`);
//       } catch (waErr) {
//         console.error('❌ WA PENDING error:', waErr?.response?.data || waErr?.message || waErr);
//       }
//     }

//     // ===== 7) Response ke FE =====
//     return res.status(200).json({ 
//       invoiceUrl: snapUrl,
//       snapToken: snapToken,
//       externalId: orderId,
//       paymentId: paymentDoc._id,
//     });
//   } catch (error) {
//     console.error('Midtrans API Error:', error);
//     const errorMessage =
//       error?.message || 'Failed to create payment transaction';
//     return res.status(500).json({ error: errorMessage });
//   }
// }
// // // pages/api/payments.js
import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useRouter } from 'next/router';

export default function PaymentPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validasi cart tidak kosong
      if (cart.length === 0) {
        alert('Keranjang kosong!');
        setLoading(false);
        return;
      }

      // Request ke backend untuk create Midtrans transaction
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: cart.map(item => ({
            id: item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          total,
          customer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal membuat transaksi');
      }

      console.log('✅ Payment created:', data);

      // Load Midtrans Snap script
      const snapScript = 'https://app.midtrans.com/snap/snap.js';
      const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

      // Check if script already loaded
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

      // Open Midtrans Snap popup
      window.snap.pay(data.snapToken, {
        onSuccess: function (result) {
          console.log('✅ Payment success:', result);
          clearCart();
          router.push('/success');
        },
        onPending: function (result) {
          console.log('⏳ Payment pending:', result);
          clearCart();
          router.push('/pending');
        },
        onError: function (result) {
          console.error('❌ Payment error:', result);
          router.push('/failure');
        },
        onClose: function () {
          console.log('👋 Customer closed the popup');
          setLoading(false);
        },
      });
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Terjadi kesalahan saat memproses pembayaran');
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="bg-[#FFFBE7] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#37432B] mb-4">Keranjang Kosong</h1>
          <button
            onClick={() => router.push('/select-items')}
            className="bg-[#6A6F4C] text-[#FFFBE7] px-6 py-3 rounded-full font-bold hover:bg-[#37432B] transition"
          >
            Kembali ke Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFBE7] min-h-screen font-sans text-[#37432B] py-8">
      <div className="container mx-auto p-4 max-w-2xl">
        <button
          onClick={() => router.back()}
          className="text-[#37432B] hover:text-[#6A6F4C] font-semibold mb-4"
        >
          &larr; Kembali
        </button>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-[#E5D8CC]">
          <h1 className="text-3xl font-bold mb-6 border-b border-[#E5D8CC] pb-4">
            Detail Pembayaran
          </h1>

          {/* Order Summary */}
          <div className="mb-6 p-4 bg-[#FFFBE7] rounded-lg border border-[#E5D8CC]">
            <h2 className="font-bold text-lg mb-3">Ringkasan Pesanan</h2>
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item._id} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-bold text-[#682C23]">
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
              <div className="border-t border-[#E5D8CC] pt-2 mt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-[#682C23]">Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Customer Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Nama Lengkap *</label>
              <input
                type="text"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                className="w-full px-4 py-3 border border-[#E5D8CC] rounded-lg focus:ring-2 focus:ring-[#6A6F4C] focus:border-transparent"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Email *</label>
              <input
                type="email"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                className="w-full px-4 py-3 border border-[#E5D8CC] rounded-lg focus:ring-2 focus:ring-[#6A6F4C] focus:border-transparent"
                placeholder="john@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Nomor Telepon *</label>
              <input
                type="tel"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                className="w-full px-4 py-3 border border-[#E5D8CC] rounded-lg focus:ring-2 focus:ring-[#6A6F4C] focus:border-transparent"
                placeholder="08123456789"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Alamat Pengiriman *</label>
              <textarea
                value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                className="w-full px-4 py-3 border border-[#E5D8CC] rounded-lg focus:ring-2 focus:ring-[#6A6F4C] focus:border-transparent"
                placeholder="Jl. Contoh No. 123, Jakarta"
                rows="3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Catatan (Opsional)</label>
              <textarea
                value={customer.notes}
                onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                className="w-full px-4 py-3 border border-[#E5D8CC] rounded-lg focus:ring-2 focus:ring-[#6A6F4C] focus:border-transparent"
                placeholder="Tambahkan catatan untuk pesanan..."
                rows="2"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6A6F4C] text-[#FFFBE7] font-bold py-4 px-6 rounded-full hover:bg-[#37432B] transition-colors text-lg border border-[#6A6F4C] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Memproses...
                </span>
              ) : (
                'Bayar Sekarang'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}