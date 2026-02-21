### Task 2: API Testing
Test all API endpoints (`/api/employees/`, `/api/calculate-payroll/`, `/api/payroll-history/`, `/api/tax-brackets/`)

# List all employees
curl -s http://localhost:8000/api/employees/ | jq

# Calculate payroll
curl -s -X POST http://localhost:8000/api/calculate-payroll/ -H "Content-Type: application/json" -d "{\"employee_id\": 1, \"period_month\": 1, \"period_year\": 2024}" | jq

# List payroll history
curl -s http://localhost:8000/api/payroll-history/ | jq

# List tax brackets
curl -s http://localhost:8000/api/tax-brackets/ | jq

# Test boundary conditions for salary values
curl -s -X POST http://localhost:8000/api/calculate-payroll/ -H "Content-Type: application/json" -d "{\"employee_id\": 1, \"period_month\": 1\"period_year\": 2024, \"override_salary\": -1.00} | jq

[Open for Reference and Evidence](./api-evidence/)
