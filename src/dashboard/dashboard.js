async function loadAttempts() {
  const res = await fetch("/attempt/all");
  const attempts = await res.json();

  const container = document.getElementById("attempts");
  container.innerHTML = "";

  attempts.forEach((attempt, index) => {
    const btn = document.createElement("button");
    btn.innerText = index + 1;
    btn.onclick = () => loadDetails(attempt.attemptId);
    container.appendChild(btn);
  });
}

async function loadDetails(attemptId) {
  const attemptRes = await fetch("/attempt/all");
  const attempts = await attemptRes.json();

  const attempt = attempts.find(a => a.attemptId === attemptId);

  const eventsRes = await fetch(`/events/${attemptId}`);
  const events = await eventsRes.json();

  const duration =
    new Date(attempt.endTime) - new Date(attempt.startTime);

  // ---- COUNT EVENTS DIRECTLY (REAL SOURCE) ----
  let copyCount = 0;
  let pasteCount = 0;
  let tabSwitchCount = 0;
  let ipChangeCount = 0;

  events.forEach(e => {
    if (e.eventType === "COPY_ATTEMPT") copyCount++;
    if (e.eventType === "PASTE_ATTEMPT") pasteCount++;
    if (e.eventType === "TAB_SWITCH") tabSwitchCount++;
    if (e.eventType === "IP_CHANGE_DETECTED") ipChangeCount++;
  });

  // ---- RISK SCORE ----
  const score =
    (copyCount * 1) +
    (pasteCount * 1) +
    (tabSwitchCount * 3) +
    (ipChangeCount * 5);

  let riskLevel = "LOW";
  let riskClass = "low";

  if (score > 5) {
    riskLevel = "HIGH";
    riskClass = "high";
  } else if (score > 0) {
    riskLevel = "MEDIUM";
    riskClass = "medium";
  }

  const summaryHtml = `
    <p><strong>Start Time:</strong> ${attempt.startTime}</p>
    <p><strong>End Time:</strong> ${attempt.endTime}</p>
    <p><strong>Duration:</strong> ${Math.floor(duration / 1000)} seconds</p>
    <hr/>
    <p><strong>Copy Attempts:</strong> ${copyCount}</p>
    <p><strong>Paste Attempts:</strong> ${pasteCount}</p>
    <p><strong>Tab Switches:</strong> ${tabSwitchCount}</p>
    <p><strong>IP Changes:</strong> ${ipChangeCount}</p>
    <hr/>
    <p>
      <strong>Risk Level:</strong> 
      <span class="risk-badge ${riskClass}">
        ${riskLevel}
      </span>
    </p>
  `;

  document.getElementById("summary").innerHTML = summaryHtml;

  const eventLines = events.map(
    e => `${e.timestamp}  →  ${e.eventType}`
  );

  document.getElementById("events").innerText =
    eventLines.join("\n");
}

loadAttempts();
