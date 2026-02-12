const mongoose = require("mongoose");

const AttemptSchema = new mongoose.Schema({
  attemptId: { type: String, required: true, unique: true },
  initialIp: String,
  isp: String,
  region: String,
  userAgent: String,
  sessionId: String,
  ipChanges: { type: Number, default: 0 },
  startTime: String,
  endTime: String,

  firstName: { type: String },
  surname: { type: String },
  email: { type: String },

  initialIp: String,
  isp: String,
  region: String,
  userAgent: String,
  sessionId: String,

  ipChanges: Number,
  startTime: String,
  endTime: String
});



module.exports = mongoose.model("Attempt", AttemptSchema);
