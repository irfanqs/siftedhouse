// pages/api/payments.js
const midtransClient = require('midtrans-client');
import connectDB from '../../lib/mongodb';
import Payment from '../../models/Payment';
import { sendPendingPaymentTemplate } from '../../lib/whatsapp';

// ===== Helpers =====
function resolveBaseUrl() {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    'http://localhost:3000';
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}
const BASE_URL = resolveBaseUrl();

function isLiveMode() {
  const key = process.env.MIDTRANS_SERVER_KEY || '';
  // Production key format: Mid-server-xxx (tanpa SB-)
  return !key.includes('SB-') && !key.includes('sandbox');
}

function normalizePhone(phone) {
  if (!phone) return '';
  let v = String(phone).replace(/[^\d+]/g, '');
  if (v.startsWith('+62')) v = '62' + v.slice(3);
  else if (v.startsWith('0')) v = '62' + v.slice(1);
  return v;
}

// Toggle WA
const WA_ENABLED = (process.env.WHATSAPP_ENABLE || '0') === '1';
const WA_ALLOW_TEST = (process.env.WHATSAPP_ALLOW_TEST || '0') === '1';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await connectDB();

  try {
    const { cart, total, customer } = req.body;

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Missing cart items' });
    }
    if (!total || !customer || !customer.email) {
      return res.status(400).json({ error: 'Missing required data in request' });
    }

    const amount = Number(total);
    if (Number.isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const orderId = `ORDER-${Date.now()}`;
    const normalizedPhone = normalizePhone(customer.phone);

    // Format items untuk MongoDB
    const items = cart.map(item => ({
      name: item?.name || 'Item',
      quantity: Number(item?.quantity || 0),
      price: Number(item?.price || 0)
    }));

    // ===== 1) Simpan payment lokal = PENDING =====
    const paymentDoc = await Payment.create({
      externalId: orderId,
      amount: amount,
      payerEmail: customer.email,
      payerName: customer.name || '',
      phone: normalizedPhone,
      address: customer.address || '',
      notes: customer.notes || '',
      status: 'PENDING',
      cart,
      items,
    });

    console.log('✅ Payment created in MongoDB:', paymentDoc._id);

    // ===== 2) Inisialisasi Midtrans Snap =====
    const snap = new midtransClient.Snap({
      isProduction: isLiveMode(),
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
    });

    // ===== 3) Payload ke Midtrans Snap =====
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: customer.name || 'Customer',
        email: customer.email,
        phone: normalizedPhone || '',
        billing_address: {
          address: customer.address || '',
        },
        shipping_address: {
          address: customer.address || '',
        },
      },
      item_details: cart.map((it) => ({
        id: it?.id || it?.name?.toLowerCase().replace(/\s+/g, '-') || 'item',
        name: it?.name || 'Item',
        price: Number(it?.price || 0),
        quantity: Number(it?.quantity || 0),
      })),
      callbacks: {
        finish: `${BASE_URL}/success`,
        error: `${BASE_URL}/failure`,
        pending: `${BASE_URL}/pending`,
      },
    };

    // ===== 4) Buat transaksi di Midtrans =====
    const transaction = await snap.createTransaction(parameter);
    const snapToken = transaction.token;
    const snapUrl = transaction.redirect_url;

    if (!snapToken || !snapUrl) {
      console.error('[MIDTRANS] Missing token/URL:', transaction);
      return res.status(500).json({ error: 'Gagal membuat transaksi Midtrans' });
    }

    // ===== 5) Update snapToken & invoiceUrl di DB =====
    paymentDoc.snapToken = snapToken;
    paymentDoc.invoiceUrl = snapUrl;
    await paymentDoc.save();

    console.log('✅ Snap Token & URL updated:', snapUrl);

    // ===== 6) (Opsional) Kirim WhatsApp PENDING =====
    const canSendWA = isLiveMode()
      ? WA_ENABLED
      : (WA_ENABLED && WA_ALLOW_TEST);

    if (canSendWA && normalizedPhone) {
      try {
        await sendPendingPaymentTemplate({
          phone: normalizedPhone,
          customer_name: customer.name || (customer.email ? customer.email.split('@')[0] : 'Customer'),
          order_id: orderId,
          amount: amount.toLocaleString('id-ID'),
          order_date: new Date(paymentDoc.createdAt).toLocaleDateString('id-ID'),
          payment_link: snapUrl,
          notes: customer.notes || '',
        });
        console.log('✅ WA template PENDING sent:', orderId, `(mode: ${isLiveMode() ? 'LIVE' : 'TEST'})`);
      } catch (waErr) {
        console.error('❌ WA PENDING error:', waErr?.response?.data || waErr?.message || waErr);
      }
    }

    // ===== 7) Response ke FE =====
    return res.status(200).json({ 
      invoiceUrl: snapUrl,
      snapToken: snapToken,
      externalId: orderId,
      paymentId: paymentDoc._id,
    });
  } catch (error) {
    console.error('Midtrans API Error:', error);
    const errorMessage =
      error?.message || 'Failed to create payment transaction';
    return res.status(500).json({ error: errorMessage });
  }
}