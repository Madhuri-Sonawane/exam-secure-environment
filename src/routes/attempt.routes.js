const express = require("express");
const { v4: uuid } = require("uuid");
const fetch = require("node-fetch");

const { getClientIp } = require("../services/ip.service");
const { logEvent } = require("../services/event.service");

const Attempt = require("../models/Attempt");
const Event = require("../models/Event");

const router = express.Router();

/**
 * START EXAM
 */
router.post("/start", async (req, res) => {
  try {
    const { firstName, surname, email } = req.body;

    const attemptId = uuid();
    const ip = getClientIp(req);
    const now = new Date().toISOString();

    const userAgent = req.headers["user-agent"] || "UNKNOWN";
    const sessionId = req.headers["x-session-id"] || uuid();

    let isp = "UNKNOWN";
    let region = "UNKNOWN";

    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();
      isp = data.org || "UNKNOWN";
      region = data.region || "UNKNOWN";
    } catch (e) {
      console.warn("ISP lookup failed:", e.message);
    }

    await Attempt.create({
      attemptId,
      firstName,
      surname,
      email,
      initialIp: ip,
      isp,
      region,
      userAgent,
      sessionId,
      ipChanges: 0,
      startTime: now,
      endTime: null
    });

    await logEvent({
      eventType: "IP_CAPTURED_INITIAL",
      attemptId,
      timestamp: now,
      questionId: null,
      metadata: {
        ip,
        isp,
        region,
        macAddress: "NOT_AVAILABLE",
        userAgent,
        sessionId
      }
    });

    res.json({ attemptId });

  } catch (err) {
    console.error("START ERROR:", err);
    res.status(500).json({ message: "Failed to start exam" });
  }
});


/**
 * CHECK IP
 */
router.post("/check-ip", async (req, res) => {
  try {
    const { attemptId } = req.body;

    const attempt = await Attempt.findOne({ attemptId });
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    if (attempt.endTime) {
      return res.status(403).json({
        message: "Attempt ended. Monitoring stopped."
      });
    }

    const currentIp = getClientIp(req);
    const now = new Date().toISOString();

    await logEvent({
      eventType: "IP_CHECK_PERFORMED",
      attemptId,
      timestamp: now,
      questionId: null,
      metadata: { currentIp }
    });

    if (currentIp === attempt.initialIp) {
      return res.json({ ipChanged: false });
    }

    let newIsp = "UNKNOWN";
    let newRegion = "UNKNOWN";

    try {
      const response = await fetch(`https://ipapi.co/${currentIp}/json/`);
      const data = await response.json();
      newIsp = data.org || "UNKNOWN";
      newRegion = data.region || "UNKNOWN";
    } catch (e) {
      console.warn("ISP lookup failed:", e.message);
    }

    attempt.ipChanges += 1;

    let classification = "UNKNOWN";

    if (newIsp === attempt.isp && newRegion === attempt.region) {
      classification = "SAME_ISP_SAME_REGION";
    } else if (newIsp === attempt.isp && newRegion !== attempt.region) {
      classification = "SAME_ISP_DIFFERENT_REGION";
    } else {
      classification = "DIFFERENT_ISP";
    }

    await logEvent({
      eventType: "IP_CHANGE_DETECTED",
      attemptId,
      timestamp: now,
      questionId: null,
      metadata: {
        oldIp: attempt.initialIp,
        newIp: currentIp
      }
    });

    await logEvent({
      eventType: "IP_CHANGE_CLASSIFIED",
      attemptId,
      timestamp: now,
      questionId: null,
      metadata: {
        oldIsp: attempt.isp,
        newIsp,
        oldRegion: attempt.region,
        newRegion,
        classification
      }
    });

    attempt.initialIp = currentIp;
    attempt.isp = newIsp;
    attempt.region = newRegion;

    await attempt.save();

    res.json({ ipChanged: true });

  } catch (err) {
    console.error("IP CHECK ERROR:", err);
    res.status(500).json({ message: "IP check failed" });
  }
});


/**
 * END EXAM
 */
router.post("/end", async (req, res) => {
  try {
    const { attemptId } = req.body;

    const attempt = await Attempt.findOne({ attemptId });
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    attempt.endTime = new Date().toISOString();
    await attempt.save();

    await logEvent({
      eventType: "EXAM_ENDED",
      attemptId,
      timestamp: new Date().toISOString(),
      questionId: null,
      metadata: {}
    });

    res.json({ message: "Exam ended successfully" });

  } catch (err) {
    console.error("END ERROR:", err);
    res.status(500).json({ message: "Failed to end exam" });
  }
});


/**
 * VIEW ALL ATTEMPTS (WITH COUNTS)
 */
router.get("/all", async (req, res) => {
  try {
    const attempts = await Attempt.find();
    const result = [];

    for (const attempt of attempts) {

      const events = await Event.find({
        attemptId: attempt.attemptId
      });

      let copyCount = 0;
      let pasteCount = 0;
      let tabSwitchCount = 0;

      events.forEach((e) => {
        if (e.eventType === "COPY_ATTEMPT") copyCount++;
        if (e.eventType === "PASTE_ATTEMPT") pasteCount++;
        if (e.eventType === "TAB_SWITCH") tabSwitchCount++;
      });

      result.push({
        ...attempt.toObject(),
        copyCount,
        pasteCount,
        tabSwitchCount
      });
    }

    res.json(result);

  } catch (err) {
    console.error("FETCH ATTEMPTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch attempts" });
  }
});

module.exports = router;
