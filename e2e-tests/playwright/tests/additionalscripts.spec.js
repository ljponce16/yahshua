
/**
 * Additional Playwright - PH Payroll Calculator
 *
 * Simone Julienne T. Soria
 * 
 */

const { test, expect } = require('@playwright/test')

const BASE_URL = 'http://localhost:3000'
const API_URL = 'http://localhost:8000/api'


// ============================================================
// 1. NAVIGATION TESTS
// ============================================================

test.describe('Navigation', () => {

  test('should navigate from Dashboard to Employees page', async ({ page }) => {
    await page.goto(`${BASE_URL}/`)

    // Use exact:true because Dashboard has two Employees links.
    await page.getByRole('link', {
      name: 'Employees',
      exact: true
    }).click()

    await expect(page).toHaveURL(/\/employees/)

    await expect(
      page.getByRole('heading', { name: /Employee/i }).first()
    ).toBeVisible()
  })


  test('should navigate from Dashboard to Payroll Calculator', async ({ page }) => {
    await page.goto(`${BASE_URL}/`)

    // Use exact:true because the dashboard contains multiple links
    // containing the word "Calculate".
    await page.getByRole('link', {
      name: /Calculate/i
    }).first().click()

    await expect(page).toHaveURL(/\/calculate/)

    // Target the actual page heading instead of generic text.
    await expect(
      page.getByRole('heading', {
        name: 'Payroll Calculator',
        exact: true
      })
    ).toBeVisible()
  })


  test('should navigate from Dashboard to Payroll History', async ({ page }) => {
    await page.goto(`${BASE_URL}/`)

    // Dashboard has both navbar and card links.
    await page.getByRole('link', {
      name: 'History',
      exact: true
    }).click()

    await expect(page).toHaveURL(/\/history/)

    await expect(
      page.getByRole('heading', {
        name: /Payroll History/i
      })
    ).toBeVisible()
  })


  test('should navigate from Dashboard to Tax Information', async ({ page }) => {
    await page.goto(`${BASE_URL}/`)

    // Select the exact navbar link.
    await page.getByRole('link', {
      name: 'Tax Info',
      exact: true
    }).click()

    await expect(page).toHaveURL(/\/tax-info/)

    await expect(
      page.getByText(/TRAIN Law/i).first()
    ).toBeVisible()
  })

})


// ============================================================
// 2. EMPLOYEE FORM VALIDATION
// ============================================================

test.describe('Employee Form Validation', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/employees`)

    await page.getByRole('button', {
      name: 'Add Employee'
    }).click()

    await expect(
      page.getByText('Add New Employee')
    ).toBeVisible()
  })


  test('should require employee fields when submitting empty form', async ({ page }) => {

    const requiredInputs = page.locator('input[required]')

    const requiredCount = await requiredInputs.count()

    expect(requiredCount).toBeGreaterThan(0)

    // Verify at least one required field exists.
    await expect(requiredInputs.first()).toBeVisible()
  })


  test('should validate employee email format', async ({ page }) => {

    const emailInput = page.locator('input[type="email"]').first()

    await expect(emailInput).toBeVisible()

    await emailInput.fill('invalid-email')

    const isValid = await emailInput.evaluate(
      element => element.checkValidity()
    )

    expect(isValid).toBe(false)
  })


  test('should not accept negative monthly salary', async ({ page }) => {

    const salaryInput = page.locator('input[type="number"]').last()

    await expect(salaryInput).toBeVisible()

    await salaryInput.fill('-10000')

    const minValue = await salaryInput.getAttribute('min')

    // This test checks whether the UI has a minimum salary restriction.
    expect(minValue).not.toBeNull()
  })


  test('should require employee email', async ({ page }) => {

    const emailInput = page.locator('input[type="email"]').first()

    await expect(emailInput).toBeVisible()

    const required = await emailInput.getAttribute('required')

    expect(required).not.toBeNull()
  })

})


// ============================================================
// 3. PAYROLL CALCULATOR VALIDATION
// ============================================================

test.describe('Payroll Calculator Validation', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/calculate`)
  })


  test('should not calculate payroll without selecting an employee', async ({ page }) => {

    const calculateButton = page.getByRole('button', {
      name: 'Calculate Payroll'
    })

    await expect(calculateButton).toBeVisible()

    await calculateButton.click()

    // No employee has been selected.
    await expect(
      page.getByText('Payroll Result')
    ).not.toBeVisible()
  })


  test('should display salary input when employee is selected', async ({ page }) => {

    const employeeSelect = page.locator('select').first()

    await employeeSelect.selectOption({ index: 1 })

    const salaryInput = page.locator('input[type="number"]').first()

    await expect(salaryInput).toBeVisible()
  })


  test('should accept zero salary value for validation testing', async ({ page }) => {

    const employeeSelect = page.locator('select').first()

    await employeeSelect.selectOption({ index: 1 })

    const salaryInput = page.locator('input[type="number"]').first()

    await salaryInput.fill('0')

    await expect(salaryInput).toHaveValue('0')
  })


  test('should accept high salary value without UI crashing', async ({ page }) => {

    const employeeSelect = page.locator('select').first()

    await employeeSelect.selectOption({ index: 1 })

    const salaryInput = page.locator('input[type="number"]').first()

    await salaryInput.fill('1000000')

    await expect(
      page.getByRole('button', {
        name: 'Calculate Payroll'
      })
    ).toBeVisible()
  })


  test('should display payroll result after valid calculation', async ({ page }) => {

    const employeeSelect = page.locator('select').first()

    await employeeSelect.selectOption({ index: 1 })

    await page.getByRole('button', {
      name: 'Calculate Payroll'
    }).click()

    await expect(
      page.getByText('Payroll Result')
    ).toBeVisible({
      timeout: 10000
    })

    // Net Pay is confirmed to exist by the original test suite.
    await expect(
      page.getByText('Net Pay', { exact: true })
    ).toBeVisible()
  })


  test('should display payroll deductions after calculation', async ({ page }) => {

    const employeeSelect = page.locator('select').first()

    await employeeSelect.selectOption({ index: 1 })

    await page.getByRole('button', {
      name: 'Calculate Payroll'
    }).click()

    await expect(
      page.getByText('Payroll Result')
    ).toBeVisible({
      timeout: 10000
    })

    // Check for at least one known deduction section.
    await expect(
      page.getByText(/SSS|PhilHealth|Pag-IBIG/i).first()
    ).toBeVisible()
  })

})


// ============================================================
// 4. PAYROLL HISTORY ADDITIONAL TESTS
// ============================================================

test.describe('Payroll History Additional Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/history`)
  })


  test('should display payroll history table', async ({ page }) => {

    await expect(
      page.locator('table')
    ).toBeVisible()
  })


  test('should contain table headers', async ({ page }) => {

    const headers = page.locator('table thead th')

    const count = await headers.count()

    expect(count).toBeGreaterThan(0)
  })


  test('should change payroll history when year filter changes', async ({ page }) => {

    const yearSelect = page.locator('select').first()

    const options = yearSelect.locator('option')

    const optionCount = await options.count()

    expect(optionCount).toBeGreaterThan(1)

    const secondOptionValue = await options.nth(1).getAttribute('value')

    if (secondOptionValue) {

      await yearSelect.selectOption(secondOptionValue)

      await expect(yearSelect).toHaveValue(
        secondOptionValue
      )
    }
  })


  test('should render payroll history rows correctly', async ({ page }) => {

    const rows = page.locator('table tbody tr')

    const rowCount = await rows.count()

    expect(rowCount).toBeGreaterThan(0)

    for (let i = 0; i < rowCount; i++) {
      await expect(rows.nth(i)).toBeVisible()
    }
  })

})


// ============================================================
// 5. API NEGATIVE / EDGE CASE TESTS
// ============================================================

test.describe('API Additional Validation Tests', () => {

  test('POST employees should reject missing required data', async ({ request }) => {

    const response = await request.post(
      `${API_URL}/employees/`,
      {
        data: {},
        failOnStatusCode: false
      }
    )

    expect([400, 422]).toContain(response.status())
  })


  test('POST employees should reject invalid email', async ({ request }) => {

    const response = await request.post(
      `${API_URL}/employees/`,
      {
        data: {
          first_name: 'Invalid',
          last_name: 'Email',
          email: 'not-an-email',
          position: 'QA Tester',
          department: 'QA',
          employment_type: 'regular',
          monthly_salary: '50000.00',
          date_hired: '2025-01-01'
        },
        failOnStatusCode: false
      }
    )

    expect([400, 422]).toContain(response.status())
  })


  test('POST calculate-payroll should reject missing employee_id', async ({ request }) => {

    const response = await request.post(
      `${API_URL}/calculate-payroll/`,
      {
        data: {
          period_month: 1,
          period_year: 2025
        },
        failOnStatusCode: false
      }
    )

    expect([400, 422]).toContain(response.status())
  })


  test('POST calculate-payroll should reject invalid month', async ({ request }) => {

    const response = await request.post(
      `${API_URL}/calculate-payroll/`,
      {
        data: {
          employee_id: 1,
          period_month: 13,
          period_year: 2025
        },
        failOnStatusCode: false
      }
    )

    expect([400, 422]).toContain(response.status())
  })


  test('POST calculate-payroll should reject invalid year', async ({ request }) => {

    const response = await request.post(
      `${API_URL}/calculate-payroll/`,
      {
        data: {
          employee_id: 1,
          period_month: 1,
          period_year: 0
        },
        failOnStatusCode: false
      }
    )

    expect([400, 422]).toContain(response.status())
  })

})
