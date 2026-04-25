// practitioner dashboard logic

let sessions = JSON.parse(localStorage.getItem("prac_sessions") || "null") || [...SEED_SESSIONS];
let patients = JSON.parse(localStorage.getItem("prac_patients") || "null") || [...SEED_PATIENTS];
let currentView = "overview";

function saveSessions() {
  localStorage.setItem("prac_sessions", JSON.stringify(sessions));
}

function savePatients() {
  localStorage.setItem("prac_patients", JSON.stringify(patients));
}

function getStatusBadge(status) {
  const map = {
    completed: "badge-green",
    "in-progress": "badge-blue",
    upcoming: "badge-gold",
    scheduled: "badge-gray",
    active: "badge-blue",
    cancelled: "badge-red"
  };
  const labels = {
    "in-progress": "In Progress"
  };
  return `<span class="badge ${map[status] || "badge-gray"}">${labels[status] || capitalise(status)}</span>`;
}

function capitalise(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Render overview ──────────────────────────────
function renderOverview() {
  const active = patients.filter(p => p.status === "active").length;
  const todaySessions = sessions.length;
  const done = sessions.filter(s => s.status === "completed").length;
  const pending = sessions.filter(s => s.status === "upcoming").length;

  document.getElementById("mainContent").innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon green">👥</div>
        <div>
          <div class="stat-value">${patients.length}</div>
          <div class="stat-label">Total Patients</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue">📅</div>
        <div>
          <div class="stat-value">${todaySessions}</div>
          <div class="stat-label">Sessions Today</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon gold">⏳</div>
        <div>
          <div class="stat-value">${pending}</div>
          <div class="stat-label">Pending Today</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">✅</div>
        <div>
          <div class="stat-value">${done}</div>
          <div class="stat-label">Completed Today</div>
        </div>
      </div>
    </div>

    <div class="two-col">
      <div class="card">
        <div class="card-header">
          <span class="card-title">Today's Schedule</span>
          <button class="btn btn-primary btn-sm" onclick="openAddSession()">+ Add Session</button>
        </div>
        <div class="card-body" style="padding:0;">
          ${renderTodayScheduleTable()}
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">Patient Progress</span>
        </div>
        <div class="card-body">
          ${renderPatientProgressList()}
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">Weekly Session Volume</span>
      </div>
      <div class="card-body">
        ${renderWeeklyChart()}
      </div>
    </div>
  `;
}

function renderTodayScheduleTable() {
  if (!sessions.length) return `<div class="empty-state"><div class="icon">📅</div><p>No sessions scheduled today</p></div>`;
  return `
    <table class="table">
      <thead>
        <tr>
          <th>Time</th>
          <th>Patient</th>
          <th>Therapy</th>
          <th>Room</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${sessions.map(s => `
          <tr>
            <td><strong>${s.time}</strong></td>
            <td>${s.patientName}</td>
            <td style="font-size:0.82rem; color:#718096;">${s.therapy}</td>
            <td>${s.room}</td>
            <td>${getStatusBadge(s.status)}</td>
            <td>
              ${s.status === "upcoming" || s.status === "in-progress" ? `
                <button class="btn btn-sm btn-success" onclick="markComplete('${s.id}')">Mark Done</button>
              ` : ""}
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function renderPatientProgressList() {
  return patients.slice(0, 5).map(p => `
    <div style="margin-bottom:1.1rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
        <span style="font-size:0.88rem; font-weight:600;">${p.name}</span>
        <span style="font-size:0.78rem; color:#718096;">${p.completed}/${p.sessions} sessions</span>
      </div>
      <div class="progress-wrap">
        <div class="progress-bar" style="width:${Math.round((p.completed/p.sessions)*100)}%"></div>
      </div>
      <div style="font-size:0.75rem; color:#718096; margin-top:0.2rem;">${p.therapyPlan}</div>
    </div>
  `).join("");
}

function renderWeeklyChart() {
  // static demo data for the week
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const counts = [4, 6, 5, 7, 5, 3, 2];
  const max = Math.max(...counts);
  const today = new Date().getDay();
  // sunday = 0, so adjust
  const todayIdx = today === 0 ? 6 : today - 1;

  return `
    <div class="bar-chart-wrap">
      ${days.map((d, i) => `
        <div class="bar-group">
          <div class="bar-fill ${i === todayIdx ? "primary" : ""}" style="height:${Math.round((counts[i]/max)*120)}px;" title="${counts[i]} sessions"></div>
          <span class="bar-x-label">${d}</span>
        </div>
      `).join("")}
    </div>
    <p style="font-size:0.75rem; color:#718096; margin-top:1.75rem; text-align:center;">Sessions per day this week</p>
  `;
}

// ── Render patients view ──────────────────────────
function renderPatients() {
  document.getElementById("mainContent").innerHTML = `
    <div class="section-header">
      <span class="section-title">All Patients</span>
      <button class="btn btn-primary btn-sm" onclick="openAddPatient()">+ Add Patient</button>
    </div>

    <div class="card">
      <div class="card-body" style="padding:0;">
        <table class="table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Age</th>
              <th>Condition</th>
              <th>Therapy Plan</th>
              <th>Progress</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${patients.map(p => `
              <tr>
                <td>
                  <div style="display:flex; align-items:center; gap:0.6rem;">
                    <div class="user-avatar">${p.name.charAt(0)}</div>
                    <strong>${p.name}</strong>
                  </div>
                </td>
                <td>${p.age}</td>
                <td style="font-size:0.83rem; color:#718096;">${p.condition}</td>
                <td style="font-size:0.83rem;">${p.therapyPlan}</td>
                <td style="min-width:120px;">
                  <div class="progress-wrap" style="margin-bottom:0.2rem;">
                    <div class="progress-bar" style="width:${Math.round((p.completed/p.sessions)*100)}%"></div>
                  </div>
                  <span style="font-size:0.72rem; color:#718096;">${p.completed}/${p.sessions}</span>
                </td>
                <td>${getStatusBadge(p.status)}</td>
                <td>
                  <button class="btn btn-sm btn-outline" onclick="viewPatientDetail('${p.id}')">View</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ── Render schedule view ──────────────────────────
function renderSchedule() {
  document.getElementById("mainContent").innerHTML = `
    <div class="section-header">
      <span class="section-title">Therapy Schedule</span>
      <button class="btn btn-primary btn-sm" onclick="openAddSession()">+ New Session</button>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">Today — ${new Date().toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}</span>
      </div>
      <div class="card-body" style="padding:0;">
        ${renderTodayScheduleTable()}
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">Therapy Room Allocation</span>
      </div>
      <div class="card-body">
        ${renderRoomView()}
      </div>
    </div>
  `;
}

function renderRoomView() {
  const rooms = ["Room 1", "Room 2", "Room 3"];
  return rooms.map(room => {
    const roomSessions = sessions.filter(s => s.room === room);
    return `
      <div style="margin-bottom:1.25rem;">
        <div style="font-weight:600; font-size:0.9rem; margin-bottom:0.6rem; color:var(--green);">🏠 ${room}</div>
        ${roomSessions.length ? roomSessions.map(s => `
          <div style="display:flex; align-items:center; justify-content:space-between; padding:0.6rem 0.8rem; background:var(--bg); border-radius:8px; margin-bottom:0.4rem; font-size:0.85rem;">
            <span><strong>${s.time}</strong> — ${s.patientName}</span>
            <div style="display:flex; gap:0.5rem; align-items:center;">
              <span style="font-size:0.78rem; color:#718096;">${s.therapy.split("(")[0]}</span>
              ${getStatusBadge(s.status)}
            </div>
          </div>
        `).join("") : `<p style="font-size:0.82rem; color:#718096; padding: 0.5rem 0;">No sessions scheduled</p>`}
      </div>
    `;
  }).join("");
}

// ── Render analytics view ──────────────────────────
function renderAnalytics() {
  const therapyCounts = {};
  patients.forEach(p => {
    therapyCounts[p.therapyPlan] = (therapyCounts[p.therapyPlan] || 0) + 1;
  });

  const sorted = Object.entries(therapyCounts).sort((a, b) => b[1] - a[1]);
  const max = sorted[0]?.[1] || 1;

  document.getElementById("mainContent").innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon green">📊</div>
        <div>
          <div class="stat-value">${patients.length}</div>
          <div class="stat-label">Total Patients</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue">🗓</div>
        <div>
          <div class="stat-value">${sessions.length * 7}</div>
          <div class="stat-label">Sessions This Month</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon gold">⭐</div>
        <div>
          <div class="stat-value">4.6</div>
          <div class="stat-label">Avg. Patient Rating</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">✅</div>
        <div>
          <div class="stat-value">87%</div>
          <div class="stat-label">Session Completion Rate</div>
        </div>
      </div>
    </div>

    <div class="two-col">
      <div class="card">
        <div class="card-header"><span class="card-title">Popular Therapies</span></div>
        <div class="card-body">
          ${sorted.map(([therapy, count]) => `
            <div style="margin-bottom:1rem;">
              <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.3rem;">
                <span>${therapy.split("(")[0].trim()}</span>
                <span style="color:#718096;">${count} patient${count > 1 ? "s" : ""}</span>
              </div>
              <div class="progress-wrap">
                <div class="progress-bar" style="width:${Math.round((count/max)*100)}%"></div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><span class="card-title">Patient Status Breakdown</span></div>
        <div class="card-body">
          ${renderStatusPie()}
        </div>
      </div>
    </div>
  `;
}

function renderStatusPie() {
  const statuses = ["active", "completed", "scheduled"];
  const colors = { active: "#52b788", completed: "#2d6a4f", scheduled: "#b7791f" };
  return statuses.map(s => {
    const count = patients.filter(p => p.status === s).length;
    const pct = Math.round((count / patients.length) * 100);
    return `
      <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.9rem;">
        <div style="width:12px; height:12px; border-radius:50%; background:${colors[s]}; flex-shrink:0;"></div>
        <div style="flex:1;">
          <div style="display:flex; justify-content:space-between; font-size:0.85rem;">
            <span>${capitalise(s)}</span>
            <span>${count} (${pct}%)</span>
          </div>
          <div class="progress-wrap" style="margin-top:0.3rem;">
            <div class="progress-bar" style="width:${pct}%; background:${colors[s]};"></div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// ── Patient detail ────────────────────────────────
function viewPatientDetail(id) {
  const p = patients.find(x => x.id === id);
  if (!p) return;

  document.getElementById("mainContent").innerHTML = `
    <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1.25rem;">
      <button class="btn btn-outline btn-sm" onclick="renderPatients()">← Back</button>
      <h2 style="font-size:1.15rem; font-weight:700;">${p.name}</h2>
      ${getStatusBadge(p.status)}
    </div>

    <div class="two-col">
      <div class="card">
        <div class="card-header"><span class="card-title">Patient Info</span></div>
        <div class="card-body">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem 1.5rem; font-size:0.88rem;">
            <div><div style="color:#718096; font-size:0.78rem; margin-bottom:0.2rem;">Name</div><strong>${p.name}</strong></div>
            <div><div style="color:#718096; font-size:0.78rem; margin-bottom:0.2rem;">Age</div><strong>${p.age}</strong></div>
            <div><div style="color:#718096; font-size:0.78rem; margin-bottom:0.2rem;">Condition</div><strong>${p.condition}</strong></div>
            <div><div style="color:#718096; font-size:0.78rem; margin-bottom:0.2rem;">Start Date</div><strong>${p.startDate}</strong></div>
            <div><div style="color:#718096; font-size:0.78rem; margin-bottom:0.2rem;">Therapy Plan</div><strong>${p.therapyPlan}</strong></div>
            <div><div style="color:#718096; font-size:0.78rem; margin-bottom:0.2rem;">Progress</div><strong>${p.completed}/${p.sessions} sessions</strong></div>
          </div>

          <hr class="divider" />

          <div style="margin-bottom:0.5rem; font-size:0.85rem; font-weight:600;">Treatment Progress</div>
          <div class="progress-wrap" style="height:12px;">
            <div class="progress-bar" style="width:${Math.round((p.completed/p.sessions)*100)}%; height:100%;"></div>
          </div>
          <p style="font-size:0.78rem; color:#718096; margin-top:0.4rem;">${Math.round((p.completed/p.sessions)*100)}% complete</p>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><span class="card-title">Pre & Post Instructions</span></div>
        <div class="card-body">
          <div style="margin-bottom:1rem;">
            <div style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--green); margin-bottom:0.4rem;">Pre-Procedure</div>
            <p style="font-size:0.85rem; color:#4a5568; background:var(--green-pale); padding:0.75rem; border-radius:8px;">${PRE_INSTRUCTIONS[p.therapyPlan] || "Follow standard pre-procedure guidelines."}</p>
          </div>
          <div>
            <div style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:#b7791f; margin-bottom:0.4rem;">Post-Procedure</div>
            <p style="font-size:0.85rem; color:#4a5568; background:#fef3c7; padding:0.75rem; border-radius:8px;">${POST_INSTRUCTIONS[p.therapyPlan] || "Follow standard post-procedure guidelines."}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><span class="card-title">Patient Feedback</span></div>
      <div class="card-body">
        ${renderPatientFeedback(p.id)}
      </div>
    </div>
  `;
}

function renderPatientFeedback(patientId) {
  // only show for rahul (demo patient)
  if (patientId !== "p1") {
    return `<p style="color:#718096; font-size:0.88rem;">No feedback submitted yet.</p>`;
  }
  const feedbacks = JSON.parse(localStorage.getItem("patient_feedbacks") || "[]");
  if (!feedbacks.length) {
    return `<p style="color:#718096; font-size:0.88rem;">No feedback submitted yet.</p>`;
  }
  return feedbacks.map(f => `
    <div style="border:1px solid var(--border); border-radius:8px; padding:0.9rem; margin-bottom:0.75rem; font-size:0.86rem;">
      <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
        <strong>${f.therapy}</strong>
        <span style="color:#718096; font-size:0.78rem;">${f.date}</span>
      </div>
      <div style="display:flex; gap:1rem; margin-bottom:0.4rem;">
        <span>Pain: ${renderStars(f.pain, 5)}</span>
        <span>Energy: ${renderStars(f.energy, 5)}</span>
        <span>Overall: ${renderStars(f.overall, 5)}</span>
      </div>
      ${f.notes ? `<p style="color:#4a5568; margin-top:0.4rem;">${f.notes}</p>` : ""}
    </div>
  `).join("");
}

function renderStars(val, max) {
  return Array.from({ length: max }, (_, i) => i < val ? "⭐" : "☆").join("");
}

// ── Add session modal ────────────────────────────
function openAddSession() {
  const modal = document.getElementById("addSessionModal");
  // fill patient options
  const select = modal.querySelector("#sessionPatient");
  select.innerHTML = patients.map(p => `<option value="${p.id}" data-name="${p.name}" data-therapy="${p.therapyPlan}">${p.name}</option>`).join("");
  modal.classList.add("open");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

function saveSession() {
  const modal = document.getElementById("addSessionModal");
  const patientSelect = modal.querySelector("#sessionPatient");
  const selectedOption = patientSelect.options[patientSelect.selectedIndex];
  const time = modal.querySelector("#sessionTime").value;
  const room = modal.querySelector("#sessionRoom").value;
  const therapy = modal.querySelector("#sessionTherapy").value || selectedOption.dataset.therapy;
  const duration = parseInt(modal.querySelector("#sessionDuration").value) || 60;

  if (!time) { toast("Please select a time", "error"); return; }

  const newSession = {
    id: "s" + Date.now(),
    patientId: patientSelect.value,
    patientName: selectedOption.dataset.name,
    therapy,
    time,
    duration,
    room,
    status: "upcoming",
    notes: ""
  };

  sessions.push(newSession);
  sessions.sort((a, b) => a.time.localeCompare(b.time));
  saveSessions();
  closeModal("addSessionModal");
  toast("Session scheduled!", "success");

  // re-render current view
  if (currentView === "overview") renderOverview();
  else if (currentView === "schedule") renderSchedule();
}

function markComplete(sessionId) {
  const s = sessions.find(x => x.id === sessionId);
  if (s) {
    s.status = "completed";
    saveSessions();
    toast(`${s.patientName}'s session marked complete`, "success");
    if (currentView === "overview") renderOverview();
    else if (currentView === "schedule") renderSchedule();
  }
}

// ── Add patient modal ────────────────────────────
function openAddPatient() {
  document.getElementById("addPatientModal").classList.add("open");
}

function savePatient() {
  const modal = document.getElementById("addPatientModal");
  const name = modal.querySelector("#pName").value.trim();
  const age = parseInt(modal.querySelector("#pAge").value);
  const condition = modal.querySelector("#pCondition").value.trim();
  const therapyPlan = modal.querySelector("#pTherapy").value;
  const sessions_count = parseInt(modal.querySelector("#pSessions").value) || 10;

  if (!name || !age || !condition) { toast("Please fill all required fields", "error"); return; }

  patients.push({
    id: "p" + Date.now(),
    name, age, condition, therapyPlan,
    startDate: new Date().toISOString().split("T")[0],
    sessions: sessions_count,
    completed: 0,
    status: "scheduled"
  });

  savePatients();
  closeModal("addPatientModal");
  toast(`${name} added successfully`, "success");
  renderPatients();
}

// ── Nav ───────────────────────────────────────────
function setView(view) {
  currentView = view;
  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  document.querySelector(`[data-view="${view}"]`)?.classList.add("active");

  document.getElementById("topbarTitle").textContent = {
    overview: "Overview",
    schedule: "Therapy Schedule",
    patients: "Patients",
    analytics: "Analytics"
  }[view] || view;

  if (view === "overview") renderOverview();
  else if (view === "schedule") renderSchedule();
  else if (view === "patients") renderPatients();
  else if (view === "analytics") renderAnalytics();
}
