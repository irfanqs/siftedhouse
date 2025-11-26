// // pages/api/webhook/xendit.js
// import connectDB from '../../../lib/mongodb';
// import Payment from '../../../models/Payment';
// import { sendPaidPaymentTemplate } from '../../../lib/whatsapp';

// export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method not allowed' });
//   }

//   try {
//     // === 1. Verifikasi callback token dari Xendit ===
//     const xenditWebhookToken = req.headers['x-callback-token'];
//     if (!xenditWebhookToken || xenditWebhookToken !== process.env.XENDIT_CALLBACK_TOKEN) {
//       console.error('[XENDIT WEBHOOK] Invalid callback token');
//       return res.status(401).json({ message: 'Unauthorized' });
//     }

//     await connectDB();

//     // === 2. Terima payload dari Xendit ===
//     const data = req.body;
//     console.log('[XENDIT WEBHOOK] received:', data);

//     const externalId = data?.external_id;
//     const status = data?.status;
//     const paidAmount = data?.paid_amount;
//     const paidAt = data?.paid_at;

//     if (!externalId) {
//       return res.status(400).json({ message: 'Missing external_id' });
//     }

//     // === 3. Update status di database ===
//     const update = {};
//     if (status) update.status = status;
//     if (status === 'PAID') update.paidAt = paidAt || new Date();

//     const payment = await Payment.findOneAndUpdate(
//       { externalId },
//       update,
//       { new: true }
//     );

//     if (!payment) {
//       console.warn('[XENDIT WEBHOOK] Payment not found:', externalId);
//       return res.status(404).json({ message: 'Payment not found' });
//     }

//     console.log(
//       `[XENDIT WEBHOOK] Payment ${externalId} updated to ${status} with paidAt=${update.paidAt}`
//     );

//     // === 4. Jika status PAID, kirim WA ===
//     if (status === 'PAID') {
//       const WA_ENABLED = (process.env.WHATSAPP_ENABLE || '0') === '1';
//       const WA_ALLOW_TEST = (process.env.WHATSAPP_ALLOW_TEST || '0') === '1';
//       const isLiveMode = (process.env.XENDIT_SECRET_KEY || '').startsWith('xnd_production_');
//       const canSendWA = isLiveMode ? WA_ENABLED : (WA_ENABLED && WA_ALLOW_TEST);

//       if (payment && canSendWA && payment.phone) {
//         try {
//           await sendPaidPaymentTemplate({
//             phone: payment.phone,
//             customer_name: payment.payerName || payment.payerEmail.split('@')[0],
//             order_id: payment.externalId,
//             amount: String(payment.amount?.toLocaleString?.('id-ID') || payment.amount),
//             paid_at: new Date(update.paidAt).toLocaleString('id-ID'),
//           });
//           console.log(
//             '✅ WA template PAID sent:',
//             payment.externalId,
//             `(mode: ${isLiveMode ? 'LIVE' : 'TEST'})`
//           );
//         } catch (err) {
//           console.error('❌ WA PAID error:', err?.response?.data || err?.message || err);
//         }
//       } else {
//         if (!WA_ENABLED) console.log('ℹ️ Skip WA(PAID): WHATSAPP_ENABLE != 1');
//         if (!isLiveMode && !WA_ALLOW_TEST)
//           console.log('ℹ️ Skip WA(PAID): TEST mode & WHATSAPP_ALLOW_TEST != 1');
//         if (!payment?.phone) console.log('ℹ️ Skip WA(PAID): nomor WA kosong');
//       }
//     }

//     // === 5. Kirim respons sukses ke Xendit ===
//     return res.status(200).json({ message: 'Webhook processed successfully' });
//   } catch (error) {
//     console.error('[XENDIT WEBHOOK] Error:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// }

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

    // === 1. Terima notifikasi dari Midtrans ===
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
      return res.status(400).json({ message: 'Missing order_id' });
    }

    // === 2. Verifikasi signature ===
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const hash = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex');

    if (hash !== signature_key) {
      console.error('[MIDTRANS WEBHOOK] Invalid signature');
      return res.status(401).json({ message: 'Invalid signature' });
    }

    // === 3. Tentukan status berdasarkan transaction_status ===
    let paymentStatus = 'PENDING';

    if (transaction_status === 'capture') {
      if (fraud_status === 'accept') {
        paymentStatus = 'PAID';
      }
    } else if (transaction_status === 'settlement') {
      paymentStatus = 'PAID';
    } else if (
      transaction_status === 'cancel' ||
      transaction_status === 'deny' ||
      transaction_status === 'expire'
    ) {
      paymentStatus = 'FAILED';
    } else if (transaction_status === 'pending') {
      paymentStatus = 'PENDING';
    }

    // === 4. Update status di database ===
    const update = {
      status: paymentStatus,
    };

    if (paymentStatus === 'PAID') {
      update.paidAt = transaction_time ? new Date(transaction_time) : new Date();
    }

    const payment = await Payment.findOneAndUpdate(
      { externalId: order_id },
      update,
      { new: true }
    );

    if (!payment) {
      console.warn('[MIDTRANS WEBHOOK] Payment not found:', order_id);
      return res.status(404).json({ message: 'Payment not found' });
    }

    console.log(
      `[MIDTRANS WEBHOOK] Payment ${order_id} updated to ${paymentStatus}`
    );

    // === 5. Jika status PAID, kirim WA ===
    if (paymentStatus === 'PAID') {
      const WA_ENABLED = (process.env.WHATSAPP_ENABLE || '0') === '1';
      const WA_ALLOW_TEST = (process.env.WHATSAPP_ALLOW_TEST || '0') === '1';
      const isLiveMode = !serverKey.includes('SB-') && !serverKey.includes('sandbox');
      const canSendWA = isLiveMode ? WA_ENABLED : (WA_ENABLED && WA_ALLOW_TEST);

      if (payment && canSendWA && payment.phone) {
        try {
          await sendPaidPaymentTemplate({
            phone: payment.phone,
            customer_name: payment.payerName || payment.payerEmail.split('@')[0],
            order_id: payment.externalId,
            amount: String(payment.amount?.toLocaleString?.('id-ID') || payment.amount),
            paid_at: new Date(update.paidAt).toLocaleString('id-ID'),
          });
          console.log(
            '✅ WA template PAID sent:',
            payment.externalId,
            `(mode: ${isLiveMode ? 'LIVE' : 'TEST'})`
          );
        } catch (err) {
          console.error('❌ WA PAID error:', err?.response?.data || err?.message || err);
        }
      }
    }

    // === 6. Kirim respons sukses ke Midtrans ===
    return res.status(200).json({ message: 'Notification processed successfully' });
  } catch (error) {
    console.error('[MIDTRANS WEBHOOK] Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}