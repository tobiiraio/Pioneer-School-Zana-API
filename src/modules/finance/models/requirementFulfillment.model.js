const mongoose = require("mongoose");

const fulfilledItemSchema = new mongoose.Schema({
  requirement: { type: mongoose.Schema.Types.ObjectId, ref: "Requirement", required: true },
  requiredQuantity: { type: Number, required: true, min: 0 },
  fulfilledQuantity: { type: Number, required: true, min: 0 },
  balance: {
    type: Number,
    default: function () { return this.requiredQuantity - this.fulfilledQuantity; },
  },
  notes: { type: String, default: "" },
});

fulfilledItemSchema.pre("save", function (next) {
  this.balance = this.requiredQuantity - this.fulfilledQuantity;
  next();
});

const requirementFulfillmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    requirementSet: { type: mongoose.Schema.Types.ObjectId, ref: "RequirementSet", required: true },
    SchoolClass: { type: mongoose.Schema.Types.ObjectId, ref: "SchoolClass" },
    AcademicTerm: { type: mongoose.Schema.Types.ObjectId, ref: "AcademicTerm" },
    fulfillmentDate: { type: Date, default: Date.now, required: true },
    fulfilledItems: [fulfilledItemSchema],
    receiptNumber: { type: String },
    status: {
      type: String,
      enum: ["Incomplete", "Partial", "Complete"],
      default: "Incomplete",
    },
    notes: { type: String },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
  },
  { timestamps: true }
);

requirementFulfillmentSchema.pre("save", function (next) {
  const total = this.fulfilledItems.length;
  let complete = 0, partial = 0;
  this.fulfilledItems.forEach((item) => {
    item.balance = item.requiredQuantity - item.fulfilledQuantity;
    if (item.fulfilledQuantity >= item.requiredQuantity) complete++;
    else if (item.fulfilledQuantity > 0) partial++;
  });
  if (complete === total) this.status = "Complete";
  else if (complete > 0 || partial > 0) this.status = "Partial";
  else this.status = "Incomplete";
  next();
});

requirementFulfillmentSchema.virtual("totalBalance").get(function () {
  return this.fulfilledItems.reduce((t, i) => t + i.balance, 0);
});
requirementFulfillmentSchema.set("toJSON", { virtuals: true });
requirementFulfillmentSchema.set("toObject", { virtuals: true });

requirementFulfillmentSchema.statics.createFromRequirementSet = async function (studentId, requirementSetId, staffId, fulfillmentDate = new Date()) {
  const RequirementSet = mongoose.model("RequirementSet");
  const requirementSet = await RequirementSet.findById(requirementSetId).populate("requirementItems.requirement");
  if (!requirementSet) throw new Error("Requirement set not found");
  const fulfilledItems = requirementSet.requirementItems.map((item) => ({
    requirement: item.requirement._id,
    requiredQuantity: item.quantity,
    fulfilledQuantity: 0,
    balance: item.quantity,
    notes: "",
  }));
  return this.create({ student: studentId, requirementSet: requirementSetId, SchoolClass: requirementSet.SchoolClass, AcademicTerm: requirementSet.AcademicTerm, fulfillmentDate, fulfilledItems, status: "Incomplete", recordedBy: staffId });
};

module.exports = mongoose.model("RequirementFulfillment", requirementFulfillmentSchema);
