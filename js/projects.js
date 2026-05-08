// ============================================================
// PROJECTS & FINANCIAL CONTROL — Phase 2
// Storage: Supabase (with localStorage fallback)
// ============================================================

var PROJECTS = [];
var _currentProject = null;

// ============================================================
// INVESTOR HUB FEATURE FLAG — Phase 2B
// Set to true ONLY after:
//   1. Migration 202605070001_investor_entities.sql confirmed applied in production
//   2. Manual UI check completed in Projects > Investor Hub
// DO NOT enable without both checks passing.
// ============================================================
var INVESTOR_HUB_ENABLED = false;

var PROJECT_STATUSES = {
  planning:    { label: 'Planning',     color: '#64748b', bg: '#64748b18' },
  active:      { label: 'Active',       color: '#3b82f6', bg: '#3b82f618' },
  in_progress: { label: 'In Progress',  color: '#f59e0b', bg: '#f59e0b18' },
  completed:   { label: 'Completed',    color: '#10b981', bg: '#10b98118' },
  on_hold:     { label: 'On Hold',      color: '#ef4444', bg: '#ef444418' },
  cancelled:   { label: 'Cancelled',    color: '#9ca3af', bg: '#9ca3af18' },
  sold:        { label: 'Sold',         color: '#8b5cf6', bg: '#8b5cf618' }
};

// ---- Project Types ----
var PROJECT_TYPES = {
  fix_and_flip: {
    label: 'Fix & Flip',
    description: 'Buy · Renovate · Sell',
    color: '#d97706', bg: '#fef3c720',
    border: '#d9770640',
    icon: 'home',
    modalTitle: 'New Fix & Flip Project',
    showAcquisition: true,
    showBudgetOnly: false
  },
  residential_project: {
    label: 'Residential Project',
    description: 'Residential remodel, repair, or service',
    color: '#0d9488', bg: '#ccfbf120',
    border: '#0d948840',
    icon: 'house',
    modalTitle: 'New Residential Project',
    showAcquisition: false,
    showBudgetOnly: true,
    hideRealtorTitle: true   // residential: hide Realtor/Title/Inspection/Insurance
  },
  commercial_project: {
    label: 'Commercial Project',
    description: 'Commercial repair, tenant improvement, or business property',
    color: '#2563eb', bg: '#dbeafe20',
    border: '#2563eb40',
    icon: 'building',
    modalTitle: 'New Commercial Project',
    showAcquisition: false,
    showBudgetOnly: true,
    hideRealtorTitle: true   // commercial: hide Realtor/Title/Inspection/Insurance
  },
  new_construction: {
    label: 'New Construction',
    description: 'Ground-up build, ADU, addition, or major construction',
    color: '#7c3aed', bg: '#ede9fe20',
    border: '#7c3aed40',
    icon: 'hard-hat',
    modalTitle: 'New Construction Project',
    showAcquisition: true,
    showBudgetOnly: false,
    hideRealtorTitle: true   // hide realtor fee / title co for construction
  },
  maintenance: {
    label: 'Maintenance',
    description: 'Recurring or scheduled service work',
    color: '#6b7280', bg: '#f3f4f620',
    border: '#6b728040',
    icon: 'wrench',
    modalTitle: 'New Maintenance Project',
    showAcquisition: false,
    showBudgetOnly: false   // hide all financial acquisition fields
  }
};

// Returns the type config (or a NULL fallback) for a project
function getProjTypeCfg(typeKey) {
  return PROJECT_TYPES[typeKey] || {
    label: 'Type not set',
    color: '#9ca3af', bg: '#9ca3af18',
    border: '#9ca3af40'
  };
}

// ---- Helpers ----
function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showToast(msg) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 2800);
}

// Restores the original .confirm-box skeleton so showConfirmModal() always
// finds its required IDs (confirm-modal-title / msg / btn) after openProjectModal()
// has replaced the innerHTML wholesale with a custom form.
function ensureConfirmBoxSkeleton() {
  if (!document.getElementById('confirm-modal-title') ||
      !document.getElementById('confirm-modal-msg')   ||
      !document.getElementById('confirm-modal-btn'))  {
    var box = document.querySelector('.confirm-box');
    if (box) {
      box.innerHTML =
        '<h3 id="confirm-modal-title">Confirm</h3>' +
        '<p id="confirm-modal-msg"></p>' +
        '<div class="confirm-actions">' +
          '<button class="btn btn-secondary" onclick="closeConfirmModal()">Cancel</button>' +
          '<button type="button" class="btn btn-danger" id="confirm-modal-btn">Confirm</button>' +
        '</div>';
    }
  }
}

function showConfirmModal(title, msg, onConfirm) {
  ensureConfirmBoxSkeleton(); // defensive: guarantee IDs exist before writing to them
  document.getElementById('confirm-modal-title').textContent = title;
  document.getElementById('confirm-modal-msg').innerHTML = msg;
  var btn = document.getElementById('confirm-modal-btn');
  btn.textContent = 'Confirm';
  btn.onclick = function() { closeConfirmModal(); if (onConfirm) onConfirm(); };
  document.getElementById('confirm-modal-overlay').style.display = 'flex';
}

function closeConfirmModal() {
  document.getElementById('confirm-modal-overlay').style.display = 'none';
  ensureConfirmBoxSkeleton(); // restore skeleton so next openProjectModal() finds clean DOM
}

function fmtMoney(val) {
  var n = parseFloat(val) || 0;
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function genProjectId() {
  return 'PROJ-' + new Date().getFullYear() + '-' + String(PROJECTS.length + 1).padStart(4, '0');
}

// ---- Storage ----
async function loadProjects() {
  if (typeof isSupabaseReady === 'function' && isSupabaseReady()) {
    try {
      var projs = await DB.projects.getAll() || [];
      var sums = await DB.projectFinancialSummaries.getAll() || [];
      PROJECTS = projs.map(function(p) {
        var s = sums.find(function(x) { return x.project_id === p.id; });
        if (s) p._financials = s;
        // Maps for fallback/legacy logic
        p.purchasePrice = p.purchase_price;
        p.downPayment = p.down_payment;
        p.loanAmount = p.loan_amount;
        p.realtorFee = p.realtor_fee;
        p.titleCompany = p.title_company;
        p.closingCosts = p.closing_costs;
        p.purchaseDate = p.purchase_date;
        p.createdAt = p.created_at;
        return p;
      });
      saveProjectsLocal();
    } catch(e) {
      console.error(e);
      showToast('Offline mode: using local storage');
      loadProjectsLocal();
    }
  } else {
    loadProjectsLocal();
  }
}

function loadProjectsLocal() {
  try {
    var raw = localStorage.getItem('nexartwo_projects');
    PROJECTS = raw ? JSON.parse(raw) : [];
  } catch(e) { PROJECTS = []; }
}

function saveProjectsLocal() {
  try { localStorage.setItem('nexartwo_projects', JSON.stringify(PROJECTS)); } catch(e) {}
}

// ---- Init ----
async function initProjects() {
  await loadProjects();
  renderProjectList();
}

// ---- Render List ----
function renderProjectList() {
  renderSummaryStats();
  var container = document.getElementById('proj-list');
  if (!container) return;

  if (PROJECTS.length === 0) {
    container.innerHTML = '<div class="proj-empty" style="max-width:400px;margin:0 auto;">' +
      '<i data-lucide="building-2" style="width:48px;height:48px"></i>' +
      '<p style="font-size:16px;font-weight:700;color:var(--text-primary);margin:0 0 8px">No projects yet</p>' +
      '<p style="font-size:13px;color:var(--text-secondary);margin:0 0 16px">Create your first project to unlock Financials, Expenses, Refunds, Disbursements, and Work Orders.</p>' +
      '<div style="text-align:left;background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:24px;">' +
      '<div style="font-size:12px;font-weight:600;margin-bottom:8px">Inside each project:</div>' +
      '<ul style="font-size:12px;color:var(--text-secondary);margin:0;padding-left:20px;line-height:1.6">' +
      '<li>Financial dashboard</li><li>Expense tracking</li><li>Refund tracking</li><li>Disbursements</li><li>Work Orders linked to projects</li>' +
      '</ul></div>' +
      '<button class="btn btn-primary" onclick="openProjectTypeSelector()">Create First Project</button>' +
      '</div>';
    lucide.createIcons();
    return;
  }

  var html = PROJECTS.map(function(p, idx) {
    var st = PROJECT_STATUSES[p.status] || PROJECT_STATUSES.planning;
    var purchasePrice = parseFloat(p.purchase_price || p.purchasePrice) || 0;
    var downPayment = parseFloat(p.down_payment || p.downPayment) || 0;
    var loanAmount = parseFloat(p.loan_amount || p.loanAmount) || 0;
    var closingCosts = parseFloat(p.closing_costs || p.closingCosts) || 0;
    var totalInvestment = p._financials ? parseFloat(p._financials.cost_basis ?? 0) : 0;
    var cashPosition = p._financials ? parseFloat(p._financials.project_cash_position ?? 0) : null;
    var cashChip = '';
    if (cashPosition !== null) {
      var chipColor = cashPosition >= 0 ? '#059669' : '#e11d48';
      var chipBg   = cashPosition >= 0 ? '#ecfdf5' : '#fff1f2';
      cashChip = '<span class="proj-cash-chip" style="color:' + chipColor + ';background:' + chipBg + ';border:1px solid ' + chipColor + '20">' +
        (cashPosition >= 0 ? '↑' : '↓') + ' Cash: ' + fmtMoney(cashPosition) + '</span>';
    }

    var tc = getProjTypeCfg(p.project_type || null);
    var typeBadge = '<span style="font-size:10px;font-weight:600;color:' + tc.color + ';background:' + tc.bg + ';border:1px solid ' + (tc.border || tc.color + '40') + ';padding:2px 8px;border-radius:20px;margin-left:6px">' + tc.label + '</span>';

    return '<div class="proj-card" onclick="openProjectDetail(\'' + p.id + '\')"><span class="proj-status-badge" style="color:' + st.color + ';background:' + st.bg + '">' + st.label + '</span>' + typeBadge +
      '<div class="proj-card-header">' +
      '<div class="proj-card-icon"><i data-lucide="building-2" style="width:22px;height:22px"></i></div>' +
      '<div><div class="proj-card-title">' + escHtml(p.name) + '</div>' +
      '<div class="proj-card-addr">' + escHtml(p.address || 'No address') + '</div></div></div>' +
      '<div style="margin-top:8px">' +
      '<div class="proj-fin-row"><span class="proj-fin-label">Purchase Price</span><span class="proj-fin-value">' + fmtMoney(purchasePrice) + '</span></div>' +
      '<div class="proj-fin-row"><span class="proj-fin-label">Down Payment</span><span class="proj-fin-value">' + fmtMoney(downPayment) + '</span></div>' +
      '<div class="proj-fin-row"><span class="proj-fin-label">Loan</span><span class="proj-fin-value">' + fmtMoney(loanAmount) + '</span></div>' +
      '<div class="proj-fin-row"><span class="proj-fin-label">Closing Costs</span><span class="proj-fin-value">' + fmtMoney(closingCosts) + '</span></div>' +
      '<div class="proj-fin-row" style="border-top:2px solid var(--border)"><span class="proj-fin-label" style="font-weight:700">Cost Basis</span><span class="proj-fin-value" style="color:var(--accent)">' + (p._financials ? fmtMoney(totalInvestment) : '<span style="color:var(--text-muted);font-weight:normal;font-size:10px">N/A</span>') + '</span></div>' +
      '</div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;flex-wrap:wrap;gap:6px">' +
      '<div style="font-size:11px;color:var(--text-muted)">' +
      (p.responsible ? '<span>👤 ' + escHtml(p.responsible) + '</span>' : '') +
      ((p.purchase_date || p.purchaseDate) ? '<span style="margin-left:8px">📅 ' + fmtDate(p.purchase_date || p.purchaseDate) + '</span>' : '') +
      '</div>' + cashChip + '</div></div>';
  }).join('');

  container.innerHTML = html;
  lucide.createIcons();
}

function renderSummaryStats() {
  var container = document.getElementById('proj-summary-stats');
  if (!container) return;

  var totalProjects = PROJECTS.length;
  var activeProjects = PROJECTS.filter(function(p) { return p.status === 'active' || p.status === 'in_progress'; }).length;
  var totalPurchase = PROJECTS.reduce(function(s, p) { return s + (parseFloat(p.purchase_price || p.purchasePrice) || 0); }, 0);
  var totalInvestment = PROJECTS.reduce(function(s, p) {
    return s + (p._financials ? parseFloat(p._financials.cost_basis ?? 0) : 0);
  }, 0);

  // Basic counts — always shown
  container.innerHTML =
    '<div class="proj-stat-card"><div style="font-size:13px;font-weight:600;color:var(--text-muted);margin-bottom:6px">🏗️</div><div class="proj-stat-value">' + totalProjects + '</div><div class="proj-stat-label">Total Projects</div></div>' +
    '<div class="proj-stat-card"><div style="font-size:13px;font-weight:600;color:var(--text-muted);margin-bottom:6px">🟢</div><div class="proj-stat-value">' + activeProjects + '</div><div class="proj-stat-label">Active</div></div>' +
    '<div class="proj-stat-card"><div style="font-size:13px;font-weight:600;color:var(--text-muted);margin-bottom:6px">💰</div><div class="proj-stat-value">' + fmtMoney(totalPurchase) + '</div><div class="proj-stat-label">Total Purchases</div></div>' +
    '<div class="proj-stat-card"><div style="font-size:13px;font-weight:600;color:var(--text-muted);margin-bottom:6px">📊</div><div class="proj-stat-value">' + fmtMoney(totalInvestment) + '</div><div class="proj-stat-label">Total Cost Basis</div></div>';

  // Portfolio-level P&L bar — shown only when financial data is available via RPC
  var withFinancials = PROJECTS.filter(function(p) { return !!p._financials; }).length;
  var pnlContainer = document.getElementById('proj-pnl-bar-container');
  if (!pnlContainer) return;

  if (withFinancials === 0) {
    pnlContainer.innerHTML = '';
    return;
  }

  var totalCashPosition = PROJECTS.reduce(function(s, p) {
    return s + (p._financials ? parseFloat(p._financials.project_cash_position ?? 0) : 0);
  }, 0);
  var totalProfit = PROJECTS.reduce(function(s, p) {
    return s + (p._financials ? parseFloat(p._financials.profit ?? 0) : 0);
  }, 0);
  var totalNetExpenses = PROJECTS.reduce(function(s, p) {
    return s + (p._financials ? parseFloat(p._financials.net_expense_cost ?? 0) : 0);
  }, 0);

  var cashColor  = totalCashPosition >= 0 ? '#059669' : '#e11d48';
  var profitColor = totalProfit >= 0 ? '#059669' : '#e11d48';

  pnlContainer.innerHTML =
    '<div class="proj-pnl-bar">' +
      '<div class="proj-pnl-header">' +
        '<h4><i data-lucide="line-chart" style="width:15px;height:15px"></i> Portfolio P&L Summary</h4>' +
        '<span class="proj-pnl-badge">' + withFinancials + ' / ' + totalProjects + ' projects reporting</span>' +
      '</div>' +
      '<div class="proj-pnl-metrics">' +
        '<div class="proj-pnl-metric">' +
          '<div class="proj-pnl-metric-label">Total Net Expenses</div>' +
          '<div class="proj-pnl-metric-value" style="color:#e11d48">' + fmtMoney(totalNetExpenses) + '</div>' +
          '<div class="proj-pnl-metric-sub">Operating costs incurred</div>' +
        '</div>' +
        '<div class="proj-pnl-metric">' +
          '<div class="proj-pnl-metric-label">Portfolio Cash Position</div>' +
          '<div class="proj-pnl-metric-value" style="color:' + cashColor + '">' + fmtMoney(totalCashPosition) + '</div>' +
          '<div class="proj-pnl-metric-sub">Liquid position vs all expenses</div>' +
        '</div>' +
        '<div class="proj-pnl-metric">' +
          '<div class="proj-pnl-metric-label">Total Profit / Loss</div>' +
          '<div class="proj-pnl-metric-value" style="color:' + profitColor + '">' + (totalProfit >= 0 ? '+' : '') + fmtMoney(totalProfit) + '</div>' +
          '<div class="proj-pnl-metric-sub">Projected final P&L</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  lucide.createIcons();
}

// ---- Project Modal ----
// Opens the 5-card type selector. Called instead of openProjectModal() for new projects.
function openProjectTypeSelector() {
  showConfirmModal('New Project', '', null);
  var box = document.querySelector('.confirm-box');
  var cards = Object.keys(PROJECT_TYPES).map(function(key) {
    var t = PROJECT_TYPES[key];
    return '<div onclick="openProjectModal(null,\'' + key + '\')" style="cursor:pointer;border:1px solid ' + t.border + ';border-radius:10px;padding:14px 16px;background:' + t.bg + ';transition:box-shadow 0.15s;display:flex;align-items:flex-start;gap:12px" ' +
      'onmouseover="this.style.boxShadow=\'0 0 0 2px ' + t.color + '40\'" onmouseout="this.style.boxShadow=\'\'">' +
      '<div style="width:36px;height:36px;border-radius:8px;background:' + t.color + '18;display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
      '<i data-lucide="' + t.icon + '" style="width:18px;height:18px;color:' + t.color + '"></i></div>' +
      '<div><div style="font-size:14px;font-weight:700;color:var(--text-primary);margin-bottom:2px">' + t.label + '</div>' +
      '<div style="font-size:11px;color:var(--text-muted)">' + t.description + '</div></div></div>';
  }).join('');
  box.innerHTML =
    '<h3 style="margin:0 0 4px;font-size:18px;font-weight:700;color:var(--text-primary)">New Project</h3>' +
    '<p style="margin:0 0 16px;font-size:12px;color:var(--text-muted)">Select a project type to get started</p>' +
    '<div style="display:flex;flex-direction:column;gap:10px">' + cards + '</div>' +
    '<div style="margin-top:16px;display:flex;justify-content:flex-end;border-top:1px solid var(--border);padding-top:14px">' +
    '<button type="button" class="btn btn-secondary" onclick="closeConfirmModal()">Cancel</button></div>';
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

var _projEditId = null;

function openProjectModal(editId, type) {
  _projEditId = editId || null;
  var proj = _projEditId ? PROJECTS.find(function(p) { return p.id === _projEditId; }) : null;

  // In edit mode use the project's stored type; in create mode use the chosen type arg
  var activeType = proj ? (proj.project_type || null) : (type || null);
  var tc = getProjTypeCfg(activeType);

  var modalTitle = proj ? 'Edit Project' : (tc.modalTitle || 'New Project');
  showConfirmModal(modalTitle, '', null);
  var box = document.querySelector('.confirm-box');

  // ── Type badge header ──────────────────────────────────────────────────────
  var typeBadgeHtml = '<span style="font-size:11px;font-weight:600;color:' + tc.color + ';background:' + tc.bg + ';border:1px solid ' + (tc.border || tc.color + '40') + ';padding:3px 10px;border-radius:20px;margin-left:10px">' + tc.label + '</span>';
  var headerHtml =
    '<h3 style="margin:0 0 16px;font-size:18px;font-weight:700;color:var(--text-primary);display:flex;align-items:center;gap:8px">' +
    '<i data-lucide="building-2" style="width:20px;height:20px;color:var(--accent)"></i> ' + modalTitle + typeBadgeHtml + '</h3>' +
    '<div style="display:flex;flex-direction:column;gap:16px;text-align:left;max-height:70vh;overflow-y:auto;padding:4px 8px 12px 4px">';

  // ── Core Info section (always shown) ──────────────────────────────────────
  var coreHtml =
    '<div style="background:var(--bg-primary);border:1px solid var(--border);border-radius:8px;padding:16px;display:flex;flex-direction:column;gap:12px">' +
    '<div><label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:6px">Project Name *</label>' +
    '<input type="text" id="proj-name" class="form-control" placeholder="e.g. 1234 Oak Street Renovation" style="width:100%;padding:10px;font-size:14px" value="' + escHtml(proj ? proj.name : '') + '"></div>' +
    '<div><label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:6px">Address</label>' +
    '<input type="text" id="proj-address" class="form-control" placeholder="Full property address" style="width:100%;padding:10px;font-size:14px" value="' + escHtml(proj ? proj.address : '') + '"></div>' +
    '<div style="display:flex;gap:12px">' +
    '<div style="flex:1"><label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:6px">Purchase Date</label>' +
    '<input type="date" id="proj-date" class="form-control" style="width:100%;padding:10px;font-size:14px" value="' + (proj ? (proj.purchase_date || proj.purchaseDate || '') : '') + '"></div>' +
    '<div style="flex:1"><label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:6px">Status</label>' +
    '<select id="proj-status" class="form-control" style="width:100%;padding:10px;font-size:14px">' +
    Object.keys(PROJECT_STATUSES).map(function(k) {
      return '<option value="' + k + '"' + (proj && proj.status === k ? ' selected' : '') + '>' + PROJECT_STATUSES[k].label + '</option>';
    }).join('') + '</select></div></div>' +
    '<div><label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:6px">Responsible</label>' +
    '<input type="text" id="proj-responsible" class="form-control" placeholder="Project manager / owner" style="width:100%;padding:10px;font-size:14px" value="' + escHtml(proj ? proj.responsible : '') + '"></div>' +
    '</div>';

  // ── Determine which financial section to show ──────────────────────────────
  // tc_cfg is resolved from project_type for BOTH create and edit paths.
  // NULL / "Type not set" projects: tc_cfg falls back to the null-sentinel which
  // has no showAcquisition/showBudgetOnly/hideRealtorTitle → treated as "show all"
  // for backward compatibility.
  var tc_cfg = proj ? getProjTypeCfg(proj.project_type) : (activeType ? getProjTypeCfg(activeType) : null);
  // For null-type projects tc_cfg is the fallback object (no show* flags) → show all
  var typeKnown = tc_cfg && (tc_cfg.showAcquisition !== undefined || tc_cfg.showBudgetOnly !== undefined);

  var showAcq    = typeKnown ? tc_cfg.showAcquisition : true;   // unknown type → show all
  var showBudget = typeKnown ? tc_cfg.showBudgetOnly  : true;
  var showNoFin  = typeKnown && !tc_cfg.showAcquisition && !tc_cfg.showBudgetOnly;
  var hideRealtor = typeKnown ? !!tc_cfg.hideRealtorTitle : false;
  var purchaseLabel = (activeType === 'residential_project' || activeType === 'commercial_project') ? 'Budget ($)' : 'Purchase Price ($)';

  // Helper: emit a hidden stub that preserves the stored value (edit) or 0 (create).
  // This prevents saveProject() from overwriting stored data with zeros.
  function hiddenStub(id, storedVal) {
    return '<input type="hidden" id="' + id + '" value="' + (storedVal !== undefined && storedVal !== null ? storedVal : 0) + '">';
  }

  var finHtml = '';
  if (showAcq || showBudget || !showNoFin) {
    var sectionTitle = activeType === 'new_construction' ? 'Construction Budget & Financing' :
                       (activeType === 'residential_project' || activeType === 'commercial_project') ? 'Scope & Budget' : 'Financial Setup';
    finHtml =
      '<div style="background:var(--bg-primary);border:1px solid var(--border);border-radius:8px;padding:16px">' +
      '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px"><i data-lucide="calculator" style="width:16px;height:16px;color:var(--text-secondary)"></i>' +
      '<div style="font-size:14px;font-weight:700;color:var(--text-primary)">' + sectionTitle + '</div></div>' +
      '<div style="font-size:11px;color:var(--text-muted);margin-bottom:14px;background:#fff;padding:6px 10px;border-radius:6px;border:1px dashed var(--border-light)">ℹ️ Project financial fields are used for internal financial tracking.</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
      // Purchase Price / Budget — always shown when any finance section is rendered
      '<div><label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:6px">' + purchaseLabel + '</label>' +
      '<input type="number" id="proj-purchase" class="form-control" placeholder="0.00" step="0.01" style="width:100%;padding:8px" value="' + (proj ? (proj.purchase_price || proj.purchasePrice || '') : '') + '"></div>';

    // ── Down Payment / Loan / Closing Costs ───────────────────────────────────
    if (showAcq) {
      finHtml +=
        '<div><label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:6px">Down Payment ($)</label>' +
        '<input type="number" id="proj-down" class="form-control" placeholder="0.00" step="0.01" style="width:100%;padding:8px" value="' + (proj ? (proj.down_payment || proj.downPayment || '') : '') + '"></div>' +
        '<div><label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:6px">Loan Amount ($)</label>' +
        '<input type="number" id="proj-loan" class="form-control" placeholder="0.00" step="0.01" style="width:100%;padding:8px" value="' + (proj ? (proj.loan_amount || proj.loanAmount || '') : '') + '"></div>' +
        '<div><label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:6px">Closing Costs ($)</label>' +
        '<input type="number" id="proj-closing" class="form-control" placeholder="0.00" step="0.01" style="width:100%;padding:8px" value="' + (proj ? (proj.closing_costs || proj.closingCosts || '') : '') + '"></div>';
    } else {
      // Hidden — preserve stored values so saveProject() doesn't zero them out
      finHtml += hiddenStub('proj-down',    proj ? (proj.down_payment    || proj.downPayment    || 0) : 0);
      finHtml += hiddenStub('proj-loan',    proj ? (proj.loan_amount     || proj.loanAmount     || 0) : 0);
      finHtml += hiddenStub('proj-closing', proj ? (proj.closing_costs   || proj.closingCosts   || 0) : 0);
    }

    // ── Realtor Fee / Title Company Fee / Inspection Fee / Insurance / Title Co ─
    if (!hideRealtor) {
      finHtml +=
        '<div><label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:6px">Realtor Fee ($)</label>' +
        '<input type="number" id="proj-realtor" class="form-control" placeholder="0.00" step="0.01" style="width:100%;padding:8px" value="' + (proj ? (proj.realtor_fee || proj.realtorFee || '') : '') + '"></div>' +
        '<div><label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:6px">Title Company Fee ($)</label>' +
        '<input type="number" id="proj-title-fee" class="form-control" placeholder="0.00" step="0.01" style="width:100%;padding:8px" value="' + (proj ? (proj.title_company_fee || '') : '') + '"></div>' +
        '<div><label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:6px">Inspection Fee ($)</label>' +
        '<input type="number" id="proj-inspection" class="form-control" placeholder="0.00" step="0.01" style="width:100%;padding:8px" value="' + (proj ? (proj.inspection_fee || '') : '') + '"></div>' +
        '<div><label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:6px">Insurance ($)</label>' +
        '<input type="number" id="proj-insurance" class="form-control" placeholder="0.00" step="0.01" style="width:100%;padding:8px" value="' + (proj ? (proj.insurance || '') : '') + '"></div>' +
        '<div style="grid-column:1 / span 2"><label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:6px">Title Company</label>' +
        '<input type="text" id="proj-title-co" class="form-control" placeholder="Title company name" style="width:100%;padding:8px" value="' + escHtml(proj ? (proj.title_company || proj.titleCompany || '') : '') + '"></div>';
    } else {
      // Hidden — preserve stored values
      finHtml += hiddenStub('proj-realtor',    proj ? (proj.realtor_fee       || proj.realtorFee    || 0) : 0);
      finHtml += hiddenStub('proj-title-fee',  proj ? (proj.title_company_fee || 0) : 0);
      finHtml += hiddenStub('proj-inspection', proj ? (proj.inspection_fee    || 0) : 0);
      finHtml += hiddenStub('proj-insurance',  proj ? (proj.insurance         || 0) : 0);
      finHtml += '<input type="hidden" id="proj-title-co" value="' + escHtml(proj ? (proj.title_company || proj.titleCompany || '') : '') + '">';
    }

    finHtml += '</div></div>';
  } else {
    // Maintenance (showNoFin = true) — all fields hidden; preserve stored values on edit
    finHtml =
      hiddenStub('proj-purchase',   proj ? (proj.purchase_price    || proj.purchasePrice  || 0) : 0) +
      hiddenStub('proj-down',       proj ? (proj.down_payment      || proj.downPayment    || 0) : 0) +
      hiddenStub('proj-loan',       proj ? (proj.loan_amount       || proj.loanAmount     || 0) : 0) +
      hiddenStub('proj-closing',    proj ? (proj.closing_costs     || proj.closingCosts   || 0) : 0) +
      hiddenStub('proj-realtor',    proj ? (proj.realtor_fee       || proj.realtorFee     || 0) : 0) +
      hiddenStub('proj-title-fee',  proj ? (proj.title_company_fee || 0) : 0) +
      hiddenStub('proj-inspection', proj ? (proj.inspection_fee    || 0) : 0) +
      hiddenStub('proj-insurance',  proj ? (proj.insurance         || 0) : 0) +
      '<input type="hidden" id="proj-title-co" value="' + escHtml(proj ? (proj.title_company || proj.titleCompany || '') : '') + '">';
  }

  // ── Hidden type field (create only; ignored on edit) ─────────────────────
  var typeFieldHtml = '<input type="hidden" id="proj-type-hidden" value="' + (activeType || '') + '">';

  // ── Actions ───────────────────────────────────────────────────────────────
  var actionsHtml =
    '<div class="confirm-actions" style="margin-top:20px;display:flex;justify-content:flex-end;gap:12px;border-top:1px solid var(--border);padding-top:16px">' +
    '<button type="button" class="btn btn-secondary" onclick="closeConfirmModal()">Cancel</button>' +
    '<button type="button" class="btn btn-primary" onclick="saveProject()">' + (proj ? 'Update Project' : 'Create Project') + '</button></div>';

  box.innerHTML = headerHtml + coreHtml + finHtml + '</div>' + typeFieldHtml + actionsHtml;
  if (typeof lucide !== 'undefined') lucide.createIcons();
}


async function saveProject() {
  var name = (document.getElementById('proj-name').value || '').trim();
  if (!name) { alert('Project name is required.'); return; }

  var data = {
    name:               name,
    address:            (document.getElementById('proj-address').value || '').trim(),
    purchase_date:      document.getElementById('proj-date').value || null,
    status:             document.getElementById('proj-status').value || 'planning',
    responsible:        (document.getElementById('proj-responsible').value || '').trim(),
    purchase_price:     Math.abs(parseFloat(document.getElementById('proj-purchase').value) || 0),
    down_payment:       Math.abs(parseFloat(document.getElementById('proj-down').value) || 0),
    loan_amount:        Math.abs(parseFloat(document.getElementById('proj-loan').value) || 0),
    closing_costs:      Math.abs(parseFloat(document.getElementById('proj-closing').value) || 0),
    realtor_fee:        Math.abs(parseFloat(document.getElementById('proj-realtor').value) || 0),
    title_company_fee:  Math.abs(parseFloat(document.getElementById('proj-title-fee').value) || 0),
    inspection_fee:     Math.abs(parseFloat(document.getElementById('proj-inspection').value) || 0),
    insurance:          Math.abs(parseFloat(document.getElementById('proj-insurance').value) || 0),
    title_company:      (document.getElementById('proj-title-co').value || '').trim()
  };

  if (_projEditId) {
    if (typeof isSupabaseReady === 'function' && isSupabaseReady()) {
      var ok = await DB.projects.update(_projEditId, data);
      if(!ok) { alert('Error updating. Check logs.'); return; }
    } else {
      var idx = PROJECTS.findIndex(function(p) { return p.id === _projEditId; });
      if (idx >= 0) { Object.assign(PROJECTS[idx], data); saveProjectsLocal(); }
    }
    showToast('✅ Project updated');
  } else {
    // Include project_type on create only — cannot change it after creation
    var typeHiddenEl = document.getElementById('proj-type-hidden');
    var chosenType = typeHiddenEl ? (typeHiddenEl.value || null) : null;
    if (chosenType) data.project_type = chosenType;

    if (typeof isSupabaseReady === 'function' && isSupabaseReady()) {
      var res = await DB.projects.create(data);
      if(!res) { alert('Error creating. Check logs.'); return; }
    } else {
      var project = Object.assign({ id: genProjectId(), created_at: new Date().toISOString() }, data);
      PROJECTS.unshift(project);
      saveProjectsLocal();
    }
    showToast('✅ Project created');
  }

  closeConfirmModal();
  await loadProjects();
  if (_projEditId && _currentProject) {
    _currentProject = PROJECTS.find(function(p) { return p.id === _projEditId; });
    if (_currentProject) renderProjectDetail();
  } else {
    showProjectList();
  }
  _projEditId = null;
}

// ---- Detail View ----
async function openProjectDetail(projId) {
  _currentProject = PROJECTS.find(function(p) { return p.id === projId; });
  if (!_currentProject) return;

  document.getElementById('proj-list-view').style.display = 'none';
  document.getElementById('proj-detail-view').style.display = 'block';
  document.getElementById('topbar-title').textContent = _currentProject.name;
  var _nb = document.getElementById('btn-new-project');
  if (_nb) _nb.style.display = 'none';  // hide + New Project while in detail

  // ── Always reset to Overview tab so stale WO content from a previous project
  // cannot persist. proj-tab-workorders is cleared here; it will be repopulated
  // by renderWorkOrdersTab() only when the user explicitly clicks the WO tab.
  document.querySelectorAll('.proj-detail-tab').forEach(function(t) { t.classList.remove('active'); });
  document.querySelectorAll('.proj-tab-content').forEach(function(c) { c.style.display = 'none'; });
  var overviewBtn = document.querySelector('.proj-detail-tab[data-tab="overview"]');
  if (overviewBtn) overviewBtn.classList.add('active');
  var overviewContent = document.getElementById('proj-tab-overview');
  if (overviewContent) overviewContent.style.display = 'block';
  var woTab = document.getElementById('proj-tab-workorders');
  if (woTab) woTab.innerHTML = '';  // clear stale WOs from previous project

  // Set loading flag BEFORE initial render so spinner shows only when Supabase is active
  _currentProject._financialsLoading = (typeof isSupabaseReady === 'function' && isSupabaseReady());
  renderProjectDetail();
  if (_currentProject._financialsLoading) {
    await fetchProjectFinancials();
  }
}

function showProjectList() {
  _currentProject = null;
  document.getElementById('proj-detail-view').style.display = 'none';
  document.getElementById('proj-list-view').style.display = 'block';
  document.getElementById('topbar-title').textContent = 'Projects';
  var _nb = document.getElementById('btn-new-project');
  if (_nb) _nb.style.display = '';  // restore + New Project on list view
  renderProjectList();
}

function editCurrentProject() {
  if (_currentProject) openProjectModal(_currentProject.id);
}

// RULE 14: No delete
async function cancelCurrentProject() {
  if (!_currentProject) return;
  showConfirmModal('Cancel Project', 'Are you sure you want to cancel "' + escHtml(_currentProject.name) + '"? <br><br><span style="color:var(--danger)">Financial history will be retained but the project will become inactive.</span>', async function() {
    if (typeof isSupabaseReady === 'function' && isSupabaseReady()) {
      var ok = await DB.projects.cancel(_currentProject.id);
      if(!ok) { alert('Failed to cancel'); return; }
    } else {
      _currentProject.status = 'cancelled';
      saveProjectsLocal();
    }
    showToast('Project cancelled');
    await loadProjects();
    showProjectList();
  });
}

function switchProjTab(tab) {
  document.querySelectorAll('.proj-detail-tab').forEach(function(t) { t.classList.remove('active'); });
  document.querySelectorAll('.proj-tab-content').forEach(function(c) { c.style.display = 'none'; });
  var tBtn = document.querySelector('.proj-detail-tab[data-tab="' + tab + '"]');
  if(tBtn) tBtn.classList.add('active');
  var tContent = document.getElementById('proj-tab-' + tab);
  if(tContent) tContent.style.display = 'block';
  // Lazy-load Investor Hub when tab is first opened
  // Guarded by INVESTOR_HUB_ENABLED feature flag (Phase 2B hotfix)
  if (tab === 'investorhub') {
    if (!INVESTOR_HUB_ENABLED) {
      var blockedEl = document.getElementById('proj-tab-investorhub');
      if (blockedEl) {
        blockedEl.innerHTML = '<div style="padding:32px;text-align:center;color:var(--text-muted)">' +
          '<div style="font-size:32px;margin-bottom:12px">🔒</div>' +
          '<div style="font-weight:700;font-size:14px;margin-bottom:8px;color:var(--text-primary)">Investor Hub — Coming Soon</div>' +
          '<div style="font-size:12px">This feature is pending final configuration.<br>Contact your administrator.</div>' +
          '</div>';
      }
      return;
    }
    if (_currentProject) renderInvestorHub(_currentProject.id);
  }
  
  if (tab === 'workorders') {
    if (_currentProject) renderWorkOrdersTab();
  }
}

function renderProjectDetail() {
  if (!_currentProject) return;
  var p = _currentProject;
  var st = PROJECT_STATUSES[p.status] || PROJECT_STATUSES.planning;
  var ptc = getProjTypeCfg(p.project_type || null);
  document.getElementById('proj-detail-title').innerHTML = escHtml(p.name) +
    ' <span style="font-size:11px;font-weight:600;color:' + st.color + ';background:' + st.bg + ';padding:3px 10px;border-radius:10px;margin-left:8px">' + st.label + '</span>' +
    ' <span style="font-size:10px;font-weight:600;color:' + ptc.color + ';background:' + ptc.bg + ';border:1px solid ' + (ptc.border || ptc.color + '40') + ';padding:2px 8px;border-radius:20px;margin-left:4px">' + ptc.label + '</span>';

  // Overview tab - responsive 2-col grid (1-col on mobile via CSS)
  document.getElementById('proj-tab-overview').innerHTML =
    '<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:20px">' +
    '<div class="card"><div class="card-body" style="padding:16px">' +
    '<h4 style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin:0 0 14px;display:flex;align-items:center;gap:8px"><i data-lucide="info" style="width:14px;height:14px"></i> Project Info</h4>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">ID</span><span class="proj-fin-value" style="font-size:11px;font-family:monospace">' + escHtml(p.id) + '</span></div>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">Address</span><span class="proj-fin-value" style="text-align:right;max-width:60%">' + escHtml(p.address || '—') + '</span></div>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">Purchase Date</span><span class="proj-fin-value">' + fmtDate(p.purchase_date || p.purchaseDate) + '</span></div>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">Responsible</span><span class="proj-fin-value">' + escHtml(p.responsible || '—') + '</span></div>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">Created</span><span class="proj-fin-value">' + fmtDate(p.created_at || p.createdAt) + '</span></div>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">Status</span><span class="proj-fin-value" style="color:' + st.color + '">' + st.label + '</span></div>' +
    '</div></div></div>';

  var f = p._financials;
  var finTab = document.getElementById('proj-tab-financials');
  if (!f) {
    if (p._financialsLoading) {
      // Actively fetching — show spinner
      finTab.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:center;gap:10px;padding:48px;color:var(--text-muted)">' +
          '<i data-lucide="loader-2" style="width:20px;height:20px;animation:spin 1s linear infinite"></i>' +
          '<span style="font-size:13px">Loading financial summary…</span>' +
        '</div>';
    } else {
      // Fetch complete (or offline) — show clear unavailable state, no spinner
      finTab.innerHTML =
        '<div class="proj-empty" style="color:var(--text-muted);padding:64px 20px">' +
          '<div style="background:var(--bg-secondary);width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">' +
          '<i data-lucide="bar-chart-2" style="width:32px;height:32px;opacity:0.5"></i></div>' +
          '<p style="font-size:16px;font-weight:700;color:var(--text-primary);margin:0 0 8px">No financial summary yet</p>' +
          '<p style="font-size:13px;max-width:300px;margin:0 auto">Add project expenses, refunds, or disbursements to automatically generate this financial summary.</p>' +
        '</div>';
    }
    lucide.createIcons();
    return;
  }

  var costBasis = parseFloat(f.cost_basis ?? 0);
  var cashInvested = parseFloat(f.cash_invested ?? 0);
  var netExpense = parseFloat(f.net_expense_cost ?? 0);
  var disbursements = parseFloat(f.total_disbursements ?? 0);
  var cashPosition = parseFloat(f.project_cash_position ?? 0);
  var profit = parseFloat(f.profit ?? 0);

  // Append Cash Position Snapshot to overview (when financials exist)
  document.getElementById('proj-tab-overview').firstChild.innerHTML +=
    '<div class="card"><div class="card-body" style="padding:16px">' +
    '<h4 style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin:0 0 14px;display:flex;align-items:center;gap:8px"><i data-lucide="bar-chart-2" style="width:14px;height:14px"></i> Cash Position Snapshot</h4>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">Initial Cash Invested</span><span class="proj-fin-value">' + fmtMoney(cashInvested) + '</span></div>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">Net Expenses</span><span class="proj-fin-value" style="color:var(--danger)">' + fmtMoney(netExpense) + '</span></div>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">Disbursements</span><span class="proj-fin-value" style="color:var(--danger)">' + fmtMoney(disbursements) + '</span></div>' +
    '<div class="proj-fin-row" style="border-top:2px dashed var(--border);margin-top:8px;padding-top:12px"><span class="proj-fin-label" style="font-weight:700;font-size:13px">Project Cash Position</span><span class="proj-fin-value" style="font-size:18px;color:' + (cashPosition >= 0 ? '#059669' : '#e11d48') + '">' + fmtMoney(cashPosition) + '</span></div>' +
    '</div></div>';

  // Financials tab
  document.getElementById('proj-tab-financials').innerHTML =
    '<div style="background:var(--danger-bg, #fef2f2);color:var(--danger, #ef4444);padding:10px 14px;border-radius:8px;font-size:11px;font-weight:700;margin-bottom:20px;display:flex;align-items:center;gap:8px;border:1px solid #fee2e2">' +
    '<i data-lucide="shield-alert" style="width:16px;height:16px"></i> INTERNAL & ADMIN USE ONLY</div>' +
    
    '<div class="proj-summary-cards">' +
    '<div class="proj-stat-card"><div style="display:flex;justify-content:center;margin-bottom:8px;color:var(--text-muted)"><i data-lucide="home" style="width:18px;height:18px"></i></div><div class="proj-stat-value">' + fmtMoney(costBasis) + '</div><div class="proj-stat-label">Cost Basis</div></div>' +
    '<div class="proj-stat-card"><div style="display:flex;justify-content:center;margin-bottom:8px;color:var(--text-muted)"><i data-lucide="wallet" style="width:18px;height:18px"></i></div><div class="proj-stat-value">' + fmtMoney(cashInvested) + '</div><div class="proj-stat-label">Initial Cash</div></div>' +
    '<div class="proj-stat-card"><div style="display:flex;justify-content:center;margin-bottom:8px;color:var(--danger)"><i data-lucide="trending-down" style="width:18px;height:18px"></i></div><div class="proj-stat-value" style="color:var(--danger)">' + fmtMoney(netExpense) + '</div><div class="proj-stat-label">Net Expenses</div></div>' +
    '<div class="proj-stat-card"><div style="display:flex;justify-content:center;margin-bottom:8px;color:var(--danger)"><i data-lucide="external-link" style="width:18px;height:18px"></i></div><div class="proj-stat-value" style="color:var(--danger)">' + fmtMoney(disbursements) + '</div><div class="proj-stat-label">Disbursements</div></div>' +
    '<div class="proj-stat-card" style="background:' + (cashPosition >= 0 ? '#ecfdf5' : '#fff1f2') + ';border-color:' + (cashPosition >= 0 ? '#10b981' : '#f43f5e') + '">' +
    '<div style="display:flex;justify-content:center;margin-bottom:8px;color:' + (cashPosition >= 0 ? '#059669' : '#e11d48') + '"><i data-lucide="banknote" style="width:18px;height:18px"></i></div>' +
    '<div class="proj-stat-value" style="color:' + (cashPosition >= 0 ? '#059669' : '#e11d48') + '">' + fmtMoney(cashPosition) + '</div><div class="proj-stat-label" style="color:' + (cashPosition >= 0 ? '#059669' : '#e11d48') + '">Cash Position</div></div>' +
    '</div>' +

    '<div style="display:grid;grid-template-columns:1fr;gap:20px;margin-top:20px">' +
    '<div class="card" style="border:1px solid var(--border);border-radius:12px;overflow:hidden">' +
    '<div style="background:var(--bg-secondary);padding:12px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px">' +
    '<i data-lucide="pie-chart" style="width:18px;height:18px;color:var(--accent)"></i>' +
    '<h4 style="margin:0;font-size:14px;font-weight:700">Profit & Loss Metrics</h4></div>' +
    '<div class="card-body" style="padding:20px">' +
    '<div class="proj-fin-row"><span class="proj-fin-label">Sale Price</span><span class="proj-fin-value">' + fmtMoney(f.sale_price) + '</span></div>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">Net Proceeds</span><span class="proj-fin-value">' + fmtMoney(f.net_proceeds) + '</span></div>' +
    '<div class="proj-fin-row" style="border-top:2px dashed var(--border);margin-top:12px;padding-top:16px">' +
    '<span class="proj-fin-label" style="font-weight:700;font-size:14px">Final Profit</span>' +
    '<span class="proj-fin-value" style="font-size:24px;color:' + (profit >= 0 ? 'var(--success)' : 'var(--danger)') + '">' + (profit >= 0 ? '+' : '') + fmtMoney(profit) + '</span></div>' +
    '</div></div></div>';

  lucide.createIcons();
}

// ---- Expenses / Refunds / Disbursements Logic ----
var _currentExpenses = [];
var _currentRefunds = [];
var _currentDisbursements = [];

async function fetchProjectFinancials() {
  if (!_currentProject) return;

  // Fetch per-project financial summary via RPC and refresh the financials tab
  var finSummary = await DB.projectFinancialSummaries.getByProject(_currentProject.id);
  // Mark loading as complete regardless of result
  _currentProject._financialsLoading = false;
  if (finSummary) {
    _currentProject._financials = finSummary;
    renderProjectDetail(); // re-render now that we have data
  } else {
    // No summary yet — renderProjectDetail will show the empty state (not spinner)
    var finTab = document.getElementById('proj-tab-financials');
    if (finTab) {
      finTab.innerHTML =
        '<div class="proj-empty" style="color:var(--text-muted);padding:64px 20px">' +
          '<div style="background:var(--bg-secondary);width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">' +
          '<i data-lucide="bar-chart-2" style="width:32px;height:32px;opacity:0.5"></i></div>' +
          '<p style="font-size:16px;font-weight:700;color:var(--text-primary);margin:0 0 8px">No financial summary yet</p>' +
          '<p style="font-size:13px;max-width:300px;margin:0 auto">Add project expenses, refunds, or disbursements to automatically generate this financial summary.</p>' +
        '</div>';
      lucide.createIcons();
    }
  }

  // Fetch transactional data for expense/disbursement tabs
  _currentExpenses = await DB.projectExpenses.getByProject(_currentProject.id) || [];
  _currentRefunds = await DB.projectRefunds.getByProject(_currentProject.id) || [];
  _currentDisbursements = await DB.projectDisbursements.getByProject(_currentProject.id) || [];
  renderExpensesTab();
  renderDisbursementsTab();
}

function renderExpensesTab() {
  var html = '<div style="background:var(--danger-bg, #fef2f2);color:var(--danger, #ef4444);padding:8px;border-radius:6px;font-size:11px;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:6px"><i data-lucide="shield-alert" style="width:14px;height:14px"></i> INTERNAL & ADMIN USE ONLY</div>' +
    '<div style="display:flex;justify-content:flex-end;gap:10px;margin-bottom:16px">' +
    '<button class="btn btn-sm" style="background:var(--success);color:#fff;border:none" onclick="openExpenseModal(\'refund\')">+ Add Refund</button>' +
    '<button class="btn btn-primary btn-sm" onclick="openExpenseModal(\'expense\')">+ Add Expense</button>' +
    '</div>';

  html += '<div style="overflow-x:auto;width:100%"><table class="proj-table"><thead><tr>' +
    '<th>Date</th><th>Type</th><th>Vendor</th><th>Category</th><th>Amount</th><th>Status</th><th>Actions</th>' +
    '</tr></thead><tbody>';

  var combined = [].concat(
    _currentExpenses.map(function(e) { e._type = 'expense'; return e; }),
    _currentRefunds.map(function(r) { r._type = 'refund'; return r; })
  ).sort(function(a,b) { return new Date(b.created_at) - new Date(a.created_at); });

  if (combined.length === 0) {
    html += '<tr><td colspan="7" class="proj-empty" style="padding:40px">No records found.</td></tr>';
  } else {
    combined.forEach(function(item) {
      var isExp = item._type === 'expense';
      var col = isExp ? 'var(--danger)' : 'var(--success)';
      var sign = isExp ? '-' : '+';
      var stColor = item.status === 'approved' ? 'var(--success)' : (item.status === 'cancelled' || item.status === 'rejected' ? 'var(--danger)' : 'var(--text-muted)');
      
      html += '<tr>' +
        '<td>' + fmtDate(item.receipt_date) + '</td>' +
        '<td><span style="font-size:10px;padding:2px 6px;border-radius:4px;background:' + col + '20;color:' + col + '">' + item._type.toUpperCase() + '</span></td>' +
        '<td>' + escHtml(item.vendor) + '<div style="font-size:10px;color:var(--text-muted)">' + escHtml(item.description) + '</div></td>' +
        '<td>' + escHtml(item.category || '—') + '</td>' +
        '<td style="font-weight:700;color:' + col + '">' + sign + fmtMoney(item.amount) + '</td>' +
        '<td style="color:' + stColor + ';font-size:11px;font-weight:600">' + item.status.toUpperCase() + '</td>' +
        '<td>';
      if (item.status === 'pending') {
         html += '<button class="btn btn-ghost btn-sm" onclick="approveRecord(\'' + item.id + '\',\'' + item._type + '\', \'approved\')">Approve</button> ';
      }
      if (item.status !== 'cancelled') {
         html += '<button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="cancelRecord(\'' + item.id + '\',\'' + item._type + '\')">Void</button>';
      }
      html += '</td></tr>';
    });
  }

  html += '</tbody></table></div>';
  var t = document.getElementById('proj-tab-expenses');
  if(t) t.innerHTML = html;
}

function renderDisbursementsTab() {
  var html = '<div style="background:var(--danger-bg, #fef2f2);color:var(--danger, #ef4444);padding:8px;border-radius:6px;font-size:11px;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:6px"><i data-lucide="shield-alert" style="width:14px;height:14px"></i> INTERNAL & ADMIN USE ONLY</div>' +
    '<div style="display:flex;justify-content:flex-end;gap:10px;margin-bottom:16px">' +
    '<button class="btn btn-primary btn-sm" onclick="openDisbursementModal()">+ Add Disbursement</button>' +
    '</div>';

  html += '<div style="overflow-x:auto;width:100%"><table class="proj-table"><thead><tr>' +
    '<th>Date</th><th>Type</th><th>Beneficiary</th><th>Ref/Desc</th><th>Amount</th><th>Status</th><th>Actions</th>' +
    '</tr></thead><tbody>';

  if (_currentDisbursements.length === 0) {
    html += '<tr><td colspan="7" class="proj-empty" style="padding:40px">No disbursements found.</td></tr>';
  } else {
    _currentDisbursements.forEach(function(item) {
      var col = 'var(--danger)';
      var sign = '-';
      var stColor = (item.status === 'approved' || item.status === 'paid') ? 'var(--success)' : (item.status === 'cancelled' || item.status === 'rejected' ? 'var(--danger)' : 'var(--text-muted)');
      
      html += '<tr>' +
        '<td>' + fmtDate(item.payment_date) + '</td>' +
        '<td><span style="font-size:10px;padding:2px 6px;border-radius:4px;background:var(--bg-secondary);border:1px solid var(--border)">' + (item.payment_type || 'check').toUpperCase() + '</span></td>' +
        '<td>' + escHtml(item.beneficiary) + '</td>' +
        '<td><div style="font-size:12px">' + escHtml(item.reference_number || '—') + '</div><div style="font-size:10px;color:var(--text-muted)">' + escHtml(item.description) + '</div></td>' +
        '<td style="font-weight:700;color:' + col + '">' + sign + fmtMoney(item.amount) + '</td>' +
        '<td style="color:' + stColor + ';font-size:11px;font-weight:600">' + item.status.toUpperCase() + '</td>' +
        '<td>';
      if (item.status === 'pending') {
         html += '<button class="btn btn-ghost btn-sm" onclick="approveRecord(\'' + item.id + '\',\'disbursement\', \'approved\')">Approve</button> ';
      }
      if (item.status === 'approved') {
         html += '<button class="btn btn-ghost btn-sm" style="color:var(--success)" onclick="approveRecord(\'' + item.id + '\',\'disbursement\', \'paid\')">Mark Paid</button> ';
      }
      if (item.status !== 'cancelled') {
         html += '<button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="cancelRecord(\'' + item.id + '\',\'disbursement\')">Void</button>';
      }
      html += '</td></tr>';
    });
  }

  html += '</tbody></table></div>';
  var t = document.getElementById('proj-tab-disbursements');
  if(t) t.innerHTML = html;
}

function openExpenseModal(type) {
  if (!_currentProject) return;
  var isExp = type === 'expense';
  showConfirmModal('Add ' + (isExp ? 'Expense' : 'Refund'), '', null);
  var box = document.querySelector('.confirm-box');
  box.innerHTML =
    '<h3 style="margin:0 0 16px;font-size:16px">Add ' + (isExp ? 'Expense' : 'Refund') + '</h3>' +
    '<div style="display:flex;flex-direction:column;gap:10px;text-align:left">' +
    '<div><label style="font-size:12px;color:var(--text-secondary)">Vendor</label>' +
    '<input type="text" id="fin-vendor" class="form-control" style="width:100%"></div>' +
    '<div><label style="font-size:12px;color:var(--text-secondary)">Description</label>' +
    '<input type="text" id="fin-desc" class="form-control" style="width:100%"></div>' +
    '<div style="display:flex;gap:10px">' +
    '<div style="flex:1"><label style="font-size:12px;color:var(--text-secondary)">Amount ($)</label>' +
    '<input type="number" id="fin-amount" class="form-control" step="0.01" style="width:100%"></div>' +
    (isExp ? '<div style="flex:1"><label style="font-size:12px;color:var(--text-secondary)">Tax ($)</label><input type="number" id="fin-tax" class="form-control" step="0.01" style="width:100%" value="0"></div>' : '') +
    '</div>' +
    '<div style="display:flex;gap:10px">' +
    '<div style="flex:1"><label style="font-size:12px;color:var(--text-secondary)">Date</label>' +
    '<input type="date" id="fin-date" class="form-control" style="width:100%" value="' + new Date().toISOString().split('T')[0] + '"></div>' +
    (isExp ? '<div style="flex:1"><label style="font-size:12px;color:var(--text-secondary)">Category</label>' +
    '<select id="fin-cat" class="form-control" style="width:100%"><option value="materials">Materials</option><option value="tools">Tools</option><option value="subcontractor">Subcontractor</option><option value="rental">Rental</option><option value="permits">Permits</option><option value="other">Other</option></select></div>' : '') +
    '</div></div>' +
    '<div class="confirm-actions" style="margin-top:16px">' +
    '<button type="button" class="btn btn-secondary" onclick="closeConfirmModal()">Close</button>' +
    '<button type="button" class="btn btn-primary" onclick="saveFinRecord(\'' + type + '\')">Save</button></div>';
}

function openDisbursementModal() {
  if (!_currentProject) return;
  showConfirmModal('Add Disbursement', '', null);
  var box = document.querySelector('.confirm-box');
  box.innerHTML =
    '<h3 style="margin:0 0 16px;font-size:16px">Add Disbursement</h3>' +
    '<div style="display:flex;flex-direction:column;gap:10px;text-align:left">' +
    '<div><label style="font-size:12px;color:var(--text-secondary)">Beneficiary</label>' +
    '<input type="text" id="disb-ben" class="form-control" style="width:100%"></div>' +
    '<div><label style="font-size:12px;color:var(--text-secondary)">Description</label>' +
    '<input type="text" id="disb-desc" class="form-control" style="width:100%"></div>' +
    '<div style="display:flex;gap:10px">' +
    '<div style="flex:1"><label style="font-size:12px;color:var(--text-secondary)">Amount ($)</label>' +
    '<input type="number" id="disb-amount" class="form-control" step="0.01" style="width:100%"></div>' +
    '<div style="flex:1"><label style="font-size:12px;color:var(--text-secondary)">Payment Type</label>' +
    '<select id="disb-type" class="form-control" style="width:100%"><option value="check">Check</option><option value="cash">Cash</option><option value="transfer">Transfer</option><option value="card">Card</option></select></div>' +
    '</div>' +
    '<div style="display:flex;gap:10px">' +
    '<div style="flex:1"><label style="font-size:12px;color:var(--text-secondary)">Payment Date</label>' +
    '<input type="date" id="disb-date" class="form-control" style="width:100%" value="' + new Date().toISOString().split('T')[0] + '"></div>' +
    '<div style="flex:1"><label style="font-size:12px;color:var(--text-secondary)">Ref. Number</label>' +
    '<input type="text" id="disb-ref" class="form-control" style="width:100%" placeholder="Check #, etc."></div>' +
    '</div></div>' +
    '<div class="confirm-actions" style="margin-top:16px">' +
    '<button type="button" class="btn btn-secondary" onclick="closeConfirmModal()">Close</button>' +
    '<button type="button" class="btn btn-primary" onclick="saveDisbursement()">Save</button></div>';
}

async function saveDisbursement() {
  var amt = Math.abs(parseFloat(document.getElementById('disb-amount').value) || 0);
  if (amt <= 0) { alert('Amount must be > 0'); return; }

  var data = {
    project_id: _currentProject.id,
    beneficiary: (document.getElementById('disb-ben').value || '').trim(),
    description: (document.getElementById('disb-desc').value || '').trim(),
    amount: amt,
    payment_type: document.getElementById('disb-type').value,
    payment_date: document.getElementById('disb-date').value || null,
    reference_number: (document.getElementById('disb-ref').value || '').trim(),
    status: 'pending' // default to pending to test approval flow
  };

  var res = await DB.projectDisbursements.create(data);
  closeConfirmModal();
  if (res) {
    showToast('✅ Disbursement saved');
    await fetchProjectFinancials();
    await loadProjects();
    _currentProject = PROJECTS.find(function(p) { return p.id === _currentProject.id; });
    renderProjectDetail();
  } else {
    alert('Failed to save disbursement.');
  }
}

async function saveFinRecord(type) {
  var amt = Math.abs(parseFloat(document.getElementById('fin-amount').value) || 0);
  if (amt <= 0) { alert('Amount must be > 0'); return; }

  var data = {
    project_id: _currentProject.id,
    vendor: (document.getElementById('fin-vendor').value || '').trim(),
    description: (document.getElementById('fin-desc').value || '').trim(),
    amount: amt,
    receipt_date: document.getElementById('fin-date').value || null,
    status: 'pending' // default to pending to test approval flow
  };

  if (type === 'expense') {
    data.tax = Math.abs(parseFloat(document.getElementById('fin-tax').value) || 0);
    data.category = document.getElementById('fin-cat').value;
    var res = await DB.projectExpenses.create(data);
  } else {
    var res = await DB.projectRefunds.create(data);
  }

  closeConfirmModal();
  if (res) {
    showToast('✅ Saved');
    await fetchProjectFinancials(); // refresh tab
    await loadProjects(); // refresh global financials
    _currentProject = PROJECTS.find(function(p) { return p.id === _currentProject.id; });
    renderProjectDetail(); // refresh cards
  } else {
    alert('Failed to save record.');
  }
}

async function approveRecord(id, type, targetStatus) {
  var status = targetStatus || 'approved';
  var ok = false;
  if (type === 'expense') ok = await DB.projectExpenses.updateStatus(id, status);
  else if (type === 'refund') ok = await DB.projectRefunds.updateStatus(id, status);
  else if (type === 'disbursement') ok = await DB.projectDisbursements.updateStatus(id, status);

  if (ok) {
    await fetchProjectFinancials();
    await loadProjects();
    _currentProject = PROJECTS.find(function(p) { return p.id === _currentProject.id; });
    renderProjectDetail();
  }
}

async function cancelRecord(id, type) {
  showConfirmModal('Void Record', 'This will mark the record as cancelled to retain financial history (Rule 14).', async function() {
    var ok = false;
    if (type === 'expense') ok = await DB.projectExpenses.updateStatus(id, 'cancelled');
    else if (type === 'refund') ok = await DB.projectRefunds.updateStatus(id, 'cancelled');
    else if (type === 'disbursement') ok = await DB.projectDisbursements.updateStatus(id, 'cancelled');

    if (ok) {
      showToast('Record voided');
      await fetchProjectFinancials();
      await loadProjects();
      _currentProject = PROJECTS.find(function(p) { return p.id === _currentProject.id; });
      renderProjectDetail();
    } else {
      alert('Failed to void');
    }
  });
}

// ============================================================
// WORK ORDERS TAB
// ============================================================
async function renderWorkOrdersTab() {
  if (!_currentProject) return;
  var tab = document.getElementById('proj-tab-workorders');
  if (!tab) return;

  tab.innerHTML = '<div style="padding:20px;color:var(--text-muted);font-size:13px">Loading Work Orders...</div>';

  if (typeof isSupabaseReady !== 'function' || !isSupabaseReady()) {
    tab.innerHTML = '<div class="proj-empty">Supabase not connected. Work Orders require a live DB.</div>';
    return;
  }

  var allWOs = await DB.workOrders.getAll();
  if (!allWOs) allWOs = [];

  // ── Strict project_id match only ──────────────────────────────────────────
  // Phase B: work_orders.project_id is now a real FK (TEXT → projects.id).
  // Property-string heuristic removed. Existing WOs with project_id = null
  // will NOT appear here until manually assigned via the WO creation modal.
  var matchedWOs = allWOs.filter(function(wo) {
    return wo.project_id === _currentProject.id;
  });

  if (matchedWOs.length === 0) {
    tab.innerHTML =
      '<div class="proj-empty" style="color:var(--text-muted);padding:64px 20px">' +
        '<div style="background:var(--bg-secondary);width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">' +
        '<i data-lucide="clipboard-list" style="width:32px;height:32px;opacity:0.5"></i></div>' +
        '<p style="font-size:16px;font-weight:700;color:var(--text-primary);margin:0 0 8px">No linked work orders found for this project.</p>' +
        '<p style="font-size:13px;max-width:380px;margin:0 auto;line-height:1.6">' +
          'Work Orders created before the project link was available will need to be re-created or manually assigned via the Work Orders module.' +
        '</p>' +
      '</div>';
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }

  var html = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
    '<h4 style="margin:0;font-size:13px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px">Linked Work Orders</h4>' +
    '<span style="font-size:11px;color:var(--text-muted)">' + matchedWOs.length + ' found</span>' +
    '</div>';

  html += '<div style="overflow-x:auto;width:100%"><table class="proj-table"><thead><tr>' +
    '<th>ID</th><th>Title</th><th>Client</th><th>Status</th><th>Total</th>' +
    '</tr></thead><tbody>';

  matchedWOs.forEach(function(wo) {
    var stColor = wo.status === 'completed' ? 'var(--success)' : (wo.status === 'cancelled' ? 'var(--danger)' : 'var(--accent)');
    html += '<tr>' +
      '<td style="font-family:monospace;font-size:11px">' + escHtml(wo.id) + '</td>' +
      '<td><div style="font-weight:600">' + escHtml(wo.title) + '</div><div style="font-size:10px;color:var(--text-muted)">' + escHtml(wo.property) + '</div></td>' +
      '<td>' + escHtml(wo.client || '—') + '</td>' +
      '<td><span style="font-size:11px;font-weight:700;color:' + stColor + '">' + (wo.status || 'pending').toUpperCase() + '</span></td>' +
      '<td style="font-weight:700">' + fmtMoney(wo.total) + '</td>' +
      '</tr>';
  });

  html += '</tbody></table></div>';
  tab.innerHTML = html;
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ============================================================
// INVESTOR HUB — Phase 2B
// INTERNAL & ADMIN USE ONLY
// Rules: No delete. No ROI. No distributions. No profit split.
// Capital contributions do NOT affect project_financial_summaries.
// ============================================================

var _ihInvestors = [];
var _ihContribs  = [];
var _ihCalls     = [];

async function renderInvestorHub(projectId) {
  var tab = document.getElementById('proj-tab-investorhub');
  if (!tab) return;
  tab.innerHTML = '<div style="padding:20px;color:var(--text-muted);font-size:13px">Loading Investor Hub...</div>';
  if (typeof isSupabaseReady !== 'function' || !isSupabaseReady()) {
    tab.innerHTML = '<div class="proj-empty">Supabase not connected. Investor Hub requires live DB.</div>';
    return;
  }
  var pis      = await DB.projectInvestors.getByProject(projectId) || [];
  var contribs = await DB.capitalContributions.getByProject(projectId) || [];
  var calls    = await DB.capitalCalls.getByProject(projectId) || [];
  _ihInvestors = pis;
  _ihContribs  = contribs;
  _ihCalls     = calls;

  var totalConfirmed = contribs
    .filter(function(c){ return c.status === 'confirmed'; })
    .reduce(function(s,c){ return s + (parseFloat(c.amount)||0); }, 0);
  var totalPending = contribs
    .filter(function(c){ return c.status === 'pending'; })
    .reduce(function(s,c){ return s + (parseFloat(c.amount)||0); }, 0);
  var SCOL = { pending:'#f59e0b', confirmed:'#10b981', cancelled:'#9ca3af' };
  var ROLES = { lead_contractor:'Lead Contractor', equity_partner:'Equity Partner', silent_partner:'Silent Partner', other:'Other' };

  var html = '<div style="background:#fef2f2;color:#ef4444;padding:8px 12px;border-radius:6px;font-size:11px;font-weight:700;margin-bottom:16px">🔒 INTERNAL &amp; ADMIN USE ONLY — Investor Hub Phase 2B</div>'
    + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px">'
    + '<div class="proj-stat-card"><div class="proj-stat-value" style="font-size:20px">' + pis.filter(function(x){return x.status!=='cancelled';}).length + '</div><div class="proj-stat-label">Investors</div></div>'
    + '<div class="proj-stat-card"><div class="proj-stat-value" style="font-size:20px;color:#10b981">' + fmtMoney(totalConfirmed) + '</div><div class="proj-stat-label">Confirmed Capital</div></div>'
    + '<div class="proj-stat-card"><div class="proj-stat-value" style="font-size:20px;color:#f59e0b">' + fmtMoney(totalPending) + '</div><div class="proj-stat-label">Pending Capital</div></div>'
    + '</div>';

  // Investors
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">'
    + '<h4 style="margin:0;font-size:13px">Investors</h4>'
    + '<button class="btn btn-primary btn-sm" onclick="openAddInvestorModal()" style="font-size:12px">+ Add Investor</button></div>';
  if (!pis.length) {
    html += '<p style="color:var(--text-muted);font-size:13px;padding:12px 0">No investors attached yet.</p>';
  } else {
    html += '<table class="proj-table" style="margin-bottom:20px"><thead><tr><th>Name</th><th>Role</th><th>Status</th><th></th></tr></thead><tbody>';
    pis.forEach(function(pi) {
      var n = pi.investors ? escHtml(pi.investors.name) : '—';
      html += '<tr><td>' + n + '</td><td>' + (ROLES[pi.role]||pi.role) + '</td>'
        + '<td><span style="font-size:11px;font-weight:700;color:' + (SCOL[pi.status]||'#999') + '">' + pi.status.toUpperCase() + '</span></td>'
        + '<td style="display:flex;gap:4px">'
        + (pi.status==='pending' ? '<button class="btn btn-sm" style="font-size:11px;background:#10b981;color:#fff;border:none" onclick="ihConfirmPI(\'' + pi.id + '\')">Confirm</button>' : '')
        + (pi.status!=='cancelled' ? '<button class="btn btn-sm btn-secondary" style="font-size:11px" onclick="ihCancelPI(\'' + pi.id + '\')">Void</button>' : '')
        + '</td></tr>';
    });
    html += '</tbody></table>';
  }

  // Contributions
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">'
    + '<h4 style="margin:0;font-size:13px">Capital Contributions</h4>'
    + '<button class="btn btn-primary btn-sm" onclick="openAddContribModal()" style="font-size:12px">+ Add Contribution</button></div>';
  if (!contribs.length) {
    html += '<p style="color:var(--text-muted);font-size:13px;padding:12px 0">No contributions recorded yet.</p>';
  } else {
    html += '<table class="proj-table" style="margin-bottom:20px"><thead><tr><th>Investor</th><th>Date</th><th>Amount</th><th>Type</th><th>Method</th><th>Status</th><th></th></tr></thead><tbody>';
    contribs.forEach(function(c) {
      var inv = c.investors ? escHtml(c.investors.name) : '—';
      html += '<tr><td>' + inv + '</td><td>' + fmtDate(c.date) + '</td>'
        + '<td style="font-weight:700">' + fmtMoney(c.amount) + '</td>'
        + '<td>' + c.type + '</td><td>' + c.method + '</td>'
        + '<td><span style="font-size:11px;font-weight:700;color:' + (SCOL[c.status]||'#999') + '">' + c.status.toUpperCase() + '</span></td>'
        + '<td style="display:flex;gap:4px">'
        + (c.status==='pending' ? '<button class="btn btn-sm" style="font-size:11px;background:#10b981;color:#fff;border:none" onclick="ihConfirmContrib(\'' + c.id + '\')">Confirm</button>' : '')
        + (c.status!=='cancelled' ? '<button class="btn btn-sm btn-secondary" style="font-size:11px" onclick="ihCancelContrib(\'' + c.id + '\')">Void</button>' : '')
        + '</td></tr>';
    });
    html += '</tbody></table>';
  }

  // Capital Calls
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">'
    + '<h4 style="margin:0;font-size:13px">Capital Calls</h4>'
    + '<button class="btn btn-secondary btn-sm" onclick="openAddCallModal()" style="font-size:12px">+ Add Capital Call</button></div>';
  if (!calls.length) {
    html += '<p style="color:var(--text-muted);font-size:13px;padding:12px 0">No capital calls recorded.</p>';
  } else {
    html += '<table class="proj-table"><thead><tr><th>Amount</th><th>Reason</th><th>Due Date</th><th>Status</th><th></th></tr></thead><tbody>';
    calls.forEach(function(cl) {
      html += '<tr><td style="font-weight:700">' + fmtMoney(cl.requested_amount) + '</td>'
        + '<td>' + escHtml(cl.reason) + '</td><td>' + fmtDate(cl.due_date) + '</td>'
        + '<td><span style="font-size:11px;font-weight:700;color:' + (SCOL[cl.status]||'#999') + '">' + cl.status.toUpperCase() + '</span></td>'
        + '<td style="display:flex;gap:4px">'
        + (cl.status==='pending' ? '<button class="btn btn-sm" style="font-size:11px;background:#10b981;color:#fff;border:none" onclick="ihConfirmCall(\'' + cl.id + '\')">Confirm</button>' : '')
        + (cl.status!=='cancelled' ? '<button class="btn btn-sm btn-secondary" style="font-size:11px" onclick="ihCancelCall(\'' + cl.id + '\')">Void</button>' : '')
        + '</td></tr>';
    });
    html += '</tbody></table>';
  }

  tab.innerHTML = html;
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function ihConfirmPI(id) {
  if (await DB.projectInvestors.confirm(id)) { showToast('Investor confirmed'); renderInvestorHub(_currentProject.id); }
}
async function ihCancelPI(id) {
  showConfirmModal('Void Investor Link', 'Mark this investor link as cancelled? Record is retained.', async function() {
    if (await DB.projectInvestors.cancel(id)) { showToast('Investor link voided'); renderInvestorHub(_currentProject.id); }
  });
}
async function ihConfirmContrib(id) {
  if (await DB.capitalContributions.confirm(id)) { showToast('Contribution confirmed'); renderInvestorHub(_currentProject.id); }
}
async function ihCancelContrib(id) {
  showConfirmModal('Void Contribution', 'Mark as cancelled? Record is retained (Rule 2B-NO-DELETE).', async function() {
    if (await DB.capitalContributions.cancel(id)) { showToast('Contribution voided'); renderInvestorHub(_currentProject.id); }
  });
}
async function ihConfirmCall(id) {
  if (await DB.capitalCalls.confirm(id)) { showToast('Capital call confirmed'); renderInvestorHub(_currentProject.id); }
}
async function ihCancelCall(id) {
  showConfirmModal('Void Capital Call', 'Mark this capital call as cancelled?', async function() {
    if (await DB.capitalCalls.cancel(id)) { showToast('Capital call voided'); renderInvestorHub(_currentProject.id); }
  });
}

async function openAddInvestorModal() {
  var allInvestors = await DB.investors.getAll() || [];
  showConfirmModal('Add Investor to Project', '', null);
  var box = document.querySelector('.confirm-box');
  box.innerHTML = '<h3 style="margin:0 0 14px;font-size:15px">Add Investor to Project</h3>'
    + '<div style="font-size:11px;color:#ef4444;font-weight:700;margin-bottom:12px">🔒 INTERNAL USE ONLY</div>'
    + '<div style="display:flex;flex-direction:column;gap:10px;text-align:left">'
    + '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Select Existing Investor</label>'
    + '<select id="ih-inv-sel" class="form-control" style="width:100%"><option value="">— Select —</option>'
    + allInvestors.map(function(i){ return '<option value="' + i.id + '">' + escHtml(i.name) + '</option>'; }).join('') + '</select></div>'
    + '<div style="font-size:11px;color:var(--text-muted);text-align:center">— or create new —</div>'
    + '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">New Investor Name</label>'
    + '<input type="text" id="ih-inv-name" class="form-control" placeholder="Full name or company" style="width:100%"></div>'
    + '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Type</label>'
    + '<select id="ih-inv-type" class="form-control" style="width:100%"><option value="person">Person</option><option value="company">Company</option></select></div>'
    + '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Role in Project</label>'
    + '<select id="ih-inv-role" class="form-control" style="width:100%">'
    + '<option value="equity_partner">Equity Partner</option><option value="lead_contractor">Lead Contractor</option>'
    + '<option value="silent_partner">Silent Partner</option><option value="other">Other</option></select></div>'
    + '<div style="display:flex;gap:8px;margin-top:8px">'
    + '<button class="btn btn-secondary" onclick="closeConfirmModal()" style="flex:1">Cancel</button>'
    + '<button class="btn btn-primary" onclick="saveAddInvestor()" style="flex:1">Attach Investor</button></div></div>';
}

async function saveAddInvestor() {
  var sel  = document.getElementById('ih-inv-sel').value;
  var name = (document.getElementById('ih-inv-name').value || '').trim();
  var type = document.getElementById('ih-inv-type').value;
  var role = document.getElementById('ih-inv-role').value;
  var invId = sel;
  if (!invId && name) {
    var inv = await DB.investors.create({ name: name, type: type });
    if (!inv) { alert('Failed to create investor'); return; }
    invId = inv.id;
  }
  if (!invId) { alert('Select or create an investor first'); return; }
  var pi = await DB.projectInvestors.attach(_currentProject.id, invId, role);
  closeConfirmModal();
  if (pi) { showToast('Investor attached (pending)'); renderInvestorHub(_currentProject.id); }
  else { alert('Failed to attach investor'); }
}

async function openAddContribModal() {
  var pis = _ihInvestors.filter(function(x){ return x.status !== 'cancelled'; });
  showConfirmModal('Add Capital Contribution', '', null);
  var box = document.querySelector('.confirm-box');
  box.innerHTML = '<h3 style="margin:0 0 14px;font-size:15px">Add Capital Contribution</h3>'
    + '<div style="font-size:11px;color:#ef4444;font-weight:700;margin-bottom:12px">🔒 INTERNAL — Capital ≠ Expense. Does NOT affect financial summaries.</div>'
    + '<div style="display:flex;flex-direction:column;gap:10px;text-align:left">'
    + '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Investor *</label>'
    + '<select id="ih-c-inv" class="form-control" style="width:100%"><option value="">— Select —</option>'
    + pis.map(function(pi){ var n = pi.investors ? pi.investors.name : pi.investor_id; return '<option value="' + pi.investor_id + '">' + escHtml(n) + '</option>'; }).join('') + '</select></div>'
    + '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Amount * (must be &gt; 0)</label>'
    + '<input type="number" id="ih-c-amt" class="form-control" min="0.01" step="0.01" placeholder="e.g. 20000" style="width:100%"></div>'
    + '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Date *</label>'
    + '<input type="date" id="ih-c-date" class="form-control" value="' + new Date().toISOString().split('T')[0] + '" style="width:100%"></div>'
    + '<div style="display:flex;gap:10px">'
    + '<div style="flex:1"><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Type</label>'
    + '<select id="ih-c-type" class="form-control" style="width:100%"><option value="initial">Initial</option><option value="additional">Additional</option><option value="closing">Closing</option><option value="reimbursement">Reimbursement</option></select></div>'
    + '<div style="flex:1"><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Method</label>'
    + '<select id="ih-c-mth" class="form-control" style="width:100%"><option value="wire">Wire</option><option value="check">Check</option><option value="cash">Cash</option><option value="company_payment">Company Payment</option></select></div></div>'
    + '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Evidence Reference</label>'
    + '<input type="text" id="ih-c-evid" class="form-control" placeholder="Check #, wire ref…" style="width:100%"></div>'
    + '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Notes</label>'
    + '<input type="text" id="ih-c-notes" class="form-control" placeholder="Optional" style="width:100%"></div>'
    + '<div style="display:flex;gap:8px;margin-top:8px">'
    + '<button class="btn btn-secondary" onclick="closeConfirmModal()" style="flex:1">Cancel</button>'
    + '<button class="btn btn-primary" onclick="saveAddContrib()" style="flex:1">Save Contribution</button></div></div>';
}

async function saveAddContrib() {
  var invId  = document.getElementById('ih-c-inv').value;
  var amount = parseFloat(document.getElementById('ih-c-amt').value) || 0;
  var date   = document.getElementById('ih-c-date').value;
  var type   = document.getElementById('ih-c-type').value;
  var method = document.getElementById('ih-c-mth').value;
  var evid   = document.getElementById('ih-c-evid').value || '';
  var notes  = document.getElementById('ih-c-notes').value || '';
  if (!invId) { alert('Select an investor'); return; }
  if (amount <= 0) { alert('Amount must be > 0'); return; }
  if (!date) { alert('Date is required'); return; }
  var res = await DB.capitalContributions.create({ project_id: _currentProject.id, investor_id: invId, amount: amount, date: date, type: type, method: method, evidence_reference: evid, notes: notes });
  closeConfirmModal();
  if (res) { showToast('Contribution saved (pending)'); renderInvestorHub(_currentProject.id); }
  else { alert('Failed to save contribution.'); }
}

function openAddCallModal() {
  showConfirmModal('Add Capital Call', '', null);
  var box = document.querySelector('.confirm-box');
  box.innerHTML = '<h3 style="margin:0 0 14px;font-size:15px">Add Capital Call</h3>'
    + '<div style="display:flex;flex-direction:column;gap:10px;text-align:left">'
    + '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Amount Requested *</label>'
    + '<input type="number" id="ih-cc-amt" class="form-control" min="0.01" step="0.01" placeholder="e.g. 5000" style="width:100%"></div>'
    + '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Reason *</label>'
    + '<input type="text" id="ih-cc-rsn" class="form-control" placeholder="Why is capital needed?" style="width:100%"></div>'
    + '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Due Date</label>'
    + '<input type="date" id="ih-cc-due" class="form-control" style="width:100%"></div>'
    + '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Notes</label>'
    + '<input type="text" id="ih-cc-nts" class="form-control" style="width:100%"></div>'
    + '<div style="display:flex;gap:8px;margin-top:8px">'
    + '<button class="btn btn-secondary" onclick="closeConfirmModal()" style="flex:1">Cancel</button>'
    + '<button class="btn btn-primary" onclick="saveAddCall()" style="flex:1">Save Capital Call</button></div></div>';
}

async function saveAddCall() {
  var amount = parseFloat(document.getElementById('ih-cc-amt').value) || 0;
  var reason = (document.getElementById('ih-cc-rsn').value || '').trim();
  var due    = document.getElementById('ih-cc-due').value || null;
  var notes  = document.getElementById('ih-cc-nts').value || '';
  if (amount <= 0) { alert('Amount must be > 0'); return; }
  if (!reason) { alert('Reason is required'); return; }
  var res = await DB.capitalCalls.create({ project_id: _currentProject.id, requested_amount: amount, reason: reason, due_date: due, notes: notes });
  closeConfirmModal();
  if (res) { showToast('Capital call recorded'); renderInvestorHub(_currentProject.id); }
  else { alert('Failed to save capital call.'); }
}
