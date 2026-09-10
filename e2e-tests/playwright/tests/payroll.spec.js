/**
 * Playwright E2E Tests — PH Payroll Calculator
 *
 * Run with: npx playwright test (from e2e-tests/)
 *
 * These tests check both happy paths and known bugs.
 * Candidates should add more tests as they discover additional issues.
 */

const { test, expect, request } = require('@playwright/test')

const BASE_URL = 'http://localhost:3000'
const API_URL = 'http://localhost:8000/api'

test.describe('Philippine Payroll Calculator', () => {
  test('Philippine Payroll Calculator should be displayed on the Dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page.getByText('Philippine Payroll Calculator')).toBeVisible();
  })
})

test.describe('Employees list', () => {
  test('Add employee button should be displayed on the Employee list', async ({ page }) => {
    await page.goto('http://localhost:3000/employees')
    await expect(page.getByRole('heading', { name: 'Employees' })).toBeVisible();
    await expect(page.getByRole('button', { name: '+ Add Employee' })).toBeVisible();
  })

  test('Clicking Edit button on the Employee list should display the Edit employee fields', async ({ page }) => {
    await page.goto('http://localhost:3000/employees')
    await page.getByRole('button', { name: 'Edit' }).first().click();
    await expect(page.getByText('Edit Employee')).toBeVisible();
    await expect(page.getByText('First Name *')).toBeVisible();
    await expect(page.getByText('Last Name *')).toBeVisible();
    await expect(page.getByText('Email *')).toBeVisible();
    await expect(page.getByText('Position *')).toBeVisible();
    await expect(page.getByText('Department *')).toBeVisible();
    await expect(page.getByText('Employment Type *')).toBeVisible();
    await expect(page.getByText('Monthly Salary (₱) *')).toBeVisible();
    await expect(page.getByText('Date Hired *')).toBeVisible();
  })
})

test.describe('Payroll Calculator', () => {
  test('Payroll calculator text should be displayed on the Calculator page', async ({ page }) => {
    await page.goto('http://localhost:3000/calculate')
    await expect(page.getByRole('heading', { name: 'Payroll Calculator' })).toBeVisible();
  })
})

test.describe('Dashboard', () => {
  test('loads and shows API status as Online', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Dashboard')).toBeVisible()
    await expect(page.getByText('Online')).toBeVisible()
  })

  test('shows employee count', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Active Employees')).toBeVisible()
  })
})

test.describe('Employee List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/employees')
  })

  test('displays 5 employees from sample data', async ({ page }) => {
    const rows = page.locator('table tbody tr')
    await expect(rows).toHaveCount(5)
  })

  test('shows Juan Dela Cruz', async ({ page }) => {
    await expect(page.getByText('Juan Dela Cruz')).toBeVisible()
  })

  test('shows Ana Garcia as contractual', async ({ page }) => {
    await expect(page.getByText('Ana Garcia')).toBeVisible()
    await expect(page.getByText('contractual')).toBeVisible()
  })

  test('can open add employee form', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Employee' }).click()
    await expect(page.getByText('Add New Employee')).toBeVisible()
  })
})

test.describe('Payroll Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculate')
  })

  test('shows calculator form', async ({ page }) => {
    await expect(page.getByText('Payroll Calculator')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Calculate Payroll' })).toBeVisible()
  })

  test('calculates payroll and shows results', async ({ page }) => {
    // Select the first employee (Juan Dela Cruz)
    await page.locator('select').first().selectOption({ index: 1 })
    await page.getByRole('button', { name: 'Calculate Payroll' }).click()
    await expect(page.getByText('Payroll Result')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Net Pay')).toBeVisible()
  })

  /**
   * BUG #2: Negative salary input — no validation
   *
   * EXPECTED: Form should show validation error for -5000.
   * ACTUAL: Form submits successfully with negative salary.
   */
  test('[BUG #2] form accepts negative override salary without validation error', async ({ page }) => {
    await page.locator('select').first().selectOption({ index: 1 })
    const salaryInput = page.locator('input[type="number"]').first()
    await salaryInput.fill('-5000')

    // Check that there is no min attribute preventing negative input
    const minAttr = await salaryInput.getAttribute('min')
    expect(minAttr).toBeNull() // BUG CONFIRMED: min attribute is missing

    // Form submits without client-side error
    await page.getByRole('button', { name: 'Calculate Payroll' }).click()
    await page.waitForTimeout(2000)
    // Candidates: document what happens after submission
  })
})

test.describe('Payroll History', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/history')
  })

  test('displays 10 payroll records from fixtures', async ({ page }) => {
    const rows = page.locator('table tbody tr')
    await expect(rows).toHaveCount(10, { timeout: 10000 })
  })

  test('shows employee names in history', async ({ page }) => {
    await expect(page.getByText('Juan Dela Cruz').first()).toBeVisible()
  })

  test('can filter by year', async ({ page }) => {
    await page.locator('select').selectOption('2025')
    const rows = page.locator('table tbody tr')
    await expect(rows).toHaveCount.greaterThan(0)
  })
})

test.describe('Tax Info', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tax-info')
  })

  test('shows TRAIN Law tax table', async ({ page }) => {
    await expect(page.getByText('TRAIN Law Income Tax Brackets')).toBeVisible()
  })

  test('shows tax-exempt bracket', async ({ page }) => {
    await expect(page.getByText('₱0 – ₱250,000')).toBeVisible()
    await expect(page.getByText('0%')).toBeVisible()
  })

  test('shows all three contribution sections', async ({ page }) => {
    await expect(page.getByText('SSS Contributions')).toBeVisible()
    await expect(page.getByText('PhilHealth')).toBeVisible()
    await expect(page.getByText('Pag-IBIG / HDMF')).toBeVisible()
  })
})

test.describe('API Tests', () => {
  test('GET /api/health/ returns 200', async ({ request }) => {
    const res = await request.get(`${API_URL}/health/`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('ok')
  })

  test('GET /api/employees/ returns 5 employees', async ({ request }) => {
    const res = await request.get(`${API_URL}/employees/`)
    expect(res.status()).toBe(200)
    const employees = await res.json()
    expect(employees).toHaveLength(5)
  })

  test('GET /api/tax-brackets/ returns brackets array', async ({ request }) => {
    const res = await request.get(`${API_URL}/tax-brackets/`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.brackets).toHaveLength(6)
  })

  /**
   * BUG #1: Tax boundary — 250,000 should be exempt
   *
   * Using monthly salary of 20,833.33 (~250,000/year)
   * EXPECTED: income_tax = 0.00
   * ACTUAL: income_tax > 0 due to >= boundary bug
   */
  test('[BUG #1] income_tax is non-zero for annual salary of exactly 250,000', async ({ request }) => {
    const res = await request.post(`${API_URL}/calculate-payroll/`, {
      data: {
        employee_id: 1,
        period_month: 7,
        period_year: 2025,
        override_salary: 20833.33,
      },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    console.log('Income tax for ~250k annual salary:', body.income_tax)
    // BUG CONFIRMED when income_tax > 0:
    // expect(Number(body.income_tax)).toBe(0)  // This line would FAIL due to Bug #1
    expect(Number(body.income_tax)).toBeGreaterThan(0) // This PASSES, confirming Bug #1
  })

  /**
   * BUG #3: Wrong HTTP status for missing employee
   *
   * EXPECTED: HTTP 404
   * ACTUAL: HTTP 200
   */
  test('[BUG #3] calculate-payroll returns 200 (not 404) for nonexistent employee', async ({ request }) => {
    const res = await request.post(`${API_URL}/calculate-payroll/`, {
      data: {
        employee_id: 99999,
        period_month: 1,
        period_year: 2025,
      },
      failOnStatusCode: false,
    })
    // BUG CONFIRMED: status is 200 instead of 404
    expect(res.status()).toBe(200) // Should be 404 — this passing confirms Bug #3
    const body = await res.json()
    expect(body).toHaveProperty('error')
    console.log('BUG #3: Got status', res.status(), 'expected 404. Body:', body)
  })

  test('GET /api/employees/99999/ returns 404 (correct behavior)', async ({ request }) => {
    const res = await request.get(`${API_URL}/employees/99999/`, {
      failOnStatusCode: false,
    })
    expect(res.status()).toBe(404)
  })

  test('POST /api/employees/ creates a new employee', async ({ request }) => {
    const res = await request.post(`${API_URL}/employees/`, {
      data: {
        first_name: 'Test',
        last_name: 'Candidate',
        email: `qa.test.${Date.now()}@example.com`,
        position: 'QA Engineer',
        department: 'Quality Assurance',
        employment_type: 'regular',
        monthly_salary: '50000.00',
        date_hired: '2024-01-01',
      },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.full_name).toBe('Test Candidate')
  })

  test('GET /api/payroll-history/ returns 10 records', async ({ request }) => {
    const res = await request.get(`${API_URL}/payroll-history/`)
    expect(res.status()).toBe(200)
    const records = await res.json()
    expect(records.length).toBeGreaterThanOrEqual(10)
  })
})
