const { connectDB, getDbMode } = require("../../../config/database");

exports.getDbMode = (req, res) => {
  res.json({ mode: getDbMode() });
};

exports.switchDbMode = async (req, res) => {
  const { mode } = req.body;
  if (!["dev", "prod"].includes(mode)) {
    return res.status(400).json({ message: 'mode must be "dev" or "prod"' });
  }
  try {
    await connectDB(mode);
    res.json({ message: `Switched to ${mode.toUpperCase()} database`, mode });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
