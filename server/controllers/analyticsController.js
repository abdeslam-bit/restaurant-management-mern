const Order = require('../models/Order');
const Reservation = require('../models/Reservation');
const MenuItem = require('../models/MenuItem');

// @desc    Get analytics overview
// @route   GET /api/analytics/overview
// @access  Private/Admin
const getOverview = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's orders
    const todayOrders = await Order.find({ createdAt: { $gte: today, $lt: tomorrow } });
    const dailySales = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const dailyOrderCount = todayOrders.length;

    // Total orders
    const totalOrders = await Order.countDocuments();

    // Active orders (not completed/cancelled)
    const activeOrders = await Order.countDocuments({
      status: { $nin: ['Completed', 'Cancelled'] },
    });

    // Pending reservations
    const pendingReservations = await Reservation.countDocuments({ status: 'Pending' });

    // Total revenue (all time)
    const revenueResult = await Order.aggregate([
      { $match: { status: { $nin: ['Cancelled'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Top selling items
    const topItems = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItem',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    // Sales by day for last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      return d;
    }).reverse();

    const salesByDay = await Promise.all(
      last7Days.map(async (dayStart) => {
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        const orders = await Order.find({
          createdAt: { $gte: dayStart, $lt: dayEnd },
          status: { $ne: 'Cancelled' },
        });
        const sales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        return {
          date: dayStart.toISOString().split('T')[0],
          sales,
          orders: orders.length,
        };
      })
    );

    // Order status breakdown
    const statusBreakdown = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        dailySales,
        dailyOrderCount,
        totalOrders,
        activeOrders,
        pendingReservations,
        totalRevenue,
        topItems,
        salesByDay,
        statusBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOverview };
