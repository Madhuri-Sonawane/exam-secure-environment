async function loadAttempts() {
  const res = await fetch("/attempt/all");
  const attempts = await res.json();

  const container = document.getElementById("attempts");
  container.innerHTML = "";

  Object.keys(attempts).forEach((id) => {
    const btn = document.createElement("button");
    btn.innerText = id;
    btn.onclick = () => loadDetails(id);
    container.appendChild(btn);
  });
}

async function loadDetails(attemptId) {
  const attemptRes = await fetch("/attempt/all");
  const attempts = await attemptRes.json();
  const attempt = attempts[attemptId];

  const eventsRes = await fetch(`/events/${attemptId}`);
  const events = await eventsRes.json();

  const duration =
    new Date(attempt.endTime) - new Date(attempt.startTime);

  // ----- RISK CALCULATION -----
  const score =
    (attempt.copyCount * 1) +
    (attempt.pasteCount * 1) +
    (attempt.tabSwitchCount * 3) +
    (attempt.ipChanges * 5);

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
    <p><strong>Copy Attempts:</strong> ${attempt.copyCount}</p>
    <p><strong>Paste Attempts:</strong> ${attempt.pasteCount}</p>
    <p><strong>Tab Switches:</strong> ${attempt.tabSwitchCount}</p>
    <p><strong>IP Changes:</strong> ${attempt.ipChanges}</p>
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
