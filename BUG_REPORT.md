# Bug Report — PH Payroll Calculator

## Scope

Manual exploratory findings for the payroll calculator web app and related API behavior.

---

## Bug 1 — Latent tax-calculator boundary defect at exact annual ₱250,000

- **Severity:** Low

### Steps to Reproduce

1. Call the tax helper directly with an annual taxable income of exactly `250000`.
2. Inspect the computed annual tax.

### Expected Result

An annual taxable income of exactly ₱250,000 should be tax-exempt, so the computed annual tax should be `₱0.00`.

### Actual Result

The helper logic contains a boundary defect for the exact ₱250,000 case, but the issue is not currently reproducible through the UI or API.

### Evidence

- In `backend/payroll_app/calculations/tax_calculator.py`, the first taxable condition uses:
	- `if annual_income >= Decimal('250000'):`
- This is logically incorrect for the exact boundary and should exempt ₱250,000.
- However, the public app input only allows monthly values with 2 decimal places.
- Example: `20833.33 × 12 = 249999.96`, so the UI/API still returns `income_tax = 0.00`.
- Supporting regression test reference:
	- `backend/tests/test_calculations.py`
	- `test_exactly_250000_should_be_exempt`

> This is a latent code-level defect, not a currently reproducible user-facing bug.

---

## Bug 2 — Payroll form accepts negative override salary values

- **Severity:** High

### Steps to Reproduce

1. Open the Payroll Calculator page.
2. Select any active employee.
3. Enter `-5000` in the **Override Salary** field.
4. Click **Calculate Payroll**.

### Expected Result

The form or API should block invalid negative salary input and show a validation error.

### Actual Result

The UI allows the negative value to be submitted, and the backend request shape also permits it.

### Evidence

- In `frontend/src/components/PayrollForm.vue`, the override salary input is missing a non-negative constraint such as `min="0"`.
- In `backend/payroll_app/serializers.py`, `override_salary` is declared without `min_value=0`, so API-level validation also does not prevent negative values.

---

## Bug 3 — Missing employee on payroll calculation returns HTTP 200 instead of 404

- **Severity:** Medium

### Steps to Reproduce

1. Send a `POST` request to `/api/calculate-payroll/`.
2. Use a payload with a non-existent `employee_id`, for example:
	 - `employee_id: 99999`
	 - any valid `period_month`
	 - any valid `period_year`
3. Inspect the HTTP response status.

### Expected Result

The API should return **HTTP 404 Not Found** because the employee resource does not exist.

### Actual Result

The API returns **HTTP 200 OK** with an error payload.

### Evidence

- In `backend/payroll_app/views.py`, the exception handler for a missing employee returns:
	- `status=status.HTTP_200_OK`
- This is inconsistent with REST conventions and with the behavior of `/api/employees/<id>/`, which correctly returns 404 for missing employees.
- Supporting regression test reference:
	- `backend/tests/test_calculations.py`
	- `test_calculate_payroll_missing_employee_should_return_404`

---

## Bug 4 — Dashboard navigation link stays highlighted on every page

- **Severity:** Low

### Steps to Reproduce

1. Open the application.
2. Click **Employees**, **Calculator**, **History**, or **Tax Info** in the top navigation.
3. Observe the highlighted navigation items.

### Expected Result

Only the currently active page link should be highlighted.

### Actual Result

The **Dashboard** link remains highlighted even when another route is active.

### Evidence

- In `frontend/src/App.vue`, the active-link styling is applied to `.router-link-active.nav-link`.
- Because `/` is a prefix match for all routes, the Dashboard link stays active for every page.
- This should use exact matching styling instead, such as `.router-link-exact-active.nav-link`.

---

## Bug 5 — Employee form shows raw JSON error text for validation failures

- **Severity:** Medium

### Steps to Reproduce

1. Open the **Employees** page.
2. Click **Add Employee**.
3. Fill the form with a duplicate email address already used by an existing employee.
4. Submit the form.

### Expected Result

The UI should show a readable validation message, such as “Email already exists.”

### Actual Result

The page displays a raw JSON stringified server response instead of a user-friendly error message.

### Evidence

- In `frontend/src/views/Employees.vue`, validation errors are rendered via:
	- `JSON.stringify(e.response.data)`
- This exposes raw response JSON directly to the user.

---

## Bug 6 — Dashboard hides employee/history load failures and shows misleading zero stats

- **Severity:** Medium

### Steps to Reproduce

1. Open the app with the backend unavailable, or force the employee/history API requests to fail.
2. Navigate to the **Dashboard** page.
3. Review the stat cards and recent payroll section.

### Expected Result

The dashboard should show a clear error or retry state when employee or payroll-history data cannot be loaded.

### Actual Result

The page silently swallows the error and can display zero values or empty sections, which looks like valid data instead of a loading failure.

### Evidence

- In `frontend/src/views/Dashboard.vue`, the employee/history request block ends with:
	- `} catch {}`
- No error state is stored or rendered for those failed requests.

---

## Bug 7 — Employee API accepts negative monthly salary values

- **Severity:** High

### Steps to Reproduce

1. Send a `POST` request to `/api/employees/`.
2. Use a payload with a negative `monthly_salary`, for example `-100.00`.
3. Inspect the response status and returned payload.

### Expected Result

The API should reject negative salary input with **HTTP 400 Bad Request** and a validation message.

### Actual Result

The API accepts the request and creates the employee successfully.

### Evidence

- Observed response status: **201 Created**
- Response body included a persisted employee record with:
	- `"monthly_salary":"-100.00"`
- In `backend/payroll_app/serializers.py`, `monthly_salary` on `EmployeeSerializer` has no minimum-value validation.

---

## Bug 8 — Deleted employees are still retrievable from the detail API

- **Severity:** Medium

### Steps to Reproduce

1. Create a test employee using `POST /api/employees/`.
2. Delete that employee using `DELETE /api/employees/<id>/`.
3. Request the same employee again using `GET /api/employees/<id>/`.

### Expected Result

After deletion, the employee should no longer be retrievable from the detail endpoint, ideally returning **404 Not Found**.

### Actual Result

The detail endpoint still returns the deleted employee with `is_active: false`.

### Evidence

- Delete response status: **204 No Content**
- Follow-up detail response status: **200 OK**
- Returned payload still exposes the deleted record.
- In `backend/payroll_app/views.py`, `employee_detail()` fetches by `pk` only and does not exclude inactive employees.

---

## Bug 9 — Payroll history API returns data inconsistent with current payroll rules

- **Severity:** High

### Steps to Reproduce

1. Request `GET /api/payroll-history/`.
2. Find the January 2025 payroll record for employee `Juan Dela Cruz` (`employee_id = 1`).
3. Compare its SSS employee contribution with a fresh `POST /api/calculate-payroll/` for the same employee and salary.
4. Compare both results against the stated SSS ceiling of ₱20,000 MSC.

### Expected Result

Historical payroll records should be internally consistent with the app’s payroll calculator and Philippine payroll rules.

### Actual Result

The payroll history record shows an SSS employee contribution of **₱1,125.00**, while the live payroll calculation returns **₱900.00** for the same ₱25,000 salary.

### Evidence

- `GET /api/payroll-history/` returned `sss_employee = 1125.00` for employee 1, January 2025.
- `POST /api/calculate-payroll/` for employee 1 returned `sss_employee = 900.00`.
- Per the instructions, SSS employee share is capped at **4.5% of ₱20,000 MSC = ₱900.00**.
- This indicates a data integrity issue in the payroll history exposed by the API.

---

## Summary

Identified bugs so far:

1. Latent tax-calculator boundary defect at exact annual ₱250,000.
2. Missing validation for negative override salary input.
3. Incorrect success status code returned for missing employees during payroll calculation.
4. Dashboard link remains highlighted on non-dashboard routes.
5. Employee form exposes raw JSON validation errors.
6. Dashboard silently hides failed data loads and can show misleading zero stats.
7. Employee creation API accepts negative salaries.
8. Deleted employees remain accessible from the detail API.
9. Payroll history API returns records inconsistent with current payroll rules.
