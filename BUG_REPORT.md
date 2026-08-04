
### BUG 0001
Title: Icon Missing in Quick Links "Calculate Payroll"
Severity: Low
Steps to Reproduce:
    1. Go to Dashboard
Expected Result: All Quick Link Icons should be visible
Actual Result: "Calculate Payroll" has no/error icon.


### BUG 0002
Title: Override Salary Accepts and Computes Negative Numbers
Severity: High
Steps to Reproduce:
    1. Go to Calculator 
    2. Select Any Employee
    3. Select Any Month
    4. Select Any Year
    5. Input Negative Number in Override Salary e.g. (-20000)
    6. Click Calculate Payroll Button
Expected Result: Display Validation Error Message:("cannot accept negative numbers) and should not calculate.
Actual Result: No validation Error message appears and negative values are calculated.

### BUG 0003
Title: Payroll Result does not reset when changing modules
Severity: High
Steps to Reproduce:
    1. Go to Calculator 
    2. Select Any Employee
    3. Select Any Month
    4. Select Any Year
    6. Click Calculate Payroll Button
    7. Go to Any Module e.g.(Dashboard)
    8. Go back to Calculator
Expected Result: Payroll Result should be hidden
Actual Result: Payroll Result from previous calculation is displayed.

### BUG 0004
Title: Add Employee Accepts Employment Year greater than current year
Severity: Medium
Steps to Reproduce:
    1. Go to Employees
    2. Click "+ Add Employee"
    3. Fill out Important Details
    4. Input Year as 2027 or greater than current year
    6. Click Add Employee Button
Expected Result: Employee is not added and prompt saying employment year should not be greater than current year
Actual Result: Employee is added normally

### BUG 0005 API Test
Title: POST /api/employees accepts negative salary
Severity: High
Steps to Reproduce:
    1. Go to Postman
    2. Create a POST request to api/employees
    3. Input the data below
        {
            "first_name": "John",
            "last_name": "Dela Cruz",
            "email": "juan.delacruz222@company.ph",
            "position": "Junior Developer",
            "department": "Engineering",
            "employment_type": "regular",
            "monthly_salary": "-25000.00",
            "date_hired": "2022-03-15"
        }
    4. Send Request
Expected Result: API returns 400 Bad Request; "Monthly Salary should be positive integer"
Actual Result: API returns 201 Created;  Employee with negative salary is created.

### BUG 0006 API Test
Title: POST /api/calculate-payroll accepts negative salary
Severity: High
Steps to Reproduce:
    1. Go to Postman
    2. Create a POST request to api/calculate-payroll
    3. Input the data below
        {
            "employee_id": 11,
            "period_month": 10,
            "period_year": 2026,
            "override_salary": -20000
        }
    4. Send Request
Expected Result: API returns 400 Bad Request; "Override Salary should be positive integer"
Actual Result: API returns 201 Created;  Payroll Result with negative salary is created.