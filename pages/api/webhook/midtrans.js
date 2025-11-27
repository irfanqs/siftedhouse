// pages/api/webhook/midtrans.js
import connectDB from '../../../lib/mongodb';
import Payment from '../../../models/Payment';
import { sendPaidPaymentTemplate } from '../../../lib/whatsapp';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const notification = req.body;
    console.log('[MIDTRANS WEBHOOK] received:', notification);

    const {
      order_id,
      transaction_status,
      fraud_status,
      signature_key,
      gross_amount,
      status_code,
      transaction_time,
    } = notification;

    if (!order_id) {
      // biarin 200 supaya Midtrans gak spam retry
      console.warn('[MIDTRANS WEBHOOK] Missing order_id');
      return res.status(200).json({ message: 'No order_id, ignored' });
    }

    // 1) Khusus test dari dashboard (order_id default mereka)
    if (order_id.startsWith('payment_notif_test_')) {
      console.log('[MIDTRANS WEBHOOK] Dashboard test notification, skipping DB update');
      return res.status(200).json({ message: 'Test OK' });
    }

    // 2) Verifikasi signature untuk transaksi beneran
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const hash = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex');

    if (hash !== signature_key) {
      console.error('[MIDTRANS WEBHOOK] Invalid signature');
      // tetap 200 biar Midtrans nggak loop, tapi log keras
      return res.status(200).json({ message: 'Invalid signature, ignored' });
    }

    // 3) Mapping status
    let paymentStatus = 'PENDING';
    if (transaction_status === 'capture' && fraud_status === 'accept') {
      paymentStatus = 'PAID';
    } else if (transaction_status === 'settlement') {
      paymentStatus = 'PAID';
    } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
      paymentStatus = 'FAILED';
    }

    const update = { status: paymentStatus };
    if (paymentStatus === 'PAID') {
      update.paidAt = transaction_time ? new Date(transaction_time) : new Date();
    }

    const payment = await Payment.findOneAndUpdate(
      { externalId: order_id },
      update,
      { new: true }
    );

    if (!payment) {
      console.warn('[MIDTRANS WEBHOOK] Payment not found in DB:', order_id);
      // jangan 404, cukup 200 supaya Midtrans gak retry
      return res.status(200).json({ message: 'Payment not found, ignored' });
    }

    console.log(`[MIDTRANS WEBHOOK] Payment ${order_id} updated to ${paymentStatus}`);

    // 4) Kirim WA kalau PAID (logicmu boleh tetap)
    if (paymentStatus === 'PAID') {
      const WA_ENABLED = (process.env.WHATSAPP_ENABLE || '0') === '1';
      const WA_ALLOW_TEST = (process.env.WHATSAPP_ALLOW_TEST || '0') === '1';
      const isLiveMode = !serverKey.includes('SB-') && !serverKey.includes('sandbox');
      const canSendWA = isLiveMode ? WA_ENABLED : (WA_ENABLED && WA_ALLOW_TEST);

      if (canSendWA && payment.phone) {
        try {
          await sendPaidPaymentTemplate({
            phone: payment.phone,
            customer_name: payment.payerName || payment.payerEmail.split('@')[0],
            order_id: payment.externalId,
            amount: String(payment.amount?.toLocaleString?.('id-ID') || payment.amount),
            paid_at: new Date(update.paidAt).toLocaleString('id-ID'),
          });
          console.log('✅ WA template PAID sent:', payment.externalId);
        } catch (err) {
          console.error('❌ WA PAID error:', err?.response?.data || err?.message || err);
        }
      }
    }

    return res.status(200).json({ message: 'Notification processed successfully' });
  } catch (error) {
    console.error('[MIDTRANS WEBHOOK] Error:', error);
    // untuk error internal, masih aman balas 200, supaya Midtrans gak brute-force retry
    return res.status(200).json({ message: 'Internal error, ignored' });
  }
}
