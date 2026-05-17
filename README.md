# NexArtWO — Construction & Investor Management Platform

**Complete construction project management + investor capital tracking system** built for **R.C Art Construction LLC** (Oregon CCB #247277).

NexArtWO manages the complete Fix & Flip workflow from project inception through investor capital deployment, rehab execution, property sale, and final investor settlement.

---

## 📊 Core Modules

### Phase 1: Project & Financial Control ✅
- **Work Orders** — Create, track, and manage construction work orders with status workflow
- **Service Library** — 36+ pre-built construction services (Electrical, Plumbing, HVAC, Roofing, etc.)
- **Financial System** — Expenses, refunds, disbursements, and P&L tracking
- **Dashboard** — Real-time overview of work orders, revenue pipeline, and cash position

### Phase 2: Investor Hub (In Development)
- **Investor Management** — Register investors and investment companies
- **Capital Tracking** — Track investor contributions, capital calls, distributions
- **Flip Analysis** — Interactive investment proposal with ROI projections
- **Lender Management** — Hard money loans, interest, points, fees, payoff
- **Acquisition Tracking** — Purchase price, closing costs, title company records
- **Rehab Budget vs Actual** — Budget variance, change orders, actual vs projected
- **Sale & Closing** — Listing, negotiation, closing statement, net proceeds
- **Investor Settlement** — Final P&L, profit distribution, investor ROI
- **Final Reports** — Professional investor reports with closing statement summary

---

## 🎯 Central Logic: Flip Analysis Calculation

The **Flip Analysis** is the financial engine that powers investment decisions.

### Core Formula

```
ALL-IN COST = Purchase Price + Acquisition Costs + Rehab Net Cost + Lender Costs + Holding Costs + Selling Costs

NET PROFIT = Sale Price - All-In Cost

INVESTOR ROI = Net Profit / Investor Capital Contributed
```

### Live Example: 2906 SE 182nd Ave, Gresham, OR

| Item | Value | Notes |
|------|-------|-------|
| **ACQUISITION** | | |
| Purchase Price | $330,000 | Negotiated contract price |
| Earnest Deposit | $6,600 | Investor cash down |
| Closing Costs | $6,500 | Entry closing (~2%) |
| **HARD MONEY LOAN** | | |
| Loan Amount | $323,400 | Amount lender finances |
| Rate | 10% annual | Calculated on $323,400 |
| **6-Month Interest** | $16,170 | Core holding cost |
| **HOLDING** | | |
| Taxes (6m) | $1,250 | Property taxes |
| Insurance (6m) | $1,200 | Builder policy |
| **REHAB** | | |
| Estimated Repairs | $30,350 | Contractor estimate |
| Contingency (10%) | $3,035 | Overages buffer |
| **SALE** | | |
| Title & Escrow | $9,000 | Exit closing (~2%) |
| **TOTAL PROJECT COST** | **$397,505** | All-in cost |
| | | |
| **SALE PRICE (ARV)** | **$450,000** | Conservative market rate |
| **Realtor Commission** | **$24,750** | At 5.5% |
| **Net Proceeds** | **$425,250** | After realtor |
| | | |
| **Gross Profit** | **$27,745** | Before investor cut |
| **Investor Initial Capital** | **-$6,600** | Earnest money invested |
| **NET PROFIT TO INVESTOR** | **$21,145** | Final take-home |
| | | |
| **ROI (6 months)** | **320%** | $21,145 / $6,600 |
| **Annualized ROI** | **640%** | At 6-month timeframe |
| **Profit Margin** | **4.70%** | Of sale price |

### Key Logic Points

1. **Hard Money Rate Calculation**
   - Rate applies to **loan amount only** ($323,400), not purchase price
   - Interest = $323,400 × 10% ÷ 2 (for 6 months) = $16,170
   - Every month over 6 months costs ~$3,000 in additional interest

2. **Investor Capital Separation**
   - $6,600 earnest deposit = investor's actual cash at risk
   - $323,400 loan = lender's money (must be repaid)
   - Final profit is calculated AFTER subtracting investor's initial capital

3. **All-in Cost Coverage**
   - Includes every dollar that leaves the deal (closing, rehab, holding, sale)
   - Does NOT include loan repayment (that's covered by sale proceeds)
   - Profit = Sale Proceeds - All-in Cost

4. **Timeline Sensitivity**
   - 6 months is the sweet spot (profit = $21,145)
   - 2 months = higher profit ($30,555) but unrealistic timeline
   - 12 months = profit drops to $5,575 (each month costs ~$3k)

### Sensitivity Analysis

| Timeline | Interest Cost | Total Cost | Profit | Viability |
|----------|---------------|-----------|--------|-----------|
| 2 months | $5,390 | $388,695 | $30,555 | 10% (Aggressive) |
| **6 months** | **$16,170** | **$397,505** | **$21,145** | **✅ Recommended** |
| 12 months | $32,340 | $413,675 | $5,575 | ❌ Too long |

---

## 🚀 Tech Stack

- **Frontend**: Vanilla HTML/CSS/JS (no framework dependencies)
- **Database**: Supabase (PostgreSQL)
- **Hosting**: GitHub Pages
- **Icons**: Lucide Icons
- **Maps**: OpenStreetMap Nominatim

## 📱 Access

Live at: `https://racielf.github.io/nexartwo/`

Interactive Flip Analysis: `https://bit.ly/flip-rcart`

## 📄 License

Private — R.C Art Construction LLC
