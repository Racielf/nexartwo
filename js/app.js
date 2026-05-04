// ============ MOCK DATA ============

let COMPANY = {
  name: "R.C Art Construction LLC",
  ccb: "247277",
  state: "Oregon",
  city: "Portland",
  address: "",
  owner: "Rodolfo Fernandez Romero",
  phone: "(503) 555-0147",
  email: "info@rcartconstruction.com",
  founded: "August 2023",
  logo_url: "",
  app_logo_url: ""
};

const SERVICE_CATEGORIES = [
  "All", "Electrical", "Plumbing", "Roofing", "HVAC", "Flooring",
  "Painting", "Drywall / Framing", "Windows & Doors", "Foundation",
  "Landscaping", "Cleaning", "General Repairs", "Appliances"
];

const _DEFAULT_SERVICES = [
  { id: 1, name: "Replace 100A Panel", nameEs: "Reemplazar Panel 100A", category: "Electrical", sub: "Panels & Breakers", price: 1200, unit: "each", desc: "Full panel replacement including permits and inspection", negotiable: "yes", laborHrs: 6 },
  { id: 2, name: "Add Circuit Breaker", nameEs: "Agregar Interruptor", category: "Electrical", sub: "Panels & Breakers", price: 85, unit: "each", desc: "Install new single-pole circuit breaker", negotiable: "ask", laborHrs: 1 },
  { id: 3, name: "Replace GFCI Outlet", nameEs: "Reemplazar Tomacorriente GFCI", category: "Electrical", sub: "Outlets & Switches", price: 65, unit: "each", desc: "Replace standard outlet with GFCI protected outlet", negotiable: "yes", laborHrs: 0.5 },
  { id: 4, name: "Install Ceiling Fan", nameEs: "Instalar Ventilador de Techo", category: "Electrical", sub: "Fixtures", price: 175, unit: "each", desc: "Install ceiling fan with light kit, includes wiring", negotiable: "yes", laborHrs: 2 },
  { id: 5, name: "Replace 40gal Water Heater", nameEs: "Reemplazar Calentador 40gal", category: "Plumbing", sub: "Water Heater", price: 850, unit: "each", desc: "Remove old unit, install new 40-gallon tank water heater", negotiable: "no", laborHrs: 4 },
  { id: 6, name: "Repair Leak Under Sink", nameEs: "Reparar Fuga Bajo Lavamanos", category: "Plumbing", sub: "Pipes", price: 120, unit: "each", desc: "Diagnose and repair leak under kitchen or bathroom sink", negotiable: "yes", laborHrs: 1.5 },
  { id: 7, name: "Replace P-Trap", nameEs: "Reemplazar Trampa P", category: "Plumbing", sub: "Pipes", price: 85, unit: "each", desc: "Replace P-trap assembly under sink", negotiable: "yes", laborHrs: 1 },
  { id: 8, name: "Unclog Main Drain", nameEs: "Destapar Drenaje Principal", category: "Plumbing", sub: "Drains", price: 250, unit: "each", desc: "Professional drain cleaning with snake or hydro jet", negotiable: "no", laborHrs: 2 },
  { id: 9, name: "Roof Repair — Shingles", nameEs: "Reparación de Techo — Tejas", category: "Roofing", sub: "Shingle Repair", price: 800, unit: "per square", desc: "Replace damaged or missing shingles, includes flashing", negotiable: "yes", laborHrs: 4 },
  { id: 10, name: "Roof Inspection", nameEs: "Inspección de Techo", category: "Roofing", sub: "Inspection", price: 350, unit: "each", desc: "Complete roof inspection with photo documentation", negotiable: "no", laborHrs: 2 },
  { id: 11, name: "HVAC Inspection + Service", nameEs: "Inspección y Servicio HVAC", category: "HVAC", sub: "Maintenance", price: 150, unit: "each", desc: "Full HVAC system inspection, filter replacement, and tune-up", negotiable: "yes", laborHrs: 2 },
  { id: 12, name: "Replace Thermostat", nameEs: "Reemplazar Termostato", category: "HVAC", sub: "Controls", price: 195, unit: "each", desc: "Install new programmable or smart thermostat", negotiable: "yes", laborHrs: 1 },
  { id: 13, name: "Install Laminate Flooring", nameEs: "Instalar Piso Laminado", category: "Flooring", sub: "Laminate", price: 4.50, unit: "sq ft", desc: "Install laminate flooring including underlayment", negotiable: "yes", laborHrs: 0.1 },
  { id: 14, name: "Interior Paint — Room", nameEs: "Pintura Interior — Cuarto", category: "Painting", sub: "Interior", price: 450, unit: "per room", desc: "Prep, prime, and paint room (walls + ceiling), includes paint", negotiable: "yes", laborHrs: 6 },
  { id: 15, name: "Exterior Paint — Full House", nameEs: "Pintura Exterior — Casa Completa", category: "Painting", sub: "Exterior", price: 3800, unit: "each", desc: "Full exterior paint including pressure wash, prep, and 2 coats", negotiable: "ask", laborHrs: 40 },
  { id: 16, name: "Drywall Patch Repair", nameEs: "Reparación de Parche Drywall", category: "Drywall / Framing", sub: "Repair", price: 150, unit: "each", desc: "Patch and texture drywall hole up to 12 inches", negotiable: "yes", laborHrs: 2 },
  { id: 17, name: "Replace Window — Standard", nameEs: "Reemplazar Ventana — Estándar", category: "Windows & Doors", sub: "Windows", price: 450, unit: "each", desc: "Remove and replace standard size window, includes trim", negotiable: "yes", laborHrs: 3 },
  { id: 18, name: "Replace Entry Door", nameEs: "Reemplazar Puerta de Entrada", category: "Windows & Doors", sub: "Doors", price: 850, unit: "each", desc: "Remove and install new entry door with hardware", negotiable: "ask", laborHrs: 4 },
  { id: 19, name: "Junk Removal — Truckload", nameEs: "Remoción de Basura — Carga", category: "Cleaning", sub: "Junk Removal", price: 400, unit: "per load", desc: "Full truckload junk removal and dump fees included", negotiable: "no", laborHrs: 3 },
  { id: 20, name: "General Handyman — Hourly", nameEs: "Trabajo General — Por Hora", category: "General Repairs", sub: "Handyman", price: 75, unit: "hour", desc: "General repair work, minor fixes, and miscellaneous tasks", negotiable: "yes", laborHrs: 1 },
  // --- Plumbing: Water Heater & Drains ---
  { id: 21, name: "Water Heater Main Valve Replacement", nameEs: "Cambiar Válvula Principal del Calentador", category: "Plumbing", sub: "Water Heater", price: 185, unit: "each", desc: "Replace main shut-off valve on water heater supply line", negotiable: "yes", laborHrs: 1.5 },
  { id: 22, name: "Kitchen Faucet Low Pressure Repair", nameEs: "Reparar Flujo Deficiente del Fregadero", category: "Plumbing", sub: "Faucets", price: 120, unit: "each", desc: "Diagnose and repair low water pressure at kitchen faucet, clean aerator and supply lines", negotiable: "yes", laborHrs: 1 },
  { id: 23, name: "Shower Drain Inspection & Cleaning", nameEs: "Inspección y Limpieza de Drenaje de Ducha", category: "Plumbing", sub: "Drains", price: 95, unit: "each", desc: "Inspect shower drain for clogs, clean and verify proper drainage flow", negotiable: "yes", laborHrs: 1 },
  { id: 24, name: "Sink Drain Vent Inspection", nameEs: "Inspección de Ventilación de Drenaje del Lavamanos", category: "Plumbing", sub: "Drains", price: 85, unit: "each", desc: "Inspect drain vent pipe under sink for proper air flow and code compliance", negotiable: "yes", laborHrs: 0.5 },
  // --- HVAC: Dryer Vent & Heating ---
  { id: 25, name: "Dryer Vent Inspection & Cleaning", nameEs: "Inspección y Limpieza del Ducto de Secadora", category: "HVAC", sub: "Vents", price: 135, unit: "each", desc: "Inspect dryer exhaust vent for lint buildup, clean duct from dryer to exterior wall", negotiable: "yes", laborHrs: 1.5 },
  { id: 26, name: "Dryer Drain Connection Inspection", nameEs: "Inspección de Conexión de Drenaje de Secadora", category: "HVAC", sub: "Vents", price: 75, unit: "each", desc: "Verify dryer drain is properly connected to duct, check for leaks and disconnections", negotiable: "yes", laborHrs: 0.5 },
  { id: 27, name: "Heating System Inspection", nameEs: "Inspección del Sistema de Calefacción", category: "HVAC", sub: "Heating", price: 195, unit: "each", desc: "Full furnace/heating system inspection including heat exchanger, burners, blower, and safety controls", negotiable: "no", laborHrs: 2 },
  // --- Roofing: Vents & Attic ---
  { id: 28, name: "Roof Attic Vent Inspection", nameEs: "Inspección de Ventilación del Ático", category: "Roofing", sub: "Ventilation", price: 150, unit: "each", desc: "Inspect roof vents to attic for blockage, damage, and proper airflow", negotiable: "yes", laborHrs: 1.5 },
  { id: 29, name: "Roof-to-Attic Crossover Vent Cleaning", nameEs: "Limpieza de Ductos de Ventilación Techo-Ático", category: "Roofing", sub: "Ventilation", price: 225, unit: "each", desc: "Inspect and clear crossover ventilation ducts between roof and attic space", negotiable: "yes", laborHrs: 2 },
  { id: 30, name: "Soffit Vent Inspection — 2nd Floor", nameEs: "Inspección de Ventilación del Soffit 2do Piso", category: "Roofing", sub: "Ventilation", price: 120, unit: "each", desc: "Inspect second floor soffit vents for blockage, ensure proper attic ventilation", negotiable: "yes", laborHrs: 1 },
  // --- Foundation: Crawl Space ---
  { id: 31, name: "Crawl Space Insulation & Vapor Barrier Inspection", nameEs: "Inspección de Aislamiento y Plástico del Crawl Space", category: "Foundation", sub: "Insulation", price: 175, unit: "each", desc: "Inspect crawl space for insulation condition, vapor barrier integrity, and moisture damage", negotiable: "yes", laborHrs: 1.5 },
  { id: 32, name: "Crawl Space Vapor Barrier Replacement", nameEs: "Reemplazo de Plástico del Crawl Space", category: "Foundation", sub: "Insulation", price: 1200, unit: "each", desc: "Remove old vapor barrier, install new 6mil polyethylene sheeting in crawl space", negotiable: "ask", laborHrs: 6 },
  // --- Electrical: Inspections ---
  { id: 33, name: "Breaker Panel Inspection", nameEs: "Inspección de Panel de Breakers", category: "Electrical", sub: "Panels & Breakers", price: 125, unit: "each", desc: "Full inspection of electrical breaker panel, check for double-tapped breakers, corrosion, and labeling", negotiable: "no", laborHrs: 1 },
  { id: 34, name: "Outlet & Receptacle Testing — Full House", nameEs: "Prueba de Enchufes y Tomacorrientes — Casa Completa", category: "Electrical", sub: "Outlets & Switches", price: 150, unit: "each", desc: "Test all outlets for proper wiring, grounding, polarity, and GFCI function throughout the home", negotiable: "yes", laborHrs: 2 },
  { id: 35, name: "Light Fixture Inspection & Repair", nameEs: "Inspección y Reparación de Luminarias", category: "Electrical", sub: "Fixtures", price: 85, unit: "each", desc: "Inspect and repair light fixtures, check wiring connections and switch operation", negotiable: "yes", laborHrs: 1 },
  { id: 36, name: "Main Ground Wire Inspection — Breaker Panel", nameEs: "Inspección del Cable a Tierra Principal — Panel Eléctrico", category: "Electrical", sub: "Panels & Breakers", price: 95, unit: "each", desc: "Inspect main grounding conductor at breaker panel, verify proper connection to ground rod", negotiable: "no", laborHrs: 0.5 },
];

const _DEFAULT_CLIENTS = [
  { id: 1, name: "Sarah Johnson", type: "Real Estate / Investor", email: "sarah@remax.com", phone: "(503) 555-0123", properties: 5, totalOrders: 12, totalValue: 47500 },
  { id: 2, name: "Pacific NW Properties LLC", type: "Company / Corporation", email: "ops@pnwproperties.com", phone: "(503) 555-0456", properties: 15, totalOrders: 28, totalValue: 125000 },
  { id: 3, name: "Mike Chen", type: "Residential", email: "mike.chen@gmail.com", phone: "(971) 555-0789", properties: 1, totalOrders: 3, totalValue: 8200 },
  { id: 4, name: "Maria Rodriguez", type: "Commercial", email: "maria@rodriguez-group.com", phone: "(503) 555-0321", properties: 3, totalOrders: 7, totalValue: 34800 },
  { id: 5, name: "Dave Thompson", type: "Real Estate / Investor", email: "dave@kw.com", phone: "(971) 555-0654", properties: 8, totalOrders: 15, totalValue: 62000 },
];

const _DEFAULT_WORK_ORDERS = [
  { id: "WO-2025-0041", title: "Kitchen & Bathroom Renovation", client: "Sarah Johnson", clientId: 1, property: "4521 NE Glisan St, Portland, OR", type: "A", status: "progress", priority: "high", created: "2025-04-15", target: "2025-06-01", items: 12, total: 18500, completed: 7 },
  { id: "WO-2025-0042", title: "Post-Inspection Repairs", client: "Mike Chen", clientId: 3, property: "789 SW Oak Ave, Beaverton, OR", type: "B", status: "open", priority: "medium", created: "2025-04-20", target: "2025-05-15", items: 8, total: 6200, completed: 0 },
  { id: "WO-2025-0043", title: "Commercial Buildout — Phase 1", client: "Maria Rodriguez", clientId: 4, property: "1200 Commercial St, Salem, OR", type: "C", status: "progress", priority: "high", created: "2025-04-10", target: "2025-07-01", items: 23, total: 34800, completed: 15 },
  { id: "WO-2025-0044", title: "Pre-Listing Property Prep", client: "Dave Thompson", clientId: 5, property: "3456 SE Division, Portland, OR", type: "A", status: "review", priority: "medium", created: "2025-03-28", target: "2025-05-10", items: 15, total: 12400, completed: 15 },
  { id: "WO-2025-0045", title: "Water Heater + Plumbing Emergency", client: "Sarah Johnson", clientId: 1, property: "8901 N Williams Ave, Portland, OR", type: "C", status: "completed", priority: "emergency", created: "2025-04-25", target: "2025-04-26", items: 3, total: 1850, completed: 3 },
  { id: "WO-2025-0046", title: "Full Property Inspection", client: "Pacific NW Properties LLC", clientId: 2, property: "567 Burnside Rd, Gresham, OR", type: "A", status: "draft", priority: "low", created: "2025-05-01", target: "2025-05-20", items: 0, total: 0, completed: 0 },
  { id: "WO-2025-0047", title: "Roof Repair & Exterior Paint", client: "Dave Thompson", clientId: 5, property: "2100 NE Sandy Blvd, Portland, OR", type: "B", status: "open", priority: "high", created: "2025-04-28", target: "2025-05-30", items: 5, total: 8900, completed: 0 },
];

const _DEFAULT_ACTIVITIES = [
  { text: '<strong>WO-2025-0041</strong> — Item "Replace GFCI Outlet" marked complete', time: '12 min ago', color: 'var(--success)' },
  { text: 'Email opened by <strong>Sarah Johnson</strong>', time: '34 min ago', color: 'var(--info)' },
  { text: 'New photo added to <strong>WO-2025-0043</strong>', time: '1 hr ago', color: 'var(--accent)' },
  { text: '<strong>WO-2025-0044</strong> moved to Pending Review', time: '2 hrs ago', color: 'var(--purple)' },
  { text: 'Change Order <strong>CO-2025-0012</strong> approved by client', time: '3 hrs ago', color: 'var(--success)' },
  { text: 'New client <strong>Pacific NW Properties</strong> added', time: '5 hrs ago', color: 'var(--info)' },
  { text: '<strong>WO-2025-0045</strong> marked as Completed', time: 'Yesterday', color: 'var(--success)' },
  { text: 'CCB insurance renewal reminder — <strong>60 days</strong>', time: 'Yesterday', color: 'var(--danger)' },
];

// ============ DATA PERSISTENCE (Supabase + localStorage fallback) ============
let SERVICES = [];
let CLIENTS = [];
let WORK_ORDERS = [];
let ACTIVITIES = [];

function loadDataFromLocalStorage() {
  try { var s = localStorage.getItem('woims_services'); SERVICES = s ? JSON.parse(s) : JSON.parse(JSON.stringify(_DEFAULT_SERVICES)); } catch(e) { SERVICES = JSON.parse(JSON.stringify(_DEFAULT_SERVICES)); }
  try { var c = localStorage.getItem('woims_clients'); CLIENTS = c ? JSON.parse(c) : JSON.parse(JSON.stringify(_DEFAULT_CLIENTS)); } catch(e) { CLIENTS = JSON.parse(JSON.stringify(_DEFAULT_CLIENTS)); }
  try { var w = localStorage.getItem('woims_work_orders'); WORK_ORDERS = w ? JSON.parse(w) : JSON.parse(JSON.stringify(_DEFAULT_WORK_ORDERS)); } catch(e) { WORK_ORDERS = JSON.parse(JSON.stringify(_DEFAULT_WORK_ORDERS)); }
  try { var a = localStorage.getItem('woims_activities'); ACTIVITIES = a ? JSON.parse(a) : JSON.parse(JSON.stringify(_DEFAULT_ACTIVITIES)); } catch(e) { ACTIVITIES = JSON.parse(JSON.stringify(_DEFAULT_ACTIVITIES)); }
}

async function loadData() {
  // Try Supabase first
  if (typeof DB !== 'undefined' && isSupabaseReady()) {
    try {
      await DB.seedIfEmpty();
      var [svc, cli, wo] = await Promise.all([
        DB.services.getAll(),
        DB.clients.getAll(),
        DB.workOrders.getAll()
      ]);
      if (svc) SERVICES = svc;
      if (cli) CLIENTS = cli;
      if (wo) WORK_ORDERS = wo;
      ACTIVITIES = JSON.parse(JSON.stringify(_DEFAULT_ACTIVITIES));
      console.log('✓ Data loaded from Supabase');
      return;
    } catch(e) {
      console.warn('Supabase load failed, falling back to localStorage:', e);
    }
  }
  // Fallback: localStorage
  loadDataFromLocalStorage();
  console.log('✓ Data loaded from localStorage');
}

// Save to localStorage (always) + Supabase (if available)
function saveServices() {
  try { localStorage.setItem('woims_services', JSON.stringify(SERVICES)); } catch(e) {}
}
function saveClients() {
  try { localStorage.setItem('woims_clients', JSON.stringify(CLIENTS)); } catch(e) {}
}
function saveWorkOrders() {
  try { localStorage.setItem('woims_work_orders', JSON.stringify(WORK_ORDERS)); } catch(e) {}
}
function saveActivities() {
  try { localStorage.setItem('woims_activities', JSON.stringify(ACTIVITIES)); } catch(e) {}
}
function saveAllData() { saveServices(); saveClients(); saveWorkOrders(); saveActivities(); }

// ============ APP STATE ============
let currentPage = 'dashboard';
let currentFilter = 'All';
let currentClientFilter = 'All';
let currentWO = null;

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Supabase connection
  if (typeof getSupabase === 'function') getSupabase();
  await loadData();
  loadSettings();
  renderSidebar();
  renderDashboard();
  renderServiceLibrary();
  renderWorkOrders();
  renderClients();
  setupNavigation();
  lucide.createIcons();
  // Show connection status
  if (typeof isSupabaseReady === 'function' && isSupabaseReady()) {
    showToast('☁️ Connected to cloud database');
  }
});

function setupNavigation() {
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      // Hide back-to-WO banner when navigating via sidebar
      var banner = document.getElementById('services-back-to-wo');
      if (banner) banner.style.display = 'none';
      navigateTo(page);
      // Auto-close sidebar on mobile
      if (window.innerWidth <= 768) {
        closeSidebar();
      }
    });
  });
}

function toggleSidebar() {
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebar-overlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
  document.body.classList.toggle('sidebar-open');
}

function closeSidebar() {
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebar-overlay');
  sidebar.classList.remove('open');
  overlay.classList.remove('open');
  document.body.classList.remove('sidebar-open');
}

function navigateTo(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const pageEl = document.getElementById('page-' + page);
  const navEl = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (pageEl) pageEl.classList.add('active');
  if (navEl) navEl.classList.add('active');

  // Update top bar
  const titles = {
    dashboard: ['Dashboard', 'Welcome back, Rodolfo'],
    services: ['Service Library', `${SERVICES.length} services across ${SERVICE_CATEGORIES.length - 1} categories`],
    workorders: ['Work Orders', `${WORK_ORDERS.length} total orders`],
    clients: ['Client Management', `${CLIENTS.length} clients in your network`],
    wodetail: ['Work Order Detail', ''],
    docs: ['Documents & Reports', 'Generate and manage PDFs'],
    fieldmode: ['Field Mode', 'Mobile-first task completion & photo evidence'],
    settings: ['Settings', 'Company profile, logo & preferences'],
  };
  const t = titles[page] || ['', ''];
  document.getElementById('topbar-title').textContent = t[0];
  document.getElementById('topbar-subtitle').textContent = t[1];

  // Page-specific init
  if (page === 'settings') populateSettingsForm();
  if (page === 'fieldmode') initFieldMode();
  lucide.createIcons();
}

// ============ RENDER SIDEBAR ============
function renderSidebar() {
  // Already in HTML, just wire up CCB badge
}

// ============ RENDER DASHBOARD ============
function renderDashboard() {
  const openWOs = WORK_ORDERS.filter(w => ['open', 'progress'].includes(w.status)).length;
  const overdueWOs = WORK_ORDERS.filter(w => w.status !== 'completed' && w.status !== 'draft' && new Date(w.target) < new Date()).length;
  const completedMonth = WORK_ORDERS.filter(w => w.status === 'completed').length;
  const pipeline = WORK_ORDERS.filter(w => w.status !== 'completed').reduce((s, w) => s + w.total, 0);
  const pendingItems = WORK_ORDERS.reduce((s, w) => s + (w.items - w.completed), 0);
  const docsSent = 4;

  document.getElementById('stat-open').textContent = openWOs;
  document.getElementById('stat-overdue').textContent = overdueWOs;
  document.getElementById('stat-completed').textContent = completedMonth;
  document.getElementById('stat-pipeline').textContent = '$' + pipeline.toLocaleString();
  document.getElementById('stat-pending').textContent = pendingItems;
  document.getElementById('stat-docs').textContent = docsSent;

  // Recent WOs table
  const tbody = document.getElementById('recent-wo-body');
  tbody.innerHTML = WORK_ORDERS.slice(0, 5).map(wo => `
    <tr onclick="openWorkOrderDetail('${wo.id}')">
      <td><strong class="text-accent">${wo.id}</strong></td>
      <td>${wo.title}</td>
      <td>${wo.client}</td>
      <td><span class="badge badge-${wo.status}">${statusLabel(wo.status)}</span></td>
      <td><span class="priority-dot priority-${wo.priority}"></span> ${capitalize(wo.priority)}</td>
      <td>$${wo.total.toLocaleString()}</td>
    </tr>
  `).join('');

  // Activity feed
  const feed = document.getElementById('activity-feed');
  feed.innerHTML = ACTIVITIES.map(a => `
    <div class="activity-item">
      <div class="activity-dot" style="background:${a.color}"></div>
      <div>
        <div class="activity-text">${a.text}</div>
        <div class="activity-time">${a.time}</div>
      </div>
    </div>
  `).join('');
}

// ============ RENDER SERVICE LIBRARY ============
function renderServiceLibrary() {
  const grid = document.getElementById('service-grid');
  const filtered = currentFilter === 'All' ? SERVICES : SERVICES.filter(s => s.category === currentFilter);

  grid.innerHTML = filtered.map(s => `
    <div class="service-card" onclick="showServiceDetail(${s.id})">
      <div class="service-card-top">
        <span class="service-category">${s.category}</span>
        <div class="service-price">$${s.price.toLocaleString()}<span>/${s.unit}</span></div>
      </div>
      <div class="service-name">${s.name}</div>
      <div class="service-desc">${s.desc}</div>
      <div class="service-meta">
        <span class="service-tag">🏷️ ${s.sub}</span>
        <span class="service-tag">⏱️ ${s.laborHrs}h</span>
        <span class="negotiable-badge negotiable-${s.negotiable}">${s.negotiable === 'yes' ? '<i data-lucide="check" style="width:12px;height:12px"></i> Negotiable' : s.negotiable === 'no' ? '<i data-lucide="x" style="width:12px;height:12px"></i> Fixed' : '<i data-lucide="help-circle" style="width:12px;height:12px"></i> Ask'}</span>
      </div>
    </div>
  `).join('');

  // Update count
  document.getElementById('service-count').textContent = `${filtered.length} services`;

  // Render filter tabs
  const tabs = document.getElementById('filter-tabs');
  tabs.innerHTML = SERVICE_CATEGORIES.map(c => `
    <div class="filter-tab ${c === currentFilter ? 'active' : ''}" onclick="filterServices('${c}')">${c}</div>
  `).join('');
}

function filterServices(cat) {
  currentFilter = cat;
  renderServiceLibrary();
}

// ============ RENDER WORK ORDERS ============
function renderWorkOrders() {
  const tbody = document.getElementById('wo-table-body');
  tbody.innerHTML = WORK_ORDERS.map(wo => {
    const progress = wo.items > 0 ? Math.round((wo.completed / wo.items) * 100) : 0;
    return `
    <tr onclick="openWorkOrderDetail('${wo.id}')">
      <td><strong class="text-accent">${wo.id}</strong></td>
      <td>
        <div style="font-weight:600;color:var(--text-primary)">${wo.title}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:2px">Type ${wo.type} • ${wo.property}</div>
      </td>
      <td>${wo.client}</td>
      <td><span class="badge badge-${wo.status}">${statusLabel(wo.status)}</span></td>
      <td><span class="priority-dot priority-${wo.priority}"></span> ${capitalize(wo.priority)}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="flex:1;height:4px;background:var(--bg-input);border-radius:2px;min-width:60px">
            <div style="height:100%;width:${progress}%;background:${progress===100?'var(--success)':'var(--accent)'};border-radius:2px"></div>
          </div>
          <span style="font-size:11px;color:var(--text-muted)">${progress}%</span>
        </div>
      </td>
      <td class="fw-700">$${wo.total.toLocaleString()}</td>
    </tr>`;
  }).join('');
  lucide.createIcons();
}

// ============ WORK ORDER DETAIL ============
let currentLineItems = [];

const WO_PHOTOS = {
  'WO-2025-0041': [
    { id: 1, type: 'before', label: 'Existing electrical panel', area: 'Basement', date: 'Apr 15, 2025', icon: 'camera' },
    { id: 2, type: 'after', label: 'Kitchen sink — repair complete', area: 'Kitchen', date: 'Apr 22, 2025', icon: 'check-circle' },
    { id: 3, type: 'before', label: 'Leaking pipe under sink', area: 'Kitchen', date: 'Apr 16, 2025', icon: 'camera' },
    { id: 4, type: 'before', label: 'Old water heater', area: 'Utility Room', date: 'Apr 16, 2025', icon: 'camera' },
    { id: 5, type: 'progress', label: 'Drywall patch in progress', area: 'Kitchen', date: 'Apr 20, 2025', icon: 'hammer' },
    { id: 6, type: 'before', label: 'Missing ceiling fan', area: 'Living Room', date: 'Apr 16, 2025', icon: 'camera' },
    { id: 7, type: 'after', label: 'New ceiling fan installed', area: 'Living Room', date: 'Apr 25, 2025', icon: 'check-circle' },
    { id: 8, type: 'before', label: 'Blocked main drain', area: 'Basement', date: 'Apr 16, 2025', icon: 'camera' },
  ],
  'WO-2025-0043': [
    { id: 1, type: 'before', label: 'Empty commercial shell', area: 'Main Floor', date: 'Apr 10, 2025', icon: 'camera' },
    { id: 2, type: 'progress', label: 'Framing complete', area: 'Main Floor', date: 'Apr 20, 2025', icon: 'hammer' },
    { id: 3, type: 'progress', label: 'HVAC ducting installed', area: 'Ceiling', date: 'Apr 28, 2025', icon: 'hammer' },
  ]
};

const WO_ACTIVITY = {
  'WO-2025-0041': [
    { action: 'Item marked complete', detail: '"Replace GFCI Outlet" — Bathroom', user: 'Rodolfo F.', time: '12 min ago', color: 'var(--success)', icon: 'check-circle' },
    { action: 'Photo uploaded', detail: 'Completion photo for GFCI outlet', user: 'Rodolfo F.', time: '14 min ago', color: 'var(--info)', icon: 'camera' },
    { action: 'Email opened', detail: 'Sarah Johnson viewed Completion Report', user: 'Sarah Johnson', time: '34 min ago', color: 'var(--info)', icon: 'eye' },
    { action: 'Item marked complete', detail: '"Repair Leak Under Sink" — Kitchen', user: 'Rodolfo F.', time: '3 hrs ago', color: 'var(--success)', icon: 'check-circle' },
    { action: 'Change Order sent', detail: 'CO-2025-0012: Add matching kitchen faucet ($280)', user: 'Rodolfo F.', time: 'Yesterday', color: 'var(--warning)', icon: 'file-plus' },
    { action: 'Change Order approved', detail: 'CO-2025-0012 approved by Sarah Johnson via email', user: 'Sarah Johnson', time: 'Yesterday', color: 'var(--success)', icon: 'check-square' },
    { action: 'Email sent', detail: 'Progress Report sent to sarah@remax.com', user: 'System', time: '2 days ago', color: 'var(--info)', icon: 'send' },
    { action: 'Item marked complete', detail: '"Add Circuit Breaker" — Basement', user: 'Mike T. (Sub)', time: '3 days ago', color: 'var(--success)', icon: 'check-circle' },
    { action: 'Work Order assigned', detail: 'Assigned to Mike T. (Electrical Subcontractor)', user: 'Rodolfo F.', time: 'Apr 16, 2025', color: 'var(--purple)', icon: 'user-check' },
    { action: 'Work Order created', detail: 'Type A — Field Inspection | 12 items | $18,500', user: 'Rodolfo F.', time: 'Apr 15, 2025', color: 'var(--accent)', icon: 'clipboard-list' },
  ]
};

function openWorkOrderDetail(woId) {
  const wo = WORK_ORDERS.find(w => w.id === woId);
  if (!wo) return;
  currentWO = wo;

  document.getElementById('wo-detail-id').textContent = wo.id;
  document.getElementById('wo-detail-title').textContent = wo.title;
  document.getElementById('wo-detail-status').innerHTML = `<span class="badge badge-${wo.status}">${statusLabel(wo.status)}</span>`;
  document.getElementById('wo-detail-client').textContent = wo.client;
  document.getElementById('wo-detail-property').textContent = wo.property;
  document.getElementById('wo-detail-type').textContent = `Type ${wo.type}`;
  document.getElementById('wo-detail-priority').innerHTML = `<span class="priority-dot priority-${wo.priority}"></span> ${capitalize(wo.priority)}`;
  document.getElementById('wo-detail-created').textContent = formatDate(wo.created);
  document.getElementById('wo-detail-target').textContent = formatDate(wo.target);

  // Show loading state
  document.getElementById('wo-line-items').innerHTML = '<div style="text-align:center;padding:32px;color:var(--text-muted)"><i data-lucide="loader" style="width:24px;height:24px;animation:spin 1s linear infinite"></i><p>Loading line items...</p></div>';
  try { lucide.createIcons(); } catch(e) {}

  // Load line items from Supabase, fallback to mock
  loadLineItems(wo).then(function() {
    updateWOProgress();
    renderLineItems();
    renderWOPhotos();
    renderWOActivityLog();

    // Tab counts
    const photos = WO_PHOTOS[wo.id] || [];
    document.getElementById('wo-tab-items-count').textContent = `(${currentLineItems.length})`;
    document.getElementById('wo-tab-photos-count').textContent = `(${photos.length})`;
    document.getElementById('photo-count').textContent = `${photos.length} photos`;
    lucide.createIcons();
  });

  // Reset to items tab
  switchWOTab('items');
  navigateTo('wodetail');
  lucide.createIcons();
}

async function loadLineItems(wo) {
  // Try Supabase first
  if (typeof DB !== 'undefined' && isSupabaseReady()) {
    try {
      var dbItems = await DB.lineItems.getByWO(wo.id);
      if (dbItems && dbItems.length > 0) {
        currentLineItems = dbItems;
        // Sync WO counts
        wo.items = currentLineItems.length;
        wo.completed = currentLineItems.filter(i => i.status === 'completed').length;
        wo.total = currentLineItems.reduce((s, i) => s + (i.price * (i.qty || 1)), 0);
        return;
      }
    } catch(e) { console.warn('Failed to load line items from DB:', e); }
  }
  // Fallback: generate from SERVICES mock
  currentLineItems = SERVICES.slice(0, wo.items).map((s, i) => ({
    ...s,
    lineId: i,
    status: i < wo.completed ? 'completed' : (i === wo.completed ? 'progress' : 'pending'),
    qty: 1
  }));
}

function updateWOProgress() {
  if (!currentWO) return;
  var completed = currentLineItems.filter(i => i.status === 'completed').length;
  var total = currentLineItems.length;
  currentWO.completed = completed;
  currentWO.items = total;
  var progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  document.getElementById('wo-detail-progress-bar').innerHTML = `
    <div class="wo-progress">
      <div class="wo-progress-bar">
        <div class="wo-progress-fill" style="width:${progress}%;background:${progress===100?'var(--success)':'var(--accent)'}"></div>
      </div>
      <span class="wo-progress-text" style="color:${progress===100?'var(--success)':'var(--accent)'}">${progress}%</span>
    </div>
    <div style="font-size:11px;color:var(--text-muted);margin-top:4px">${completed}/${total} items complete</div>`;
}

function renderLineItems() {
  const total = currentLineItems.reduce((s, item) => s + (item.price * item.qty), 0);
  document.getElementById('wo-detail-total').textContent = '$' + total.toLocaleString();

  const list = document.getElementById('wo-line-items');
  list.innerHTML = currentLineItems.map((item, i) => {
    const isCompleted = item.status === 'completed';
    return `
    <div class="line-item" style="${isCompleted ? 'opacity:0.7;' : ''}">
      <div class="line-item-number" style="${isCompleted ? 'background:var(--success-bg);color:var(--success)' : ''}">${isCompleted ? '<i data-lucide="check" style="width:16px;height:16px"></i>' : i + 1}</div>
      <div class="line-item-info">
        <h4 style="${isCompleted ? 'text-decoration:line-through;opacity:0.7' : ''}">${item.name}</h4>
        <p>${item.category} • ${item.desc}</p>
      </div>
      <span class="negotiable-badge negotiable-${item.negotiable}">${item.negotiable === 'yes' ? '<i data-lucide="check" style="width:12px;height:12px"></i>' : item.negotiable === 'no' ? '<i data-lucide="x" style="width:12px;height:12px"></i>' : '<i data-lucide="help-circle" style="width:12px;height:12px"></i>'}</span>
      <span class="badge badge-${item.status === 'completed' ? 'completed' : item.status === 'progress' ? 'progress' : 'draft'}">${capitalize(item.status)}</span>
      <div class="line-item-actions">
        ${isCompleted
          ? '<button class="btn-completed-done"><i data-lucide="check-circle" style="width:16px;height:16px"></i> Done</button>'
          : `<button class="btn-complete" onclick="markItemComplete(${i})"><i data-lucide="check" style="width:16px;height:16px"></i> Complete</button>`
        }
      </div>
      <div class="line-item-price">$${(item.price * item.qty).toLocaleString()}</div>
    </div>`;
  }).join('');
  lucide.createIcons();
}

function markItemComplete(index) {
  if (!currentLineItems[index] || currentLineItems[index].status === 'completed') return;
  currentLineItems[index].status = 'completed';
  currentLineItems[index].completedAt = new Date().toISOString();
  currentLineItems[index].completedBy = COMPANY.owner || 'Field Agent';

  // Persist to Supabase
  var item = currentLineItems[index];
  if (typeof DB !== 'undefined' && isSupabaseReady() && item.id && typeof item.id === 'number') {
    DB.lineItems.update(item.id, {
      status: 'completed',
      completedAt: item.completedAt,
      completedBy: item.completedBy
    }).then(function() {
      console.log('✓ Line item marked complete in DB:', item.name);
    }).catch(function(e) { console.warn('Failed to sync line item completion:', e); });
  }

  // Update WO data
  updateWOProgress();

  // Sync WO totals to Supabase
  if (typeof DB !== 'undefined' && isSupabaseReady() && currentWO) {
    DB.workOrders.update(currentWO.id, {
      completed: currentWO.completed,
      items: currentWO.items
    }).catch(function(e) { console.warn('Failed to sync WO progress:', e); });
  }

  renderLineItems();
  renderDashboard();
  renderWorkOrders();
  showToast('✓ Item completed: ' + item.name);
}

function renderWOPhotos() {
  const photos = WO_PHOTOS[currentWO?.id] || [];
  const grid = document.getElementById('wo-photos-grid');
  const countEl = document.getElementById('photo-count');
  if (countEl) countEl.textContent = `${photos.length} photos`;

  if (photos.length === 0) {
    grid.innerHTML = `<div class="empty-state"><div class="icon"><i data-lucide="camera" style="width:48px;height:48px"></i></div><h3>No photos yet</h3><p>Use Field Mode to capture before/after photos on site</p></div>`;
    return;
  }

  grid.innerHTML = photos.map(p => `
    <div class="photo-card">
      <div class="photo-card-img">
        <span class="photo-type photo-type-${p.type}">${p.type}</span>
        <i data-lucide="${p.icon}" style="width:24px;height:24px"></i>
      </div>
      <div class="photo-card-body">
        <h4>${p.label}</h4>
        <p>📍 ${p.area} • ${p.date}</p>
      </div>
    </div>
  `).join('');
  lucide.createIcons();
}

function renderWOActivityLog() {
  const activities = WO_ACTIVITY[currentWO?.id] || generateDefaultActivity();
  const log = document.getElementById('wo-activity-log');

  log.innerHTML = `<div class="timeline">${activities.map(a => `
    <div class="timeline-item">
      <div class="timeline-dot" style="background:${a.color}"><i data-lucide="${a.icon}" style="width:12px;height:12px;color:white"></i></div>
      <div class="timeline-content">
        <div class="timeline-header">
          <span class="timeline-action">${a.action}</span>
          <span class="timeline-time">${a.time}</span>
        </div>
        <div class="timeline-detail">${a.detail}</div>
        <div class="timeline-user">by ${a.user}</div>
      </div>
    </div>
  `).join('')}</div>`;
  lucide.createIcons();
}

function generateDefaultActivity() {
  return [
    { action: 'Work Order created', detail: `Type ${currentWO.type} — ${currentWO.items} items — $${currentWO.total.toLocaleString()}`, user: 'Rodolfo F.', time: formatDate(currentWO.created), color: 'var(--accent)', icon: 'clipboard-list' },
  ];
}

function switchWOTab(tab) {
  document.querySelectorAll('#wo-detail-tabs .wo-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`#wo-detail-tabs .wo-tab[data-tab="${tab}"]`)?.classList.add('active');

  ['items', 'document', 'photos', 'log'].forEach(t => {
    const el = document.getElementById('wo-tab-content-' + t);
    if (el) el.style.display = t === tab ? 'block' : 'none';
  });

  if (tab === 'document') initWODocument();
}

// ============ DOCUMENT BUILDER ============

var _docLines = [];       // [{id, name, desc, rate, qty}]
var _docTemplate = 'classic';
var _docSaveTimer = null;

// ---- Auto-save document state ----
function docSaveState() {
  if (!currentWO) return;
  var state = {
    lines: _docLines.map(function(l) { return {id:l.id,name:l.name,desc:l.desc,rate:l.rate,qty:l.qty}; }),
    template: _docTemplate,
    taxPct: parseFloat(document.getElementById('doc-tax-pct')?.value) || 0,
    ref: document.getElementById('doc-ref')?.value || ''
  };
  try { localStorage.setItem('nexartwo_doc_' + currentWO.id, JSON.stringify(state)); } catch(e) {}
}

function docAutoSave() {
  clearTimeout(_docSaveTimer);
  _docSaveTimer = setTimeout(function() {
    docSaveState();
    showToast('💾 Document saved', 1200);
  }, 800);
}

function docLoadState(woId) {
  try {
    var raw = localStorage.getItem('nexartwo_doc_' + woId);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return null;
}

function initWODocument() {
  if (!currentWO) return;
  var wo = currentWO;
  var client = CLIENTS.find(c => c.name === wo.client) || {};

  // Company header
  var coName = COMPANY.name || 'R.C Art Construction LLC';
  document.getElementById('doc-co-name').textContent = coName;
  document.getElementById('doc-co-phone').textContent = COMPANY.phone || '';
  document.getElementById('doc-co-ccb').textContent = COMPANY.ccb ? 'CCB #' + COMPANY.ccb : '';
  document.getElementById('doc-co-city').textContent =
    [COMPANY.city, COMPANY.state].filter(Boolean).join(', ') || 'Portland, OR';

  // Logo
  var logoArea = document.getElementById('doc-logo-area');
  if (COMPANY.logo_url) {
    logoArea.innerHTML = '<img src="' + COMPANY.logo_url + '" class="doc-logo-img">';
  } else {
    var initials = coName.split(' ').map(w => w[0]).join('').substring(0,3).toUpperCase();
    logoArea.innerHTML = '<div class="doc-logo-initials">' + initials + '</div>';
  }

  // Client info
  document.getElementById('doc-client-name').textContent = client.name || wo.client || '—';
  document.getElementById('doc-client-addr').textContent = client.address || wo.property || '—';

  // Doc meta
  var today = new Date().toLocaleDateString('en-US', {month:'2-digit', day:'2-digit', year:'numeric'});
  document.getElementById('doc-date').textContent = today;
  document.getElementById('doc-wo-num').textContent = wo.id;

  // Load saved state or init from line items
  if (!_docLines._woId || _docLines._woId !== wo.id) {
    var saved = docLoadState(wo.id);
    if (saved && saved.lines && saved.lines.length > 0) {
      _docLines = saved.lines;
      _docTemplate = saved.template || 'classic';
      setDocTemplate(_docTemplate);
      var taxEl = document.getElementById('doc-tax-pct');
      if (taxEl) taxEl.value = saved.taxPct || 0;
      var refEl = document.getElementById('doc-ref');
      if (refEl) refEl.value = saved.ref || '';
    } else {
      _docLines = (currentLineItems || []).map(function(item, i) {
        return {
          id: 'dl-' + i,
          name: item.name || item.service || 'Service',
          desc: item.desc || item.description || '',
          rate: item.price || 0,
          qty: item.qty || 1
        };
      });
    }
    _docLines._woId = wo.id;
  }

  renderDocLines();
  updateDocTotals();
  lucide.createIcons();
}

function renderDocLines() {
  var tbody = document.getElementById('doc-line-tbody');
  if (!tbody) return;

  tbody.innerHTML = _docLines.map(function(line, idx) {
    var lineTotal = (parseFloat(line.rate) || 0) * (parseInt(line.qty) || 1);
    return `
      <tr id="docrow-${line.id}">
        <td class="doc-td-desc">
          <input class="doc-line-name-input"
            value="${escHtml(line.name)}"
            oninput="_docLines[${idx}].name=this.value;docAutoSave()"
            placeholder="Service name">
          <textarea class="doc-line-desc-input"
            placeholder="Add a description (optional)"
            oninput="_docLines[${idx}].desc=this.value;docAutoSave()"
            rows="1">${escHtml(line.desc)}</textarea>
        </td>
        <td class="doc-td-rate">
          <input type="number" class="doc-rate-input"
            value="${parseFloat(line.rate).toFixed(2)}" min="0" step="0.01"
            oninput="_docLines[${idx}].rate=parseFloat(this.value)||0;updateDocTotals();docUpdateLineTotal(${idx});docAutoSave()">
        </td>
        <td class="doc-td-qty">
          <input type="number" class="doc-qty-input"
            value="${line.qty}" min="1"
            oninput="_docLines[${idx}].qty=Math.max(1,parseInt(this.value)||1);updateDocTotals();docUpdateLineTotal(${idx});docAutoSave()">
        </td>
        <td class="doc-td-total" id="doc-lt-${idx}">$${lineTotal.toFixed(2)}</td>
        <td><button class="doc-remove-btn" onclick="docRemoveLine(${idx})" title="Remove">&#x2715;</button></td>
      </tr>`;
  }).join('');
}

// Update only the line total cell without re-rendering everything (avoids cursor jump)
function docUpdateLineTotal(idx) {
  var line = _docLines[idx];
  if (!line) return;
  var total = (parseFloat(line.rate) || 0) * (parseInt(line.qty) || 1);
  var cell = document.getElementById('doc-lt-' + idx);
  if (cell) cell.textContent = '$' + total.toFixed(2);
}

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function updateDocTotals() {
  var subtotal = _docLines.reduce(function(s, line) {
    return s + (parseFloat(line.rate) || 0) * (parseInt(line.qty) || 1);
  }, 0);
  var taxPct = parseFloat(document.getElementById('doc-tax-pct')?.value) || 0;
  var taxAmt = subtotal * taxPct / 100;
  var grand = subtotal + taxAmt;
  var fmt = function(n) { return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,','); };
  document.getElementById('doc-subtotal').textContent = fmt(subtotal);
  document.getElementById('doc-tax-amt').textContent = fmt(taxAmt);
  document.getElementById('doc-grand-total').textContent = fmt(grand);
  docAutoSave();
}

function setDocTemplate(tpl) {
  _docTemplate = tpl;
  var wrap = document.getElementById('wo-document-wrap');
  wrap.className = 'doc-template-' + tpl;
  document.querySelectorAll('.doc-tpl-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.id === 'tpl-btn-' + tpl);
  });
  docAutoSave();
}

function docRemoveLine(idx) {
  _docLines.splice(idx, 1);
  renderDocLines();
  updateDocTotals();
  docAutoSave();
}

// ---- Add Line Modal ----
function docAddLineModal() {
  document.getElementById('docline-search').value = '';
  document.getElementById('docline-name').value = '';
  document.getElementById('docline-rate').value = '';
  document.getElementById('docline-qty').value = '1';
  document.getElementById('docline-desc').value = '';
  document.getElementById('docline-suggestions').style.display = 'none';
  document.getElementById('docline-suggestions').innerHTML = '';
  openModal('modal-doc-addline');
  setTimeout(function() { document.getElementById('docline-search').focus(); }, 200);
}

function doclineSearchServices(query) {
  var box = document.getElementById('docline-suggestions');
  if (!query || query.length < 1) { box.style.display = 'none'; return; }
  var results = SERVICES.filter(function(s) {
    return s.name.toLowerCase().includes(query.toLowerCase()) ||
           (s.category || '').toLowerCase().includes(query.toLowerCase());
  }).slice(0, 8);

  if (results.length === 0) { box.style.display = 'none'; return; }

  box.style.display = 'block';
  box.innerHTML = results.map(function(s) {
    return `<div class="docline-svc-item" onclick="doclinePickService(${s.id})">
      <div>
        <div style="font-weight:600">${escHtml(s.name)}</div>
        <div style="font-size:11px;color:var(--text-muted)">${escHtml(s.category)} &bull; ${escHtml(s.sub||'')}</div>
      </div>
      <span class="docline-svc-price">$${parseFloat(s.price||0).toFixed(2)}</span>
    </div>`;
  }).join('');
}

function doclinePickService(svcId) {
  var svc = SERVICES.find(function(s) { return s.id === svcId; });
  if (!svc) return;
  document.getElementById('docline-name').value = svc.name;
  document.getElementById('docline-rate').value = svc.price || 0;
  document.getElementById('docline-desc').value = svc.desc || '';
  document.getElementById('docline-search').value = svc.name;
  document.getElementById('docline-suggestions').style.display = 'none';
}

function docAddLine() {
  var name = document.getElementById('docline-name').value.trim();
  if (!name) {
    document.getElementById('docline-name').style.borderColor = 'var(--danger)';
    showToast('⚠️ Item name is required');
    return;
  }
  _docLines.push({
    id: 'dl-' + Date.now(),
    name: name,
    desc: document.getElementById('docline-desc').value.trim(),
    rate: parseFloat(document.getElementById('docline-rate').value) || 0,
    qty: Math.max(1, parseInt(document.getElementById('docline-qty').value) || 1)
  });
  renderDocLines();
  updateDocTotals();
  closeModal('modal-doc-addline');
  showToast('✅ Line added to document');
  docAutoSave();
  lucide.createIcons();
}

function printWODocument() {
  window.print();
}

// ---- Inline editable WO Title ----
function startEditWOTitle(el) {
  var current = el.textContent.trim();
  var input = document.createElement('input');
  input.value = current;
  input.style.cssText = 'font-size:18px;font-weight:600;color:var(--text-primary);background:var(--bg-input);border:1.5px solid var(--accent);border-radius:6px;padding:2px 8px;width:360px;max-width:90vw;outline:none;font-family:inherit';
  el.replaceWith(input);
  input.focus();
  input.select();

  function saveTitle() {
    var val = input.value.trim() || current;
    var h2 = document.createElement('h2');
    h2.id = 'wo-detail-title';
    h2.style.cssText = 'font-size:18px;font-weight:600;color:var(--text-secondary);cursor:pointer;border-radius:6px;padding:2px 6px;transition:background 0.15s';
    h2.title = 'Click to edit title';
    h2.onclick = function() { startEditWOTitle(this); };
    h2.textContent = val;
    input.replaceWith(h2);
    if (currentWO && val !== current) {
      currentWO.title = val;
      saveWorkOrders();
      showToast('✅ Title updated');
    }
  }
  input.addEventListener('blur', saveTitle);
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') saveTitle();
    if (e.key === 'Escape') { input.value = current; saveTitle(); }
  });
}


// ============ PDF GENERATION ============
function generatePDF() {
  if (!currentWO) return;
  document.getElementById('pdf-wo-id').textContent = currentWO.id;
  openModal('modal-pdf');
}

function buildPDF(template, hidePrices, docStyle) {
  docStyle = docStyle || 'classic';
  closeModal('modal-pdf');
  closeModal('modal-new-doc');
  const wo = currentWO;
  const client = CLIENTS.find(c => c.name === wo.client) || {};
  const items = currentLineItems || [];
  const progress = wo.items > 0 ? Math.round((wo.completed / wo.items) * 100) : 0;
  const total = items.reduce((s, i) => s + (i.price * (i.qty || 1)), 0);
  const completedItems = items.filter(i => i.status === 'completed');
  const pendingItems = items.filter(i => i.status !== 'completed');
  const photos = WO_PHOTOS[wo.id] || [];
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const templateTitles = {
    completion: 'Work Order Completion Report',
    inspection: 'Property Inspection Report',
    progress: 'Progress Report',
    invoice: 'Invoice / Estimate',
    informative: 'Informative Property Report'
  };

  let bodyContent = '';

  if (template === 'completion' || template === 'inspection' || template === 'informative') {
    bodyContent =
      '<div class="section"><h2>Project Summary</h2>' +
      '<table class="info-table">' +
      '<tr><td class="label">Work Order</td><td>' + wo.id + '</td><td class="label">Status</td><td><span class="status-tag">' + statusLabel(wo.status) + '</span></td></tr>' +
      '<tr><td class="label">Project</td><td>' + wo.title + '</td><td class="label">Type</td><td>Type ' + wo.type + '</td></tr>' +
      '<tr><td class="label">Client</td><td>' + wo.client + '</td><td class="label">Priority</td><td>' + capitalize(wo.priority) + '</td></tr>' +
      '<tr><td class="label">Property</td><td colspan="3">' + wo.property + '</td></tr>' +
      '<tr><td class="label">Created</td><td>' + formatDate(wo.created) + '</td><td class="label">Target</td><td>' + formatDate(wo.target) + '</td></tr>' +
      '</table></div>' +
      '<div class="section"><h2>Progress Overview</h2>' +
      '<div class="progress-section"><div class="progress-bar-pdf"><div class="progress-fill-pdf" style="width:' + progress + '%"></div></div>' +
      '<div class="progress-stats"><div><strong>' + progress + '%</strong> Complete</div><div><strong>' + wo.completed + '</strong> of <strong>' + wo.items + '</strong> items done</div>' +
      '<div>Completed: <strong>' + completedItems.length + '</strong> | Pending: <strong>' + pendingItems.length + '</strong></div></div></div></div>' +
      '<div class="section"><h2>Line Items (' + items.length + ')</h2>' +
      '<table class="items-table"><colgroup><col class="col-num"><col class="col-service"><col class="col-category"><col class="col-status">' +
      (hidePrices ? '' : '<col class="col-price">') + '</colgroup><thead><tr><th>#</th><th>Service</th><th>Category</th><th>Status</th>' + 
      (hidePrices ? '' : '<th class="right">Price</th>') + '</tr></thead><tbody>' +
      items.map(function(item, i) {
        return '<tr class="' + (item.status === 'completed' ? 'completed-row' : '') + '"><td>' + (i+1) + '</td><td><strong>' + item.name + '</strong><br><small>' + item.desc + '</small></td><td>' + item.category + '</td><td><span class="status-' + item.status + '">' + capitalize(item.status) + '</span></td>' +
        (hidePrices ? '' : '<td class="right">$' + (item.price * (item.qty||1)).toLocaleString() + '</td>') + '</tr>';
      }).join('') +
      '</tbody>' + (hidePrices ? '' : '<tfoot><tr><td colspan="4" class="right"><strong>Total</strong></td><td class="right"><strong>$' + total.toLocaleString() + '</strong></td></tr></tfoot>') + '</table></div>';

    if (photos.length > 0) {
      bodyContent += '<div class="section"><h2>Photo Documentation (' + photos.length + ')</h2>' +
        '<table class="items-table"><thead><tr><th>Type</th><th>Description</th><th>Location</th><th>Date</th></tr></thead><tbody>' +
        photos.map(function(p) {
          return '<tr><td><span class="photo-type-tag ' + p.type + '">' + p.type.toUpperCase() + '</span></td><td>' + p.label + '</td><td>' + p.area + '</td><td>' + p.date + '</td></tr>';
        }).join('') + '</tbody></table></div>';
    }
  }

  if (template === 'progress') {
    bodyContent =
      '<div class="section"><h2>Progress Summary</h2>' +
      '<table class="info-table">' +
      '<tr><td class="label">Work Order</td><td>' + wo.id + '</td><td class="label">Report Date</td><td>' + today + '</td></tr>' +
      '<tr><td class="label">Project</td><td>' + wo.title + '</td><td class="label">Client</td><td>' + wo.client + '</td></tr>' +
      '<tr><td class="label">Property</td><td colspan="3">' + wo.property + '</td></tr>' +
      '</table>' +
      '<div class="progress-section" style="margin-top:16px"><div class="progress-bar-pdf"><div class="progress-fill-pdf" style="width:' + progress + '%"></div></div>' +
      '<div class="progress-stats"><div><strong>' + progress + '%</strong> Overall (' + wo.completed + '/' + wo.items + ' items)</div></div></div></div>';

    if (completedItems.length > 0) {
      bodyContent += '<div class="section"><h2>Completed Items (' + completedItems.length + ')</h2>' +
        '<table class="items-table"><thead><tr><th>#</th><th>Service</th><th>Category</th>' + (hidePrices ? '' : '<th class="right">Price</th>') + '</tr></thead><tbody>' +
        completedItems.map(function(item, i) { return '<tr><td>' + (i+1) + '</td><td>' + item.name + '</td><td>' + item.category + '</td>' + (hidePrices ? '' : '<td class="right">$' + item.price.toLocaleString() + '</td>') + '</tr>'; }).join('') +
        '</tbody>' + (hidePrices ? '' : '<tfoot><tr><td colspan="3" class="right"><strong>Completed Value</strong></td><td class="right"><strong>$' + completedItems.reduce(function(s,i){return s+i.price},0).toLocaleString() + '</strong></td></tr></tfoot>') + '</table></div>';
    }
    if (pendingItems.length > 0) {
      bodyContent += '<div class="section"><h2>Remaining Work (' + pendingItems.length + ')</h2>' +
        '<table class="items-table"><thead><tr><th>#</th><th>Service</th><th>Category</th>' + (hidePrices ? '' : '<th class="right">Est. Price</th>') + '</tr></thead><tbody>' +
        pendingItems.map(function(item, i) { return '<tr><td>' + (i+1) + '</td><td>' + item.name + '</td><td>' + item.category + '</td>' + (hidePrices ? '' : '<td class="right">$' + item.price.toLocaleString() + '</td>') + '</tr>'; }).join('') +
        '</tbody>' + (hidePrices ? '' : '<tfoot><tr><td colspan="3" class="right"><strong>Remaining Value</strong></td><td class="right"><strong>$' + pendingItems.reduce(function(s,i){return s+i.price},0).toLocaleString() + '</strong></td></tr></tfoot>') + '</table></div>';
    }
  }

  if (template === 'invoice') {
    var invoiceNum = 'INV-' + wo.id.replace('WO-', '');
    bodyContent =
      '<div class="invoice-header-row"><div><h2 style="margin:0;font-size:28px;color:#f59e0b">INVOICE</h2><p style="color:#666;margin-top:4px">' + invoiceNum + '</p></div>' +
      '<div class="right-align"><table class="info-mini"><tr><td class="label">Invoice Date</td><td>' + today + '</td></tr><tr><td class="label">Due Date</td><td>Net 30</td></tr><tr><td class="label">Work Order</td><td>' + wo.id + '</td></tr></table></div></div>' +
      '<div class="two-col" style="margin-top:20px"><div class="col"><h3 style="color:#888;font-size:11px;text-transform:uppercase;margin-bottom:6px">Bill To</h3><strong>' + wo.client + '</strong><br>' + (client.email || '') + '<br>' + (client.phone || '') + '<br>' + wo.property + '</div>' +
      '<div class="col"><h3 style="color:#888;font-size:11px;text-transform:uppercase;margin-bottom:6px">Project</h3><strong>' + wo.title + '</strong><br>Type ' + wo.type + ' | ' + capitalize(wo.priority) + ' Priority<br>' + wo.property + '</div></div>' +
      '<div class="section" style="margin-top:24px"><table class="items-table"><thead><tr><th>#</th><th>Description</th><th>Qty</th><th class="right">Rate</th><th class="right">Amount</th></tr></thead><tbody>' +
      items.map(function(item, i) {
        return '<tr><td>' + (i+1) + '</td><td><strong>' + item.name + '</strong><br><small>' + item.category + ' - ' + item.desc + '</small></td><td>1</td><td class="right">$' + item.price.toLocaleString() + '</td><td class="right">$' + item.price.toLocaleString() + '</td></tr>';
      }).join('') +
      '</tbody></table>' +
      '<div class="invoice-totals"><div class="total-row"><span>Subtotal</span><span>$' + total.toLocaleString() + '</span></div>' +
      '<div class="total-row"><span>Tax (0%)</span><span>$0</span></div>' +
      '<div class="total-row grand"><span>Total Due</span><span>$' + total.toLocaleString() + '</span></div></div></div>' +
      '<div class="section" style="margin-top:24px;padding:16px;background:#f8f8f8;border-radius:8px"><h3 style="font-size:12px;color:#888;text-transform:uppercase;margin-bottom:8px">Payment Information</h3>' +
      '<p style="font-size:13px">Please make checks payable to <strong>R.C Art Construction LLC</strong></p>' +
      '<p style="font-size:13px">Payment Terms: <strong>Net 30</strong> from invoice date</p></div>';
  }

  var printWindow = window.open('', '_blank');
  printWindow.document.write(getPDFHTML(templateTitles[template], bodyContent, wo, docStyle));
  printWindow.document.close();
  showToast(templateTitles[template] + ' generated');
}

function getPDFHTML(title, body, wo, docStyle) {
  docStyle = docStyle || 'classic';
  var genDate = new Date().toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'});
  var addressLine = (COMPANY.address || '') + (COMPANY.address ? ', ' : '') + (COMPANY.city || 'Portland') + ', ' + (COMPANY.state || 'Oregon');
  
  // Documents use logo_url only (not app_logo_url)
  var logoHtml = '';
  if (COMPANY.logo_url) {
    logoHtml = '<img src="' + COMPANY.logo_url + '" class="company-logo" />';
  } else {
    var initials = (COMPANY.name || 'RC').split(' ').map(function(w){return w[0]}).join('').substring(0,3).toUpperCase();
    logoHtml = '<div class="company-logo-fallback">' + initials + '</div>';
  }

  var headerHTML = '';
  if (docStyle === 'classic') {
    // CLASSIC: Like user's real estimate — logo left, meta table right
    headerHTML =
      '<div class="report-header">' +
        '<div class="header-top">' +
          '<div class="header-logo">' + logoHtml + '</div>' +
          '<div class="header-meta">' +
            '<table class="meta-table">' +
              '<tr><td class="meta-label">' + title.toUpperCase() + '</td><td class="meta-value">#' + wo.id.replace('WO-','') + '</td></tr>' +
              '<tr><td class="meta-label">DATE</td><td class="meta-value">' + genDate + '</td></tr>' +
            '</table>' +
          '</div>' +
        '</div>' +
        '<div class="header-company">' +
          '<h1>' + COMPANY.name + '</h1>' +
          '<p>' + addressLine + '</p>' +
          '<div class="header-contact">' +
            '<p>☎ ' + COMPANY.phone + '</p>' +
            '<p>✉ ' + COMPANY.email + '</p>' +
          '</div>' +
          '<div class="ccb-tag">Oregon CCB License #' + COMPANY.ccb + ' — Active</div>' +
        '</div>' +
      '</div>';
  } else if (docStyle === 'modern') {
    // MODERN: Gradient bar, dark accents, bold branding
    headerHTML =
      '<div class="report-header">' +
        '<div class="header-band"></div>' +
        '<div class="header-top">' +
          '<div class="header-logo">' + logoHtml + '</div>' +
          '<div class="header-meta">' +
            '<h2 class="doc-title">' + title + '</h2>' +
            '<table class="meta-table">' +
              '<tr><td class="meta-label">Document</td><td class="meta-value">' + wo.id + '</td></tr>' +
              '<tr><td class="meta-label">Generated</td><td class="meta-value">' + genDate + '</td></tr>' +
            '</table>' +
            '<div class="ccb-tag">CCB #' + COMPANY.ccb + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="header-company">' +
          '<h1>' + COMPANY.name + '</h1>' +
          '<p>' + addressLine + ' · ' + COMPANY.phone + ' · ' + COMPANY.email + '</p>' +
        '</div>' +
      '</div>';
  } else {
    // EXECUTIVE: Minimal, elegant, letterpress feel
    headerHTML =
      '<div class="report-header">' +
        '<div class="header-top">' +
          '<div class="header-logo">' + logoHtml + '</div>' +
          '<div class="header-meta">' +
            '<p class="doc-label">' + title + '</p>' +
            '<p class="doc-id">' + wo.id + '</p>' +
            '<p class="doc-date">' + genDate + '</p>' +
            '<p class="ccb-line">CCB #' + COMPANY.ccb + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="header-company">' +
          '<h1>' + COMPANY.name + '</h1>' +
          '<p>' + COMPANY.phone + '  ·  ' + COMPANY.email + '  ·  ' + addressLine + '</p>' +
        '</div>' +
      '</div>';
  }

  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + title + ' - ' + wo.id + '</title>' +
  '<style>' + getPDFStylesheet(docStyle) + '</style></head><body>' +
  '<button class="print-btn no-print" onclick="window.print()">Print / Save as PDF</button>' +
  headerHTML + body +
  '<div class="footer"><p>' + COMPANY.name + ' — Oregon CCB #' + COMPANY.ccb + ' — ' + COMPANY.phone + ' — ' + COMPANY.email + '</p>' +
  '<p>Generated by WOIMS · Work Order & Inspection Management System</p>' +
  '<p class="legal">Oregon law requires contractors to be licensed with the Construction Contractors Board (CCB).</p></div>' +
  '</body></html>';
}

function getPDFStylesheet(style) {
  // Shared base
  var base = "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');" +
  "* { margin:0; padding:0; box-sizing:border-box; }" +
  "@media print { body { padding:20px; } .no-print { display:none !important; } }" +
  ".section { margin-bottom:24px; }" +
  ".info-table { width:100%; border-collapse:collapse; table-layout:fixed; }" +
  ".info-table td { padding:6px 10px; font-size:13px; overflow:hidden; text-overflow:ellipsis; }" +
  ".info-table .label { font-weight:600; width:110px; }" +
  ".items-table { width:100%; border-collapse:collapse; margin-top:8px; table-layout:fixed; }" +
  ".items-table td { vertical-align:top; overflow:hidden; word-wrap:break-word; }" +
  ".items-table td small { font-size:11px; }" +
  ".col-num { width:40px; } .col-service { } .col-category { width:110px; } .col-status { width:100px; } .col-price { width:100px; }" +
  ".right { text-align:right; }" +
  ".status-completed { font-weight:600; } .status-progress { font-weight:600; } .status-pending,.status-draft { }" +
  ".progress-section { margin-top:12px; }" +
  ".progress-bar-pdf { height:10px; border-radius:5px; overflow:hidden; }" +
  ".progress-fill-pdf { height:100%; border-radius:5px; }" +
  ".progress-stats { margin-top:8px; display:flex; gap:24px; font-size:13px; }" +
  ".photo-type-tag { padding:2px 8px; border-radius:4px; font-size:10px; font-weight:700; }" +
  ".photo-type-tag.before { background:#dbeafe; color:#1e40af; } .photo-type-tag.after { background:#dcfce7; color:#166534; } .photo-type-tag.issue { background:#fee2e2; color:#991b1b; } .photo-type-tag.progress { background:#fef3c7; color:#92400e; }" +
  ".print-btn { position:fixed; top:20px; right:20px; padding:10px 20px; border:none; border-radius:8px; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit; }" +
  ".print-btn:hover { opacity:0.85; }" +
  ".invoice-header-row { display:flex; justify-content:space-between; align-items:flex-start; }" +
  ".right-align { text-align:right; } .info-mini { border-collapse:collapse; } .info-mini td { padding:3px 8px; font-size:12px; }" +
  ".two-col { display:flex; gap:40px; } .col { flex:1; font-size:13px; line-height:1.7; }" +
  ".invoice-totals { margin-left:auto; width:260px; margin-top:16px; }" +
  ".total-row { display:flex; justify-content:space-between; padding:6px 0; font-size:13px; }" +
  ".company-logo { max-width:500px; max-height:150px; display:block; object-fit:contain; }" +
  ".logo-row { margin-bottom:12px; }" +
  ".header-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; }" +
  ".header-logo { flex-shrink:0; }" +
  ".header-meta { text-align:right; flex-shrink:0; }" +
  ".header-company { margin-bottom:20px; }" +
  ".header-company h1 { font-size:22px; font-weight:800; margin-bottom:4px; }" +
  ".header-company p { font-size:12px; color:#666; margin:0 0 2px; }" +
  ".header-contact { margin:6px 0; }" +
  ".header-contact p { display:inline; margin-right:16px; }" +
  ".meta-table { border-collapse:collapse; border:1px solid #d1d5db; }" +
  ".meta-table td { padding:6px 14px; font-size:12px; border:1px solid #d1d5db; }" +
  ".meta-label { font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#374151; }" +
  ".meta-value { text-align:right; font-weight:600; }" +
  ".company-logo-fallback { width:80px; height:80px; background:linear-gradient(135deg, #f59e0b, #d97706); border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:800; color:#fff; letter-spacing:1px; }";

  if (style === 'modern') {
    return base +
    "body { font-family:'Inter',sans-serif; color:#1a1a1a; background:#fff; padding:0; max-width:900px; margin:0 auto; font-size:13px; line-height:1.6; }" +
    ".report-header { position:relative; margin-bottom:32px; }" +
    ".header-band { height:8px; background:linear-gradient(90deg, #f59e0b 0%, #ef4444 50%, #8b5cf6 100%); }" +
    ".header-top { padding:24px 40px 16px; }" +
    ".header-company { padding:0 40px 20px; border-bottom:1px solid #e5e7eb; }" +
    ".header-company h1 { font-size:24px; font-weight:800; color:#111827; letter-spacing:-0.5px; }" +
    ".header-company p { font-size:12px; color:#6b7280; }" +
    ".company-logo { max-height:120px; max-width:350px; }" +
    ".doc-title { font-size:20px; font-weight:800; color:#111827; margin:0 0 6px; }" +
    ".meta-table { border:2px solid #111827; } .meta-table td { border-color:#111827; color:#111827; }" +
    ".ccb-tag { display:inline-block; margin-top:8px; background:#111827; color:#f59e0b; padding:4px 12px; border-radius:20px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px; }" +
    ".section { padding:0 40px; }" +
    ".section h2 { font-size:13px; font-weight:700; color:#111827; text-transform:uppercase; letter-spacing:1px; border-bottom:2px solid #111827; padding-bottom:8px; margin-bottom:14px; }" +
    ".info-table td { border-bottom:1px solid #f3f4f6; }" +
    ".info-table .label { color:#6b7280; }" +
    ".items-table th { text-align:left; padding:12px; font-size:11px; text-transform:uppercase; letter-spacing:0.8px; color:#fff; background:#111827; border:none; }" +
    ".items-table td { padding:10px 12px; border-bottom:1px solid #f3f4f6; }" +
    ".items-table td small { color:#9ca3af; }" +
    ".items-table tfoot td { border-top:2px solid #111827; font-size:14px; font-weight:700; }" +
    ".completed-row { background:#f0fdf4; } .completed-row td { color:#166534; }" +
    ".status-completed { color:#059669; } .status-progress { color:#d97706; } .status-pending,.status-draft { color:#6b7280; }" +
    ".status-tag { background:#fef3c7; color:#92400e; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:600; }" +
    ".progress-bar-pdf { background:#e5e7eb; }" +
    ".progress-fill-pdf { background:linear-gradient(90deg, #f59e0b, #ef4444); }" +
    ".progress-stats { color:#4b5563; }" +
    ".footer { margin:40px 40px 0; padding-top:16px; border-top:2px solid #111827; text-align:center; color:#9ca3af; font-size:11px; }" +
    ".footer .legal { margin-top:8px; font-size:10px; color:#d1d5db; }" +
    ".print-btn { background:#111827; color:#f59e0b; box-shadow:0 4px 12px rgba(0,0,0,0.2); }" +
    ".info-mini .label { color:#888; font-weight:600; text-align:right; }" +
    ".total-row { border-bottom:1px solid #f3f4f6; }" +
    ".total-row.grand { border-top:2px solid #111827; border-bottom:none; font-size:18px; font-weight:800; padding-top:10px; color:#111827; }";
  }

  if (style === 'executive') {
    return base +
    "body { font-family:'Inter',sans-serif; color:#374151; background:#fff; padding:48px 56px; max-width:900px; margin:0 auto; font-size:13px; line-height:1.7; }" +
    ".report-header { padding-bottom:28px; margin-bottom:32px; border-bottom:1px solid #e5e7eb; }" +
    ".header-company h1 { font-size:20px; font-weight:300; color:#111827; letter-spacing:2px; text-transform:uppercase; }" +
    ".header-company p { font-size:11px; color:#9ca3af; letter-spacing:0.5px; }" +
    ".company-logo { max-height:100px; max-width:280px; }" +
    ".header-meta .doc-label { font-size:11px; text-transform:uppercase; letter-spacing:2px; color:#9ca3af; font-weight:500; margin:0; }" +
    ".header-meta .doc-id { font-size:18px; font-weight:700; color:#111827; margin:2px 0; }" +
    ".header-meta p { font-size:12px; color:#9ca3af; margin:0; }" +
    ".header-meta .ccb-line { margin-top:6px; font-size:10px; color:#d1d5db; letter-spacing:1px; text-transform:uppercase; }" +
    ".ccb-tag { display:none; }" +
    ".section h2 { font-size:11px; font-weight:500; color:#9ca3af; text-transform:uppercase; letter-spacing:2px; border-bottom:none; padding-bottom:4px; margin-bottom:16px; }" +
    ".info-table td { border-bottom:1px solid #f9fafb; padding:5px 10px; color:#4b5563; }" +
    ".info-table .label { color:#9ca3af; font-weight:500; }" +
    ".items-table th { text-align:left; padding:10px 12px; font-size:10px; text-transform:uppercase; letter-spacing:1.5px; color:#9ca3af; font-weight:500; border-bottom:1px solid #e5e7eb; background:transparent; }" +
    ".items-table td { padding:10px 12px; border-bottom:1px solid #f9fafb; color:#374151; }" +
    ".items-table td small { color:#d1d5db; }" +
    ".items-table tfoot td { border-top:1px solid #e5e7eb; font-size:14px; color:#111827; }" +
    ".completed-row { background:transparent; } .completed-row td { color:#059669; }" +
    ".status-completed { color:#059669; } .status-progress { color:#d97706; } .status-pending,.status-draft { color:#d1d5db; }" +
    ".status-tag { background:#f9fafb; color:#6b7280; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:500; }" +
    ".progress-bar-pdf { background:#f3f4f6; }" +
    ".progress-fill-pdf { background:#111827; }" +
    ".progress-stats { color:#6b7280; }" +
    ".footer { margin-top:48px; padding-top:20px; border-top:1px solid #f3f4f6; text-align:center; color:#d1d5db; font-size:10px; letter-spacing:0.5px; }" +
    ".footer .legal { margin-top:6px; font-size:9px; color:#e5e7eb; }" +
    ".print-btn { background:#111827; color:#fff; box-shadow:0 2px 8px rgba(0,0,0,0.1); }" +
    ".info-mini .label { color:#9ca3af; font-weight:500; text-align:right; }" +
    ".total-row { border-bottom:1px solid #f9fafb; color:#6b7280; }" +
    ".total-row.grand { border-top:1px solid #111827; border-bottom:none; font-size:18px; font-weight:700; padding-top:10px; color:#111827; }";
  }

  // Classic (default)
  return base +
  "body { font-family:'Inter',sans-serif; color:#1a1a1a; background:#fff; padding:40px; max-width:900px; margin:0 auto; font-size:13px; line-height:1.6; }" +
  ".report-header { border-bottom:3px solid #f59e0b; padding-bottom:20px; margin-bottom:28px; }" +
  ".ccb-tag { background:#f0fdf4; color:#166534; border:1px solid #bbf7d0; padding:4px 10px; border-radius:4px; font-size:11px; font-weight:600; display:inline-block; margin-top:6px; }" +
  ".meta-table { float:right; }" +
  ".meta-table .meta-label { background:#f9fafb; }" +
  ".section h2 { font-size:14px; font-weight:700; color:#1a1a1a; border-bottom:1px solid #e5e7eb; padding-bottom:6px; margin-bottom:12px; }" +
  ".info-table td { border-bottom:1px solid #f3f4f6; }" +
  ".info-table .label { color:#6b7280; }" +
  ".items-table th { text-align:left; padding:10px 12px; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; color:#6b7280; border-bottom:2px solid #e5e7eb; background:#f9fafb; }" +
  ".items-table td { padding:10px 12px; border-bottom:1px solid #f3f4f6; }" +
  ".items-table td small { color:#9ca3af; }" +
  ".items-table tfoot td { border-top:2px solid #e5e7eb; font-size:14px; }" +
  ".completed-row { background:#f0fdf4; } .completed-row td { color:#166534; }" +
  ".status-completed { color:#166534; } .status-progress { color:#d97706; } .status-pending,.status-draft { color:#6b7280; }" +
  ".status-tag { background:#fef3c7; color:#92400e; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:600; }" +
  ".progress-bar-pdf { background:#f3f4f6; }" +
  ".progress-fill-pdf { background:#f59e0b; }" +
  ".progress-stats { color:#4b5563; }" +
  ".footer { margin-top:40px; padding-top:16px; border-top:1px solid #e5e7eb; text-align:center; color:#9ca3af; font-size:11px; }" +
  ".footer .legal { margin-top:8px; font-size:10px; color:#d1d5db; }" +
  ".print-btn { background:#f59e0b; color:#000; box-shadow:0 4px 12px rgba(245,158,11,0.3); }" +
  ".info-mini .label { color:#888; font-weight:600; text-align:right; }" +
  ".total-row { border-bottom:1px solid #f3f4f6; }" +
  ".total-row.grand { border-top:2px solid #1a1a1a; border-bottom:none; font-size:18px; font-weight:800; padding-top:10px; color:#f59e0b; }";
}

// ============ EMAIL COMPOSER ============
function sendEmail() {
  if (!currentWO) return;
  var client = CLIENTS.find(function(c) { return c.name === currentWO.client; }) || {};
  var progress = currentWO.items > 0 ? Math.round((currentWO.completed / currentWO.items) * 100) : 0;

  document.getElementById('email-to').value = client.email || '';
  document.getElementById('email-cc').value = COMPANY.email;
  document.getElementById('email-subject').value = currentWO.id + ' - ' + currentWO.title + ' - Update from R.C Art Construction';
  document.getElementById('email-body').value =
    'Dear ' + currentWO.client + ',\n\n' +
    'Thank you for choosing R.C Art Construction LLC for your project.\n\n' +
    'Project: ' + currentWO.title + '\n' +
    'Work Order: ' + currentWO.id + '\n' +
    'Property: ' + currentWO.property + '\n' +
    'Status: ' + statusLabel(currentWO.status) + '\n' +
    'Progress: ' + progress + '% complete (' + currentWO.completed + '/' + currentWO.items + ' items)\n\n' +
    'Please find the attached report for your review. If you have any questions, please don\'t hesitate to contact us.\n\n' +
    'Best regards,\n' +
    'Rodolfo Fernandez Romero\n' +
    'R.C Art Construction LLC\n' +
    COMPANY.phone + '\n' +
    'Oregon CCB #' + COMPANY.ccb;

  updateEmailPreview();
  openModal('modal-email');
}

function updateEmailPreview() {
  var to = document.getElementById('email-to').value || '-';
  var subject = document.getElementById('email-subject').value || '-';
  var body = document.getElementById('email-body').value || '';
  var preview = body.substring(0, 200).replace(/\n/g, '<br>');
  document.getElementById('email-preview').innerHTML =
    '<strong>To:</strong> ' + to + '<br><strong>Subject:</strong> ' + subject + '<br><br>' + preview + (body.length > 200 ? '...' : '');
}

function previewEmailPDF() {
  var attach = document.getElementById('email-attach').value;
  if (attach === 'none') { alert('No report selected'); return; }
  buildPDF(attach);
}

function sendEmailNow() {
  var to = document.getElementById('email-to').value;
  var cc = document.getElementById('email-cc').value;
  var subject = document.getElementById('email-subject').value;
  var body = document.getElementById('email-body').value;
  var attach = document.getElementById('email-attach').value;

  if (!to || !subject) { alert('Please fill in To and Subject fields'); return; }

  var mailto = 'mailto:' + encodeURIComponent(to) + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  if (cc) mailto += '&cc=' + encodeURIComponent(cc);

  if (attach && attach !== 'none') { buildPDF(attach); }

  window.location.href = mailto;
  closeModal('modal-email');
  showToast('Email opened in your mail client');
}

// ============ TOAST NOTIFICATIONS ============
function showToast(message) {
  var existing = document.querySelector('.toast');
  if (existing) existing.remove();
  var toast = document.createElement('div');
  toast.className = 'toast success';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(function() { toast.remove(); }, 4000);
}

function addLineItem() {
  // Store WO context so we can return
  var banner = document.getElementById('services-back-to-wo');
  var woLabel = document.getElementById('services-back-wo-id');
  if (banner && currentWO) {
    banner.style.display = 'flex';
    woLabel.textContent = currentWO.id + ' - ' + currentWO.title;
    // Mark that we're in "add to WO" mode
    window._addingToWO = true;
  }
  navigateTo('services');
}

// Called when user clicks a service while in "add to WO" mode
function addServiceToCurrentWO(serviceId) {
  if (!currentWO) return;
  var svc = SERVICES.find(function(s) { return s.id === serviceId; });
  if (!svc) return;

  var newItem = {
    workOrderId: currentWO.id,
    serviceId: svc.id,
    name: svc.name,
    nameEs: svc.nameEs || '',
    desc: svc.desc || '',
    category: svc.category || '',
    sub: svc.sub || '',
    price: svc.price || 0,
    qty: 1,
    unit: svc.unit || 'each',
    negotiable: svc.negotiable || 'yes',
    laborHrs: svc.laborHrs || 1,
    status: 'pending',
    sortOrder: currentLineItems.length
  };

  // Add to local array immediately
  currentLineItems.push(newItem);
  currentWO.items = currentLineItems.length;
  currentWO.total = currentLineItems.reduce(function(s, i) { return s + (i.price * (i.qty || 1)); }, 0);

  // Persist to Supabase
  if (typeof DB !== 'undefined' && isSupabaseReady()) {
    DB.lineItems.create(newItem).then(function(created) {
      if (created) {
        // Update local item with DB id
        newItem.id = created.id;
        console.log('✓ Line item added to DB:', svc.name);
      }
      // Also update WO totals
      DB.workOrders.update(currentWO.id, {
        items: currentWO.items,
        total: currentWO.total
      }).catch(function(e) { console.warn('WO sync failed:', e); });
    }).catch(function(e) { console.warn('Failed to persist line item:', e); });
  }

  showToast('✓ Added: ' + svc.name + ' to ' + currentWO.id);
}

function returnToWODetail() {
  var banner = document.getElementById('services-back-to-wo');
  if (banner) banner.style.display = 'none';
  window._addingToWO = false;
  if (currentWO) {
    openWorkOrderDetail(currentWO.id);
  } else {
    navigateTo('workorders');
  }
}
function uploadPhoto() { alert('Upload Photo feature coming in Phase 2'); }

// ============ WO TITLE AUTOCOMPLETE ============
function onWOTitleInput(val) {
  const dropdown = document.getElementById('wo-title-suggestions');
  if (!val || val.length < 1) {
    dropdown.style.display = 'none';
    return;
  }

  const query = val.toLowerCase();
  const matches = SERVICES.filter(s =>
    s.name.toLowerCase().includes(query) ||
    s.category.toLowerCase().includes(query) ||
    (s.nameEs && s.nameEs.toLowerCase().includes(query)) ||
    (s.desc && s.desc.toLowerCase().includes(query))
  ).slice(0, 8);

  if (matches.length === 0) {
    dropdown.innerHTML = '<div class="autocomplete-new" onclick="closeWOAutocomplete()"><i data-lucide="plus" style="width:14px;height:14px"></i> Use custom title: <strong>' + escapeHtml(val) + '</strong></div>';
    dropdown.style.display = 'block';
    lucide.createIcons();
    return;
  }

  dropdown.innerHTML = matches.map(s =>
    '<div class="autocomplete-item" onclick="selectWOService(' + s.id + ')">' +
      '<div style="flex:1;min-width:0">' +
        '<div class="ac-name">' + highlightMatch(s.name, query) + '</div>' +
        '<div class="ac-meta">' + s.desc + '</div>' +
      '</div>' +
      '<span class="ac-category">' + s.category + '</span>' +
    '</div>'
  ).join('') +
  '<div class="autocomplete-new" onclick="closeWOAutocomplete()"><i data-lucide="plus" style="width:14px;height:14px"></i> Use custom title: <strong>' + escapeHtml(val) + '</strong></div>';

  dropdown.style.display = 'block';
  lucide.createIcons();
}

function selectWOService(serviceId) {
  const service = SERVICES.find(s => s.id === serviceId);
  if (!service) return;
  document.getElementById('new-wo-title').value = service.name;
  closeWOAutocomplete();
}

function closeWOAutocomplete() {
  document.getElementById('wo-title-suggestions').style.display = 'none';
}

function highlightMatch(text, query) {
  const idx = text.toLowerCase().indexOf(query);
  if (idx === -1) return text;
  return text.substring(0, idx) + '<mark style="background:var(--warning-bg);padding:0 1px;border-radius:2px">' + text.substring(idx, idx + query.length) + '</mark>' + text.substring(idx + query.length);
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Close autocomplete when clicking outside
document.addEventListener('click', function(e) {
  const dropdown = document.getElementById('wo-title-suggestions');
  const input = document.getElementById('new-wo-title');
  if (dropdown && input && !dropdown.contains(e.target) && e.target !== input) {
    dropdown.style.display = 'none';
  }
});

// ============ DOCUMENTS MODULE ============
var currentDocStyle = 'classic';

function openNewDocModal() {
  const woSelect = document.getElementById('new-doc-wo');
  if (woSelect) {
    woSelect.innerHTML = '<option value="">Select Work Order...</option>' + 
      WORK_ORDERS.map(w => `<option value="${w.id}">${w.id} - ${w.title}</option>`).join('');
  }
  
  // Attach event listener for "Informative" template to auto-check "Hide Prices"
  const templateSelect = document.getElementById('new-doc-template');
  const hidePricesCheckbox = document.getElementById('new-doc-hide-prices');
  if (templateSelect && hidePricesCheckbox) {
    templateSelect.onchange = function(e) {
      if (e.target.value === 'informative') {
        hidePricesCheckbox.checked = true;
      }
      updateDocPreview();
    };
  }
  
  // Reset preview
  document.getElementById('doc-preview-placeholder').style.display = '';
  currentDocStyle = 'classic';
  document.querySelectorAll('.doc-style-card').forEach(c => c.classList.remove('active'));
  document.querySelector('.doc-style-card[data-style="classic"]').classList.add('active');
  
  openModal('modal-new-doc');
  lucide.createIcons();
}

function selectDocStyle(style) {
  currentDocStyle = style;
  document.querySelectorAll('.doc-style-card').forEach(c => c.classList.remove('active'));
  document.querySelector('.doc-style-card[data-style="' + style + '"]').classList.add('active');
  updateDocPreview();
}

function updateDocPreview() {
  const woId = document.getElementById('new-doc-wo').value;
  const template = document.getElementById('new-doc-template').value;
  const hidePrices = document.getElementById('new-doc-hide-prices').checked;
  
  if (!woId) {
    document.getElementById('doc-preview-placeholder').style.display = '';
    return;
  }
  document.getElementById('doc-preview-placeholder').style.display = 'none';
  
  // Generate preview HTML using existing buildPDF logic
  var wo = WORK_ORDERS.find(w => w.id === woId);
  if (!wo) return;
  
  // Use real line items if available for this WO, else generate mock
  var items;
  if (currentWO && currentWO.id === woId && currentLineItems.length > 0) {
    items = currentLineItems;
  } else {
    items = SERVICES.slice(0, wo.items).map((s, i) => ({
      ...s, lineId: i,
      status: i < wo.completed ? 'completed' : (i === wo.completed ? 'progress' : 'draft'),
      qty: 1
    }));
  }
  var total = items.reduce((s, i) => s + (i.price * (i.qty||1)), 0);
  var progress = Math.round((wo.completed / wo.items) * 100);
  var completedItems = items.filter(i => i.status === 'completed');
  var pendingItems = items.filter(i => i.status !== 'completed');
  var client = CLIENTS.find(c => c.name === wo.client) || {};
  var today = new Date().toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'});

  var templateTitles = {completion:'Completion Report',inspection:'Inspection Report',informative:'Informative Property Report',progress:'Progress Report',invoice:'Invoice / Estimate'};
  var bodyContent = '';

  // Simplified preview body
  if (template === 'completion' || template === 'inspection' || template === 'informative') {
    bodyContent =
      '<div class="section"><h2>Work Order Details</h2><table class="info-table">' +
      '<tr><td class="label">WO #</td><td>' + wo.id + '</td><td class="label">Client</td><td>' + wo.client + '</td></tr>' +
      '<tr><td class="label">Project</td><td>' + wo.title + '</td><td class="label">Status</td><td>' + capitalize(wo.status) + '</td></tr>' +
      '<tr><td class="label">Property</td><td colspan="3">' + wo.property + '</td></tr></table></div>' +
      '<div class="section"><h2>Line Items (' + items.length + ')</h2>' +
      '<table class="items-table"><colgroup><col class="col-num"><col class="col-service"><col class="col-category"><col class="col-status">' +
      (hidePrices ? '' : '<col class="col-price">') + '</colgroup><thead><tr><th>#</th><th>Service</th><th>Category</th><th>Status</th>' +
      (hidePrices ? '' : '<th class="right">Price</th>') + '</tr></thead><tbody>' +
      items.slice(0, 5).map(function(item, i) {
        return '<tr class="' + (item.status==='completed'?'completed-row':'') + '"><td>' + (i+1) + '</td><td><strong>' + item.name + '</strong></td><td>' + item.category + '</td><td><span class="status-' + item.status + '">' + capitalize(item.status) + '</span></td>' +
        (hidePrices ? '' : '<td class="right">$' + (item.price*(item.qty||1)).toLocaleString() + '</td>') + '</tr>';
      }).join('') +
      (items.length > 5 ? '<tr><td colspan="' + (hidePrices?4:5) + '" style="text-align:center;color:#9ca3af;font-style:italic">... and ' + (items.length-5) + ' more items</td></tr>' : '') +
      '</tbody>' + (hidePrices ? '' : '<tfoot><tr><td colspan="4" class="right"><strong>Total</strong></td><td class="right"><strong>$' + total.toLocaleString() + '</strong></td></tr></tfoot>') + '</table></div>';
  } else if (template === 'progress') {
    bodyContent =
      '<div class="section"><h2>Progress Summary</h2><table class="info-table"><tr><td class="label">Project</td><td>' + wo.title + '</td><td class="label">Client</td><td>' + wo.client + '</td></tr></table>' +
      '<div class="progress-section" style="margin-top:16px"><div class="progress-bar-pdf"><div class="progress-fill-pdf" style="width:' + progress + '%"></div></div>' +
      '<div class="progress-stats"><div><strong>' + progress + '%</strong> Complete (' + wo.completed + '/' + wo.items + ')</div></div></div></div>';
  } else if (template === 'invoice') {
    bodyContent =
      '<div class="invoice-header-row"><div><h2 style="margin:0;font-size:28px;color:#f59e0b">INVOICE</h2><p style="color:#666;margin-top:4px">INV-' + wo.id.replace('WO-','') + '</p></div>' +
      '<div class="right-align"><table class="info-mini"><tr><td class="label">Date</td><td>' + today + '</td></tr><tr><td class="label">Due</td><td>Net 30</td></tr></table></div></div>' +
      '<div class="section" style="margin-top:24px"><table class="items-table"><thead><tr><th>#</th><th>Description</th><th>Qty</th><th class="right">Rate</th><th class="right">Amount</th></tr></thead><tbody>' +
      items.slice(0,4).map(function(item,i) { return '<tr><td>'+(i+1)+'</td><td><strong>'+item.name+'</strong></td><td>1</td><td class="right">$'+item.price.toLocaleString()+'</td><td class="right">$'+item.price.toLocaleString()+'</td></tr>'; }).join('') +
      '</tbody></table>' +
      '<div class="invoice-totals"><div class="total-row"><span>Subtotal</span><span>$' + total.toLocaleString() + '</span></div><div class="total-row grand"><span>Total Due</span><span>$' + total.toLocaleString() + '</span></div></div></div>';
  }

  var html = getPDFHTML(templateTitles[template] || 'Document', bodyContent, wo, currentDocStyle);
  
  var iframe = document.getElementById('doc-preview-iframe');
  var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  iframeDoc.open();
  iframeDoc.write(html.replace('<button class="print-btn no-print" onclick="window.print()">Print / Save as PDF</button>', ''));
  iframeDoc.close();
}

function createDocument() {
  const woId = document.getElementById('new-doc-wo').value;
  const template = document.getElementById('new-doc-template').value;
  const hidePrices = document.getElementById('new-doc-hide-prices').checked;
  
  if (!woId || !template) {
    alert("Please select a Work Order and a Template.");
    return;
  }
  
  currentWO = WORK_ORDERS.find(w => w.id === woId);
  // Use real line items if loaded, else generate mock
  if (!currentLineItems.length || currentWO.id !== woId) {
    currentLineItems = SERVICES.slice(0, currentWO.items).map((s, i) => ({
      ...s,
      lineId: i,
      status: i < currentWO.completed ? 'completed' : (i === currentWO.completed ? 'progress' : 'draft'),
      qty: 1
    }));
  }
  
  buildPDF(template, hidePrices, currentDocStyle);
  closeModal('modal-new-doc');
}

// ============ MODALS ============
function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

function openNewWOModal(preselectedClient) {
  // Populate client dropdown from CLIENTS array (always fresh)
  var sel = document.getElementById('new-wo-client');
  sel.innerHTML = '<option value="">Select client...</option>';

  CLIENTS.forEach(function(c) {
    var opt = document.createElement('option');
    opt.value = c.name;
    opt.textContent = c.name + (c.company ? ' — ' + c.company : '');
    sel.appendChild(opt);
  });

  // Add quick "New Client" shortcut at bottom
  var newOpt = document.createElement('option');
  newOpt.value = '__new__';
  newOpt.textContent = '＋ Agregar nuevo cliente...';
  sel.appendChild(newOpt);

  // Pre-select client if coming from client page
  if (preselectedClient) sel.value = preselectedClient;

  // Handle 'new client' shortcut
  sel.onchange = function() {
    if (sel.value === '__new__') {
      sel.value = '';
      closeModal('modal-new-wo');
      openNewClientModal();
    }
  };

  openModal('modal-new-wo');
}

// Called from Clients page — opens WO modal with client already selected
function createWOForClient(clientId) {
  var client = CLIENTS.find(function(c) { return c.id === clientId; });
  if (!client) return;
  openNewWOModal(client.name);
}
function openNewServiceModal() { openModal('modal-new-service'); }


function saveNewWO() {
  const titleEl = document.getElementById('new-wo-title');
  const clientEl = document.getElementById('new-wo-client');
  const title = titleEl.value.trim();
  const client = clientEl.value;

  // Inline validation — highlight missing fields
  var valid = true;
  if (!title) {
    titleEl.style.borderColor = 'var(--danger)';
    titleEl.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.12)';
    titleEl.focus();
    showToast('⚠️ Work Order Title is required');
    valid = false;
  } else {
    titleEl.style.borderColor = '';
    titleEl.style.boxShadow = '';
  }
  if (!client) {
    clientEl.style.borderColor = 'var(--danger)';
    clientEl.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.12)';
    if (valid) { clientEl.focus(); showToast('⚠️ Please select a Client'); }
    valid = false;
  } else {
    clientEl.style.borderColor = '';
    clientEl.style.boxShadow = '';
  }
  if (!valid) return;

  const newWO = {
    id: `WO-${new Date().getFullYear()}-${String(WORK_ORDERS.length + 41).padStart(4, '0')}`,
    title, client,
    clientId: CLIENTS.find(c => c.name === client)?.id || 1,
    property: document.getElementById('new-wo-property').value || 'TBD',
    type: document.getElementById('new-wo-type').value || 'A',
    status: 'draft',
    priority: document.getElementById('new-wo-priority').value || 'medium',
    created: new Date().toISOString().split('T')[0],
    target: document.getElementById('new-wo-target').value || '',
    items: 0, total: 0, completed: 0
  };
  WORK_ORDERS.unshift(newWO);
  saveWorkOrders();
  if (typeof DB !== 'undefined' && isSupabaseReady()) {
    DB.workOrders.create(newWO).catch(function(e) { console.warn('Cloud sync WO failed:', e); });
  }
  renderWorkOrders();
  renderDashboard();
  closeModal('modal-new-wo');
  // Reset form
  titleEl.value = '';
  clientEl.value = '';
  showToast('✅ Work Order ' + newWO.id + ' created');
  navigateTo('workorders');
}

function saveNewService() {
  const name = document.getElementById('new-svc-name').value;
  const price = parseFloat(document.getElementById('new-svc-price').value);
  if (!name || isNaN(price)) { alert('Please fill required fields'); return; }

  var svcData = {
    id: SERVICES.length + 1,
    name,
    nameEs: document.getElementById('new-svc-name-es').value || name,
    category: document.getElementById('new-svc-category').value || 'General Repairs',
    sub: document.getElementById('new-svc-sub').value || 'General',
    price,
    unit: document.getElementById('new-svc-unit').value || 'each',
    desc: document.getElementById('new-svc-desc').value || '',
    negotiable: document.getElementById('new-svc-negotiable').value || 'yes',
    laborHrs: parseFloat(document.getElementById('new-svc-labor').value) || 1,
  };
  SERVICES.push(svcData);
  renderServiceLibrary();
  saveServices();
  // Sync to Supabase
  if (typeof DB !== 'undefined' && isSupabaseReady()) {
    DB.services.create(svcData).catch(function(e) { console.warn('Cloud sync service failed:', e); });
  }
  closeModal('modal-new-service');
  document.getElementById('new-svc-name').value = '';
  document.getElementById('new-svc-price').value = '';
}

// ============ HELPERS ============
function statusLabel(s) {
  const labels = { draft: 'Draft', open: 'Open', progress: 'In Progress', review: 'Pending Review', completed: 'Completed', cancelled: 'Cancelled' };
  return labels[s] || s;
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function formatDate(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function showServiceDetail(id) {
  const s = SERVICES.find(sv => sv.id === id);
  if (!s) return;
  
  // If we're in "add to WO" mode, add it directly
  if (window._addingToWO && currentWO) {
    addServiceToCurrentWO(id);
    return;
  }
  
  alert(`${s.name}\n${s.nameEs}\n\nCategory: ${s.category} > ${s.sub}\nPrice: $${s.price}/${s.unit}\nLabor: ${s.laborHrs}h\nNegotiable: ${s.negotiable}\n\n${s.desc}`);
}

// ============ RENDER CLIENTS ============
function renderClients() {
  const tbody = document.getElementById('clients-table-body');
  const filtered = currentClientFilter === 'All' ? CLIENTS : CLIENTS.filter(c => c.type === currentClientFilter);

  tbody.innerHTML = filtered.map(c => {
    const typeColors = {
      'Residential': 'info',
      'Commercial': 'purple',
      'Real Estate / Investor': 'accent',
      'Company / Corporation': 'success'
    };
    const color = typeColors[c.type] || 'info';
    return `
    <tr id="client-row-${c.id}">
      <td style="padding-left:16px;width:40px">
        <input type="checkbox" class="client-chk" data-id="${c.id}" onchange="clientsUpdateBulkBar()"
          style="width:15px;height:15px;cursor:pointer;accent-color:var(--accent)">
      </td>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:36px;height:36px;border-radius:8px;background:var(--${color}-bg);color:var(--${color === 'accent' ? 'accent' : color});display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0">${c.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
          <div>
            <div style="font-weight:600;color:var(--text-primary)">${c.name}</div>
            <div style="font-size:11px;color:var(--text-muted)">${c.email}</div>
          </div>
        </div>
      </td>
      <td><span class="badge badge-${color === 'accent' ? 'progress' : color === 'success' ? 'completed' : color === 'purple' ? 'review' : 'open'}">${c.type}</span></td>
      <td style="font-size:12px;color:var(--text-secondary)">${c.phone}</td>
      <td style="text-align:center;font-weight:600">${c.properties}</td>
      <td style="text-align:center">${c.totalOrders}</td>
      <td class="fw-700">$${c.totalValue.toLocaleString()}</td>
      <td style="position:relative">
        <button class="btn btn-sm btn-ghost" onclick="toggleClientMenu(event,${c.id})" title="More actions"
          style="padding:6px 8px;border-radius:8px">
          <i data-lucide="more-horizontal" style="width:16px;height:16px"></i>
        </button>
        <div class="client-action-menu" id="cam-${c.id}" style="display:none">
          <div class="cam-item" onclick="createWOForClient(${c.id});closeAllClientMenus()">
            <i data-lucide="file-plus" style="width:15px;height:15px"></i> New Work Order
          </div>
          <div class="cam-item" onclick="viewClientOrders(${c.id});closeAllClientMenus()">
            <i data-lucide="clipboard-list" style="width:15px;height:15px"></i> View Orders
          </div>
          <div class="cam-item" onclick="editClient(${c.id});closeAllClientMenus()">
            <i data-lucide="edit-2" style="width:15px;height:15px"></i> Edit Client
          </div>
          <div class="cam-divider"></div>
          <div class="cam-item cam-danger" onclick="deleteClient(${c.id});closeAllClientMenus()">
            <i data-lucide="trash-2" style="width:15px;height:15px"></i> Delete
          </div>
        </div>
      </td>
    </tr>`;
  }).join('');
  var sa = document.getElementById('clients-select-all');
  if (sa) sa.checked = false;
  clientsUpdateBulkBar();
  lucide.createIcons();
}

// ====== BULK ACTIONS — CLIENTS ======
function clientsGetSelected() {
  return Array.from(document.querySelectorAll('.client-chk:checked'))
    .map(function(chk) { return parseInt(chk.dataset.id); });
}

function clientsUpdateBulkBar() {
  var selected = clientsGetSelected();
  var bar = document.getElementById('clients-bulk-bar');
  var count = document.getElementById('clients-bulk-count');
  var sa = document.getElementById('clients-select-all');
  var total = document.querySelectorAll('.client-chk').length;

  if (selected.length > 0) {
    bar.style.display = 'flex';
    count.textContent = selected.length + ' client' + (selected.length > 1 ? 's' : '') + ' selected';
    lucide.createIcons();
  } else {
    bar.style.display = 'none';
  }
  // Indeterminate state for select-all
  if (sa) {
    sa.checked = selected.length === total && total > 0;
    sa.indeterminate = selected.length > 0 && selected.length < total;
  }
}

function clientsToggleAll(checked) {
  document.querySelectorAll('.client-chk').forEach(function(chk) {
    chk.checked = checked;
  });
  clientsUpdateBulkBar();
}

function clientsClearSelection() {
  document.querySelectorAll('.client-chk').forEach(function(chk) { chk.checked = false; });
  var sa = document.getElementById('clients-select-all');
  if (sa) { sa.checked = false; sa.indeterminate = false; }
  document.getElementById('clients-bulk-bar').style.display = 'none';
}

function deleteClient(clientId) {
  var c = CLIENTS.find(function(x) { return x.id === clientId; });
  if (!c) return;
  if (!confirm('Delete "' + c.name + '"? This cannot be undone.')) return;
  CLIENTS.splice(CLIENTS.indexOf(c), 1);
  saveClients();
  if (typeof DB !== 'undefined' && isSupabaseReady()) {
    DB.clients.delete(clientId).catch(function(e) { console.warn('Cloud delete failed:', e); });
  }
  renderClients();
  renderDashboard();
  showToast('🗑️ ' + c.name + ' deleted');
}

function clientsBulkDelete() {
  var ids = clientsGetSelected();
  if (ids.length === 0) return;
  if (!confirm('Delete ' + ids.length + ' client(s)? This cannot be undone.')) return;
  ids.forEach(function(id) {
    var idx = CLIENTS.findIndex(function(c) { return c.id === id; });
    if (idx !== -1) {
      if (typeof DB !== 'undefined' && isSupabaseReady()) {
        DB.clients.delete(id).catch(function(e) { console.warn('Cloud delete failed:', e); });
      }
      CLIENTS.splice(idx, 1);
    }
  });
  saveClients();
  renderClients();
  renderDashboard();
  showToast('🗑️ ' + ids.length + ' client(s) deleted');
}

function clientsBulkCreateWO() {
  var ids = clientsGetSelected();
  if (ids.length === 0) return;
  if (ids.length === 1) {
    // Single client — open WO modal pre-filled
    createWOForClient(ids[0]);
  } else {
    // Multiple selected — just open blank WO modal
    showToast('Select one client to pre-fill a Work Order');
    openNewWOModal();
  }
  clientsClearSelection();
}

// ====== CLIENT ACTION DROPDOWN MENU ======
function toggleClientMenu(event, clientId) {
  event.stopPropagation();
  var menu = document.getElementById('cam-' + clientId);
  var isVisible = menu.style.display !== 'none';
  closeAllClientMenus();
  if (!isVisible) {
    menu.style.display = 'block';
    lucide.createIcons();
  }
}

function closeAllClientMenus() {
  document.querySelectorAll('.client-action-menu').forEach(function(m) {
    m.style.display = 'none';
  });
}

// Close menus when clicking outside
document.addEventListener('click', function() { closeAllClientMenus(); });

function filterClients(type) {
  currentClientFilter = type;
  // Update active tab
  const page = document.getElementById('page-clients');
  page.querySelectorAll('.filter-tab').forEach(tab => {
    tab.classList.toggle('active', tab.textContent === type || (type === 'All' && tab.textContent === 'All'));
  });
  renderClients();
}

function viewClientOrders(clientId) {
  const client = CLIENTS.find(c => c.id === clientId);
  if (!client) return;
  navigateTo('workorders');
  // TODO: filter work orders by client
}

var _editingClientId = null;

function editClient(clientId) {
  var c = CLIENTS.find(function(x) { return x.id === clientId; });
  if (!c) return;
  _editingClientId = clientId;
  // Populate fields
  document.getElementById('new-client-name').value = c.name || '';
  document.getElementById('new-client-email').value = c.email || '';
  document.getElementById('new-client-phone').value = c.phone || '';
  document.getElementById('new-client-type').value = c.type || 'Residential';
  document.getElementById('new-client-address').value = c.address || '';
  document.getElementById('new-client-referral').value = c.referral || 'Google';
  document.getElementById('new-client-lang').value = c.lang || 'English';
  document.getElementById('new-client-payment').value = c.payment || 'Net 30';
  document.getElementById('new-client-tags').value = c.tags || '';
  document.getElementById('new-client-notes').value = c.notes || '';
  // Update modal title and button
  document.getElementById('client-modal-title').innerHTML = '<i data-lucide="edit-2" style="width:20px;height:20px;margin-right:8px;vertical-align:text-bottom"></i> Edit Client';
  document.getElementById('client-modal-save-btn').textContent = 'Save Changes';
  openModal('modal-new-client');
  try { lucide.createIcons(); } catch(e) {}
}

function openNewClientModal() {
  _editingClientId = null;
  // Clear fields
  document.getElementById('new-client-name').value = '';
  document.getElementById('new-client-email').value = '';
  document.getElementById('new-client-phone').value = '';
  document.getElementById('new-client-type').value = 'Residential';
  document.getElementById('new-client-address').value = '';
  document.getElementById('new-client-referral').value = 'Google';
  document.getElementById('new-client-lang').value = 'English';
  document.getElementById('new-client-payment').value = 'Net 30';
  document.getElementById('new-client-tags').value = '';
  document.getElementById('new-client-notes').value = '';
  // Reset modal title and button
  document.getElementById('client-modal-title').innerHTML = '<i data-lucide="user-plus" style="width:20px;height:20px;margin-right:8px;vertical-align:text-bottom"></i> New Client';
  document.getElementById('client-modal-save-btn').textContent = 'Add Client';
  openModal('modal-new-client');
  try { lucide.createIcons(); } catch(e) {}
}

function saveNewClient() {
  const name = document.getElementById('new-client-name').value;
  const email = document.getElementById('new-client-email').value;
  if (!name || !email) { alert('Please fill Name and Email'); return; }

  var data = {
    name,
    type: document.getElementById('new-client-type').value,
    email,
    phone: document.getElementById('new-client-phone').value || '',
    address: document.getElementById('new-client-address').value || '',
    referral: document.getElementById('new-client-referral').value || '',
    lang: document.getElementById('new-client-lang').value || 'English',
    payment: document.getElementById('new-client-payment').value || 'Net 30',
    tags: document.getElementById('new-client-tags').value || '',
    notes: document.getElementById('new-client-notes').value || ''
  };

  if (_editingClientId !== null) {
    // Edit mode — update existing
    var c = CLIENTS.find(function(x) { return x.id === _editingClientId; });
    if (c) {
      Object.assign(c, data);
      showToast('✓ Client updated successfully');
    }
  } else {
    // Create mode — add new
    data.id = CLIENTS.length ? Math.max(...CLIENTS.map(function(x) { return x.id; })) + 1 : 1;
    data.properties = 0;
    data.totalOrders = 0;
    data.totalValue = 0;
    CLIENTS.push(data);
    showToast('✓ Client added successfully');
  }

  var wasEditing = _editingClientId !== null;
  var editId = _editingClientId;
  _editingClientId = null;
  saveClients();
  // Sync to Supabase
  if (typeof DB !== 'undefined' && isSupabaseReady()) {
    if (wasEditing) {
      DB.clients.update(editId, data).catch(function(e) { console.warn('Cloud sync client update failed:', e); });
    } else {
      DB.clients.create(data).catch(function(e) { console.warn('Cloud sync client create failed:', e); });
    }
  }
  renderClients();
  renderDashboard();
  closeModal('modal-new-client');
  navigateTo('clients');
}

// ============ SETTINGS ============
function loadSettings() {
  const saved = localStorage.getItem('woims_company');
  if (saved) {
    try { const parsed = JSON.parse(saved); COMPANY = { ...COMPANY, ...parsed }; } catch(e) {}
  }
  var docLogo = localStorage.getItem('woims_logo_url');
  var appLogo = localStorage.getItem('woims_app_logo_url');
  var oldLogo = localStorage.getItem('woims_logo');
  if (oldLogo && !docLogo) { docLogo = oldLogo; localStorage.setItem('woims_logo_url', oldLogo); localStorage.removeItem('woims_logo'); }
  if (docLogo) COMPANY.logo_url = docLogo;
  if (appLogo) COMPANY.app_logo_url = appLogo;
  updateSidebarLogo();
}

function updateSidebarLogo() {
  var img = document.getElementById('sidebar-logo-img');
  var txt = document.getElementById('sidebar-logo-text');
  var name = document.getElementById('sidebar-company-name');
  if (!img || !txt) return;
  var sidebarLogo = COMPANY.app_logo_url || COMPANY.logo_url || '';
  if (sidebarLogo) {
    img.src = sidebarLogo;
    img.style.display = 'block';
    txt.style.display = 'none';
  } else {
    img.style.display = 'none';
    txt.style.display = '';
    var initials = (COMPANY.name || 'RC').split(' ').map(function(w){return w[0]}).join('').substring(0, 2).toUpperCase();
    txt.textContent = initials;
  }
  if (name) name.textContent = COMPANY.name || 'R.C Art Construction';
}

function populateSettingsForm() {
  document.getElementById('settings-company-name').value = COMPANY.name || '';
  document.getElementById('settings-owner').value = COMPANY.owner || '';
  document.getElementById('settings-phone').value = COMPANY.phone || '';
  document.getElementById('settings-email').value = COMPANY.email || '';
  document.getElementById('settings-city').value = COMPANY.city || '';
  document.getElementById('settings-state').value = COMPANY.state || '';
  document.getElementById('settings-ccb').value = COMPANY.ccb || '';
  document.getElementById('settings-founded').value = COMPANY.founded || '';
  document.getElementById('settings-address').value = COMPANY.address || '';
  if (COMPANY.logo_url) {
    document.getElementById('doc-logo-preview').src = COMPANY.logo_url;
    document.getElementById('doc-logo-preview-container').style.display = 'block';
    document.getElementById('doc-logo-placeholder').style.display = 'none';
    document.getElementById('btn-remove-doc-logo').style.display = '';
  }
  if (COMPANY.app_logo_url) {
    document.getElementById('app-logo-preview').src = COMPANY.app_logo_url;
    document.getElementById('app-logo-preview-container').style.display = 'block';
    document.getElementById('app-logo-placeholder').style.display = 'none';
    document.getElementById('btn-remove-app-logo').style.display = '';
  }
}

function saveSettings() {
  COMPANY.name = document.getElementById('settings-company-name').value || COMPANY.name;
  COMPANY.owner = document.getElementById('settings-owner').value || '';
  COMPANY.phone = document.getElementById('settings-phone').value || COMPANY.phone;
  COMPANY.email = document.getElementById('settings-email').value || COMPANY.email;
  COMPANY.city = document.getElementById('settings-city').value || '';
  COMPANY.state = document.getElementById('settings-state').value || '';
  COMPANY.ccb = document.getElementById('settings-ccb').value || COMPANY.ccb;
  COMPANY.founded = document.getElementById('settings-founded').value || '';
  COMPANY.address = document.getElementById('settings-address').value || '';
  var toSave = {};
  for (var k in COMPANY) { if (k !== 'logo_url' && k !== 'app_logo_url') toSave[k] = COMPANY[k]; }
  localStorage.setItem('woims_company', JSON.stringify(toSave));
  // Sync to Supabase
  if (typeof DB !== 'undefined' && isSupabaseReady()) {
    DB.company.save(COMPANY).catch(function(e) { console.warn('Cloud sync settings failed:', e); });
  }
  updateSidebarLogo();
  showToast('Settings saved successfully');
}

function handleLogoUpload(event, type) {
  var file = event.target.files[0];
  if (!file) return;
  if (file.size > 5242880) { showToast('File too large. Max 5MB.'); event.target.value = ''; return; }
  if (!file.type.match(/^image\/(png|jpeg|jpg|svg|webp|gif)/)) { showToast('Invalid file type.'); event.target.value = ''; return; }
  var reader = new FileReader();
  reader.onerror = function() { showToast('Failed to read file.'); };
  reader.onload = function(e) {
    openCropper(e.target.result, type);
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function applyLogo(dataUrl, type) {
  var key = type === 'app' ? 'app_logo_url' : 'logo_url';
  var sKey = type === 'app' ? 'woims_app_logo_url' : 'woims_logo_url';
  var ids = type === 'app'
    ? ['app-logo-preview','app-logo-preview-container','app-logo-placeholder','btn-remove-app-logo']
    : ['doc-logo-preview','doc-logo-preview-container','doc-logo-placeholder','btn-remove-doc-logo'];
  COMPANY[key] = dataUrl;
  try { localStorage.setItem(sKey, dataUrl); } catch(e) { showToast('Storage full — logo saved in session only.'); }
  document.getElementById(ids[0]).src = dataUrl;
  document.getElementById(ids[1]).style.display = 'block';
  document.getElementById(ids[2]).style.display = 'none';
  document.getElementById(ids[3]).style.display = '';
  updateSidebarLogo();
  showToast('✓ ' + (type === 'app' ? 'App' : 'Document') + ' logo uploaded');
}

function removeLogo(type) {
  var key = type === 'app' ? 'app_logo_url' : 'logo_url';
  var sKey = type === 'app' ? 'woims_app_logo_url' : 'woims_logo_url';
  var ids = type === 'app'
    ? ['app-logo-preview','app-logo-preview-container','app-logo-placeholder','btn-remove-app-logo']
    : ['doc-logo-preview','doc-logo-preview-container','doc-logo-placeholder','btn-remove-doc-logo'];
  COMPANY[key] = '';
  localStorage.removeItem(sKey);
  document.getElementById(ids[0]).src = '';
  document.getElementById(ids[1]).style.display = 'none';
  document.getElementById(ids[2]).style.display = '';
  document.getElementById(ids[3]).style.display = 'none';
  updateSidebarLogo();
  showToast((type === 'app' ? 'App' : 'Document') + ' logo removed');
}

// ============ IMAGE CROPPER ============
var _cropper = { img: null, type: '', scale: 1, ox: 0, oy: 0, dragging: false, startX: 0, startY: 0, startOx: 0, startOy: 0 };
var CROP_SIZE = 280;

function openCropper(dataUrl, type) {
  _cropper.type = type;
  _cropper.scale = 1;
  _cropper.ox = 0;
  _cropper.oy = 0;
  document.getElementById('cropper-title').textContent = (type === 'app' ? 'Crop App Logo' : 'Crop Document Logo');
  document.getElementById('cropper-zoom').value = 100;
  var img = new Image();
  img.onload = function() {
    _cropper.img = img;
    // Fit image to fill the circle, then reduce 30% for crop room
    var fitScale = Math.max(CROP_SIZE / img.width, CROP_SIZE / img.height) * 0.7;
    _cropper.scale = fitScale;
    _cropper.ox = (CROP_SIZE - img.width * fitScale) / 2;
    _cropper.oy = (CROP_SIZE - img.height * fitScale) / 2;
    document.getElementById('cropper-zoom').min = Math.round(fitScale * 100);
    document.getElementById('cropper-zoom').max = Math.round(fitScale * 100 * 4);
    document.getElementById('cropper-zoom').value = Math.round(fitScale * 100);
    drawCropper();
    document.getElementById('modal-logo-cropper').style.display = 'flex';
    try { lucide.createIcons(); } catch(e) {}
  };
  img.onerror = function() { showToast('Could not load image.'); };
  img.src = dataUrl;
}

function drawCropper() {
  var canvas = document.getElementById('cropper-canvas');
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, CROP_SIZE, CROP_SIZE);
  // Dark background
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, CROP_SIZE, CROP_SIZE);
  if (!_cropper.img) return;
  var w = _cropper.img.width * _cropper.scale;
  var h = _cropper.img.height * _cropper.scale;
  ctx.drawImage(_cropper.img, _cropper.ox, _cropper.oy, w, h);
}

function closeCropper() {
  document.getElementById('modal-logo-cropper').style.display = 'none';
  _cropper.img = null;
}

function saveCroppedLogo() {
  if (!_cropper.img) return;
  // Export as circular PNG
  var outSize = _cropper.type === 'doc' ? 400 : 200;
  var exportCanvas = document.createElement('canvas');
  exportCanvas.width = outSize;
  exportCanvas.height = outSize;
  var ctx = exportCanvas.getContext('2d');
  // Draw circular clip
  ctx.beginPath();
  ctx.arc(outSize / 2, outSize / 2, outSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  // Scale from 280px viewport to output size
  var ratio = outSize / CROP_SIZE;
  var w = _cropper.img.width * _cropper.scale * ratio;
  var h = _cropper.img.height * _cropper.scale * ratio;
  var dx = _cropper.ox * ratio;
  var dy = _cropper.oy * ratio;
  ctx.drawImage(_cropper.img, dx, dy, w, h);
  var dataUrl = exportCanvas.toDataURL('image/png', 0.92);
  applyLogo(dataUrl, _cropper.type);
  closeCropper();
}

// Cropper mouse/touch events
(function() {
  function initCropperEvents() {
    var vp = document.getElementById('cropper-viewport');
    var zoom = document.getElementById('cropper-zoom');
    if (!vp || !zoom) { setTimeout(initCropperEvents, 200); return; }

    // Drag
    vp.addEventListener('mousedown', function(e) {
      _cropper.dragging = true;
      _cropper.startX = e.clientX;
      _cropper.startY = e.clientY;
      _cropper.startOx = _cropper.ox;
      _cropper.startOy = _cropper.oy;
      vp.style.cursor = 'grabbing';
      e.preventDefault();
    });
    window.addEventListener('mousemove', function(e) {
      if (!_cropper.dragging) return;
      _cropper.ox = _cropper.startOx + (e.clientX - _cropper.startX);
      _cropper.oy = _cropper.startOy + (e.clientY - _cropper.startY);
      drawCropper();
    });
    window.addEventListener('mouseup', function() {
      _cropper.dragging = false;
      var vp2 = document.getElementById('cropper-viewport');
      if (vp2) vp2.style.cursor = 'grab';
    });

    // Touch drag
    vp.addEventListener('touchstart', function(e) {
      if (e.touches.length === 1) {
        _cropper.dragging = true;
        _cropper.startX = e.touches[0].clientX;
        _cropper.startY = e.touches[0].clientY;
        _cropper.startOx = _cropper.ox;
        _cropper.startOy = _cropper.oy;
        e.preventDefault();
      }
    }, { passive: false });
    vp.addEventListener('touchmove', function(e) {
      if (_cropper.dragging && e.touches.length === 1) {
        _cropper.ox = _cropper.startOx + (e.touches[0].clientX - _cropper.startX);
        _cropper.oy = _cropper.startOy + (e.touches[0].clientY - _cropper.startY);
        drawCropper();
        e.preventDefault();
      }
    }, { passive: false });
    vp.addEventListener('touchend', function() { _cropper.dragging = false; });

    // Scroll zoom
    vp.addEventListener('wheel', function(e) {
      e.preventDefault();
      var delta = e.deltaY > 0 ? -5 : 5;
      var newVal = parseInt(zoom.value) + delta;
      zoom.value = Math.max(parseInt(zoom.min), Math.min(parseInt(zoom.max), newVal));
      applyCropperZoom();
    }, { passive: false });

    // Slider zoom
    zoom.addEventListener('input', applyCropperZoom);
  }

  function applyCropperZoom() {
    if (!_cropper.img) return;
    var zoom = document.getElementById('cropper-zoom');
    var newScale = parseInt(zoom.value) / 100;
    // Zoom centered on the viewport center
    var cx = CROP_SIZE / 2;
    var cy = CROP_SIZE / 2;
    var imgCx = (cx - _cropper.ox) / _cropper.scale;
    var imgCy = (cy - _cropper.oy) / _cropper.scale;
    _cropper.scale = newScale;
    _cropper.ox = cx - imgCx * newScale;
    _cropper.oy = cy - imgCy * newScale;
    drawCropper();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCropperEvents);
  } else {
    initCropperEvents();
  }
})();

// ============ ADDRESS AUTOCOMPLETE (OpenStreetMap Nominatim) ============
(function() {
  var _addrTimer = null;
  var _activeDropdown = null;

  function initAddressAutocomplete() {
    document.querySelectorAll('.autocomplete-address').forEach(function(input) {
      // Create dropdown container
      var dropdown = document.createElement('div');
      dropdown.className = 'address-suggestions';
      input.parentElement.appendChild(dropdown);
      input._addrDropdown = dropdown;

      input.addEventListener('input', function() {
        clearTimeout(_addrTimer);
        var q = input.value.trim();
        if (q.length < 3) { hideDropdown(dropdown); return; }
        _addrTimer = setTimeout(function() { searchAddress(q, input, dropdown); }, 350);
      });

      input.addEventListener('focus', function() {
        if (dropdown.children.length > 0 && input.value.trim().length >= 3) {
          showDropdown(dropdown);
        }
      });

      input.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') hideDropdown(dropdown);
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
      if (!e.target.classList.contains('autocomplete-address')) {
        document.querySelectorAll('.address-suggestions').forEach(function(d) {
          hideDropdown(d);
        });
      }
    });
  }

  function searchAddress(query, input, dropdown) {
    var url = 'https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=us&q=' + encodeURIComponent(query);
    fetch(url, {
      headers: { 'Accept-Language': 'en' }
    })
    .then(function(r) { return r.json(); })
    .then(function(results) {
      dropdown.innerHTML = '';
      if (!results || results.length === 0) {
        dropdown.innerHTML = '<div style="padding:12px 14px;font-size:12px;color:var(--text-muted);text-align:center">No addresses found</div>';
        showDropdown(dropdown);
        return;
      }
      results.forEach(function(place) {
        var addr = place.address || {};
        var mainLine = buildMainLine(addr, place.display_name);
        var secondLine = buildSecondLine(addr);
        var item = document.createElement('div');
        item.className = 'address-suggestion';
        item.innerHTML =
          '<svg class="addr-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' +
          '<div><div class="addr-main">' + mainLine + '</div>' +
          '<div class="addr-secondary">' + secondLine + '</div></div>';
        item.addEventListener('mousedown', function(e) {
          e.preventDefault();
          input.value = formatFullAddress(addr, place.display_name);
          hideDropdown(dropdown);
          input.dispatchEvent(new Event('change'));
        });
        dropdown.appendChild(item);
      });
      showDropdown(dropdown);
    })
    .catch(function() { hideDropdown(dropdown); });
  }

  function buildMainLine(addr, fallback) {
    var parts = [];
    if (addr.house_number) parts.push(addr.house_number);
    if (addr.road) parts.push(addr.road);
    if (parts.length > 0) return parts.join(' ');
    // Fallback: first part of display_name
    return fallback.split(',')[0] || fallback;
  }

  function buildSecondLine(addr) {
    var parts = [];
    if (addr.city || addr.town || addr.village) parts.push(addr.city || addr.town || addr.village);
    if (addr.state) parts.push(addr.state);
    if (addr.postcode) parts.push(addr.postcode);
    return parts.join(', ');
  }

  function formatFullAddress(addr, fallback) {
    var parts = [];
    var street = '';
    if (addr.house_number) street += addr.house_number + ' ';
    if (addr.road) street += addr.road;
    if (street.trim()) parts.push(street.trim());
    var city = addr.city || addr.town || addr.village || '';
    if (city) parts.push(city);
    if (addr.state) parts.push(addr.state);
    if (addr.postcode) parts.push(addr.postcode);
    if (parts.length >= 2) return parts.join(', ');
    return fallback;
  }

  function showDropdown(el) { el.classList.add('visible'); _activeDropdown = el; }
  function hideDropdown(el) { el.classList.remove('visible'); if (_activeDropdown === el) _activeDropdown = null; }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAddressAutocomplete);
  } else {
    setTimeout(initAddressAutocomplete, 300);
  }
})();

// ============ TOAST NOTIFICATION ============
function showToast(message, duration) {
  duration = duration || 3000;
  var existing = document.getElementById('app-toast');
  if (existing) existing.remove();
  var toast = document.createElement('div');
  toast.id = 'app-toast';
  toast.textContent = message;
  toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:#1a1d2e;color:#fff;padding:12px 24px;border-radius:12px;font-size:13px;font-weight:600;z-index:9999;opacity:0;transition:all 0.3s ease;box-shadow:0 8px 24px rgba(0,0,0,0.2);font-family:Inter,sans-serif;max-width:90vw;text-align:center';
  document.body.appendChild(toast);
  requestAnimationFrame(function() {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(function() { toast.remove(); }, 300);
  }, duration);
}

// ============ FIELD MODE ============
var _fmAgent = '';
var _fmWO = null;
var _fmItems = [];
var _fmGPS = { lat: null, lng: null };
var _fmPhotoFile = null;

function initFieldMode() {
  // Reset to agent selector
  document.getElementById('fm-agent-selector').style.display = '';
  document.getElementById('fm-wo-selector').style.display = 'none';
  document.getElementById('fm-tasks').style.display = 'none';
  document.getElementById('fm-photo-modal').style.display = 'none';
  lucide.createIcons();
}

function selectFieldAgent(name) {
  _fmAgent = name;
  document.getElementById('fm-agent-selector').style.display = 'none';
  document.getElementById('fm-wo-selector').style.display = '';
  document.getElementById('fm-current-agent-tag').textContent = '👷 ' + name;
  renderFMWorkOrders();
  lucide.createIcons();
}

function renderFMWorkOrders() {
  var activeWOs = WORK_ORDERS.filter(function(w) {
    return w.status === 'open' || w.status === 'progress';
  });
  var list = document.getElementById('fm-wo-list');
  if (activeWOs.length === 0) {
    list.innerHTML = '<div class="empty-state"><div class="icon"><i data-lucide="inbox" style="width:48px;height:48px"></i></div><h3>No active work orders</h3><p>All work orders are completed or in draft</p></div>';
    lucide.createIcons();
    return;
  }
  list.innerHTML = activeWOs.map(function(wo) {
    var progress = wo.items > 0 ? Math.round((wo.completed / wo.items) * 100) : 0;
    var progressColor = progress === 100 ? 'var(--success)' : 'var(--accent)';
    return '<div class="fm-wo-card" onclick="selectFieldWO(\'' + wo.id + '\')">' +
      '<div class="fm-wo-icon"><i data-lucide="clipboard-list" style="width:22px;height:22px"></i></div>' +
      '<div class="fm-wo-info">' +
        '<h4>' + wo.id + ' — ' + wo.title + '</h4>' +
        '<p>' + wo.client + ' • ' + wo.property + '</p>' +
      '</div>' +
      '<div class="fm-wo-progress">' +
        '<div class="fm-wo-progress-ring" style="background:conic-gradient(' + progressColor + ' ' + progress + '%, var(--bg-input) 0);">' +
          '<div style="width:34px;height:34px;border-radius:50%;background:var(--bg-card);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:' + progressColor + '">' + progress + '%</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
  lucide.createIcons();
}

async function selectFieldWO(woId) {
  var wo = WORK_ORDERS.find(function(w) { return w.id === woId; });
  if (!wo) return;
  _fmWO = wo;

  document.getElementById('fm-wo-selector').style.display = 'none';
  document.getElementById('fm-tasks').style.display = '';
  document.getElementById('fm-task-agent-tag').textContent = '👷 ' + _fmAgent;
  document.getElementById('fm-task-wo-label').textContent = wo.id + ' — ' + wo.title;

  // Show loading
  document.getElementById('fm-task-list').innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted)"><i data-lucide="loader" style="width:24px;height:24px;animation:spin 1s linear infinite"></i><p style="margin-top:8px">Loading tasks...</p></div>';
  try { lucide.createIcons(); } catch(e) {}

  // Load line items (same as WO detail)
  if (typeof DB !== 'undefined' && isSupabaseReady()) {
    try {
      var dbItems = await DB.lineItems.getByWO(wo.id);
      if (dbItems && dbItems.length > 0) {
        _fmItems = dbItems;
      } else {
        _fmItems = SERVICES.slice(0, wo.items).map(function(s, i) {
          return Object.assign({}, s, {
            lineId: i,
            status: i < wo.completed ? 'completed' : (i === wo.completed ? 'progress' : 'pending'),
            qty: 1
          });
        });
      }
    } catch(e) {
      _fmItems = SERVICES.slice(0, wo.items).map(function(s, i) {
        return Object.assign({}, s, {
          lineId: i,
          status: i < wo.completed ? 'completed' : (i === wo.completed ? 'progress' : 'pending'),
          qty: 1
        });
      });
    }
  } else {
    _fmItems = SERVICES.slice(0, wo.items).map(function(s, i) {
      return Object.assign({}, s, {
        lineId: i,
        status: i < wo.completed ? 'completed' : (i === wo.completed ? 'progress' : 'pending'),
        qty: 1
      });
    });
  }

  renderFMTasks();
  startGPSTracking();
  lucide.createIcons();
}

function renderFMTasks() {
  var completed = _fmItems.filter(function(i) { return i.status === 'completed'; }).length;
  var total = _fmItems.length;
  var pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  document.getElementById('fm-progress-fill').style.width = pct + '%';
  document.getElementById('fm-progress-text').textContent = completed + '/' + total + ' complete (' + pct + '%)';

  var list = document.getElementById('fm-task-list');
  list.innerHTML = _fmItems.map(function(item, i) {
    var cls = item.status === 'completed' ? 'completed' : (item.status === 'progress' ? 'in-progress' : '');
    var checkIcon = item.status === 'completed' ? '<i data-lucide="check" style="width:14px;height:14px"></i>' : '';
    return '<div class="fm-task-card ' + cls + '" onclick="fmToggleTask(' + i + ')">' +
      '<div class="fm-task-check">' + checkIcon + '</div>' +
      '<div class="fm-task-info">' +
        '<h4>' + item.name + '</h4>' +
        '<p>' + (item.category || '') + (item.sub ? ' • ' + item.sub : '') + '</p>' +
      '</div>' +
      '<div class="fm-task-price">$' + ((item.price || 0) * (item.qty || 1)).toLocaleString() + '</div>' +
    '</div>';
  }).join('');
  lucide.createIcons();
}

function fmToggleTask(index) {
  var item = _fmItems[index];
  if (!item || item.status === 'completed') return;

  item.status = 'completed';
  item.completedAt = new Date().toISOString();
  item.completedBy = _fmAgent;

  // Persist to Supabase
  if (typeof DB !== 'undefined' && isSupabaseReady() && item.id && typeof item.id === 'number') {
    DB.lineItems.update(item.id, {
      status: 'completed',
      completedAt: item.completedAt,
      completedBy: item.completedBy
    }).then(function() {
      console.log('✓ FM: Line item completed in DB:', item.name);
    }).catch(function(e) { console.warn('FM: Failed to sync completion:', e); });
  }

  // Update WO counters
  if (_fmWO) {
    _fmWO.completed = _fmItems.filter(function(i) { return i.status === 'completed'; }).length;
    _fmWO.items = _fmItems.length;
    if (typeof DB !== 'undefined' && isSupabaseReady()) {
      DB.workOrders.update(_fmWO.id, { completed: _fmWO.completed, items: _fmWO.items })
        .catch(function(e) { console.warn('FM: WO sync failed:', e); });
    }
  }

  // Also sync with global currentLineItems if same WO
  if (currentWO && currentWO.id === _fmWO.id) {
    currentLineItems = _fmItems;
  }

  renderFMTasks();
  renderDashboard();
  renderWorkOrders();
  showToast('✅ ' + item.name + ' — Completed by ' + _fmAgent);

  // Vibrate on mobile
  if (navigator.vibrate) navigator.vibrate(50);
}

function fmBack(step) {
  if (step === 'agent') {
    document.getElementById('fm-wo-selector').style.display = 'none';
    document.getElementById('fm-agent-selector').style.display = '';
    _fmAgent = '';
  } else if (step === 'wo') {
    document.getElementById('fm-tasks').style.display = 'none';
    document.getElementById('fm-wo-selector').style.display = '';
    _fmWO = null;
    _fmItems = [];
  }
  lucide.createIcons();
}

// ============ FIELD MODE: PHOTO CAPTURE ============
function startGPSTracking() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function(pos) {
        _fmGPS.lat = pos.coords.latitude;
        _fmGPS.lng = pos.coords.longitude;
        var gpsText = document.getElementById('fm-gps-text');
        if (gpsText) gpsText.textContent = '📍 ' + _fmGPS.lat.toFixed(5) + ', ' + _fmGPS.lng.toFixed(5);
      },
      function(err) {
        var gpsText = document.getElementById('fm-gps-text');
        if (gpsText) gpsText.textContent = 'GPS unavailable — ' + err.message;
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  } else {
    var gpsText = document.getElementById('fm-gps-text');
    if (gpsText) gpsText.textContent = 'GPS not supported';
  }
}

function fmCapturePhoto() {
  if (!_fmWO) { showToast('Select a work order first'); return; }
  _fmPhotoFile = null;
  document.getElementById('fm-photo-modal').style.display = '';
  document.getElementById('fm-photo-preview').innerHTML = '<i data-lucide="image-plus" style="width:48px;height:48px;color:var(--text-muted)"></i><p>Tap to take photo or select from gallery</p>';
  document.getElementById('fm-photo-label').value = '';
  document.getElementById('fm-photo-area').value = '';
  document.getElementById('fm-photo-type').value = 'before';
  startGPSTracking();
  lucide.createIcons();
}

function fmClosePhotoModal() {
  document.getElementById('fm-photo-modal').style.display = 'none';
  _fmPhotoFile = null;
}

function fmPhotoSelected(event) {
  var file = event.target.files[0];
  if (!file) return;
  _fmPhotoFile = file;
  var reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('fm-photo-preview').innerHTML = '<img src="' + e.target.result + '" alt="Photo preview">';
  };
  reader.readAsDataURL(file);
}

async function fmSavePhoto() {
  if (!_fmWO) { showToast('No work order selected'); return; }
  var label = document.getElementById('fm-photo-label').value.trim() || 'Field photo';
  var area = document.getElementById('fm-photo-area').value.trim() || 'General';
  var photoType = document.getElementById('fm-photo-type').value;
  var photoUrl = '';

  // Try to upload to Supabase Storage
  if (_fmPhotoFile && typeof DB !== 'undefined' && isSupabaseReady()) {
    try {
      var sb = getSupabase();
      var ext = _fmPhotoFile.name.split('.').pop();
      var path = _fmWO.id + '/' + Date.now() + '.' + ext;
      var uploadResult = await sb.storage.from('photos').upload(path, _fmPhotoFile);
      if (uploadResult.data) {
        var urlResult = sb.storage.from('photos').getPublicUrl(path);
        photoUrl = urlResult.data.publicUrl || '';
      }
    } catch(e) { console.warn('Photo upload failed:', e); }
  }

  // Save photo record to DB
  var photoRecord = {
    work_order_id: _fmWO.id,
    type: photoType,
    label: label,
    area: area,
    photo_url: photoUrl,
    gps_lat: _fmGPS.lat,
    gps_lng: _fmGPS.lng,
    taken_by: _fmAgent
  };

  if (typeof DB !== 'undefined' && isSupabaseReady()) {
    DB.photos.create(photoRecord).then(function() {
      console.log('✓ Photo saved to DB');
    }).catch(function(e) { console.warn('Photo DB save failed:', e); });
  }

  fmClosePhotoModal();
  showToast('📷 Photo saved: ' + label);
  if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
}
