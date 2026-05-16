# PHASE 2B — IMPLEMENTATION PLAN
**NexArtWO — Investor Hub Integration**  
**Fecha:** Mayo 2026  
**Status:** READY FOR EXECUTION

---

## 🎯 OBJETIVO

Implementar Investor Hub en NexArtWO permitiendo:
1. Registrar inversionistas
2. Asignarlos a proyectos
3. Registrar aportes de capital
4. Crear análisis de flips con cálculos automáticos
5. Versionar análisis (v1, v2, v3...)
6. Visualizar ROI y ganancias esperadas

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### PASO 1: Deploying SQL Schema (1-2 horas)

```
[ ] Conectar a Supabase (proyecto: udaeifoibydcokefcmbg)
[ ] Copiar contenido de PHASE_2B_SCHEMA.sql
[ ] Pegarlo en Supabase → SQL Editor
[ ] Ejecutar (Run)
[ ] Verificar que no hay errores
[ ] Confirmar que las 5 tablas existen:
    [ ] investors
    [ ] investor_companies
    [ ] project_investors
    [ ] capital_contributions
    [ ] flip_analyses
[ ] Confirmar que los 4 RPCs existen:
    [ ] calculate_flip_analysis
    [ ] get_flip_analyses_history
    [ ] get_investor_capital_summary
    [ ] get_project_investor_summary
```

---

### PASO 2: Agregar JavaScript al Proyecto (30 min)

```
En el repo NexArtWO:

[ ] Crear archivo: js/modules/investor-manager.js
[ ] Copiar contenido de PHASE_2B_INVESTOR_MANAGER.js
[ ] En js/app.js o js/projects.js, importar:

    import InvestorManager from './modules/investor-manager.js';

[ ] Instanciar en supabase.js:
    
    window.investorMgr = new InvestorManager(supabaseClient);

[ ] Verificar que está disponible globalmente
```

---

### PASO 3: Crear UI en NexArtWO (4-6 horas)

#### 3.1 - Nuevo Tab "Investor Hub" en projects.html

```html
<!-- En projects.html, agregar nuevo tab dentro de project detail -->

<div id="investor-hub-tab" class="tab-pane">
  <div class="investor-hub-container">
    
    <!-- SECTION A: Investor Assignment -->
    <div class="section">
      <h3>Project Investors</h3>
      <button id="btn-add-investor">+ Add Investor</button>
      <table id="investors-table">
        <!-- Listar: investor name, role, ownership%, capital contributed -->
      </table>
    </div>

    <!-- SECTION B: Capital Contributions -->
    <div class="section">
      <h3>Capital Contributions</h3>
      <button id="btn-record-capital">+ Record Contribution</button>
      <table id="contributions-table">
        <!-- Listar: investor, amount, date, type, status -->
      </table>
      <div id="capital-summary">Total Contributed: $0</div>
    </div>

    <!-- SECTION C: Flip Analysis -->
    <div class="section">
      <h3>Flip Analysis & ROI</h3>
      <button id="btn-new-analysis">+ Create New Analysis</button>
      
      <!-- Mostrar última versión -->
      <div id="current-analysis" class="analysis-card">
        <!-- Version, date, key metrics: ARV, Total Cost, Profit, ROI -->
      </div>
      
      <!-- Historial de versiones -->
      <div id="analysis-history">
        <!-- v1, v2, v3... con compare option -->
      </div>
    </div>

  </div>
</div>
```

#### 3.2 - Modal para Crear Análisis de Flip

```html
<div id="modal-new-analysis" class="modal">
  <h3>Create Flip Analysis</h3>
  
  <!-- INPUTS -->
  <form id="form-flip-analysis">
    
    <!-- ACQUISITION -->
    <fieldset>
      <legend>Acquisition Phase</legend>
      <input type="number" id="input-purchase-price" placeholder="Purchase Price" required />
      <input type="number" id="input-earnest-deposit" placeholder="Earnest Deposit" required />
      <input type="number" id="input-closing-entry" placeholder="Closing Costs (Entry)" />
    </fieldset>

    <!-- LOAN -->
    <fieldset>
      <legend>Hard Money Loan</legend>
      <input type="number" id="input-loan-amount" placeholder="Loan Amount" required />
      <input type="number" id="input-loan-rate" placeholder="Annual Rate (%)" required />
      <input type="number" id="input-loan-months" placeholder="Months" required />
      <span id="calc-interest">Interest: $0</span>
    </fieldset>

    <!-- HOLDING -->
    <fieldset>
      <legend>Holding Costs (6 months)</legend>
      <input type="number" id="input-taxes" placeholder="Property Taxes" />
      <input type="number" id="input-insurance" placeholder="Insurance" />
    </fieldset>

    <!-- REHAB -->
    <fieldset>
      <legend>Rehabilitation</legend>
      <input type="number" id="input-repairs" placeholder="Estimated Repairs" required />
      <input type="number" id="input-contingency" placeholder="Contingency (%)" value="10" />
      <span id="calc-contingency">Contingency: $0</span>
    </fieldset>

    <!-- SALE -->
    <fieldset>
      <legend>Sale Phase</legend>
      <input type="number" id="input-arv" placeholder="After Repair Value (ARV)" required />
      <input type="number" id="input-realtor-percent" placeholder="Realtor Commission (%)" value="5.5" />
      <input type="number" id="input-title-escrow" placeholder="Title & Escrow (Exit)" />
    </fieldset>

    <button type="button" id="btn-calculate">Calculate Analysis</button>
    <button type="submit" id="btn-save-analysis">Save Analysis</button>

  </form>

  <!-- RESULTS PREVIEW -->
  <div id="analysis-results" style="display:none">
    <h4>Analysis Results</h4>
    
    <!-- Key Metrics -->
    <div class="metric-row">
      <span class="label">Total All-In Cost:</span>
      <span id="result-total-cost">$0</span>
    </div>
    <div class="metric-row">
      <span class="label">Sale Proceeds:</span>
      <span id="result-net-proceeds">$0</span>
    </div>
    <div class="metric-row">
      <span class="label">Gross Profit:</span>
      <span id="result-gross-profit">$0</span>
    </div>
    <div class="metric-row highlight">
      <span class="label">NET PROFIT:</span>
      <span id="result-net-profit">$0</span>
    </div>
    <div class="metric-row highlight">
      <span class="label">ROI (%):</span>
      <span id="result-roi">0%</span>
    </div>
    <div class="metric-row">
      <span class="label">Profit Margin:</span>
      <span id="result-margin">0%</span>
    </div>

  </div>

</div>
```

#### 3.3 - Modal para Registrar Capital

```html
<div id="modal-record-capital" class="modal">
  <h3>Record Capital Contribution</h3>
  
  <form id="form-capital-contribution">
    <select id="select-investor" required>
      <option>Select Investor...</option>
      <!-- Populated from database -->
    </select>
    
    <input type="number" id="input-amount" placeholder="Amount" required />
    <input type="date" id="input-date" required />
    
    <select id="select-contribution-type" required>
      <option value="initial">Initial</option>
      <option value="mid-project">Mid-Project</option>
      <option value="closing">Closing</option>
    </select>
    
    <input type="text" id="input-reference" placeholder="Reference (Check #, Wire ID)" />
    <textarea id="input-notes" placeholder="Notes"></textarea>
    
    <button type="submit">Record Contribution</button>
  </form>
</div>
```

---

### PASO 4: Implementar Lógica JavaScript (6-8 horas)

#### 4.1 - Cargar Inversores en la UI

```javascript
// En projects.js, cuando se carga un proyecto:

async function loadInvestorHub(projectId) {
  try {
    // 1. Obtener inversores del proyecto
    const investors = await investorMgr.getProjectInvestors(projectId);
    displayInvestors(investors); // Mostrar en tabla
    
    // 2. Obtener aportes de capital
    const contributions = await investorMgr.getCapitalContributions(projectId);
    displayContributions(contributions); // Mostrar en tabla
    
    // 3. Calcular total capital
    const totalCapital = await investorMgr.getTotalCapitalContributed(projectId);
    document.getElementById('capital-summary').innerText = 
      `Total Contributed: $${totalCapital.toFixed(2)}`;
    
    // 4. Obtener último análisis
    const analysis = await investorMgr.getLatestFlipAnalysis(projectId);
    if (analysis) {
      displayCurrentAnalysis(analysis);
    }
    
    // 5. Obtener historial
    const history = await investorMgr.getFlipAnalysisHistory(projectId);
    displayAnalysisHistory(history);
    
  } catch (error) {
    console.error('Error loading investor hub:', error);
  }
}
```

#### 4.2 - Crear Nuevo Análisis

```javascript
// En el modal de nuevo análisis:

document.getElementById('btn-calculate').addEventListener('click', async () => {
  // Validar inputs
  const inputs = collectFlipInputs(); // Recopilar del formulario
  
  const validation = investorMgr.validateFlipInputs(inputs);
  if (!validation.isValid) {
    alert('Errors:\n' + validation.errors.join('\n'));
    return;
  }
  
  // Calcular
  try {
    const calcs = await investorMgr.calculateFlipAnalysis(inputs);
    
    // Mostrar resultados
    document.getElementById('result-total-cost').innerText = 
      '$' + calcs.total_all_in_cost.toFixed(2);
    document.getElementById('result-net-proceeds').innerText = 
      '$' + calcs.net_proceeds.toFixed(2);
    document.getElementById('result-gross-profit').innerText = 
      '$' + calcs.gross_profit.toFixed(2);
    document.getElementById('result-net-profit').innerText = 
      '$' + calcs.net_profit.toFixed(2);
    document.getElementById('result-roi').innerText = 
      calcs.roi_percent.toFixed(2) + '%';
    document.getElementById('result-margin').innerText = 
      calcs.profit_margin.toFixed(2) + '%';
    
    // Guardar cálculos globalmente para luego guardar
    window.currentFlipCalculations = calcs;
    
    // Mostrar resultados
    document.getElementById('analysis-results').style.display = 'block';
    
  } catch (error) {
    console.error('Calculation error:', error);
    alert('Error: ' + error.message);
  }
});

// Guardar análisis
document.getElementById('btn-save-analysis').addEventListener('click', async () => {
  const inputs = collectFlipInputs();
  const calculations = window.currentFlipCalculations;
  
  if (!calculations) {
    alert('Please calculate first');
    return;
  }
  
  try {
    const analysis = await investorMgr.createFlipAnalysis(
      window.currentProjectId,
      inputs,
      calculations
    );
    
    alert(`Analysis saved as v${analysis.version}`);
    
    // Recargar Investor Hub
    await loadInvestorHub(window.currentProjectId);
    
    // Cerrar modal
    closeModal('modal-new-analysis');
    
  } catch (error) {
    console.error('Save error:', error);
    alert('Error: ' + error.message);
  }
});
```

#### 4.3 - Registrar Aporte de Capital

```javascript
// Manejar form de capital contribution

document.getElementById('form-capital-contribution').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const investorId = document.getElementById('select-investor').value;
  const amount = parseFloat(document.getElementById('input-amount').value);
  const date = document.getElementById('input-date').value;
  const type = document.getElementById('select-contribution-type').value;
  
  try {
    // Obtener project_investor_id
    const projectInvestor = await getProjectInvestor(
      window.currentProjectId,
      investorId
    );
    
    // Registrar
    await investorMgr.recordCapitalContribution({
      project_id: window.currentProjectId,
      project_investor_id: projectInvestor.id,
      amount,
      contribution_date: date,
      contribution_type: type,
      reference: document.getElementById('input-reference').value,
      notes: document.getElementById('input-notes').value
    });
    
    alert('Contribution recorded');
    
    // Recargar
    await loadInvestorHub(window.currentProjectId);
    closeModal('modal-record-capital');
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error: ' + error.message);
  }
});
```

---

### PASO 5: Testing (2-3 horas)

#### Test Case 1: Crear Inversor

```
[ ] Abrir projects.html
[ ] Seleccionar proyecto "Gresham 2906"
[ ] Click "Add Investor"
[ ] Crear nuevo inversor: "Rodolfo Fernandez"
[ ] Asignar: ownership 100%, profit_split 100%
[ ] Verificar: Aparece en tabla
```

#### Test Case 2: Registrar Capital

```
[ ] Click "Record Capital"
[ ] Seleccionar inversor "Rodolfo"
[ ] Ingresar: $6,600
[ ] Fecha: 2026-05-15
[ ] Tipo: initial
[ ] Guardar
[ ] Verificar: Total capital = $6,600
```

#### Test Case 3: Crear Análisis

```
[ ] Click "Create New Analysis"
[ ] Ingresar inputs (Gresham example):
    Purchase Price: 330000
    Loan Amount: 323400
    Loan Rate: 10
    Months: 6
    Repairs: 30350
    ARV: 450000
[ ] Click "Calculate"
[ ] Verificar resultados:
    ROI: 320%
    Profit: $21,145
[ ] Click "Save"
[ ] Verificar: Analysis v1 guardado
```

#### Test Case 4: Análisis de Sensibilidad

```
[ ] En modal, cambiar Months a 2
[ ] Click "Calculate"
[ ] Verificar: Profit sube a ~$30,555
[ ] Cambiar a 12 meses
[ ] Verificar: Profit baja a ~$5,575
```

#### Test Case 5: Historial de Versiones

```
[ ] Click "Create New Analysis" (segunda vez)
[ ] Cambiar ARV a 460000
[ ] Guardar
[ ] Verificar: Analysis v2 guardado
[ ] Ver historial: Mostrar v1 y v2
[ ] Poder comparar
```

---

### PASO 6: Deploy a Producción (1 hora)

```
[ ] En GitHub repo racielf/nexartwo
[ ] Crear rama: feat/investor-hub-phase-2b
[ ] Subir todos los cambios:
    [ ] js/modules/investor-manager.js
    [ ] projects.html (nuevo tab + modals)
    [ ] js/projects.js (lógica)
    [ ] docs/PHASE_2B_*
[ ] Hacer Pull Request
[ ] Merge a main
[ ] GitHub Pages auto-deploys
[ ] Verificar: App live en racielf.github.io/nexartwo
```

---

## 📊 ARCHIVOS A CREAR/MODIFICAR

### Nuevos Archivos

```
js/modules/investor-manager.js          ← Copiar PHASE_2B_INVESTOR_MANAGER.js
docs/PHASE_2B_INVESTOR_ENTITIES_SPECIFICATION.md
docs/PHASE_2B_SCHEMA.sql
docs/PHASE_2B_IMPLEMENTATION_PLAN.md   ← Este archivo
```

### Archivos a Modificar

```
projects.html
├── Agregar tab "Investor Hub"
├── Agregar modal "New Analysis"
└── Agregar modal "Record Capital"

js/projects.js
├── Importar InvestorManager
├── Función loadInvestorHub()
├── Event listeners para botones
└── Funciones display*()

js/supabase.js
└── Instanciar: window.investorMgr = new InvestorManager(supabaseClient)
```

---

## 🔄 WORKFLOW PARA USUARIO FINAL

### Flujo Completo: Gresham 2906 Project

**1. Crear Inversor**
```
Owner: "Voy a crear un inversor"
Action: Projects → Gresham 2906 → Investor Hub → Add Investor
Result: Rodolfo registrado
```

**2. Asignar a Proyecto**
```
Owner: "Asignemos el inversor a este proyecto"
Action: Select Rodolfo → ownership 100% → profit_split 100%
Result: Rodolfo ahora es owner del proyecto
```

**3. Registrar Capital**
```
Owner: "Él aportó $6,600 para el proyecto"
Action: Record Capital → Rodolfo → $6,600 → initial → Save
Result: Capital registrado
```

**4. Crear Análisis de Flip**
```
Owner: "Basado en el contrato, crearemos una propuesta"
Action: Create New Analysis
Inputs:
  - Purchase: $330,000
  - Loan: $323,400 @ 10% for 6 months
  - Repairs: $30,350
  - ARV: $450,000
Action: Calculate → Review Results → Save
Result: Analysis v1 guardado (ROI 320%, Profit $21,145)
```

**5. Actualizar Análisis (Mes 3)**
```
Owner: "La obra avanza, actualizemos el análisis"
Action: Create New Analysis (v2)
Changes:
  - Repairs now $32,000 (más de lo pensado)
  - ARV still $450,000
Action: Calculate → Save as v2
Result: Analysis v2 (ROI 305%, Profit $18,650)
```

**6. Ver Historial**
```
Owner: "¿Cómo han cambiado las proyecciones?"
Action: View Analysis History
Result: Muestra v1 y v2 con comparación
```

---

## 🎯 SUCCESS CRITERIA

Phase 2B es exitosa cuando:

✅ **Schema Deployed**
- [ ] Todas las tablas existen en Supabase
- [ ] RPCs funcionan sin errores
- [ ] Datos se guardan correctamente

✅ **UI Completa**
- [ ] Investor Hub tab funciona
- [ ] Modals se abren/cierran
- [ ] Todos los inputs funcionan

✅ **Lógica Funcional**
- [ ] Crear inversor → guardado en DB
- [ ] Registrar capital → calculado total
- [ ] Crear análisis → cálculos correctos
- [ ] Guardar análisis → versionado correctamente
- [ ] Ver historial → versiones mostradas

✅ **Testing**
- [ ] Todos los test cases PASS
- [ ] ROI calculations correctas
- [ ] Datos persistentes (refresco de página = datos intactos)
- [ ] No hay console errors

✅ **Documentación**
- [ ] Specification completada
- [ ] Schema comentado
- [ ] JavaScript documentado
- [ ] User guide escrito

---

## ⏱️ TIMELINE

```
Día 1-2: SQL Deployment + JS Integration
Día 3-4: UI Development + Modal Implementation
Día 5-6: JavaScript Logic + Event Handlers
Día 7: Testing + Bug Fixes
Día 8: Final Polish + Deployment
```

**Total: 1-2 semanas**

---

## 📞 NEXT STEPS

1. ✅ Leer esta especificación
2. ✅ Leer el SQL schema
3. ✅ Deploy SQL en Supabase
4. ✅ Integrar JavaScript en NexArtWO
5. ✅ Implementar UI en projects.html
6. ✅ Conectar lógica
7. ✅ Testear
8. ✅ Deploy a producción

---

**PHASE 2B READY FOR EXECUTION**  
**Start Date: Mayo 2026**  
**Owner: Rodolfo Fernandez**  
**Developer: Claude + Agente IA**

Todos los archivos están listos. Proceder paso a paso.
