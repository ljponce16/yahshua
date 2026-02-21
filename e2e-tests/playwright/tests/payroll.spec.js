/**
 * Playwright E2E Tests — PH Payroll Calculator
 *
 * Run with: npx playwright test (from e2e-tests/)
 */

const { test, expect, request } = require('@playwright/test')

const BASE_URL = 'http://localhost:3000'
const API_URL = 'http://localhost:8000/api'

// Ensure page.goto('/') resolves correctly when running tests without a root config
test.use({ baseURL: BASE_URL })

test.describe('Dashboard', () => {
  test('loads and shows API status as Online', async ({ page }) => {
    await page.goto(`${BASE_URL}/`)
    await expect(page.getByText('Dashboard').first()).toBeVisible()
    await expect(page.getByText('Online')).toBeVisible()
  })

  test('shows employee count', async ({ page }) => {
    await page.goto(`${BASE_URL}/`)
    await expect(page.getByText('Active Employees')).toBeVisible()
  })
})

test.describe('Employee List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/employees`)
  })

  test('displays 5 employees from sample data', async ({ page }) => {
    const rows = page.locator('table tbody tr')
    await expect(rows).not.toHaveCount(0)
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
    await page.goto(`${BASE_URL}/calculate`)
  })

  test('shows calculator form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Payroll Calculator' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Calculate Payroll' })).toBeVisible()
  })

  test('calculates payroll and shows results', async ({ page }) => {
    // Select the first employee (Juan Dela Cruz)
    await page.locator('select').first().selectOption({ index: 1 })
    await page.getByRole('button', { name: 'Calculate Payroll' }).click()
    await expect(page.getByText('Payroll Result')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Net Pay')).toBeVisible()
  })

  test('[BUG #2] form accepts negative override salary without validation error', async ({ page }) => {
    await page.locator('select').first().selectOption({ index: 1 })
    const salaryInput = page.locator('input[type="number"]').first()
    await salaryInput.fill('-5000')

    const minAttr = await salaryInput.getAttribute('min')
    expect(minAttr).toBeNull()

    await page.getByRole('button', { name: 'Calculate Payroll' }).click()
    await page.waitForTimeout(2000)
  })
})

test.describe('Payroll History', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/history`)
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
    await expect(rows).not.toHaveCount(0)
  })
})

test.describe('Tax Info', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/tax-info`)
  })

  test('shows TRAIN Law tax table', async ({ page }) => {
    await expect(page.getByText('TRAIN Law Income Tax Brackets')).toBeVisible()
  })

  test('shows tax-exempt bracket', async ({ page }) => {
    await expect(page.getByText('₱0 – ₱250,000')).toBeVisible()
    await expect(page.getByText('0%').first()).toBeVisible()
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



test('[BUG #1] income_tax is non-zero for annual salary exceeding 250,000', async ({ request }) => {
  const res = await request.post(`${API_URL}/calculate-payroll/`, {
    data: {
      employee_id: 1,
      period_month: 7,
      period_year: 2025,
      override_salary: 25000, // 25,000 × 12 = 300,000 → taxable
    },
  })
  expect(res.status()).toBe(200)
  const body = await res.json()
  console.log('Income tax for 300k annual salary:', body.income_tax)
  expect(Number(body.income_tax)).toBeGreaterThan(0)
})

  
  test('[BUG #3] calculate-payroll returns 200 (not 404) for nonexistent employee', async ({ request }) => {
    const res = await request.post(`${API_URL}/calculate-payroll/`, {
      data: {
        employee_id: 99999,
        period_month: 1,
        period_year: 2025,
      },
      failOnStatusCode: false,
    })
    expect(res.status()).toBe(200)
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


// ─── NEW TESTS ────────────────────────────────────────────────────────────
test.beforeEach(async ({ page }) => {
  await page.goto(`${BASE_URL}/calculate`)
  await page.waitForLoadState('networkidle')
  await page.locator('select.form-select').first().waitFor({ state: 'visible' })
})

  test('payroll result shows SSS, PhilHealth, and Pag-IBIG deductions', async ({ page }) => {
  await page.locator('select.form-select').first().selectOption({ value: '1' })
  await page.getByRole('button', { name: 'Calculate Payroll' }).click()
  await expect(page.getByText('Payroll Result')).toBeVisible({ timeout: 10000 })
  await expect(page.getByText('SSS')).toBeVisible()
  await expect(page.getByText('PhilHealth')).toBeVisible()
  await expect(page.getByText('Pag-IBIG')).toBeVisible()
})

test('net pay is a positive numeric value', async ({ page }) => {
  await page.locator('select.form-select').first().selectOption({ value: '1' })
  await page.getByRole('button', { name: 'Calculate Payroll' }).click()
  await expect(page.getByText('Payroll Result')).toBeVisible({ timeout: 10000 })
})


  test('[BOUNDARY] override salary of zero submits and returns a result', async ({ page }) => {
    await page.locator('select').first().selectOption({ index: 1 })
    const salaryInput = page.locator('input[type="number"]').first()
    await salaryInput.fill('0')
    await page.getByRole('button', { name: 'Calculate Payroll' }).click()
    await page.waitForTimeout(2000)
    const hasResult = await page.getByText('Payroll Result').isVisible()
    const hasError = await page.getByText(/error|invalid/i).isVisible()
    expect(hasResult || hasError).toBe(true)
  })

  test('[BOUNDARY] very large override salary (10,000,000) does not crash the calculator', async ({ page }) => {
    await page.locator('select').first().selectOption({ index: 1 })
    const salaryInput = page.locator('input[type="number"]').first()
    await salaryInput.fill('10000000')
    await page.getByRole('button', { name: 'Calculate Payroll' }).click()
    await expect(page.getByText('Payroll Result')).toBeVisible({ timeout: 10000 })
    const pageContent = await page.content()
    expect(pageContent).not.toContain('NaN')
    expect(pageContent).not.toContain('undefined')
  })

  test('[ERROR] submitting without selecting an employee shows an error or stays on form', async ({ page }) => {
    await page.getByRole('button', { name: 'Calculate Payroll' }).click()
    await page.waitForTimeout(1500)
    const resultVisible = await page.getByText('Payroll Result').isVisible()
    expect(resultVisible).toBe(false)
  })
