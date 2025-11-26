import connectDB from '../../../lib/mongodb';
import Payment from '../../../models/Payment';
import Product from '../../../models/Product';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // ====== Data dasar untuk tabel checkout ======
    const payments = await Payment.find({})
      .sort({ createdAt: -1 })
      .limit(100);

    // ====== Ringkasan dasar ======
    const paidPayments = await Payment.find({ status: 'PAID' });
    const totalRevenue = paidPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const totalProducts = await Product.countDocuments();

    // ====== Omset Harian: 30 hari terakhir (zero-fill) ======
    const today = new Date();
    const startDay = new Date(today);
    startDay.setHours(0, 0, 0, 0);
    startDay.setDate(startDay.getDate() - 29); // 30 hari termasuk hari ini

    // Group by tanggal (pakai paidAt, fallback createdAt)
    const paidDaily = await Payment.aggregate([
      {
        $match: {
          status: 'PAID',
          $or: [
            { paidAt: { $gte: startDay } },
            { $and: [{ paidAt: { $exists: false } }, { createdAt: { $gte: startDay } }] }
          ]
        }
      },
      {
        $project: {
          amount: 1,
          day: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: { $ifNull: ['$paidAt', '$createdAt'] }
            }
          }
        }
      },
      { $group: { _id: '$day', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Zero-fill ke 30 hari
    const dailyMap = new Map(paidDaily.map(d => [d._id, d]));
    const dailyRevenue = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(startDay);
      d.setDate(startDay.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      dailyRevenue.push(dailyMap.get(key) || { _id: key, total: 0, count: 0 });
    }

    // ====== Omset Bulanan: 12 bulan terakhir (zero-fill) ======
    const startMonth = new Date(today.getFullYear(), today.getMonth() - 11, 1);

    const paidMonthly = await Payment.aggregate([
      {
        $match: {
          status: 'PAID',
          $or: [
            { paidAt: { $gte: startMonth } },
            { $and: [{ paidAt: { $exists: false } }, { createdAt: { $gte: startMonth } }] }
          ]
        }
      },
      {
        $project: {
          amount: 1,
          month: {
            $dateToString: {
              format: '%Y-%m',
              date: { $ifNull: ['$paidAt', '$createdAt'] }
            }
          }
        }
      },
      { $group: { _id: '$month', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const monthlyMap = new Map(paidMonthly.map(m => [m._id, m]));
    const monthlyRevenue = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyRevenue.push(monthlyMap.get(key) || { _id: key, total: 0, count: 0 });
    }

    // ====== Ringkasan status pesanan ======
    const statusSummary = await Payment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]);

    // ====== Response ======
    return res.status(200).json({
      success: true,
      data: {
        payments,
        analytics: {
          totalRevenue,
          totalOrders: paidPayments.length,
          totalProducts,
          dailyRevenue,   // [{ _id:'YYYY-MM-DD', total, count }, ... 30 item]
          monthlyRevenue, // [{ _id:'YYYY-MM', total, count }, ... 12 item]
          statusSummary
        }
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}
