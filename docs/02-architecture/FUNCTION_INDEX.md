# FUNCTION_INDEX — NexArtWO

## Status

Populated during Phase A — 2026-05-29.
Source: grep scan of all JS files. Purpose-level descriptions only.

---

## js/app.js (~266 KB — HIGH RISK)

### Data / persistence
| Function | Line | Notes |
|----------|------|-------|
| `loadDataFromLocalStorage()` | 102 | Reads WO/services/clients from localStorage |
| `loadData()` | 109 | async — loads from Supabase, falls back to local |
| `saveServices()` | 134 | Saves services to localStorage |
| `saveClients()` | 138 | Saves clients to localStorage |
| `saveWorkOrders()` | 142 | Saves WOs to localStorage |
| `saveActivities()` | 146 | Saves activity log to localStorage |
| `saveAllData()` | 150 | Calls all save* functions |
| `globalSaveAll()` | 209 | Broader save (includes Supabase sync) |

### Navigation / routing
| Function | Line | Notes |
|----------|------|-------|
| `renderAppViews()` | 254 | Renders page shell for current route |
| `setupNavigation()` | 262 | Wires up nav links |
| `getInitialPageFromUrl()` | 278 | Reads `?page=` from URL |
| `updatePageUrl(page, replace)` | 288 | Updates browser URL without reload |
| `activatePageShell(page)` | 301 | Shows/hides page containers |
| `navigateTo(page, options)` | 336 | Main navigation function |
| `initProjectsRoute(page, attempt)` | 365 | Loads projects.js module route |
| `getPageTitles(page)` | 403 | Returns title string for page |

### Sidebar / layout
| Function | Line | Notes |
|----------|------|-------|
| `renderSidebar()` | 422 | Renders sidebar HTML |
| `toggleSidebar()` | 320 | Opens/closes sidebar |
| `closeSidebar()` | 328 | Closes sidebar |

### Dashboard
| Function | Line | Notes |
|----------|------|-------|
| `renderDashboard()` | 571 | Renders full dashboard |
| `renderDashboardFinancials()` | 646 | async — fetches and renders financial summary |
| `renderDashboardRevenueChart(orders)` | 461 | Canvas chart — revenue by month |
| `renderDashboardStatusDonut(orders)` | 521 | Canvas chart — WO status donut |
| `renderDashboardPriorityBars(orders)` | 553 | Canvas chart — priority distribution |
| `dashMoney(val)` | 427 | Formats number as $X,XXX |
| `dashSetMeter(id, pct)` | 431 | Sets progress bar width |

### Work Orders
| Function | Line | Notes |
|----------|------|-------|
| `renderWorkOrders()` | 800 | Renders WO list view |
| `openWorkOrderDetail(woId)` | 1097 | Opens WO detail panel |
| `loadLineItems(wo)` | 1138 | async — loads line items |
| `renderLineItems()` | 1179 | Renders line items in WO |
| `saveNewWO()` | 4340 | async — saves new WO to Supabase |
| `openNewWOModal(preselectedClient)` | 4162 | Opens new WO modal |
| `openEditWOModal(woId)` | 4241 | Opens edit WO modal |
| `deleteWorkOrder(woId)` | 1020 | Deletes WO (with confirm) |
| `woDeleteSelected()` | 913 | async — bulk delete selected WOs |
| `changeLineItemStatus(index, newStatus)` | 1373 | Changes line item status |
| `deleteLineItem(index)` | 1412 | Deletes line item |
| `addLineItem()` | 3872 | Adds new line item to WO |
| `addServiceToCurrentWO(serviceId)` | 3886 | Adds a service as line item |
| `switchWOTab(tab)` | 2578 | Switches between WO tabs |
| `updateWOProgress()` | 1162 | Updates WO completion % |

### Change Orders (CO)
| Function | Line | Notes |
|----------|------|-------|
| `renderChangeOrders()` | 1806 | Renders CO list |
| `createNewCO()` | 1952 | Creates new CO |
| `openCOEditor(idx)` | 2076 | Opens CO editor |
| `saveCOFromEditor()` | 2319 | Saves CO from editor |
| `deleteCO(idx)` | 2385 | Deletes CO |
| `updateCOStatus(idx, status)` | 2377 | Updates CO status |
| `buildNegotiationSummary()` | 2398 | Builds negotiation summary |

### Documents / PDF
| Function | Line | Notes |
|----------|------|-------|
| `generatePDF()` | 2992 | Triggers PDF generation |
| `buildPDF(template, hidePrices, docStyle)` | 3024 | Builds PDF HTML content |
| `getPDFHTML(title, body, wo, docStyle)` | 3441 | Returns full PDF HTML string |
| `printWODocument()` | 2939 | Prints WO document |
| `renderDocLines()` | 2715 | Renders document line items |
| `initWODocument()` | 2626 | Initializes document tab |

### Email
| Function | Line | Notes |
|----------|------|-------|
| `sendEmail()` | 3671 | Opens email send flow |
| `sendEmailNow()` | 3713 | async — sends email via Supabase function |
| `updateEmailPreview()` | 3698 | Updates email preview |

### Clients
| Function | Line | Notes |
|----------|------|-------|
| `renderClients()` | 4616 | Renders clients list |
| `saveNewClient()` | 4856 | Saves new client |
| `editClient(clientId)` | 4814 | Opens edit client modal |
| `deleteClient(clientId)` | 4725 | Deletes client |
| `viewClientOrders(clientId)` | 4805 | Filters WOs by client |

### Services
| Function | Line | Notes |
|----------|------|-------|
| `renderServiceLibrary()` | 754 | Renders service library |
| `filterServices(cat)` | 792 | Filters by category |
| `saveNewService()` | 4451 | Saves new service |
| `deleteService(svcId)` | 1044 | Deletes service |

### Settings
| Function | Line | Notes |
|----------|------|-------|
| `loadSettings()` | 4910 | Loads company settings |
| `saveSettings()` | 4967 | Saves company settings |
| `handleLogoUpload(event, type)` | 4988 | Handles logo file upload |

### Field Mode
| Function | Line | Notes |
|----------|------|-------|
| `initFieldMode()` | 5338 | Initializes field mode |
| `renderFMWorkOrders()` | 5356 | Renders WOs in field mode |
| `selectFieldWO(woId)` | 5385 | async — selects WO in field mode |

### Utilities
| Function | Line | Notes |
|----------|------|-------|
| `showToast(message)` | 3862 | ⚠️ DUPLICATE — also at line 5311 and in projects.js/modules |
| `showConfirmModal(...)` | 1000 | ⚠️ DUPLICATE — also in projects.js:128 |
| `closeConfirmModal()` | 1014 | ⚠️ DUPLICATE — also in projects.js:138 |
| `escHtml(str)` | 2767 | ⚠️ DUPLICATE — also escapeHtml at 3999, in projects.js, modules |
| `formatDate(d)` | 4489 | Date formatter |
| `generateWOId()` | 4326 | Generates WO ID |
| `statusLabel(s)` | 4482 | Returns label string for status |

---

## js/projects.js (~115 KB — HIGH RISK)

### Projects
| Function | Line | Notes |
|----------|------|-------|
| `loadProjects()` | 158 | async — loads projects from Supabase |
| `initProjects()` | 318 | async — initializes projects module |
| `initProjectsModule(options)` | 289 | async — full module init with options |
| `openProjectDetail(projId, options)` | 768 | async — opens project detail view |
| `saveProject()` | 709 | async — saves new/edit project |
| `openProjectModal(editId, type)` | 569 | Opens create/edit project modal |
| `renderProjectList()` | 412 | Renders project list |
| `refreshProjectsFromSupabase()` | 333 | async — full refresh from DB |
| `cancelCurrentProject()` | 815 | async — cancels active project |
| `switchProjTab(tab)` | 896 | Switches project detail tab |
| `renderProjectDetail(options)` | 915 | Renders project detail view |

### Project Financials
| Function | Line | Notes |
|----------|------|-------|
| `fetchProjectFinancials()` | 1013 | async — fetches expenses/disbursements |
| `renderExpensesTab()` | 1046 | Renders expenses tab |
| `renderDisbursementsTab()` | 1094 | Renders disbursements tab |
| `openExpenseModal(type)` | 1138 | Opens expense/refund modal |
| `openDisbursementModal()` | 1166 | Opens disbursement modal |
| `saveFinRecord(type)` | 1222 | async — saves expense/refund |
| `saveDisbursement()` | 1194 | async — saves disbursement |
| `approveRecord(id, type, targetStatus)` | 1255 | async — approves financial record |
| `cancelRecord(id, type)` | 1270 | async — cancels financial record |
| `renderWorkOrdersTab()` | 1292 | async — renders linked WOs tab |
| `openLinkWOModal()` | 1363 | async — opens link WO modal |
| `saveLinkWOs()` | 1474 | async — saves WO links to project |

### Investor Hub (in projects.js — PARALLEL IMPLEMENTATION)
| Function | Line | Notes |
|----------|------|-------|
| `renderInvestorHub(projectId)` | 1829 | async — ⚠️ DUPLICATE with modules/ |
| `ihProjectData(projectId)` | 1652 | async — fetches investor hub data |
| `ihAllInvestors()` | 1669 | async — lists all investors |
| `ihCreateInvestor(inv)` | 1677 | async — creates investor |
| `ihAttachInvestor(projectId, investorId, role)` | 1685 | async — links investor to project |
| `ihCreateContribution(contrib)` | 1701 | async — creates capital contribution |
| `ihCreateCall(call)` | 1717 | async — creates capital call |
| `openAddInvestorModal()` | 2017 | async — ⚠️ DUPLICATE with investor-hub-modals.js |
| `saveAddInvestor()` | 2048 | async — saves new investor |
| `openAddContribModal()` | 2074 | async — opens contribution modal |
| `saveAddContrib()` | 2118 | async — saves contribution |
| `openAddCallModal()` | 2149 | async — opens call modal |
| `saveAddCall()` | 2170 | async — saves capital call |

### Routing
| Function | Line | Notes |
|----------|------|-------|
| `openInvestorHubRoute(options)` | 312 | Routes to Investor Hub |
| `shouldOpenInvestorHubFromUrl()` | 322 | Checks URL for IH route |
| `syncProjectRouteChrome(route, options)` | 370 | Updates URL for project route |
| `openInvestorHubEntry(options)` | 389 | async — entry point to IH |

### Utilities
| Function | Line | Notes |
|----------|------|-------|
| `showConfirmModal(title, msg, onConfirm)` | 128 | ⚠️ DUPLICATE with app.js:1000 |
| `closeConfirmModal()` | 138 | ⚠️ DUPLICATE with app.js:1014 |
| `showToast(msg)` | 98 | ⚠️ DUPLICATE — 5 total across codebase |
| `escHtml(str)` | 93 | ⚠️ DUPLICATE |
| `fmtMoney(val)` | 143 | Formats dollar amount |
| `fmtDate(d)` | 148 | Formats date |
| `genProjectId()` | 153 | Generates project ID |

---

## js/supabase.js (~39 KB — CRITICAL)

| Function | Line | Notes |
|----------|------|-------|
| `getSupabase()` | 22 | Returns Supabase client singleton |
| `isSupabaseReady()` | 39 | Returns true if client is initialized |
| `getSupabaseFunctionUrl(functionName)` | 43 | Returns edge function URL |
| `getInvestorManager()` | 982 | Returns InvestorManager instance |
| `isInvestorManagerReady()` | 992 | Returns true if InvestorManager loaded |

---

## js/modules/investor-hub-logic.js (~18 KB — HIGH RISK)

⚠️ PARALLEL IMPLEMENTATION — overlaps with functions in projects.js

| Function | Line | Notes |
|----------|------|-------|
| `loadInvestorHubData(projectId)` | 59 | async — loads IH data |
| `renderInvestorHubTab()` | 92 | Renders IH tab |
| `renderInvestorHubSummaryCards()` | 122 | Renders summary cards |
| `renderInvestorsSection()` | 148 | Renders investors section |
| `renderCapitalContributionsSection()` | 187 | Renders capital contributions |
| `renderFlipAnalysisSection()` | 226 | Renders flip analysis |
| `attachInvestorHubEventHandlers()` | 322 | Wires event listeners |
| `openAddInvestorModal()` | 344 | ⚠️ DUPLICATE with projects.js + modals.js |
| `openRecordCapitalModal()` | 351 | ⚠️ DUPLICATE with modals.js |
| `openCreateAnalysisModal()` | 358 | ⚠️ DUPLICATE with modals.js |
| `showToast(message, type)` | 426 | ⚠️ DUPLICATE — 5 total |
| `escapeHtml(text)` | 411 | ⚠️ DUPLICATE (different name from escHtml) |
| `formatDate(dateString)` | 381 | ⚠️ DUPLICATE with projects.js:148 |
| `formatMoney(amount)` | 376 | ⚠️ DUPLICATE (different name from fmtMoney) |

---

## js/modules/investor-hub-modals.js (~25 KB — HIGH RISK)

⚠️ PARALLEL IMPLEMENTATION — overlaps with projects.js and investor-hub-logic.js

| Function | Line | Notes |
|----------|------|-------|
| `openAddInvestorModal()` | 10 | ⚠️ DUPLICATE ×3 |
| `closeAddInvestorModal(event)` | 95 | |
| `handleAddInvestorSubmit(e)` | 103 | async — submits add investor form |
| `openRecordCapitalModal()` | 177 | ⚠️ DUPLICATE |
| `closeRecordCapitalModal(event)` | 271 | |
| `handleRecordCapitalSubmit(e)` | 279 | async — submits capital record |
| `openCreateAnalysisModal()` | 354 | ⚠️ DUPLICATE |
| `closeCreateAnalysisModal(event)` | 476 | |
| `handleCreateAnalysisSubmit(e)` | 484 | async — submits analysis form |
| `showToast(message, type)` | 570 | ⚠️ DUPLICATE — 5 total |

---

## js/modules/investor-manager.js (~18 KB — CRITICAL)

Class-based module. Instantiated by supabase.js.

| Method | Notes |
|--------|-------|
| `constructor(supabaseClient)` | Takes Supabase client |
| `createInvestor(data)` | async — INSERT into investors table |
| `getInvestor(investorId)` | async — SELECT investor |
| (additional methods not fully scanned) | All CRUD for investors/capital/calls |

---

## js/env.js (CRITICAL — do not edit)

Auto-generated at build time by `scripts/generate-env.js`.
Contains: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_EMAIL_FUNCTION_URL`.
Committed to repo — anon key is intentionally public (Supabase design).
DO NOT edit by hand. Regenerate via build script if URL changes.
