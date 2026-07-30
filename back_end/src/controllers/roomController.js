const path = require('path');
const fs = require('fs');
const Room = require('../models/Room');

const getRooms = async (req, res) => {
  const rooms = await Room.find().sort({ createdAt: -1 });
  res.json(rooms);
};

const createRoom = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.file) {
      data.image = `/uploads/rooms/${req.file.filename}`;
    }

    const room = await Room.create(data);
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ message: 'Không thể tạo phòng', error: error.message });
  }
};

const getRoomById = async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) {
    return res.status(404).json({ message: 'Không tìm thấy phòng' });
  }

  res.json(room);
};

const updateRoom = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.file) {
      data.image = `/uploads/rooms/${req.file.filename}`;

      // Delete old image if exists
      const oldRoom = await Room.findById(req.params.id);
      if (oldRoom?.image) {
        const oldPath = path.join(__dirname, '../../', oldRoom.image);
        fs.unlink(oldPath, () => {});
      }
    }

    const room = await Room.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }

    res.json(room);
  } catch (error) {
    res.status(400).json({ message: 'Không thể cập nhật phòng', error: error.message });
  }
};

const deleteRoom = async (req, res) => {
  const room = await Room.findByIdAndDelete(req.params.id);
  if (!room) {
    return res.status(404).json({ message: 'Không tìm thấy phòng' });
  }

  // Clean up image file
  if (room.image) {
    const imgPath = path.join(__dirname, '../../', room.image);
    fs.unlink(imgPath, () => {});
  }

  res.json({ message: 'Đã xóa phòng' });
};

module.exports = {
  getRooms,
  createRoom,
  getRoomById,
  updateRoom,
  deleteRoom,
};
