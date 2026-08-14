# QA Bug Report — PH Payroll Calculator


### Task 1: Manual Exploratory Testing
### 1. Payroll Calculator Accepts Negative Salary Values
- **Severity** — High
- **Steps to Reproduce**
  1. Open the Payroll Calculator.
  2. Locate **Override Salary (₱) — Optional**.
  3. Enter a negative value, such as `-10000`.
  4. Click **Calculate Payroll**.
- **Expected Result** — The system should reject negative salary values and display a clear validation message indicating that the salary must be zero or greater.
- **Actual Result** — The system accepts `-10000` and calculates payroll using the negative amount. The results display:
  - Basic Salary: `-10000`
  - Deductions: `0.00`
  - Net Pay: `-10000`
* Evidence - ![Negative Salary Issue](<evidence/calculate payroll.png>)

### UX / Enhancement Observations
### 1. Position Field Accepts Free-Text Input
- **Severity** — Low
- **Steps to Reproduce**
    1. Open the employee form.
    2. Locate the Position field.
    3. Enter an arbitrary position value.
    4. Submit/save the employee information.
- **Expected Result** — If the application uses a predefined set of valid positions, the field should restrict users to valid positions or provide a selectable/searchable list.
- **Actual Result** — The Position field accepts free-text input without restricting the value to predefined positions.
- **Evidence** — ![Position Field Free-Text Input](<evidence/free text input in position field.png>)
￼
### 2. Department Field Accepts Free-Text Input
- **Severity** — Low
- **Steps to Reproduce**
    1. Open the employee form.
    2. Locate the Department field.
    3. Enter an arbitrary department value.
    4. Submit/save the employee information.
- **Actual Result** — If the application uses a predefined set of valid departments, the field should restrict users to valid departments or provide a selectable/searchable list.
- **Actual Result** — The Department field accepts free-text input without restricting the value to predefined departments.
- **Evidence** —![Department Field Accepts Free-Text](<evidence/department field free text input.png>)
￼
### 3. Employee List Does Not Provide Search Functionality
- **Severity** — Low
- **Steps to Reproduce**
    1. Open the Employee List.
    2. Attempt to locate a specific employee using a search function.
    3. Review the available controls.
- **Actual Result** — The Employee List should provide a search mechanism to allow users to quickly locate a specific employee.
- **Actual Result** — No search functionality is available.
- **Evidence** — ![Employee Eearch](<evidence/employee search.png>)
￼
### 4. Employee List Does Not Support Column Sorting
- **Severity** — Low
- **Steps to Reproduce**
    1. Open the Employee List.
    2. Attempt to sort employee records by an available column, such as name, position, or department.
    3. Review the available controls.
- **Actual Result** — Relevant employee-list columns should provide sorting functionality to allow records to be organized efficiently.
- **Actual Result** — The Employee List does not provide column-sorting functionality.
- **Evidence** — ![Employee Sort](<evidence/employee sort.png>)
￼

### Task 2: API Testing
### Calculate Payroll Returns HTTP 200 for a Nonexistent Employee
- **Severity** — Medium
- **Steps to Reproduce**
    1. Open Postman.
    2. Create a POST request to http://localhost:8000/api/calculate-payroll/.
    3. Provide a valid period_month and period_year.
    4. Set employee_id to a nonexistent employee ID, such as 99999.
    5. Send the request.
- **Actual Result** — The API should return an appropriate error status, such as 404 Not Found, indicating that the specified employee does not exist.
- **Actual Result** — The API returns HTTP 200 OK with the error message: "Employee with id=99999 does not exist.
- **Evidence** — ![Nonexistent Employee](<evidence/api - payroll returns 200.png>)
￼
￼
