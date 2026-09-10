1. Incorrect Income Tax Calculation (P25,000 basic salary)

# Bug Overview
* Module/Section: Payroll Calculator / Income tax
* Severity: High
* Priority: High
* Status: Open

# Bug Summary
When calculating payroll and Override the Salary to **₱25,000.00**, the calculator computes an **Income Tax** deduction of **₱625.00**. This calculation is incorrect under the Philippine TRAIN Law 2023 
The calculation appears to be applying a flat 2.5% rate to the gross salary (25,000 × 0.025 = 625), which duplicates the PhilHealth employee deduction amount instead of executing annual tax bracket calculations

# Steps to Reproduce
Given I navigate to the payroll calculator page
And I select an employee (e.g., Ana Garcia) for the September 2024 payroll run
And I input '25000' in the Override Salary field 
When I click the Calculate Payroll button
And the Payroll result should be displayed
Then the Income Tax is showing '625'

# Expected result
The Income Tax of Ana Garcia should be 366.25, because Ana Garcia's annual salary is 300,000
SSS + PhilHealth + Pag-ibig = 1725
Monthly taxable income of Ana Garcia = 23,275
23,275 * 12 = 279,300
279,300 - 250,000 = 29,300

-- Annual Taxable Income	Tax Rate
-- Up to ₱250,000	        0% (tax exempt)
-- ₱250,001 – ₱400,000	    15% on excess over ₱250,000

Annual tax = 29,300 × 0.15 = 4,395
Monthly income tax = 4,395 / 12 = 366.25

# Actual result
The Income Tax of Ana Garcia is P625
The system calculates a flat rate of 2.5% on the basic salary of Ana Garcia
25,000 * 0.025 = 625
625 / 25,000 = 0.025
The calculation ignores the 250,000 0% tax rate
[25,000 salary](bugReportEvidences/25000salary.png)

---

2. Incorrect Income Tax Calculation (35,000 basic salary)

# Bug Overview
* Module/Section: Payroll Calculator / Income tax
* Severity: High
* Priority: High
* Status: Open

# Bug Summary
When calculating payroll and Override the Salary to **₱35,000.00**, the calculator computes an **Income Tax** deduction of **₱2,208.33**	
This calculation is incorrect under the Philippine TRAIN Law 2023 because the calculation appears to be applying 20% rate to the gross salary (22,500 + 20% on excess over ₱400,000)

# Steps to Reproduce
Given I navigate to the payroll calculator page
And I select an employee (e.g., Ana Garcia) for the September 2024 payroll run
And I input '35000' in the Override Salary field 
When I click the Calculate Payroll button
And the Payroll result should be displayed
Then the Income Tax is showing '2,208.33'

# Expected result
The Income Tax of Ana Garcia should be 1,828.75, because Ana Garcia's annual salary is 420,000
SSS + PhilHealth + Pag-ibig = 1,975.00
Monthly taxable income of Ana Garcia = 33,025
33,025 * 12 = 396,300.00
396,300 - 250,000 = 146,300.00

-- Annual Taxable Income    Tax Rate
-- ₱250,001 – ₱400,000      15% on excess over ₱250,000

Annual tax = 146,300 × 15% = 21,945.00
Monthly income tax = 21,945 / 12 = 1,828.75

# Actual result
The Income Tax of Ana Garcia is ₱2,208.33
The system overcharges the employee by ₱379.58 because it skips the 15% tax rate
Instead, it uses the tax rate of (₱22,500 + 20% on excess over ₱400,000)
Gross annual salary = 35,000 * 12 = 420,000
420,000 is part of ₱400,001 – ₱800,000 Annual taxable income
420,000 - 400,000 = 20,000
20,000 * 0.20 = 4,000
Base tax + excess tax = 22,500 + 4,000 = 26,500
Monthly actual tax = 26,500 / 12 = 2,208.33
[35,000 salary](bugReportEvidences/35000.png)

---

3. Payroll result is still displayed even if the user navigates to the other page and then goes back to the Payroll calculator page

# Bug Overview
* Module/Section: Payroll Calculator
* Severity: Low
* Priority: Low
* Status: Open

# Bug Summary
On the Payroll Calculator page, selecting an employee and clicking the Calculate Payroll button displays the payroll result. However, when navigating to another tab and returning, the selected employee field is cleared while the payroll result remains displayed on the screen.

# Steps to Reproduce
Given I navigate to the payroll calculator page
And I select any available employee
When I click the Calculate Payroll button
And the Payroll result should be displayed
And I navigate to the other page
And I navigate back to the payroll calculator page
Then the payroll result is still displayed
But the Employee is blank or not selected

# Expected result
The payroll result should not be displayed because the selected employee has been unselected after returning to the payroll calculator page

# Actual result
The payroll result is still displayed even if the user navigates to the other page and returns back to the payroll calculator page
[Payroll calculator page bug](bugReportEvidences/payrollCalculator.png)

---

4. History is being updated when a user is using the Payroll calculator

# Bug Overview
* Module/Section: Payroll Calculator
* Severity: High
* Priority: High
* Status: Open

# Bug Summary
Employee's basic salary history are being updated when a user use the payroll calculator and inputted a value on the override salary

# Steps to Reproduce
Background:
Given Ana Garcia's basic salary history from January 2024 is 10,000

Steps to replicate:
Given I navigate to the payroll calculator page
And I select Ana Garcia on the Employee dropdown
And I selected month of January
And I selected Year 2024
And I inputted 20,000 on the Override salary text field
When I click the Calculate Payroll button
And the basic salary of Ana Garcia shows 20,000
And I navigate to the History page
And I filtered to year 2024
Then Ana Garcia's basic salary history from January 2024 has been updated to 20,000

# Expected result
The employee's basic salary history should not be updated when a user use the Payroll calculator and Override salary

# Actual result
The employee's basic salary history is being updated when a user use the Payroll calculator and Override salary

---
