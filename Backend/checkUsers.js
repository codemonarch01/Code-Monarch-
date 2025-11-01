const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const users = await User.find({}).sort({createdAt: -1}).limit(10);
    
    console.log('\n📊 Recent Users in Database:');
    console.log('================================');
    
    if (users.length === 0) {
      console.log('No users found in database');
    } else {
      users.forEach((user, i) => {
        console.log(`${i+1}. Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Grade: ${user.grade}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Created: ${user.createdAt.toISOString().split('T')[0]}`);
        console.log('   ---');
      });
    }
    
    console.log(`\nTotal users: ${users.length}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
