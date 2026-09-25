/* QueueFlow - Queue Management System
   Vanilla JS + LocalStorage. No external libraries. */

const STORAGE_KEY = "queueflow_data";

// ---------- Data ----------
let state = loadState();

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) { /* fall through to seed */ }
  }
  return seedData();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function seedData() {
  const now = Date.now();
  const mins = (m) => now - m * 60000;
  const data = {
    counter: 8,
    customers: [
      { id: 1, number: "A-001", name: "Maria Cruz", service: "Payment", time: mins(50), status: "served", servedTime: mins(35) },
      { id: 2, number: "A-002", name: "Jose Ramirez", service: "Document Request", time: mins(45), status: "served", servedTime: mins(28) },
      { id: 3, number: "A-003", name: "Ana Lopez", service: "Registration", time: mins(30), status: "served", servedTime: mins(18) },
      { id: 4, number: "A-004", name: "John Santos", service: "Payment", time: mins(20), status: "serving", servedTime: null },
      { id: 5, number: "A-005", name: "Grace Tan", service: "General Inquiry", time: mins(15), status: "waiting", servedTime: null },
      { id: 6, number: "A-006", name: "Mark Villanueva", service: "Customer Support", time: mins(10), status: "waiting", servedTime: null },
      { id: 7, number: "A-007", name: "Liza Fernandez", service: "Document Request", time: mins(5), status: "waiting", servedTime: null },
      { id: 8, number: "A-008", name: "Carlos Reyes", service: "Other", time: mins(2), status: "waiting", servedTime: null }
    ]
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

// ---------- Helpers ----------
function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function generateQueueNumber() {
  state.counter += 1;
  return "A-" + String(state.counter).padStart(3, "0");
}

function showToast(message, type = "") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast " + type;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ---------- Rendering ----------
function renderAll() {
  renderStats();
  renderNowServing();
  renderNextInLine();
  renderQueueTable();
  renderHistory();
}

function renderStats() {
  const waiting = state.customers.filter(c => c.status === "waiting").length;
  const servingCustomer = state.customers.find(c => c.status === "serving");
  const served = state.customers.filter(c => c.status === "served").length;
  const total = state.customers.length;

  document.getElementById("stat-waiting").textContent = waiting;
  document.getElementById("stat-serving").textContent = servingCustomer ? servingCustomer.number : "-";
  document.getElementById("stat-served").textContent = served;
  document.getElementById("stat-total").textContent = total;
}

function renderNowServing() {
  const el = document.getElementById("now-serving-display");
  const current = state.customers.find(c => c.status === "serving");
  if (!current) {
    el.innerHTML = `<p class="empty-msg">No customer is currently being served.</p>`;
    return;
  }
  el.innerHTML = `
    <div class="now-serving-number">${current.number}</div>
    <div class="now-serving-name">${escapeHtml(current.name)}</div>
    <div class="now-serving-service">${escapeHtml(current.service)}</div>
  `;
}

function renderNextInLine() {
  const list = document.getElementById("next-in-line-list");
  const waiting = state.customers.filter(c => c.status === "waiting").slice(0, 5);
  if (waiting.length === 0) {
    list.innerHTML = `<li class="empty-msg">No customers waiting.</li>`;
    return;
  }
  list.innerHTML = waiting.map(c => `
    <li>
      <span class="queue-num">${c.number}</span>
      <span>${escapeHtml(c.name)}</span>
    </li>
  `).join("");
}

function renderQueueTable() {
  const body = document.getElementById("queue-table-body");
  if (state.customers.length === 0) {
    body.innerHTML = `<tr><td colspan="6"><p class="empty-msg">No customers in the queue yet.</p></td></tr>`;
    return;
  }
  // Show waiting/serving first, most recent first within group; keep original order otherwise
  const sorted = [...state.customers].sort((a, b) => {
    const order = { serving: 0, waiting: 1, served: 2 };
    return order[a.status] - order[b.status] || a.time - b.time;
  });

  body.innerHTML = sorted.map(c => `
    <tr>
      <td><strong>${c.number}</strong></td>
      <td>${escapeHtml(c.name)}</td>
      <td>${escapeHtml(c.service)}</td>
      <td>${formatTime(c.time)}</td>
      <td><span class="badge badge-${c.status}">${capitalize(c.status)}</span></td>
      <td>
        <div class="actions-cell">
          ${c.status === "waiting" ? `<button class="btn btn-sm btn-outline" data-action="call" data-id="${c.id}">Call</button>` : ""}
          ${c.status !== "served" ? `<button class="btn btn-sm btn-outline" data-action="serve" data-id="${c.id}">Mark Served</button>` : ""}
          <button class="btn btn-sm btn-danger-outline" data-action="remove" data-id="${c.id}">Remove</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function renderHistory() {
  const body = document.getElementById("history-table-body");
  const served = state.customers
    .filter(c => c.status === "served")
    .sort((a, b) => b.servedTime - a.servedTime)
    .slice(0, 20);

  if (served.length === 0) {
    body.innerHTML = `<tr><td colspan="4"><p class="empty-msg">No served customers yet.</p></td></tr>`;
    return;
  }

  body.innerHTML = served.map(c => `
    <tr>
      <td><strong>${c.number}</strong></td>
      <td>${escapeHtml(c.name)}</td>
      <td>${escapeHtml(c.service)}</td>
      <td>${formatTime(c.servedTime)}</td>
    </tr>
  `).join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

// ---------- Actions ----------
function addCustomer(name, service) {
  const customer = {
    id: Date.now(),
    number: generateQueueNumber(),
    name: name.trim(),
    service,
    time: Date.now(),
    status: "waiting",
    servedTime: null
  };
  state.customers.push(customer);
  saveState();
  renderAll();
  showToast(`${customer.number} added to the queue.`, "success");
}

function callNext() {
  const alreadyServing = state.customers.find(c => c.status === "serving");
  if (alreadyServing) {
    showToast(`Please mark ${alreadyServing.number} as served before calling next.`, "error");
    return;
  }
  const next = state.customers.find(c => c.status === "waiting");
  if (!next) {
    showToast("No customers are currently waiting.");
    return;
  }
  next.status = "serving";
  saveState();
  renderAll();
  showToast(`Now serving ${next.number} - ${next.name}`, "success");
}

function markServed(id) {
  const customer = state.customers.find(c => c.id === id);
  if (!customer) return;
  customer.status = "served";
  customer.servedTime = Date.now();
  saveState();
  renderAll();
  showToast(`${customer.number} marked as served.`, "success");
}

function removeCustomer(id) {
  const customer = state.customers.find(c => c.id === id);
  if (!customer) return;
  if (!confirm(`Remove ${customer.number} - ${customer.name} from the queue?`)) return;
  state.customers = state.customers.filter(c => c.id !== id);
  saveState();
  renderAll();
  showToast(`${customer.number} removed.`);
}

// ---------- Navigation ----------
function setupNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  const sections = document.querySelectorAll(".section");
  const pageTitle = document.getElementById("page-title");

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      navItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      const target = item.dataset.section;
      sections.forEach(s => s.classList.toggle("active", s.id === "section-" + target));
      pageTitle.textContent = item.textContent.trim();
      closeSidebar();
    });
  });
}

function openSidebar() {
  document.getElementById("sidebar").classList.add("open");
  document.getElementById("overlay").classList.add("show");
}
function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
}

// ---------- Modal ----------
function openAddModal() { document.getElementById("add-modal-overlay").classList.add("show"); }
function closeAddModal() {
  document.getElementById("add-modal-overlay").classList.remove("show");
  document.getElementById("add-customer-form").reset();
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  renderAll();
  setupNavigation();

  document.getElementById("hamburger").addEventListener("click", openSidebar);
  document.getElementById("overlay").addEventListener("click", closeSidebar);

  document.getElementById("open-add-modal").addEventListener("click", openAddModal);
  document.getElementById("close-add-modal").addEventListener("click", closeAddModal);
  document.getElementById("cancel-add-modal").addEventListener("click", closeAddModal);
  document.getElementById("add-modal-overlay").addEventListener("click", (e) => {
    if (e.target.id === "add-modal-overlay") closeAddModal();
  });

  document.getElementById("add-customer-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("customer-name").value.trim();
    const service = document.getElementById("service-type").value;
    if (!name) {
      showToast("Please enter a customer name.", "error");
      return;
    }
    addCustomer(name, service);
    closeAddModal();
  });

  document.getElementById("call-next-btn").addEventListener("click", callNext);

  // Event delegation for table action buttons
  document.getElementById("queue-table-body").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;
    if (action === "call") {
      const target = state.customers.find(c => c.id === id);
      const currentlyServing = state.customers.find(c => c.status === "serving");
      if (currentlyServing && currentlyServing.id !== id) {
        showToast(`Please mark ${currentlyServing.number} as served first.`, "error");
        return;
      }
      if (target) {
        target.status = "serving";
        saveState();
        renderAll();
        showToast(`Now serving ${target.number} - ${target.name}`, "success");
      }
    } else if (action === "serve") {
      markServed(id);
    } else if (action === "remove") {
      removeCustomer(id);
    }
  });
});
