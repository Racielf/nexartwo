BEGIN;

CREATE TEMP TABLE qa_results (
    test_name TEXT,
    expected TEXT,
    actual TEXT,
    result TEXT
);

DO $$
DECLARE
    v_project_id TEXT := 'PROJ-QA-AUTO-001';
    v_expense_id UUID;
    v_refund_id UUID;
    v_disb_id UUID;
    v_summary RECORD;
BEGIN
    -- 1. Create temporary project
    INSERT INTO projects (
        id, name, status, 
        purchase_price, down_payment, realtor_fee, 
        title_company_fee, closing_costs, inspection_fee, insurance
    ) VALUES (
        v_project_id, 'QA Automated Project', 'active',
        100000, 20000, 1000,
        500, 2000, 300, 700
    );

    -- 2. Create financial records (pending)
    INSERT INTO project_expenses (project_id, vendor, amount, status)
    VALUES (v_project_id, 'Test Vendor', 500, 'pending') RETURNING id INTO v_expense_id;

    INSERT INTO project_refunds (project_id, vendor, amount, status)
    VALUES (v_project_id, 'Test Vendor', 120, 'pending') RETURNING id INTO v_refund_id;

    INSERT INTO project_disbursements (project_id, beneficiary, amount, status)
    VALUES (v_project_id, 'Test Beneficiary', 1000, 'pending') RETURNING id INTO v_disb_id;

    -- 3. Update to approved/paid
    UPDATE project_expenses SET status = 'approved' WHERE id = v_expense_id;
    UPDATE project_refunds SET status = 'approved' WHERE id = v_refund_id;
    UPDATE project_disbursements SET status = 'approved' WHERE id = v_disb_id;
    UPDATE project_disbursements SET status = 'paid' WHERE id = v_disb_id;

    -- Simulate Sale
    UPDATE projects
    SET sale_price = 120000, selling_agent_commission = 3600, seller_closing_costs = 1400
    WHERE id = v_project_id;

    -- 4. Check Summaries
    SELECT * INTO v_summary FROM project_financial_summaries WHERE project_id = v_project_id;

    -- Assertions
    INSERT INTO qa_results VALUES ('cost_basis', '104500', COALESCE(v_summary.cost_basis::text, 'NULL'), CASE WHEN v_summary.cost_basis = 104500 THEN 'PASS' ELSE 'FAIL' END);
    INSERT INTO qa_results VALUES ('cash_invested', '24500', COALESCE(v_summary.cash_invested::text, 'NULL'), CASE WHEN v_summary.cash_invested = 24500 THEN 'PASS' ELSE 'FAIL' END);
    INSERT INTO qa_results VALUES ('net_expense_cost', '380', COALESCE(v_summary.net_expense_cost::text, 'NULL'), CASE WHEN v_summary.net_expense_cost = 380 THEN 'PASS' ELSE 'FAIL' END);
    INSERT INTO qa_results VALUES ('total_disbursements', '1000', COALESCE(v_summary.total_disbursements::text, 'NULL'), CASE WHEN v_summary.total_disbursements = 1000 THEN 'PASS' ELSE 'FAIL' END);
    INSERT INTO qa_results VALUES ('net_proceeds', '115000', COALESCE(v_summary.net_proceeds::text, 'NULL'), CASE WHEN v_summary.net_proceeds = 115000 THEN 'PASS' ELSE 'FAIL' END);
    INSERT INTO qa_results VALUES ('profit', '10120', COALESCE(v_summary.profit::text, 'NULL'), CASE WHEN v_summary.profit = 10120 THEN 'PASS' ELSE 'FAIL' END);
    INSERT INTO qa_results VALUES ('project_cash_position', '89120', COALESCE(v_summary.project_cash_position::text, 'NULL'), CASE WHEN v_summary.project_cash_position = 89120 THEN 'PASS' ELSE 'FAIL' END);

    -- 5. Immutability tests
    BEGIN
        DELETE FROM project_expenses WHERE id = v_expense_id;
        INSERT INTO qa_results VALUES ('DELETE expense', 'Blocked', 'Allowed', 'FAIL');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO qa_results VALUES ('DELETE expense', 'Blocked', 'Blocked', 'PASS');
    END;

    BEGIN
        UPDATE project_expenses SET amount = 999 WHERE id = v_expense_id;
        INSERT INTO qa_results VALUES ('UPDATE amount', 'Blocked', 'Allowed', 'FAIL');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO qa_results VALUES ('UPDATE amount', 'Blocked', 'Blocked', 'PASS');
    END;

    BEGIN
        UPDATE project_expenses SET tax = 999 WHERE id = v_expense_id;
        INSERT INTO qa_results VALUES ('UPDATE tax', 'Blocked', 'Allowed', 'FAIL');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO qa_results VALUES ('UPDATE tax', 'Blocked', 'Blocked', 'PASS');
    END;

    BEGIN
        UPDATE project_expenses SET status = 'cancelled' WHERE id = v_expense_id;
        INSERT INTO qa_results VALUES ('UPDATE status', 'Allowed', 'Allowed', 'PASS');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO qa_results VALUES ('UPDATE status', 'Allowed', 'Blocked', 'FAIL');
    END;

END $$;

SELECT test_name, expected, actual, result FROM qa_results;

ROLLBACK;
