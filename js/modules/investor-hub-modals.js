// ============================================================================
// INVESTOR HUB — Modals and Form Handlers
// Phase 2B — 4-Step Investor Registration Wizard + Capital Forms
// ============================================================================

const _LBL = 'font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;font-weight:600';

// ============================================================================
// WIZARD STATE (module-level, reset on each open)
// ============================================================================

let _wiz = {
  step: 1,
  totalSteps: 4,
  companyMode: 'none', // 'none' | 'create' | 'link'
  companies: [],
  data: {}
};

// ============================================================================
// MODAL: Add Investor — 4-Step Registration Wizard
// ============================================================================

async function openAddInvestorModal() {
  const projectId = InvestorHubState.currentProjectId;
  if (!projectId) {
    showToast('No project selected', 'error');
    return;
  }

  _wiz = { step: 1, totalSteps: 4, companyMode: 'none', companies: [], data: {} };

  // Pre-load existing companies for step 2 (non-blocking)
  try {
    const mgr = getInvestorManager();
    if (mgr && typeof mgr.listCompanies === 'function') {
      _wiz.companies = (await mgr.listCompanies()) || [];
    }
  } catch (e) {
    _wiz.companies = [];
  }

  _ensureModalContainer();
  _renderWizard();
}

function _ensureModalContainer() {
  let c = document.getElementById('investor-modals-container');
  if (!c) {
    c = document.createElement('div');
    c.id = 'investor-modals-container';
    document.body.appendChild(c);
  }
  return c;
}

function _renderWizard() {
  const c = _ensureModalContainer();
  const labels = ['Identidad', 'Empresa', 'Capital', 'Notas'];
  const isFirst = _wiz.step === 1;
  const isLast = _wiz.step === _wiz.totalSteps;

  c.innerHTML = `
    <div class="modal-overlay" id="investor-wizard-overlay" onclick="if(event.target.id==='investor-wizard-overlay')closeAddInvestorModal()">
      <div class="modal-box" style="max-width:520px;max-height:90vh;overflow-y:auto" onclick="event.stopPropagation()">

        <!-- Header -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px">
          <div>
            <h3 style="margin:0;font-size:15px;font-weight:700">Register Investor</h3>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">Step ${_wiz.step} of ${_wiz.totalSteps} — ${labels[_wiz.step - 1]}</div>
          </div>
          <button class="btn btn-ghost" onclick="closeAddInvestorModal()" style="padding:4px 8px;flex-shrink:0">✕</button>
        </div>

        <!-- Step indicator -->
        ${_renderStepIndicator(labels, _wiz.step)}

        <!-- Step content -->
        <div style="margin-top:20px">
          ${_renderWizardStepContent(_wiz.step)}
        </div>

        <!-- Navigation -->
        <div style="display:flex;gap:8px;margin-top:20px;padding-top:16px;border-top:1px solid var(--border)">
          ${isFirst
            ? `<button class="btn btn-secondary" onclick="closeAddInvestorModal()" style="flex:1">Cancel</button>`
            : `<button class="btn btn-secondary" onclick="_wizBack()" style="flex:1">← Back</button>`
          }
          ${isLast
            ? `<button class="btn btn-primary" id="wiz-save-btn" onclick="_wizSave()" style="flex:1">Save Investor</button>`
            : `<button class="btn btn-primary" onclick="_wizNext()" style="flex:1">Continue →</button>`
          }
        </div>
      </div>
    </div>
  `;
}

// ---- Step indicator ----
function _renderStepIndicator(labels, current) {
  let html = '<div style="display:flex;align-items:center;justify-content:center">';
  labels.forEach((label, i) => {
    const n = i + 1;
    const done = n < current;
    const active = n === current;
    const circleBg = done ? '#10b981' : active ? 'var(--accent)' : 'var(--border)';
    const circleColor = (done || active) ? '#fff' : 'var(--text-muted)';
    const labelColor = active ? 'var(--accent)' : done ? '#10b981' : 'var(--text-muted)';
    const weight = active ? '700' : '400';

    html += `<div style="display:flex;flex-direction:column;align-items:center;gap:4px">
      <div style="width:28px;height:28px;border-radius:50%;background:${circleBg};color:${circleColor};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700">${done ? '✓' : n}</div>
      <div style="font-size:10px;font-weight:${weight};color:${labelColor};white-space:nowrap">${label}</div>
    </div>`;

    if (i < labels.length - 1) {
      const lineBg = n < current ? '#10b981' : 'var(--border)';
      html += `<div style="width:36px;height:2px;background:${lineBg};margin-bottom:18px;flex-shrink:0"></div>`;
    }
  });
  html += '</div>';
  return html;
}

// ---- Step content dispatcher ----
function _renderWizardStepContent(step) {
  switch (step) {
    case 1: return _renderStep1();
    case 2: return _renderStep2();
    case 3: return _renderStep3();
    case 4: return _renderStep4();
    default: return '';
  }
}

// ---- Step 1: Personal identity ----
function _renderStep1() {
  const d = _wiz.data;
  return `<div style="display:flex;flex-direction:column;gap:14px">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div>
        <label style="${_LBL}">First Name *</label>
        <input type="text" id="wiz-first-name" class="form-control" value="${d.first_name || ''}" placeholder="First name" style="width:100%">
      </div>
      <div>
        <label style="${_LBL}">Last Name *</label>
        <input type="text" id="wiz-last-name" class="form-control" value="${d.last_name || ''}" placeholder="Last name" style="width:100%">
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div>
        <label style="${_LBL}">Email *</label>
        <input type="email" id="wiz-email" class="form-control" value="${d.email || ''}" placeholder="email@company.com" style="width:100%">
      </div>
      <div>
        <label style="${_LBL}">Phone *</label>
        <input type="tel" id="wiz-phone" class="form-control" value="${d.phone || ''}" placeholder="503-555-0100" style="width:100%">
      </div>
    </div>
    <div>
      <label style="${_LBL}">Personal Address *</label>
      <input type="text" id="wiz-address" class="form-control" value="${d.address || ''}" placeholder="Street address" style="width:100%">
    </div>
    <div style="display:grid;grid-template-columns:1fr 80px 90px;gap:12px">
      <div>
        <label style="${_LBL}">City *</label>
        <input type="text" id="wiz-city" class="form-control" value="${d.city || ''}" placeholder="Portland" style="width:100%">
      </div>
      <div>
        <label style="${_LBL}">State *</label>
        <input type="text" id="wiz-state-addr" class="form-control" value="${d.state_addr || ''}" placeholder="OR" maxlength="2" style="width:100%;text-transform:uppercase">
      </div>
      <div>
        <label style="${_LBL}">ZIP *</label>
        <input type="text" id="wiz-zip" class="form-control" value="${d.zip || ''}" placeholder="97201" style="width:100%">
      </div>
    </div>
  </div>`;
}

// ---- Step 2: Company (optional) ----
function _renderStep2() {
  const d = _wiz.data;
  const mode = _wiz.companyMode;

  const companyOptions = _wiz.companies.length
    ? _wiz.companies.map(co => `<option value="${co.id}" ${d.company_id === co.id ? 'selected' : ''}>${escapeHtml(co.company_name)}</option>`).join('')
    : '<option value="">No companies registered yet</option>';

  return `<div style="display:flex;flex-direction:column;gap:14px">
    <p style="margin:0;font-size:13px;color:var(--text-secondary)">
      Does this investor contribute capital through a corporate entity?
    </p>

    <!-- Mode selector -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
      <button type="button" onclick="_setCompanyMode('none')" class="btn ${mode === 'none' ? 'btn-primary' : 'btn-secondary'}" style="font-size:12px">
        Individual
      </button>
      <button type="button" onclick="_setCompanyMode('create')" class="btn ${mode === 'create' ? 'btn-primary' : 'btn-secondary'}" style="font-size:12px">
        + New company
      </button>
      <button type="button" onclick="_setCompanyMode('link')" class="btn ${mode === 'link' ? 'btn-primary' : 'btn-secondary'}" style="font-size:12px">
        Link existing
      </button>
    </div>

    ${mode === 'none' ? `
      <div style="padding:14px;background:var(--bg-primary);border:1px dashed var(--border);border-radius:8px;text-align:center;font-size:12px;color:var(--text-muted)">
        Investor will be registered as an individual without a company entity.
      </div>
    ` : ''}

    ${mode === 'create' ? `
      <div style="display:flex;flex-direction:column;gap:12px;padding:14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:8px">
        <div>
          <label style="${_LBL}">Company Name *</label>
          <input type="text" id="wiz-co-name" class="form-control" value="${d.company_name || ''}" placeholder="e.g. Blue Sky Properties LLC" style="width:100%">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div>
            <label style="${_LBL}">EIN / Tax ID</label>
            <input type="text" id="wiz-co-ein" class="form-control" value="${d.company_ein || ''}" placeholder="XX-XXXXXXX" style="width:100%">
          </div>
          <div>
            <label style="${_LBL}">State of Reg.</label>
            <input type="text" id="wiz-co-state" class="form-control" value="${d.company_state || ''}" placeholder="OR" maxlength="2" style="width:100%;text-transform:uppercase">
          </div>
        </div>
        <div>
          <label style="${_LBL}">Company Address</label>
          <input type="text" id="wiz-co-address" class="form-control" value="${d.company_address || ''}" placeholder="Street address" style="width:100%">
        </div>
        <div>
          <label style="${_LBL}">Investor's Role in Company</label>
          <select id="wiz-co-role" class="form-control" style="width:100%">
            <option value="owner" ${d.company_role === 'owner' ? 'selected' : ''}>Owner / Principal</option>
            <option value="partner" ${d.company_role === 'partner' ? 'selected' : ''}>Partner</option>
            <option value="member" ${d.company_role === 'member' ? 'selected' : ''}>Member</option>
            <option value="manager" ${d.company_role === 'manager' ? 'selected' : ''}>Manager</option>
            <option value="other" ${d.company_role === 'other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
      </div>
    ` : ''}

    ${mode === 'link' ? `
      <div style="display:flex;flex-direction:column;gap:12px;padding:14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:8px">
        <div>
          <label style="${_LBL}">Select Company</label>
          <select id="wiz-co-existing" class="form-control" style="width:100%">
            <option value="">— Select a company —</option>
            ${companyOptions}
          </select>
        </div>
        <div>
          <label style="${_LBL}">Investor's Role in Company</label>
          <select id="wiz-co-link-role" class="form-control" style="width:100%">
            <option value="owner">Owner / Principal</option>
            <option value="partner">Partner</option>
            <option value="member">Member</option>
            <option value="manager">Manager</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
    ` : ''}
  </div>`;
}

// ---- Step 3: KYC + Capital ----
function _renderStep3() {
  const d = _wiz.data;
  const today = new Date().toISOString().split('T')[0];

  return `<div style="display:flex;flex-direction:column;gap:18px">

    <!-- KYC / Accreditation -->
    <div>
      <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">KYC / Accreditation</div>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div>
          <label style="${_LBL}">Investment Profile</label>
          <select id="wiz-inv-profile" class="form-control" style="width:100%">
            <option value="individual" ${d.investment_profile === 'individual' ? 'selected' : ''}>Individual</option>
            <option value="corporate_entity" ${d.investment_profile === 'corporate_entity' ? 'selected' : ''}>Corporate Entity</option>
            <option value="equity_partner" ${d.investment_profile === 'equity_partner' ? 'selected' : ''}>Equity Partner</option>
            <option value="trust_family" ${d.investment_profile === 'trust_family' ? 'selected' : ''}>Trust / Family Fund</option>
          </select>
        </div>
        <div>
          <label style="${_LBL}">Capital Source</label>
          <select id="wiz-capital-source" class="form-control" style="width:100%">
            <option value="">— Not specified —</option>
            <option value="savings" ${d.capital_source === 'savings' ? 'selected' : ''}>Personal Savings</option>
            <option value="property_sale" ${d.capital_source === 'property_sale' ? 'selected' : ''}>Property Sale</option>
            <option value="loan" ${d.capital_source === 'loan' ? 'selected' : ''}>Credit / Loan</option>
            <option value="inheritance" ${d.capital_source === 'inheritance' ? 'selected' : ''}>Inheritance / Fund</option>
          </select>
        </div>
        <label style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:6px;cursor:pointer">
          <input type="checkbox" id="wiz-accredited" style="width:16px;height:16px;cursor:pointer" ${d.accredited_investor ? 'checked' : ''}>
          <div>
            <div style="font-size:13px;font-weight:600">Accredited Investor</div>
            <div style="font-size:11px;color:var(--text-muted)">Required for Reg D 506(c) offerings</div>
          </div>
        </label>
      </div>
    </div>

    <!-- Role in project -->
    <div>
      <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">Role in Project</div>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div>
          <label style="${_LBL}">Role *</label>
          <select id="wiz-role" class="form-control" style="width:100%">
            <option value="equity_partner" ${d.role === 'equity_partner' ? 'selected' : ''}>Equity Partner</option>
            <option value="lead_contractor" ${d.role === 'lead_contractor' ? 'selected' : ''}>Lead Contractor</option>
            <option value="silent_partner" ${d.role === 'silent_partner' ? 'selected' : ''}>Silent Partner</option>
            <option value="other" ${d.role === 'other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div>
            <label style="${_LBL}">Ownership %</label>
            <input type="number" id="wiz-ownership" class="form-control" min="0" max="100" step="0.01" value="${d.ownership_percentage ?? 0}" style="width:100%">
          </div>
          <div>
            <label style="${_LBL}">Profit Split %</label>
            <input type="number" id="wiz-profit-split" class="form-control" min="0" max="100" step="0.01" value="${d.profit_split_percentage ?? 0}" style="width:100%">
          </div>
        </div>
      </div>
    </div>

    <!-- Initial capital contribution -->
    <div>
      <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">Initial Capital Contribution *</div>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div>
            <label style="${_LBL}">Amount (USD) *</label>
            <input type="number" id="wiz-amount" class="form-control" min="0.01" step="0.01" value="${d.amount || ''}" placeholder="e.g. 20000" style="width:100%">
          </div>
          <div>
            <label style="${_LBL}">Payment Method *</label>
            <select id="wiz-method" class="form-control" style="width:100%">
              <option value="wire" ${d.method === 'wire' ? 'selected' : ''}>Wire Transfer</option>
              <option value="check" ${d.method === 'check' ? 'selected' : ''}>Check</option>
              <option value="cash" ${d.method === 'cash' ? 'selected' : ''}>Cash</option>
              <option value="company_payment" ${d.method === 'company_payment' ? 'selected' : ''}>Company Payment</option>
            </select>
          </div>
        </div>
        <div>
          <label style="${_LBL}">Contribution Date *</label>
          <input type="date" id="wiz-cont-date" class="form-control" value="${d.contribution_date || today}" style="width:100%">
        </div>
        <div>
          <label style="${_LBL}">Reference (Check #, Wire ID, etc.)</label>
          <input type="text" id="wiz-reference" class="form-control" value="${d.evidence_reference || ''}" placeholder="Optional" style="width:100%">
        </div>
      </div>
    </div>
  </div>`;
}

// ---- Step 4: Private notes ----
function _renderStep4() {
  const d = _wiz.data;
  return `<div style="display:flex;flex-direction:column;gap:16px">
    <div style="padding:10px 14px;background:#fefce8;border:1px solid #fbbf24;border-radius:6px;font-size:12px;color:#92400e">
      🔒 <strong>Internal use only.</strong> Not visible to the investor and will not appear in reports.
    </div>
    <div>
      <label style="${_LBL}">Owner / Admin Notes</label>
      <textarea id="wiz-owner-notes" class="form-control" placeholder="Verbal agreements, pipeline history, pending commitments, contact notes..." style="width:100%;min-height:100px;resize:vertical">${d.owner_notes || ''}</textarea>
    </div>
    <div>
      <label style="${_LBL}">First Contact Date</label>
      <input type="date" id="wiz-first-contact" class="form-control" value="${d.first_contact_date || ''}" style="width:100%">
    </div>
    <label style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:6px;cursor:pointer">
      <input type="checkbox" id="wiz-signed" style="width:16px;height:16px;cursor:pointer" ${d.signed_agreement ? 'checked' : ''}>
      <div>
        <div style="font-size:13px;font-weight:600">Investment Agreement Signed</div>
        <div style="font-size:11px;color:var(--text-muted)">Mark when the formal agreement has been executed</div>
      </div>
    </label>
  </div>`;
}

// ---- Navigation ----

function _setCompanyMode(mode) {
  _collectStepData(2, false); // Save without validation
  _wiz.companyMode = mode;
  _renderWizard();
}

function _wizNext() {
  if (!_collectStepData(_wiz.step, true)) return;
  _wiz.step = Math.min(_wiz.step + 1, _wiz.totalSteps);
  _renderWizard();
  const box = document.querySelector('#investor-wizard-overlay .modal-box');
  if (box) box.scrollTop = 0;
}

function _wizBack() {
  _collectStepData(_wiz.step, false);
  _wiz.step = Math.max(_wiz.step - 1, 1);
  _renderWizard();
  const box = document.querySelector('#investor-wizard-overlay .modal-box');
  if (box) box.scrollTop = 0;
}

// Collect data from the current step; validate only when validate=true
function _collectStepData(step, validate) {
  const d = _wiz.data;
  const v = validate;
  const g = id => (document.getElementById(id)?.value || '').trim();
  const gb = id => document.getElementById(id)?.checked || false;

  switch (step) {
    case 1: {
      const first = g('wiz-first-name');
      const last = g('wiz-last-name');
      const email = g('wiz-email');
      const phone = g('wiz-phone');
      const address = g('wiz-address');
      const city = g('wiz-city');
      const stateAddr = g('wiz-state-addr');
      const zip = g('wiz-zip');

      if (v) {
        if (!first)     { showToast('First name is required', 'error'); return false; }
        if (!last)      { showToast('Last name is required', 'error'); return false; }
        if (!email)     { showToast('Email is required', 'error'); return false; }
        if (!phone)     { showToast('Phone is required', 'error'); return false; }
        if (!address)   { showToast('Address is required', 'error'); return false; }
        if (!city)      { showToast('City is required', 'error'); return false; }
        if (!stateAddr) { showToast('State is required', 'error'); return false; }
        if (!zip)       { showToast('ZIP code is required', 'error'); return false; }
      }
      Object.assign(d, { first_name: first, last_name: last, email, phone, address, city, state_addr: stateAddr, zip });
      return true;
    }

    case 2: {
      const mode = _wiz.companyMode;
      if (mode === 'create') {
        const coName = g('wiz-co-name');
        if (v && !coName) { showToast('Company name is required', 'error'); return false; }
        Object.assign(d, {
          company_mode: 'create',
          company_name: coName,
          company_ein: g('wiz-co-ein'),
          company_state: g('wiz-co-state'),
          company_address: g('wiz-co-address'),
          company_role: document.getElementById('wiz-co-role')?.value || 'member',
          company_id: null
        });
      } else if (mode === 'link') {
        const coId = document.getElementById('wiz-co-existing')?.value || '';
        if (v && !coId) { showToast('Please select a company or choose Individual', 'error'); return false; }
        Object.assign(d, {
          company_mode: 'link',
          company_id: coId || null,
          company_role: document.getElementById('wiz-co-link-role')?.value || 'member'
        });
      } else {
        d.company_mode = 'none';
        d.company_id = null;
      }
      return true;
    }

    case 3: {
      const amount = parseFloat(document.getElementById('wiz-amount')?.value);
      const contDate = g('wiz-cont-date');
      const ownership = parseFloat(document.getElementById('wiz-ownership')?.value) || 0;
      const profitSplit = parseFloat(document.getElementById('wiz-profit-split')?.value) || 0;

      if (v) {
        if (!amount || amount <= 0)               { showToast('Investment amount must be > 0', 'error'); return false; }
        if (!contDate)                            { showToast('Contribution date is required', 'error'); return false; }
        if (ownership < 0 || ownership > 100)     { showToast('Ownership % must be between 0 and 100', 'error'); return false; }
        if (profitSplit < 0 || profitSplit > 100) { showToast('Profit split % must be between 0 and 100', 'error'); return false; }
      }

      Object.assign(d, {
        investment_profile: document.getElementById('wiz-inv-profile')?.value || 'individual',
        capital_source: document.getElementById('wiz-capital-source')?.value || '',
        accredited_investor: gb('wiz-accredited'),
        role: document.getElementById('wiz-role')?.value || 'equity_partner',
        ownership_percentage: ownership,
        profit_split_percentage: profitSplit,
        amount,
        method: document.getElementById('wiz-method')?.value || 'wire',
        contribution_date: contDate,
        evidence_reference: g('wiz-reference')
      });
      return true;
    }

    case 4: {
      Object.assign(d, {
        owner_notes: g('wiz-owner-notes'),
        first_contact_date: document.getElementById('wiz-first-contact')?.value || null,
        signed_agreement: gb('wiz-signed')
      });
      return true;
    }

    default:
      return true;
  }
}

async function _wizSave() {
  if (!_collectStepData(4, true)) return;

  const btn = document.getElementById('wiz-save-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }

  try {
    const mgr = getInvestorManager();
    if (!mgr) { showToast('Manager not ready', 'error'); return; }

    const d = _wiz.data;
    const projectId = InvestorHubState.currentProjectId;

    // 1. Create company if needed
    let companyId = d.company_id || null;
    if (d.company_mode === 'create' && d.company_name) {
      const company = await mgr.createCompany({
        company_name: d.company_name,
        license_number: d.company_ein || '',
        state: d.company_state || '',
        notes: d.company_address || ''
      });
      companyId = company?.id || null;
    }

    // 2. Create investor with all KYC fields
    const investor = await mgr.createInvestor({
      name: `${d.first_name} ${d.last_name}`.trim(),
      first_name: d.first_name || '',
      last_name: d.last_name || '',
      type: companyId ? 'company' : 'person',
      company_id: companyId,
      email: d.email || '',
      phone: d.phone || '',
      address: d.address || '',
      city: d.city || '',
      state_addr: d.state_addr || '',
      zip: d.zip || '',
      entity_type: 'individual',
      investment_profile: d.investment_profile || 'individual',
      accredited_investor: d.accredited_investor || false,
      capital_source: d.capital_source || '',
      signed_agreement: d.signed_agreement || false,
      first_contact_date: d.first_contact_date || null,
      owner_notes: d.owner_notes || '',
      status: 'active'
    });

    if (!investor?.id) {
      showToast('Failed to create investor', 'error');
      if (btn) { btn.disabled = false; btn.textContent = 'Save Investor'; }
      return;
    }

    // 3. Assign investor to project
    const projectInvestor = await mgr.assignInvestorToProject({
      project_id: projectId,
      investor_id: investor.id,
      role: d.role || 'equity_partner',
      ownership_percentage: d.ownership_percentage || 0,
      profit_split_percentage: d.profit_split_percentage || 0,
      status: 'pending'
    });

    if (!projectInvestor?.id) {
      showToast('Investor created but could not assign to project', 'error');
      if (btn) { btn.disabled = false; btn.textContent = 'Save Investor'; }
      return;
    }

    // 4. Record initial capital contribution (correct field names)
    if (d.amount && d.amount > 0) {
      await mgr.recordCapitalContribution({
        project_id: projectId,
        investor_id: investor.id,
        amount: d.amount,
        date: d.contribution_date,
        method: d.method || 'wire',
        type: 'initial',
        status: 'pending',
        evidence_reference: d.evidence_reference || '',
        notes: ''
      });
    }

    showToast('Investor registered successfully', 'success');
    closeAddInvestorModal();

    await loadInvestorHubData(projectId);
    renderInvestorHubTab();

  } catch (error) {
    console.error('Error saving investor:', error);
    showToast('Error: ' + error.message, 'error');
    if (btn) { btn.disabled = false; btn.textContent = 'Save Investor'; }
  }
}

function closeAddInvestorModal() {
  _wiz = { step: 1, totalSteps: 4, companyMode: 'none', companies: [], data: {} };
  const c = document.getElementById('investor-modals-container');
  if (c) c.innerHTML = '';
}

// ============================================================================
// MODAL: Record Capital Contribution (for existing investors)
// ============================================================================

function openRecordCapitalModal(preselectedInvestorId) {
  const projectId = InvestorHubState.currentProjectId;
  if (!projectId) { showToast('No project selected', 'error'); return; }
  if (!InvestorHubState.investors.length) { showToast('No investors in this project yet', 'error'); return; }

  const investorOptions = InvestorHubState.investors
    .filter(inv => inv.status !== 'cancelled')
    .map(inv => `<option value="${inv.investor_id}" ${inv.investor_id === preselectedInvestorId ? 'selected' : ''}>${escapeHtml(inv.investor_name || 'Unknown')}</option>`)
    .join('');

  const today = new Date().toISOString().split('T')[0];

  const modalHTML = `
    <div class="modal-overlay" id="capital-modal-overlay" onclick="if(event.target.id==='capital-modal-overlay')closeRecordCapitalModal()">
      <div class="modal-box" onclick="event.stopPropagation()">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h3 style="margin:0;font-size:15px">Record Capital Contribution</h3>
          <button class="btn btn-ghost" onclick="closeRecordCapitalModal()" style="padding:4px 8px">✕</button>
        </div>
        <form id="form-record-capital" style="display:flex;flex-direction:column;gap:12px">
          <div>
            <label style="${_LBL}">Investor *</label>
            <select id="input-cap-investor" class="form-control" required style="width:100%">
              <option value="">— Select Investor —</option>
              ${investorOptions}
            </select>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div>
              <label style="${_LBL}">Amount ($) *</label>
              <input type="number" id="input-cap-amount" class="form-control" min="0.01" step="0.01" placeholder="e.g. 10000" required style="width:100%">
            </div>
            <div>
              <label style="${_LBL}">Payment Method *</label>
              <select id="input-cap-method" class="form-control" required style="width:100%">
                <option value="wire">Wire Transfer</option>
                <option value="check">Check</option>
                <option value="cash">Cash</option>
                <option value="company_payment">Company Payment</option>
              </select>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div>
              <label style="${_LBL}">Contribution Date *</label>
              <input type="date" id="input-cap-date" class="form-control" value="${today}" required style="width:100%">
            </div>
            <div>
              <label style="${_LBL}">Type *</label>
              <select id="input-cap-type" class="form-control" required style="width:100%">
                <option value="initial">Initial</option>
                <option value="additional">Additional</option>
                <option value="closing">Closing</option>
                <option value="reimbursement">Reimbursement</option>
              </select>
            </div>
          </div>
          <div>
            <label style="${_LBL}">Reference (Check #, Wire ID, etc.)</label>
            <input type="text" id="input-cap-reference" class="form-control" placeholder="Optional" style="width:100%">
          </div>
          <div>
            <label style="${_LBL}">Notes</label>
            <textarea id="input-cap-notes" class="form-control" placeholder="Optional" style="width:100%;min-height:60px"></textarea>
          </div>
          <div style="display:flex;gap:8px;margin-top:8px">
            <button type="button" class="btn btn-secondary" onclick="closeRecordCapitalModal()" style="flex:1">Cancel</button>
            <button type="submit" class="btn btn-primary" style="flex:1">Record Contribution</button>
          </div>
        </form>
      </div>
    </div>
  `;

  let c = document.getElementById('investor-modals-container');
  if (!c) { c = document.createElement('div'); c.id = 'investor-modals-container'; document.body.appendChild(c); }
  c.innerHTML = modalHTML;

  const form = document.getElementById('form-record-capital');
  if (form) form.addEventListener('submit', handleRecordCapitalSubmit);
}

function closeRecordCapitalModal() {
  const c = document.getElementById('investor-modals-container');
  if (c) c.innerHTML = '';
}

async function handleRecordCapitalSubmit(e) {
  e.preventDefault();

  const investorId = document.getElementById('input-cap-investor').value;
  const amount = parseFloat(document.getElementById('input-cap-amount').value);
  const method = document.getElementById('input-cap-method').value;
  const date = document.getElementById('input-cap-date').value;
  const type = document.getElementById('input-cap-type').value;
  const reference = (document.getElementById('input-cap-reference').value || '').trim();
  const notes = (document.getElementById('input-cap-notes').value || '').trim();

  if (!investorId) { showToast('Select an investor', 'error'); return; }
  if (!amount || amount <= 0) { showToast('Amount must be greater than 0', 'error'); return; }
  if (!date) { showToast('Contribution date is required', 'error'); return; }

  try {
    const mgr = getInvestorManager();
    if (!mgr) { showToast('Manager not ready', 'error'); return; }

    const projectId = InvestorHubState.currentProjectId;

    await mgr.recordCapitalContribution({
      project_id: projectId,
      investor_id: investorId,
      amount,
      date,
      method,
      type,
      status: 'pending',
      evidence_reference: reference,
      notes
    });

    showToast('Capital contribution recorded', 'success');
    closeRecordCapitalModal();

    await loadInvestorHubData(projectId);
    renderInvestorHubTab();

  } catch (error) {
    console.error('Error recording capital:', error);
    showToast('Error: ' + error.message, 'error');
  }
}

// ============================================================================
// MODAL: Create Flip Analysis (unchanged from original)
// ============================================================================

function openCreateAnalysisModal() {
  const projectId = InvestorHubState.currentProjectId;
  if (!projectId) { showToast('No project selected', 'error'); return; }

  const modalHTML = `
    <div class="modal-overlay" id="analysis-modal-overlay" onclick="if(event.target.id==='analysis-modal-overlay')closeCreateAnalysisModal()">
      <div class="modal-box" style="max-width:600px" onclick="event.stopPropagation()">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h3 style="margin:0;font-size:15px">Create Flip Analysis</h3>
          <button class="btn btn-ghost" onclick="closeCreateAnalysisModal()" style="padding:4px 8px">✕</button>
        </div>
        <form id="form-create-analysis" style="display:flex;flex-direction:column;gap:12px">
          <fieldset style="border:1px solid var(--border);border-radius:6px;padding:12px;margin-bottom:8px">
            <legend style="font-size:11px;font-weight:700;color:var(--text-secondary);text-transform:uppercase">ACQUISITION</legend>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div>
                <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:2px">Purchase Price ($) *</label>
                <input type="number" id="input-ana-purchase" class="form-control" min="0" step="0.01" required>
              </div>
              <div>
                <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:2px">Earnest Deposit ($) *</label>
                <input type="number" id="input-ana-earnest" class="form-control" min="0" step="0.01" required>
              </div>
              <div style="grid-column:1/-1">
                <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:2px">Closing Costs Entry ($)</label>
                <input type="number" id="input-ana-closing-entry" class="form-control" min="0" step="0.01" value="0">
              </div>
            </div>
          </fieldset>
          <fieldset style="border:1px solid var(--border);border-radius:6px;padding:12px;margin-bottom:8px">
            <legend style="font-size:11px;font-weight:700;color:var(--text-secondary);text-transform:uppercase">LOAN</legend>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div>
                <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:2px">Loan Amount ($) *</label>
                <input type="number" id="input-ana-loan-amount" class="form-control" min="0" step="0.01" required>
              </div>
              <div>
                <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:2px">Annual Rate (%) *</label>
                <input type="number" id="input-ana-loan-rate" class="form-control" min="0" max="20" step="0.01" value="10" required>
              </div>
              <div style="grid-column:1/-1">
                <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:2px">Months *</label>
                <input type="number" id="input-ana-loan-months" class="form-control" min="1" step="1" value="6" required>
              </div>
            </div>
          </fieldset>
          <fieldset style="border:1px solid var(--border);border-radius:6px;padding:12px;margin-bottom:8px">
            <legend style="font-size:11px;font-weight:700;color:var(--text-secondary);text-transform:uppercase">HOLDING (6 MONTHS)</legend>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div>
                <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:2px">Property Taxes ($)</label>
                <input type="number" id="input-ana-taxes" class="form-control" min="0" step="0.01" value="0">
              </div>
              <div>
                <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:2px">Insurance ($)</label>
                <input type="number" id="input-ana-insurance" class="form-control" min="0" step="0.01" value="0">
              </div>
            </div>
          </fieldset>
          <fieldset style="border:1px solid var(--border);border-radius:6px;padding:12px;margin-bottom:8px">
            <legend style="font-size:11px;font-weight:700;color:var(--text-secondary);text-transform:uppercase">REHAB</legend>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div>
                <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:2px">Estimated Repairs ($) *</label>
                <input type="number" id="input-ana-repairs" class="form-control" min="0" step="0.01" required>
              </div>
              <div>
                <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:2px">Contingency (%)</label>
                <input type="number" id="input-ana-contingency" class="form-control" min="0" max="50" step="0.01" value="10">
              </div>
            </div>
          </fieldset>
          <fieldset style="border:1px solid var(--border);border-radius:6px;padding:12px;margin-bottom:8px">
            <legend style="font-size:11px;font-weight:700;color:var(--text-secondary);text-transform:uppercase">SALE</legend>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div>
                <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:2px">ARV ($) *</label>
                <input type="number" id="input-ana-arv" class="form-control" min="0" step="0.01" required>
              </div>
              <div>
                <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:2px">Realtor Commission (%)</label>
                <input type="number" id="input-ana-realtor-pct" class="form-control" min="0" max="10" step="0.01" value="5.5">
              </div>
              <div style="grid-column:1/-1">
                <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:2px">Title &amp; Escrow Exit ($)</label>
                <input type="number" id="input-ana-title-escrow" class="form-control" min="0" step="0.01" value="0">
              </div>
            </div>
          </fieldset>
          <div style="display:flex;gap:8px;margin-top:8px">
            <button type="button" class="btn btn-secondary" onclick="closeCreateAnalysisModal()" style="flex:1">Cancel</button>
            <button type="submit" class="btn btn-primary" style="flex:1">Calculate &amp; Save</button>
          </div>
        </form>
      </div>
    </div>
  `;

  let c = document.getElementById('investor-modals-container');
  if (!c) { c = document.createElement('div'); c.id = 'investor-modals-container'; document.body.appendChild(c); }
  c.innerHTML = modalHTML;

  const form = document.getElementById('form-create-analysis');
  if (form) form.addEventListener('submit', handleCreateAnalysisSubmit);
}

function closeCreateAnalysisModal() {
  const c = document.getElementById('investor-modals-container');
  if (c) c.innerHTML = '';
}

async function handleCreateAnalysisSubmit(e) {
  e.preventDefault();

  const inputs = {
    purchase_price: parseFloat(document.getElementById('input-ana-purchase').value),
    earnest_deposit: parseFloat(document.getElementById('input-ana-earnest').value),
    closing_costs_entry: parseFloat(document.getElementById('input-ana-closing-entry').value) || 0,
    loan_amount: parseFloat(document.getElementById('input-ana-loan-amount').value),
    loan_rate_annual: parseFloat(document.getElementById('input-ana-loan-rate').value),
    loan_months: parseInt(document.getElementById('input-ana-loan-months').value),
    property_taxes_6m: parseFloat(document.getElementById('input-ana-taxes').value) || 0,
    insurance_6m: parseFloat(document.getElementById('input-ana-insurance').value) || 0,
    estimated_repairs: parseFloat(document.getElementById('input-ana-repairs').value),
    contingency_percent: parseFloat(document.getElementById('input-ana-contingency').value) || 10,
    arv: parseFloat(document.getElementById('input-ana-arv').value),
    realtor_commission_percent: parseFloat(document.getElementById('input-ana-realtor-pct').value) || 5.5,
    title_escrow_exit: parseFloat(document.getElementById('input-ana-title-escrow').value) || 0
  };

  const errors = [];
  if (!inputs.purchase_price || inputs.purchase_price <= 0) errors.push('Purchase price must be > 0');
  if (!inputs.loan_amount || inputs.loan_amount <= 0) errors.push('Loan amount must be > 0');
  if (!inputs.arv || inputs.arv <= inputs.purchase_price) errors.push('ARV must be greater than purchase price');
  if (inputs.loan_months <= 0) errors.push('Loan months must be > 0');
  if (errors.length) { showToast(errors.join('; '), 'error'); return; }

  try {
    const mgr = getInvestorManager();
    if (!mgr) { showToast('Manager not ready', 'error'); return; }

    const calculations = await mgr.calculateFlipAnalysis(inputs);
    if (!calculations) { showToast('Failed to calculate analysis', 'error'); return; }

    const projectId = InvestorHubState.currentProjectId;
    const analysis = await mgr.createFlipAnalysis(projectId, inputs, calculations);
    if (!analysis) { showToast('Failed to save analysis', 'error'); return; }

    showToast(`Flip analysis v${analysis.version} created`, 'success');
    closeCreateAnalysisModal();

    await loadInvestorHubData(projectId);
    renderInvestorHubTab();

  } catch (error) {
    console.error('Error creating analysis:', error);
    showToast('Error: ' + error.message, 'error');
  }
}

// ============================================================================
// UTILITY
// ============================================================================

function showToast(message, type = 'info') {
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

window.openAddInvestorModal = openAddInvestorModal;
window.closeAddInvestorModal = closeAddInvestorModal;
window.openRecordCapitalModal = openRecordCapitalModal;
window.closeRecordCapitalModal = closeRecordCapitalModal;
window.openCreateAnalysisModal = openCreateAnalysisModal;
window.closeCreateAnalysisModal = closeCreateAnalysisModal;
window.showToast = showToast;

// Wizard helpers (called from onclick in innerHTML)
window._wizNext = _wizNext;
window._wizBack = _wizBack;
window._wizSave = _wizSave;
window._setCompanyMode = _setCompanyMode;
