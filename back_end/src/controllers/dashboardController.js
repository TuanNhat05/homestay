const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Customer = require('../models/Customer');
const User = require('../models/User');

const getSummary = async (req, res) => {
  const [
    totalRooms,
    totalCustomers,
    totalUsers,
    totalBookings,
    activeBookings,
    completedBookings,
    cancelledBookings,
    revenueResult,
  ] = await Promise.all([
    Room.countDocuments(),
    Customer.countDocuments(),
    User.countDocuments({ isActive: true }),
    Booking.countDocuments(),
    Booking.countDocuments({ status: { $in: ['new', 'consulting', 'waiting_deposit', 'deposited', 'confirmed', 'using'] } }),
    Booking.countDocuments({ status: 'completed' }),
    Booking.countDocuments({ status: 'cancelled' }),
    Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' }, totalDeposit: { $sum: '$depositAmount' } } },
    ]),
  ]);

  res.json({
    totalRooms,
    totalCustomers,
    totalUsers,
    totalBookings,
    activeBookings,
    completedBookings,
    cancelledBookings,
    totalRevenue: revenueResult[0]?.totalRevenue || 0,
    totalDeposit: revenueResult[0]?.totalDeposit || 0,
  });
};

module.exports = {
  getSummary,
};
