const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://faizanasif102005_db_user:CyxGyCsey2As0UMV@cluster0.ashfnuj.mongodb.net/?appName=Cluster0");

    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;