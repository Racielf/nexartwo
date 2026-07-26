// ============================================================
// PROJECTS & FINANCIAL CONTROL — Phase 2
// Storage: Supabase (with localStorage fallback)
// ============================================================

var PROJECTS = [];
var _currentProject = null;

// ============================================================
// INVESTOR HUB FEATURE FLAG — Phase 2B
// Matches origin/main and production (2026-07-26 — see memory/DECISION_LOG.md).
// Re-enable only after an explicit owner decision to diverge from production again.
// Investor Hub uses real Supabase records only for investor/capital actions;
// demo/local writes are disabled.
// ============================================================
var INVESTOR_HUB_ENABLED = false;

function isInvestorHubWorkspaceTabEnabled() {
  return !!(typeof window !== 'undefined' &&
    window.NEXARTWO_FEATURE_FLAGS &&
    window.NEXARTWO_FEATURE_FLAGS.investorHubWorkspaceTab === true);
}

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


// Restores the original .confirm-box skeleton so showConfirmModal() always
// finds its required IDs (confirm-modal-title / msg / btn) after openProjectModal()
// has replaced the innerHTML wholesale with a custom form.
function ensureConfirmBoxSkeleton() {
  if (!document.getElementById('confirm-modal-title') ||
      !document.getElementById('confirm-modal-msg')   ||
      !document.getElementById('confirm-modal-btn'))  {
    var box = document.querySelector('.confirm-box');
    if (box) {
      box.style.maxWidth = '';
      box.style.width = '';
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
      var projs = await DB.projects.getAll();
      if (!Array.isArray(projs)) return;
      if (projs.length === 0 && PROJECTS.length > 0) return;

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
var _projectsModuleShell = null;
var _projectsModuleLocalLoaded = false;
var _projectsModuleRoute = 'projects';
var _projectsLiveRefreshInFlight = false;
var _propertyHubActiveSection = 'overview';

function isFlipEngineProject(project) {
  return !!(project && project.project_type === 'fix_and_flip');
}

function syncPropertyHubTabVisibility() {
  var tab = document.querySelector('.proj-detail-tab[data-tab="propertyhub"]');
  var content = document.getElementById('proj-tab-propertyhub');
  var show = isFlipEngineProject(_currentProject);
  if (tab) tab.style.display = show ? '' : 'none';
  if (!show && content) {
    content.innerHTML = '';
    content.style.display = 'none';
  }
  if (!show && tab && tab.classList.contains('active')) {
    tab.classList.remove('active');
    var overviewTab = document.querySelector('.proj-detail-tab[data-tab="overview"]');
    var overviewContent = document.getElementById('proj-tab-overview');
    if (overviewTab) overviewTab.classList.add('active');
    if (overviewContent) overviewContent.style.display = 'block';
  }
}

function syncPropertyHubNavigationContext(activeTab) {
  var investorTab = document.querySelector('.proj-detail-tab[data-tab="investorhub"]');
  if (!investorTab) return;
  var showInvestorHubTab = isInvestorHubWorkspaceTabEnabled();
  investorTab.style.display = showInvestorHubTab ? '' : 'none';
  investorTab.setAttribute('aria-hidden', showInvestorHubTab ? 'false' : 'true');
}

function projectsModuleShellHtml() {
  var investorHubTabStyle = isInvestorHubWorkspaceTabEnabled() ? 'color:var(--accent)' : 'display:none';
  return '' +
    '<div id="proj-list-view" class="content-area">' +
      '<div class="projects-list-header">' +
        '<div class="projects-list-title-block">' +
          '<div class="proj-page-kicker">Project Control</div>' +
          '<div class="projects-list-subtitle">Project records, financial snapshots, and linked work orders.</div>' +
        '</div>' +
        '<button id="btn-new-project" class="btn btn-primary btn-sm" onclick="openProjectTypeSelector()" style="gap:6px">' +
          '<i data-lucide="plus" style="width:14px;height:14px"></i> New Project' +
        '</button>' +
      '</div>' +
      '<div id="proj-summary-stats" class="proj-summary-cards"></div>' +
      '<div id="proj-pnl-bar-container" style="margin-bottom:0"></div>' +
      '<div id="proj-list" class="proj-grid" style="margin-top:24px"></div>' +
    '</div>' +
    '<div id="proj-detail-view" class="content-area" style="display:none">' +
      '<div class="proj-workspace-header">' +
        '<div class="proj-toolbar-line">' +
          '<button class="btn btn-ghost btn-sm" onclick="showProjectList()" style="gap:4px">' +
            '<i data-lucide="arrow-left" style="width:14px;height:14px"></i> Back' +
          '</button>' +
          '<div id="proj-context-eyebrow" class="proj-context-eyebrow">Project workspace</div>' +
        '</div>' +
        '<div class="proj-title-row">' +
          '<div class="proj-title-block">' +
            '<div id="proj-page-kicker" class="proj-page-kicker">Project Control</div>' +
            '<h3 id="proj-detail-title"></h3>' +
            '<div id="proj-detail-subtitle" class="proj-detail-subtitle"></div>' +
          '</div>' +
          '<div class="proj-title-actions">' +
            '<button class="btn btn-secondary btn-sm" onclick="editCurrentProject()" style="gap:4px">' +
              '<i data-lucide="edit-3" style="width:13px;height:13px"></i> Edit Project' +
            '</button>' +
            '<button class="btn btn-sm" style="gap:4px;background:#f59e0b;color:#fff;border:none" onclick="cancelCurrentProject()">' +
              '<i data-lucide="archive" style="width:13px;height:13px"></i> Cancel Project' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="proj-detail-tabs" id="proj-detail-tabs">' +
        '<div class="proj-detail-tab active" data-tab="overview" onclick="switchProjTab(\'overview\')">Overview</div>' +
        '<div class="proj-detail-tab" data-tab="propertyhub" onclick="switchProjTab(\'propertyhub\')" style="display:none"><i data-lucide="home"></i>Property Hub</div>' +
        '<div class="proj-detail-tab" data-tab="financials" onclick="switchProjTab(\'financials\')">Financials</div>' +
        '<div class="proj-detail-tab" data-tab="expenses" onclick="switchProjTab(\'expenses\')">Expenses</div>' +
        '<div class="proj-detail-tab" data-tab="disbursements" onclick="switchProjTab(\'disbursements\')">Disbursements</div>' +
        '<div class="proj-detail-tab" data-tab="workorders" onclick="switchProjTab(\'workorders\')">Work Orders</div>' +
        '<div class="proj-detail-tab" data-tab="investorhub" onclick="switchProjTab(\'investorhub\')" style="' + investorHubTabStyle + '" title="Investor Hub requires explicit owner-approved workspace flag"><i data-lucide="landmark"></i>Investor Hub</div>' +
      '</div>' +
      '<div id="proj-tab-overview" class="proj-tab-content"></div>' +
      '<div id="proj-tab-propertyhub" class="proj-tab-content" style="display:none"></div>' +
      '<div id="proj-tab-financials" class="proj-tab-content" style="display:none"></div>' +
      '<div id="proj-tab-expenses" class="proj-tab-content" style="display:none"></div>' +
      '<div id="proj-tab-disbursements" class="proj-tab-content" style="display:none"></div>' +
      '<div id="proj-tab-workorders" class="proj-tab-content" style="display:none"></div>' +
      '<div id="proj-tab-investorhub" class="proj-tab-content" style="display:none"></div>' +
    '</div>';
}

function ihInjectRouteCSS() {
  if (document.getElementById('ih-route-style')) return;
  var s = document.createElement('style');
  s.id = 'ih-route-style';
  s.textContent = [
    'body.projects-route-investorhub .search-box{display:none!important}',
    'body.projects-route-investorhub #btn-save-all{display:none!important}',
    'body.projects-route-investorhub .top-bar-right .btn-primary{display:none!important}',
    'body.projects-route-investorhub .proj-title-actions{display:none!important}',
    'body.projects-route-investorhub #proj-detail-subtitle{display:none!important}',
    'body.projects-route-investorhub #proj-detail-tabs{display:none!important}',
    'body.projects-route-investorhub #topbar-title{display:none!important}',
    'body.projects-route-investorhub #topbar-subtitle{display:none!important}',
    'body.projects-route-investorhub .proj-workspace-header{position:sticky;top:0;z-index:50;background:var(--bg,#fbf5e6);border-bottom:1px solid #e5e7eb;padding-bottom:12px}',
    '.ih-investor-card{cursor:pointer;transition:box-shadow .15s,transform .15s}',
    '.ih-investor-card:hover{box-shadow:0 6px 20px rgba(0,0,0,.13);transform:translateY(-2px)}',
    '.ih-investor-card .ih-row-actions{margin-top:10px}',
    '.ih-card-tags{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:4px}',
    '.ih-type-badge{display:inline-block;font-size:10px;font-weight:600;letter-spacing:.4px;text-transform:uppercase;padding:2px 7px;border-radius:4px;background:#f3f4f6;color:#6b7280}',
    '.ih-detail-overlay{position:fixed;inset:0;background:rgba(0,0,0,.48);display:flex;align-items:center;justify-content:center;z-index:9000}',
    '.ih-detail-box{background:#fff;border-radius:14px;padding:30px;max-width:580px;width:calc(100% - 32px);max-height:calc(100vh - 60px);overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.22)}',
    '.ih-detail-section{margin-bottom:20px;padding-bottom:18px;border-bottom:1px solid #f3f4f6}',
    '.ih-detail-section:last-of-type{border-bottom:none;margin-bottom:0;padding-bottom:0}',
    '.ih-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px 20px;margin-top:10px}',
    '.ih-detail-label{font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px}',
    '.ih-detail-value{font-size:14px;color:#111827;font-weight:500}',
    '.ih-detail-value.muted{color:#6b7280;font-weight:400}',
    '.ih-detail-section-title{font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px}',
    '.ih-detail-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:22px;padding-top:18px;border-top:1px solid #f3f4f6}'
  ].join('');
  document.head.appendChild(s);
}

function ensureProjectsModuleShell(route) {
  ihInjectRouteCSS();
  route = route === 'investorhub' ? 'investorhub' : 'projects';
  var target = document.getElementById(route === 'investorhub' ? 'page-investorhub' : 'page-projects');
  if (!target) return false;

  if (!_projectsModuleShell) {
    _projectsModuleShell = document.createElement('section');
    _projectsModuleShell.id = 'projects-module-shell';
    _projectsModuleShell.className = 'projects-module-shell';
    _projectsModuleShell.setAttribute('aria-label', 'Projects workspace');
    _projectsModuleShell.innerHTML = projectsModuleShellHtml();
  }

  if (_projectsModuleShell.parentNode !== target) {
    target.innerHTML = '';
    target.appendChild(_projectsModuleShell);
  }

  document.body.classList.remove('projects-loading');
  if (typeof lucide !== 'undefined') lucide.createIcons();
  return true;
}

async function initProjectsModule(options) {
  options = options || {};
  var route = options.route === 'investorhub' ? 'investorhub' : 'projects';
  _projectsModuleRoute = route;

  if (!ensureProjectsModuleShell(route)) return;
  syncProjectRouteChrome(route);

  if (!_projectsModuleLocalLoaded) {
    loadProjectsLocal();
    _projectsModuleLocalLoaded = true;
  }

  renderProjectList();
  if (route === 'investorhub') {
    await openInvestorHubEntry({ skipFinancials: true, silentIfEmpty: true });
  } else {
    showProjectList();
  }

  refreshProjectsFromSupabase();
}

function openInvestorHubRoute(options) {
  options = options || {};
  options.route = 'investorhub';
  return initProjectsModule(options);
}

async function initProjects() {
  return initProjectsModule({ route: shouldOpenInvestorHubFromUrl() ? 'investorhub' : 'projects' });
}

function shouldOpenInvestorHubFromUrl() {
  try {
    var params = new URLSearchParams(window.location.search);
    return _projectsModuleRoute === 'investorhub' ||
      params.get('page') === 'investorhub' ||
      params.get('tab') === 'investorhub';
  } catch(e) {
    return false;
  }
}

async function refreshProjectsFromSupabase() {
  if (typeof isSupabaseReady !== 'function' || !isSupabaseReady()) return;
  if (_projectsLiveRefreshInFlight) return;

  _projectsLiveRefreshInFlight = true;
  var activeProjectId = _currentProject ? _currentProject.id : null;
  var wasInvestorRoute = shouldOpenInvestorHubFromUrl();
  try {
    await loadProjects();
    renderProjectList();

    if (shouldOpenInvestorHubFromUrl()) {
      var refreshedProject = activeProjectId && PROJECTS.find(function(p) { return p.id === activeProjectId; });
      await openInvestorHubEntry({
        projectId: refreshedProject ? refreshedProject.id : null,
        skipFinancials: true
      });
      return;
    }

    if (_currentProject && activeProjectId) {
      var current = PROJECTS.find(function(p) { return p.id === activeProjectId; });
      if (current) {
        _currentProject = current;
        renderProjectDetail({ preserveTab: true });
      }
      return;
    }

    if (!wasInvestorRoute) showProjectList();
  } catch(e) {
    console.warn('Projects live refresh failed:', e);
  } finally {
    _projectsLiveRefreshInFlight = false;
  }
}

function syncProjectRouteChrome(route, options) {
  options = options || {};
  var isInvestorHub = route === 'investorhub';

  document.body.classList.toggle('projects-route-investorhub', isInvestorHub);
  document.body.classList.toggle('projects-route-projects', !isInvestorHub);

  var projectNav = document.querySelector('.nav-item[data-route="projects"]');
  var investorNav = document.querySelector('.nav-item[data-route="investorhub"]');
  if (projectNav) projectNav.classList.toggle('active', !isInvestorHub);
  if (investorNav) investorNav.classList.toggle('active', isInvestorHub);

  if (options.updateTitle === false) return;
  var topbarEl = document.getElementById('topbar-title');
  if (topbarEl) topbarEl.textContent = isInvestorHub ? 'Investor Hub' : 'Projects';
  var subtitleEl = document.getElementById('topbar-subtitle');
  if (subtitleEl) subtitleEl.textContent = isInvestorHub ? 'Owner/Admin capital console' : 'Project control, financials, and work order links';
}

async function openInvestorHubEntry(options) {
  options = options || {};
  if (!INVESTOR_HUB_ENABLED) return;

  if (!PROJECTS.length) {
    showProjectList();
    if (!options.silentIfEmpty) showToast('Create or open a project to use Investor Hub');
    return;
  }

  var targetProject = options.projectId ? PROJECTS.find(function(p) {
    return p.id === options.projectId;
  }) : null;

  targetProject = targetProject || PROJECTS.find(function(p) {
    return p.status !== 'cancelled';
  }) || PROJECTS[0];

  await openProjectDetail(targetProject.id, { skipFinancials: !!options.skipFinancials });
  switchProjTab('investorhub');
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
  box.style.maxWidth = '780px';
  box.style.width = 'calc(100% - 32px)';

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
      '<div class="proj-fin-grid">' +
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
async function openProjectDetail(projId, options) {
  options = options || {};
  _currentProject = PROJECTS.find(function(p) { return p.id === projId; });
  if (!_currentProject) return;

  document.getElementById('proj-list-view').style.display = 'none';
  document.getElementById('proj-detail-view').style.display = 'block';
  document.getElementById('topbar-title').textContent = projectDisplayName(_currentProject);
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
  _propertyHubActiveSection = 'overview';
  syncPropertyHubTabVisibility();
  var propertyHubTab = document.getElementById('proj-tab-propertyhub');
  if (propertyHubTab) propertyHubTab.innerHTML = '';

  // Set loading flag BEFORE initial render so spinner shows only when Supabase is active
  _currentProject._financialsLoading = !options.skipFinancials && (typeof isSupabaseReady === 'function' && isSupabaseReady());
  renderProjectDetail();
  if (_currentProject._financialsLoading) {
    await fetchProjectFinancials();
  }
}

function showProjectList() {
  syncProjectRouteChrome('projects');
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

function titleCaseDisplay(value) {
  var clean = String(value || '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  return clean.split(' ').map(function(token) {
    if (!/[A-Za-z]/.test(token)) return token;
    if (token.indexOf('.') >= 0) return token;
    var lettersOnly = token.replace(/[^A-Za-z]/g, '');
    if (lettersOnly.length <= 3 && token === token.toUpperCase()) return token;
    return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
  }).join(' ');
}

function projectDisplayName(projectOrName) {
  var raw = typeof projectOrName === 'string' ? projectOrName : (projectOrName && projectOrName.name);
  return titleCaseDisplay(raw) || 'Selected Project';
}

function projectStatusPill(st) {
  st = st || PROJECT_STATUSES.planning;
  return '<span class="proj-context-pill" style="color:' + st.color + ';background:' + st.bg + '">' + escHtml(st.label) + '</span>';
}

function projectTypePill(ptc) {
  ptc = ptc || getProjTypeCfg(null);
  return '<span class="proj-context-pill" style="color:' + ptc.color + ';background:' + ptc.bg + ';border:1px solid ' + (ptc.border || ptc.color + '40') + '">' + escHtml(ptc.label) + '</span>';
}

function updateProjectWorkspaceChrome(tab) {
  if (!_currentProject) return;
  var p = _currentProject;
  var st = PROJECT_STATUSES[p.status] || PROJECT_STATUSES.planning;
  var ptc = getProjTypeCfg(p.project_type || null);
  var name = projectDisplayName(p);
  var tabLabels = {
    overview: 'Overview',
    propertyhub: 'Property Hub',
    financials: 'Financials',
    expenses: 'Expenses',
    disbursements: 'Disbursements',
    workorders: 'Work Orders',
    investorhub: 'Investor Hub'
  };
  var kickerLabels = {
    overview: 'Project workspace',
    propertyhub: 'FlipEngine',
    financials: 'Project financials',
    expenses: 'Operating costs',
    disbursements: 'Disbursements',
    workorders: 'Project work orders',
    investorhub: 'Owner/Admin capital console'
  };
  var pageTitle = tabLabels[tab] || 'Project Workspace';
  var kickerLabel = kickerLabels[tab] || 'Project workspace';
  var titleEl = document.getElementById('proj-detail-title');
  var subtitleEl = document.getElementById('proj-detail-subtitle');
  var kickerEl = document.getElementById('proj-page-kicker');
  var contextEl = document.getElementById('proj-context-eyebrow');
  var topbarEl = document.getElementById('topbar-title');
  var topbarSubtitleEl = document.getElementById('topbar-subtitle');

  if (topbarEl) topbarEl.textContent = name;
  if (topbarSubtitleEl) topbarSubtitleEl.textContent = pageTitle + ' - Project workspace';
  if (titleEl) titleEl.textContent = pageTitle;
  if (kickerEl) {
    kickerEl.textContent = kickerLabel;
  }
  if (contextEl) {
    contextEl.textContent = tab === 'propertyhub' ? 'Property workspace' : 'Project workspace';
  }
  if (subtitleEl) {
    if (tab === 'investorhub') {
      subtitleEl.innerHTML = '';
    } else {
      subtitleEl.innerHTML =
        '<span class="proj-subtle-label">Project</span>' +
        '<strong>' + escHtml(name) + '</strong>' +
        projectStatusPill(st) +
        projectTypePill(ptc);
    }
  }
}

function switchProjTab(tab) {
  if (tab === 'propertyhub' && !isFlipEngineProject(_currentProject)) {
    tab = 'overview';
  }
  syncProjectRouteChrome(tab === 'investorhub' ? 'investorhub' : 'projects', { updateTitle: false });
  syncPropertyHubTabVisibility();
  syncPropertyHubNavigationContext(tab);
  updateProjectWorkspaceChrome(tab);
  document.querySelectorAll('.proj-detail-tab').forEach(function(t) { t.classList.remove('active'); });
  document.querySelectorAll('.proj-tab-content').forEach(function(c) { c.style.display = 'none'; });
  var tBtn = document.querySelector('.proj-detail-tab[data-tab="' + tab + '"]');
  if(tBtn) tBtn.classList.add('active');
  var tContent = document.getElementById('proj-tab-' + tab);
  if(tContent) tContent.style.display = 'block';

  if (tab === 'investorhub' && _currentProject) {
    renderInvestorHub(_currentProject.id);
  }

  if (tab === 'workorders') {
    if (_currentProject) renderWorkOrdersTab();
  }

  if (tab === 'propertyhub') {
    renderPropertyHubShell();
  }
}

var PROPERTY_HUB_SECTIONS = [
  { id: 'overview', label: 'Overview', icon: 'layout-dashboard', ready: true },
  { id: 'acquisition', label: 'Acquisition', icon: 'home', locked: true },
  { id: 'budget', label: 'Budget', icon: 'calculator', locked: true },
  { id: 'workorders', label: 'Work Orders', icon: 'clipboard-list', ready: true },
  { id: 'expenses', label: 'Expenses', icon: 'receipt', ready: true },
  { id: 'receipts', label: 'Receipts', icon: 'receipt-text', locked: true },
  { id: 'documents', label: 'Documents', icon: 'files', locked: true },
  { id: 'loans', label: 'Loans / Draws', icon: 'landmark', locked: true },
  { id: 'investors', label: 'Investors', icon: 'users', locked: true },
  { id: 'contractors', label: 'Contractors', icon: 'hard-hat', locked: true },
  { id: 'labor', label: 'Labor / Time', icon: 'clock', locked: true },
  { id: 'payments', label: 'Payments', icon: 'wallet', locked: true },
  { id: 'sale', label: 'Sale / Exit', icon: 'badge-dollar-sign', locked: true },
  { id: 'reports', label: 'Reports', icon: 'chart-column', locked: true }
];

function propertyHubSectionById(sectionId) {
  return PROPERTY_HUB_SECTIONS.find(function(section) { return section.id === sectionId; }) || PROPERTY_HUB_SECTIONS[0];
}

function propertyHubModuleButton(section) {
  var active = _propertyHubActiveSection === section.id;
  var locked = !!section.locked;
  var bg = active ? 'var(--accent)' : 'var(--bg-card)';
  var color = active ? '#fff' : (locked ? 'var(--text-muted)' : 'var(--text-primary)');
  var border = active ? 'var(--accent)' : 'var(--border)';
  var opacity = locked && !active ? '0.72' : '1';
  return '<button type="button" class="btn btn-sm" onclick="switchPropertyHubSection(\'' + section.id + '\')" style="justify-content:flex-start;gap:8px;background:' + bg + ';color:' + color + ';border:1px solid ' + border + ';opacity:' + opacity + ';min-height:38px;border-radius:8px;width:100%">' +
    '<i data-lucide="' + section.icon + '" style="width:13px;height:13px"></i>' +
    '<span>' + escHtml(section.label) + '</span>' +
    (locked ? '<i data-lucide="lock-keyhole" style="width:12px;height:12px;margin-left:auto"></i>' : '') +
  '</button>';
}

function propertyHubReadinessNotice(label) {
  return '<div style="border:1px dashed var(--border);border-radius:8px;background:var(--bg-secondary);padding:16px;color:var(--text-secondary);display:flex;gap:12px;align-items:flex-start">' +
    '<i data-lucide="lock-keyhole" style="width:18px;height:18px;color:var(--text-muted);margin-top:2px"></i>' +
    '<div><div style="font-size:13px;font-weight:800;color:var(--text-primary);margin-bottom:4px">' + escHtml(label) + ' is read-only</div>' +
    '<div style="font-size:12px;line-height:1.5">Requires FlipEngine database migration before editing.</div></div>' +
  '</div>';
}

function propertyHubMetric(label, value, note) {
  return '<div class="proj-stat-card" style="text-align:left">' +
    '<div class="proj-stat-label">' + escHtml(label) + '</div>' +
    '<div class="proj-stat-value" style="font-size:18px;margin-top:4px">' + value + '</div>' +
    (note ? '<div style="font-size:10px;color:var(--text-muted);margin-top:4px;line-height:1.4">' + escHtml(note) + '</div>' : '') +
  '</div>';
}

function propertyHubInfoRow(label, value) {
  return '<div class="proj-fin-row">' +
    '<span class="proj-fin-label">' + escHtml(label) + '</span>' +
    '<span class="proj-fin-value" style="text-align:right;max-width:60%">' + value + '</span>' +
  '</div>';
}

function propertyHubProjectField(project, field, legacyField) {
  if (!project) return null;
  var value = project[field];
  if ((value === undefined || value === null || value === '') && legacyField) {
    value = project[legacyField];
  }
  return value === undefined || value === null || value === '' ? null : value;
}

function propertyHubDisplayValue(value, formatter) {
  if (value === undefined || value === null || value === '') {
    return '<span style="color:var(--text-muted);font-size:13px">Not available</span>';
  }
  return formatter ? formatter(value) : escHtml(String(value));
}

function propertyHubPlaceholder(section) {
  return '<div class="card"><div class="card-body" style="padding:18px">' +
    '<h4 style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin:0 0 14px;display:flex;align-items:center;gap:8px">' +
      '<i data-lucide="' + section.icon + '" style="width:14px;height:14px"></i>' + escHtml(section.label) +
    '</h4>' +
    propertyHubReadinessNotice(section.label) +
  '</div></div>';
}

function renderPropertyHubSection(sectionId) {
  var p = _currentProject;
  var section = propertyHubSectionById(sectionId);
  var f = p && p._financials ? p._financials : null;

  if (section.id === 'overview') {
    return '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-bottom:16px">' +
      propertyHubMetric('Project', escHtml(projectDisplayName(p)), 'Existing NexArWO project record') +
      propertyHubMetric('Address', escHtml(p.address || '—'), 'Read from current project') +
      propertyHubMetric('Purchase Price', fmtMoney(p.purchase_price || p.purchasePrice), 'Existing project field') +
      propertyHubMetric('Cash Position', f ? fmtMoney(f.project_cash_position) : '<span style="color:var(--text-muted);font-size:13px">Not available</span>', 'Existing financial summary') +
    '</div>' +
    '<div class="card"><div class="card-body" style="padding:18px">' +
      '<h4 style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin:0 0 14px;display:flex;align-items:center;gap:8px"><i data-lucide="shield-check" style="width:14px;height:14px"></i> Shell Status</h4>' +
      propertyHubInfoRow('Mode', '<span style="color:var(--accent)">Read-only shell</span>') +
      propertyHubInfoRow('Gate', '<span style="font-family:monospace;font-size:11px">project_type = fix_and_flip</span>') +
      propertyHubInfoRow('Database writes', '<span style="color:var(--text-muted)">Disabled</span>') +
      propertyHubInfoRow('Investor Hub', '<span style="color:var(--text-muted)">Not invoked by Property Hub</span>') +
    '</div></div>';
  }

  if (section.id === 'acquisition') {
    var purchasePrice = propertyHubProjectField(p, 'purchase_price', 'purchasePrice');
    var downPayment = propertyHubProjectField(p, 'down_payment', 'downPayment');
    var loanAmount = propertyHubProjectField(p, 'loan_amount', 'loanAmount');
    var closingCosts = propertyHubProjectField(p, 'closing_costs', 'closingCosts');
    var purchaseDate = propertyHubProjectField(p, 'purchase_date', 'purchaseDate');
    var projectStatus = PROJECT_STATUSES[p.status] || PROJECT_STATUSES.planning;
    var projectType = getProjTypeCfg(p.project_type || null);

    return '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:16px">' +
      propertyHubMetric('Purchase Price', propertyHubDisplayValue(purchasePrice, fmtMoney), 'Existing project field') +
      propertyHubMetric('Down Payment', propertyHubDisplayValue(downPayment, fmtMoney), 'Existing project field') +
      propertyHubMetric('Loan Amount', propertyHubDisplayValue(loanAmount, fmtMoney), 'Existing project field') +
      propertyHubMetric('Closing Costs', propertyHubDisplayValue(closingCosts, fmtMoney), 'Existing project field') +
    '</div>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px">' +
      '<section style="border:1px solid var(--border);border-radius:8px;padding:16px;background:var(--bg-card)">' +
        '<h4 style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin:0 0 14px;display:flex;align-items:center;gap:8px"><i data-lucide="map-pin" style="width:14px;height:14px"></i> Property Record</h4>' +
        propertyHubInfoRow('Project ID', '<span style="font-family:monospace;font-size:11px">' + escHtml(p.id || '') + '</span>') +
        propertyHubInfoRow('Address', propertyHubDisplayValue(p.address)) +
        propertyHubInfoRow('Purchase Date', propertyHubDisplayValue(purchaseDate, fmtDate)) +
        propertyHubInfoRow('Status', projectStatusPill(projectStatus)) +
        propertyHubInfoRow('Project Type', projectTypePill(projectType)) +
      '</section>' +
      '<section style="border:1px solid var(--border);border-radius:8px;padding:16px;background:var(--bg-card)">' +
        '<h4 style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin:0 0 14px;display:flex;align-items:center;gap:8px"><i data-lucide="database" style="width:14px;height:14px"></i> Data Source</h4>' +
        propertyHubInfoRow('Source', '<span style="color:var(--accent)">Existing NexArWO project</span>') +
        propertyHubInfoRow('Acquisition record', '<span style="color:var(--text-muted)">Not loaded</span>') +
        propertyHubInfoRow('Notes', propertyHubDisplayValue(p.notes)) +
      '</section>' +
    '</div>' +
    '<div style="margin-top:16px">' + propertyHubReadinessNotice('Acquisition') + '</div>';
  }

  if (section.id === 'budget') {
    return '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:16px">' +
      propertyHubMetric('Net Expenses', propertyHubDisplayValue(f ? f.net_expense_cost : null, fmtMoney), 'Existing summary; not budget actuals') +
      propertyHubMetric('Disbursements', propertyHubDisplayValue(f ? f.total_disbursements : null, fmtMoney), 'Existing summary; not committed budget') +
      propertyHubMetric('Budget Categories', '<span style="color:var(--text-muted);font-size:13px">Not loaded</span>', 'Requires approved database migration') +
      propertyHubMetric('Budget Calculations', '<span style="color:var(--text-muted);font-size:13px">Not enabled</span>', 'No remaining or variance calculation') +
    '</div>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px">' +
      '<section style="border:1px solid var(--border);border-radius:8px;padding:16px;background:var(--bg-card)">' +
        '<h4 style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin:0 0 14px;display:flex;align-items:center;gap:8px"><i data-lucide="calculator" style="width:14px;height:14px"></i> Budget Readiness</h4>' +
        propertyHubInfoRow('Data source', f ? '<span style="color:var(--accent)">Existing financial summary</span>' : '<span style="color:var(--text-muted)">Not available</span>') +
        propertyHubInfoRow('Estimated budget', '<span style="color:var(--text-muted)">Not available</span>') +
        propertyHubInfoRow('Remaining budget', '<span style="color:var(--text-muted)">Not calculated</span>') +
        propertyHubInfoRow('Variance', '<span style="color:var(--text-muted)">Not calculated</span>') +
      '</section>' +
      '<section style="border:1px solid var(--border);border-radius:8px;padding:16px;background:var(--bg-card)">' +
        '<h4 style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin:0 0 14px;display:flex;align-items:center;gap:8px"><i data-lucide="shield-check" style="width:14px;height:14px"></i> Accounting Boundary</h4>' +
        propertyHubInfoRow('Net expenses', '<span style="color:var(--text-secondary)">Financial context only</span>') +
        propertyHubInfoRow('Disbursements', '<span style="color:var(--text-secondary)">Financial context only</span>') +
        propertyHubInfoRow('Work Orders', '<span style="color:var(--text-secondary)">Remain independent</span>') +
        propertyHubInfoRow('Receipts', '<span style="color:var(--text-muted)">Not counted as budget actuals</span>') +
      '</section>' +
    '</div>' +
    '<div style="margin-top:16px">' + propertyHubReadinessNotice('Budget') + '</div>';
  }

  if (section.id === 'workorders') {
    return '<div class="card"><div class="card-body" style="padding:18px">' +
      '<h4 style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin:0 0 14px;display:flex;align-items:center;gap:8px"><i data-lucide="clipboard-list" style="width:14px;height:14px"></i> Work Orders</h4>' +
      '<p style="margin:0 0 14px;color:var(--text-secondary);font-size:13px;line-height:1.5">Linked Work Orders remain managed by the existing NexArWO Work Orders tab using the current project relationship.</p>' +
      '<button type="button" class="btn btn-secondary btn-sm" onclick="switchProjTab(\'workorders\')" style="gap:6px"><i data-lucide="arrow-right" style="width:13px;height:13px"></i> Open Existing Work Orders</button>' +
    '</div></div>';
  }

  if (section.id === 'expenses') {
    return '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:16px">' +
      propertyHubMetric('Net Expenses', f ? fmtMoney(f.net_expense_cost) : '<span style="color:var(--text-muted);font-size:13px">Not available</span>', 'Existing project financial summary') +
      propertyHubMetric('Disbursements', f ? fmtMoney(f.total_disbursements) : '<span style="color:var(--text-muted);font-size:13px">Not available</span>', 'Existing project financial summary') +
      propertyHubMetric('Cost Basis', f ? fmtMoney(f.cost_basis) : '<span style="color:var(--text-muted);font-size:13px">Not available</span>', 'Existing project financial summary') +
    '</div>' +
    '<div class="card"><div class="card-body" style="padding:18px">' +
      propertyHubReadinessNotice('FlipEngine expense mapping') +
    '</div></div>';
  }

  if (section.id === 'loans') {
    var projectLoanAmount = propertyHubProjectField(p, 'loan_amount', 'loanAmount');
    var hasProjectLoan = projectLoanAmount !== null && parseFloat(projectLoanAmount) > 0;

    return '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:16px">' +
      propertyHubMetric('Existing Loan Amount', propertyHubDisplayValue(hasProjectLoan ? projectLoanAmount : null, fmtMoney), 'Existing project summary only') +
      propertyHubMetric('Construction Holdback', '<span style="color:var(--text-muted);font-size:13px">Not available</span>', 'No formal loan record loaded') +
      propertyHubMetric('Draw Requested', '<span style="color:var(--text-muted);font-size:13px">Not available</span>', 'No draw records loaded') +
      propertyHubMetric('Draw Funded', '<span style="color:var(--text-muted);font-size:13px">Not available</span>', 'No funded draw records loaded') +
    '</div>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px">' +
      '<section style="border:1px solid var(--border);border-radius:8px;padding:16px;background:var(--bg-card)">' +
        '<h4 style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin:0 0 14px;display:flex;align-items:center;gap:8px"><i data-lucide="landmark" style="width:14px;height:14px"></i> Financing Readiness</h4>' +
        propertyHubInfoRow('Project loan summary', hasProjectLoan ? '<span style="color:var(--accent)">Existing project data</span>' : '<span style="color:var(--text-muted)">Not available</span>') +
        propertyHubInfoRow('Formal lender record', '<span style="color:var(--text-muted)">Not loaded</span>') +
        propertyHubInfoRow('Loan number', '<span style="color:var(--text-muted)">Not available</span>') +
        propertyHubInfoRow('Loan balance', '<span style="color:var(--text-muted)">Not calculated</span>') +
      '</section>' +
      '<section style="border:1px solid var(--border);border-radius:8px;padding:16px;background:var(--bg-card)">' +
        '<h4 style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin:0 0 14px;display:flex;align-items:center;gap:8px"><i data-lucide="shield-check" style="width:14px;height:14px"></i> Funding Boundary</h4>' +
        propertyHubInfoRow('Draw records', '<span style="color:var(--text-muted)">Not loaded</span>') +
        propertyHubInfoRow('Available to draw', '<span style="color:var(--text-muted)">Not calculated</span>') +
        propertyHubInfoRow('Operating expenses', '<span style="color:var(--text-secondary)">Tracked separately</span>') +
        propertyHubInfoRow('Investor capital', '<span style="color:var(--text-secondary)">Not used by this panel</span>') +
      '</section>' +
    '</div>' +
    '<div style="margin-top:16px">' + propertyHubReadinessNotice('Loans / Draws') + '</div>';
  }

  if (section.id === 'sale') {
    var salePrice = propertyHubProjectField(p, 'sale_price', 'salePrice');
    if ((salePrice === null || parseFloat(salePrice) <= 0) && f) {
      salePrice = propertyHubProjectField(f, 'sale_price', 'salePrice');
    }
    var hasSale = salePrice !== null && parseFloat(salePrice) > 0;
    var existingProfit = hasSale && f ? f.profit : null;
    var netProceeds = hasSale && f ? f.net_proceeds : null;
    var cashPosition = f ? f.project_cash_position : null;
    var saleProjectStatus = PROJECT_STATUSES[p.status] || PROJECT_STATUSES.planning;

    return '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:16px">' +
      propertyHubMetric('Sale Price', propertyHubDisplayValue(hasSale ? salePrice : null, fmtMoney), 'Existing project value') +
      propertyHubMetric('Net Proceeds', propertyHubDisplayValue(netProceeds, fmtMoney), 'Existing financial summary') +
      propertyHubMetric('Existing Profit', propertyHubDisplayValue(existingProfit, fmtMoney), 'No new FlipEngine calculation') +
      propertyHubMetric('Project Cash Position', propertyHubDisplayValue(cashPosition, fmtMoney), 'Existing financial summary') +
    '</div>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px">' +
      '<section style="border:1px solid var(--border);border-radius:8px;padding:16px;background:var(--bg-card)">' +
        '<h4 style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin:0 0 14px;display:flex;align-items:center;gap:8px"><i data-lucide="badge-dollar-sign" style="width:14px;height:14px"></i> Sale Readiness</h4>' +
        propertyHubInfoRow('Project status', projectStatusPill(saleProjectStatus)) +
        propertyHubInfoRow('Sale summary', hasSale ? '<span style="color:var(--accent)">Existing project data</span>' : '<span style="color:var(--text-muted)">Not available</span>') +
        propertyHubInfoRow('Listing price', '<span style="color:var(--text-muted)">Not available</span>') +
        propertyHubInfoRow('Sale date', '<span style="color:var(--text-muted)">Not available</span>') +
      '</section>' +
      '<section style="border:1px solid var(--border);border-radius:8px;padding:16px;background:var(--bg-card)">' +
        '<h4 style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin:0 0 14px;display:flex;align-items:center;gap:8px"><i data-lucide="shield-check" style="width:14px;height:14px"></i> Financial Boundary</h4>' +
        propertyHubInfoRow('Financial source', f ? '<span style="color:var(--accent)">Existing NexArWO summary</span>' : '<span style="color:var(--text-muted)">Not available</span>') +
        propertyHubInfoRow('Sale / Exit record', '<span style="color:var(--text-muted)">Not loaded</span>') +
        propertyHubInfoRow('Commission planning', '<span style="color:var(--text-muted)">Not configured</span>') +
        propertyHubInfoRow('Final ROI', '<span style="color:var(--text-muted)">Not calculated in this panel</span>') +
      '</section>' +
    '</div>' +
    '<div style="margin-top:16px">' + propertyHubReadinessNotice('Sale / Exit') + '</div>';
  }

  if (section.id === 'reports') {
    return '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:16px">' +
      propertyHubMetric('Cost Basis', propertyHubDisplayValue(f ? f.cost_basis : null, fmtMoney), 'Existing financial summary') +
      propertyHubMetric('Cash Invested', propertyHubDisplayValue(f ? f.cash_invested : null, fmtMoney), 'Existing financial summary') +
      propertyHubMetric('Net Expenses', propertyHubDisplayValue(f ? f.net_expense_cost : null, fmtMoney), 'Existing financial summary') +
      propertyHubMetric('Disbursements', propertyHubDisplayValue(f ? f.total_disbursements : null, fmtMoney), 'Existing financial summary') +
      propertyHubMetric('Net Proceeds', propertyHubDisplayValue(f ? f.net_proceeds : null, fmtMoney), 'Existing financial summary') +
      propertyHubMetric('Existing Profit', propertyHubDisplayValue(f ? f.profit : null, fmtMoney), 'Existing financial summary') +
      propertyHubMetric('Project Cash Position', propertyHubDisplayValue(f ? f.project_cash_position : null, fmtMoney), 'Existing financial summary') +
    '</div>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px">' +
      '<section style="border:1px solid var(--border);border-radius:8px;padding:16px;background:var(--bg-card)">' +
        '<h4 style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin:0 0 14px;display:flex;align-items:center;gap:8px"><i data-lucide="chart-column" style="width:14px;height:14px"></i> Report Snapshot</h4>' +
        propertyHubInfoRow('Financial summary', f ? '<span style="color:var(--accent)">Available</span>' : '<span style="color:var(--text-muted)">Not available</span>') +
        propertyHubInfoRow('Mode', '<span style="color:var(--text-secondary)">Existing values only</span>') +
        propertyHubInfoRow('Forecasts', '<span style="color:var(--text-muted)">Not generated</span>') +
        propertyHubInfoRow('ROI', '<span style="color:var(--text-muted)">Not calculated in this panel</span>') +
      '</section>' +
      '<section style="border:1px solid var(--border);border-radius:8px;padding:16px;background:var(--bg-card)">' +
        '<h4 style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin:0 0 14px;display:flex;align-items:center;gap:8px"><i data-lucide="shield-check" style="width:14px;height:14px"></i> Reporting Boundary</h4>' +
        propertyHubInfoRow('Budget actuals', '<span style="color:var(--text-muted)">Not inferred</span>') +
        propertyHubInfoRow('Investor / funding data', '<span style="color:var(--text-secondary)">Excluded</span>') +
        propertyHubInfoRow('Receipt totals', '<span style="color:var(--text-muted)">Not added</span>') +
        propertyHubInfoRow('Payment totals', '<span style="color:var(--text-muted)">Not added</span>') +
      '</section>' +
    '</div>' +
    '<div style="margin-top:16px">' + propertyHubReadinessNotice('Reports') + '</div>';
  }

  return propertyHubPlaceholder(section);
}

function switchPropertyHubSection(sectionId) {
  _propertyHubActiveSection = propertyHubSectionById(sectionId).id;
  renderPropertyHubShell();
}

function renderPropertyHubShell() {
  var tab = document.getElementById('proj-tab-propertyhub');
  if (!tab || !_currentProject) return;

  if (!isFlipEngineProject(_currentProject)) {
    tab.innerHTML = '';
    return;
  }

  _propertyHubActiveSection = propertyHubSectionById(_propertyHubActiveSection).id;
  var p = _currentProject;
  var st = PROJECT_STATUSES[p.status] || PROJECT_STATUSES.planning;
  var section = propertyHubSectionById(_propertyHubActiveSection);
  var buttons = PROPERTY_HUB_SECTIONS.map(propertyHubModuleButton).join('');

  tab.innerHTML =
    '<div style="display:flex;flex-direction:column;gap:14px">' +
      '<section class="card" style="border-radius:8px"><div class="card-body" style="padding:14px 16px">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap">' +
          '<div>' +
            '<div class="proj-page-kicker" style="margin-bottom:5px">FlipEngine shell</div>' +
            '<div style="color:var(--text-secondary);font-size:13px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
              '<strong style="color:var(--text-primary)">' + escHtml(projectDisplayName(p)) + '</strong>' +
              projectStatusPill(st) +
              projectTypePill(getProjTypeCfg(p.project_type || null)) +
            '</div>' +
          '</div>' +
          '<div style="font-size:11px;font-weight:800;color:var(--text-muted);background:var(--bg-secondary);border:1px solid var(--border);border-radius:999px;padding:6px 10px;text-transform:uppercase;letter-spacing:0.4px">Read-only shell</div>' +
        '</div>' +
      '</div></section>' +
      '<div style="display:grid;grid-template-columns:minmax(240px,300px) minmax(0,1fr);gap:16px;align-items:start">' +
        '<aside class="card" style="border-radius:8px"><div class="card-body" style="padding:12px;display:grid;gap:8px">' + buttons + '</div></aside>' +
        '<section class="card" style="border-radius:8px"><div class="card-body" style="padding:18px">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;flex-wrap:wrap">' +
            '<div style="display:flex;align-items:center;gap:8px;color:var(--text-muted);font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px">' +
            '<i data-lucide="' + section.icon + '" style="width:14px;height:14px"></i>' + escHtml(section.label) +
            '</div>' +
            (section.locked ? '<div style="font-size:10px;font-weight:800;color:var(--text-muted);background:var(--bg-secondary);border:1px solid var(--border);border-radius:999px;padding:5px 8px;text-transform:uppercase;letter-spacing:0.35px">Locked</div>' : '<div style="font-size:10px;font-weight:800;color:var(--accent);background:var(--bg-secondary);border:1px solid var(--border);border-radius:999px;padding:5px 8px;text-transform:uppercase;letter-spacing:0.35px">Existing data</div>') +
          '</div>' +
          renderPropertyHubSection(section.id) +
        '</div></section>' +
      '</div>' +
    '</div>';

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderProjectDetail(options) {
  options = options || {};
  if (!_currentProject) return;
  var p = _currentProject;
  var st = PROJECT_STATUSES[p.status] || PROJECT_STATUSES.planning;
  var activeTab = document.querySelector('.proj-detail-tab.active');
  syncPropertyHubTabVisibility();
  activeTab = document.querySelector('.proj-detail-tab.active');
  var displayTab = options.preserveTab && activeTab ? activeTab.dataset.tab : 'overview';
  syncPropertyHubNavigationContext(displayTab);
  updateProjectWorkspaceChrome(displayTab);

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
    if (activeTab && activeTab.dataset.tab === 'propertyhub') renderPropertyHubShell();
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
  if (activeTab && activeTab.dataset.tab === 'propertyhub') renderPropertyHubShell();
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
    renderProjectDetail({ preserveTab: true }); // re-render now that we have data
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
      '<div class="proj-empty" style="color:var(--text-muted);padding:48px 20px">' +
        '<div style="background:var(--bg-secondary);width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">' +
        '<i data-lucide="clipboard-list" style="width:32px;height:32px;opacity:0.5"></i></div>' +
        '<p style="font-size:16px;font-weight:700;color:var(--text-primary);margin:0 0 8px">No linked work orders yet.</p>' +
        '<p style="font-size:13px;max-width:380px;margin:0 auto 20px;line-height:1.6">' +
          'Link existing unassigned Work Orders to this project.' +
        '</p>' +
        '<button class="btn btn-primary btn-sm" onclick="openLinkWOModal()" style="gap:6px">' +
        '<i data-lucide="link" style="width:14px;height:14px"></i> Link Existing Work Orders</button>' +
      '</div>';
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }

  var html = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
    '<h4 style="margin:0;font-size:13px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px">Linked Work Orders <span style="font-weight:400;font-size:11px;color:var(--text-muted)">(' + matchedWOs.length + ')</span></h4>' +
    '<button class="btn btn-secondary btn-sm" onclick="openLinkWOModal()" style="gap:6px">' +
    '<i data-lucide="link" style="width:13px;height:13px"></i> Link Existing</button>' +
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
// LINK EXISTING WORK ORDERS MODAL — Phase 2C
// Opens the shared confirm-box overlay with a custom checkbox list.
// Shows: unassigned WOs first, then already-linked WOs (checked/disabled).
// Excludes WOs linked to other projects.
// ============================================================
async function openLinkWOModal() {
  if (!_currentProject) return;

  var overlay = document.getElementById('confirm-modal-overlay');
  var box     = document.querySelector('.confirm-box');
  if (!overlay || !box) return;

  // Show loading state immediately
  box.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
      '<h3 style="margin:0;font-size:16px;font-weight:700">Link Work Orders to Project</h3>' +
      '<button class="btn btn-ghost btn-sm" onclick="closeConfirmModal()" style="padding:4px 8px">✕</button>' +
    '</div>' +
    '<div style="font-size:12px;color:var(--text-muted);margin-bottom:16px">' +
      'Project: <strong>' + escHtml(_currentProject.name) + '</strong>' +
    '</div>' +
    '<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:13px">Loading Work Orders…</div>';
  overlay.style.display = 'flex';

  // Fetch all WOs
  var allWOs = [];
  if (typeof isSupabaseReady === 'function' && isSupabaseReady()) {
    allWOs = await DB.workOrders.getAll() || [];
  }

  // Partition: already linked vs unassigned — exclude WOs from other projects
  var alreadyLinked = allWOs.filter(function(wo) {
    return wo.project_id === _currentProject.id;
  });
  var unassigned = allWOs.filter(function(wo) {
    return !wo.project_id || wo.project_id === null || wo.project_id === '';
  });

  var totalEligible = unassigned.length + alreadyLinked.length;

  // ── Build modal HTML ────────────────────────────────────────────────────────
  var listHtml = '';

  if (totalEligible === 0) {
    listHtml =
      '<div style="padding:32px;text-align:center;color:var(--text-muted);font-size:13px">' +
        '<div style="font-size:28px;margin-bottom:12px">📋</div>' +
        'No unassigned Work Orders available to link.' +
      '</div>';
  } else {
    // Unassigned WOs — selectable checkboxes
    if (unassigned.length > 0) {
      listHtml += '<div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Available to Link</div>';
      unassigned.forEach(function(wo) {
        var stColor = wo.status === 'completed' ? 'var(--success)' : (wo.status === 'cancelled' ? 'var(--danger)' : 'var(--accent)');
        listHtml +=
          '<label style="display:flex;align-items:flex-start;gap:10px;padding:10px;border:1px solid var(--border);border-radius:6px;margin-bottom:6px;cursor:pointer;background:var(--bg-primary)">' +
            '<input type="checkbox" class="wo-link-check" data-wo-id="' + escHtml(wo.id) + '" style="margin-top:3px;cursor:pointer">' +
            '<div style="min-width:0;flex:1">' +
              '<div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(wo.title || wo.id) + '</div>' +
              '<div style="font-size:11px;color:var(--text-muted)">' +
                escHtml(wo.client || '—') +
                ' · <span style="font-weight:700;color:' + stColor + '">' + (wo.status || 'pending').toUpperCase() + '</span>' +
                ' · ' + fmtMoney(wo.total) +
              '</div>' +
            '</div>' +
          '</label>';
      });
    }

    // Already-linked WOs — shown checked and disabled so user can see what's already here
    if (alreadyLinked.length > 0) {
      listHtml += '<div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin:14px 0 8px">Already Linked</div>';
      alreadyLinked.forEach(function(wo) {
        var stColor = wo.status === 'completed' ? 'var(--success)' : (wo.status === 'cancelled' ? 'var(--danger)' : 'var(--accent)');
        listHtml +=
          '<label style="display:flex;align-items:flex-start;gap:10px;padding:10px;border:1px solid var(--border);border-radius:6px;margin-bottom:6px;background:var(--bg-secondary);opacity:0.7;cursor:default">' +
            '<input type="checkbox" disabled checked style="margin-top:3px">' +
            '<div style="min-width:0;flex:1">' +
              '<div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(wo.title || wo.id) + '</div>' +
              '<div style="font-size:11px;color:var(--text-muted)">' +
                escHtml(wo.client || '—') +
                ' · <span style="font-weight:700;color:' + stColor + '">' + (wo.status || 'pending').toUpperCase() + '</span>' +
                ' · ' + fmtMoney(wo.total) +
              '</div>' +
            '</div>' +
          '</label>';
      });
    }
  }

  box.innerHTML =
    // Header
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">' +
      '<h3 style="margin:0;font-size:16px;font-weight:700">Link Work Orders to Project</h3>' +
      '<button class="btn btn-ghost btn-sm" onclick="closeConfirmModal()" style="padding:4px 10px;font-size:16px;line-height:1">✕</button>' +
    '</div>' +
    '<div style="font-size:12px;color:var(--text-muted);margin-bottom:16px">' +
      'Project: <strong>' + escHtml(_currentProject.name) + '</strong>' +
    '</div>' +
    // Scrollable list
    '<div id="wo-link-list" style="max-height:340px;overflow-y:auto;margin-bottom:16px;padding-right:2px">' +
      listHtml +
    '</div>' +
    // Actions
    '<div style="display:flex;justify-content:flex-end;gap:10px;border-top:1px solid var(--border);padding-top:14px">' +
      '<button class="btn btn-secondary" onclick="closeConfirmModal()">Cancel</button>' +
      (unassigned.length > 0
        ? '<button id="wo-link-save-btn" class="btn btn-primary" onclick="saveLinkWOs()">Link Selected</button>'
        : '') +
    '</div>';

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Saves the checked Work Orders from the link modal and links them to _currentProject.
async function saveLinkWOs() {
  if (!_currentProject) return;

  var checkboxes = document.querySelectorAll('.wo-link-check:checked');
  if (checkboxes.length === 0) {
    showToast('⚠️ No Work Orders selected.');
    return;
  }

  var saveBtn = document.getElementById('wo-link-save-btn');
  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Linking…'; }

  var ids = [];
  checkboxes.forEach(function(cb) { ids.push(cb.getAttribute('data-wo-id')); });

  var successCount = 0;
  var failIds = [];

  for (var i = 0; i < ids.length; i++) {
    var woId = ids[i];
    var ok = false;
    if (typeof isSupabaseReady === 'function' && isSupabaseReady()) {
      ok = await DB.workOrders.update(woId, { project_id: _currentProject.id });
    }
    if (ok) {
      successCount++;
    } else {
      failIds.push(woId);
    }
  }

  closeConfirmModal();

  if (failIds.length > 0) {
    showToast('⚠️ ' + failIds.length + ' Work Order(s) failed to link. Check console.');
    console.error('saveLinkWOs: failed WO IDs', failIds);
  }
  if (successCount > 0) {
    showToast('✅ ' + successCount + ' Work Order' + (successCount > 1 ? 's' : '') + ' linked to this project.');
  }

  // Re-render WO tab with updated data regardless of partial failure
  await renderWorkOrdersTab();
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



// ============================================================
// INVESTOR HUB - Owner/Admin Console
// INTERNAL & ADMIN USE ONLY
// Rules: no delete, no ROI, no distributions, no profit split.
// Capital contributions stay separate from project P&L.
// ============================================================

var IH_OWNER_ADMIN = {
  name: 'R.C Art Construction Owner',
  role: 'Owner Admin',
  access: 'Live Investor Hub control'
};
var _ihMode = 'setup_required';
var _ihLastNotice = '';
var _ihRealtimeChannel = null;
var _ihRealtimeProjectId = null;
var _ihRealtimeRefreshTimer = null;

var IH_ROLES = {
  owner_admin: 'Owner Admin',
  lead_contractor: 'Lead Contractor',
  equity_partner: 'Equity Partner',
  silent_partner: 'Silent Partner',
  private_lender: 'Private Lender',
  other: 'Other'
};

function ihToday() {
  return new Date().toISOString().split('T')[0];
}

function ihFmtDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function ihStatusChip(status) {
  var s = status || 'pending';
  var label = s.charAt(0).toUpperCase() + s.slice(1);
  return '<span class="ih-chip ih-chip-' + escHtml(s) + '">' + escHtml(label) + '</span>';
}

function ihModeLabel() {
  return _ihMode === 'supabase' ? 'Live Supabase' : 'Supabase schema required';
}

function ihModeDetail() {
  return _ihMode === 'supabase'
    ? 'Connected in real time. Owner/Admin controls are active.'
    : 'Investor tables are not available yet. Demo/local writes are disabled so every new investor must be real.';
}

function ihCanUseLive() {
  return _ihMode === 'supabase' && typeof isSupabaseReady === 'function' && isSupabaseReady();
}

function ihRealDataUnavailableMessage() {
  return 'Real Investor Hub tables are not available in Supabase yet. Apply the Investor Hub migrations before creating investors, contributions, or capital calls. No demo/local records will be created.';
}

function ihStopRealtime() {
  if (_ihRealtimeRefreshTimer) {
    clearTimeout(_ihRealtimeRefreshTimer);
    _ihRealtimeRefreshTimer = null;
  }
  if (_ihRealtimeChannel && typeof getSupabase === 'function') {
    var sb = getSupabase();
    if (sb && typeof sb.removeChannel === 'function') {
      sb.removeChannel(_ihRealtimeChannel);
    }
  }
  _ihRealtimeChannel = null;
  _ihRealtimeProjectId = null;
}

function ihScheduleRealtimeRefresh(projectId) {
  if (!_currentProject || _currentProject.id !== projectId) return;
  if (_ihRealtimeRefreshTimer) clearTimeout(_ihRealtimeRefreshTimer);
  _ihRealtimeRefreshTimer = setTimeout(function() {
    _ihRealtimeRefreshTimer = null;
    if (_currentProject && _currentProject.id === projectId) {
      renderInvestorHub(projectId);
    }
  }, 250);
}

function ihEnsureRealtime(projectId) {
  if (_ihMode !== 'supabase') {
    ihStopRealtime();
    return;
  }
  if (_ihRealtimeChannel && _ihRealtimeProjectId === projectId) return;
  ihStopRealtime();

  if (typeof getSupabase !== 'function') return;
  var sb = getSupabase();
  if (!sb || typeof sb.channel !== 'function') return;

  var projectFilter = 'project_id=eq.' + projectId;
  _ihRealtimeProjectId = projectId;
  _ihRealtimeChannel = sb.channel('investor-hub-' + projectId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'project_investors', filter: projectFilter }, function() {
      ihScheduleRealtimeRefresh(projectId);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'capital_contributions', filter: projectFilter }, function() {
      ihScheduleRealtimeRefresh(projectId);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'capital_calls', filter: projectFilter }, function() {
      ihScheduleRealtimeRefresh(projectId);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'investors' }, function() {
      ihScheduleRealtimeRefresh(projectId);
    })
    .subscribe(function(status) {
      if (status === 'CHANNEL_ERROR') {
        _ihLastNotice = 'Investor Hub live data loaded, but realtime updates are not available yet.';
      }
    });
}

async function ihProjectData(projectId) {
  _ihLastNotice = '';
  if (typeof isSupabaseReady === 'function' && isSupabaseReady()) {
    var pis = await DB.projectInvestors.getByProject(projectId);
    var contribs = await DB.capitalContributions.getByProject(projectId);
    var calls = await DB.capitalCalls.getByProject(projectId);
    if (Array.isArray(pis) && Array.isArray(contribs) && Array.isArray(calls)) {
      _ihMode = 'supabase';
      return { pis: pis, contribs: contribs, calls: calls, mode: 'supabase' };
    }
    _ihLastNotice = ihRealDataUnavailableMessage();
  }

  _ihMode = 'setup_required';
  return { pis: [], contribs: [], calls: [], mode: 'setup_required' };
}

async function ihAllInvestors() {
  if (ihCanUseLive()) {
    var live = await DB.investors.getAll();
    if (Array.isArray(live)) return live;
  }
  return [];
}

async function ihCreateInvestor(inv) {
  if (ihCanUseLive()) {
    var live = await DB.investors.create(inv);
    if (live) return live;
  }
  return null;
}

async function ihAttachInvestor(projectId, investorId, role, opts) {
  if (ihCanUseLive()) {
    var live = await DB.projectInvestors.attach(projectId, investorId, role, opts);
    if (live) return live;
  }
  return null;
}

async function ihSetProjectInvestorStatus(id, status) {
  if (ihCanUseLive()) {
    var ok = status === 'confirmed' ? await DB.projectInvestors.confirm(id) : await DB.projectInvestors.cancel(id);
    if (ok) return true;
  }
  return false;
}

async function ihCreateContribution(contrib) {
  if (ihCanUseLive()) {
    var live = await DB.capitalContributions.create(contrib);
    if (live) return live;
  }
  return null;
}

async function ihSetContributionStatus(id, status) {
  if (ihCanUseLive()) {
    var ok = status === 'confirmed' ? await DB.capitalContributions.confirm(id) : await DB.capitalContributions.cancel(id);
    if (ok) return true;
  }
  return false;
}

async function ihCreateCall(call) {
  if (ihCanUseLive()) {
    var live = await DB.capitalCalls.create(call);
    if (live) return live;
  }
  return null;
}

async function ihSetCallStatus(id, status) {
  if (ihCanUseLive()) {
    var ok = status === 'confirmed' ? await DB.capitalCalls.confirm(id) : await DB.capitalCalls.cancel(id);
    if (ok) return true;
  }
  return false;
}

function ihActionButtons(kind, id, status) {
  var confirmFn = kind === 'investor' ? 'ihConfirmPI' : (kind === 'contrib' ? 'ihConfirmContrib' : 'ihConfirmCall');
  var cancelFn = kind === 'investor' ? 'ihCancelPI' : (kind === 'contrib' ? 'ihCancelContrib' : 'ihCancelCall');
  var html = '<div class="ih-row-actions">';
  if (status === 'pending') {
    html += '<button class="btn btn-sm ih-confirm-btn" onclick="' + confirmFn + '(\'' + escHtml(id) + '\')">Confirm</button>';
  }
  if (status !== 'cancelled') {
    html += '<button class="btn btn-sm btn-secondary" onclick="' + cancelFn + '(\'' + escHtml(id) + '\')">Void</button>';
  }
  html += '</div>';
  return html;
}

function ihSetupRequiredButton(label) {
  return '<button class="btn btn-secondary btn-sm ih-setup-required-btn" type="button" disabled title="Apply Investor Hub migrations before this action is available"><i data-lucide="lock-keyhole"></i> ' + escHtml(label || 'Setup Required') + '</button>';
}

function ihLiveActionButton(label, icon, onclick, variant) {
  if (!ihCanUseLive()) return ihSetupRequiredButton('Setup Required');
  return '<button class="btn ' + (variant || 'btn-secondary') + ' btn-sm" onclick="' + onclick + '"><i data-lucide="' + icon + '"></i> ' + escHtml(label) + '</button>';
}

function ihRenderInvestorCards(pis, contribs) {
  var active = pis.filter(function(pi) { return pi.status !== 'cancelled'; });
  if (!active.length) {
    return '<div class="ih-empty">'
      + '<div class="ih-empty-icon"><i data-lucide="user-plus"></i></div>'
      + '<div><strong>No project investors yet</strong><span>' + (ihCanUseLive() ? 'Owner/Admin access is active. Add the first investor when you are ready to track capital.' : 'Investor Hub is waiting for the real Supabase schema before investor records can be created.') + '</span></div>'
      + (ihCanUseLive() ? '<button class="btn btn-primary btn-sm" onclick="openAddInvestorModal()">Add Investor</button>' : ihSetupRequiredButton('Setup Required'))
      + '</div>';
  }

  return '<div class="ih-investor-grid">' + active.map(function(pi) {
    var inv = pi.investors || {};
    var pId = escHtml(pi.id);
    var iId = escHtml(pi.investor_id);
    var typeLbl = inv.type === 'company' ? 'Company' : 'Person';
    return '<article class="ih-investor-card" onclick="openInvestorDetailModal(\'' + pId + '\',\'' + iId + '\')">'
      + '<div class="ih-investor-top" style="margin-bottom:0">'
      + '<div class="ih-investor-name">' + escHtml(inv.name || 'Unnamed investor') + '</div>'
      + '</div>'
      + '<div class="ih-card-tags">'
      + '<span class="ih-type-badge">' + escHtml(typeLbl) + '</span>'
      + ihStatusChip(pi.status)
      + '</div>'
      + ihInvestorCardActions(pi.id, pi.investor_id, pi.status)
      + '</article>';
  }).join('') + '</div>';
}

function ihRenderContributionRows(contribs) {
  if (!contribs.length) {
    return '<div class="ih-empty ih-empty-compact">'
      + '<div class="ih-empty-icon"><i data-lucide="receipt-text"></i></div>'
      + '<div><strong>No capital contributions</strong><span>Record owner-approved deposits here. They stay separate from expenses and project P&L.</span></div>'
      + '</div>';
  }

  return '<div class="ih-table-wrap"><table class="proj-table ih-table"><thead><tr>'
    + '<th>Investor</th><th>Date</th><th>Amount</th><th>Type</th><th>Method</th><th>Status</th><th></th>'
    + '</tr></thead><tbody>'
    + contribs.map(function(c) {
      var inv = c.investors || {};
      return '<tr><td><strong>' + escHtml(inv.name || 'Unknown investor') + '</strong></td>'
        + '<td>' + ihFmtDate(c.date) + '</td>'
        + '<td class="right"><strong>' + fmtMoney(c.amount) + '</strong></td>'
        + '<td>' + escHtml(c.type || '-') + '</td>'
        + '<td>' + escHtml(c.method || '-') + '</td>'
        + '<td>' + ihStatusChip(c.status) + '</td>'
        + '<td>' + ihActionButtons('contrib', c.id, c.status) + '</td></tr>';
    }).join('')
    + '</tbody></table></div>';
}

function ihRenderCallRows(calls) {
  if (!calls.length) {
    return '<div class="ih-empty ih-empty-compact">'
      + '<div class="ih-empty-icon"><i data-lucide="bell-ring"></i></div>'
      + '<div><strong>No capital calls</strong><span>Use this only for owner-approved requests. It does not create invoices or distributions.</span></div>'
      + '</div>';
  }

  return '<div class="ih-call-list">'
    + calls.map(function(call) {
      return '<article class="ih-call-row">'
        + '<div><div class="ih-call-amount">' + fmtMoney(call.requested_amount) + '</div>'
        + '<div class="ih-investor-meta">' + escHtml(call.reason || 'No reason') + '</div>'
        + '<div class="ih-investor-meta">Due: ' + ihFmtDate(call.due_date) + '</div></div>'
        + '<div class="ih-call-actions">' + ihStatusChip(call.status) + ihActionButtons('call', call.id, call.status) + '</div>'
        + '</article>';
    }).join('')
    + '</div>';
}

async function renderInvestorHub(projectId) {
  var tab = document.getElementById('proj-tab-investorhub');
  if (!tab) return;

  if (!tab.querySelector('.ih-shell')) {
    _ihMode = 'setup_required';
    _ihLastNotice = '';
    ihRenderInvestorHubShell(projectId, { pis: [], contribs: [], calls: [], mode: 'setup_required' });
  }

  var data;
  try {
    data = await ihProjectData(projectId);
  } catch(e) {
    console.warn('Investor Hub live refresh failed:', e);
    data = { pis: [], contribs: [], calls: [], mode: 'setup_required' };
    _ihMode = 'setup_required';
    _ihLastNotice = ihRealDataUnavailableMessage();
  }

  if (!_currentProject || _currentProject.id !== projectId) return;
  ihEnsureRealtime(projectId);
  ihRenderInvestorHubShell(projectId, data);
}

function ihRenderInvestorHubShell(projectId, data) {
  var tab = document.getElementById('proj-tab-investorhub');
  if (!tab) return;
  var pis = data.pis || [];
  var contribs = data.contribs || [];
  var calls = data.calls || [];
  _ihInvestors = pis;
  _ihContribs = contribs;
  _ihCalls = calls;

  var totalConfirmed = contribs
    .filter(function(c) { return c.status === 'confirmed'; })
    .reduce(function(s, c) { return s + (parseFloat(c.amount) || 0); }, 0);
  var totalPending = contribs
    .filter(function(c) { return c.status === 'pending'; })
    .reduce(function(s, c) { return s + (parseFloat(c.amount) || 0); }, 0);
  var activeInvestors = pis.filter(function(x) { return x.status !== 'cancelled'; }).length;
  var openCalls = calls.filter(function(x) { return x.status === 'pending'; }).length;
  var projectName = _currentProject ? escHtml(projectDisplayName(_currentProject)) : 'Selected Project';
  var notice = _ihLastNotice ? '<div class="ih-notice"><i data-lucide="info"></i><span>' + escHtml(_ihLastNotice) + '</span></div>' : '';
  var heroActions = ihCanUseLive()
    ? '<button class="btn btn-primary btn-sm" onclick="openAddInvestorModal()"><i data-lucide="user-plus"></i> Add Investor</button>'
      + '<button class="btn btn-secondary btn-sm" onclick="openAddContribModal()"><i data-lucide="circle-dollar-sign"></i> Add Contribution</button>'
      + '<button class="btn btn-secondary btn-sm" onclick="openAddCallModal()"><i data-lucide="bell-ring"></i> Add Capital Call</button>'
    : ihSetupRequiredButton('Setup Required');

  var html = '<div class="ih-shell">'
    + '<section class="ih-hero">'
    + '<div class="ih-hero-copy">'
    + '<div class="ih-kicker"><i data-lucide="shield-check"></i> OWNER ADMIN MODULE ACTIVE</div>'
    + '<h3>Investor Hub Control Room</h3>'
    + '<p>Investor records load from Supabase in real time. Capital commitments and profit share stay separate from project expenses, disbursements, ROI, and P&amp;L.</p>'
    + '<div class="ih-hero-actions">'
    + heroActions
    + '<button class="btn btn-secondary btn-sm" onclick="renderInvestorHub(_currentProject.id)"><i data-lucide="refresh-cw"></i> Refresh Live Data</button>'
    + '</div></div>'
    + '<aside class="ih-owner-panel">'
    + '<span class="ih-owner-label">SIGNED IN AS</span>'
    + '<strong>' + escHtml(IH_OWNER_ADMIN.name) + '</strong>'
    + '<div>' + escHtml(IH_OWNER_ADMIN.role) + '</div>'
    + '<small>' + ihModeLabel() + ' - ' + ihModeDetail() + '</small>'
    + '</aside>'
    + '</section>'
    + notice
    + '<section class="ih-rule-strip">'
    + '<span><i data-lucide="lock-keyhole"></i> Active owner/admin module</span>'
    + '<span><i data-lucide="ban"></i> No ROI or distributions</span>'
    + '<span><i data-lucide="archive"></i> Void instead of delete</span>'
    + '<span><i data-lucide="split"></i> Capital separate from P&L</span>'
    + '</section>'
    + '<section class="ih-stat-grid">'
    + '<div class="ih-stat"><span>Active Investors</span><strong>' + activeInvestors + '</strong><small>Linked to this project</small></div>'
    + '<div class="ih-stat"><span>Confirmed Capital</span><strong>' + fmtMoney(totalConfirmed) + '</strong><small>Approved entries only</small></div>'
    + '<div class="ih-stat"><span>Pending Capital</span><strong>' + fmtMoney(totalPending) + '</strong><small>Waiting owner confirmation</small></div>'
    + '<div class="ih-stat"><span>Open Calls</span><strong>' + openCalls + '</strong><small>Pending capital requests</small></div>'
    + '</section>'
    + '<section class="ih-section">'
    + '<div class="ih-section-head"><div><span>Capital Stack</span><h4>Investors</h4></div>' + ihLiveActionButton('Add Investor', 'user-plus', 'openAddInvestorModal()', 'btn-primary') + '</div>'
    + ihRenderInvestorCards(pis, contribs)
    + '</section>'
    + '<section class="ih-section">'
    + '<div class="ih-section-head"><div><span>Owner Ledger</span><h4>Capital Contributions</h4></div>' + ihLiveActionButton('Add Contribution', 'circle-dollar-sign', 'openAddContribModal()', 'btn-primary') + '</div>'
    + ihRenderContributionRows(contribs)
    + '</section>'
    + '<section class="ih-section">'
    + '<div class="ih-section-head"><div><span>Capital Requests</span><h4>Capital Calls</h4></div>' + ihLiveActionButton('Add Capital Call', 'bell-ring', 'openAddCallModal()', 'btn-secondary') + '</div>'
    + ihRenderCallRows(calls)
    + '</section>'
    + '</div>';

  tab.innerHTML = html;
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function ihConfirmPI(id) {
  if (await ihSetProjectInvestorStatus(id, 'confirmed')) {
    showToast('Investor confirmed');
    renderInvestorHub(_currentProject.id);
  } else {
    alert('Could not confirm investor.');
  }
}

async function ihCancelPI(id) {
  showConfirmModal('Void Investor Link', 'Mark this investor link as voided? The record stays in the ledger.', async function() {
    if (await ihSetProjectInvestorStatus(id, 'cancelled')) {
      showToast('Investor link voided');
      renderInvestorHub(_currentProject.id);
    } else {
      alert('Could not void investor link.');
    }
  });
}

async function ihConfirmContrib(id) {
  if (await ihSetContributionStatus(id, 'confirmed')) {
    showToast('Contribution confirmed');
    renderInvestorHub(_currentProject.id);
  } else {
    alert('Could not confirm contribution.');
  }
}

async function ihCancelContrib(id) {
  showConfirmModal('Void Contribution', 'Mark this contribution as voided? The record stays in the ledger.', async function() {
    if (await ihSetContributionStatus(id, 'cancelled')) {
      showToast('Contribution voided');
      renderInvestorHub(_currentProject.id);
    } else {
      alert('Could not void contribution.');
    }
  });
}

async function ihConfirmCall(id) {
  if (await ihSetCallStatus(id, 'confirmed')) {
    showToast('Capital call confirmed');
    renderInvestorHub(_currentProject.id);
  } else {
    alert('Could not confirm capital call.');
  }
}

async function ihCancelCall(id) {
  showConfirmModal('Void Capital Call', 'Mark this capital call as voided?', async function() {
    if (await ihSetCallStatus(id, 'cancelled')) {
      showToast('Capital call voided');
      renderInvestorHub(_currentProject.id);
    } else {
      alert('Could not void capital call.');
    }
  });
}

function ihSetWideModal(box) {
  if (!box) return;
  box.style.maxWidth = '560px';
  box.style.width = 'calc(100% - 32px)';
}

function ihOpenRealDataRequiredModal(actionTitle) {
  showConfirmModal(actionTitle || 'Investor Hub Setup Required', '', null);
  var box = document.querySelector('.confirm-box');
  ihSetWideModal(box);
  if (!box) return;
  box.innerHTML = '<h3 style="margin:0 0 6px;font-size:16px">' + escHtml(actionTitle || 'Investor Hub Setup Required') + '</h3>'
    + '<div class="ih-modal-note">Real records only. Demo/local Investor Hub writes are disabled.</div>'
    + '<div class="ih-modal-form">'
    + '<div style="padding:14px;border:1px solid var(--border-light);border-radius:8px;background:#fffdf7">'
    + '<strong style="display:block;color:var(--text-primary);font-size:13px;margin-bottom:6px">Supabase investor schema is not ready</strong>'
    + '<span style="display:block;color:var(--text-secondary);font-size:12px;line-height:1.5">Apply the Investor Hub migrations so this action can create real records in <code>investors</code>, <code>project_investors</code>, <code>capital_contributions</code>, and <code>capital_calls</code>. This modal will not create local demo data.</span>'
    + '</div>'
    + '<div style="display:grid;gap:6px;color:var(--text-secondary);font-size:12px;line-height:1.45">'
    + '<span><strong>Required:</strong> supabase/migrations/202605070001_investor_entities.sql</span>'
    + '<span><strong>Realtime:</strong> supabase/migrations/202605070004_investor_realtime_publication.sql</span>'
    + '<span><strong>Role alignment:</strong> supabase/migrations/202605070005_project_investor_private_lender_role.sql</span>'
    + '</div>'
    + '<div class="ih-modal-actions">'
    + '<button class="btn btn-secondary" onclick="closeConfirmModal()">Close</button>'
    + '<button class="btn btn-primary" onclick="closeConfirmModal(); renderInvestorHub(_currentProject.id)">Refresh Live Data</button>'
    + '</div></div>';
}

// ---- ISSUE-013 Phase 2C: Add Investor Wizard ----

var _ihWizData = {};
var _ihWizEditPiId = null;
var _ihWizEditInvId = null;
var _ihWizEditCoId  = null;

function ihWizIndHtml(n) {
  var labels = ['Identity', 'Investor Terms', 'Review'];
  var isActive = (n === 1);
  return '<div id="ih-wiz-ind-' + n + '" style="display:flex;flex-direction:column;align-items:center;gap:2px;min-width:56px">'
    + '<div style="width:26px;height:26px;border-radius:50%;background:' + (isActive ? 'var(--accent,#d97706)' : '#e5e7eb') + ';color:' + (isActive ? '#fff' : '#9ca3af') + ';display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">' + n + '</div>'
    + '<div style="font-size:10px;color:' + (isActive ? 'var(--accent,#d97706)' : '#9ca3af') + ';font-weight:' + (isActive ? '600' : '400') + ';white-space:nowrap">' + labels[n - 1] + '</div>'
    + '</div>';
}

function ihWizStep(n) {
  var labels = ['Identity', 'Investor Terms', 'Review'];
  [1, 2, 3].forEach(function(i) {
    var panel = document.getElementById('ih-wiz-panel-' + i);
    var ind   = document.getElementById('ih-wiz-ind-' + i);
    if (panel) panel.style.display = (i === n) ? '' : 'none';
    if (ind) {
      var isActive = (i === n), isDone = (i < n);
      var bg = isActive ? 'var(--accent,#d97706)' : isDone ? '#22c55e' : '#e5e7eb';
      var fg = (isActive || isDone) ? '#fff' : '#9ca3af';
      var lc = isActive ? 'var(--accent,#d97706)' : isDone ? '#16a34a' : '#9ca3af';
      var lw = (isActive || isDone) ? '600' : '400';
      ind.innerHTML = '<div style="width:26px;height:26px;border-radius:50%;background:' + bg + ';color:' + fg + ';display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">' + (isDone ? '✓' : i) + '</div>'
        + '<div style="font-size:10px;color:' + lc + ';font-weight:' + lw + ';white-space:nowrap">' + labels[i - 1] + '</div>';
    }
  });
}

function ihSetInvestorType(type) {
  _ihWizData.type = type;
  var bp = document.getElementById('ih-wiz-type-person');
  var bc = document.getElementById('ih-wiz-type-company');
  var fp = document.getElementById('ih-wiz-fields-person');
  var fc = document.getElementById('ih-wiz-fields-company');
  if (bp) bp.className = 'btn btn-sm ' + (type === 'person' ? 'btn-primary' : 'btn-secondary');
  if (bc) bc.className = 'btn btn-sm ' + (type === 'company' ? 'btn-primary' : 'btn-secondary');
  if (fp) fp.style.display = type === 'person' ? '' : 'none';
  if (fc) fc.style.display = type === 'company' ? '' : 'none';
}

function ihValidateAddInvestorWizardStep(step) {
  if (step === 1) {
    var sel = ((document.getElementById('ih-wiz-sel') || {}).value || '').trim();
    if (sel) return true;
    var type = _ihWizData.type || 'person';
    if (type === 'person') {
      var fn = ((document.getElementById('ih-wiz-fname') || {}).value || '').trim();
      if (!fn) { alert('First name is required.'); return false; }
    } else {
      var cn = ((document.getElementById('ih-wiz-co-name') || {}).value || '').trim();
      if (!cn) { alert('Company name is required.'); return false; }
    }
  }
  return true;
}

function ihValidateProjectCapitalFields() {
  var d = _ihWizData;
  var prof = Number(d.profit);
  var cap = Number(d.capital);
  if (isNaN(prof) || prof < 0 || prof > 100) { alert('Expected project profit share must be between 0 and 100.'); return false; }
  if (isNaN(cap) || cap < 0) { alert('Investment amount cannot be negative.'); return false; }
  return true;
}

function ihCollectAddInvestorWizardData() {
  var d = _ihWizData;
  var selEl = document.getElementById('ih-wiz-sel');
  d.existingId = ((selEl || {}).value || '').trim();
  if (d.existingId && selEl && selEl.selectedIndex >= 0) {
    d.existingName = (selEl.options[selEl.selectedIndex] || {}).text || '';
  } else {
    d.existingName = '';
  }
  if (!d.existingId) {
    d.type = d.type || 'person';
    if (d.type === 'person') {
      d.firstName = ((document.getElementById('ih-wiz-fname')   || {}).value || '').trim();
      d.lastName  = ((document.getElementById('ih-wiz-lname')   || {}).value || '').trim();
      d.email     = ((document.getElementById('ih-wiz-email')   || {}).value || '').trim();
      d.phone     = ((document.getElementById('ih-wiz-phone')   || {}).value || '').trim();
      d.address   = ((document.getElementById('ih-wiz-address') || {}).value || '').trim();
      d.city      = ((document.getElementById('ih-wiz-city')    || {}).value || '').trim();
      var stateSelVal = ((document.getElementById('ih-wiz-state') || {}).value || '');
      if (stateSelVal === 'OTHER') {
        var cntry = ((document.getElementById('ih-wiz-custom-country')    || {}).value || '').trim();
        var cregn = ((document.getElementById('ih-wiz-custom-state-text') || {}).value || '').trim();
        d.state = [cregn, cntry].filter(Boolean).join(', ');
      } else {
        d.state = stateSelVal;
      }
      d.zip       = ((document.getElementById('ih-wiz-zip')     || {}).value || '').trim();
      d.notes     = ((document.getElementById('ih-wiz-notes')   || {}).value || '').trim();
    } else {
      d.coName        = ((document.getElementById('ih-wiz-co-name')     || {}).value || '').trim();
      d.coContact     = ((document.getElementById('ih-wiz-co-contact')  || {}).value || '').trim();
      d.coContactRole = ((document.getElementById('ih-wiz-co-role')     || {}).value || '').trim();
      d.coEmail       = ((document.getElementById('ih-wiz-co-email')    || {}).value || '').trim();
      d.coPhone       = ((document.getElementById('ih-wiz-co-phone')    || {}).value || '').trim();
      d.coWebsite     = ((document.getElementById('ih-wiz-co-website')  || {}).value || '').trim();
      d.coAddress     = ((document.getElementById('ih-wiz-co-address')  || {}).value || '').trim();
      d.coAddress2    = ((document.getElementById('ih-wiz-co-address2') || {}).value || '').trim();
      d.coCity        = ((document.getElementById('ih-wiz-co-city')     || {}).value || '').trim();
      var coStateSelVal = ((document.getElementById('ih-wiz-co-state') || {}).value || '');
      if (coStateSelVal === 'OTHER') {
        var coCntry = ((document.getElementById('ih-wiz-co-custom-country')    || {}).value || '').trim();
        var coRegn  = ((document.getElementById('ih-wiz-co-custom-state-text') || {}).value || '').trim();
        d.coState = [coRegn, coCntry].filter(Boolean).join(', ');
      } else {
        d.coState = coStateSelVal;
      }
      d.coZip         = ((document.getElementById('ih-wiz-co-zip')      || {}).value || '').trim();
      d.coEin         = ((document.getElementById('ih-wiz-co-ein')      || {}).value || '').trim();
      d.coLicense     = ((document.getElementById('ih-wiz-co-license')  || {}).value || '').trim();
      d.coNotes       = ((document.getElementById('ih-wiz-co-notes')    || {}).value || '').trim();
    }
  }
  var roleEl = document.getElementById('ih-wiz-role');
  var profEl = document.getElementById('ih-wiz-profit');
  var capEl  = document.getElementById('ih-wiz-capital');
  var agrEl  = document.getElementById('ih-wiz-agreement');
  if (roleEl) d.role      = roleEl.value || 'equity_partner';
  d.ownership = '0';
  if (profEl) d.profit    = profEl.value || '0';
  if (capEl)  d.capital   = capEl.value  || '0';
  if (agrEl)  d.agreement = (agrEl.value || '').trim();
}

function ihWizReview() {
  var rb = document.getElementById('ih-wiz-review-body');
  if (rb) rb.innerHTML = ihWizReviewHtml();
  ihWizStep(3);
}

function ihWizOnSelChange() {
  var v = ((document.getElementById('ih-wiz-sel') || {}).value || '');
  var d = document.getElementById('ih-wiz-new-divider');
  var f = document.getElementById('ih-wiz-new-form');
  if (d) d.style.display = v ? 'none' : '';
  if (f) f.style.display = v ? 'none' : '';
}

function ihWizNext1() {
  if (!ihValidateAddInvestorWizardStep(1)) return;
  ihCollectAddInvestorWizardData();
  ihWizStep(2);
}

function ihWizNext2() {
  ihCollectAddInvestorWizardData();
  if (!ihValidateProjectCapitalFields()) return;
  ihWizReview();
}

function ihWizReviewHtml() {
  var d = _ihWizData;
  var ROLES = { equity_partner: 'Equity Partner', private_lender: 'Private Lender', lead_contractor: 'Lead Contractor', silent_partner: 'Silent Partner', other: 'Other' };
  var s = '';
  if (d.existingId) {
    s += ihWizRR('Investor', d.existingName || d.existingId.substring(0, 8) + '…');
  } else if (d.type === 'company') {
    s += ihWizRR('Type', 'Company');
    s += ihWizRR('Company Name', d.coName);
    if (d.coContact) s += ihWizRR('Contact', d.coContact);
    if (d.coEmail)   s += ihWizRR('Email', d.coEmail);
    if (d.coPhone)   s += ihWizRR('Phone', d.coPhone);
    var cl = [d.coCity, d.coState, d.coZip].filter(Boolean).join(', ');
    if (cl) s += ihWizRR('Location', cl);
  } else {
    s += ihWizRR('Type', 'Person');
    s += ihWizRR('Name', ((d.firstName || '') + ' ' + (d.lastName || '')).trim());
    if (d.email) s += ihWizRR('Email', d.email);
    if (d.phone) s += ihWizRR('Phone', d.phone);
    var pl = [d.city, d.state, d.zip].filter(Boolean).join(', ');
    if (pl) s += ihWizRR('Location', pl);
  }
  s += '<div style="margin:10px 0;border-top:1px solid #e5e7eb"></div>';
  s += ihWizRR('Project', _currentProject ? projectDisplayName(_currentProject) : '—');
  s += ihWizRR('Role', ROLES[d.role] || d.role);
  if (Number(d.capital) > 0) s += ihWizRR('Investment Amount', '$' + Number(d.capital).toLocaleString());
  if (Number(d.profit)  > 0) s += ihWizRR('Expected Project Profit Share', Number(d.profit) + '%');
  if (d.agreement)            s += ihWizRR('Agreement Notes', d.agreement);
  return s;
}

function ihWizRR(label, value) {
  return '<div style="display:flex;justify-content:space-between;align-items:baseline;padding:5px 0;border-bottom:1px solid #f3f4f6;font-size:13px">'
    + '<span style="color:#6b7280;flex-shrink:0;padding-right:12px">' + escHtml(label) + '</span>'
    + '<span style="color:#111827;font-weight:500;text-align:right">' + escHtml(String(value)) + '</span>'
    + '</div>';
}

function ihWizLockBackdrop() {
  var ov = document.getElementById('confirm-modal-overlay');
  if (ov) ov.onclick = function(e) { e.stopPropagation(); };
}

function ihWizUnlockBackdrop() {
  var ov = document.getElementById('confirm-modal-overlay');
  if (ov) ov.onclick = closeConfirmModal;
}

function ihWizCancel() {
  _ihWizEditPiId = null; _ihWizEditInvId = null; _ihWizEditCoId = null;
  ihWizUnlockBackdrop();
  closeConfirmModal();
}

function ihWizPersonStateChange() {
  var sel = document.getElementById('ih-wiz-state');
  var wrap = document.getElementById('ih-wiz-custom-loc');
  if (!sel || !wrap) return;
  var isOther = sel.value === 'OTHER';
  wrap.style.display = isOther ? '' : 'none';
  if (!isOther) {
    var cc = document.getElementById('ih-wiz-custom-country');
    var cs = document.getElementById('ih-wiz-custom-state-text');
    if (cc) cc.value = '';
    if (cs) cs.value = '';
  }
}

function ihWizCoStateChange() {
  var sel = document.getElementById('ih-wiz-co-state');
  var wrap = document.getElementById('ih-wiz-co-custom-loc');
  if (!sel || !wrap) return;
  var isOther = sel.value === 'OTHER';
  wrap.style.display = isOther ? '' : 'none';
  if (!isOther) {
    var cc = document.getElementById('ih-wiz-co-custom-country');
    var cs = document.getElementById('ih-wiz-co-custom-state-text');
    if (cc) cc.value = '';
    if (cs) cs.value = '';
  }
}

function ihWizPreFillFields() {
  var d = _ihWizData;
  ihSetInvestorType(d.type || 'person');
  if (d.type === 'company') {
    var v = function(id, val) { var el = document.getElementById(id); if (el) el.value = val || ''; };
    v('ih-wiz-co-name',     d.coName        || '');
    v('ih-wiz-co-contact',  d.coContact     || '');
    v('ih-wiz-co-role',     d.coContactRole || '');
    v('ih-wiz-co-email',    d.coEmail       || '');
    v('ih-wiz-co-phone',    d.coPhone       || '');
    v('ih-wiz-co-website',  d.coWebsite     || '');
    v('ih-wiz-co-address',  d.coAddress     || '');
    v('ih-wiz-co-address2', d.coAddress2    || '');
    v('ih-wiz-co-city',     d.coCity        || '');
    v('ih-wiz-co-zip',      d.coZip         || '');
    v('ih-wiz-co-ein',      d.coEin         || '');
    v('ih-wiz-co-license',  d.coLicense     || '');
    v('ih-wiz-co-notes',    d.coNotes       || '');
    var coSt = document.getElementById('ih-wiz-co-state');
    if (coSt && d.coState) {
      var coOpts = Array.from(coSt.options).map(function(o) { return o.value; });
      if (coOpts.indexOf(d.coState) >= 0) {
        coSt.value = d.coState;
      } else {
        coSt.value = 'OTHER';
        ihWizCoStateChange();
        var csr = document.getElementById('ih-wiz-co-custom-state-text');
        if (csr) csr.value = d.coState;
      }
    }
  } else {
    var v = function(id, val) { var el = document.getElementById(id); if (el) el.value = val || ''; };
    v('ih-wiz-fname',   d.firstName || '');
    v('ih-wiz-lname',   d.lastName  || '');
    v('ih-wiz-email',   d.email     || '');
    v('ih-wiz-phone',   d.phone     || '');
    v('ih-wiz-address', d.address   || '');
    v('ih-wiz-city',    d.city      || '');
    v('ih-wiz-zip',     d.zip       || '');
    v('ih-wiz-notes',   d.notes     || '');
    var pSt = document.getElementById('ih-wiz-state');
    if (pSt && d.state) {
      var pOpts = Array.from(pSt.options).map(function(o) { return o.value; });
      if (pOpts.indexOf(d.state) >= 0) {
        pSt.value = d.state;
      } else {
        pSt.value = 'OTHER';
        ihWizPersonStateChange();
        var psr = document.getElementById('ih-wiz-custom-state-text');
        if (psr) psr.value = d.state;
      }
    }
  }
  var v2 = function(id, val) { var el = document.getElementById(id); if (el) el.value = val || ''; };
  v2('ih-wiz-role',      d.role      || 'equity_partner');
  v2('ih-wiz-capital',   d.capital   || '0');
  v2('ih-wiz-profit',    d.profit    || '0');
  v2('ih-wiz-agreement', d.agreement || '');
}

async function ihWizSave() {
  if (!ihValidateProjectCapitalFields()) return;
  var d = _ihWizData;

  // ---- EDIT MODE ----
  if (_ihWizEditPiId && _ihWizEditInvId) {
    var invChanges = { email: d.email || d.coEmail || '', phone: d.phone || d.coPhone || '' };
    if (d.type === 'company') {
      invChanges.name = d.coName || '';
      if (_ihWizEditCoId) {
        await DB.investorCompanies.update(_ihWizEditCoId, {
          company_name:   d.coName        || '',
          contact_person: d.coContact     || '',
          contact_role:   d.coContactRole || '',
          email:          d.coEmail       || '',
          phone:          d.coPhone       || '',
          website:        d.coWebsite     || '',
          address:        d.coAddress     || '',
          address2:       d.coAddress2    || '',
          city:           d.coCity        || '',
          state:          d.coState       || '',
          zip:            d.coZip         || '',
          ein_tax_id:     d.coEin         || '',
          license_number: d.coLicense     || '',
          notes:          d.coNotes       || ''
        });
      }
    } else {
      invChanges.first_name = d.firstName || '';
      invChanges.last_name  = d.lastName  || '';
      invChanges.name = [d.firstName, d.lastName].filter(Boolean).join(' ') || d.firstName || '';
      invChanges.address   = d.address || '';
      invChanges.city      = d.city    || '';
      invChanges.state_addr = d.state  || '';
      invChanges.zip       = d.zip     || '';
      invChanges.notes     = d.notes   || '';
    }
    var piChanges = {
      role:                    d.role      || 'equity_partner',
      capital_commitment:      Number(d.capital)  || 0,
      profit_split_percentage: Number(d.profit)   || 0,
      agreement_notes:         d.agreement || ''
    };
    var ok1 = await DB.investors.update(_ihWizEditInvId, invChanges);
    var ok2 = await DB.projectInvestors.update(_ihWizEditPiId, piChanges);
    _ihWizEditPiId = null; _ihWizEditInvId = null; _ihWizEditCoId = null;
    ihWizUnlockBackdrop();
    closeConfirmModal();
    if (ok1 || ok2) { showToast('Investor updated'); renderInvestorHub(_currentProject.id); }
    else { alert('Could not save changes.'); }
    return;
  }

  // ---- ADD MODE ----
  var invId = d.existingId || '';
  if (!invId) {
    var inv;
    if (d.type === 'company') {
      var co = await DB.investorCompanies.create({
        company_name:   d.coName,
        contact_person: d.coContact || '',
        email:          d.coEmail   || '',
        phone:          d.coPhone   || '',
        website:        d.coWebsite     || '',
        address:        d.coAddress     || '',
        address2:       d.coAddress2    || '',
        city:           d.coCity        || '',
        state:          d.coState       || '',
        zip:            d.coZip         || '',
        contact_role:   d.coContactRole || '',
        ein_tax_id:     d.coEin         || '',
        license_number: d.coLicense     || '',
        notes:          d.coNotes       || ''
      });
      if (!co) { alert('Could not create company record.'); return; }
      inv = await ihCreateInvestor({ name: d.coName, type: 'company', company_id: co.id, email: d.coEmail || '', phone: d.coPhone || '' });
    } else {
      inv = await ihCreateInvestor({
        name:       ((d.firstName || '') + ' ' + (d.lastName || '')).trim() || d.firstName || '',
        first_name: d.firstName || '',
        last_name:  d.lastName  || '',
        type:       'person',
        email:      d.email   || '',
        phone:      d.phone   || '',
        address:    d.address || '',
        city:       d.city    || '',
        state_addr: d.state   || '',
        zip:        d.zip     || '',
        notes:      d.notes   || ''
      });
    }
    if (!inv) {
      if (d.type === 'company' && co) alert('Could not create investor. The company record was saved but could not be linked — please remove it from the database manually.');
      else alert('Could not create investor.');
      return;
    }
    invId = inv.id;
  }
  var profNum = Number(d.profit)  || 0;
  var capNum  = Number(d.capital) || 0;
  var opts = {
    ownership_percentage:    0,
    profit_split_percentage: profNum,
    capital_commitment:      capNum,
    agreement_notes:         d.agreement || ''
  };
  var pi = await ihAttachInvestor(_currentProject.id, invId, d.role || 'equity_partner', opts);
  ihWizUnlockBackdrop();
  closeConfirmModal();
  if (pi) {
    showToast('Investor attached');
    renderInvestorHub(_currentProject.id);
  } else {
    alert('Could not attach investor.');
  }
}

async function openAddInvestorModal() {
  if (_currentProject) await ihProjectData(_currentProject.id);
  if (!ihCanUseLive()) { ihOpenRealDataRequiredModal('Add Investor'); return; }
  var editMode = !!_ihWizEditPiId;
  if (!editMode) { _ihWizData = { type: 'person' }; }
  var allInvestors = editMode ? [] : await ihAllInvestors();
  showConfirmModal('Add Investor to Project', '', null);
  ihWizLockBackdrop();
  var box = document.querySelector('.confirm-box');
  box.style.maxWidth = '740px';
  box.style.width = 'calc(100% - 32px)';
  box.style.maxHeight = 'calc(100vh - 80px)';
  box.style.overflowY = 'auto';
  var selOpts = allInvestors.map(function(i) { return '<option value="' + escHtml(i.id) + '">' + escHtml(i.name) + '</option>'; }).join('');
  var stateOpts = '<option value="">Select a State...</option><option value="AL">Alabama</option><option value="AK">Alaska</option><option value="AZ">Arizona</option><option value="AR">Arkansas</option><option value="CA">California</option><option value="CO">Colorado</option><option value="CT">Connecticut</option><option value="DE">Delaware</option><option value="FL">Florida</option><option value="GA">Georgia</option><option value="HI">Hawaii</option><option value="ID">Idaho</option><option value="IL">Illinois</option><option value="IN">Indiana</option><option value="IA">Iowa</option><option value="KS">Kansas</option><option value="KY">Kentucky</option><option value="LA">Louisiana</option><option value="ME">Maine</option><option value="MD">Maryland</option><option value="MA">Massachusetts</option><option value="MI">Michigan</option><option value="MN">Minnesota</option><option value="MS">Mississippi</option><option value="MO">Missouri</option><option value="MT">Montana</option><option value="NE">Nebraska</option><option value="NV">Nevada</option><option value="NH">New Hampshire</option><option value="NJ">New Jersey</option><option value="NM">New Mexico</option><option value="NY">New York</option><option value="NC">North Carolina</option><option value="ND">North Dakota</option><option value="OH">Ohio</option><option value="OK">Oklahoma</option><option value="OR">Oregon</option><option value="PA">Pennsylvania</option><option value="RI">Rhode Island</option><option value="SC">South Carolina</option><option value="SD">South Dakota</option><option value="TN">Tennessee</option><option value="TX">Texas</option><option value="UT">Utah</option><option value="VT">Vermont</option><option value="VA">Virginia</option><option value="WA">Washington</option><option value="WV">West Virginia</option><option value="WI">Wisconsin</option><option value="WY">Wyoming</option><option value="OTHER">Other (International / Different Country)</option>';
  box.innerHTML =
    '<div style="display:flex;align-items:flex-start;gap:4px;margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid #e5e7eb">'
    + ihWizIndHtml(1)
    + '<div style="flex:1;height:1px;background:#e5e7eb;margin:13px 4px 0"></div>'
    + ihWizIndHtml(2)
    + '<div style="flex:1;height:1px;background:#e5e7eb;margin:13px 4px 0"></div>'
    + ihWizIndHtml(3)
    + '</div>'

    + '<div id="ih-wiz-panel-1">'
    + '<h3 style="margin:0 0 12px;font-size:15px">Identity</h3>'
    + '<div style="margin-bottom:10px"><label style="font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.4px;display:block;margin-bottom:4px">Attach Existing Investor</label>'
    + '<select id="ih-wiz-sel" class="form-control" onchange="ihWizOnSelChange()"><option value="">— Create new investor —</option>' + selOpts + '</select></div>'
    + '<div class="ih-modal-divider" id="ih-wiz-new-divider">or create new</div>'
    + '<div id="ih-wiz-new-form">'
    + '<div style="display:flex;gap:8px;margin-bottom:12px">'
    + '<button id="ih-wiz-type-person" class="btn btn-sm btn-primary" onclick="ihSetInvestorType(\'person\')">Person</button>'
    + '<button id="ih-wiz-type-company" class="btn btn-sm btn-secondary" onclick="ihSetInvestorType(\'company\')">Company</button>'
    + '</div>'
    + '<div id="ih-wiz-fields-person" class="ih-modal-form" style="margin-top:8px">'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div><label>First Name *</label><input type="text" id="ih-wiz-fname" class="form-control" placeholder="First name"></div>'
    + '<div><label>Last Name</label><input type="text" id="ih-wiz-lname" class="form-control" placeholder="Last name"></div></div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div><label>Email</label><input type="text" inputmode="email" id="ih-wiz-email" class="form-control" placeholder="name@example.com"></div>'
    + '<div><label>Phone</label><input type="text" inputmode="tel" id="ih-wiz-phone" class="form-control" placeholder="(555) 000-0000"></div></div>'
    + '<div><label>Address</label><input type="text" id="ih-wiz-address" class="form-control" placeholder="Street address"></div>'
    + '<div style="display:grid;grid-template-columns:1fr 80px 80px;gap:8px">'
    + '<div><label>City</label><input type="text" id="ih-wiz-city" class="form-control" placeholder="Portland"></div>'
    + '<div><label>State</label><select id="ih-wiz-state" class="form-control" onchange="ihWizPersonStateChange()">' + stateOpts + '</select></div>'
    + '<div><label>ZIP</label><input type="text" id="ih-wiz-zip" class="form-control" placeholder="97201"></div>'
    + '</div>'
    + '<div id="ih-wiz-custom-loc" style="display:none;margin-top:8px;padding:10px 12px;background:#f0f9ff;border-left:3px solid #3b82f6;border-radius:0 4px 4px 0">'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'
    + '<div><label>Country</label><input type="text" id="ih-wiz-custom-country" class="form-control" placeholder="e.g. Canada, Spain"></div>'
    + '<div><label>State / Region</label><input type="text" id="ih-wiz-custom-state-text" class="form-control" placeholder="e.g. British Columbia, Madrid"></div>'
    + '</div></div>'
    + '<div><label>Notes <span style="font-weight:400;color:#9ca3af">(optional)</span></label><textarea id="ih-wiz-notes" class="form-control" rows="2" placeholder="Internal notes..."></textarea></div>'
    + '</div>'
    + '<div id="ih-wiz-fields-company" class="ih-modal-form" style="display:none;margin-top:8px">'
    + '<div><label>Company Legal Name *</label><input type="text" id="ih-wiz-co-name" class="form-control" placeholder="e.g., Greenfield Capital LLC"></div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div><label>Contact Person</label><input type="text" id="ih-wiz-co-contact" class="form-control" placeholder="Primary contact"></div>'
    + '<div><label>Contact Role <span style="font-weight:400;color:#9ca3af">(optional)</span></label><input type="text" id="ih-wiz-co-role" class="form-control" placeholder="e.g., Managing Partner"></div></div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div><label>Email</label><input type="text" inputmode="email" id="ih-wiz-co-email" class="form-control" placeholder="contact@company.com"></div>'
    + '<div><label>Phone</label><input type="text" inputmode="tel" id="ih-wiz-co-phone" class="form-control" placeholder="(503) 000-0000"></div></div>'
    + '<div><label>Website <span style="font-weight:400;color:#9ca3af">(optional)</span></label><input type="url" id="ih-wiz-co-website" class="form-control" placeholder="https://company.com"></div>'
    + '<div><label>Address</label><input type="text" id="ih-wiz-co-address" class="form-control" placeholder="Street address"></div>'
    + '<div><label>Address 2 <span style="font-weight:400;color:#9ca3af">(optional)</span></label><input type="text" id="ih-wiz-co-address2" class="form-control" placeholder="Suite, unit, etc."></div>'
    + '<div style="display:grid;grid-template-columns:1fr 80px 80px;gap:8px">'
    + '<div><label>City</label><input type="text" id="ih-wiz-co-city" class="form-control" placeholder="Portland"></div>'
    + '<div><label>State</label><select id="ih-wiz-co-state" class="form-control" onchange="ihWizCoStateChange()">' + stateOpts + '</select></div>'
    + '<div><label>ZIP</label><input type="text" id="ih-wiz-co-zip" class="form-control" placeholder="97201"></div>'
    + '</div>'
    + '<div id="ih-wiz-co-custom-loc" style="display:none;margin-top:8px;padding:10px 12px;background:#f0f9ff;border-left:3px solid #3b82f6;border-radius:0 4px 4px 0">'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'
    + '<div><label>Country</label><input type="text" id="ih-wiz-co-custom-country" class="form-control" placeholder="e.g. Canada, Spain"></div>'
    + '<div><label>State / Region</label><input type="text" id="ih-wiz-co-custom-state-text" class="form-control" placeholder="e.g. British Columbia, Madrid"></div>'
    + '</div></div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div><label>EIN / Tax ID <span style="font-weight:400;color:#9ca3af">(optional)</span></label><input type="text" id="ih-wiz-co-ein" class="form-control" placeholder="XX-XXXXXXX"></div>'
    + '<div><label>License / Reg # <span style="font-weight:400;color:#9ca3af">(optional)</span></label><input type="text" id="ih-wiz-co-license" class="form-control" placeholder="State reg or CCB #"></div></div>'
    + '<div><label>Notes <span style="font-weight:400;color:#9ca3af">(optional)</span></label><textarea id="ih-wiz-co-notes" class="form-control" rows="2" placeholder="Internal notes..."></textarea></div>'
    + '</div>'
    + '</div>'
    + '<div class="ih-modal-actions"><button class="btn btn-secondary" onclick="ihWizCancel()">Cancel</button>'
    + '<button class="btn btn-primary" onclick="ihWizNext1()">Continue →</button></div>'
    + '</div>'

    + '<div id="ih-wiz-panel-2" style="display:none">'
    + '<h3 style="margin:0 0 4px;font-size:15px">Investor Terms</h3>'
    + '<div class="ih-modal-note" style="margin-bottom:14px">Project: ' + escHtml(_currentProject ? projectDisplayName(_currentProject) : '—') + '</div>'
    + '<div class="ih-modal-form">'
    + '<div><label>Role in Project</label><select id="ih-wiz-role" class="form-control"><option value="equity_partner">Equity Partner</option><option value="private_lender">Private Lender</option><option value="lead_contractor">Lead Contractor</option><option value="silent_partner">Silent Partner</option><option value="other">Other</option></select></div>'
    + '<div><label>Investment Amount ($)</label><input type="number" id="ih-wiz-capital" class="form-control" placeholder="0" min="0" step="0.01" value="0"></div>'
    + '<div><label>Expected Project Profit Share (%)</label><input type="number" id="ih-wiz-profit" class="form-control" placeholder="0" min="0" max="100" step="0.1" value="0"></div>'
    + '<div><label>Agreement Notes <span style="font-weight:400;color:#9ca3af">(optional)</span></label><textarea id="ih-wiz-agreement" class="form-control" rows="2" placeholder="Key terms, conditions..."></textarea></div>'
    + '</div>'
    + '<div class="ih-modal-actions"><button class="btn btn-secondary" onclick="ihWizStep(1)">← Back</button>'
    + '<button class="btn btn-primary" onclick="ihWizNext2()">Review →</button></div>'
    + '</div>'

    + '<div id="ih-wiz-panel-3" style="display:none">'
    + '<h3 style="margin:0 0 14px;font-size:15px">Review & Save</h3>'
    + '<div id="ih-wiz-review-body"></div>'
    + '<div style="margin-top:12px;padding:10px 12px;background:#f9fafb;border-radius:6px;font-size:12px;color:#6b7280;border:1px solid #e5e7eb">Save Investor Only will be available after Global Investor Directory is activated.</div>'
    + '<div class="ih-modal-actions"><button class="btn btn-secondary" onclick="ihWizStep(2)">← Back</button>'
    + '<button class="btn btn-primary" onclick="ihWizSave()">Save & Attach to Project</button></div>'
    + '</div>';

  if (editMode) {
    var selWrap = document.getElementById('ih-wiz-sel');
    if (selWrap && selWrap.parentNode) selWrap.parentNode.style.display = 'none';
    var newDivider = document.getElementById('ih-wiz-new-divider');
    if (newDivider) newDivider.style.display = 'none';
    ihWizPreFillFields();
  }
}

async function saveAddInvestor() { return ihWizSave(); }

// ---- ISSUE-013 Phase 2C: Edit / Void investor ----

function ihInvestorCardActions(piId, invId, status) {
  var pId = escHtml(piId);
  var iId = escHtml(invId);
  var html = '<div class="ih-row-actions" onclick="event.stopPropagation()">';
  html += '<button class="btn btn-sm btn-secondary" title="Edit investor" onclick="openEditInvestorModal(\'' + pId + '\',\'' + iId + '\')"><i data-lucide="pencil"></i></button>';
  if (status === 'pending') {
    html += '<button class="btn btn-sm ih-confirm-btn" title="Confirm investor" onclick="ihConfirmPI(\'' + pId + '\')"><i data-lucide="check"></i></button>';
  }
  if (status !== 'cancelled') {
    html += '<button class="btn btn-sm btn-secondary" title="Void investor" onclick="ihCancelPI(\'' + pId + '\')"><i data-lucide="ban"></i></button>';
  }
  html += '</div>';
  return html;
}

async function openEditInvestorModal(piId, invId) {
  if (!ihCanUseLive()) { ihOpenRealDataRequiredModal('Edit Investor'); return; }
  var inv = await DB.investors.getById(invId);
  if (!inv) { alert('Could not load investor.'); return; }
  var pis = await DB.projectInvestors.getByProject(_currentProject.id);
  var pi = (pis || []).find(function(p) { return p.id === piId; });
  if (!pi) { alert('Could not load project investor record.'); return; }

  _ihWizEditPiId  = piId;
  _ihWizEditInvId = invId;
  _ihWizEditCoId  = null;

  _ihWizData = { type: inv.type || 'person' };
  if (inv.type === 'company') {
    _ihWizData.coName  = inv.name  || '';
    _ihWizData.coEmail = inv.email || '';
    _ihWizData.coPhone = inv.phone || '';
    if (inv.company_id) {
      var co = await DB.investorCompanies.getById(inv.company_id);
      if (co) {
        _ihWizEditCoId         = co.id;
        _ihWizData.coName        = co.company_name  || inv.name || '';
        _ihWizData.coContact     = co.contact_person || '';
        _ihWizData.coContactRole = co.contact_role   || '';
        _ihWizData.coEmail       = co.email          || '';
        _ihWizData.coPhone       = co.phone          || '';
        _ihWizData.coWebsite     = co.website        || '';
        _ihWizData.coAddress     = co.address        || '';
        _ihWizData.coAddress2    = co.address2       || '';
        _ihWizData.coCity        = co.city           || '';
        _ihWizData.coState       = co.state          || '';
        _ihWizData.coZip         = co.zip            || '';
        _ihWizData.coEin         = co.ein_tax_id     || '';
        _ihWizData.coLicense     = co.license_number || '';
        _ihWizData.coNotes       = co.notes          || '';
      }
    }
  } else {
    var _nameParts = (inv.name || '').trim().split(/\s+/);
    _ihWizData.firstName = inv.first_name || _nameParts[0] || '';
    _ihWizData.lastName  = inv.last_name  || (_nameParts.length > 1 ? _nameParts.slice(1).join(' ') : '') || '';
    _ihWizData.email     = inv.email      || '';
    _ihWizData.phone     = inv.phone      || '';
    _ihWizData.address   = inv.address    || '';
    _ihWizData.city      = inv.city       || '';
    _ihWizData.state     = inv.state_addr || '';
    _ihWizData.zip       = inv.zip        || '';
    _ihWizData.notes     = inv.notes      || '';
  }
  _ihWizData.role      = pi.role              || 'equity_partner';
  _ihWizData.capital   = String(pi.capital_commitment      || 0);
  _ihWizData.profit    = String(pi.profit_split_percentage || 0);
  _ihWizData.agreement = pi.agreement_notes   || '';
  _ihWizData.ownership = '0';

  await openAddInvestorModal();
}

function ihCloseDetailModal() {
  var el = document.getElementById('ih-detail-overlay');
  if (el) el.remove();
}

async function openInvestorDetailModal(piId, invId) {
  if (!ihCanUseLive()) { ihOpenRealDataRequiredModal('View Investor'); return; }
  var inv = await DB.investors.getById(invId);
  if (!inv) { alert('Could not load investor details.'); return; }
  var pis = await DB.projectInvestors.getByProject(_currentProject.id);
  var pi = (pis || []).find(function(p) { return p.id === piId; });
  if (!pi) { alert('Could not load project investor record.'); return; }

  var co = null;
  if (inv.type === 'company' && inv.company_id) {
    co = await DB.investorCompanies.getById(inv.company_id);
  }

  function row(label, val, cls) {
    return '<div><div class="ih-detail-label">' + escHtml(label) + '</div>'
      + '<div class="ih-detail-value' + (cls ? ' ' + cls : '') + '">' + (val || '<span style="color:#d1d5db">—</span>') + '</div></div>';
  }

  var typeLbl = inv.type === 'company' ? 'Company' : 'Person';
  var roleLbl = escHtml(IH_ROLES[pi.role] || pi.role || 'Investor');
  var capVal  = pi.capital_commitment ? fmtMoney(pi.capital_commitment) : '<span style="color:#d1d5db">—</span>';
  var profVal = pi.profit_split_percentage ? escHtml(String(pi.profit_split_percentage)) + '%' : '<span style="color:#d1d5db">—</span>';

  // Identity section
  var identityRows = '';
  if (inv.type === 'company' && co) {
    identityRows += row('Company', escHtml(co.company_name || inv.name || ''));
    if (co.contact_person) identityRows += row('Contact', escHtml(co.contact_person) + (co.contact_role ? ' <span style="color:#9ca3af;font-size:12px">(' + escHtml(co.contact_role) + ')</span>' : ''));
    if (co.website)        identityRows += row('Website', escHtml(co.website));
    if (co.ein_tax_id)     identityRows += row('EIN', escHtml(co.ein_tax_id));
    if (co.license_number) identityRows += row('License', escHtml(co.license_number));
  } else {
    identityRows += row('Name', escHtml(inv.name || ''));
    if (inv.notes)         identityRows += row('Notes', escHtml(inv.notes), 'muted');
  }

  // Contact section
  var contactRows = '';
  contactRows += row('Email', inv.email ? '<a href="mailto:' + escHtml(inv.email) + '" style="color:var(--accent)" onclick="event.stopPropagation()">' + escHtml(inv.email) + '</a>' : '');
  contactRows += row('Phone', inv.phone ? escHtml(inv.phone) : '');
  var addrSrc = (inv.type === 'company' && co) ? co : inv;
  var addrCity  = addrSrc.city  || '';
  var addrState = (inv.type === 'company' ? addrSrc.state : inv.state_addr) || '';
  var addrZip   = addrSrc.zip   || '';
  if (addrSrc.address)  contactRows += row('Address', escHtml(addrSrc.address) + (addrSrc.address2 ? ', ' + escHtml(addrSrc.address2) : ''));
  if (addrCity || addrState || addrZip) {
    contactRows += row('City / State / ZIP', [addrCity, addrState, addrZip].filter(Boolean).map(escHtml).join(', '));
  }

  // Terms section
  var termsRows = '';
  termsRows += row('Role', roleLbl);
  termsRows += row('Investment Amount', capVal);
  termsRows += row('Profit Share', profVal);
  termsRows += row('Status', ihStatusChip(pi.status));
  var agreementHtml = '';
  if (pi.agreement_notes) {
    agreementHtml = '<div style="margin-top:14px"><div class="ih-detail-label">Agreement Notes</div>'
      + '<div class="ih-detail-value muted" style="white-space:pre-wrap;font-size:13px">' + escHtml(pi.agreement_notes) + '</div></div>';
  }

  var companyNotesHtml = '';
  if (inv.type === 'company' && co && co.notes) {
    companyNotesHtml = '<div style="margin-top:14px"><div class="ih-detail-label">Notes</div>'
      + '<div class="ih-detail-value muted" style="white-space:pre-wrap;font-size:13px">' + escHtml(co.notes) + '</div></div>';
  }

  var existingOverlay = document.getElementById('ih-detail-overlay');
  if (existingOverlay) existingOverlay.remove();

  var overlay = document.createElement('div');
  overlay.id = 'ih-detail-overlay';
  overlay.className = 'ih-detail-overlay';
  overlay.addEventListener('click', function(e) { if (e.target === overlay) ihCloseDetailModal(); });

  var pIdEsc = piId.replace(/'/g, "\\'");
  var iIdEsc = invId.replace(/'/g, "\\'");

  overlay.innerHTML =
    '<div class="ih-detail-box">'
    + '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:22px">'
    +   '<div>'
    +     '<div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:6px">' + escHtml(inv.name || 'Unnamed') + '</div>'
    +     '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">'
    +       '<span class="ih-type-badge">' + escHtml(typeLbl) + '</span>'
    +       ihStatusChip(pi.status)
    +     '</div>'
    +   '</div>'
    +   '<button onclick="ihCloseDetailModal()" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:22px;line-height:1;padding:4px;margin-top:-2px">&#x2715;</button>'
    + '</div>'

    + '<div class="ih-detail-section">'
    +   '<div class="ih-detail-section-title">Investment Terms</div>'
    +   '<div class="ih-detail-grid">' + termsRows + '</div>'
    +   agreementHtml
    + '</div>'

    + '<div class="ih-detail-section">'
    +   '<div class="ih-detail-section-title">Identity &amp; Contact</div>'
    +   '<div class="ih-detail-grid">' + identityRows + contactRows + '</div>'
    +   companyNotesHtml
    + '</div>'

    + '<div class="ih-detail-actions">'
    +   '<button class="btn btn-secondary" onclick="ihCloseDetailModal()">Close</button>'
    +   '<button class="btn btn-primary" onclick="ihCloseDetailModal();openEditInvestorModal(\'' + pIdEsc + '\',\'' + iIdEsc + '\')"><i data-lucide="pencil"></i> Edit</button>'
    + '</div>'
    + '</div>';

  document.body.appendChild(overlay);
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function openAddContribModal() {
  var data = _currentProject ? await ihProjectData(_currentProject.id) : null;
  if (data) {
    _ihInvestors = data.pis || [];
    _ihContribs = data.contribs || [];
    _ihCalls = data.calls || [];
  }
  if (!ihCanUseLive()) {
    ihOpenRealDataRequiredModal('Add Capital Contribution');
    return;
  }
  var pis = _ihInvestors.filter(function(x) { return x.status !== 'cancelled'; });
  showConfirmModal('Add Capital Contribution', '', null);
  var box = document.querySelector('.confirm-box');
  ihSetWideModal(box);

  if (!pis.length) {
    box.innerHTML = '<h3 style="margin:0 0 6px;font-size:16px">Add Contribution</h3>'
      + '<div class="ih-modal-note">Attach an investor before recording capital.</div>'
      + '<div class="ih-modal-actions"><button class="btn btn-secondary" onclick="closeConfirmModal()">Cancel</button><button class="btn btn-primary" onclick="openAddInvestorModal()">Add Investor</button></div>';
    return;
  }

  box.innerHTML = '<h3 style="margin:0 0 6px;font-size:16px">Add Capital Contribution</h3>'
    + '<div class="ih-modal-note">Capital is separate from project expenses and does not change financial summaries.</div>'
    + '<div class="ih-modal-form">'
    + '<div><label>Investor *</label><select id="ih-c-inv" class="form-control"><option value="">Select investor...</option>'
    + pis.map(function(pi) {
      var n = pi.investors ? pi.investors.name : pi.investor_id;
      return '<option value="' + escHtml(pi.investor_id) + '">' + escHtml(n) + '</option>';
    }).join('')
    + '</select></div>'
    + '<div class="ih-modal-grid">'
    + '<div><label>Amount *</label><input type="text" inputmode="decimal" id="ih-c-amt" class="form-control" placeholder="20000"></div>'
    + '<div><label>Date *</label><input type="date" id="ih-c-date" class="form-control" value="' + ihToday() + '"></div></div>'
    + '<div class="ih-modal-grid">'
    + '<div><label>Type</label><select id="ih-c-type" class="form-control"><option value="initial">Initial</option><option value="additional">Additional</option><option value="closing">Closing</option><option value="reimbursement">Reimbursement</option></select></div>'
    + '<div><label>Method</label><select id="ih-c-mth" class="form-control"><option value="wire">Wire</option><option value="check">Check</option><option value="cash">Cash</option><option value="company_payment">Company Payment</option></select></div></div>'
    + '<div><label>Evidence Reference</label><input type="text" id="ih-c-evid" class="form-control" placeholder="Check number, wire reference"></div>'
    + '<div><label>Notes</label><input type="text" id="ih-c-notes" class="form-control" placeholder="Optional"></div>'
    + '<div class="ih-modal-actions"><button class="btn btn-secondary" onclick="closeConfirmModal()">Cancel</button><button class="btn btn-primary" onclick="saveAddContrib()">Save Contribution</button></div>'
    + '</div>';
}

async function saveAddContrib() {
  var invId = document.getElementById('ih-c-inv').value;
  var amount = parseFloat(document.getElementById('ih-c-amt').value) || 0;
  var date = document.getElementById('ih-c-date').value;
  var type = document.getElementById('ih-c-type').value;
  var method = document.getElementById('ih-c-mth').value;
  var evid = document.getElementById('ih-c-evid').value || '';
  var notes = document.getElementById('ih-c-notes').value || '';
  if (!invId) { alert('Select an investor.'); return; }
  if (amount <= 0) { alert('Amount must be greater than 0.'); return; }
  if (!date) { alert('Date is required.'); return; }

  var res = await ihCreateContribution({
    project_id: _currentProject.id,
    investor_id: invId,
    amount: amount,
    date: date,
    type: type,
    method: method,
    evidence_reference: evid,
    notes: notes
  });
  closeConfirmModal();
  if (res) {
    showToast('Contribution saved');
    renderInvestorHub(_currentProject.id);
  } else {
    alert('Could not save contribution. Confirm the Supabase Investor Hub tables are applied.');
  }
}

async function openAddCallModal() {
  if (_currentProject) await ihProjectData(_currentProject.id);
  if (!ihCanUseLive()) {
    ihOpenRealDataRequiredModal('Add Capital Call');
    return;
  }
  showConfirmModal('Add Capital Call', '', null);
  var box = document.querySelector('.confirm-box');
  ihSetWideModal(box);
  box.innerHTML = '<h3 style="margin:0 0 6px;font-size:16px">Add Capital Call</h3>'
    + '<div class="ih-modal-note">Owner/Admin request only. This does not create a charge, invoice, ROI, or distribution.</div>'
    + '<div class="ih-modal-form">'
    + '<div class="ih-modal-grid">'
    + '<div><label>Amount Requested *</label><input type="text" inputmode="decimal" id="ih-cc-amt" class="form-control" placeholder="5000"></div>'
    + '<div><label>Due Date</label><input type="date" id="ih-cc-due" class="form-control"></div></div>'
    + '<div><label>Reason *</label><input type="text" id="ih-cc-rsn" class="form-control" placeholder="Why is capital needed?"></div>'
    + '<div><label>Notes</label><input type="text" id="ih-cc-nts" class="form-control" placeholder="Optional"></div>'
    + '<div class="ih-modal-actions"><button class="btn btn-secondary" onclick="closeConfirmModal()">Cancel</button><button class="btn btn-primary" onclick="saveAddCall()">Save Capital Call</button></div>'
    + '</div>';
}

async function saveAddCall() {
  var amount = parseFloat(document.getElementById('ih-cc-amt').value) || 0;
  var reason = (document.getElementById('ih-cc-rsn').value || '').trim();
  var due = document.getElementById('ih-cc-due').value || null;
  var notes = document.getElementById('ih-cc-nts').value || '';
  if (amount <= 0) { alert('Amount must be greater than 0.'); return; }
  if (!reason) { alert('Reason is required.'); return; }

  var res = await ihCreateCall({
    project_id: _currentProject.id,
    requested_amount: amount,
    reason: reason,
    due_date: due,
    notes: notes
  });
  closeConfirmModal();
  if (res) {
    showToast('Capital call saved');
    renderInvestorHub(_currentProject.id);
  } else {
    alert('Could not save capital call. Confirm the Supabase Investor Hub tables are applied.');
  }
}
