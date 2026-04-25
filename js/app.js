// seed data lives here so both dashboards can read it

const THERAPIES = [
  "Vamana (Emesis)",
  "Virechana (Purgation)",
  "Basti (Enema)",
  "Nasya (Nasal)",
  "Raktamokshana (Bloodletting)",
  "Abhyanga (Oil Massage)",
  "Shirodhara (Oil Pouring)",
  "Kizhi (Herbal Bolus)"
];

const PRE_INSTRUCTIONS = {
  "Vamana (Emesis)": "Avoid heavy food 12 hrs before. Stay hydrated. Wear loose clothing.",
  "Virechana (Purgation)": "Light diet only the day before. No dairy. Take prescribed ghee in the morning.",
  "Basti (Enema)": "Empty bowels before arrival. Light breakfast only. Bring a change of clothes.",
  "Nasya (Nasal)": "Avoid cold drinks. Keep head warm. Arrive 10 minutes early for steam prep.",
  "Raktamokshana (Bloodletting)": "Eat a light meal 2 hrs before. Stay hydrated. Inform us of any blood thinners.",
  "Abhyanga (Oil Massage)": "No heavy meal 1 hr before. Avoid cold shower same day.",
  "Shirodhara (Oil Pouring)": "Wash and dry hair before session. No caffeine. Arrive calm and rested.",
  "Kizhi (Herbal Bolus)": "Avoid oily food. Wear minimal jewellery. Hydrate well."
};

const POST_INSTRUCTIONS = {
  "Vamana (Emesis)": "Rest for 2 hrs. Eat only khichdi or light porridge. Avoid exertion for 24 hrs.",
  "Virechana (Purgation)": "Rest, drink warm water. Eat light semi-liquid diet. Avoid stress.",
  "Basti (Enema)": "Stay warm. Eat warm, easily digestible food. No cold beverages for 6 hrs.",
  "Nasya (Nasal)": "Keep head warm. Avoid dust and cold air. No screen time for 1 hr.",
  "Raktamokshana (Bloodletting)": "Apply pressure on site for 5 min. Eat iron-rich food. Rest and hydrate.",
  "Abhyanga (Oil Massage)": "Leave oil on for 30 min if possible. Warm shower only. Rest afterwards.",
  "Shirodhara (Oil Pouring)": "Do not wash hair for 6 hrs. Avoid bright lights. Gentle walk only.",
  "Kizhi (Herbal Bolus)": "Drink warm water. Gentle rest. Avoid cold food and drinks."
};

// demo accounts — plain text passwords are fine for a prototype
const DEMO_USERS = {
  "dr.sharma@ayursutra.com": {
    password: "doctor123",
    role: "practitioner",
    name: "Dr. Priya Sharma",
    initials: "PS"
  },
  "patient@ayursutra.com": {
    password: "patient123",
    role: "patient",
    name: "Rahul Mehta",
    initials: "RM"
  }
};

// seed patients for practitioner view
const SEED_PATIENTS = [
  { id: "p1", name: "Rahul Mehta", age: 34, condition: "Stress & Fatigue", therapyPlan: "Abhyanga (Oil Massage)", startDate: "2025-06-01", sessions: 10, completed: 6, status: "active" },
  { id: "p2", name: "Sunita Patel", age: 52, condition: "Arthritis", therapyPlan: "Kizhi (Herbal Bolus)", startDate: "2025-05-20", sessions: 14, completed: 14, status: "completed" },
  { id: "p3", name: "Vikram Singh", age: 41, condition: "Digestive Issues", therapyPlan: "Virechana (Purgation)", startDate: "2025-06-10", sessions: 7, completed: 2, status: "active" },
  { id: "p4", name: "Deepa Nair", age: 38, condition: "Migraine", therapyPlan: "Shirodhara (Oil Pouring)", startDate: "2025-06-15", sessions: 12, completed: 0, status: "scheduled" },
  { id: "p5", name: "Amit Joshi", age: 60, condition: "Hypertension", therapyPlan: "Nasya (Nasal)", startDate: "2025-05-28", sessions: 10, completed: 8, status: "active" }
];

// seed sessions for today
function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

const SEED_SESSIONS = [
  { id: "s1", patientId: "p1", patientName: "Rahul Mehta", therapy: "Abhyanga (Oil Massage)", time: "09:00", duration: 60, room: "Room 1", status: "completed", notes: "" },
  { id: "s2", patientId: "p3", patientName: "Vikram Singh", therapy: "Virechana (Purgation)", time: "10:30", duration: 45, room: "Room 2", status: "in-progress", notes: "" },
  { id: "s3", patientId: "p5", patientName: "Amit Joshi", therapy: "Nasya (Nasal)", time: "11:30", duration: 30, room: "Room 1", status: "upcoming", notes: "" },
  { id: "s4", patientId: "p4", patientName: "Deepa Nair", therapy: "Shirodhara (Oil Pouring)", time: "14:00", duration: 75, room: "Room 3", status: "upcoming", notes: "" },
  { id: "s5", patientId: "p2", patientName: "Sunita Patel", therapy: "Kizhi (Herbal Bolus)", time: "15:30", duration: 60, room: "Room 2", status: "upcoming", notes: "" }
];

// patient's own session history
const PATIENT_SESSIONS = [
  { id: "r1", date: "2025-06-10", therapy: "Abhyanga (Oil Massage)", practitioner: "Dr. Priya Sharma", status: "completed", feedbackGiven: true, painLevel: 2, energyLevel: 4 },
  { id: "r2", date: "2025-06-12", therapy: "Abhyanga (Oil Massage)", practitioner: "Dr. Priya Sharma", status: "completed", feedbackGiven: true, painLevel: 2, energyLevel: 5 },
  { id: "r3", date: "2025-06-14", therapy: "Abhyanga (Oil Massage)", practitioner: "Dr. Priya Sharma", status: "completed", feedbackGiven: false, painLevel: 1, energyLevel: 5 },
  { id: "r4", date: "2025-06-16", therapy: "Abhyanga (Oil Massage)", practitioner: "Dr. Priya Sharma", status: "upcoming", feedbackGiven: false, painLevel: null, energyLevel: null },
  { id: "r5", date: "2025-06-18", therapy: "Abhyanga (Oil Massage)", practitioner: "Dr. Priya Sharma", status: "upcoming", feedbackGiven: false, painLevel: null, energyLevel: null }
];

const NOTIFICATIONS = {
  practitioner: [
    { id: "n1", text: "Vikram Singh's session starts in 30 minutes", time: "10:00 AM", unread: true },
    { id: "n2", text: "Deepa Nair confirmed her 2:00 PM appointment", time: "9:45 AM", unread: true },
    { id: "n3", text: "New feedback submitted by Rahul Mehta", time: "9:20 AM", unread: false },
    { id: "n4", text: "Sunita Patel completed her full therapy course", time: "Yesterday", unread: false }
  ],
  patient: [
    { id: "n1", text: "⏰ Reminder: Session tomorrow at 9:00 AM — Abhyanga", time: "2 hrs ago", unread: true },
    { id: "n2", text: "📋 Pre-procedure: Avoid heavy food 12 hrs before. Stay hydrated.", time: "3 hrs ago", unread: true },
    { id: "n3", text: "✅ Session on Jun 14 marked complete. Please submit your feedback.", time: "Yesterday", unread: false },
    { id: "n4", text: "📝 Post-procedure: Leave oil on for 30 min. Warm shower only.", time: "2 days ago", unread: false }
  ]
};

// simple auth — just checks against DEMO_USERS
function login(email, password) {
  const user = DEMO_USERS[email];
  if (!user || user.password !== password) return null;
  const session = { email, role: user.role, name: user.name, initials: user.initials };
  localStorage.setItem("ayursutra_session", JSON.stringify(session));
  return session;
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem("ayursutra_session"));
  } catch {
    return null;
  }
}

function logout() {
  localStorage.removeItem("ayursutra_session");
  window.location.href = "index.html";
}

// helper — tiny toast
function toast(msg, type = "default") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}
