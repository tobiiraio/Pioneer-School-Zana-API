// Public API for cross-module model imports — no router here to avoid circular deps
module.exports = {
  Metadata: require("./models/metadata.model"),
};
