// ============================================================================
// INVESTOR HUB — Modals and Form Handlers
// Phase 2B — Complete form submission and modal management
// ============================================================================

// ============================================================================
// MODAL: Add Investor
// ============================================================================

function openAddInvestorModal() {
  const projectId = InvestorHubState.currentProjectId;
  if (!projectId) {
    showToast('No project selected', 'error');
    return;
  }
  
  const modalHTML = `
    <div class="modal-overlay" id="investor-modal-overlay" onclick="closeAddInvestorModal(event)">
      <div class="modal-box" onclick="event.stopPropagation()">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h3 style="margin:0;font-size:15px">Add Investor to Project</h3>
          <button class="btn btn-ghost" onclick="closeAddInvestorModal()" style="padding:4px 8px">✕</button>
        </div>
        
        <form id="form-add-investor" style="display:flex;flex-direction:column;gap:12px">
          
          <div>
            <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Investor Name *</label>
            <input type="text" id="input-inv-name" class="form-control" placeholder="Full name or company name" required style="width:100%">
          </div>
          
          <div>
            <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Type *</label>
            <select id="input-inv-type" class="form-control" required style="width:100%">
              <option value="person">Individual Person</option>
              <option value="company">Company Entity</option>
            </select>
          </div>
          
          <div>
            <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Email</label>
            <input type="email" id="input-inv-email" class="form-control" placeholder="Optional" style="width:100%">
          </div>
          
          <div>
            <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Phone</label>
            <input type="tel" id="input-inv-phone" class="form-control" placeholder="Optional" style="width:100%">
          </div>
          
          <div>
            <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Role in Project *</label>
            <select id="input-inv-role" class="form-control" required style="width:100%">
              <option value="investor">Investor</option>
              <option value="owner">Owner</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div>
              <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Ownership %</label>
              <input type="number" id="input-inv-ownership" class="form-control" min="0" max="100" step="0.01" value="0" style="width:100%">
            </div>
            <div>
              <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Profit Split %</label>
              <input type="number" id="input-inv-profit-split" class="form-control" min="0" max="100" step="0.01" value="0" style="width:100%">
            </div>
          </div>
          
          <div style="display:flex;gap:8px;margin-top:16px">
            <button type="button" class="btn btn-secondary" onclick="closeAddInvestorModal()" style="flex:1">Cancel</button>
            <button type="submit" class="btn btn-primary" style="flex:1">Add Investor</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  // Insert modal into DOM
  let modalContainer = document.getElementById('investor-modals-container');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'investor-modals-container';
    document.body.appendChild(modalContainer);
  }
  modalContainer.innerHTML = modalHTML;
  
  // Add event listener
  const form = document.getElementById('form-add-investor');
  if (form) {
    form.addEventListener('submit', handleAddInvestorSubmit);
  }
}

function closeAddInvestorModal(event) {
  if (event && event.target.id !== 'investor-modal-overlay') return;
  const container = document.getElementById('investor-modals-container');
  if (container) {
    container.innerHTML = '';
  }
}

async function handleAddInvestorSubmit(e) {
  e.preventDefault();
  
  const name = (document.getElementById('input-inv-name').value || '').trim();
  const type = document.getElementById('input-inv-type').value;
  const email = (document.getElementById('input-inv-email').value || '').trim();
  const phone = (document.getElementById('input-inv-phone').value || '').trim();
  const role = document.getElementById('input-inv-role').value;
  const ownership = parseFloat(document.getElementById('input-inv-ownership').value) || 0;
  const profitSplit = parseFloat(document.getElementById('input-inv-profit-split').value) || 0;
  
  // Validation
  if (!name) {
    showToast('Investor name is required', 'error');
    return;
  }
  
  if (ownership < 0 || ownership > 100 || profitSplit < 0 || profitSplit > 100) {
    showToast('Percentages must be between 0 and 100', 'error');
    return;
  }
  
  try {
    const mgr = getInvestorManager();
    if (!mgr) {
      showToast('Manager not ready', 'error');
      return;
    }
    
    // Create investor
    const investor = await mgr.createInvestor({
      name,
      type,
      email: email || null,
      phone: phone || null
    });
    
    if (!investor || !investor.id) {
      showToast('Failed to create investor', 'error');
      return;
    }
    
    // Assign investor to project
    const projectId = InvestorHubState.currentProjectId;
    const projectInvestor = await mgr.assignInvestorToProject({
      project_id: projectId,
      investor_id: investor.id,
      role,
      ownership_percentage: ownership,
      profit_split_percentage: profitSplit
    });
    
    if (!projectInvestor) {
      showToast('Failed to assign investor to project', 'error');
      return;
    }
    
    showToast('Investor added successfully', 'success');
    closeAddInvestorModal();
    
    // Reload investor hub
    await loadInvestorHubData(projectId);
    renderInvestorHubTab();
    
  } catch (error) {
    console.error('Error adding investor:', error);
    showToast('Error: ' + error.message, 'error');
  }
}

// ============================================================================
// MODAL: Record Capital Contribution
// ============================================================================

function openRecordCapitalModal() {
  const projectId = InvestorHubState.currentProjectId;
  if (!projectId) {
    showToast('No project selected', 'error');
    return;
  }
  
  if (!InvestorHubState.investors.length) {
    showToast('No investors in this project yet', 'error');
    return;
  }
  
  // Build investor options
  const investorOptions = InvestorHubState.investors
    .map(inv => `<option value="${inv.investor_id}">${escapeHtml(inv.investor_name)}</option>`)
    .join('');
  
  const modalHTML = `
    <div class="modal-overlay" id="capital-modal-overlay" onclick="closeRecordCapitalModal(event)">
      <div class="modal-box" onclick="event.stopPropagation()">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h3 style="margin:0;font-size:15px">Record Capital Contribution</h3>
          <button class="btn btn-ghost" onclick="closeRecordCapitalModal()" style="padding:4px 8px">✕</button>
        </div>
        
        <form id="form-record-capital" style="display:flex;flex-direction:column;gap:12px">
          
          <div>
            <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Investor *</label>
            <select id="input-cap-investor" class="form-control" required style="width:100%">
              <option value="">— Select Investor —</option>
              ${investorOptions}
            </select>
          </div>
          
          <div>
            <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Amount ($) *</label>
            <input type="number" id="input-cap-amount" class="form-control" min="0.01" step="0.01" placeholder="e.g. 50000" required style="width:100%">
          </div>
          
          <div>
            <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Contribution Date *</label>
            <input type="date" id="input-cap-date" class="form-control" required style="width:100%">
          </div>
          
          <div>
            <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Contribution Type *</label>
            <select id="input-cap-type" class="form-control" required style="width:100%">
              <option value="initial">Initial</option>
              <option value="mid-project">Mid-Project</option>
              <option value="closing">Closing</option>
            </select>
          </div>
          
          <div>
            <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Reference (Check #, Wire ID, etc)</label>
            <input type="text" id="input-cap-reference" class="form-control" placeholder="Optional" style="width:100%">
          </div>
          
          <div>
            <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">Notes</label>
            <textarea id="input-cap-notes" class="form-control" placeholder="Optional notes about this contribution" style="width:100%;min-height:60px"></textarea>
          </div>
          
          <div style="display:flex;gap:8px;margin-top:16px">
            <button type="button" class="btn btn-secondary" onclick="closeRecordCapitalModal()" style="flex:1">Cancel</button>
            <button type="submit" class="btn btn-primary" style="flex:1">Record Contribution</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  let modalContainer = document.getElementById('investor-modals-container');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'investor-modals-container';
    document.body.appendChild(modalContainer);
  }
  modalContainer.innerHTML = modalHTML;
  
  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('input-cap-date');
  if (dateInput) {
    dateInput.value = today;
  }
  
  const form = document.getElementById('form-record-capital');
  if (form) {
    form.addEventListener('submit', handleRecordCapitalSubmit);
  }
}

function closeRecordCapitalModal(event) {
  if (event && event.target.id !== 'capital-modal-overlay') return;
  const container = document.getElementById('investor-modals-container');
  if (container) {
    container.innerHTML = '';
  }
}

async function handleRecordCapitalSubmit(e) {
  e.preventDefault();
  
  const investorId = document.getElementById('input-cap-investor').value;
  const amount = parseFloat(document.getElementById('input-cap-amount').value);
  const date = document.getElementById('input-cap-date').value;
  const type = document.getElementById('input-cap-type').value;
  const reference = (document.getElementById('input-cap-reference').value || '').trim();
  const notes = (document.getElementById('input-cap-notes').value || '').trim();
  
  // Validation
  if (!investorId) {
    showToast('Select an investor', 'error');
    return;
  }
  
  if (!amount || amount <= 0) {
    showToast('Amount must be greater than 0', 'error');
    return;
  }
  
  if (!date) {
    showToast('Contribution date is required', 'error');
    return;
  }
  
  try {
    const mgr = getInvestorManager();
    if (!mgr) {
      showToast('Manager not ready', 'error');
      return;
    }
    
    const projectId = InvestorHubState.currentProjectId;
    
    // Find project_investor record
    const projectInvestor = InvestorHubState.investors.find(inv => inv.investor_id === investorId);
    if (!projectInvestor) {
      showToast('Investor not found in project', 'error');
      return;
    }
    
    // Record contribution
    const contribution = await mgr.recordCapitalContribution({
      project_id: projectId,
      project_investor_id: projectInvestor.id,
      amount,
      contribution_date: date,
      contribution_type: type,
      reference: reference || null,
      notes: notes || null
    });
    
    if (!contribution) {
      showToast('Failed to record contribution', 'error');
      return;
    }
    
    showToast('Capital contribution recorded', 'success');
    closeRecordCapitalModal();
    
    // Reload investor hub
    await loadInvestorHubData(projectId);
    renderInvestorHubTab();
    
  } catch (error) {
    console.error('Error recording capital:', error);
    showToast('Error: ' + error.message, 'error');
  }
}

// ============================================================================
// MODAL: Create Flip Analysis
// ============================================================================

function openCreateAnalysisModal() {
  const projectId = InvestorHubState.currentProjectId;
  if (!projectId) {
    showToast('No project selected', 'error');
    return;
  }
  
  const modalHTML = `
    <div class="modal-overlay" id="analysis-modal-overlay" onclick="closeCreateAnalysisModal(event)">
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
              <div colspan="2" style="grid-column:1/-1">
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
              <div colspan="2" style="grid-column:1/-1">
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
              <div colspan="2" style="grid-column:1/-1">
                <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:2px">Title & Escrow Exit ($)</label>
                <input type="number" id="input-ana-title-escrow" class="form-control" min="0" step="0.01" value="0">
              </div>
            </div>
          </fieldset>
          
          <div style="display:flex;gap:8px;margin-top:16px">
            <button type="button" class="btn btn-secondary" onclick="closeCreateAnalysisModal()" style="flex:1">Cancel</button>
            <button type="submit" class="btn btn-primary" style="flex:1">Calculate & Save</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  let modalContainer = document.getElementById('investor-modals-container');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'investor-modals-container';
    document.body.appendChild(modalContainer);
  }
  modalContainer.innerHTML = modalHTML;
  
  const form = document.getElementById('form-create-analysis');
  if (form) {
    form.addEventListener('submit', handleCreateAnalysisSubmit);
  }
}

function closeCreateAnalysisModal(event) {
  if (event && event.target.id !== 'analysis-modal-overlay') return;
  const container = document.getElementById('investor-modals-container');
  if (container) {
    container.innerHTML = '';
  }
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
  
  // Validation
  const validation = {
    isValid: true,
    errors: []
  };
  
  if (!inputs.purchase_price || inputs.purchase_price <= 0) {
    validation.errors.push('Purchase price must be > 0');
  }
  if (!inputs.earnest_deposit || inputs.earnest_deposit < 0) {
    validation.errors.push('Earnest deposit must be >= 0');
  }
  if (!inputs.loan_amount || inputs.loan_amount <= 0) {
    validation.errors.push('Loan amount must be > 0');
  }
  if (!inputs.arv || inputs.arv <= inputs.purchase_price) {
    validation.errors.push('ARV must be greater than purchase price');
  }
  if (inputs.loan_months <= 0) {
    validation.errors.push('Loan months must be > 0');
  }
  
  if (validation.errors.length > 0) {
    showToast(validation.errors.join('; '), 'error');
    return;
  }
  
  try {
    const mgr = getInvestorManager();
    if (!mgr) {
      showToast('Manager not ready', 'error');
      return;
    }
    
    // Calculate analysis
    const calculations = await mgr.calculateFlipAnalysis(inputs);
    if (!calculations) {
      showToast('Failed to calculate analysis', 'error');
      return;
    }
    
    // Save analysis
    const projectId = InvestorHubState.currentProjectId;
    const analysis = await mgr.createFlipAnalysis(projectId, inputs, calculations);
    
    if (!analysis) {
      showToast('Failed to save analysis', 'error');
      return;
    }
    
    showToast(`Flip analysis v${analysis.version} created successfully`, 'success');
    closeCreateAnalysisModal();
    
    // Reload investor hub
    await loadInvestorHubData(projectId);
    renderInvestorHubTab();
    
  } catch (error) {
    console.error('Error creating analysis:', error);
    showToast('Error: ' + error.message, 'error');
  }
}

// ============================================================================
// UTILITY: Toast notifications
// ============================================================================

function showToast(message, type = 'info') {
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
// EXPORT: Make functions global
// ============================================================================

window.openAddInvestorModal = openAddInvestorModal;
window.closeAddInvestorModal = closeAddInvestorModal;
window.openRecordCapitalModal = openRecordCapitalModal;
window.closeRecordCapitalModal = closeRecordCapitalModal;
window.openCreateAnalysisModal = openCreateAnalysisModal;
window.closeCreateAnalysisModal = closeCreateAnalysisModal;
window.showToast = showToast;
