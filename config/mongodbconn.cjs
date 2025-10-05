const mongoose = require("mongoose");

const uri = process.env.MONGO_URI || "mongodb+srv://PeterHD0315:MozambiqueHere7!@cluster0.h7s1fix.mongodb.net/yogidb";

mongoose.connect(uri)
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => {
  console.error("❌ MongoDB connection error:", err.message);
});

module.exports =  mongoose;