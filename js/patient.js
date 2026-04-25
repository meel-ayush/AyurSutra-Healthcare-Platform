// patient dashboard logic

let patientSessions = JSON.parse(localStorage.getItem("pt_sessions") || "null") || [...PATIENT_SESSIONS];
let patientNotifs = [...NOTIFICATIONS.patient];
let currentPatientView = "overview";

function savePtSessions() {
  localStorage.setItem("pt_sessions", JSON.stringify(patientSessions));
}

// ── Overview ──────────────────────────────────────
function renderPatientOverview() {
  const completed = patientSessions.filter(s => s.status === "completed").length;
  const total = patientSessions.length;
  const upcoming = patientSessions.filter(s => s.status === "upcoming");
  const nextSession = upcoming[0];
  const pendingFeedback = patientSessions.filter(s => s.status === "completed" && !s.feedbackGiven);

  document.getElementById("ptContent").innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon green">✅</div>
        <div>
          <div class="stat-value">${completed}</div>
          <div class="stat-label">Sessions Done</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue">📅</div>
        <div>
          <div class="stat-value">${upcoming.length}</div>
          <div class="stat-label">Upcoming</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon gold">📋</div>
        <div>
          <div class="stat-value">${pendingFeedback.length}</div>
          <div class="stat-label">Feedback Pending</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">📈</div>
        <div>
          <div class="stat-value">${Math.round((completed/total)*100)}%</div>
          <div class="stat-label">Progress</div>
        </div>
      </div>
    </div>

    ${nextSession ? `
      <div class="card" style="border:2px solid var(--green-light);">
        <div class="card-header" style="background:var(--green-pale);">
          <span class="card-title" style="color:var(--green);">🔔 Next Session</span>
          <span class="badge badge-gold">Upcoming</span>
        </div>
        <div class="card-body">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; font-size:0.9rem;">
            <div>
              <div style="color:#718096; font-size:0.78rem; margin-bottom:0.2rem;">Therapy</div>
              <strong>${nextSession.therapy}</strong>
            </div>
            <div>
              <div style="color:#718096; font-size:0.78rem; margin-bottom:0.2rem;">Date</div>
              <strong>${nextSession.date}</strong>
            </div>
            <div>
              <div style="color:#718096; font-size:0.78rem; margin-bottom:0.2rem;">Practitioner</div>
              <strong>${nextSession.practitioner}</strong>
            </div>
          </div>
          <hr class="divider" />
          <div style="font-size:0.82rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--green); margin-bottom:0.4rem;">⚠️ Pre-Procedure Instructions</div>
          <p style="font-size:0.88rem; color:#4a5568; background:var(--green-pale); padding:0.75rem; border-radius:8px;">${PRE_INSTRUCTIONS[nextSession.therapy] || "Follow your practitioner's instructions."}</p>
        </div>
      </div>
    ` : ""}

    <div class="two-col">
      <div class="card">
        <div class="card-header">
          <span class="card-title">Treatment Progress</span>
        </div>
        <div class="card-body">
          <div style="text-align:center; margin-bottom:1.25rem;">
            <div style="font-size:2.5rem; font-weight:700; color:var(--green);">${Math.round((completed/total)*100)}%</div>
            <div style="font-size:0.85rem; color:#718096;">${completed} of ${total} sessions complete</div>
          </div>
          <div class="progress-wrap" style="height:12px;">
            <div class="progress-bar" style="width:${Math.round((completed/total)*100)}%; height:100%;"></div>
          </div>
          <div style="margin-top:1rem;">
            ${renderProgressMilestones(completed, total)}
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><span class="card-title">Wellness Trend</span></div>
        <div class="card-body">
          ${renderWellnessChart()}
        </div>
      </div>
    </div>

    ${pendingFeedback.length ? `
      <div class="card" style="border:1px solid #f6e05e;">
        <div class="card-header">
          <span class="card-title">⭐ Pending Feedback</span>
          <span style="font-size:0.82rem; color:#718096;">${pendingFeedback.length} session${pendingFeedback.length > 1 ? "s" : ""} awaiting feedback</span>
        </div>
        <div class="card-body">
          ${pendingFeedback.map(s => `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:0.6rem 0; border-bottom:1px solid var(--border);">
              <div>
                <strong style="font-size:0.88rem;">${s.therapy}</strong>
                <div style="font-size:0.78rem; color:#718096;">${s.date}</div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="openFeedback('${s.id}')">Give Feedback</button>
            </div>
          `).join("")}
        </div>
      </div>
    ` : ""}
  `;
}

function renderProgressMilestones(done, total) {
  const milestones = [
    { at: Math.floor(total * 0.25), label: "25% — Body warming up" },
    { at: Math.floor(total * 0.5), label: "50% — Halfway mark" },
    { at: Math.floor(total * 0.75), label: "75% — Deep cleanse phase" },
    { at: total, label: "100% — Full recovery" }
  ];
  return milestones.map(m => {
    const reached = done >= m.at;
    return `
      <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.5rem; font-size:0.82rem; color:${reached ? "var(--green)" : "#a0aec0"};">
        <span>${reached ? "✅" : "⚪"}</span>
        <span>${m.label}</span>
      </div>
    `;
  }).join("");
}

function renderWellnessChart() {
  const sessionsWithData = patientSessions.filter(s => s.feedbackGiven && s.energyLevel !== null);
  if (sessionsWithData.length < 2) {
    return `<p style="color:#718096; font-size:0.85rem; text-align:center; padding:1rem 0;">Submit feedback after sessions to see your trend.</p>`;
  }
  const max = 5;
  return `
    <div class="bar-chart-wrap">
      ${sessionsWithData.map((s, i) => `
        <div class="bar-group">
          <div class="bar-fill primary" style="height:${Math.round((s.energyLevel/max)*110)}px;" title="Energy: ${s.energyLevel}/5"></div>
          <span class="bar-x-label">S${i+1}</span>
        </div>
      `).join("")}
    </div>
    <p style="font-size:0.75rem; color:#718096; margin-top:1.75rem; text-align:center;">Energy levels across sessions (1–5)</p>
  `;
}

// ── Sessions view ─────────────────────────────────
function renderPatientSessions() {
  document.getElementById("ptContent").innerHTML = `
    <div class="section-header">
      <span class="section-title">My Sessions</span>
    </div>

    <div class="card">
      <div class="card-body" style="padding:0;">
        <table class="table">
          <thead>
            <tr><th>Date</th><th>Therapy</th><th>Practitioner</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            ${patientSessions.map(s => `
              <tr>
                <td>${s.date}</td>
                <td>${s.therapy}</td>
                <td>${s.practitioner}</td>
                <td><span class="badge ${s.status === "completed" ? "badge-green" : "badge-gold"}">${s.status === "completed" ? "Completed" : "Upcoming"}</span></td>
                <td>
                  ${s.status === "completed" && !s.feedbackGiven
                    ? `<button class="btn btn-primary btn-sm" onclick="openFeedback('${s.id}')">Feedback</button>`
                    : s.feedbackGiven ? `<span style="color:var(--green); font-size:0.82rem;">✓ Done</span>` : ""}
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><span class="card-title">Upcoming Session — Instructions</span></div>
      <div class="card-body">
        ${renderUpcomingInstructions()}
      </div>
    </div>
  `;
}

function renderUpcomingInstructions() {
  const upcoming = patientSessions.find(s => s.status === "upcoming");
  if (!upcoming) return `<p style="color:#718096; font-size:0.88rem;">No upcoming sessions scheduled.</p>`;

  return `
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
      <div>
        <div style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--green); margin-bottom:0.5rem;">Pre-Procedure</div>
        <p style="font-size:0.87rem; background:var(--green-pale); padding:0.8rem; border-radius:8px; color:#2d3748;">${PRE_INSTRUCTIONS[upcoming.therapy]}</p>
      </div>
      <div>
        <div style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:#b7791f; margin-bottom:0.5rem;">Post-Procedure</div>
        <p style="font-size:0.87rem; background:#fef3c7; padding:0.8rem; border-radius:8px; color:#2d3748;">${POST_INSTRUCTIONS[upcoming.therapy]}</p>
      </div>
    </div>
  `;
}

// ── Feedback modal ────────────────────────────────
function openFeedback(sessionId) {
  const session = patientSessions.find(s => s.id === sessionId);
  if (!session) return;

  const modal = document.getElementById("feedbackModal");
  modal.querySelector("#fbSessionId").value = sessionId;
  modal.querySelector("#fbTherapy").textContent = session.therapy;
  modal.querySelector("#fbDate").textContent = session.date;

  // reset ratings
  modal.querySelectorAll(".star-group").forEach(g => {
    g.querySelectorAll(".star").forEach(s => s.classList.remove("selected"));
  });
  modal.querySelector("#fbNotes").value = "";
  modal.classList.add("open");
}

function closeFeedbackModal() {
  document.getElementById("feedbackModal").classList.remove("open");
}

function submitFeedback() {
  const modal = document.getElementById("feedbackModal");
  const sessionId = modal.querySelector("#fbSessionId").value;

  const getRating = (name) => {
    const selected = modal.querySelector(`.star-group[data-name="${name}"] .star.selected`);
    return selected ? parseInt(selected.dataset.val) : 0;
  };

  const pain = getRating("pain");
  const energy = getRating("energy");
  const overall = getRating("overall");
  const notes = modal.querySelector("#fbNotes").value.trim();

  if (!overall) { toast("Please rate your overall experience", "error"); return; }

  const session = patientSessions.find(s => s.id === sessionId);
  if (session) {
    session.feedbackGiven = true;
    session.painLevel = pain;
    session.energyLevel = energy;
    savePtSessions();
  }

  // save feedback for practitioner view too
  const feedbacks = JSON.parse(localStorage.getItem("patient_feedbacks") || "[]");
  feedbacks.push({
    sessionId, therapy: session?.therapy, date: session?.date,
    pain, energy, overall, notes
  });
  localStorage.setItem("patient_feedbacks", JSON.stringify(feedbacks));

  closeFeedbackModal();
  toast("Feedback submitted! Thank you 🙏", "success");
  renderPatientOverview();
}

// star rating interaction
function initStarRatings(modal) {
  modal.querySelectorAll(".star-group").forEach(group => {
    group.querySelectorAll(".star").forEach(star => {
      star.addEventListener("click", () => {
        const val = parseInt(star.dataset.val);
        group.querySelectorAll(".star").forEach((s, i) => {
          s.classList.toggle("selected", i < val);
        });
      });
    });
  });
}

// ── Nav ───────────────────────────────────────────
function setPatientView(view) {
  currentPatientView = view;
  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  document.querySelector(`[data-view="${view}"]`)?.classList.add("active");

  const titles = { overview: "My Dashboard", sessions: "My Sessions", notifications: "Notifications" };
  document.getElementById("ptTopbarTitle").textContent = titles[view] || view;

  if (view === "overview") renderPatientOverview();
  else if (view === "sessions") renderPatientSessions();
  else if (view === "notifications") renderNotifications();
}

function renderNotifications() {
  document.getElementById("ptContent").innerHTML = `
    <div class="card">
      <div class="card-header">
        <span class="card-title">Notifications</span>
        <button class="btn btn-sm btn-outline" onclick="markAllRead()">Mark all read</button>
      </div>
      <div class="card-body" style="padding:0.75rem;">
        ${patientNotifs.map(n => `
          <div class="notif-item ${n.unread ? "unread" : ""}" style="margin-bottom:0.5rem;">
            <div class="notif-dot"></div>
            <div>
              <div class="notif-text">${n.text}</div>
              <div class="notif-time">${n.time}</div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function markAllRead() {
  patientNotifs.forEach(n => n.unread = false);
  document.getElementById("ptNotifBadge").style.display = "none";
  renderNotifications();
}
