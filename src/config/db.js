const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/secure_test_env");

    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
