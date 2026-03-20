# BUG REPORT

## Task 1: Manual Exploratory Testing

---

### Bug 1: Override Salary Field Accepts Negative Values
**Severity:** High  

**Steps to Reproduce:**
1. Go to Payroll Calculator Menu.  
2. On the dropdown menu, select an employee (e.g., Juan Dela Cruz), month, and year.  
3. In the override salary field, input a negative value (e.g., -20,000).  

**Expected Result:**  
- Validation on the input field should prevent users from entering a negative value.  
- If a negative value is attempted, display a warning message:  
  *“Negative values are not accepted.”*  

**Actual Result:**  
- The system allows inputting negative values in the field provided.  

---

### Bug 2: Negative Salary Values Are Calculated
**Severity:** Medium  

**Steps to Reproduce:**
1. Go to Payroll Calculator Menu.  
2. On the dropdown menu, select an employee (e.g., Juan Dela Cruz), month and year.  
3. In the override salary field, input a negative value (e.g., -20,000).  
4. Click **Calculate Payroll**.  

**Expected Result:**  
- The system should not proceed with the calculation if a negative salary value is entered.  
- Submission must be blocked and an error message displayed:  
  *“Please input a non‑negative salary value.”* or *“Negative salary values are not accepted.”*  

**Actual Result:**  
- The system allows payroll calculations using negative salary values.  

---

### Bug 3: Old Payroll Calculator Result Not Cleared
**Severity:** Medium  

**Steps to Reproduce:**
1. From the Calculator menu, calculate a payroll.  
2. Navigate to another menu (e.g., Employees menu).  
3. Navigate back to the Calculator menu.  

**Expected Result:**  
- The last payroll calculation result should not be displayed.  
- Each calculation session should start fresh to avoid accidental reuse of outdated data.  

**Actual Result:**  
- The last payroll calculation result remains visible and is not cleared.  

---

## Task 2: API Testing

---

### Bug 1: `/api/employees/` and `/api/calculate-payroll/` Endpoint Returns 200 OK for Missing Employee Record
**Severity:** High  

**Steps to Reproduce:**
1. Open Postman and create a new request.  
2. Set the method to `POST` and enter the URL:  http://{baseurl}/api/calculate-payroll/
3. In the body, set `"employee_id": 15` (assuming ID 15 does not exist).  
4. Click **Send**.  

**Expected Result:**  
- The API should return **404 Not Found**.  
- Response body should include: *“Employee with ID 15 does not exist.”*  

**Actual Result:**  
- The API returns **200 OK** and shows error message *“Employee with id=15 does not exist.”*  

---

### Bug 2: `/api/employees/` 

case 1 (Create new employee):
  Endpoint Accepts Negative Salary Values
  **Severity:** High  

  **Steps to Reproduce:**
  1. Open Postman.  
  2. Create a new request.  
  3. Set the method to `POST`.  
  4. Set the URL to:  http://{baseurl}/api/employees/
  5. In the Body tab, select raw → JSON.  
  6. Enter payload:  
  ```json
     {
      "first_name": "string",
      "last_name": "string",
      "email": "strinasdg@gmail.com",
      "position": "string",
      "department": "string",
      "employment_type": "regular",
      "monthly_salary": "-20000",
      "date_hired": "2022-03-15"
    }
  7. Click Send.

  **Expected Result:**  
  The API should reject the request with 400 Bad Request or 422 Unprocessable Entity.
  Response should include: “Negative values are not accepted for salary.”

  **Actual Result:**  
  The API accepts the request and creates an employee record with a negative salary.
  Response returns 200 OK, which is incorrect.

case 2 (Create existing employee):
  Endpoint validation for existing employee
  **Severity:** Medium  

  **Steps to Reproduce:**
  1. Open Postman.  
  2. Create a new request.  
  3. Set the method to `POST`.  
  4. Set the URL to:  http://{baseurl}/api/employees/
  5. In the Body tab, select raw → JSON.  
  6. Enter payload:  
  ```json
    {
      "first_name": "string",
      "last_name": "string",
      "email": "strinasdg@gmail.com",
      "position": "string",
      "department": "string",
      "employment_type": "regular",
      "monthly_salary": "-20000",
      "date_hired": "2022-03-15"
    }
  7. Click Send.

   **Expected Result:**  
  The API should reject the request with 409 Conflict or Duplicate response code.

  **Actual Result:**  
  The API response with 400 Badrequest which is confusing

---

### Bug 3: /api/payroll-history/ Endpoint Returns 200 OK for Non‑Existent Employee ID
**Severity:** High
**Steps to Reproduce:**
1. Open Postman.
2. Create a new request.
3. Set the method to GET.
4. Enter URL with invalid employee ID:http://{baseurl}/api/payroll-history/?employee_id=3&year=2026
5. Click Send.

**Expected Result:**
The API should return 404 Not Found.
Response body should include: “Payroll history for employee does not exist.”

**Actual Result:**
Response body returns empty and status shows 200 OK.

