# Cuestionario — Fix & Flip Property Intake and Due Diligence

## Purpose

This document defines the requirements for a new NexArtWO page named **Cuestionario**.

The goal is to create a disciplined intake and due diligence workflow before visiting or buying a property for a fix-and-flip business.

The page must help the owner decide:

1. Whether the property has enough information to analyze.
2. Whether the numbers make sense before scheduling a visit.
3. Whether the property has legal, financial, city, title, permit, lien, occupancy, or physical-condition risks.
4. Whether the property should be visited, negotiated, rejected, or escalated for deeper due diligence.
5. Whether web-search agents should collect public information and attach it to the property record.

This is a planning/specification document only. It must not activate production behavior by itself.

---

## Business Rule

Do not visit properties by curiosity.

A property should only move to a visit when:

```text
Complete data + viable numbers + acceptable risk = schedule visit
```

If required information is missing, the system should classify the opportunity as **Incomplete** and request the missing data before any appointment.

---

## Page Name

Visible page name:

```text
Cuestionario
```

Suggested internal route/file options:

```text
questionnaire.html
cuestionario.html
js/cuestionario.js
```

Recommended Spanish UI label:

```text
Cuestionario de Compra Fix & Flip
```

---

## Core Workflow

### Step 1 — Property Intake

The person, wholesaler, agent, bank, seller, or entity sending the invitation must provide the minimum data.

Required fields:

- Property address
- City, state, ZIP
- Asking price
- Minimum acceptable price, if known
- Seller type
- Contact/source name
- Contact/source phone or email
- Property type
- Bedrooms
- Bathrooms
- Square feet
- Lot size
- Year built
- Occupancy status
- Photos
- Access instructions
- Offer deadline
- Inspection period available
- Accepted payment type: cash, hard money, conventional, seller finance, other
- Disclosures available: yes/no/unknown
- Known property condition notes

### Step 2 — Initial Number Check

Before scheduling the visit, the system should calculate whether the numbers make sense.

Required financial inputs:

- Asking price
- Target purchase price
- Estimated ARV
- Estimated rehab
- Estimated holding cost
- Estimated selling cost
- Estimated closing cost
- Estimated contingency

Suggested calculations:

```text
Total Project Cost = Purchase Price + Rehab + Holding Costs + Selling Costs + Closing Costs + Contingency
Estimated Profit = ARV - Total Project Cost
Profit Margin = Estimated Profit / ARV
Max Allowable Offer = (ARV x 0.70) - Rehab
```

Suggested decision bands:

- Strong candidate: profit above target and risk acceptable
- Review candidate: profit exists but risks need investigation
- Reject candidate: insufficient margin or severe risk
- Incomplete: missing essential information

### Step 3 — Legal, Financial, Title, and City Risk Check

The questionnaire must explicitly ask whether the property has any known issues.

Required risk questions:

- Are there any liens?
- Are there mortgage or bank problems?
- Is the property in foreclosure?
- Is the property in pre-foreclosure?
- Are there unpaid property taxes?
- Are there IRS or state tax liens?
- Are there mechanic liens?
- Are there utility liens?
- Are there child support liens or personal judgments attached to title?
- Is there any probate issue?
- Is there any bankruptcy issue?
- Are there title defects?
- Are there ownership disputes?
- Are there open permits?
- Are there expired permits?
- Are there unpermitted additions or conversions?
- Are there code violations?
- Are there city fines?
- Are there dangerous building cases?
- Are there sewer break cases?
- Are there demolition orders?
- Are there repair orders from the city?
- Are there HOA violations or dues?
- Is the property occupied?
- Are there tenants?
- Are there squatters or unauthorized occupants?
- Is there an eviction needed?

Each item should support:

```text
Yes / No / Unknown / Needs verification
```

If the answer is **Yes** or **Unknown**, the system should allow notes, source, amount, deadline, and document upload.

### Step 4 — Physical Risk Check

Required physical condition categories:

- Roof
- Foundation
- Crawlspace or basement
- Sewer line
- Plumbing
- Electrical panel and wiring
- HVAC
- Water intrusion
- Mold or moisture
- Drainage and grading
- Windows
- Siding
- Kitchen
- Bathrooms
- Flooring
- Interior paint and drywall
- Exterior paint
- Landscaping
- Fire damage
- Structural changes
- Additions
- Garage conversion
- ADU or basement conversion
- Lead paint risk
- Asbestos risk

Each category should support:

```text
Good / Fair / Poor / Unknown / Not inspected
```

The system should flag major risks:

- Sewer replacement
- Foundation movement
- Active water intrusion
- Mold remediation
- Full rewire
- Full replumb
- Roof replacement
- Structural work
- Unpermitted additions
- Occupancy problems

### Step 5 — Visit Decision

The page should produce a clear decision:

```text
Do Not Visit
Request Missing Data
Visit Candidate
Visit With Contractor
Escalate to Due Diligence
Reject
```

Suggested logic:

- If address, asking price, ARV, rehab estimate, and occupancy are missing: Request Missing Data
- If estimated profit is below target: Do Not Visit
- If any legal/title/city issue is unknown: Request Verification
- If major physical risk is present: Visit With Contractor
- If numbers are strong and risk is manageable: Visit Candidate

---

## Recommended Data Model

This can be implemented later in Supabase. Do not apply migrations until approved.

Suggested table:

```text
property_questionnaires
```

Suggested fields:

```text
id
created_at
updated_at
status
source_name
source_contact
address
city
state
zip
property_type
beds
baths
sqft
lot_size
year_built
occupancy_status
asking_price
target_purchase_price
minimum_accepted_price
arv_estimate
rehab_estimate
holding_cost_estimate
selling_cost_estimate
closing_cost_estimate
contingency_estimate
total_project_cost
estimated_profit
profit_margin
max_allowable_offer
legal_risk_status
city_risk_status
title_risk_status
physical_risk_status
visit_decision
notes
```

Suggested related tables later:

```text
property_questionnaire_risks
property_questionnaire_documents
property_questionnaire_web_findings
property_questionnaire_comps
property_questionnaire_agent_runs
```

---

## Web Research Agents Requirement

The system should eventually support agents that search public sources and return findings into NexArtWO.

The agents must not automatically make purchase decisions. They should collect evidence, cite sources, assign risk categories, and mark confidence.

### Suggested agents

#### 1. Property Facts Agent

Collects:

- Public listing facts
- Beds/baths/sqft/year/lotsize
- Listing price
- Photos if available
- Listing status
- Days on market when available

#### 2. Comparable Sales Agent

Collects:

- Sold comps within target radius
- Active comps
- Pending comps where available
- Renovated vs non-renovated comps
- Estimated ARV range
- Confidence score

#### 3. Legal and City Risk Agent

Collects:

- City code enforcement records
- Open dangerous building cases
- Sewer break cases
- Permit history
- Public property records
- Lien indicators when publicly available

#### 4. Title and Lien Precheck Agent

Collects preliminary indicators only.

Important: this does not replace title company review.

Checks:

- Public lien signals
- Tax delinquency signals
- Recorded document indicators
- Foreclosure/pre-foreclosure signals where publicly available

#### 5. Physical Risk Agent

Uses photos, inspection notes, and public information to flag likely risks:

- Roof condition
- Siding condition
- Moisture/damage signs
- Tree/root risk
- Drainage concerns
- Possible sewer risk based on age/location

#### 6. Deal Analysis Agent

Combines:

- Asking price
- Target purchase price
- Rehab estimate
- ARV estimate
- Holding/selling costs
- Risk adjustments

Outputs:

- Estimated profit
- Max allowable offer
- Visit recommendation
- Deal killer warnings

---

## Reliable Information Sources to Use

### Due diligence concepts

Fix-and-flip due diligence should cover ARV, inspection items, environmental checks, and deal analysis before purchase. Several real-estate investor checklist resources use these categories as the core pre-purchase workflow.

### Portland public sources

For Portland properties, agents should check official public sources first:

- Portland Permitting & Development manages building permits, land use, inspections, code enforcement, and public works permits.
- Portland code enforcement pages include property compliance inspections, code enforcement liens, work done without permits, and lien reduction review.
- Portland public records pages provide records about private-property building, code enforcement, permits, and land use reviews.
- Portland publishes current dangerous building, housing, and sewer break case reports.
- Multnomah County describes compliance processes for code violations and retroactive permitting.

### Agent implementation sources

Recommended implementation path:

- OpenAI Responses API with the built-in `web_search` tool for live web research.
- OpenAI Agents SDK for multi-agent workflows and tool orchestration.
- Retrieval/RAG layer for storing property findings, documents, and repeatable search results.
- Optional LangChain or similar retrieval framework only if custom RAG/data-pipeline complexity is needed.

---

## Implementation Architecture

### Frontend

Add a new page or dashboard module:

```text
Cuestionario
```

Suggested sections:

1. Property Basics
2. Source / Invitation Details
3. Numbers
4. Legal / Title / City Problems
5. Physical Condition
6. Visit Decision
7. Web Research Findings
8. Documents and Photos
9. Notes

### Backend / Data Layer

Do not change Supabase until schema is approved.

Future implementation should:

- Store questionnaire records
- Store risk answers separately
- Store agent findings with source URLs and timestamps
- Store confidence score per finding
- Keep manual override fields
- Keep audit history of decisions

### Agent Run Output Shape

Each agent should return structured JSON similar to:

```json
{
  "property_id": "string",
  "agent_name": "Legal and City Risk Agent",
  "status": "completed",
  "findings": [
    {
      "category": "code_violation",
      "summary": "Potential open code enforcement issue found",
      "source_name": "Portland.gov",
      "source_url": "https://example.com",
      "confidence": "medium",
      "requires_manual_verification": true
    }
  ],
  "risk_level": "medium",
  "recommended_next_action": "Verify with city records before visit"
}
```

---

## UX Requirements

The page must be simple for a business user.

Avoid technical labels in visible UI. Use plain Spanish.

Good labels:

```text
Precio de compra
Valor estimado después de reparar
Reparación estimada
Problemas con la ciudad
Problemas con bancos o título
Ocupada o vacía
Decisión de visita
```

Avoid visible technical labels:

```text
RLS
schema
migration
agent orchestration
vector store
```

Technical details belong in developer notes, not in the user-facing page.

---

## Safety Rules

The page must not:

- Guarantee that a property is safe to buy
- Replace attorney review
- Replace title company review
- Replace city verification
- Replace sewer scope
- Replace home inspection
- Replace contractor walkthrough
- Automatically approve a purchase
- Automatically schedule a visit without owner review
- Hide unknown risks
- Treat missing data as safe

Unknown must always be treated as risk.

---

## Minimum Viable Version

MVP should include:

- Manual property intake form
- Legal/city/title risk checklist
- Physical-risk checklist
- Basic ARV/rehab/profit calculator
- Visit recommendation field
- Notes field
- Document/photo upload placeholder
- Web research findings placeholder

No agent automation is required for MVP.

---

## Phase 2

Add:

- Supabase persistence
- Property records list
- Saved questionnaire history
- PDF export
- Comps table
- Inspection report attachment
- Contractor estimate attachment

---

## Phase 3

Add agents:

- Web property facts search
- Portland permit/code search
- Comps search
- Listing search
- Risk summary
- Deal score

All agent results must include:

- Source
- Timestamp
- Confidence
- Manual verification flag

---

## Example Decision for 11836 E Burnside St

Known working assumption from current analysis:

```text
Target purchase price: $285,000
Likely ARV range: $450,000 - $475,000
Recommended rehab style: clean modern starter-home flip, not luxury
Estimated rehab target: keep under $80,000 if possible
Primary risks: sewer, crawlspace moisture, roof, electrical, city/permit/title issues
Visit decision: viable only after required information and risk precheck
```

This example must remain editable and should not be hard-coded into production logic.

---

## References Used for This Spec

- Portland Permitting & Development official site: building permits, land use, inspections, code enforcement, public works permits.
- Portland Code Enforcement official pages: property compliance inspections, code enforcement liens, work without permits, lien reduction review.
- Portland Public Records official page: records about building on private property, code enforcement, permits, and land use reviews.
- Portland Open Code Enforcement Cases official page: dangerous building, housing, and sewer break cases.
- Multnomah County Compliance Process: code-violation compliance and retroactive permitting process.
- OpenAI API documentation: Responses API web search tool for live web research.
- OpenAI Agents SDK documentation: agent tools and web-search-oriented tool workflows.
- LangChain retrieval documentation: searchable knowledge base and RAG patterns for stored property research.

---

## Delivery Rule

When this page is implemented later, every PR must clearly state:

- Files changed
- Whether SQL was touched
- Whether Supabase was touched
- Whether any agent automation was activated
- Whether production data was touched
- What QA was performed
- Remaining blockers

No merge should happen until manually approved.
