require('dotenv').config();

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../src/models/User');

const run = async () => {
  const name = process.env.ADMIN_NAME || 'Admin';
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || '123456';
  const mongoUrl = process.env.MONGO_URI || process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error('Missing MONGO_URI or MONGO_URL in environment variables');
  }

  await mongoose.connect(mongoUrl);

  const existingAdmin = await User.findOne({ email });
  if (existingAdmin) {
    console.log(`Admin already exists: ${email}`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    passwordHash,
    role: 'admin',
  });

  console.log(`Admin created: ${email}`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
