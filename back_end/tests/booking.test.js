const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcrypt');
const app = require('../src/app');
const User = require('../src/models/User');
const Room = require('../src/models/Room');
const Customer = require('../src/models/Customer');

let mongoServer;
let token;
let room;
let customer;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_secret';
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();

  const passwordHash = await bcrypt.hash('123456', 10);
  const staff = await User.create({
    name: 'Staff A',
    email: 'staff@example.com',
    passwordHash,
    role: 'staff',
  });

  room = await Room.create({
    roomName: 'Room 101',
    roomType: 'Standard',
    capacity: 2,
    pricePerHour: 100000,
  });

  customer = await Customer.create({
    name: 'Nguyen Van A',
    phone: '0900000000',
  });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: staff.email, password: '123456' });

  token = loginRes.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test('rejects booking shorter than 3 hours', async () => {
  const res = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${token}`)
    .send({
      customer: customer._id.toString(),
      room: room._id.toString(),
      startTime: '2026-07-01T08:00:00.000Z',
      endTime: '2026-07-01T10:00:00.000Z',
    });

  expect(res.status).toBe(400);
  expect(res.body.message).toMatch(/tối thiểu 3 tiếng/i);
});

test('rejects overlapping booking for the same room', async () => {
  await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${token}`)
    .send({
      customer: customer._id.toString(),
      room: room._id.toString(),
      startTime: '2026-07-01T08:00:00.000Z',
      endTime: '2026-07-01T12:00:00.000Z',
    });

  const res = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${token}`)
    .send({
      customer: customer._id.toString(),
      room: room._id.toString(),
      startTime: '2026-07-01T11:00:00.000Z',
      endTime: '2026-07-01T14:00:00.000Z',
    });

  expect(res.status).toBe(409);
  expect(res.body.message).toMatch(/trùng lịch/i);
});
