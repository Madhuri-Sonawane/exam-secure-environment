const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  eventType: { type: String, required: true },
  attemptId: { type: String, required: true },
  timestamp: { type: String, required: true },
  questionId: { type: String, default: null },
  metadata: { type: Object }
});

module.exports = mongoose.model("Event", EventSchema);
