// ============================================================
// PROJECTS & FINANCIAL CONTROL — Phase 2
// Storage: Supabase (with localStorage fallback)
// ============================================================

var PROJECTS = [];
var _currentProject = null;

var PROJECT_STATUSES = {
  planning:    { label: 'Planning',     color: '#64748b', bg: '#64748b18' },
  active:      { label: 'Active',       color: '#3b82f6', bg: '#3b82f618' },
  in_progress: { label: 'In Progress',  color: '#f59e0b', bg: '#f59e0b18' },
  completed:   { label: 'Completed',    color: '#10b981', bg: '#10b98118' },
  on_hold:     { label: 'On Hold',      color: '#ef4444', bg: '#ef444418' },
  cancelled:   { label: 'Cancelled',    color: '#9ca3af', bg: '#9ca3af18' },
  sold:        { label: 'Sold',         color: '#8b5cf6', bg: '#8b5cf618' }
};

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

function showConfirmModal(title, msg, onConfirm) {
  document.getElementById('confirm-modal-title').textContent = title;
  document.getElementById('confirm-modal-msg').innerHTML = msg;
  var btn = document.getElementById('confirm-modal-btn');
  btn.textContent = 'Confirm';
  btn.onclick = function() { closeConfirmModal(); if (onConfirm) onConfirm(); };
  document.getElementById('confirm-modal-overlay').style.display = 'flex';
}

function closeConfirmModal() {
  document.getElementById('confirm-modal-overlay').style.display = 'none';
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
    container.innerHTML = '<div class="proj-empty">' +
      '<i data-lucide="building-2" style="width:48px;height:48px"></i>' +
      '<p style="font-size:16px;margin:0 0 4px">No projects yet</p>' +
      '<p style="font-size:13px;margin:0">Create your first project to start tracking finances.</p>' +
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

    return '<div class="proj-card" onclick="openProjectDetail(\'' + p.id + '\')">' +
      '<span class="proj-status-badge" style="color:' + st.color + ';background:' + st.bg + '">' + st.label + '</span>' +
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
      '<div style="margin-top:10px;font-size:11px;color:var(--text-muted)">' +
      (p.responsible ? '<span>👤 ' + escHtml(p.responsible) + '</span>' : '') +
      ((p.purchase_date || p.purchaseDate) ? '<span style="margin-left:12px">📅 ' + fmtDate(p.purchase_date || p.purchaseDate) + '</span>' : '') +
      '</div></div>';
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

  container.innerHTML =
    '<div class="proj-stat-card"><div class="proj-stat-value">' + totalProjects + '</div><div class="proj-stat-label">Total Projects</div></div>' +
    '<div class="proj-stat-card"><div class="proj-stat-value">' + activeProjects + '</div><div class="proj-stat-label">Active</div></div>' +
    '<div class="proj-stat-card"><div class="proj-stat-value">' + fmtMoney(totalPurchase) + '</div><div class="proj-stat-label">Total Purchases</div></div>' +
    '<div class="proj-stat-card"><div class="proj-stat-value">' + fmtMoney(totalInvestment) + '</div><div class="proj-stat-label">Total Cost Basis</div></div>';
}

// ---- Project Modal ----
var _projEditId = null;

function openProjectModal(editId) {
  _projEditId = editId || null;
  var proj = _projEditId ? PROJECTS.find(function(p) { return p.id === _projEditId; }) : null;

  showConfirmModal(proj ? 'Edit Project' : 'New Project', '', null);
  var box = document.querySelector('.confirm-box');

  box.innerHTML =
    '<h3 style="margin:0 0 16px;font-size:16px">' + (proj ? 'Edit Project' : 'New Project') + '</h3>' +
    '<div style="display:flex;flex-direction:column;gap:10px;text-align:left;max-height:70vh;overflow-y:auto;padding-right:8px">' +
    '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Project Name *</label>' +
    '<input type="text" id="proj-name" class="form-control" placeholder="e.g. 1234 Oak Street Renovation" style="width:100%" value="' + escHtml(proj ? proj.name : '') + '"></div>' +
    '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Address</label>' +
    '<input type="text" id="proj-address" class="form-control" placeholder="Full property address" style="width:100%" value="' + escHtml(proj ? proj.address : '') + '"></div>' +
    '<div style="display:flex;gap:10px">' +
    '<div style="flex:1"><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Purchase Date</label>' +
    '<input type="date" id="proj-date" class="form-control" style="width:100%" value="' + (proj ? (proj.purchase_date || proj.purchaseDate || '') : '') + '"></div>' +
    '<div style="flex:1"><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Status</label>' +
    '<select id="proj-status" class="form-control" style="width:100%">' +
    Object.keys(PROJECT_STATUSES).map(function(k) {
      return '<option value="' + k + '"' + (proj && proj.status === k ? ' selected' : '') + '>' + PROJECT_STATUSES[k].label + '</option>';
    }).join('') + '</select></div></div>' +
    '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Responsible</label>' +
    '<input type="text" id="proj-responsible" class="form-control" placeholder="Project manager / owner" style="width:100%" value="' + escHtml(proj ? proj.responsible : '') + '"></div>' +
    '<div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">Financial Setup</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
    '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Purchase Price ($)</label>' +
    '<input type="number" id="proj-purchase" class="form-control" placeholder="0" step="0.01" style="width:100%" value="' + (proj ? (proj.purchase_price || proj.purchasePrice || '') : '') + '"></div>' +
    '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Down Payment ($)</label>' +
    '<input type="number" id="proj-down" class="form-control" placeholder="0" step="0.01" style="width:100%" value="' + (proj ? (proj.down_payment || proj.downPayment || '') : '') + '"></div>' +
    '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Loan Amount ($)</label>' +
    '<input type="number" id="proj-loan" class="form-control" placeholder="0" step="0.01" style="width:100%" value="' + (proj ? (proj.loan_amount || proj.loanAmount || '') : '') + '"></div>' +
    '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Closing Costs ($)</label>' +
    '<input type="number" id="proj-closing" class="form-control" placeholder="0" step="0.01" style="width:100%" value="' + (proj ? (proj.closing_costs || proj.closingCosts || '') : '') + '"></div>' +
    '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Realtor Fee ($)</label>' +
    '<input type="number" id="proj-realtor" class="form-control" placeholder="0" step="0.01" style="width:100%" value="' + (proj ? (proj.realtor_fee || proj.realtorFee || '') : '') + '"></div>' +
    '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Title Company Fee ($)</label>' +
    '<input type="number" id="proj-title-fee" class="form-control" placeholder="0" step="0.01" style="width:100%" value="' + (proj ? (proj.title_company_fee || '') : '') + '"></div>' +
    '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Inspection Fee ($)</label>' +
    '<input type="number" id="proj-inspection" class="form-control" placeholder="0" step="0.01" style="width:100%" value="' + (proj ? (proj.inspection_fee || '') : '') + '"></div>' +
    '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Insurance ($)</label>' +
    '<input type="number" id="proj-insurance" class="form-control" placeholder="0" step="0.01" style="width:100%" value="' + (proj ? (proj.insurance || '') : '') + '"></div>' +
    '<div style="grid-column:1 / span 2"><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Title Company</label>' +
    '<input type="text" id="proj-title-co" class="form-control" placeholder="Title company name" style="width:100%" value="' + escHtml(proj ? (proj.title_company || proj.titleCompany) : '') + '"></div>' +
    '</div></div>' +
    '<div class="confirm-actions" style="margin-top:16px">' +
    '<button type="button" class="btn btn-secondary" onclick="closeConfirmModal()">Close</button>' +
    '<button type="button" class="btn btn-primary" onclick="saveProject()">' + (proj ? 'Update' : 'Create Project') + '</button></div>';
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

  renderProjectDetail();
  if (typeof isSupabaseReady === 'function' && isSupabaseReady()) {
    await fetchProjectFinancials();
  }
}

function showProjectList() {
  _currentProject = null;
  document.getElementById('proj-detail-view').style.display = 'none';
  document.getElementById('proj-list-view').style.display = 'block';
  document.getElementById('topbar-title').textContent = 'Projects';
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
  if (tab === 'investorhub' && _currentProject) {
    renderInvestorHub(_currentProject.id);
  }
}

function renderProjectDetail() {
  if (!_currentProject) return;
  var p = _currentProject;
  var st = PROJECT_STATUSES[p.status] || PROJECT_STATUSES.planning;
  document.getElementById('proj-detail-title').innerHTML = escHtml(p.name) +
    ' <span style="font-size:11px;font-weight:600;color:' + st.color + ';background:' + st.bg + ';padding:3px 10px;border-radius:10px;margin-left:8px">' + st.label + '</span>';

  // Overview tab
  document.getElementById('proj-tab-overview').innerHTML =
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">' +
    '<div class="card"><div class="card-body" style="padding:16px">' +
    '<h4 style="font-size:13px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin:0 0 12px">Project Info</h4>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">ID</span><span class="proj-fin-value" style="font-size:11px;font-family:monospace">' + escHtml(p.id) + '</span></div>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">Address</span><span class="proj-fin-value">' + escHtml(p.address || '—') + '</span></div>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">Purchase Date</span><span class="proj-fin-value">' + fmtDate(p.purchase_date || p.purchaseDate) + '</span></div>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">Responsible</span><span class="proj-fin-value">' + escHtml(p.responsible || '—') + '</span></div>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">Created</span><span class="proj-fin-value">' + fmtDate(p.created_at || p.createdAt) + '</span></div>' +
    '</div></div></div>';

  var f = p._financials;
  if (!f) {
    var errHtml = '<div class="proj-empty" style="color:var(--danger)"><i data-lucide="alert-triangle" style="width:40px;height:40px"></i>' +
      '<p style="font-size:14px;margin:12px 0 4px">Financial summary unavailable.</p>' +
      '<p style="font-size:12px;margin:0">Confirm Supabase migration has been applied.</p></div>';
    document.getElementById('proj-tab-financials').innerHTML = errHtml;
    lucide.createIcons();
    return;
  }

  var costBasis = parseFloat(f.cost_basis ?? 0);
  var cashInvested = parseFloat(f.cash_invested ?? 0);
  var netExpense = parseFloat(f.net_expense_cost ?? 0);
  var disbursements = parseFloat(f.total_disbursements ?? 0);
  var cashPosition = parseFloat(f.project_cash_position ?? 0);
  var profit = parseFloat(f.profit ?? 0);

  // Append Cash Position Snapshot to overview
  document.getElementById('proj-tab-overview').firstChild.innerHTML +=
    '<div class="card"><div class="card-body" style="padding:16px">' +
    '<h4 style="font-size:13px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin:0 0 12px">Cash Position Snapshot</h4>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">Cash Invested</span><span class="proj-fin-value">' + fmtMoney(cashInvested) + '</span></div>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">Net Expenses</span><span class="proj-fin-value">' + fmtMoney(netExpense) + '</span></div>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">Disbursements</span><span class="proj-fin-value">' + fmtMoney(disbursements) + '</span></div>' +
    '<div class="proj-fin-row" style="border-top:2px solid var(--border);margin-top:4px;padding-top:8px"><span class="proj-fin-label" style="font-weight:700">Project Cash Position</span><span class="proj-fin-value" style="font-size:16px;color:' + (cashPosition >= 0 ? 'var(--success)' : 'var(--danger)') + '">' + fmtMoney(cashPosition) + '</span></div>' +
    '</div></div>';

  // Financials tab
  document.getElementById('proj-tab-financials').innerHTML =
    '<div style="background:var(--danger-bg, #fef2f2);color:var(--danger, #ef4444);padding:8px;border-radius:6px;font-size:11px;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:6px"><i data-lucide="shield-alert" style="width:14px;height:14px"></i> INTERNAL & ADMIN USE ONLY</div>' +
    '<div class="proj-summary-cards">' +
    '<div class="proj-stat-card"><div class="proj-stat-value">' + fmtMoney(costBasis) + '</div><div class="proj-stat-label">Cost Basis (Asset Value)</div></div>' +
    '<div class="proj-stat-card"><div class="proj-stat-value">' + fmtMoney(cashInvested) + '</div><div class="proj-stat-label">Initial Cash Invested</div></div>' +
    '<div class="proj-stat-card"><div class="proj-stat-value" style="color:var(--danger)">' + fmtMoney(netExpense) + '</div><div class="proj-stat-label">Net Expenses</div></div>' +
    '<div class="proj-stat-card"><div class="proj-stat-value" style="color:var(--danger)">' + fmtMoney(disbursements) + '</div><div class="proj-stat-label">Disbursements</div></div>' +
    '<div class="proj-stat-card"><div class="proj-stat-value" style="color:' + (cashPosition >= 0 ? 'var(--success)' : 'var(--danger)') + '">' + fmtMoney(cashPosition) + '</div><div class="proj-stat-label">Cash Position</div></div>' +
    '</div>' +
    '<div class="card" style="margin-top:20px"><div class="card-body">' +
    '<h4 style="margin:0 0 16px">Profit & Loss Metrics</h4>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">Sale Price</span><span class="proj-fin-value">' + fmtMoney(f.sale_price) + '</span></div>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">Net Proceeds</span><span class="proj-fin-value">' + fmtMoney(f.net_proceeds) + '</span></div>' +
    '<div class="proj-fin-row" style="border-top:2px solid var(--border);margin-top:4px;padding-top:8px"><span class="proj-fin-label" style="font-weight:700">Profit</span><span class="proj-fin-value" style="font-size:18px;color:' + (profit >= 0 ? 'var(--success)' : 'var(--danger)') + '">' + fmtMoney(profit) + '</span></div>' +
    '</div></div>';

  lucide.createIcons();
}

// ---- Expenses / Refunds / Disbursements Logic ----
var _currentExpenses = [];
var _currentRefunds = [];
var _currentDisbursements = [];

async function fetchProjectFinancials() {
  if (!_currentProject) return;
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
