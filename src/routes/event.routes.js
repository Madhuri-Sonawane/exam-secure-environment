const express = require("express");
const { logEvent } = require("../services/event.service");
const Event = require("../models/Event");
const Attempt = require("../models/Attempt");

const router = express.Router();

/**
 * Log events (Batch)
 */
router.post("/log", async (req, res) => {
  try {
    const incomingEvents = req.body;

    if (!Array.isArray(incomingEvents)) {
      return res.status(400).json({ message: "Invalid event format" });
    }

    for (const event of incomingEvents) {
      const attempt = await Attempt.findOne({ attemptId: event.attemptId });

      if (!attempt || attempt.endTime) {
        return res.status(403).json({
          message: "Attempt already ended. Logs are immutable."
        });
      }

      await logEvent(event);
    }

    res.json({ status: "events logged" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Event logging failed" });
  }
});


/**
 * Get events for one attempt
 */
router.get("/:attemptId", async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attemptEvents = await Event.find({ attemptId }).sort({ timestamp: 1 });

    res.json(attemptEvents);

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
});


/**
 * Summary (Counts)
 */
router.get("/summary/:attemptId", async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attemptEvents = await Event.find({ attemptId });

    const summary = {
      copyCount: 0,
      pasteCount: 0,
      tabSwitchCount: 0,
      ipChangeCount: 0
    };

    attemptEvents.forEach((e) => {
      if (e.eventType === "COPY_ATTEMPT") summary.copyCount++;
      if (e.eventType === "PASTE_ATTEMPT") summary.pasteCount++;
      if (e.eventType === "TAB_SWITCH") summary.tabSwitchCount++;
      if (e.eventType === "IP_CHANGE_DETECTED") summary.ipChangeCount++;
    });

    res.json(summary);

  } catch (err) {
    res.status(500).json({ message: "Summary failed" });
  }
});

module.exports = router;
