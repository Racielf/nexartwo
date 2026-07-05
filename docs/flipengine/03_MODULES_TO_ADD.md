# FlipEngine Modules To Add

Source context: `FLIPENGINE_CONTEXT.md`

This document lists the new modules required for FlipEngine and how each connects to the current NexArWO app.

## Context Guardrails

- NexArWO remains the primary Work Orders, Projects, construction, and operations app.
- FlipEngine modules are optional investment extensions inside NexArWO.
- NexArtEngine must not be used as naming, branding, table prefix, or module identity in this repo.
- Existing projects must not be forced into investment workflows.
- A project should expose FlipEngine behavior only when it is intentionally used as a property/investment.
- New module data should be linked non-destructively to existing records, usually through `project_id`.

## Module Integration Pattern

Each new module should follow this pattern:

```text
projects.id
  -> new module table rows
  -> optional work_order_id / expense_id / document_id / investor_id / contractor_id links
  -> UI tab in Property Hub
  -> DB namespace in js/supabase.js
```

The first integration point is the existing project workspace in `js/projects.js`.

## Property Hub Tabs

Target tabs:

1. Overview
2. Acquisition
3. Budget
4. Work Orders
5. Expenses
6. Receipts
7. Documents
8. Loans / Draws
9. Investors
10. Contractors
11. Labor / Time
12. Payments
13. Sale / Exit
14. Reports

Tabs should be added gradually. Do not add all logic at once.

## A. Acquisition Module

Purpose:

Track how the property was acquired and what closing/funding facts define the investment start.

Connects to:

- `projects.id`
- Documents
- Loans
- Closing Costs

Fields needed:

- Purchase price
- Earnest money
- Closing date
- Buyer entity
- Seller
- Escrow company
- Escrow number
- Lender
- Loan number
- Loan amount
- Buyer funds to close
- Construction holdback
- Assignment fee
- Insurance
- Title fees
- Recording fees
- Closing documents

UI location:

- Property Hub tab: `Acquisition`

## B. Budget Categories Module

Purpose:

Track renovation budget by category and compare estimated vs actual spend.

Connects to:

- `projects.id`
- Work Orders
- Project Expenses
- Receipts

Fields needed:

- Category name
- Estimated budget
- Actual spent
- Remaining
- Variance
- Status
- Related project/property
- Related work orders
- Related expenses

UI location:

- Property Hub tab: `Budget`

Important rule:

Actual spend should be derived from approved expenses/receipts where possible, not manually duplicated forever.

## C. Closing Costs Module

Purpose:

Track property closing costs separately from renovation expenses.

Connects to:

- `projects.id`
- Acquisition
- Loans
- Documents
- Payments

Fields needed:

- Closing cost name
- Category
- Amount
- Paid by
- Related lender
- Related document
- Property/project
- Notes

UI location:

- Property Hub tab: `Acquisition` or `Loans / Draws`
- Data/Admin dashboard table

## D. Loans / Draws Module

Purpose:

Track lender financing, construction holdback, and draw requests.

Connects to:

- `projects.id`
- Acquisition
- Draw documents
- Receipts
- Payments

Fields needed:

- Lender
- Loan amount
- Origination fee
- Processing fee
- Construction holdback
- Draw requests
- Draw status
- Draw amount
- Draw documents
- Property/project

UI location:

- Property Hub tab: `Loans / Draws`

## E. Receipts Module

Purpose:

Track proof of spend and connect receipts to expenses, budget categories, Work Orders, and reimbursements.

Connects to:

- `projects.id`
- Work Orders
- Budget Categories
- Project Expenses
- Documents / files
- Payments

Fields needed:

- Receipt date
- Vendor
- Amount
- Payment method
- Receipt image/file
- Property/project
- Work order
- Budget category
- Expense
- Review status
- Reimbursement status

UI location:

- Property Hub tab: `Receipts`
- Executive dashboard pending review count
- Data/Admin dashboard receipt table

## F. Documents Module Extension

Purpose:

Allow one document to be associated with multiple business contexts.

Connects to:

- Property/project
- Acquisition
- Loan
- Draw
- Closing cost
- Work Order
- Expense
- Receipt
- Investor
- Contractor
- Employee

Document types:

- Proof of Funds
- Buyer Statement
- Final Buyer Statement
- Deed
- Deed of Trust
- Insurance
- Receipt
- Invoice
- Work Order
- Contractor Document
- Employee Document
- Investor Document
- Other

UI location:

- Existing Documents area
- Property Hub tab: `Documents`
- Related module detail screens

## G. Investors Module

Purpose:

Manage investor identity, commitments, funding, property relationships, and documents.

Connects to:

- Existing `investors`
- Existing `investor_companies`
- Existing `project_investors`
- Existing `capital_contributions`
- Existing `capital_calls`
- Documents

Fields needed:

- Investor type: person / company
- Name
- Contact info
- Address
- Amount committed
- Amount funded
- Related properties/projects
- Documents
- Notes

UI location:

- Property Hub tab: `Investors`
- Future global Investor Directory

Important rule:

Funding/capital views must remain separate from operating expense and ROI formulas unless approved later.

## H. Contractors Module

Purpose:

Track vendors/subcontractors who execute renovation work.

Connects to:

- Work Orders
- Payments
- Documents
- Receipts
- Projects/properties

Fields needed:

- Contractor name
- Company
- Phone
- Email
- Specialty
- License info
- Insurance info
- Documents
- Related work orders
- Related payments

UI location:

- Property Hub tab: `Contractors`
- Data/Admin dashboard

## I. Employees / Labor Module

Purpose:

Track internal labor and employee time entries against property and Work Orders.

Connects to:

- Projects/properties
- Work Orders
- Payments

Fields needed:

- Employee info
- Hourly rate
- Time entries
- Check in / check out future-ready
- Related work order
- Related project/property
- Total hours
- Labor cost

UI location:

- Property Hub tab: `Labor / Time`
- Data/Admin dashboard

## J. Payments Module

Purpose:

Track payments made to contractors, employees, vendors, lenders, or other parties.

Connects to:

- Projects/properties
- Expenses
- Receipts
- Invoices
- Contractors
- Employees
- Closing Costs
- Loans / Draws

Fields needed:

- Payment date
- Amount
- Payment method
- Paid to
- Related expense
- Related invoice
- Related contractor
- Related employee
- Related project/property
- Status

UI location:

- Property Hub tab: `Payments`
- Executive dashboard pending payments
- Data/Admin dashboard

## K. Sale / Exit Module

Purpose:

Track sale outcome and final investment performance.

Connects to:

- Projects/properties
- Documents
- Closing Costs
- Reports
- Financial summaries

Fields needed:

- Listing price
- Sale price
- Sale date
- Realtor
- Listing agent commission percent
- Buyer agent commission percent
- Total realtor commission percent
- Calculated realtor commission amount
- Selling costs
- Net proceeds
- Final profit
- Final ROI
- Sale documents

Financial requirement:

- Realtor commissions must be entered as editable percentages, not only as manual fixed dollar amounts.
- Commission percentages may vary by deal.
- The main inputs should be `listing_agent_commission_percent`, `buyer_agent_commission_percent`, `total_realtor_commission_percent`, and `sale_price`.
- The calculated amount should be shown automatically in Sale / Exit financials using:

```text
calculated_realtor_commission_amount = sale_price * total_realtor_commission_percent / 100
```

- Later, actual closing statement amounts can be reconciled against the calculated commission amount, but the primary planning input should remain percentage-based.

UI location:

- Property Hub tab: `Sale / Exit`
- Reports
- Executive dashboard

## Dashboard Additions

### Executive Dashboard

Should summarize:

- Active properties
- Total invested
- Total loan amount
- Total renovation budget
- Total spent
- Remaining budget
- Estimated profit
- ROI
- Open work orders
- Pending receipts review
- Pending payments
- Documents needing review

### Data / Admin Dashboard

Should expose filtered tables for:

- Properties / Projects
- Acquisition records
- Budgets
- Budget categories
- Work Orders
- Expenses
- Receipts
- Loans
- Draws
- Closing Costs
- Documents
- Investors
- Contractors
- Employees
- Time entries
- Payments

## Recommended Build Order

1. Acquisition
2. Budget Categories
3. Receipts
4. Document links
5. Loans / Draws
6. Closing Costs
7. Payments
8. Contractors
9. Employees / Labor
10. Sale / Exit
11. Executive dashboard
12. Data/Admin dashboard
