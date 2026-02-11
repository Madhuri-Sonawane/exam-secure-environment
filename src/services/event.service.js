const Event = require("../models/Event");

async function logEvent(event) {
  try {
    if (!event || !event.eventType || !event.attemptId) {
      console.warn("Invalid event skipped:", event);
      return;
    }

    await Event.create({
      eventType: event.eventType,
      attemptId: event.attemptId,
      timestamp: event.timestamp || new Date().toISOString(),
      questionId: event.questionId || null,
      metadata: event.metadata || {}
    });

  } catch (err) {
    console.error("Event insert failed:", err);
  }
}

module.exports = { logEvent };
