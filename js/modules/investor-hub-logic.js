// ============================================================================
// INVESTOR HUB — Phase 2B Logic Layer
// Complete JavaScript logic for investor management and flip analysis
// ============================================================================

// State Management
const InvestorHubState = {
  currentProjectId: null,
  investors: [],
  capitalContributions: [],
  flipAnalyses: [],
  selectedAnalysisVersion: null,

  reset() {
    this.currentProjectId = null;
    this.investors = [];
    this.capitalContributions = [];
    this.flipAnalyses = [];
    this.selectedAnalysisVersion = null;
  },

  setProject(projectId) {
    this.currentProjectId = projectId;
  },

  setInvestors(data) {
    this.investors = data || [];
  },

  setCapitalContributions(data) {
    this.capitalContributions = data || [];
  },

  setFlipAnalyses(data) {
    this.flipAnalyses = data || [];
  },

  getTotalCapitalContributed() {
    return this.capitalContributions
      .filter(c => c.status === 'received')
      .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  },

  getLatestFlipAnalysis() {
    if (!this.flipAnalyses.length) return null;
    return this.flipAnalyses[0]; // Already sorted by version DESC from RPC
  },

  getInvestorById(investorId) {
    const found = this.investors.find(inv => inv.investor_id === investorId);
    return found || null;
  }
};

// ============================================================================
// MAIN LOAD FUNCTION
// ============================================================================

async function loadInvestorHubData(projectId) {
  try {
    const mgr = getInvestorManager();
    if (!mgr) {
      console.error('InvestorManager not available');
      return false;
    }

    InvestorHubState.reset();
    InvestorHubState.setProject(projectId);

    // Load all investor hub data in parallel
    const [investors, contributions, analyses] = await Promise.all([
      mgr.getProjectInvestors(projectId),
      mgr.getCapitalContributions(projectId),
      mgr.getFlipAnalysisHistory(projectId)
    ]);

    InvestorHubState.setInvestors(investors || []);
    InvestorHubState.setCapitalContributions(contributions || []);
    InvestorHubState.setFlipAnalyses(analyses || []);

    return true;
  } catch (error) {
    console.error('Error loading investor hub data:', error);
    return false;
  }
}

// ============================================================================
// RENDERING FUNCTIONS
// ============================================================================

function renderInvestorHubTab() {
  const tabContent = document.getElementById('proj-tab-investorhub');
  if (!tabContent) return;

  const projectId = InvestorHubState.currentProjectId;
  if (!projectId) {
    tabContent.innerHTML = '<div class="proj-empty">No project selected</div>';
    return;
  }

  // Header section
  let html = '<div style="background:#fef2f2;color:#ef4444;padding:8px 12px;border-radius:6px;font-size:11px;font-weight:700;margin-bottom:16px">';
  html += '🔒 INTERNAL &amp; ADMIN USE ONLY — Investor Hub Phase 2B</div>';

  // Summary cards
  html += renderInvestorHubSummaryCards();

  // Investors section
  html += renderInvestorsSection();

  // Capital contributions section
  html += renderCapitalContributionsSection();

  // Flip analysis section
  html += renderFlipAnalysisSection();

  tabContent.innerHTML = html;
  attachInvestorHubEventHandlers();
}

function renderInvestorHubSummaryCards() {
  const investorCount = InvestorHubState.investors.length;
  const totalCapital = InvestorHubState.getTotalCapitalContributed();
  const totalAnalyses = InvestorHubState.flipAnalyses.length;

  let html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px">';

  html += '<div class="proj-stat-card">';
  html += '<div class="proj-stat-value" style="font-size:20px">' + investorCount + '</div>';
  html += '<div class="proj-stat-label">Investors</div>';
  html += '</div>';

  html += '<div class="proj-stat-card">';
  html += '<div class="proj-stat-value" style="font-size:20px;color:#10b981">' + formatMoney(totalCapital) + '</div>';
  html += '<div class="proj-stat-label">Total Capital</div>';
  html += '</div>';

  html += '<div class="proj-stat-card">';
  html += '<div class="proj-stat-value" style="font-size:20px;color:#6366f1">' + totalAnalyses + '</div>';
  html += '<div class="proj-stat-label">Flip Analyses</div>';
  html += '</div>';

  html += '</div>';
  return html;
}

function renderInvestorsSection() {
  let html = '<div style="margin-bottom:28px">';
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">';
  html += '<h4 style="margin:0;font-size:13px;font-weight:700">Project Investors</h4>';
  html += '<button class="btn btn-primary btn-sm" id="btn-add-investor" style="font-size:12px">+ Add Investor</button>';
  html += '</div>';

  if (!InvestorHubState.investors.length) {
    html += '<p style="color:var(--text-muted);font-size:13px;padding:12px 0">No investors attached yet.</p>';
  } else {
    html += '<table class="proj-table">';
    html += '<thead><tr><th>Name</th><th>Role</th><th>Ownership %</th><th>Profit Split %</th><th>Capital</th><th>Status</th></tr></thead>';
    html += '<tbody>';

    InvestorHubState.investors.forEach(inv => {
      const invName = escapeHtml(inv.investor_name || 'Unknown');
      const totalCap = parseFloat(inv.total_capital) || 0;
      const ownership = parseFloat(inv.ownership_percent) || 0;
      const profitSplit = parseFloat(inv.profit_split_percent) || 0;
      const role = inv.role || 'investor';
      const status = inv.status || 'active';

      html += '<tr>';
      html += '<td><strong>' + invName + '</strong></td>';
      html += '<td>' + capitalizeFirst(role) + '</td>';
      html += '<td style="text-align:right">' + ownership.toFixed(2) + '%</td>';
      html += '<td style="text-align:right">' + profitSplit.toFixed(2) + '%</td>';
      html += '<td style="text-align:right"><strong>' + formatMoney(totalCap) + '</strong></td>';
      html += '<td><span style="font-size:11px;font-weight:700;color:' + getStatusColor(status) + '">' + status.toUpperCase() + '</span></td>';
      html += '</tr>';
    });

    html += '</tbody></table>';
  }

  html += '</div>';
  return html;
}

function renderCapitalContributionsSection() {
  let html = '<div style="margin-bottom:28px">';
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">';
  html += '<h4 style="margin:0;font-size:13px;font-weight:700">Capital Contributions</h4>';
  html += '<button class="btn btn-primary btn-sm" id="btn-record-capital" style="font-size:12px">+ Record Contribution</button>';
  html += '</div>';

  if (!InvestorHubState.capitalContributions.length) {
    html += '<p style="color:var(--text-muted);font-size:13px;padding:12px 0">No contributions recorded yet.</p>';
  } else {
    html += '<table class="proj-table">';
    html += '<thead><tr><th>Investor</th><th>Date</th><th>Amount</th><th>Type</th><th>Status</th><th>Reference</th></tr></thead>';
    html += '<tbody>';

    InvestorHubState.capitalContributions.forEach(contrib => {
      const invName = escapeHtml(contrib.project_investor?.investor?.name || 'Unknown');
      const amount = parseFloat(contrib.amount) || 0;
      const date = formatDate(contrib.contribution_date);
      const type = contrib.contribution_type || 'initial';
      const status = contrib.status || 'pending';
      const reference = contrib.reference || '—';

      html += '<tr>';
      html += '<td><strong>' + invName + '</strong></td>';
      html += '<td>' + date + '</td>';
      html += '<td style="text-align:right"><strong>' + formatMoney(amount) + '</strong></td>';
      html += '<td>' + capitalizeFirst(type.replace('-', ' ')) + '</td>';
      html += '<td><span style="font-size:11px;font-weight:700;color:' + getStatusColor(status) + '">' + status.toUpperCase() + '</span></td>';
      html += '<td style="font-size:12px;color:var(--text-muted)">' + reference + '</td>';
      html += '</tr>';
    });

    html += '</tbody></table>';
  }

  html += '</div>';
  return html;
}

function renderFlipAnalysisSection() {
  let html = '<div>';
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">';
  html += '<h4 style="margin:0;font-size:13px;font-weight:700">Flip Analysis &amp; ROI</h4>';
  html += '<button class="btn btn-primary btn-sm" id="btn-create-analysis" style="font-size:12px">+ Create Analysis</button>';
  html += '</div>';

  const latestAnalysis = InvestorHubState.getLatestFlipAnalysis();

  if (!latestAnalysis) {
    html += '<p style="color:var(--text-muted);font-size:13px;padding:12px 0">No flip analyses created yet.</p>';
  } else {
    // Current analysis card
    html += '<div style="background:var(--bg-primary);border:2px solid var(--accent);border-radius:10px;padding:16px;margin-bottom:16px">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">';
    html += '<h5 style="margin:0;font-size:12px;font-weight:700;color:var(--accent)">Version ' + latestAnalysis.version + ' (Latest)</h5>';
    html += '<span style="font-size:11px;color:var(--text-muted)">' + formatDate(latestAnalysis.analysis_date) + '</span>';
    html += '</div>';

    html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:12px">';

    html += '<div style="border-bottom:1px solid var(--border);padding-bottom:8px">';
    html += '<div style="font-size:11px;color:var(--text-muted)">Purchase Price</div>';
    html += '<div style="font-size:14px;font-weight:700">' + formatMoney(latestAnalysis.purchase_price) + '</div>';
    html += '</div>';

    html += '<div style="border-bottom:1px solid var(--border);padding-bottom:8px">';
    html += '<div style="font-size:11px;color:var(--text-muted)">ARV</div>';
    html += '<div style="font-size:14px;font-weight:700">' + formatMoney(latestAnalysis.arv) + '</div>';
    html += '</div>';

    html += '<div style="border-bottom:1px solid var(--border);padding-bottom:8px">';
    html += '<div style="font-size:11px;color:var(--text-muted)">Total Cost</div>';
    html += '<div style="font-size:14px;font-weight:700">' + formatMoney(latestAnalysis.total_all_in_cost) + '</div>';
    html += '</div>';

    html += '<div style="border-bottom:1px solid var(--border);padding-bottom:8px">';
    html += '<div style="font-size:11px;color:var(--text-muted)">Net Proceeds</div>';
    html += '<div style="font-size:14px;font-weight:700;color:#10b981">' + formatMoney(latestAnalysis.net_proceeds) + '</div>';
    html += '</div>';

    html += '</div>';

    // Key metrics (highlighted)
    html += '<div style="background:rgba(99,102,241,0.05);border-radius:6px;padding:12px;display:grid;grid-template-columns:repeat(2,1fr);gap:12px">';

    html += '<div>';
    html += '<div style="font-size:11px;color:var(--text-muted);font-weight:700">NET PROFIT</div>';
    html += '<div style="font-size:16px;font-weight:800;color:#10b981">' + formatMoney(latestAnalysis.net_profit) + '</div>';
    html += '</div>';

    html += '<div>';
    html += '<div style="font-size:11px;color:var(--text-muted);font-weight:700">ROI</div>';
    html += '<div style="font-size:16px;font-weight:800;color:#6366f1">' + (parseFloat(latestAnalysis.roi_percent) || 0).toFixed(2) + '%</div>';
    html += '</div>';

    html += '</div>';

    html += '</div>';

    // History of analyses
    if (InvestorHubState.flipAnalyses.length > 1) {
      html += '<h5 style="margin:0 0 10px;font-size:12px;font-weight:700">Version History</h5>';
      html += '<div style="display:flex;flex-direction:column;gap:8px">';

      InvestorHubState.flipAnalyses.forEach((analysis, idx) => {
        const isLatest = idx === 0;
        const bgColor = isLatest ? 'rgba(99,102,241,0.1)' : 'transparent';

        html += '<div style="background:' + bgColor + ';border:1px solid var(--border);border-radius:6px;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;font-size:12px;cursor:pointer" onclick="selectAnalysisVersion(' + analysis.version + ')">';
        html += '<div>';
        html += '<span style="font-weight:700">v' + analysis.version + '</span> ';
        html += '<span style="color:var(--text-muted)">' + formatDate(analysis.analysis_date) + '</span>';
        if (isLatest) {
          html += '<span style="margin-left:8px;font-size:10px;background:var(--accent);color:#fff;padding:2px 6px;border-radius:4px">LATEST</span>';
        }
        html += '</div>';
        html += '<div style="text-align:right">';
        html += '<div style="font-weight:700">' + formatMoney(analysis.net_profit) + '</div>';
        html += '<div style="color:var(--text-muted);font-size:11px">' + (parseFloat(analysis.roi_percent) || 0).toFixed(1) + '% ROI</div>';
        html += '</div>';
        html += '</div>';
      });

      html += '</div>';
    }
  }

  html += '</div>';
  return html;
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

function attachInvestorHubEventHandlers() {
  const btnAddInvestor = document.getElementById('btn-add-investor');
  const btnRecordCapital = document.getElementById('btn-record-capital');
  const btnCreateAnalysis = document.getElementById('btn-create-analysis');

  if (btnAddInvestor) {
    btnAddInvestor.addEventListener('click', openAddInvestorModal);
  }

  if (btnRecordCapital) {
    btnRecordCapital.addEventListener('click', openRecordCapitalModal);
  }

  if (btnCreateAnalysis) {
    btnCreateAnalysis.addEventListener('click', openCreateAnalysisModal);
  }
}

// ============================================================================
// MODALS
// ============================================================================

function openAddInvestorModal() {
  // Delegado a investor-hub-modals.js
  if (typeof window.openAddInvestorModal === 'function') {
    window.openAddInvestorModal();
  }
}

function openRecordCapitalModal() {
  // Delegado a investor-hub-modals.js
  if (typeof window.openRecordCapitalModal === 'function') {
    window.openRecordCapitalModal();
  }
}

function openCreateAnalysisModal() {
  // Delegado a investor-hub-modals.js
  if (typeof window.openCreateAnalysisModal === 'function') {
    window.openCreateAnalysisModal();
  }
}

function selectAnalysisVersion(version) {
  InvestorHubState.selectedAnalysisVersion = version;
  showToast('Selected analysis v' + version);
  // TODO: Implement detailed view for specific version
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Use existing functions from projects.js when available, fallback to inline versions
function formatMoney(amount) {
  const num = parseFloat(amount) || 0;
  return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateString) {
  if (!dateString) return '—';
  if (typeof fmtDate === 'function') {
    return fmtDate(dateString);
  }
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function getStatusColor(status) {
  const statusColors = {
    'active': '#10b981',
    'inactive': '#9ca3af',
    'exited': '#ef4444',
    'pending': '#f59e0b',
    'received': '#10b981',
    'refunded': '#ef4444',
    'draft': '#6b7280',
    'submitted': '#f59e0b',
    'approved': '#10b981',
    'final': '#10b981'
  };
  return statusColors[status] || '#6b7280';
}

function escapeHtml(text) {
  if (!text) return '';
  if (typeof escHtml === 'function') {
    return escHtml(text);
  }
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function showToast(message, type = 'info') {
  // Use existing showToast from projects.js if available
  if (typeof window.showToast === 'function') {
    window.showToast(message);
    return;
  }

  // Fallback implementation
  const toast = document.getElementById('toast');
  if (!toast) return;

  const colors = {
    'success': { bg: '#10b981', text: '#fff' },
    'error': { bg: '#ef4444', text: '#fff' },
    'info': { bg: '#6366f1', text: '#fff' }
  };

  const color = colors[type] || colors['info'];
  toast.textContent = message;
  toast.style.background = color.bg;
  toast.style.color = color.text;
  toast.style.display = 'block';

  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

// ============================================================================
// EXPORT
// ============================================================================

// These functions are called from projects.js
window.loadInvestorHubTab = async function(projectId) {
  const loaded = await loadInvestorHubData(projectId);
  if (loaded) {
    renderInvestorHubTab();
  } else {
    const tabContent = document.getElementById('proj-tab-investorhub');
    if (tabContent) {
      tabContent.innerHTML = '<div class="proj-empty">Error loading Investor Hub data</div>';
    }
  }
};

window.selectAnalysisVersion = selectAnalysisVersion;
