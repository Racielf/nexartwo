// ============================================================================
// INVESTOR HUB — Phase 2B Logic Layer
// ============================================================================

// State Management
const InvestorHubState = {
  currentProjectId: null,
  investors: [],
  capitalContributions: [],
  capitalCalls: [],
  flipAnalyses: [],
  selectedAnalysisVersion: null,

  reset() {
    this.currentProjectId = null;
    this.investors = [];
    this.capitalContributions = [];
    this.capitalCalls = [];
    this.flipAnalyses = [];
    this.selectedAnalysisVersion = null;
  },

  setProject(projectId)             { this.currentProjectId = projectId; },
  setInvestors(data)                { this.investors = data || []; },
  setCapitalContributions(data)     { this.capitalContributions = data || []; },
  setCapitalCalls(data)             { this.capitalCalls = data || []; },
  setFlipAnalyses(data)             { this.flipAnalyses = data || []; },

  getActiveInvestorCount() {
    return this.investors.filter(i => i.status === 'confirmed').length;
  },

  // Sum of confirmed contributions only
  getTotalCapitalContributed() {
    return this.capitalContributions
      .filter(c => c.status === 'confirmed')
      .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  },

  getTotalPendingCapital() {
    return this.capitalContributions
      .filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  },

  getOpenCapitalCallsCount() {
    return this.capitalCalls.filter(c => c.status === 'pending').length;
  },

  getLatestFlipAnalysis() {
    return this.flipAnalyses.length ? this.flipAnalyses[0] : null;
  },

  getInvestorById(investorId) {
    return this.investors.find(inv => inv.investor_id === investorId) || null;
  },

  // Capital confirmed by a specific investor
  getInvestorCapital(investorId) {
    return this.capitalContributions
      .filter(c => c.status === 'confirmed' && c.investor_id === investorId)
      .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  }
};

// ============================================================================
// LOAD
// ============================================================================

async function loadInvestorHubData(projectId) {
  try {
    const mgr = getInvestorManager();
    if (!mgr) { console.error('InvestorManager not available'); return false; }

    InvestorHubState.reset();
    InvestorHubState.setProject(projectId);

    const [investors, contributions, analyses, calls] = await Promise.all([
      mgr.getProjectInvestors(projectId),
      mgr.getCapitalContributions(projectId),
      mgr.getFlipAnalysisHistory(projectId),
      typeof mgr.getCapitalCalls === 'function' ? mgr.getCapitalCalls(projectId) : Promise.resolve([])
    ]);

    InvestorHubState.setInvestors(investors || []);
    InvestorHubState.setCapitalContributions(contributions || []);
    InvestorHubState.setFlipAnalyses(analyses || []);
    InvestorHubState.setCapitalCalls(calls || []);

    return true;
  } catch (error) {
    console.error('Error loading investor hub data:', error);
    return false;
  }
}

// ============================================================================
// MAIN RENDER
// ============================================================================

function renderInvestorHubTab() {
  const tabContent = document.getElementById('proj-tab-investorhub');
  if (!tabContent) return;

  const projectId = InvestorHubState.currentProjectId;
  if (!projectId) {
    tabContent.innerHTML = '<div class="proj-empty">No project selected</div>';
    return;
  }

  let html = '';

  // Admin banner
  html += '<div style="background:#fef2f2;color:#ef4444;padding:8px 12px;border-radius:6px;font-size:11px;font-weight:700;margin-bottom:16px">';
  html += '🔒 INTERNAL &amp; ADMIN USE ONLY — Investor Hub Phase 2B</div>';

  // 4 summary metrics
  html += renderInvestorHubSummaryCards();

  // Investor cards
  html += renderInvestorsSection();

  // Capital contributions
  html += renderCapitalContributionsSection();

  // Flip analysis
  html += renderFlipAnalysisSection();

  // Private notes section (owner/admin only)
  html += renderPrivateNotesSection();

  tabContent.innerHTML = html;
  attachInvestorHubEventHandlers();
}

// ============================================================================
// SUMMARY CARDS — 4 metrics
// ============================================================================

function renderInvestorHubSummaryCards() {
  const activeCount = InvestorHubState.getActiveInvestorCount();
  const confirmedCapital = InvestorHubState.getTotalCapitalContributed();
  const pendingCapital = InvestorHubState.getTotalPendingCapital();
  const openCalls = InvestorHubState.getOpenCapitalCallsCount();

  let html = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">';

  html += `<div class="proj-stat-card">
    <div class="proj-stat-value" style="font-size:20px">${InvestorHubState.investors.length}</div>
    <div class="proj-stat-label">Investors</div>
    <div style="font-size:10px;color:var(--text-muted);margin-top:2px">${activeCount} confirmed</div>
  </div>`;

  html += `<div class="proj-stat-card">
    <div class="proj-stat-value" style="font-size:18px;color:#10b981">${formatMoney(confirmedCapital)}</div>
    <div class="proj-stat-label">Confirmed Capital</div>
  </div>`;

  html += `<div class="proj-stat-card">
    <div class="proj-stat-value" style="font-size:18px;color:#f59e0b">${formatMoney(pendingCapital)}</div>
    <div class="proj-stat-label">Pending Capital</div>
  </div>`;

  html += `<div class="proj-stat-card">
    <div class="proj-stat-value" style="font-size:20px;color:${openCalls > 0 ? '#ef4444' : 'var(--text-secondary)'}">${openCalls}</div>
    <div class="proj-stat-label">Open Capital Calls</div>
  </div>`;

  html += '</div>';
  return html;
}

// ============================================================================
// INVESTOR CARDS
// ============================================================================

function renderInvestorsSection() {
  let html = '<div style="margin-bottom:28px">';
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">';
  html += '<h4 style="margin:0;font-size:13px;font-weight:700">Project Investors</h4>';
  html += '<button class="btn btn-primary btn-sm" id="btn-add-investor" style="font-size:12px">+ Register Investor</button>';
  html += '</div>';

  if (!InvestorHubState.investors.length) {
    html += '<div style="padding:24px;text-align:center;background:var(--bg-primary);border:1px dashed var(--border);border-radius:8px">';
    html += '<div style="font-size:13px;color:var(--text-muted)">No investors attached to this project yet.</div>';
    html += '<div style="font-size:12px;color:var(--text-muted);margin-top:4px">Click "Register Investor" to add the first one.</div>';
    html += '</div>';
  } else {
    const totalConfirmed = InvestorHubState.getTotalCapitalContributed();

    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px">';

    InvestorHubState.investors.forEach((inv, idx) => {
      html += renderInvestorCard(inv, idx, totalConfirmed);
    });

    html += '</div>';
  }

  html += '</div>';
  return html;
}

const _AVATAR_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#0ea5e9'];

function renderInvestorCard(inv, idx, totalConfirmedCapital) {
  const name = escapeHtml(inv.investor_name || 'Unknown');
  const role = escapeHtml(inv.role || 'investor');
  const status = inv.status || 'pending';
  const totalCap = parseFloat(inv.total_capital) || 0;
  const ownership = parseFloat(inv.ownership_percent) || 0;
  const profitSplit = parseFloat(inv.profit_split_percent) || 0;
  const avatarColor = _AVATAR_COLORS[idx % _AVATAR_COLORS.length];
  const initials = _getInitials(inv.investor_name);

  const statusStyles = {
    confirmed: { bg: '#d1fae5', color: '#065f46' },
    pending:   { bg: '#fef3c7', color: '#92400e' },
    cancelled: { bg: '#fee2e2', color: '#991b1b' }
  };
  const ss = statusStyles[status] || { bg: '#f3f4f6', color: '#6b7280' };

  // Capital progress bar (this investor vs total project capital)
  const progressPct = totalConfirmedCapital > 0 ? Math.min(100, (totalCap / totalConfirmedCapital) * 100) : 0;

  return `<div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:10px">

    <!-- Header: avatar + name + status -->
    <div style="display:flex;align-items:center;gap:10px">
      <div style="width:38px;height:38px;border-radius:50%;background:${avatarColor};color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0">${initials}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</div>
        <div style="font-size:11px;color:var(--text-muted)">${_formatRole(role)}</div>
      </div>
      <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:${ss.bg};color:${ss.color};white-space:nowrap">${status.toUpperCase()}</span>
    </div>

    <!-- Capital amount -->
    <div style="display:flex;justify-content:space-between;align-items:baseline">
      <span style="font-size:11px;color:var(--text-muted)">Capital contributed</span>
      <strong style="font-size:14px;color:${totalCap > 0 ? '#10b981' : 'var(--text-secondary)'}">${formatMoney(totalCap)}</strong>
    </div>

    <!-- Progress bar -->
    <div>
      <div style="background:var(--border);border-radius:4px;height:5px;overflow:hidden">
        <div style="background:${avatarColor};height:100%;width:${progressPct.toFixed(1)}%;border-radius:4px;transition:width 0.3s"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-muted);margin-top:3px">
        <span>${ownership.toFixed(1)}% ownership · ${profitSplit.toFixed(1)}% profit split</span>
        <span>${progressPct.toFixed(0)}% of total</span>
      </div>
    </div>

    <!-- Action buttons -->
    <div style="display:flex;gap:6px;padding-top:2px">
      <button class="btn btn-secondary btn-sm" style="flex:1;font-size:11px" onclick="openRecordCapitalModal('${inv.investor_id}')">+ Contribution</button>
      <button class="btn btn-ghost btn-sm" style="font-size:11px;color:#ef4444" onclick="_voidProjectInvestor('${inv.id}', '${name}')">Void</button>
    </div>
  </div>`;
}

function _getInitials(name) {
  if (!name) return '??';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function _formatRole(role) {
  const map = {
    equity_partner:   'Equity Partner',
    lead_contractor:  'Lead Contractor',
    silent_partner:   'Silent Partner',
    investor:         'Investor',
    owner:            'Owner',
    manager:          'Manager',
    other:            'Other'
  };
  return map[role] || capitalizeFirst(role.replace(/_/g, ' '));
}

async function _voidProjectInvestor(projectInvestorId, name) {
  if (!confirm(`Void ${name} from this project? This cannot be undone — the record will remain for audit purposes.`)) return;
  try {
    const mgr = getInvestorManager();
    if (!mgr) return;
    await mgr.voidProjectInvestor(projectInvestorId);
    showToast(`${name} voided from project`, 'success');
    await loadInvestorHubData(InvestorHubState.currentProjectId);
    renderInvestorHubTab();
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
}

// ============================================================================
// CAPITAL CONTRIBUTIONS TABLE
// ============================================================================

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
    html += '<thead><tr><th>Investor</th><th>Date</th><th>Amount</th><th>Type</th><th>Method</th><th>Status</th></tr></thead>';
    html += '<tbody>';

    InvestorHubState.capitalContributions.forEach(contrib => {
      // Support both schema patterns
      const invName = escapeHtml(
        contrib.investor_name ||
        contrib.project_investor?.investor?.name ||
        'Unknown'
      );
      const amount = parseFloat(contrib.amount) || 0;
      const date = formatDate(contrib.date || contrib.contribution_date);
      const type = contrib.type || contrib.contribution_type || 'initial';
      const method = contrib.method || '—';
      const status = contrib.status || 'pending';

      html += '<tr>';
      html += `<td><strong>${invName}</strong></td>`;
      html += `<td>${date}</td>`;
      html += `<td style="text-align:right"><strong>${formatMoney(amount)}</strong></td>`;
      html += `<td>${capitalizeFirst(type.replace(/-/g, ' '))}</td>`;
      html += `<td style="font-size:12px">${capitalizeFirst(method.replace(/_/g, ' '))}</td>`;
      html += `<td><span style="font-size:11px;font-weight:700;color:${getStatusColor(status)}">${status.toUpperCase()}</span></td>`;
      html += '</tr>';
    });

    html += '</tbody></table>';
  }

  html += '</div>';
  return html;
}

// ============================================================================
// FLIP ANALYSIS (unchanged from original)
// ============================================================================

function renderFlipAnalysisSection() {
  let html = '<div style="margin-bottom:28px">';
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">';
  html += '<h4 style="margin:0;font-size:13px;font-weight:700">Flip Analysis &amp; ROI</h4>';
  html += '<button class="btn btn-primary btn-sm" id="btn-create-analysis" style="font-size:12px">+ Create Analysis</button>';
  html += '</div>';

  const latestAnalysis = InvestorHubState.getLatestFlipAnalysis();

  if (!latestAnalysis) {
    html += '<p style="color:var(--text-muted);font-size:13px;padding:12px 0">No flip analyses created yet.</p>';
  } else {
    html += '<div style="background:var(--bg-primary);border:2px solid var(--accent);border-radius:10px;padding:16px;margin-bottom:16px">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">';
    html += `<h5 style="margin:0;font-size:12px;font-weight:700;color:var(--accent)">Version ${latestAnalysis.version} (Latest)</h5>`;
    html += `<span style="font-size:11px;color:var(--text-muted)">${formatDate(latestAnalysis.analysis_date)}</span>`;
    html += '</div>';

    html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:12px">';
    html += `<div style="border-bottom:1px solid var(--border);padding-bottom:8px"><div style="font-size:11px;color:var(--text-muted)">Purchase Price</div><div style="font-size:14px;font-weight:700">${formatMoney(latestAnalysis.purchase_price)}</div></div>`;
    html += `<div style="border-bottom:1px solid var(--border);padding-bottom:8px"><div style="font-size:11px;color:var(--text-muted)">ARV</div><div style="font-size:14px;font-weight:700">${formatMoney(latestAnalysis.arv)}</div></div>`;
    html += `<div style="border-bottom:1px solid var(--border);padding-bottom:8px"><div style="font-size:11px;color:var(--text-muted)">Total Cost</div><div style="font-size:14px;font-weight:700">${formatMoney(latestAnalysis.total_all_in_cost)}</div></div>`;
    html += `<div style="border-bottom:1px solid var(--border);padding-bottom:8px"><div style="font-size:11px;color:var(--text-muted)">Net Proceeds</div><div style="font-size:14px;font-weight:700;color:#10b981">${formatMoney(latestAnalysis.net_proceeds)}</div></div>`;
    html += '</div>';

    html += '<div style="background:rgba(99,102,241,0.05);border-radius:6px;padding:12px;display:grid;grid-template-columns:repeat(2,1fr);gap:12px">';
    html += `<div><div style="font-size:11px;color:var(--text-muted);font-weight:700">NET PROFIT</div><div style="font-size:16px;font-weight:800;color:#10b981">${formatMoney(latestAnalysis.net_profit)}</div></div>`;
    html += `<div><div style="font-size:11px;color:var(--text-muted);font-weight:700">ROI</div><div style="font-size:16px;font-weight:800;color:#6366f1">${(parseFloat(latestAnalysis.roi_percent) || 0).toFixed(2)}%</div></div>`;
    html += '</div>';
    html += '</div>';

    if (InvestorHubState.flipAnalyses.length > 1) {
      html += '<h5 style="margin:0 0 10px;font-size:12px;font-weight:700">Version History</h5>';
      html += '<div style="display:flex;flex-direction:column;gap:8px">';
      InvestorHubState.flipAnalyses.forEach((analysis, idx) => {
        const isLatest = idx === 0;
        html += `<div style="background:${isLatest ? 'rgba(99,102,241,0.1)' : 'transparent'};border:1px solid var(--border);border-radius:6px;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;font-size:12px;cursor:pointer" onclick="selectAnalysisVersion(${analysis.version})">`;
        html += `<div><span style="font-weight:700">v${analysis.version}</span> <span style="color:var(--text-muted)">${formatDate(analysis.analysis_date)}</span>${isLatest ? '<span style="margin-left:8px;font-size:10px;background:var(--accent);color:#fff;padding:2px 6px;border-radius:4px">LATEST</span>' : ''}</div>`;
        html += `<div style="text-align:right"><div style="font-weight:700">${formatMoney(analysis.net_profit)}</div><div style="color:var(--text-muted);font-size:11px">${(parseFloat(analysis.roi_percent) || 0).toFixed(1)}% ROI</div></div>`;
        html += '</div>';
      });
      html += '</div>';
    }
  }

  html += '</div>';
  return html;
}

// ============================================================================
// PRIVATE NOTES SECTION
// ============================================================================

function renderPrivateNotesSection() {
  // Collect investor notes that have content
  const investorNotes = InvestorHubState.investors
    .filter(inv => inv.owner_notes && inv.owner_notes.trim())
    .map(inv => ({
      name: inv.investor_name || 'Unknown',
      notes: inv.owner_notes
    }));

  let html = '<div style="background:#fefce8;border:1px solid #fbbf24;border-radius:10px;padding:16px;margin-top:4px">';
  html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">';
  html += '<span style="font-size:13px">🔒</span>';
  html += '<div style="font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.5px">Private Notes — Owner / Admin Only</div>';
  html += '</div>';

  if (!investorNotes.length) {
    html += '<div style="font-size:12px;color:#a16207;font-style:italic">No private notes recorded. Notes added during investor registration will appear here.</div>';
  } else {
    investorNotes.forEach(entry => {
      html += '<div style="margin-bottom:10px;padding:10px;background:rgba(255,255,255,0.6);border-radius:6px">';
      html += `<div style="font-size:11px;font-weight:700;color:#78350f;margin-bottom:4px">${escapeHtml(entry.name)}</div>`;
      html += `<div style="font-size:12px;color:#92400e;white-space:pre-wrap">${escapeHtml(entry.notes)}</div>`;
      html += '</div>';
    });
  }

  html += '</div>';
  return html;
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

function attachInvestorHubEventHandlers() {
  const btnAdd = document.getElementById('btn-add-investor');
  const btnCapital = document.getElementById('btn-record-capital');
  const btnAnalysis = document.getElementById('btn-create-analysis');

  if (btnAdd) btnAdd.addEventListener('click', openAddInvestorModal);
  if (btnCapital) btnCapital.addEventListener('click', () => openRecordCapitalModal());
  if (btnAnalysis) btnAnalysis.addEventListener('click', openCreateAnalysisModal);
}

function openAddInvestorModal() {
  if (typeof window.openAddInvestorModal === 'function') window.openAddInvestorModal();
}

function openRecordCapitalModal(investorId) {
  if (typeof window.openRecordCapitalModal === 'function') window.openRecordCapitalModal(investorId);
}

function openCreateAnalysisModal() {
  if (typeof window.openCreateAnalysisModal === 'function') window.openCreateAnalysisModal();
}

function selectAnalysisVersion(version) {
  InvestorHubState.selectedAnalysisVersion = version;
  showToast('Selected analysis v' + version);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatMoney(amount) {
  const num = parseFloat(amount) || 0;
  return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateString) {
  if (!dateString) return '—';
  if (typeof fmtDate === 'function') return fmtDate(dateString);
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getStatusColor(status) {
  const map = {
    confirmed:  '#10b981',
    active:     '#10b981',
    received:   '#10b981',
    approved:   '#10b981',
    final:      '#10b981',
    pending:    '#f59e0b',
    submitted:  '#f59e0b',
    draft:      '#6b7280',
    inactive:   '#9ca3af',
    cancelled:  '#ef4444',
    voided:     '#ef4444',
    exited:     '#ef4444',
    rejected:   '#ef4444'
  };
  return map[status] || '#6b7280';
}

function escapeHtml(text) {
  if (!text) return '';
  if (typeof escHtml === 'function') return escHtml(text);
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function showToast(message, type = 'info') {
  if (typeof window.showToast === 'function') { window.showToast(message); return; }
  const toast = document.getElementById('toast');
  if (!toast) return;
  const colors = { success: '#10b981', error: '#ef4444', info: '#6366f1' };
  toast.textContent = message;
  toast.style.background = colors[type] || colors.info;
  toast.style.color = '#fff';
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 3500);
}

// ============================================================================
// EXPORTS
// ============================================================================

window.loadInvestorHubTab = async function(projectId) {
  const loaded = await loadInvestorHubData(projectId);
  const tabContent = document.getElementById('proj-tab-investorhub');
  if (loaded) {
    renderInvestorHubTab();
  } else if (tabContent) {
    tabContent.innerHTML = '<div class="proj-empty">Error loading Investor Hub data</div>';
  }
};

window.selectAnalysisVersion = selectAnalysisVersion;
window._voidProjectInvestor = _voidProjectInvestor;
