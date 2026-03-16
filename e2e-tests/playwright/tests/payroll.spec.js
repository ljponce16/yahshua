/**
 * Playwright E2E Tests — PH Payroll Calculator
 *
 * Run with: npm run playwright:test (from e2e-tests/)
 */

const { test, expect } = require('@playwright/test')

const API_URL = process.env.PLAYWRIGHT_API_URL || 'http://localhost:8000/api'

async function findHistoryRecord(request, employeeId, periodMonth, periodYear) {
  const res = await request.get(`${API_URL}/payroll-history/`)
  expect(res.status()).toBe(200)
  const records = await res.json()
  return records.find(
    (record) =>
      record.employee_id === employeeId
      && record.period_month === periodMonth
      && record.period_year === periodYear
  )
}

test.describe('Dashboard', () => {
  test('loads and shows API status as Online', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
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

  test('displays employees from sample data', async ({ page }) => {
    const rows = page.locator('table tbody tr')
    await expect.poll(async () => rows.count()).toBeGreaterThanOrEqual(5)
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
    await expect(page.getByRole('heading', { name: 'Payroll Calculator' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Calculate Payroll' })).toBeVisible()
  })

  test('calculates payroll and shows results', async ({ page }) => {
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
    await page.waitForTimeout(1000)
  })
})

test.describe('Payroll History', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/history')
  })

  test('displays payroll records from fixtures', async ({ page }) => {
    const rows = page.locator('table tbody tr')
    await expect.poll(async () => rows.count(), { timeout: 10000 }).toBeGreaterThanOrEqual(10)
  })

  test('shows employee names in history', async ({ page }) => {
    await expect(page.getByText('Juan Dela Cruz').first()).toBeVisible()
  })

  test('can filter by year', async ({ page }) => {
    await page.locator('select').selectOption('2025')
    const rows = page.locator('table tbody tr')
    await expect.poll(async () => rows.count()).toBeGreaterThan(0)
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
    await expect(page.getByText('0%', { exact: true })).toBeVisible()
  })

  test('shows all three contribution sections', async ({ page }) => {
    await expect(page.getByText('SSS Contributions')).toBeVisible()
    await expect(page.getByText('PhilHealth')).toBeVisible()
    await expect(page.getByText('Pag-IBIG / HDMF')).toBeVisible()
  })
})

test.describe('Additional Frontend Bug Coverage', () => {
  test('[BUG #6] dashboard swallows API load failures and shows misleading zero stats', async ({ page }) => {
    await page.route('**/api/employees/', (route) => route.abort())
    await page.route('**/api/payroll-history/', (route) => route.abort())

    await page.goto('/')

    await expect(page.locator('.alert-danger')).toHaveCount(0)
    await expect(page.locator('.display-4').first()).toHaveText('0')
  })

  test('[BUG #5] duplicate employee email shows raw JSON validation text', async ({ page }) => {
    await page.goto('/employees')
    await page.getByRole('button', { name: 'Add Employee' }).click()

    const form = page.locator('form').first()
    await form.locator('input').nth(0).fill('Duplicate')
    await form.locator('input').nth(1).fill('Email')
    await form.locator('input').nth(2).fill('juan.delacruz@company.ph')
    await form.locator('input').nth(3).fill('QA Engineer')
    await form.locator('input').nth(4).fill('Quality Assurance')
    await form.locator('input[type="number"]').fill('35000')
    await form.locator('input[type="date"]').fill('2024-01-01')
    await page.getByRole('button', { name: 'Add Employee' }).last().click()

    const errorAlert = page.locator('.alert-danger').last()
    await expect(errorAlert).toBeVisible()
    await expect(errorAlert).toContainText('{')
    await expect(errorAlert).toContainText('email')
  })
})

test.describe('API Tests', () => {
  test('GET /api/health/ returns 200', async ({ request }) => {
    const res = await request.get(`${API_URL}/health/`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('ok')
  })

  test('GET /api/employees/ returns employees', async ({ request }) => {
    const res = await request.get(`${API_URL}/employees/`)
    expect(res.status()).toBe(200)
    const employees = await res.json()
    expect(employees.length).toBeGreaterThanOrEqual(5)
  })

  test('GET /api/tax-brackets/ returns brackets array', async ({ request }) => {
    const res = await request.get(`${API_URL}/tax-brackets/`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.brackets).toHaveLength(6)
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

  test('GET /api/payroll-history/ returns payroll records', async ({ request }) => {
    const res = await request.get(`${API_URL}/payroll-history/`)
    expect(res.status()).toBe(200)
    const records = await res.json()
    expect(records.length).toBeGreaterThanOrEqual(10)
  })

  test('[BUG #7] POST /api/employees/ accepts a negative monthly salary', async ({ request }) => {
    const res = await request.post(`${API_URL}/employees/`, {
      data: {
        first_name: 'Negative',
        last_name: 'Salary',
        email: `negative.salary.${Date.now()}@example.com`,
        position: 'QA Engineer',
        department: 'Quality Assurance',
        employment_type: 'regular',
        monthly_salary: '-100.00',
        date_hired: '2024-01-01',
      },
    })

    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.monthly_salary).toBe('-100.00')
  })

  test('[BUG #8] deleted employees remain retrievable from the detail API', async ({ request }) => {
    const createRes = await request.post(`${API_URL}/employees/`, {
      data: {
        first_name: 'Soft',
        last_name: 'Deleted',
        email: `soft.deleted.${Date.now()}@example.com`,
        position: 'QA Engineer',
        department: 'Quality Assurance',
        employment_type: 'regular',
        monthly_salary: '50000.00',
        date_hired: '2024-01-01',
      },
    })
    expect(createRes.status()).toBe(201)
    const created = await createRes.json()

    const deleteRes = await request.delete(`${API_URL}/employees/${created.id}/`)
    expect(deleteRes.status()).toBe(204)

    const detailRes = await request.get(`${API_URL}/employees/${created.id}/`)
    expect(detailRes.status()).toBe(200)
    const detail = await detailRes.json()
    expect(detail.is_active).toBe(false)
  })

  test('[BUG #9] payroll history SSS value is inconsistent with a fresh payroll calculation', async ({ request }) => {
    const historyRecord = await findHistoryRecord(request, 1, 1, 2025)

    expect(historyRecord).toBeTruthy()
    expect(historyRecord.sss_employee).toBe('1125.00')

    const calculateRes = await request.post(`${API_URL}/calculate-payroll/`, {
      data: {
        employee_id: 1,
        period_month: 11,
        period_year: 2025,
      },
    })
    expect([200, 201]).toContain(calculateRes.status())
    const calculation = await calculateRes.json()

    expect(calculation.sss_employee).toBe('900.00')
    expect(calculation.sss_employee).not.toBe(historyRecord.sss_employee)
  })
})
