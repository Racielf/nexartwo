// ============================================================
// PROJECTS & FINANCIAL CONTROL — Sprint 1
// Storage: localStorage key 'nexartwo_projects'
// Does NOT touch Work Orders, Email, or any existing system
// ============================================================

var PROJECTS = [];
var _currentProject = null;

var PROJECT_STATUSES = {
  planning:    { label: 'Planning',     color: '#64748b', bg: '#64748b18' },
  active:      { label: 'Active',       color: '#3b82f6', bg: '#3b82f618' },
  in_progress: { label: 'In Progress',  color: '#f59e0b', bg: '#f59e0b18' },
  completed:   { label: 'Completed',    color: '#10b981', bg: '#10b98118' },
  on_hold:     { label: 'On Hold',      color: '#ef4444', bg: '#ef444418' },
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
  document.getElementById('confirm-modal-msg').textContent = msg;
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
function loadProjects() {
  try {
    var raw = localStorage.getItem('nexartwo_projects');
    PROJECTS = raw ? JSON.parse(raw) : [];
  } catch(e) { PROJECTS = []; }
}

function saveProjects() {
  try { localStorage.setItem('nexartwo_projects', JSON.stringify(PROJECTS)); } catch(e) {}
}

// ---- Init ----
function initProjects() {
  loadProjects();
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
    var purchasePrice = parseFloat(p.purchasePrice) || 0;
    var downPayment = parseFloat(p.downPayment) || 0;
    var closingCosts = parseFloat(p.closingCosts) || 0;
    var loanAmount = parseFloat(p.loanAmount) || 0;
    var totalInvestment = purchasePrice + closingCosts;

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
      '<div class="proj-fin-row" style="border-top:2px solid var(--border)"><span class="proj-fin-label" style="font-weight:700">Total Investment</span><span class="proj-fin-value" style="color:var(--accent)">' + fmtMoney(totalInvestment) + '</span></div>' +
      '</div>' +
      '<div style="margin-top:10px;font-size:11px;color:var(--text-muted)">' +
      (p.responsible ? '<span>👤 ' + escHtml(p.responsible) + '</span>' : '') +
      (p.purchaseDate ? '<span style="margin-left:12px">📅 ' + fmtDate(p.purchaseDate) + '</span>' : '') +
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
  var totalPurchase = PROJECTS.reduce(function(s, p) { return s + (parseFloat(p.purchasePrice) || 0); }, 0);
  var totalInvestment = PROJECTS.reduce(function(s, p) {
    return s + (parseFloat(p.purchasePrice) || 0) + (parseFloat(p.closingCosts) || 0);
  }, 0);

  container.innerHTML =
    '<div class="proj-stat-card"><div class="proj-stat-value">' + totalProjects + '</div><div class="proj-stat-label">Total Projects</div></div>' +
    '<div class="proj-stat-card"><div class="proj-stat-value">' + activeProjects + '</div><div class="proj-stat-label">Active</div></div>' +
    '<div class="proj-stat-card"><div class="proj-stat-value">' + fmtMoney(totalPurchase) + '</div><div class="proj-stat-label">Total Purchases</div></div>' +
    '<div class="proj-stat-card"><div class="proj-stat-value">' + fmtMoney(totalInvestment) + '</div><div class="proj-stat-label">Total Investment</div></div>';
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
    '<div style="display:flex;flex-direction:column;gap:10px;text-align:left;max-height:70vh;overflow-y:auto">' +
    '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Project Name *</label>' +
    '<input type="text" id="proj-name" class="form-control" placeholder="e.g. 1234 Oak Street Renovation" style="width:100%" value="' + escHtml(proj ? proj.name : '') + '"></div>' +
    '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Address</label>' +
    '<input type="text" id="proj-address" class="form-control" placeholder="Full property address" style="width:100%" value="' + escHtml(proj ? proj.address : '') + '"></div>' +
    '<div style="display:flex;gap:10px">' +
    '<div style="flex:1"><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Purchase Date</label>' +
    '<input type="date" id="proj-date" class="form-control" style="width:100%" value="' + (proj ? proj.purchaseDate || '' : '') + '"></div>' +
    '<div style="flex:1"><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Status</label>' +
    '<select id="proj-status" class="form-control" style="width:100%">' +
    Object.keys(PROJECT_STATUSES).map(function(k) {
      return '<option value="' + k + '"' + (proj && proj.status === k ? ' selected' : '') + '>' + PROJECT_STATUSES[k].label + '</option>';
    }).join('') + '</select></div></div>' +
    '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Responsible</label>' +
    '<input type="text" id="proj-responsible" class="form-control" placeholder="Project manager / owner" style="width:100%" value="' + escHtml(proj ? proj.responsible : '') + '"></div>' +
    '<div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">Financial Summary</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
    '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Purchase Price ($)</label>' +
    '<input type="number" id="proj-purchase" class="form-control" placeholder="0" step="0.01" style="width:100%" value="' + (proj ? proj.purchasePrice || '' : '') + '"></div>' +
    '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Down Payment ($)</label>' +
    '<input type="number" id="proj-down" class="form-control" placeholder="0" step="0.01" style="width:100%" value="' + (proj ? proj.downPayment || '' : '') + '"></div>' +
    '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Loan Amount ($)</label>' +
    '<input type="number" id="proj-loan" class="form-control" placeholder="0" step="0.01" style="width:100%" value="' + (proj ? proj.loanAmount || '' : '') + '"></div>' +
    '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Closing Costs ($)</label>' +
    '<input type="number" id="proj-closing" class="form-control" placeholder="0" step="0.01" style="width:100%" value="' + (proj ? proj.closingCosts || '' : '') + '"></div>' +
    '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Realtor Fee ($)</label>' +
    '<input type="number" id="proj-realtor" class="form-control" placeholder="0" step="0.01" style="width:100%" value="' + (proj ? proj.realtorFee || '' : '') + '"></div>' +
    '<div><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Title Company</label>' +
    '<input type="text" id="proj-title-co" class="form-control" placeholder="Title company name" style="width:100%" value="' + escHtml(proj ? proj.titleCompany : '') + '"></div>' +
    '</div></div>' +
    '<div class="confirm-actions" style="margin-top:16px">' +
    '<button type="button" class="btn btn-secondary" onclick="closeConfirmModal()">Cancel</button>' +
    '<button type="button" class="btn btn-primary" onclick="saveProject()">' + (proj ? 'Update' : 'Create Project') + '</button></div>';
}

function saveProject() {
  var name = (document.getElementById('proj-name').value || '').trim();
  if (!name) { alert('Project name is required.'); return; }

  var data = {
    name:          name,
    address:       (document.getElementById('proj-address').value || '').trim(),
    purchaseDate:  document.getElementById('proj-date').value || '',
    status:        document.getElementById('proj-status').value || 'planning',
    responsible:   (document.getElementById('proj-responsible').value || '').trim(),
    purchasePrice: parseFloat(document.getElementById('proj-purchase').value) || 0,
    downPayment:   parseFloat(document.getElementById('proj-down').value) || 0,
    loanAmount:    parseFloat(document.getElementById('proj-loan').value) || 0,
    closingCosts:  parseFloat(document.getElementById('proj-closing').value) || 0,
    realtorFee:    parseFloat(document.getElementById('proj-realtor').value) || 0,
    titleCompany:  (document.getElementById('proj-title-co').value || '').trim()
  };

  if (_projEditId) {
    var idx = PROJECTS.findIndex(function(p) { return p.id === _projEditId; });
    if (idx >= 0) {
      Object.assign(PROJECTS[idx], data);
      PROJECTS[idx].updatedAt = new Date().toISOString();
      saveProjects();
      closeConfirmModal();
      // If viewing detail, refresh it
      if (_currentProject && _currentProject.id === _projEditId) {
        _currentProject = PROJECTS[idx];
        renderProjectDetail();
      }
      renderProjectList();
      showToast('✅ Project updated');
    }
  } else {
    var project = Object.assign({
      id:        genProjectId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, data);
    PROJECTS.unshift(project);
    saveProjects();
    closeConfirmModal();
    renderProjectList();
    showToast('✅ Project created');
  }
  _projEditId = null;
}

// ---- Detail View ----
function openProjectDetail(projId) {
  _currentProject = PROJECTS.find(function(p) { return p.id === projId; });
  if (!_currentProject) return;

  document.getElementById('proj-list-view').style.display = 'none';
  document.getElementById('proj-detail-view').style.display = 'block';
  document.getElementById('topbar-title').textContent = _currentProject.name;

  renderProjectDetail();
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

function deleteCurrentProject() {
  if (!_currentProject) return;
  showConfirmModal('Delete Project', '"' + _currentProject.name + '" and all associated data will be permanently removed.', function() {
    PROJECTS = PROJECTS.filter(function(p) { return p.id !== _currentProject.id; });
    saveProjects();
    showProjectList();
    showToast('Project deleted');
  });
}

function switchProjTab(tab) {
  document.querySelectorAll('.proj-detail-tab').forEach(function(t) { t.classList.remove('active'); });
  document.querySelectorAll('.proj-tab-content').forEach(function(c) { c.style.display = 'none'; });
  document.querySelector('.proj-detail-tab[data-tab="' + tab + '"]').classList.add('active');
  document.getElementById('proj-tab-' + tab).style.display = 'block';
}

function renderProjectDetail() {
  if (!_currentProject) return;
  var p = _currentProject;
  var st = PROJECT_STATUSES[p.status] || PROJECT_STATUSES.planning;
  document.getElementById('proj-detail-title').innerHTML = escHtml(p.name) +
    ' <span style="font-size:11px;font-weight:600;color:' + st.color + ';background:' + st.bg + ';padding:3px 10px;border-radius:10px;margin-left:8px">' + st.label + '</span>';

  var purchasePrice = parseFloat(p.purchasePrice) || 0;
  var downPayment = parseFloat(p.downPayment) || 0;
  var closingCosts = parseFloat(p.closingCosts) || 0;
  var loanAmount = parseFloat(p.loanAmount) || 0;
  var realtorFee = parseFloat(p.realtorFee) || 0;
  var totalInvestment = purchasePrice + closingCosts;

  // Overview tab
  document.getElementById('proj-tab-overview').innerHTML =
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">' +
    '<div class="card"><div class="card-body" style="padding:16px">' +
    '<h4 style="font-size:13px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin:0 0 12px">Project Info</h4>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">ID</span><span class="proj-fin-value" style="font-size:11px;font-family:monospace">' + escHtml(p.id) + '</span></div>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">Address</span><span class="proj-fin-value">' + escHtml(p.address || '—') + '</span></div>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">Purchase Date</span><span class="proj-fin-value">' + fmtDate(p.purchaseDate) + '</span></div>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">Responsible</span><span class="proj-fin-value">' + escHtml(p.responsible || '—') + '</span></div>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">Title Company</span><span class="proj-fin-value">' + escHtml(p.titleCompany || '—') + '</span></div>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">Created</span><span class="proj-fin-value">' + fmtDate(p.createdAt) + '</span></div>' +
    '</div></div>' +

    '<div class="card"><div class="card-body" style="padding:16px">' +
    '<h4 style="font-size:13px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin:0 0 12px">Purchase & Financing</h4>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">Purchase Price</span><span class="proj-fin-value">' + fmtMoney(purchasePrice) + '</span></div>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">Down Payment</span><span class="proj-fin-value">' + fmtMoney(downPayment) + '</span></div>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">Loan Amount</span><span class="proj-fin-value">' + fmtMoney(loanAmount) + '</span></div>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">Closing Costs</span><span class="proj-fin-value">' + fmtMoney(closingCosts) + '</span></div>' +
    '<div class="proj-fin-row"><span class="proj-fin-label">Realtor Fee</span><span class="proj-fin-value">' + fmtMoney(realtorFee) + '</span></div>' +
    '<div class="proj-fin-row" style="border-top:2px solid var(--border);margin-top:4px;padding-top:8px"><span class="proj-fin-label" style="font-weight:700">Total Investment</span><span class="proj-fin-value" style="font-size:16px;color:var(--accent)">' + fmtMoney(totalInvestment) + '</span></div>' +
    '</div></div></div>';

  // Financials tab (placeholder for Sprint 2)
  document.getElementById('proj-tab-financials').innerHTML =
    '<div class="proj-empty"><i data-lucide="bar-chart-3" style="width:40px;height:40px"></i>' +
    '<p style="font-size:14px;margin:12px 0 4px">Financial Engine</p>' +
    '<p style="font-size:12px;margin:0">Expenses, Refunds, Net Cost, and P&L coming in Sprint 2.</p></div>';

  // Expenses tab (placeholder)
  document.getElementById('proj-tab-expenses').innerHTML =
    '<div class="proj-empty"><i data-lucide="receipt" style="width:40px;height:40px"></i>' +
    '<p style="font-size:14px;margin:12px 0 4px">Expenses & Tickets</p>' +
    '<p style="font-size:12px;margin:0">Upload tickets, track expenses, and manage refunds — coming in Sprint 2.</p></div>';

  // Work Orders tab (placeholder)
  document.getElementById('proj-tab-workorders').innerHTML =
    '<div class="proj-empty"><i data-lucide="clipboard-list" style="width:40px;height:40px"></i>' +
    '<p style="font-size:14px;margin:12px 0 4px">Linked Work Orders</p>' +
    '<p style="font-size:12px;margin:0">Work Order linking coming in a future sprint.</p></div>';

  lucide.createIcons();
}
