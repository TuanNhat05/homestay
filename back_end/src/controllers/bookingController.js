const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Customer = require('../models/Customer');
const { bookingStatuses } = require('../models/Booking');

const populateBooking = (query) => {
  return query
    .populate('customer')
    .populate('room')
    .populate('assignedStaff', 'name email role')
    .populate('notes.user', 'name email role')
    .populate('logs.user', 'name email role');
};

const getBookings = async (req, res) => {
  const filter = {};

  if (req.query.room) {
    filter.room = req.query.room;
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const bookings = await populateBooking(Booking.find(filter).sort({ startTime: 1 }));
  res.json(bookings);
};

const createBooking = async (req, res) => {
  try {
    const {
      customer: customerId,
      room: roomId,
      startTime,
      endTime,
      depositAmount = 0,
      status = 'new',
      note,
    } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Phòng không tồn tại' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Khách hàng không tồn tại' });
    }

    const newStartTime = new Date(startTime);
    const newEndTime = new Date(endTime);

    if (Number.isNaN(newStartTime.getTime()) || Number.isNaN(newEndTime.getTime())) {
      return res.status(400).json({ message: 'Thời gian không hợp lệ' });
    }

    if (newEndTime <= newStartTime) {
      return res.status(400).json({ message: 'endTime phải lớn hơn startTime' });
    }

    const durationHours = (newEndTime - newStartTime) / (1000 * 60 * 60);
    if (durationHours < 1) {
      return res.status(400).json({ message: 'Thời gian thuê tối thiểu 1 tiếng' });
    }

    // Trùng lịch khi: newStart < oldEnd AND newEnd > oldStart.
    const overlapBooking = await Booking.findOne({
      room: roomId,
      status: { $ne: 'cancelled' },
      startTime: { $lt: newEndTime },
      endTime: { $gt: newStartTime },
    });

    if (overlapBooking) {
      return res.status(409).json({ message: 'Phòng bị trùng lịch trong khung giờ này' });
    }

    const pricePerHour = room.pricePerHour;
    const totalPrice = durationHours * pricePerHour;
    const notes = [];

    if (note) {
      notes.push({
        user: req.user._id,
        note,
      });
    }

    const booking = await Booking.create({
      customer: customerId,
      room: roomId,
      assignedStaff: req.user._id,
      startTime: newStartTime,
      endTime: newEndTime,
      durationHours,
      pricePerHour,
      totalPrice,
      depositAmount,
      status,
      notes,
      logs: [
        {
          user: req.user._id,
          action: 'create_booking',
          oldValue: '',
          newValue: status,
        },
      ],
    });

    const populated = await populateBooking(Booking.findById(booking._id));
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: 'Không thể tạo booking', error: error.message });
  }
};

const getBookingById = async (req, res) => {
  const booking = await populateBooking(Booking.findById(req.params.id));
  if (!booking) {
    return res.status(404).json({ message: 'Không tìm thấy booking' });
  }

  res.json(booking);
};

const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy booking' });
    }

    const editableFields = ['depositAmount'];
    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        booking[field] = req.body[field];
      }
    });

    await booking.save();
    const populated = await populateBooking(Booking.findById(booking._id));
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: 'Không thể cập nhật booking', error: error.message });
  }
};

const deleteBooking = async (req, res) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: 'Không tìm thấy booking' });
  }

  res.json({ message: 'Đã xóa booking' });
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!bookingStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái booking không hợp lệ' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy booking' });
    }

    const oldStatus = booking.status;
    booking.status = status;
    booking.logs.push({
      user: req.user._id,
      action: 'update_status',
      oldValue: oldStatus,
      newValue: status,
    });

    await booking.save();
    const populated = await populateBooking(Booking.findById(booking._id));
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: 'Không thể cập nhật trạng thái', error: error.message });
  }
};

const addBookingNote = async (req, res) => {
  try {
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({ message: 'Nội dung ghi chú không được để trống' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy booking' });
    }

    booking.notes.push({
      user: req.user._id,
      note,
    });

    await booking.save();
    const populated = await populateBooking(Booking.findById(booking._id));
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: 'Không thể thêm ghi chú', error: error.message });
  }
};

module.exports = {
  getBookings,
  createBooking,
  getBookingById,
  updateBooking,
  deleteBooking,
  updateBookingStatus,
  addBookingNote,
};
