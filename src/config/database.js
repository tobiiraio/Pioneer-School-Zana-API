const mongoose = require("mongoose");
require("dotenv").config();

// In-memory state: "dev" or "prod"
let currentMode = process.env.DB_MODE || "dev";

const getUri = (mode) => {
  if (mode === "prod") return process.env.MONGO_URI_PROD;
  return process.env.MONGO_URI_DEV || process.env.MONGO_URI;
};

const connectDB = async (mode = currentMode) => {
  const uri = getUri(mode);
  if (!uri) throw new Error(`No MongoDB URI configured for mode: ${mode}`);

  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(uri);
    currentMode = mode;
    console.log(`✅ MongoDB Connected [${mode.toUpperCase()}]`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

const getDbMode = () => currentMode;

module.exports = connectDB;
module.exports.getDbMode = getDbMode;
module.exports.connectDB = connectDB;
