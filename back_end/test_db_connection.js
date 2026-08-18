const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL;

console.log('=== Kiểm tra kết nối Database ===');
console.log('MongoDB URL:', MONGO_URL ? MONGO_URL.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@') : 'KHÔNG TÌM THẤY');
console.log('Đang kết nối...\n');

mongoose.connect(MONGO_URL, {
  serverSelectionTimeoutMS: 10000, // timeout 10 giây
})
  .then(() => {
    console.log('✅ KẾT NỐI THÀNH CÔNG!');
    console.log('   Database:', mongoose.connection.db.databaseName);
    console.log('   Host:', mongoose.connection.host);
    console.log('   Port:', mongoose.connection.port);
    console.log('   State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected');
    
    // Liệt kê các collections
    return mongoose.connection.db.listCollections().toArray();
  })
  .then((collections) => {
    console.log('\n📁 Các collections trong database:');
    if (collections.length === 0) {
      console.log('   (Không có collection nào)');
    } else {
      collections.forEach((col) => {
        console.log(`   - ${col.name}`);
      });
    }
    console.log(`\n   Tổng: ${collections.length} collection(s)`);
  })
  .catch((err) => {
    console.log('❌ KẾT NỐI THẤT BẠI!');
    console.log('   Lỗi:', err.message);
    if (err.message.includes('authentication')) {
      console.log('   → Sai username hoặc password');
    } else if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
      console.log('   → Không tìm thấy server (kiểm tra hostname)');
    } else if (err.message.includes('timed out')) {
      console.log('   → Hết thời gian chờ (kiểm tra firewall/IP whitelist)');
    }
  })
  .finally(() => {
    mongoose.disconnect();
    process.exit(0);
  });
