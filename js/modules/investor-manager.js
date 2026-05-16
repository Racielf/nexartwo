// ============================================================================
// NEXARTWO PHASE 2B — INVESTOR HUB LOGIC
// JavaScript Management Layer
// Date: Mayo 2026
// ============================================================================

// ============================================================================
// MODULE: InvestorManager
// Purpose: Gestionar inversores, aportes de capital, y análisis de flips
// ============================================================================

class InvestorManager {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
  }

  // ===========================================================================
  // SECTION 1: INVESTOR MANAGEMENT
  // ===========================================================================

  /**
   * Crear nuevo inversor
   * @param {Object} data - {name, type, email, phone, tax_id, tax_notes}
   * @returns {Object} - Investor object con id
   */
  async createInvestor(data) {
    const { data: investor, error } = await this.supabase
      .from('investors')
      .insert([{
        name: data.name,
        type: data.type, // 'person' | 'company'
        email: data.email || null,
        phone: data.phone || null,
        tax_id: data.tax_id || null,
        tax_notes: data.tax_notes || null,
        status: 'active'
      }])
      .select()
      .single();

    if (error) throw new Error(`Failed to create investor: ${error.message}`);
    return investor;
  }

  /**
   * Obtener inversor por ID
   */
  async getInvestor(investorId) {
    const { data, error } = await this.supabase
      .from('investors')
      .select('*')
      .eq('id', investorId)
      .single();

    if (error) throw new Error(`Failed to fetch investor: ${error.message}`);
    return data;
  }

  /**
   * Listar todos los inversores
   */
  async listInvestors(filters = {}) {
    let query = this.supabase.from('investors').select('*');

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to list investors: ${error.message}`);
    return data;
  }

  /**
   * Actualizar inversor
   */
  async updateInvestor(investorId, data) {
    const { data: updated, error } = await this.supabase
      .from('investors')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', investorId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update investor: ${error.message}`);
    return updated;
  }

  // ===========================================================================
  // SECTION 2: PROJECT INVESTOR ASSIGNMENT
  // ===========================================================================

  /**
   * Asignar inversor a un proyecto
   * @param {Object} data - {project_id, investor_id, role, ownership_percentage, profit_split_percentage}
   * @returns {Object} - project_investor entry
   */
  async assignInvestorToProject(data) {
    const { data: projectInvestor, error } = await this.supabase
      .from('project_investors')
      .insert([{
        project_id: data.project_id,
        investor_id: data.investor_id,
        role: data.role, // 'investor' | 'owner' | 'manager'
        ownership_percentage: data.ownership_percentage || 0,
        profit_split_percentage: data.profit_split_percentage || 0,
        status: 'active'
      }])
      .select()
      .single();

    if (error) throw new Error(`Failed to assign investor: ${error.message}`);
    return projectInvestor;
  }

  /**
   * Obtener todos los inversores de un proyecto (con detalles)
   */
  async getProjectInvestors(projectId) {
    // Usar RPC: get_project_investor_summary
    const { data, error } = await this.supabase
      .rpc('get_project_investor_summary', {
        p_project_id: projectId
      });

    if (error) throw new Error(`Failed to fetch project investors: ${error.message}`);
    return data;
  }

  /**
   * Obtener resumen de inversor específico en proyecto
   */
  async getInvestorSummary(projectId, investorId) {
    // Usar RPC: get_investor_capital_summary
    const { data, error } = await this.supabase
      .rpc('get_investor_capital_summary', {
        p_project_id: projectId,
        p_investor_id: investorId
      });

    if (error) throw new Error(`Failed to fetch investor summary: ${error.message}`);
    return data?.[0] || null;
  }

  // ===========================================================================
  // SECTION 3: CAPITAL CONTRIBUTIONS
  // ===========================================================================

  /**
   * Registrar aporte de capital
   * @param {Object} data - {project_investor_id, amount, contribution_date, contribution_type, reference, notes}
   * @returns {Object} - capital_contributions entry
   */
  async recordCapitalContribution(data) {
    const { data: contribution, error } = await this.supabase
      .from('capital_contributions')
      .insert([{
        project_investor_id: data.project_investor_id,
        project_id: data.project_id, // Necesario para integridad
        amount: data.amount,
        contribution_date: data.contribution_date,
        contribution_type: data.contribution_type, // 'initial' | 'mid-project' | 'closing'
        reference: data.reference || null,
        notes: data.notes || null,
        status: 'received'
      }])
      .select()
      .single();

    if (error) throw new Error(`Failed to record contribution: ${error.message}`);
    return contribution;
  }

  /**
   * Obtener todos los aportes de capital de un proyecto
   */
  async getCapitalContributions(projectId) {
    const { data, error } = await this.supabase
      .from('capital_contributions')
      .select(`
        *,
        project_investor:project_investor_id (
          investor:investor_id (name, email)
        )
      `)
      .eq('project_id', projectId)
      .order('contribution_date', { ascending: false });

    if (error) throw new Error(`Failed to fetch contributions: ${error.message}`);
    return data;
  }

  /**
   * Obtener total de capital aportado en un proyecto
   */
  async getTotalCapitalContributed(projectId) {
    const { data, error } = await this.supabase
      .from('capital_contributions')
      .select('amount')
      .eq('project_id', projectId)
      .eq('status', 'received');

    if (error) throw new Error(`Failed to calculate total capital: ${error.message}`);

    const total = data.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
    return total;
  }

  // ===========================================================================
  // SECTION 4: FLIP ANALYSIS CALCULATIONS
  // ===========================================================================

  /**
   * Calcular análisis de flip usando RPC
   * Retorna todos los cálculos necesarios
   */
  async calculateFlipAnalysis(inputs) {
    // Usar RPC: calculate_flip_analysis
    const { data, error } = await this.supabase
      .rpc('calculate_flip_analysis', {
        p_purchase_price: inputs.purchase_price,
        p_earnest_deposit: inputs.earnest_deposit,
        p_closing_costs_entry: inputs.closing_costs_entry,
        p_loan_amount: inputs.loan_amount,
        p_loan_rate_annual: inputs.loan_rate_annual,
        p_loan_months: inputs.loan_months,
        p_property_taxes_6m: inputs.property_taxes_6m,
        p_insurance_6m: inputs.insurance_6m,
        p_estimated_repairs: inputs.estimated_repairs,
        p_contingency_percent: inputs.contingency_percent,
        p_arv: inputs.arv,
        p_realtor_commission_percent: inputs.realtor_commission_percent,
        p_title_escrow_exit: inputs.title_escrow_exit
      });

    if (error) throw new Error(`Failed to calculate analysis: ${error.message}`);
    return data?.[0] || null; // RPC retorna array, tomar primer resultado
  }

  /**
   * Crear nuevo análisis de flip en base de datos
   */
  async createFlipAnalysis(projectId, inputs, calculations) {
    // Primero obtener la versión actual (si existe)
    const { data: existingAnalyses } = await this.supabase
      .from('flip_analyses')
      .select('version')
      .eq('project_id', projectId)
      .order('version', { ascending: false })
      .limit(1);

    const nextVersion = existingAnalyses && existingAnalyses.length > 0 
      ? existingAnalyses[0].version + 1 
      : 1;

    // Crear nuevo análisis
    const { data: analysis, error } = await this.supabase
      .from('flip_analyses')
      .insert([{
        project_id: projectId,
        version: nextVersion,
        analysis_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        
        // Inputs (lo que el usuario ingresó)
        purchase_price: inputs.purchase_price,
        earnest_deposit: inputs.earnest_deposit,
        closing_costs_entry: inputs.closing_costs_entry,
        loan_amount: inputs.loan_amount,
        loan_rate_annual: inputs.loan_rate_annual,
        loan_months: inputs.loan_months,
        property_taxes_6m: inputs.property_taxes_6m,
        insurance_6m: inputs.insurance_6m,
        estimated_repairs: inputs.estimated_repairs,
        contingency_percent: inputs.contingency_percent,
        arv: inputs.arv,
        realtor_commission_percent: inputs.realtor_commission_percent,
        title_escrow_exit: inputs.title_escrow_exit,
        
        // Calculated results
        total_all_in_cost: calculations.total_all_in_cost,
        calculated_interest: calculations.calculated_interest,
        contingency_amount: calculations.contingency_amount,
        realtor_commission: calculations.realtor_commission,
        net_proceeds: calculations.net_proceeds,
        gross_profit: calculations.gross_profit,
        net_profit: calculations.net_profit,
        roi_percent: calculations.roi_percent,
        profit_margin: calculations.profit_margin,
        
        status: 'draft',
        notes: null
      }])
      .select()
      .single();

    if (error) throw new Error(`Failed to save analysis: ${error.message}`);
    return analysis;
  }

  /**
   * Obtener historial de análisis de un proyecto
   */
  async getFlipAnalysisHistory(projectId) {
    // Usar RPC: get_flip_analyses_history
    const { data, error } = await this.supabase
      .rpc('get_flip_analyses_history', {
        p_project_id: projectId
      });

    if (error) throw new Error(`Failed to fetch analysis history: ${error.message}`);
    return data;
  }

  /**
   * Obtener último análisis (versión más reciente)
   */
  async getLatestFlipAnalysis(projectId) {
    const { data, error } = await this.supabase
      .from('flip_analyses')
      .select('*')
      .eq('project_id', projectId)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found (normal si no hay análisis)
      throw new Error(`Failed to fetch latest analysis: ${error.message}`);
    }

    return data || null;
  }

  /**
   * Actualizar análisis existente (cambiar status, notas, etc)
   */
  async updateFlipAnalysis(analysisId, updates) {
    const { data, error } = await this.supabase
      .from('flip_analyses')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', analysisId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update analysis: ${error.message}`);
    return data;
  }

  // ===========================================================================
  // SECTION 5: FLIP ANALYSIS SENSITIVITY ANALYSIS
  // ===========================================================================

  /**
   * Ejecutar análisis de sensibilidad para diferentes timelines
   * Retorna profit para 2, 6, 12 meses
   */
  async sensitivityAnalysis(inputs) {
    const timelines = [2, 6, 12]; // Meses
    const results = {};

    for (const months of timelines) {
      const adjusted = {
        ...inputs,
        loan_months: months
      };

      const calc = await this.calculateFlipAnalysis(adjusted);
      results[months] = {
        months,
        interest: calc.calculated_interest,
        total_cost: calc.total_all_in_cost,
        profit: calc.net_profit,
        roi: calc.roi_percent
      };
    }

    return results;
  }

  // ===========================================================================
  // SECTION 6: PROFIT DISTRIBUTION (Para Phase 2E, pero preparar ahora)
  // ===========================================================================

  /**
   * Calcular distribución de ganancias entre inversores
   * Basado en ownership_percentage y profit_split_percentage
   */
  async calculateProfitDistribution(projectId, totalProfit) {
    const investors = await this.getProjectInvestors(projectId);

    const distribution = investors.map(inv => ({
      investor_name: inv.investor_name,
      investor_id: inv.investor_id,
      total_capital: inv.total_capital,
      ownership_percent: inv.ownership_percent,
      profit_split_percent: inv.profit_split_percent,
      
      // Su parte de ganancias
      profit_share: (totalProfit * inv.profit_split_percent) / 100,
      
      // Su retorno total (capital + profit)
      total_return: inv.total_capital + ((totalProfit * inv.profit_split_percent) / 100)
    }));

    return distribution;
  }

  // ===========================================================================
  // SECTION 7: VALIDATION HELPERS
  // ===========================================================================

  /**
   * Validar que los inputs del análisis de flip son válidos
   */
  validateFlipInputs(inputs) {
    const errors = [];

    if (!inputs.purchase_price || inputs.purchase_price <= 0) {
      errors.push('Purchase price must be > 0');
    }
    if (!inputs.loan_amount || inputs.loan_amount <= 0) {
      errors.push('Loan amount must be > 0');
    }
    if (!inputs.arv || inputs.arv <= inputs.purchase_price) {
      errors.push('ARV must be greater than purchase price');
    }
    if (!inputs.loan_months || inputs.loan_months <= 0) {
      errors.push('Loan months must be > 0');
    }
    if (inputs.loan_rate_annual < 0 || inputs.loan_rate_annual > 20) {
      errors.push('Loan rate should be between 0% and 20%');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// ============================================================================
// EXPORT
// ============================================================================

// Para usar en NexArtWO:
// import { InvestorManager } from './modules/investor-manager.js';
// const investorMgr = new InvestorManager(supabaseClient);
// await investorMgr.createInvestor({...});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = InvestorManager;
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*

// EJEMPLO 1: Crear inversor
const investor = await investorMgr.createInvestor({
  name: 'Rodolfo Fernandez',
  type: 'person',
  email: 'rodolfo@example.com',
  phone: '503-936-6172'
});
console.log('Investor created:', investor.id);

// EJEMPLO 2: Asignar a proyecto
const projectInvestor = await investorMgr.assignInvestorToProject({
  project_id: 'project-gresham-001',
  investor_id: investor.id,
  role: 'owner',
  ownership_percentage: 100,
  profit_split_percentage: 100
});

// EJEMPLO 3: Registrar aporte de capital
const contribution = await investorMgr.recordCapitalContribution({
  project_id: 'project-gresham-001',
  project_investor_id: projectInvestor.id,
  amount: 6600,
  contribution_date: '2026-05-15',
  contribution_type: 'initial',
  reference: 'Wire transfer XXX'
});

// EJEMPLO 4: Calcular análisis de flip
const inputs = {
  purchase_price: 330000,
  earnest_deposit: 6600,
  closing_costs_entry: 6500,
  loan_amount: 323400,
  loan_rate_annual: 10,
  loan_months: 6,
  property_taxes_6m: 1250,
  insurance_6m: 1200,
  estimated_repairs: 30350,
  contingency_percent: 10,
  arv: 450000,
  realtor_commission_percent: 5.5,
  title_escrow_exit: 9000
};

// Validar inputs
const validation = investorMgr.validateFlipInputs(inputs);
if (!validation.isValid) {
  console.error('Invalid inputs:', validation.errors);
}

// Calcular
const calculations = await investorMgr.calculateFlipAnalysis(inputs);
console.log('Flip Analysis:', {
  roi: calculations.roi_percent + '%',
  profit: '$' + calculations.net_profit.toFixed(2),
  timeline: '6 months'
});

// EJEMPLO 5: Guardar análisis
const analysis = await investorMgr.createFlipAnalysis(
  'project-gresham-001',
  inputs,
  calculations
);
console.log('Analysis saved as v' + analysis.version);

// EJEMPLO 6: Análisis de sensibilidad
const sensitivity = await investorMgr.sensitivityAnalysis(inputs);
console.log('Sensitivity Analysis:', sensitivity);
// {
//   2: { months: 2, interest: 5390, total_cost: 388695, profit: 30555, roi: 463% },
//   6: { months: 6, interest: 16170, total_cost: 397505, profit: 21145, roi: 320% },
//   12: { months: 12, interest: 32340, total_cost: 413675, profit: 5575, roi: 84% }
// }

// EJEMPLO 7: Distribución de ganancias
const distribution = await investorMgr.calculateProfitDistribution(
  'project-gresham-001',
  21145 // net profit
);
console.log('Profit Distribution:', distribution);
// [
//   {
//     investor_name: 'Rodolfo Fernandez',
//     profit_share: 21145,
//     total_return: 27745
//   }
// ]

*/
